import { text, button, addBackdrop, updateBackdrop, getHighScore, saveHighScore, pressToContinue } from '../ui.js';
import { sfx } from '../assets/sounds.js';
import { DESIGN_W, fitUI, onViewChange } from '../view.js';
import { isTouchDevice } from '../input.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create({ level }) {
    const w = DESIGN_W;
    const score = this.registry.get('score');
    const isRecord = saveHighScore(score);
    const backdrop = addBackdrop(this, level);
    const fit = () => {
      fitUI(this);
      updateBackdrop(backdrop, this.cameras.main, 0);
    };
    fit();
    onViewChange(this, fit);
    this.cameras.main.fadeIn(400);

    const hero = this.add.sprite(w / 2, 130, 'hero', 6).setTint(0xff9090);
    this.tweens.add({ targets: hero, angle: 360, y: 150, duration: 3000, repeat: -1 });

    text(this, w / 2, 240, 'GAME OVER', 48, '#e43b44').setStroke('#3a0010', 8);
    text(this, w / 2, 320, `SCORE ${score}`, 24);
    text(this, w / 2, 360, isRecord ? 'NEW HIGH SCORE!' : `HIGH SCORE ${getHighScore()}`, 16, '#ffd23f');

    const retry = () => {
      sfx.select();
      this.registry.set({ score: 0, lives: 3 });
      this.scene.start('Game', { level });
    };
    const menu = () => this.scene.start('Menu');
    button(this, w / 2 - 130, 450, `RETRY LEVEL ${level + 1}`, retry);
    button(this, w / 2 + 150, 450, 'MENU', menu, '#a8b0d8');
    if (!isTouchDevice) text(this, w / 2, 515, 'SPACE  retry     ESC  menu', 12, '#a8b0d8');

    this.input.keyboard.once('keydown-ESC', menu);
    pressToContinue(this, ['SPACE', 'ENTER'], retry, false);
  }
}
