(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      const icon = menuButton.querySelector('.menu-icon');
      if (icon) {
        icon.textContent = mobileMenu.classList.contains('hidden') ? '☰' : '×';
      }
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const setSlide = (index) => {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => setSlide(current + 1), 5000);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    if (prev) {
      prev.addEventListener('click', () => {
        setSlide(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        setSlide(current + 1);
        start();
      });
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        setSlide(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    setSlide(0);
    start();
  }

  const searchPage = document.querySelector('[data-search-page]');
  if (searchPage) {
    const queryInput = searchPage.querySelector('[data-filter-query]');
    const regionSelect = searchPage.querySelector('[data-filter-region]');
    const yearSelect = searchPage.querySelector('[data-filter-year]');
    const typeSelect = searchPage.querySelector('[data-filter-type]');
    const cards = Array.from(searchPage.querySelectorAll('[data-movie-card]'));

    const normalize = (value) => String(value || '').trim().toLowerCase();

    const applyFilters = () => {
      const query = normalize(queryInput ? queryInput.value : '');
      const region = regionSelect ? regionSelect.value : '';
      const year = yearSelect ? yearSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        const matchedQuery = !query || haystack.includes(query);
        const matchedRegion = !region || card.dataset.region === region;
        const matchedYear = !year || card.dataset.year === year;
        const matchedType = !type || card.dataset.type === type;
        card.hidden = !(matchedQuery && matchedRegion && matchedYear && matchedType);
      });
    };

    [queryInput, regionSelect, yearSelect, typeSelect].forEach((node) => {
      if (node) {
        node.addEventListener('input', applyFilters);
        node.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();
