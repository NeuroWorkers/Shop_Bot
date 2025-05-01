import logging
import pprint
from datetime import datetime
from langchain_openai import OpenAI
from backend.model.retriever import load_index
from backend.utils.utils import load_json
from langchain.chains import RetrievalQA
from configs.backend_config import OPENAI_API_KEY, MAX_TOKENS, LOG_FILE, DATA_PATH
from configs.server_config import *

if not OPENAI_API_KEY:
    print("Error: OPENAI_API_KEY not found in .env file.")
    exit()


def initialize_rag_model():
    retriever = load_index().as_retriever(search_kwargs={"k": 10})
    return retriever


def answer_question(retriever, question, history=None):
    logging.basicConfig(filename=LOG_FILE, level=logging.INFO,
                        format='%(asctime)s - %(levelname)s - %(message)s')

    log_entry = {"time": datetime.now().isoformat(), "question": question}

    try:
        if history is None:
            history = []

        if len(history) >= 5:
            history.pop(0)

        log_entry["history_before"] = history

        history.append((question, ""))

        docs = retriever.invoke(question)

        log_entry["docs"] = docs

        if docs:
            llm = OpenAI(temperature=0.5, max_tokens=MAX_TOKENS)
            context = "\n".join([f"Вопрос: {q}\nОтвет: {a}" for q, a in history])

            log_entry["context"] = context

            products = load_json(DATA_PATH)
            product_mapping = {product['name']: product['product_name'] for product in products}

            question_prompt = f"""
            Вы — опытный продавец-консультант в магазине. Учитывая предыдущий диалог:{context}
            Клиент задает вопрос: {question}
            Ответьте клиенту вежливо, подробно и с позитивным настроем. Если вы не знаете ответа, скажите, что уточните информацию и перезвоните/напишите позже. Предложите клиенту помощь в выборе, если это уместно.
            Помимо этого вы должны сформировать ссылку с релевантными продуктами для клиента. Первая часть ссылки выглядит так: {SERVER_DOMAIN}/search?query= далее вам нужно выбрать только имена тех товаров, которые удовлетворяют
            вопросу клиента: {question} и вставить их в ссылку, например так: {SERVER_DOMAIN}/search?query=Apple Peach Pomegranate. Могут быть ситуации, когда подходящий товар все один, тогда ссылка будет выглядеть так:
            {SERVER_DOMAIN}/search?query=Apple , а может быть ситуация когда подходящих товаров нет вообще, в этом нет ничего страшного, в этом случае ссылку не нужно возвращать совсем.
            Если вы хотите предложить что-то еще, что не соответствует вопросу клиента: {question}, то отправьте отдельную ссылку!
            Вот соответствия между названиями продуктов из твоего ответа и их именами для вставки в ссылку:{', '.join([f"{name}: {product_name}" for name, product_name in product_mapping.items()])}.
            """

            qa = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=retriever)
            try:
                answer = qa.invoke({"query": question_prompt})

                log_entry["answer"] = answer["result"]

                history[-1] = (question, answer["result"])

                logging.info(pprint.pformat(log_entry) + "\n")

                return answer["result"]
            except Exception as e:
                log_entry["exception"] = str(e)
                logging.exception(f"Ошибка во время обработки запроса: {log_entry}")
                print(f"Исключение: {e}")
                return "Извините, я не смог сформулировать ответ. Попробуйте что-то другое."
        else:
            logging.info(f"Запрос без релевантных документов: {log_entry}")
            return "Не удалось найти релевантную информацию по вашему запросу."
    except Exception as e:
        log_entry["exception"] = str(e)
        logging.exception(f"Ошибка перед обработкой запроса: {log_entry}")
        if hasattr(e, 'code') and e.code == 'unsupported_country_region_territory':
            return "К сожалению, ваш IP-адрес находится на территории России."
        return "Что-то пошло не так"

