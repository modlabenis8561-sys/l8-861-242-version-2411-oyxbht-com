(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img[data-fallback]').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-missing');
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  if (slides.length) {
    showSlide(0);

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5600);
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');

      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var queryInput = filterRoot.querySelector('[data-card-query]');
    var yearSelect = filterRoot.querySelector('[data-card-year]');
    var typeSelect = filterRoot.querySelector('[data-card-type]');
    var chips = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-genre-chip]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var activeGenre = 'all';

    function normalizeText(value) {
      return String(value || '').toLowerCase();
    }

    function applyFilter() {
      var query = normalizeText(queryInput ? queryInput.value : '');
      var year = yearSelect ? yearSelect.value : 'all';
      var type = typeSelect ? typeSelect.value : 'all';

      cards.forEach(function (card) {
        var text = normalizeText([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' '));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchYear = year === 'all' || card.getAttribute('data-year') === year;
        var matchType = type === 'all' || card.getAttribute('data-type') === type;
        var matchGenre = activeGenre === 'all' || normalizeText(card.getAttribute('data-genre')).indexOf(normalizeText(activeGenre)) !== -1;

        card.style.display = matchQuery && matchYear && matchType && matchGenre ? '' : 'none';
      });
    }

    if (queryInput) {
      queryInput.addEventListener('input', applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeGenre = chip.getAttribute('data-genre-chip') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        applyFilter();
      });
    });
  }

  var searchRoot = document.querySelector('[data-search-page]');

  if (searchRoot && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var input = searchRoot.querySelector('[data-search-input]');
    var results = searchRoot.querySelector('[data-search-results]');
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function createResult(movie) {
      var article = document.createElement('article');
      article.className = 'movie-card';
      article.innerHTML = [
        '<a class="poster-frame" href="./' + movie.file + '" aria-label="观看' + escapeHtml(movie.title) + '">',
        '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '海报" loading="lazy" data-fallback>',
        '<span class="poster-shade"></span>',
        '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
        '<span class="score-badge">' + escapeHtml(movie.score) + '</span>',
        '</a>',
        '<div class="movie-info">',
        '<h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
        '<p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</p>',
        '<p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
        '</div>'
      ].join('');
      return article;
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function runSearch() {
      if (!results) {
        return;
      }

      var query = input ? input.value.trim().toLowerCase() : '';
      var list = window.SEARCH_MOVIES;

      if (query) {
        list = list.filter(function (movie) {
          return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine]
            .join(' ')
            .toLowerCase()
            .indexOf(query) !== -1;
        });
      }

      results.innerHTML = '';

      if (!list.length) {
        var empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = '没有找到匹配的影视作品';
        results.appendChild(empty);
        return;
      }

      list.slice(0, 120).forEach(function (movie) {
        results.appendChild(createResult(movie));
      });
    }

    if (input) {
      input.addEventListener('input', runSearch);
    }

    runSearch();
  }
})();
