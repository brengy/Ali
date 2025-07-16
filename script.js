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
                        const key = header.trim();
                        item[key] = row[i] || (key === "Title" ? `Unnamed ${i}` : key === "Category" ? "غير مصنف" : '');
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
	
window.addEventListener('popstate', function (e) {
    if (e.state && e.state.view === 'gallery') {
        // Go back to categories
        renderCategories(allItems);
    }
});



    function renderCategories(items) {
        galleryGrid.innerHTML = '';
        searchInput.parentElement.style.display = 'flex';

        const categories = [...new Set(items.map(item => item.Category))];

        categories.forEach(cat => {
            const imageSrc = `images/${cat}.jpg`;
            const html = `
                <div class="gallery-item category-card" data-category="${cat}">
                    <div class="category-circle-content">
                        <img src="${imageSrc}" alt="${cat}" onerror="this.onerror=null;this.src='images/UC.jpg';">
                        <span>${cat}</span>
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
	
	history.replaceState({ view: 'categories' }, '', '');

    function renderGallery(items, categoryName = '') {
    history.pushState({ view: 'gallery' }, '', '');


    galleryGrid.innerHTML = '';
    searchInput.parentElement.style.display = 'flex';

        if (categoryName) {
            const backBtn = `<button class="view-btn" style="margin-bottom: 20px;" onclick="location.reload()">← Back to Categories</button>`;
            galleryGrid.insertAdjacentHTML('beforeend', backBtn);
        }

        items.forEach(item => {
            const title = item.Title || 'بدون عنوان';
            const img = item.ImageURL || 'images/UC.jpg';
            const html = `
                <div class="gallery-item" data-title="${title}" data-img="${img}">
                    <img src="${img}" alt="${title}">
                    <div class="item-overlay">
                        <h3>${title}</h3>
                        <p>${item.Description || ''}</p>
                        <button class="cart-btn">أضف للعربة</button>
                    </div>
                </div>
            `;
            galleryGrid.insertAdjacentHTML('beforeend', html);
        });

        addViewListeners();
    }

    function addToCart(item) {
        let storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];

        const exists = storedCart.some(i => i.title === item.title && i.img === item.img);
        if (!exists) {
            storedCart.push(item); // ✅ Now it actually adds the item!
            localStorage.setItem('cartItems', JSON.stringify(storedCart));

            console.log("✅ Added to cart:", item);
        } else {
            console.log("ℹ️ Already in cart:", item);
        }

        const sound = document.getElementById('cartSound');
        if (sound) sound.play();
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

                if (title && img) {
                    addToCart({ title, img });
                } else {
                    console.warn("⚠️ Missing title or image");
                }
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
