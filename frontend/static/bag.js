document.addEventListener('DOMContentLoaded', function() {
    const bagContainer = document.getElementById('bag-container');
    const totalCostDisplay = document.getElementById('total-cost');

    let bag = JSON.parse(localStorage.getItem('bag')) || [];

    function updateBagDisplay() {
        bagContainer.innerHTML = '';
        let totalCost = 0;

        if (bag.length > 0) {
            bag.forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('bag-items');

                const itemText = document.createElement('span');
                itemText.textContent = `${item.name} - ${item.price}R | ${item.quantity}`;

                const addButton = document.createElement('button');
                addButton.textContent = 'ADD';
                addButton.classList.add('add-bag-button');
                addButton.addEventListener('click', function() {
                    item.quantity += 1;
                    localStorage.setItem('bag', JSON.stringify(bag));
                    updateBagDisplay();
                });

                const removeButton = document.createElement('button');
                removeButton.textContent = 'REMOVE';
                removeButton.classList.add('remove-bag-button');
                removeButton.addEventListener('click', function() {
                    if (item.quantity > 1) {
                        item.quantity -= 1;
                        localStorage.setItem('bag', JSON.stringify(bag));
                    } else {
                        bag.splice(index, 1);
                        localStorage.setItem('bag', JSON.stringify(bag));
                    }
                    updateBagDisplay();
                });

                const removeAllButton = document.createElement('button');
                removeAllButton.textContent = 'REMOVE ALL';
                removeAllButton.classList.add('remove-bag-all-button');
                removeAllButton.addEventListener('click', function() {
                    bag.splice(index, 1);
                    localStorage.setItem('bag', JSON.stringify(bag));
                    updateBagDisplay();
                });

                itemDiv.appendChild(itemText);
                itemDiv.appendChild(addButton);
                itemDiv.appendChild(removeButton);
                itemDiv.appendChild(removeAllButton);
                bagContainer.appendChild(itemDiv);

                totalCost += item.price * item.quantity;
            });
        }

        totalCostDisplay.textContent = `${totalCost}R`;
    }
    updateBagDisplay();
});