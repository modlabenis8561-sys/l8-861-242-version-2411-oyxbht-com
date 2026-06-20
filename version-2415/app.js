(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", slider);
    var dots = selectAll("[data-hero-dot]", slider);
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
  }

  function setupFilters() {
    selectAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-card-filter]");
      var grid = scope.querySelector("[data-card-grid]");
      var buttons = selectAll("[data-sort]", scope);
      if (!grid) {
        return;
      }
      var cards = selectAll("[data-card]", grid);
      function filterCards() {
        var query = text(input && input.value);
        cards.forEach(function (card) {
          var haystack = text(card.getAttribute("data-title") + " " + card.getAttribute("data-keywords"));
          card.classList.toggle("hidden-card", query && haystack.indexOf(query) === -1);
        });
      }
      function sortCards(mode) {
        var sorted = cards.slice();
        sorted.sort(function (a, b) {
          if (mode === "rating") {
            return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
          }
          if (mode === "year") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }
          if (mode === "views") {
            return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
          }
          return 0;
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }
      if (input) {
        input.addEventListener("input", filterCards);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          sortCards(button.getAttribute("data-sort"));
          filterCards();
        });
      });
    });
  }

  function cardHtml(item) {
    var tags = (item.tags || []).slice(0, 4).map(escapeHtml).join(" ");
    return "<article class=\"horizontal-card\">" +
      "<a href=\"" + escapeHtml(item.url) + "\">" +
      "<div class=\"horizontal-poster\"><img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\"></div>" +
      "<div class=\"horizontal-info\">" +
      "<span>" + escapeHtml(item.category) + " · " + escapeHtml(item.year) + "</span>" +
      "<h3>" + escapeHtml(item.title) + "</h3>" +
      "<p>" + escapeHtml(item.desc) + "</p>" +
      "<div>" + escapeHtml(item.region) + " / " + escapeHtml(item.type) + " / " + tags + "</div>" +
      "</div></a></article>";
  }

  function setupSearch() {
    var target = document.getElementById("search-results");
    if (!target || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = text(params.get("q"));
    var matches = window.SEARCH_INDEX.filter(function (item) {
      var haystack = text([item.title, item.category, item.genre, item.region, item.type, item.year, item.desc, (item.tags || []).join(" ")].join(" "));
      return query ? haystack.indexOf(query) !== -1 : false;
    }).slice(0, 120);
    if (!query) {
      target.innerHTML = "<div class=\"search-empty\"><h2>请输入关键词</h2><p>可按片名、年份、地区、类型或标签查找内容。</p></div>";
      return;
    }
    if (!matches.length) {
      target.innerHTML = "<div class=\"search-empty\"><h2>未找到相关内容</h2><p>请尝试更换关键词。</p></div>";
      return;
    }
    target.innerHTML = "<div class=\"section-heading\"><div><h2>搜索结果</h2><p>关键词 “" + escapeHtml(params.get("q")) + "” 的相关内容</p></div></div>" + matches.map(cardHtml).join("");
  }

  function bindPlayer(videoId, buttonId, coverId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var cover = document.getElementById(coverId);
    if (!video || !button || !sourceUrl) {
      return;
    }
    var loaded = false;
    function start() {
      if (!loaded) {
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
      }
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    button.addEventListener("click", start);
    if (cover) {
      cover.addEventListener("click", function (event) {
        if (event.target === cover || event.target.tagName === "IMG") {
          start();
        }
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearch();
  });

  window.CinemaSite = {
    bindPlayer: bindPlayer
  };
})();
