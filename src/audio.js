const MUSIC_PATH = "../assets/sounds/8bit-music-for-game-68698.mp3";
const POP_PATH = "../assets/sounds/pop-sound.mp3";
const POWERUP_PATH = "../assets/sounds/8-bit-powerup-6768.mp3";

export function createAudioController() {
  const music = new Audio(MUSIC_PATH);
  const popPool = createAudioPool(POP_PATH, 6, 0.12);
  const powerPool = createAudioPool(POWERUP_PATH, 4, 0.2);
  let muted = false;
  let musicStarted = false;

  music.loop = true;
  music.volume = 0.18;

  function init({ muted: startMuted = false } = {}) {
    setMuted(startMuted);
    tryStartMusic();
    document.addEventListener("pointerdown", tryStartMusic, { once: true });
    document.addEventListener("keydown", tryStartMusic, { once: true });
  }

  function tryStartMusic() {
    if (musicStarted || muted) {
      return;
    }

    music.play()
      .then(() => {
        musicStarted = true;
      })
      .catch(() => {
        musicStarted = false;
      });
  }

  function setMuted(value) {
    muted = Boolean(value);
    music.muted = muted;
    for (const audio of [...popPool.items, ...powerPool.items]) {
      audio.muted = muted;
    }

    if (!muted) {
      tryStartMusic();
    }
  }

  function toggleMuted() {
    setMuted(!muted);
    return muted;
  }

  return {
    init,
    setMuted,
    toggleMuted,
    get muted() {
      return muted;
    },
    pop() {
      if (!muted) popPool.play();
    },
    purchase() {
      if (!muted) powerPool.play();
    }
  };
}

function createAudioPool(src, size, volume) {
  const items = Array.from({ length: size }, () => {
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.volume = volume;
    return audio;
  });
  let index = 0;

  return {
    items,
    play(volumeOverride) {
      const audio = items[index];
      index = (index + 1) % items.length;
      audio.currentTime = 0;
      audio.volume = volumeOverride ?? volume;
      audio.play().catch(() => {});
    }
  };
}
