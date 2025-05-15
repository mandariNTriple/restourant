import menuArray from './data.js'

// функция которая берёт информацию из data.js и выводит меню 
function getPropertyHtml(propertyArr = menuArray) {
    return propertyArr.map(property => {
        const {
            name,
            ingredients,
            id,
            price,
            emoji
        } = property
        return `
            <section class="card">
                <div class="emoji">${emoji}</div>
                <div class="card-right">
                    <h2>${name}</h2>
                    <p>${ingredients.join(', ')}</p>
                    <h3>$${price}</h3>
                </div>
                <button id="${id}" class="btn">+</button>
            </section>`
    }).join('')
}

// Объект для хранения заказа
let order = {
    items: [],
    total: 0
};

// Функция для обновления чека
function updateOrderUI() {
    const orderContainer = document.getElementById('order-container');
    const thankYouBlock = document.getElementById('thank-you-block');

    if (order.items.length === 0) {
        orderContainer.innerHTML = '';
        orderContainer.style.display = 'none';
        return;
    }


    const orderItemsHtml = order.items.map(item => `
        <div class="order-item">
            <span>${item.name} <span class="item-quantity">x${item.quantity}</span></span>
            <span class="remove-btn" data-id="${item.id}">remove</span>
            <span class="price">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    orderContainer.innerHTML = `
        <h3>Your Order</h3>
        ${orderItemsHtml}
        <div class="order-total">
            <span>Total price:</span>
            <span>$${order.total.toFixed(2)}</span>
        </div>
        <button id="complete-order-btn" class="complete-btn">Complete Order</button>
    `;

    orderContainer.style.display = 'block';

    // Добавляем обработчики для кнопок remove
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            removeFromOrder(id);
        });
    });
}

// Функция для добавления блюда в заказ
function addToOrder(item) {
    // Проверяем, есть ли уже такое блюдо в заказе
    const existingItem = order.items.find(i => i.id === item.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        order.items.push({
            ...item,
            quantity: 1
        });
    }

    order.total += item.price;
    updateOrderUI();
}

// Функция для удаления блюда из заказа
function removeFromOrder(id) {
    const numericId = Number(id); // Явное преобразование в число
    const itemIndex = order.items.findIndex(i => i.id === numericId);

    if (itemIndex !== -1) {
        const item = order.items[itemIndex];

        // Уменьшаем количество на 1
        item.quantity -= 1;
        order.total -= item.price;

        // Если количество стало 0, удаляем полностью
        if (item.quantity <= 0) {
            order.items.splice(itemIndex, 1);
        }

        updateOrderUI();
    }
}

// Функция для показа модального окна оплаты
function showPaymentModal() {
    const modal = document.getElementById('payment-modal');
    modal.style.display = 'block';
}

// Функция для скрытия модального окна оплаты
function hidePaymentModal() {
    const modal = document.getElementById('payment-modal');
    modal.style.display = 'none';
}

// Функция для показа блока благодарности
function showThankYouBlock() {
    const thankYouBlock = document.getElementById('thank-you-block');
    thankYouBlock.innerHTML = `
        <div class="thank-you-content">
            <p>Thank you for your order! Your food is on its way!</p>
        </div>
    `;
    thankYouBlock.style.display = 'block';

    // Добавим анимацию для наглядности
    thankYouBlock.style.animation = "fadeIn 0.5s ease-in";

    // Прокрутим страницу к блоку благодарности
    setTimeout(() => {
        thankYouBlock.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// Добавляем обработчики событий для кнопок добавления
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('container').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn')) {
            const id = e.target.id;
            const selectedItem = menuArray.find(item => item.id == id);
            if (selectedItem) {
                const thankYouBlock = document.getElementById('thank-you-block');
                thankYouBlock.style.display = 'none';
                addToOrder(selectedItem);
            }
        }
    });

    // Обработчик для кнопки завершения заказа
    document.addEventListener('click', (e) => {
        if (e.target.id === 'complete-order-btn') {
            showPaymentModal();
        }
    });

    // Обработчик для кнопки оплаты
    document.getElementById('payment-form').addEventListener('submit', function (e) {
        e.preventDefault();

        // Валидация полей
        const name = document.getElementById('card-name').value.trim();
        const number = document.getElementById('card-number').value.trim();
        const cvv = document.getElementById('card-cvv').value.trim();

        if (!name || !number || !cvv) {
            alert('Please fill in all payment fields');
            return;
        }

        // Логирование данных (в реальном приложении здесь был бы AJAX-запрос)
        console.log('Payment processed:', { name, number, cvv });

        // Закрываем модальное окно
        hidePaymentModal();

        // Показываем благодарность
        showThankYouBlock();

        // Очищаем заказ и обновляем UI сразу, не скрывая благодарность
        order = { items: [], total: 0 };
        updateOrderUI();

        // Очищаем форму
        this.reset();
    });

    document.querySelector('.close-modal').addEventListener('click', hidePaymentModal);
});

document.getElementById('container').innerHTML = getPropertyHtml();