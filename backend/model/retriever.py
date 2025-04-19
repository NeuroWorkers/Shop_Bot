from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from backend.utils.utils import load_json, ensure_path_exists
from configs.backend_config import DATA_PATH, VECTOR_STORE_PATH, OPENAI_API_KEY


def create_index():
    data = load_json(DATA_PATH)
    texts = [f"{item['name']} из {item['country']} - {item['description']}, цена составляет {item['price']} рублей за {item['weight']}, в наличии {item['count']} {item['weight']}. Основные особенности {item['features'][0]} и {item['features'][1]}" for item in data]
    metadata = [item for item in data]

    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    vector_store = FAISS.from_texts(texts, embeddings, metadatas=metadata)

    ensure_path_exists(VECTOR_STORE_PATH)
    vector_store.save_local(VECTOR_STORE_PATH)


def load_index():
    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    return FAISS.load_local(VECTOR_STORE_PATH, embeddings, allow_dangerous_deserialization=True)

