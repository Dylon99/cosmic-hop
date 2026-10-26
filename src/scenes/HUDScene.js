import { FONT, text } from '../ui.js';
import { toggleMute, isMuted } from '../assets/sounds.js';

const MAX_HEARTS = 5;

export default class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUD');
  }

  create() {
    const r = this.registry;
    this.add.rectangle(0, 0, this.scale.width, 44, 0x000000, 0.45).setOrigin(0);

    this.hearts = Array.from({ length: MAX_HEARTS }, (_, i) => this.add.image(24 + i * 30, 22, 'heart-icon').setOrigin(0.5));
    const style = { fontFamily: FONT, fontSize: '16px', color: '#ffffff' };
    this.score = this.add.text(190, 22, '', style).setOrigin(0, 0.5);
    this.add.image(470, 22, 'star-icon');
    this.stars = this.add.text(490, 22, '', { ...style, color: '#ffd23f' }).setOrigin(0, 0.5);
    this.add.image(620, 22, 'crystal-icon');
    this.crystals = this.add.text(640, 22, '', { ...style, color: '#41e0ff' }).setOrigin(0, 0.5);
    this.time_ = this.add.text(this.scale.width - 20, 22, '', style).setOrigin(1, 0.5);
    this.muteIcon = this.add.text(this.scale.width - 20, 60, '', { ...style, fontSize: '10px', color: '#a8b0d8' }).setOrigin(1, 0.5);

    this.pauseText = text(this, this.scale.width / 2, this.scale.height / 2, 'PAUSED\n\nP to resume', 28, '#ffd23f')
      .setLineSpacing(8).setVisible(false);
    this.input.keyboard.on('keydown-P', () => {
      const game = this.scene.get('Game');
      if (this.scene.isPaused('Game')) game.scene.resume();
      else game.scene.pause();
      this.pauseText.setVisible(this.scene.isPaused('Game'));
    });
    this.input.keyboard.on('keydown-M', () => toggleMute());
    this.last = {};
    this.refresh(r);
  }

  refresh(r) {
    const v = {
      score: r.get('score'), lives: r.get('lives'), time: r.get('time'), muted: isMuted(),
      stars: `${r.get('stars')}/${r.get('starsTotal')}`, crystals: `${r.get('crystals')}/${r.get('crystalsTotal')}`,
    };
    if (v.score !== this.last.score) this.score.setText(`SCORE ${String(v.score).padStart(6, '0')}`);
    if (v.stars !== this.last.stars) this.stars.setText(v.stars);
    if (v.crystals !== this.last.crystals) this.crystals.setText(v.crystals);
    if (v.time !== this.last.time) this.time_.setText(`TIME ${v.time}`).setColor(v.time <= 20 ? '#e43b44' : '#ffffff');
    if (v.lives !== this.last.lives) this.hearts.forEach((h, i) => h.setVisible(i < v.lives));
    if (v.muted !== this.last.muted) this.muteIcon.setText(v.muted ? 'MUTED (M)' : '');
    this.last = v;
  }

  update() {
    this.refresh(this.registry);
  }
}
