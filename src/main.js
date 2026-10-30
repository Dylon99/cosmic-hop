import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import HUDScene from './scenes/HUDScene.js';
import LevelCompleteScene from './scenes/LevelCompleteScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import LevelSelectScene from './scenes/LevelSelectScene.js';
import { isTouchDevice } from './input.js';

// Wait for the pixel font so the first text isn't drawn in a fallback font.
try {
  await Promise.race([document.fonts.load('16px "Press Start 2P"'), new Promise((r) => setTimeout(r, 2000))]);
} catch {
  // fall back to monospace
}

if (isTouchDevice) document.body.classList.add('touch');

// The canvas matches the screen's real pixels (capped at 2x for speed) and is
// shown at CSS size, so nothing gets stretched or blurred. Scenes zoom their
// cameras to turn this into game units (see view.js).
const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);
const canvasSize = () => ({
  width: Math.round(window.innerWidth * pixelRatio()),
  height: Math.round(window.innerHeight * pixelRatio()),
});

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  ...canvasSize(),
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#0b0d1e',
  input: { activePointers: 4 },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1600 }, tileBias: 32, debug: false },
  },
  scale: { mode: Phaser.Scale.NONE, zoom: 1 / pixelRatio() },
  scene: [BootScene, MenuScene, LevelSelectScene, GameScene, HUDScene, LevelCompleteScene, GameOverScene],
});
window.game = game;

const isPortrait = () => window.innerHeight > window.innerWidth;

function applySize() {
  const { width, height } = canvasSize();
  if (width === game.scale.width && height === game.scale.height) return;
  game.scale.setZoom(1 / pixelRatio());
  game.scale.resize(width, height);
  // phones only play in landscape: turning to portrait shows the rotate
  // message (pure CSS) and pauses the level until the player resumes
  if (isTouchDevice && isPortrait() && game.scene.isActive('Game')) game.scene.pause('Game');
}

let resizeTimer;
const scheduleResize = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(applySize, 100);
};
window.addEventListener('resize', scheduleResize);
window.addEventListener('orientationchange', scheduleResize);
