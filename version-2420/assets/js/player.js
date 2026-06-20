(function () {
    var boxes = Array.prototype.slice.call(document.querySelectorAll(".js-player"));

    boxes.forEach(function (box) {
        var video = box.querySelector("video");
        var trigger = box.querySelector(".player-overlay");
        var streamUrl = box.getAttribute("data-stream") || "";
        var hlsInstance = null;

        function revealTrigger() {
            if (trigger) {
                trigger.classList.remove("is-hidden");
            }
        }

        function playVideo() {
            if (!video || !streamUrl) {
                return;
            }

            if (trigger) {
                trigger.classList.add("is-hidden");
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (video.getAttribute("src") !== streamUrl) {
                    video.setAttribute("src", streamUrl);
                }
                video.play().catch(revealTrigger);
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        capLevelToPlayerSize: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                }

                if (video.readyState >= 1) {
                    video.play().catch(revealTrigger);
                } else {
                    video.addEventListener("loadedmetadata", function handleReady() {
                        video.removeEventListener("loadedmetadata", handleReady);
                        video.play().catch(revealTrigger);
                    });
                }
                return;
            }

            if (video.getAttribute("src") !== streamUrl) {
                video.setAttribute("src", streamUrl);
            }
            video.play().catch(revealTrigger);
        }

        if (trigger) {
            trigger.addEventListener("click", playVideo);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener("play", function () {
                if (trigger) {
                    trigger.classList.add("is-hidden");
                }
            });
        }
    });
})();
