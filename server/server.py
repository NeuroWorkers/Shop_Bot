from flask import Flask, render_template, request, jsonify
from backend.model.retriever import create_index
from backend.utils.utils import is_folder_empty
from configs.backend_config import VECTOR_STORE_PATH, HISTORY, BASE_DIR, DATA_PATH
from backend.model.rag_model import initialize_rag_model, answer_question
from configs.server_config import *
from backend.utils.utils import *
import os

# Создание приложения Flask
app = Flask(__name__, template_folder=os.path.join(BASE_DIR, 'frontend/templates'),
            static_folder=os.path.join(BASE_DIR, 'frontend/static'))

if is_folder_empty(VECTOR_STORE_PATH):
    create_index()

retriever = initialize_rag_model()


# Главная страница
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/fruit')
def fruit():
    return render_template('fruits.html')


@app.route('/vegetables')
def vegetables():
    return render_template('vegetables.html')


@app.route('/meat')
def meat():
    return render_template('meat.html')


@app.route('/berries')
def groceries():
    return render_template('berries.html')


@app.route('/other')
def other():
    return render_template('other.html')


@app.route('/wishlist')
def wishlist():
    return render_template('wishlist.html')


@app.route('/search')
def search():
    return render_template('search.html')


@app.route('/bag')
def bag():
    return render_template('bag.html')


@app.route('/products', methods=['GET'])
def get_products():
    return load_json(DATA_PATH)


# Обработка запросов от пользователя
@app.route('/chat', methods=['POST'])
def chat():
    question = request.form['question']
    answer, url = answer_question(retriever, question, HISTORY)
    return jsonify({'answer': answer, 'url': url})


# Запуск сервера
if __name__ == '__main__':
    app.run(host=SERVER_HOST, port=SERVER_PORT, debug=SERVER_DEBUG_MODE)
