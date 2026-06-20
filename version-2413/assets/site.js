(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initLocalFilter() {
    var form = document.querySelector('[data-local-filter]');
    var list = document.querySelector('[data-filter-list]');
    if (!form || !list) {
      return;
    }
    var input = form.querySelector('input');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
    var chipValue = '';

    function apply() {
      var query = normalize(input ? input.value : '');
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' '));
        var okQuery = !query || text.indexOf(query) !== -1;
        var okChip = !chipValue || text.indexOf(normalize(chipValue)) !== -1;
        card.classList.toggle('hidden-card', !(okQuery && okChip));
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });

    if (input) {
      input.addEventListener('input', apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = chip.getAttribute('data-filter-chip') || '';
        chipValue = chipValue === value ? '' : value;
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip && chipValue === value);
        });
        apply();
      });
    });
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || typeof SEARCH_DATA === 'undefined') {
      return;
    }
    var input = document.getElementById('search-input');
    var title = document.querySelector('[data-search-title]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
    }

    function card(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + movie.url + '">',
        '    <img src="./' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-region">' + escapeHtml(movie.region) + '</span>',
        '    <span class="poster-play" aria-hidden="true">▶</span>',
        '  </a>',
        '  <div class="movie-meta">',
        '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="movie-info"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
        '    <div class="tag-row"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function render(value) {
      var q = normalize(value);
      var items = SEARCH_DATA.filter(function (movie) {
        if (!q) {
          return true;
        }
        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.oneLine
        ].join(' ')).indexOf(q) !== -1;
      }).slice(0, 120);

      if (title) {
        title.textContent = q ? '搜索：' + value : '为你推荐';
      }

      if (!items.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
        return;
      }

      results.innerHTML = items.map(card).join('');
    }

    render(query);
  }

  function initPlayer() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-player-box]'));
    boxes.forEach(function (box) {
      var video = box.querySelector('video');
      var trigger = box.querySelector('[data-play-trigger]');
      if (!video) {
        return;
      }
      var srcTag = video.querySelector('source[type="application/vnd.apple.mpegurl"]');
      var streamUrl = srcTag ? srcTag.getAttribute('src') : video.currentSrc;
      var hls = null;
      var attached = false;

      function attach() {
        if (attached || !streamUrl) {
          return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function playVideo() {
        attach();
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            video.controls = true;
          });
        }
      }

      if (trigger) {
        trigger.addEventListener('click', function (event) {
          event.preventDefault();
          playVideo();
        });
      }

      video.addEventListener('play', function () {
        if (trigger) {
          trigger.classList.add('hidden');
        }
      });

      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });

      attach();

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initLocalFilter();
    initSearchPage();
    initPlayer();
  });
})();
