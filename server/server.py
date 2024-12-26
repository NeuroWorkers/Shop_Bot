from flask import Flask, render_template, request, jsonify
from bot.src.retriever import create_index
from bot.src.utils import is_folder_empty
from bot.src.config import VECTOR_STORE_PATH, HISTORY
from bot.src.rag_model import initialize_rag_model, answer_question

# Создание приложения Flask
app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['TEMPLATES_FOLDER'] = 'server/templates'

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




