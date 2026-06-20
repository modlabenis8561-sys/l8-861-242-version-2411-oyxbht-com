(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupNavigation() {
    var button = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.main-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slider = document.querySelector('.hero-slider');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dots button'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function next() {
      show((current + 1) % slides.length);
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(next, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    slider.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });
    slider.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var input = document.getElementById('site-search-input');
    var year = document.getElementById('site-year-filter');
    var region = document.getElementById('site-region-filter');
    var items = Array.prototype.slice.call(document.querySelectorAll('.filter-item'));
    if (!items.length || (!input && !year && !region)) {
      return;
    }

    function value(node) {
      return node ? node.value.trim().toLowerCase() : '';
    }

    function apply() {
      var q = value(input);
      var y = value(year);
      var r = value(region);
      items.forEach(function (item) {
        var title = (item.getAttribute('data-title') || '').toLowerCase();
        var itemYear = (item.getAttribute('data-year') || '').toLowerCase();
        var itemRegion = (item.getAttribute('data-region') || '').toLowerCase();
        var tags = (item.getAttribute('data-tags') || '').toLowerCase();
        var haystack = title + ' ' + itemRegion + ' ' + itemYear + ' ' + tags;
        var matched = true;
        if (q && haystack.indexOf(q) === -1) {
          matched = false;
        }
        if (y && itemYear.indexOf(y) === -1) {
          matched = false;
        }
        if (r && itemRegion.indexOf(r) === -1 && tags.indexOf(r) === -1) {
          matched = false;
        }
        item.classList.toggle('hidden-by-filter', !matched);
      });
    }

    [input, year, region].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });
  }

  window.initVideoPlayer = function (videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var attached = false;

    if (!video || !streamUrl) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function begin() {
      attach();
      if (overlay) {
        overlay.classList.add('hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', begin);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('hidden');
      }
    });
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
