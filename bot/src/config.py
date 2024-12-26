import os
from dotenv import load_dotenv

load_dotenv()

HISTORY = []
MAX_TOKENS = 1000

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "products.json")
VECTOR_STORE_PATH = os.path.join(BASE_DIR, "vector_store")
LOG_FILE = os.path.join(BASE_DIR, "logs", "log.txt")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "api-key")

