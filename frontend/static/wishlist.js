document.addEventListener('DOMContentLoaded', function() {
    const wishlistContainer = document.getElementById('wishlist-container');
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    if (wishlist.length > 0) {
        wishlist.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('wishlist-items');

            const itemText = document.createElement('span');
            itemText.textContent = `${item.name} - ${item.price}R`;

            const removeButton = document.createElement('button');
            removeButton.textContent = 'REMOVE';
            removeButton.classList.add('remove-button');

            const addToBagButton = document.createElement('button');
            addToBagButton.textContent = 'TO BAG';
            addToBagButton.classList.add('to-bag-button');

            removeButton.addEventListener('click', function() {
                wishlist.splice(index, 1);
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
                alert(`wishlist-product-${item.name}`)
                localStorage.setItem(`wishlist-product-${item.name}`, 'false');
                itemDiv.remove();
            });

            addToBagButton.addEventListener('click', function() {
                let bag = JSON.parse(localStorage.getItem('bag')) || [];
                const existingItemIndex = bag.findIndex(bagItem => bagItem.name === item.name);

                if (existingItemIndex !== -1) {
                    bag[existingItemIndex].quantity += 1;
                } else {
                    bag.push({ ...item, quantity: 1 });
                }
                localStorage.setItem('bag', JSON.stringify(bag));
                alert(`${item.name} добавлен в корзину!`);
            });

            itemDiv.appendChild(itemText);
            itemDiv.appendChild(addToBagButton);
            itemDiv.appendChild(removeButton);
            wishlistContainer.appendChild(itemDiv);
        });
    }
});