(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector(".mobile-toggle");
    var nav = document.getElementById("mobileNav");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("is-open", !expanded);
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var next = root.querySelector("[data-hero-next]");
    var prev = root.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    restart();
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));

    if (!inputs.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    inputs.forEach(function (input) {
      if (initialQuery) {
        input.value = initialQuery;
      }

      input.addEventListener("input", function () {
        filterLists(input.value);
      });
    });

    if (initialQuery) {
      filterLists(initialQuery);
    }
  }

  function filterLists(query) {
    var keyword = String(query || "").trim().toLowerCase();
    var lists = Array.prototype.slice.call(document.querySelectorAll("[data-search-list]"));

    lists.forEach(function (list) {
      var cards = Array.prototype.slice.call(list.children);

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
        card.classList.toggle("is-filtered-out", keyword && text.indexOf(keyword) === -1);
      });
    });
  }

  function setupPlayer() {
    var playerBox = document.querySelector("[data-player]");

    if (!playerBox) {
      return;
    }

    var video = playerBox.querySelector("video");
    var button = playerBox.querySelector("[data-play-button]");
    var status = document.querySelector("[data-player-status]");
    var started = false;

    if (!video) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text || "";
      }
    }

    function playWithHls(videoUrl) {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            setStatus("请点击播放器继续观看。 ");
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus("播放连接异常，请稍后重试。 ");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        video.addEventListener("loadedmetadata", function () {
          video.play().catch(function () {
            setStatus("请点击播放器继续观看。 ");
          });
        }, { once: true });
      } else {
        video.src = videoUrl;
        video.load();
        video.play().catch(function () {
          setStatus("当前环境暂时无法自动播放。 ");
        });
      }
    }

    function beginPlayback() {
      var videoUrl = video.getAttribute("data-video-url");

      if (!videoUrl) {
        setStatus("暂无可用播放内容。 ");
        return;
      }

      if (started) {
        video.play().catch(function () {
          setStatus("请点击播放器继续观看。 ");
        });
        return;
      }

      started = true;
      setStatus("正在打开高清播放。 ");

      if (button) {
        button.classList.add("is-hidden");
      }

      playWithHls(videoUrl);
    }

    if (button) {
      button.addEventListener("click", beginPlayback);
    }

    video.addEventListener("click", function () {
      if (!started) {
        beginPlayback();
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupSearch();
    setupPlayer();
  });
})();
