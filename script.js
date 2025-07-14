document.addEventListener('DOMContentLoaded', function () {
    const galleryGrid = document.querySelector('.gallery-grid');
    const searchInput = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-box button');

    const apiKey = 'AIzaSyBh82Bqe-FfnZdzjGSVwmrpdKiURhhHaZ4';
    const sheetId = '1Vn9sSmLbbMvZ9lJO1HxhuU4v1Sjs7Hs7jOlZT2c-9ms';
    const sheetName = 'Ali7';
    const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/'${sheetName}'!A1:D1000?alt=json&key=${apiKey}`;

    let allItems = [];

    function fetchData() {
        fetch(endpoint)
            .then(res => res.json())
            .then(data => {
                const rows = data.values;
                const headers = rows[0];
                const items = rows.slice(1).map(row => {
                    let item = {};
                    headers.forEach((header, i) => {
                        item[header.trim()] = row[i] || '';
                    });
                    return item;
                });

                allItems = items;
                renderCategories(items);
            })
            .catch(err => {
                galleryGrid.innerHTML = `<p style="color: var(--accent-red);">Failed to load gallery.</p>`;
                console.error('Google Sheets Fetch Error:', err);
            });
    }

    function renderCategories(items) {
        galleryGrid.innerHTML = '';
        searchInput.parentElement.style.display = 'flex'; // hide search in category view

        const categories = [...new Set(items.map(item => item.Category))];

        categories.forEach(cat => {
            const html = `
                <div class="gallery-item category-card" data-category="${cat}">
                    <div style="background: var(--medium-blue); color: var(--light-blue); height: 300px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                        ${cat}
                    </div>
                </div>
            `;
            galleryGrid.insertAdjacentHTML('beforeend', html);
        });

        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', function () {
                const selectedCat = this.getAttribute('data-category');
                const filtered = allItems.filter(item => item.Category === selectedCat);
                renderGallery(filtered, selectedCat);
            });
        });
    }

    function renderGallery(items, categoryName = '') {
        galleryGrid.innerHTML = '';
        searchInput.parentElement.style.display = 'flex'; // show search in gallery view

        if (categoryName) {
            const backBtn = `<button class="view-btn" style="margin-bottom: 20px;" onclick="location.reload()">← Back to Categories</button>`;
            galleryGrid.insertAdjacentHTML('beforeend', backBtn);
        }

        items.forEach(item => {
            const html = `
  <div class="gallery-item" data-title="${item.Title}" data-img="${item.ImageURL}">
    <img src="${item.ImageURL}" alt="${item.Title}">
    <div class="item-overlay">
      <h3>${item.Title}</h3>
      <p>${item.Description}</p>
    
      <button class="cart-btn">أضف للعربة</button>
    </div>
  </div>
`;

            galleryGrid.insertAdjacentHTML('beforeend', html);
        });

        addViewListeners();
    }
	
let cart = [];

function addToCart(item) {
  let storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];

  const exists = storedCart.some(i => i.title === item.title);
  if (!exists) {
    storedCart.push(item);
    localStorage.setItem('cartItems', JSON.stringify(storedCart));
  }
}


function updateCartUI() {
  const cartList = document.getElementById('cartItems');
  cartList.innerHTML = '';
  cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${item.title}`;
    cartList.appendChild(li);
  });
}

    function addViewListeners() {
		document.querySelectorAll('.cart-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const card = this.closest('.gallery-item');
    const title = card.getAttribute('data-title');
    const img = card.getAttribute('data-img');

    addToCart({ title, img });
  });
});

        const viewButtons = document.querySelectorAll('.gallery-item .view-btn');
        viewButtons.forEach(button => {
            button.addEventListener('click', function () {
                const itemTitle = this.parentElement.querySelector('h3').textContent;
                alert(`Viewing details for: ${itemTitle}`);
            });
        });
    }

    function performSearch(term) {
        const filtered = allItems.filter(item =>
            item.Title.toLowerCase().includes(term.toLowerCase()) ||
            item.Description.toLowerCase().includes(term.toLowerCase()) ||
            item.Category.toLowerCase().includes(term.toLowerCase())
        );
        renderGallery(filtered);
    }

    searchInput.addEventListener('keyup', function (e) {
        if (e.key === 'Enter') {
            performSearch(this.value);
        }
    });

    searchBtn.addEventListener('click', function () {
        performSearch(searchInput.value);
    });

    fetchData();
});


