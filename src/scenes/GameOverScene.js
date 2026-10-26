import { text, addBackdrop, getHighScore, saveHighScore, pressToContinue } from '../ui.js';
import { sfx } from '../assets/sounds.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create({ level }) {
    const w = this.scale.width;
    const score = this.registry.get('score');
    const isRecord = saveHighScore(score);
    addBackdrop(this, level);
    this.cameras.main.fadeIn(400);

    const hero = this.add.sprite(w / 2, 130, 'hero', 6).setTint(0xff9090);
    this.tweens.add({ targets: hero, angle: 360, y: 150, duration: 3000, repeat: -1 });

    text(this, w / 2, 240, 'GAME OVER', 48, '#e43b44').setStroke('#3a0010', 8);
    text(this, w / 2, 320, `SCORE ${score}`, 20);
    text(this, w / 2, 360, isRecord ? 'NEW HIGH SCORE!' : `HIGH SCORE ${getHighScore()}`, 14, '#ffd23f');

    const prompt = text(this, w / 2, 450, `SPACE  retry level ${level + 1}`, 16, '#41e0ff');
    this.tweens.add({ targets: prompt, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });
    text(this, w / 2, 490, 'ESC  main menu', 12, '#a8b0d8');

    this.input.keyboard.once('keydown-ESC', () => this.scene.start('Menu'));
    pressToContinue(this, ['SPACE', 'ENTER'], () => {
      sfx.select();
      this.registry.set({ score: 0, lives: 3 });
      this.scene.start('Game', { level });
    });
  }
}
