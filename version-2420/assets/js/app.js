(function () {
    var menuButton = document.querySelector(".mobile-menu-button");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var opened = menuButton.classList.toggle("is-open");
            mobileNav.classList.toggle("is-open", opened);
            menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === current);
        });
    }

    function startCarousel() {
        if (slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function restartCarousel() {
        if (timer) {
            window.clearInterval(timer);
        }
        startCarousel();
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-target")) || 0);
            restartCarousel();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(current - 1);
            restartCarousel();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(current + 1);
            restartCarousel();
        });
    }

    startCarousel();

    var forms = Array.prototype.slice.call(document.querySelectorAll(".site-search"));
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".js-card-search"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));

    function filterCards(value) {
        var keyword = (value || "").trim().toLowerCase();
        cards.forEach(function (card) {
            var text = card.getAttribute("data-title") || "";
            card.classList.toggle("is-filter-hidden", keyword && text.indexOf(keyword) === -1);
        });
    }

    inputs.forEach(function (input) {
        input.addEventListener("input", function () {
            filterCards(input.value);
            inputs.forEach(function (other) {
                if (other !== input) {
                    other.value = input.value;
                }
            });
        });
    });

    forms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector(".js-card-search");
            filterCards(input ? input.value : "");
        });
    });
})();
