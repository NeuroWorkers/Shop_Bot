import os
from pathlib import Path
from dotenv import load_dotenv


HISTORY = []
MAX_TOKENS = 1000

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(os.path.join(BASE_DIR, "install", ".env"))

http_proxy = os.environ.get("HTTP_PROXY") or "http://172.29.177.25:3128"
https_proxy = os.environ.get("HTTPS_PROXY") or "https://172.29.177.25:3128"
proxies = {
    "http": http_proxy,
    "https": https_proxy,
}

DATA_PATH = os.path.join(BASE_DIR, "database", "shop_products.json")
VECTOR_STORE_PATH = os.path.join(BASE_DIR, "backend", "vector_store")
LOG_FILE = os.path.join(BASE_DIR, "logs", "log.txt")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "api-key")

