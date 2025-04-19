document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.querySelector('.chat-messages');

    window.onload = function() {
        sendMessage("", true);
    };

    sendButton.addEventListener('click', function() {
        const question = messageInput.value;

        if (question.trim() !== '') {
            sendMessage(question, false);
            messageInput.value = '';
        }
    });

    messageInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });

    function sendMessage(question, is_load) {
        if (!is_load) {
            const userAuthor = document.createElement('div');
            userAuthor.classList.add('chat-message', 'u-message');
            userAuthor.textContent = "You";

            const userMessage = document.createElement('div');
            userMessage.classList.add('chat-message', 'user-message');
            userMessage.textContent = question;

            chatMessages.appendChild(userAuthor);
            chatMessages.appendChild(userMessage);

            chatMessages.scrollTop = chatMessages.scrollHeight;


            fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'question=' + encodeURIComponent(question)
            })
            .then(response => response.json())
            .then(data => {
                const botAuthor = document.createElement('div');
                botAuthor.classList.add('chat-message', 'b-message');
                botAuthor.textContent = "Bot";

                const botMessage = document.createElement('div');
                botMessage.classList.add('chat-message', 'bot-message');
                botMessage.textContent = data.answer;

                chatMessages.appendChild(botAuthor);
                chatMessages.appendChild(botMessage);

                chatMessages.scrollTop = chatMessages.scrollHeight;
            })
            .catch(error => {
                console.error('Ошибка отправки запроса:', error);
            });
        }
        else
        {
            const botInfo = document.createElement('div');
            botInfo.classList.add('chat-message', 'b-message');
            botInfo.textContent = "Bot";

            const botMessage = document.createElement('div');
            botMessage.classList.add('chat-message', 'bot-message');
            botMessage.textContent = 'Привет, я интеллектуальный бот! Вы можете задать мне любые вопросы, по ассортименту нашего магазина.';

            chatMessages.appendChild(botInfo);
            chatMessages.appendChild(botMessage);

            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    document.getElementById('chatButton').addEventListener('click', function() {
        document.getElementById('chatPopup').style.display = 'block';
    });

    document.getElementById('closeChat').addEventListener('click', function() {
        document.getElementById('chatPopup').style.display = 'none';
    });
});
