import os
from pathlib import Path
from dotenv import load_dotenv


HISTORY = []
MAX_TOKENS = 1000

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(os.path.join(BASE_DIR, "install", ".env"))

DATA_PATH = os.path.join(BASE_DIR, "database", "products.json")
VECTOR_STORE_PATH = os.path.join(BASE_DIR, "backend", "vector_store")
LOG_FILE = os.path.join(BASE_DIR, "logs", "log.txt")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "api-key")

