import logging
import pprint
from datetime import datetime
from langchain_openai import OpenAI
from backend.model.retriever import load_index
from langchain.chains import RetrievalQA
from configs.backend_config import OPENAI_API_KEY, MAX_TOKENS, LOG_FILE
from configs.server_config import *

if not OPENAI_API_KEY:
    print("Error: OPENAI_API_KEY not found in .env file.")
    exit()


def initialize_rag_model():
    retriever = load_index().as_retriever(search_kwargs={"k": 5})
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

        url = f"http://{SERVER_HOST}:{SERVER_PORT}/search?query="
        count_url_elements = 0
        for doc in docs:
            if count_url_elements == 0:
                url = url + doc.metadata['product_name']
            else:
                url = url + " " + doc.metadata['product_name']
            count_url_elements += 1
        if docs:
            llm = OpenAI(temperature=0.5, max_tokens=MAX_TOKENS)
            context = "\n".join([f"Вопрос: {q}\nОтвет: {a}" for q, a in history])

            log_entry["context"] = context

            question_prompt = f"""
            Вы — опытный продавец-консультант в магазине. Учитывая предыдущий диалог:{context}
            Клиент задает вопрос: {question}
            Ответьте клиенту вежливо, подробно и с позитивным настроем. Если вы не знаете ответа, скажите, что уточните информацию и перезвоните/напишите позже. Предложите клиенту помощь в выборе, если это уместно.
            """

            qa = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=retriever)
            try:
                answer = qa.invoke({"query": question_prompt})

                log_entry["answer"] = answer["result"]

                history[-1] = (question, answer["result"])

                logging.info(pprint.pformat(log_entry) + "\n")

                return answer["result"], url
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

