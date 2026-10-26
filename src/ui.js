export const FONT = '"Press Start 2P", monospace';

export const text = (scene, x, y, str, size = 16, color = '#ffffff') =>
  scene.add.text(x, y, str, { fontFamily: FONT, fontSize: `${size}px`, color, align: 'center' })
    .setOrigin(0.5)
    .setShadow(3, 3, '#000000', 0, false, true);

const HIGH_KEY = 'cosmic-hop-highscore';

export function getHighScore() {
  try {
    return Number(localStorage.getItem(HIGH_KEY)) || 0;
  } catch {
    return 0;
  }
}

// Returns true when the score is a new record.
export function saveHighScore(score) {
  if (score <= getHighScore()) return false;
  try {
    localStorage.setItem(HIGH_KEY, String(score));
  } catch {
    // storage blocked (private mode etc.) - keep playing without it
  }
  return true;
}

// Sky gradient, two parallax star layers and a planet. Layers with
// scrollFactor 0 are moved manually in updateBackdrop().
export function addBackdrop(scene, level) {
  const w = scene.scale.width, h = scene.scale.height;
  scene.add.image(0, 0, `sky-${level}`).setOrigin(0).setScrollFactor(0).setDepth(-10);
  const far = scene.add.tileSprite(0, 0, w, h, 'stars-far').setOrigin(0).setScrollFactor(0).setDepth(-9);
  const planet = scene.add.image(w * 0.72, h * 0.28, `planet-${level}`).setScale(3).setScrollFactor(0.04, 0).setDepth(-8);
  const near = scene.add.tileSprite(0, 0, w, h, 'stars-near').setOrigin(0).setScrollFactor(0).setDepth(-7);
  return { far, near, planet };
}

export function updateBackdrop(backdrop, scrollX) {
  backdrop.far.tilePositionX = scrollX * 0.08;
  backdrop.near.tilePositionX = scrollX * 0.25;
}

export function pressToContinue(scene, keys, cb) {
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    cb();
  };
  keys.forEach((k) => scene.input.keyboard.once(`keydown-${k}`, go));
  scene.input.once('pointerdown', go);
}
