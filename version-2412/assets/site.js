(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var timer = null;
    var show = function (index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };
    var start = function () {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    start();
  }

  var localInput = document.querySelector('[data-card-search]');
  if (localInput) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    localInput.addEventListener('input', function () {
      var query = localInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('is-filtered-out', query && text.indexOf(query) === -1);
      });
    });
  }

  var globalInput = document.querySelector('[data-global-search]');
  var results = document.querySelector('[data-search-results]');
  if (globalInput && results && Array.isArray(window.SEARCH_MOVIES)) {
    var renderCard = function (movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<a class="movie-card" href="' + escapeHtml(movie.url) + '" data-card>',
        '  <span class="poster-frame" style="background-image: linear-gradient(180deg, rgba(15, 23, 42, 0.05), rgba(2, 6, 23, 0.9)), url(\'' + escapeHtml(movie.cover) + '\');">',
        '    <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
        '    <span class="poster-type">' + escapeHtml(movie.type) + '</span>',
        '  </span>',
        '  <span class="movie-card-body">',
        '    <strong>' + escapeHtml(movie.title) + '</strong>',
        '    <em>' + escapeHtml(movie.region + ' · ' + movie.genre) + '</em>',
        '    <small>' + escapeHtml(movie.oneLine || '') + '</small>',
        '    <span class="tag-row">' + tags + '</span>',
        '  </span>',
        '</a>'
      ].join('');
    };
    var performSearch = function () {
      var query = globalInput.value.trim().toLowerCase();
      var list = window.SEARCH_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        return !query || text.indexOf(query) !== -1;
      }).slice(0, 96);
      results.innerHTML = list.map(renderCard).join('');
    };
    globalInput.addEventListener('input', performSearch);
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }
})();
