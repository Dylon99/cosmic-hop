import { LEVELS } from '../levels.js';
import { text, addBackdrop, saveHighScore, pressToContinue } from '../ui.js';
import { sfx } from '../assets/sounds.js';

export default class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super('LevelComplete');
  }

  create({ level, breakdown }) {
    const w = this.scale.width;
    const last = level === LEVELS.length - 1;
    addBackdrop(this, level);
    this.cameras.main.fadeIn(300);

    text(this, w / 2, 90, last ? 'MISSION COMPLETE!' : 'LEVEL CLEAR!', 40, '#ffd23f').setStroke('#7a2a00', 8);
    text(this, w / 2, 145, LEVELS[level].name, 16, '#a8b0d8');

    const lines = [
      ['STARS', breakdown.stars, '#ffd23f'],
      ['CRYSTALS', breakdown.crystals, '#41e0ff'],
      ['LEVEL BONUS', `+${breakdown.clear}`, '#ffffff'],
      ['TIME BONUS', `+${breakdown.time}`, '#ffffff'],
      ['ALL STARS BONUS', breakdown.allStars ? `+${breakdown.allStars}` : '-', '#b8ff9a'],
      ['TOTAL SCORE', String(this.registry.get('score')), '#ff5ac8'],
    ];
    lines.forEach(([label, value, color], i) => {
      const y = 210 + i * 42 + (i === lines.length - 1 ? 18 : 0);
      this.time.delayedCall(250 + i * 220, () => {
        text(this, 270, y, label, 16, '#d0d8e8').setOrigin(0, 0.5);
        text(this, w - 270, y, value, 16, color).setOrigin(1, 0.5);
        sfx.select();
      });
    });

    const isRecord = last && saveHighScore(this.registry.get('score'));
    this.time.delayedCall(250 + lines.length * 220 + 300, () => {
      if (isRecord) text(this, w / 2, 490, 'NEW HIGH SCORE!', 18, '#ffd23f');
      const prompt = text(this, w / 2, 530, last ? 'PRESS SPACE FOR MENU' : 'PRESS SPACE FOR NEXT LEVEL', 16, '#41e0ff');
      this.tweens.add({ targets: prompt, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });
      pressToContinue(this, ['SPACE', 'ENTER'], () => {
        sfx.select();
        if (last) this.scene.start('Menu');
        else this.scene.start('Game', { level: level + 1 });
      });
    });
  }
}
