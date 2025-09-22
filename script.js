
// Массив товаров (можно заменить на данные из API или JSON)
const products = [
  { id: 1, name: "Сыр", price: 190.31, img: "/img/cheese.jpg" },
  { id: 2, name: "Орехи", price: 22.99, img: "/img/nuts.jpg" },
  { id: 3, name: "Конфеты", price: 103.39, img: "/img/Candy.jpg" },
  { id: 4, name: "Яйца", price: 58.78, img: "/img//Eggs.jpg" },
  { id: 5, name: "Печенье", price: 55.50, img: "/img/cookie.jpg" },
  { id: 6, name: "Выпечка", price: 198.99, img: "/img/Pastries.jpg" },
  { id: 7, name: "Мороженное", price: 131.74, img: "/img/IceCream.jpg" },
  { id: 8, name: "Торты", price: 139.17, img: "/img/Cake.jpg" },
  { id: 9, name: "Торт-мороженное", price: 195.70, img: "/img/CakeIce.jpg" },
  { id: 10, name: "Крекеры", price: 19.60, img: "/img/Creker.jpg" }
];

// Корзина — хранилище выбранных товаров (будем хранить в localStorage)
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Функция добавления товара в корзину
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(); // Сохраняем в localStorage
  updateCartUI();
}

// Сохранение корзины в localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Обновление счётчика и суммы в шапке
function updateCartUI() {
  const cartCount = document.querySelector('.cart-count');
  const cartTotalElement = document.getElementById('cartTotal');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

  if (!cartTotalElement) {
    const totalSpan = document.createElement('span');
    totalSpan.id = 'cartTotal';
    totalSpan.style.marginLeft = '8px';
    totalSpan.style.fontWeight = 'bold';
    totalSpan.textContent = `$${totalPrice}`;
    document.querySelector('.cart').appendChild(totalSpan);
  } else {
    cartTotalElement.textContent = `$${totalPrice}`;
  }
}

// Открытие/закрытие сайдбара корзины
function toggleCartSidebar() {
  const sidebar = document.getElementById('cartSidebar');
  if (sidebar) {
    sidebar.classList.toggle('active');
    renderCartItems();
  }
}

// Рендер содержимого корзины в сайдбаре
function renderCartItems() {
  const cartItemsContainer = document.getElementById('cartItems');
  const cartTotalSidebar = document.getElementById('cartTotalSidebar');

  if (!cartItemsContainer || !cartTotalSidebar) return;

  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    cartTotalSidebar.textContent = '$0.00';
    return;
  }

  cart.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <img src="${item.img}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>$${item.price.toFixed(2)} × <span class="item-quantity">${item.quantity}</span></p>
      </div>
      <button class="remove-btn" data-id="${item.id}">✕</button>
    `;
    cartItemsContainer.appendChild(itemElement);
  });

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  cartTotalSidebar.textContent = `$${totalPrice}`;

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const id = parseInt(this.getAttribute('data-id'));
      removeFromCart(id);
    });
  });
}

// Удаление товара из корзины
function removeFromCart(productId) {
  const itemIndex = cart.findIndex(item => item.id === productId);
  if (itemIndex > -1) {
    if (cart[itemIndex].quantity > 1) {
      cart[itemIndex].quantity -= 1;
    } else {
      cart.splice(itemIndex, 1);
    }
    saveCart();
    updateCartUI();
    renderCartItems();
  }
}

// Инициализация событий — работает на всех страницах
document.addEventListener('DOMContentLoaded', function () {

  // Если на странице есть карточки товаров — навешиваем события
  if (document.querySelector('.product-card')) {
    document.querySelectorAll('.product-card').forEach(card => {
      const title = card.querySelector('h3')?.textContent;
      const product = products.find(p => p.name === title);
      if (product) {
        card.addEventListener('click', function () {
          addToCart(product.id);
          const notification = document.createElement('div');
          notification.className = 'notification';
          notification.textContent = `✓ ${product.name} added to cart`;
          document.body.appendChild(notification);
          setTimeout(() => {
            notification.remove();
          }, 2000);
        });
      }
    });
  }

  // Поиск (если есть поле поиска)
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', function () {
      const query = searchInput.value.toLowerCase();
      const cards = document.querySelectorAll('.product-card');
      cards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        card.style.display = title.includes(query) ? 'block' : 'none';
      });
    });

    searchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        searchBtn.click();
      }
    });
  }

  // Открытие корзины
  const cartIcon = document.querySelector('.cart');
  if (cartIcon) {
    cartIcon.addEventListener('click', function (e) {
      if (!e.target.closest('.remove-btn')) {
        toggleCartSidebar();
      }
    });
  }

  // Закрытие сайдбара кликом вне его
  document.addEventListener('click', function (e) {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar && sidebar.classList.contains('active')) {
      const cartIcon = document.querySelector('.cart');
      if (!sidebar.contains(e.target) && !cartIcon.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    }
  });

  // Инициализация UI корзины при загрузке
  updateCartUI();
});

// === Слайдер продуктов (Hero Carousel) ===
let currentSlide = 0;
const carouselItems = document.querySelectorAll('.carousel-item');
const totalSlides = carouselItems.length;

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateCarousel();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateCarousel();
}

function updateCarousel() {
  const track = document.getElementById('carouselTrack');
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
}

// === Слайдер партнеров ===
let currentPartnerSlide = 0;
const partnerItems = document.querySelectorAll('.partner-item');
const totalPartnerSlides = partnerItems.length;

function nextPartnerSlide() {
  currentPartnerSlide = (currentPartnerSlide + 1) % totalPartnerSlides;
  updatePartnerCarousel();
}

function prevPartnerSlide() {
  currentPartnerSlide = (currentPartnerSlide - 1 + totalPartnerSlides) % totalPartnerSlides;
  updatePartnerCarousel();
}

function updatePartnerCarousel() {
  const track = document.getElementById('partnersTrack');
  track.style.transform = `translateX(-${currentPartnerSlide * 200}px)`;
}

// Запуск слайдеров при загрузке
document.addEventListener('DOMContentLoaded', function () {
  // Установка начального состояния слайдеров
  updateCarousel();
  updatePartnerCarousel();
});












