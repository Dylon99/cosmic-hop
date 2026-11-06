import { LEVELS } from '../levels.js';
import { text, addBackdrop, updateBackdrop, saveHighScore, pressToContinue, PLAYER_COLORS, leader } from '../ui.js';
import { sfx } from '../assets/sounds.js';
import { DESIGN_W, fitUI, onViewChange } from '../view.js';
import { isTouchDevice } from '../input.js';

export default class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super('LevelComplete');
  }

  create({ level, breakdown }) {
    const w = DESIGN_W;
    const last = level === LEVELS.length - 1;
    const backdrop = addBackdrop(this, level);
    const fit = () => {
      fitUI(this);
      updateBackdrop(backdrop, this.cameras.main, 0);
    };
    fit();
    onViewChange(this, fit);
    this.cameras.main.fadeIn(300);

    text(this, w / 2, 90, last ? 'MISSION COMPLETE!' : 'LEVEL CLEAR!', 40, '#ffd23f').setStroke('#7a2a00', 8);
    text(this, w / 2, 145, LEVELS[level].name, 16, '#a8b0d8');

    const r = this.registry;
    const twoPlayer = r.get('players') === 2;
    const lines = [
      ['STARS', breakdown.stars, '#ffd23f'],
      ['CRYSTALS', breakdown.crystals, '#41e0ff'],
      ['LEVEL BONUS', `+${breakdown.clear}`, '#ffffff'],
      ['TIME BONUS', `+${breakdown.time}`, '#ffffff'],
      ['ALL STARS BONUS', breakdown.allStars ? `+${breakdown.allStars}` : '-', '#b8ff9a'],
      ['TOTAL SCORE', String(r.get('score')), '#ff5ac8'],
      // two players: each one's own score so far this run
      ...(twoPlayer ? PLAYER_COLORS.map((color, i) => [`PLAYER ${i + 1}`, String(r.get(`score${i + 1}`)), color]) : []),
    ];
    const totalLine = 5;
    // two players have two more lines to fit in, so they sit closer together
    const [top, gap] = twoPlayer ? [192, 34] : [210, 42];
    lines.forEach(([label, value, color], i) => {
      const y = top + i * gap + (i >= totalLine ? 18 : 0) + (i > totalLine ? 12 : 0);
      this.time.delayedCall(250 + i * 220, () => {
        text(this, 270, y, label, 16, '#d0d8e8').setOrigin(0, 0.5);
        text(this, w - 270, y, value, 16, color).setOrigin(1, 0.5);
        sfx.select();
      });
    });

    const isRecord = last && saveHighScore(r.get('score'));
    this.time.delayedCall(250 + lines.length * 220 + 300, () => {
      const notes = [];
      if (twoPlayer) {
        const lead = leader(r);
        if (lead < 0) notes.push([last ? 'IT\'S A TIE!' : 'ALL SQUARE', '#ffffff']);
        else notes.push([`PLAYER ${lead + 1} ${last ? 'WINS!' : 'LEADS'}`, PLAYER_COLORS[lead]]);
      }
      if (isRecord) notes.push(['NEW HIGH SCORE!', '#ffd23f']);
      notes.forEach(([str, color], i) => {
        const x = notes.length > 1 ? w / 2 + (i ? 1 : -1) * 190 : w / 2;
        text(this, x, 490, str, notes.length > 1 ? 14 : 18, color);
      });
      const action = isTouchDevice ? 'TAP' : 'PRESS SPACE';
      const prompt = text(this, w / 2, 530, `${action} FOR ${last ? 'MENU' : 'NEXT LEVEL'}`, 16, '#41e0ff');
      this.tweens.add({ targets: prompt, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });
      pressToContinue(this, ['SPACE', 'ENTER'], () => {
        sfx.select();
        if (last) this.scene.start('Menu');
        else this.scene.start('Game', { level: level + 1 });
      });
    });
  }
}
