import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import HUDScene from './scenes/HUDScene.js';
import LevelCompleteScene from './scenes/LevelCompleteScene.js';
import GameOverScene from './scenes/GameOverScene.js';

// Wait for the pixel font so the first text isn't drawn in a fallback font.
try {
  await Promise.race([document.fonts.load('16px "Press Start 2P"'), new Promise((r) => setTimeout(r, 2000))]);
} catch {
  // fall back to monospace
}

window.game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 960,
  height: 576,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#0b0d1e',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1600 }, tileBias: 32, debug: false },
  },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, MenuScene, GameScene, HUDScene, LevelCompleteScene, GameOverScene],
});
