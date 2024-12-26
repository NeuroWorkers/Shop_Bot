import os
import json


def load_json(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Файл не найден: {file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def ensure_path_exists(path):
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)


def is_folder_empty(path):
    return not any(os.scandir(path))
