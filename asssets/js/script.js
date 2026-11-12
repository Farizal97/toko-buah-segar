document.addEventListener("DOMContentLoaded", function () {
    const cartBadge = document.getElementById("navCartBadge");
    const cartStorageKey = "tokoBuahCart";

    function readCart() {
        const savedCart = localStorage.getItem(cartStorageKey);
        if (!savedCart) {
            return [];
        }

        const cart = JSON.parse(savedCart);
        if (!Array.isArray(cart)) {
            throw new Error("Format data keranjang tidak valid.");
        }

        return cart;
    }

    function updateCartBadge(cart) {
        if (!cartBadge) {
            return;
        }

        const itemCount = cart.reduce(function (total, item) {
            return total + item.quantity;
        }, 0);

        cartBadge.textContent = itemCount;
        cartBadge.hidden = itemCount === 0;
    }

    try {
        updateCartBadge(readCart());
    } catch (error) {
        console.error("Keranjang gagal dimuat:", error);
    }

    const cartItems = document.getElementById("cartItems");
    const cartCountLabel = document.getElementById("cartCountLabel");
    const cartSubtotal = document.getElementById("cartSubtotal");
    const cartTotal = document.getElementById("cartTotal");
    const cartFeedback = document.getElementById("cartFeedback");
    const cartCheckoutButton = document.getElementById("cartCheckoutButton");

    function parsePrice(price) {
        const amount = Number(String(price).replace(/[^\d]/g, ""));
        if (!Number.isFinite(amount) || amount < 0) {
            throw new Error("Harga produk di keranjang tidak valid.");
        }
        return amount;
    }

    function formatPrice(amount) {
        return "Rp " + new Intl.NumberFormat("id-ID").format(amount);
    }

    function renderCart() {
        if (!cartItems || !cartCountLabel || !cartSubtotal || !cartTotal) {
            return;
        }

        const cart = readCart();
        const subtotal = cart.reduce(function (total, item) {
            return total + parsePrice(item.price) * item.quantity;
        }, 0);

        cartCountLabel.textContent = cart.length + " jenis buah di keranjang Anda";
        cartSubtotal.textContent = formatPrice(subtotal);
        cartTotal.textContent = formatPrice(subtotal);
        updateCartBadge(cart);
        cartItems.replaceChildren();

        if (cart.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.className = "cart-empty";

            const emptyIcon = document.createElement("i");
            emptyIcon.className = "bi bi-basket";
            emptyIcon.setAttribute("aria-hidden", "true");

            const emptyTitle = document.createElement("h2");
            emptyTitle.textContent = "Keranjang Anda masih kosong";

            const emptyDescription = document.createElement("p");
            emptyDescription.textContent = "Yuk, pilih buah segar favorit Anda.";

            emptyMessage.append(emptyIcon, emptyTitle, emptyDescription);
            cartItems.appendChild(emptyMessage);
            return;
        }

        cart.forEach(function (item, index) {
            const row = document.createElement("article");
            row.className = "cart-item";

            const productInfo = document.createElement("div");
            productInfo.className = "cart-product-info";

            const productTag = document.createElement("span");
            productTag.className = "cart-product-tag";
            productTag.textContent = item.name.split(" ")[0];

            const productDetails = document.createElement("div");
            productDetails.className = "cart-product-details";

            const productName = document.createElement("h2");
            productName.textContent = item.name;

            const productPrice = document.createElement("p");
            productPrice.textContent = formatPrice(parsePrice(item.price));

            productDetails.append(productName, productPrice);
            productInfo.append(productTag, productDetails);

            const quantityControls = document.createElement("div");
            quantityControls.className = "cart-quantity";
            quantityControls.setAttribute("aria-label", "Jumlah " + item.name);

            const decreaseButton = document.createElement("button");
            decreaseButton.type = "button";
            decreaseButton.className = "quantity-button";
            decreaseButton.dataset.cartAction = "decrease";
            decreaseButton.dataset.index = String(index);
            decreaseButton.textContent = "-";
            decreaseButton.setAttribute("aria-label", "Kurangi " + item.name);
            decreaseButton.disabled = item.quantity <= 1;

            const quantity = document.createElement("span");
            quantity.className = "cart-quantity-value";
            quantity.textContent = String(item.quantity);
            quantity.setAttribute("aria-live", "polite");

            const increaseButton = document.createElement("button");
            increaseButton.type = "button";
            increaseButton.className = "quantity-button";
            increaseButton.dataset.cartAction = "increase";
            increaseButton.dataset.index = String(index);
            increaseButton.textContent = "+";
            increaseButton.setAttribute("aria-label", "Tambah " + item.name);

            quantityControls.append(decreaseButton, quantity, increaseButton);

            const lineTotal = document.createElement("strong");
            lineTotal.className = "cart-line-total";
            lineTotal.textContent = formatPrice(parsePrice(item.price) * item.quantity);

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "cart-remove-button";
            removeButton.dataset.cartAction = "remove";
            removeButton.dataset.index = String(index);
            removeButton.setAttribute("aria-label", "Hapus " + item.name + " dari keranjang");

            const removeIcon = document.createElement("i");
            removeIcon.className = "bi bi-trash";
            removeIcon.setAttribute("aria-hidden", "true");
            removeButton.appendChild(removeIcon);

            row.append(productInfo, quantityControls, lineTotal, removeButton);
            cartItems.appendChild(row);
        });
    }

    if (cartItems) {
        try {
            renderCart();
        } catch (error) {
            console.error("Keranjang gagal ditampilkan:", error);
            cartItems.textContent = "Keranjang gagal dimuat. Silakan muat ulang halaman.";
        }

        cartItems.addEventListener("click", function (event) {
            const button = event.target.closest("[data-cart-action]");
            if (!button) {
                return;
            }

            try {
                const cart = readCart();
                const index = Number(button.dataset.index);
                const item = cart[index];

                if (!item) {
                    throw new Error("Produk keranjang tidak ditemukan.");
                }

                if (button.dataset.cartAction === "increase") {
                    item.quantity += 1;
                } else if (button.dataset.cartAction === "decrease") {
                    item.quantity = Math.max(1, item.quantity - 1);
                } else if (button.dataset.cartAction === "remove") {
                    cart.splice(index, 1);
                }

                localStorage.setItem(cartStorageKey, JSON.stringify(cart));
                renderCart();
            } catch (error) {
                console.error("Perubahan keranjang gagal disimpan:", error);
            }
        });
    }

    if (cartCheckoutButton && cartFeedback) {
        cartCheckoutButton.addEventListener("click", function () {
            cartFeedback.textContent = "Fitur checkout belum tersedia. Silakan hubungi kami untuk pemesanan.";
            cartFeedback.hidden = false;
        });
    }

    document.querySelectorAll(".btn-add-cart").forEach(function (button) {
        button.addEventListener("click", function () {
            const productCard = button.closest(".product-card");
            const productName = button.dataset.name;
            const priceElement = productCard && productCard.querySelector(".text-green");
            const price = priceElement ? priceElement.textContent.trim() : "";

            if (!productName || !price) {
                console.error("Produk tidak dapat ditambahkan: nama atau harga tidak tersedia.");
                return;
            }

            try {
                const cart = readCart();
                const existingItem = cart.find(function (item) {
                    return item.name === productName;
                });

                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ name: productName, price: price, quantity: 1 });
                }

                localStorage.setItem(cartStorageKey, JSON.stringify(cart));
                updateCartBadge(cart);
                button.setAttribute("aria-label", productName + " berhasil ditambahkan ke keranjang");
            } catch (error) {
                console.error("Produk gagal ditambahkan ke keranjang:", error);
            }
        });
    });

    const contactForm = document.getElementById("contactForm");
    const alertContainer = document.getElementById("alertContainer");
    const submitBtn = document.getElementById("submitBtn");

    if (contactForm && alertContainer && submitBtn) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const namaInput = document.getElementById("nama");
            const emailInput = document.getElementById("email");
            const pesanInput = document.getElementById("pesan");

            if (!namaInput || !emailInput || !pesanInput) {
                console.error("Form kontak tidak memiliki seluruh kolom yang diperlukan.");
                return;
            }

            const nama = namaInput.value.trim();
            const email = emailInput.value.trim();
            const pesan = pesanInput.value.trim();

            if (!nama || !email || !pesan) {
                showContactAlert("Harap lengkapi semua kolom (Nama, Email, dan Pesan).", "danger");
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showContactAlert("Format alamat email tidak valid.", "warning");
                return;
            }

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Mengirim...';

            window.setTimeout(function () {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                showContactAlert("Terima kasih, " + nama + "! Pesan Anda telah berhasil dikirim.", "success");
                contactForm.reset();
            }, 800);
        });
    }

    function showContactAlert(message, type) {
        alertContainer.replaceChildren();

        const alert = document.createElement("div");
        alert.className = "alert alert-" + type + " alert-dismissible fade show small";
        alert.setAttribute("role", "alert");
        alert.appendChild(document.createTextNode(message));

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "btn-close";
        closeButton.setAttribute("data-bs-dismiss", "alert");
        closeButton.setAttribute("aria-label", "Close");
        alert.appendChild(closeButton);

        alertContainer.appendChild(alert);
    }
});
