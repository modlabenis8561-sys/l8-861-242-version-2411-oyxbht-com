
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.site-search').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        return;
      }
      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
    });
  });

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var thumbs = Array.prototype.slice.call(slider.querySelectorAll('.hero-thumb'));
    var index = 0;
    var timer = null;

    function setActive(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setActive(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.concat(thumbs).forEach(function (control) {
      control.addEventListener('click', function () {
        setActive(Number(control.getAttribute('data-slide') || 0));
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    setActive(0);
    start();
  });


  document.querySelectorAll('.filter-bar').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
    });
  });

  document.querySelectorAll('.card-filter').forEach(function (input) {
    var scope = input.closest('main').querySelector('[data-filter-scope]');
    if (!scope) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        card.style.display = !query || text.indexOf(query) !== -1 ? '' : 'none';
      });
    });
  });

  var results = document.getElementById('search-results');
  var heading = document.getElementById('search-heading');
  if (results && window.SEARCH_ITEMS) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim().toLowerCase();
    var input = document.querySelector('.search-page-form input[name="q"]');
    if (input) {
      input.value = params.get('q') || '';
    }

    if (query) {
      var matched = window.SEARCH_ITEMS.filter(function (item) {
        return item.search.indexOf(query) !== -1;
      }).slice(0, 120);

      if (heading) {
        var title = heading.querySelector('h2');
        if (title) {
          title.textContent = '搜索结果';
        }
      }

      results.innerHTML = matched.map(function (item) {
        return [
          '<article class="movie-card">',
          '  <a class="poster" href="' + item.href + '">',
          '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '    <span class="poster-badge">高清</span>',
          '  </a>',
          '  <div class="card-body">',
          '    <div class="card-meta">' + escapeHtml(item.meta) + '</div>',
          '    <h3><a href="' + item.href + '">' + escapeHtml(item.title) + '</a></h3>',
          '    <p>' + escapeHtml(item.summary) + '</p>',
          '    <div class="tag-row"><span>在线观看</span><span>高清</span></div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');
    }
  }
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, function (char) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[char];
  });
}
