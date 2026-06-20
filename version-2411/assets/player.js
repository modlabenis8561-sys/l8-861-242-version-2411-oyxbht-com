import { H as Hls } from './hls.js';

(() => {
  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach((shell) => {
    const video = shell.querySelector('video');
    const button = shell.querySelector('[data-play]');
    const cover = shell.querySelector('[data-cover]');
    let hls = null;
    let prepared = false;

    if (!video) {
      return;
    }

    const prepare = () => {
      if (prepared) {
        return;
      }
      prepared = true;
      const stream = video.dataset.stream || '';

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (!data || !data.fatal || !hls) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            hls = null;
          }
        });
      } else {
        video.src = stream;
      }
    };

    const start = () => {
      prepare();
      shell.classList.add('is-playing');
      const play = video.play();
      if (play && typeof play.catch === 'function') {
        play.catch(() => {
          shell.classList.remove('is-playing');
        });
      }
    };

    if (button) {
      button.addEventListener('click', start);
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    video.addEventListener('play', () => {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', () => {
      if (video.currentTime === 0) {
        shell.classList.remove('is-playing');
      }
    });
  });
})();
