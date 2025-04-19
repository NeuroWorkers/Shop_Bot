from flask import Flask, render_template, request, jsonify
from backend.model.retriever import create_index
from backend.utils.utils import is_folder_empty
from configs.backend_config import VECTOR_STORE_PATH, HISTORY, BASE_DIR
from backend.model.rag_model import initialize_rag_model, answer_question
import os

# Создание приложения Flask
app = Flask(__name__, template_folder=os.path.join(BASE_DIR, 'frontend/templates'), static_folder=os.path.join(BASE_DIR, 'frontend/static'))

retriever = initialize_rag_model()


# Главная страница
@app.route('/')
def index():
    if is_folder_empty(VECTOR_STORE_PATH):
        create_index()
    return render_template('index.html')


# Обработка запросов от пользователя
@app.route('/chat', methods=['POST'])
def chat():
    question = request.form['question']
    answer = answer_question(retriever, question, HISTORY)
    return jsonify({'answer': answer})


# Запуск сервера
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)




