export function startGameLoop({
  tickMs = 250,
  onTick = () => {},
  onSecond = () => {},
  onFrame = () => {}
} = {}) {
  let lastTick = performance.now();
  let lastFrame = performance.now();
  let animationId = null;

  const tickTimer = window.setInterval(() => {
    const now = performance.now();
    const deltaSeconds = Math.min(5, (now - lastTick) / 1000);
    lastTick = now;
    onTick(deltaSeconds);
  }, tickMs);

  const secondTimer = window.setInterval(() => {
    onSecond();
  }, 1000);

  function frame(now) {
    const deltaSeconds = Math.min(0.1, (now - lastFrame) / 1000);
    lastFrame = now;
    onFrame(deltaSeconds, now / 1000);
    animationId = window.requestAnimationFrame(frame);
  }

  animationId = window.requestAnimationFrame(frame);

  return function stopGameLoop() {
    window.clearInterval(tickTimer);
    window.clearInterval(secondTimer);
    if (animationId) {
      window.cancelAnimationFrame(animationId);
    }
  };
}

