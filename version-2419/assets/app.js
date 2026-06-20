(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initSearchRedirect() {
    qsa('[data-search-redirect]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="search"]', form);
        var value = input ? input.value.trim() : '';
        var target = form.getAttribute('action') || './catalog.html';
        if (value) {
          window.location.href = target + '?search=' + encodeURIComponent(value);
        } else {
          window.location.href = target;
        }
      });
    });
  }

  function initLocalFilters() {
    var list = qs('[data-card-list]');
    if (!list) {
      return;
    }
    var cards = qsa('[data-card]', list);
    var input = qs('[data-filter-input]');
    var empty = qs('[data-empty-state]');
    var chips = qsa('[data-filter-chip]');
    var activeValue = '';
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('search') || '';

    if (input && initial) {
      input.value = initial;
    }

    function matchCard(card, query, value) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var terms = [
        card.getAttribute('data-type') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-year') || ''
      ].join(' ').toLowerCase();
      var queryOk = !query || text.indexOf(query) !== -1;
      var valueOk = !value || terms.indexOf(value) !== -1 || text.indexOf(value) !== -1;
      return queryOk && valueOk;
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matchCard(card, query, activeValue);
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = (chip.getAttribute('data-filter-value') || '').toLowerCase();
        activeValue = activeValue === value ? '' : value;
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip && activeValue);
        });
        apply();
      });
    });

    if (input) {
      input.addEventListener('input', apply);
      var form = input.closest('form');
      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          apply();
        });
      }
    }

    apply();
  }

  function loadHls() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }
      var existing = document.querySelector('script[data-hls-loader]');
      if (existing) {
        existing.addEventListener('load', function () {
          resolve(window.Hls);
        });
        existing.addEventListener('error', reject);
        return;
      }
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      script.async = true;
      script.dataset.hlsLoader = 'true';
      script.addEventListener('load', function () {
        resolve(window.Hls);
      });
      script.addEventListener('error', reject);
      document.head.appendChild(script);
    });
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('[data-play]', player);
      var source = player.getAttribute('data-source');
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function playNative() {
        video.src = source;
        video.play().catch(function () {});
      }

      function start() {
        player.classList.add('is-active');
        if (video.dataset.ready === 'true') {
          video.play().catch(function () {});
          return;
        }
        video.dataset.ready = 'true';
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          playNative();
          return;
        }
        loadHls().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            playNative();
          }
        }).catch(function () {
          playNative();
        });
      }

      if (button) {
        button.addEventListener('click', start);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  function initImages() {
    qsa('img').forEach(function (img) {
      function hideBroken() {
        img.classList.add('image-hidden');
        var holder = img.closest('.poster, .hero-card, .category-cover, .rank-thumb, .detail-hero, .hero-slide');
        if (holder) {
          holder.classList.add('image-missing');
        }
      }
      img.addEventListener('error', hideBroken, { once: true });
      if (img.complete && img.naturalWidth === 0) {
        hideBroken();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchRedirect();
    initLocalFilters();
    initPlayers();
    initImages();
  });
})();
