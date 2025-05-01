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

                const answerText = data.answer;

                const links = answerText.match(/https?:\/\/(?!http?:\/\/)[^<\s]+\?query=[^.,;:]+(?=\s|[.,;:]|$)/g);
                const parts = answerText.split(/https?:\/\/(?!http?:\/\/)[^<\s]+\?query=[^.,;:]+(?=\s|[.,;:]|$)/g);

                const fragment = document.createDocumentFragment();

                parts.forEach((part, index) => {
                    if (part) {
                        const textNode = document.createTextNode(part);
                        fragment.appendChild(textNode);
                    }
                    if (index < links.length) {
                        const linkElement = document.createElement('a');
                        linkElement.href = links[index];
                        linkElement.target = '_blank';
                        linkElement.rel = 'noopener noreferrer';
                        linkElement.textContent = "товары по вашему запросу";

                        fragment.appendChild(linkElement);
                    }
                });
                botMessage.appendChild(fragment);
                chatMessages.appendChild(botAuthor);
                chatMessages.appendChild(botMessage);

                chatMessages.scrollTop = chatMessages.scrollHeight;
            })
            .catch(error => {
                console.error('Ошибка отправки запроса:', error);
            });
        } else {
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

    document.querySelectorAll('.wishlist-button').forEach(button => {
        const productName = button.getAttribute('data-product-name');
        const productPrice = button.getAttribute('data-product-price');
        const heart = button.querySelector('.heart');
        const isFilled = localStorage.getItem(`wishlist-product-${productName}`) === 'true';

        if (isFilled) {
            heart.classList.add('filled');
        }
        else {
            heart.classList.remove('filled');
        }

        button.addEventListener('click', function() {
            if (heart.classList.contains('filled')) {
                    heart.classList.remove('filled');
                    localStorage.removeItem(`wishlist-product-${productName}`);
            } else {
                heart.classList.add('filled');
                localStorage.setItem(`wishlist-product-${productName}`, 'true');
            }
            updateWishlist(productName, productPrice);
        });
    });

    document.getElementById('chatButton').addEventListener('click', function() {
        document.getElementById('chatPopup').style.display = 'block';
        document.getElementById('chatButton').style.display = 'none';
    });

    document.getElementById('closeChat').addEventListener('click', function() {
        document.getElementById('chatPopup').style.display = 'none';
        document.getElementById('chatButton').style.display = 'block';
    });
});

let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

function updateWishlist(productName, productPrice) {
    const productExists = wishlist.find(item => item.name === productName);

    if (!productExists) {
        wishlist.push({ name: productName, price: productPrice });
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } else {
        wishlist.splice(productName, 1);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
}

function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

const query = getQueryParameter('query');
const resultsContainer = document.getElementById('results-container');
const queryWords = query ? query.split(' ').map(word => word.toLowerCase()) : [];

fetch('/products')
    .then(response => response.json())
    .then(products => {
        console.log('Products:', products);

        const filteredProducts = products.filter(product =>
            queryWords.some(queryWord =>
                product.product_name.toLowerCase().includes(queryWord)
            )
        );

        console.log('Filtered Products:', filteredProducts);

        filteredProducts.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('image-container');

            const img = document.createElement('img');
            img.classList.add('executive_products');
            img.src = product.img_source;
            img.alt = product.product_name;

            const captionDiv = document.createElement('div');
            captionDiv.classList.add('image-caption');
            captionDiv.textContent = product.product_name;

            const costDiv = document.createElement('div');
            costDiv.classList.add('image-cost');
            costDiv.textContent = `${product.price}.00R за ${product.weight}`;

            const countryDiv = document.createElement('div');
            countryDiv.classList.add('image-cost');
            countryDiv.textContent = product.country;

            const countDiv = document.createElement('div');
            countDiv.classList.add('image-cost');
            countDiv.textContent = `В наличии: ${product.count} ${product.weight}`;

            const button = document.createElement('button');
            button.classList.add('wishlist-button');
            button.setAttribute('data-product-name', product.product_name);
            button.setAttribute('data-product-price', product.price);

            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            svg.setAttribute("width", "24");
            svg.setAttribute("height", "24");
            svg.setAttribute("viewBox", "0 0 24 24");

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.classList.add('heart');
            path.setAttribute("d", "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z");

            svg.appendChild(path);
            button.appendChild(svg);

            productDiv.appendChild(img);
            productDiv.appendChild(captionDiv);
            productDiv.appendChild(countryDiv)
            productDiv.appendChild(costDiv);
            productDiv.appendChild(countDiv)
            productDiv.appendChild(button);

            resultsContainer.appendChild(productDiv);
        });
    })
    .catch(error => console.error('Error fetching products:', error));


window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = scrollPosition / documentHeight;

    if (scrollPercentage < 0.15) {
        document.getElementById('chatButton').style.backgroundColor = 'rgba(222, 184, 135, 0.7)';
    }
    else if (scrollPercentage < 0.33) {
        document.getElementById('chatButton').style.backgroundColor = 'rgba(255, 192, 203, 0.7)';
    }
    else if (scrollPercentage < 0.85) {
        document.getElementById('chatButton').style.backgroundColor = 'rgba(150, 150, 150, 0.7)';
    } else {
        document.getElementById('chatButton').style.backgroundColor = 'rgba(222, 184, 135, 0.7)';
    }});

function goBack() {
    window.history.back();
}