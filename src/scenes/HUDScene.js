import { FONT, text, button } from '../ui.js';
import { toggleMute, isMuted } from '../assets/sounds.js';
import { music } from '../assets/music.js';
import { fitOverlay, onViewChange, safeInsets, textResolution } from '../view.js';
import { touch, isTouchDevice } from '../input.js';
import { POWERS } from '../powers.js';

const MAX_HEARTS = 3;
const BAR_H = 44;

export default class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUD');
  }

  create() {
    this.view = fitOverlay(this);
    this.bar = this.add.rectangle(0, 0, 10, BAR_H, 0x000000, 0.45).setOrigin(0);

    this.hearts = Array.from({ length: MAX_HEARTS }, () => this.add.image(0, BAR_H / 2, 'heart-icon'));
    const label = (color) => this.add.text(0, BAR_H / 2, '', {
      fontFamily: FONT, fontSize: '16px', color, resolution: textResolution(this),
    }).setOrigin(0, 0.5);
    this.score = label('#ffffff');
    this.starIcon = this.add.image(0, BAR_H / 2, 'star-icon');
    this.stars = label('#ffd23f');
    this.crystalIcon = this.add.image(0, BAR_H / 2, 'crystal-icon');
    this.crystals = label('#41e0ff');
    this.timer = label('#ffffff');

    const iconButton = (key, onPress) => this.add.image(0, BAR_H / 2, key, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', (p, x, y, event) => {
        event.stopPropagation();
        onPress();
      });
    // active super powers: an icon each, with a bar showing the time left
    this.powerIcons = Object.fromEntries(Object.keys(POWERS).map((name) =>
      [name, this.add.image(0, 0, `power-${name}-icon`).setVisible(false)]));
    this.powerBars = this.add.graphics();
    this.pauseBtn = iconButton('btn-pause', () => this.togglePause());
    this.muteBtn = iconButton('btn-sound', () => toggleMute());

    if (isTouchDevice) {
      this.pads = {
        left: this.add.image(0, 0, 'btn-left', 0),
        right: this.add.image(0, 0, 'btn-right', 0),
        jump: this.add.image(0, 0, 'btn-jump', 0),
        down: this.add.image(0, 0, 'btn-down', 0),
      };
    }

    this.pauseLayer = [
      this.add.rectangle(0, 0, 10, 10, 0x05060f, 0.6).setOrigin(0),
      text(this, 0, 0, 'PAUSED', 32, '#ffd23f'),
      ...(isTouchDevice ? [] : [text(this, 0, 0, 'P / ESC resume     L levels     Q main menu', 12, '#a8b0d8')]),
    ];
    this.pauseButtons = [
      button(this, 0, 0, 'RESUME', () => this.togglePause()),
      button(this, 0, 0, 'LEVELS', () => this.leaveTo('LevelSelect'), '#ffd23f'),
      button(this, 0, 0, 'MAIN MENU', () => this.leaveTo('Menu'), '#a8b0d8'),
    ];
    // Phaser reuses this scene object for every level, so reset the pause
    // state here rather than relying on what the last level left behind
    this.pauseLayer.forEach((o) => o.setVisible(false));
    this.pauseButtons.forEach((b) => b.setVisible(false));
    this.wasPaused = false;

    const r = this.registry;
    this.banner = text(this, 0, 0, `LEVEL ${r.get('level')}\n${r.get('levelName')}`, 32, '#ffd23f').setLineSpacing(16);
    this.tweens.add({ targets: this.banner, alpha: 0, delay: 1600, duration: 600, onComplete: () => this.banner.destroy() });

    this.input.keyboard.on('keydown-P', () => this.togglePause());
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard.on('keydown-Q', () => this.scene.isPaused('Game') && this.leaveTo('Menu'));
    this.input.keyboard.on('keydown-L', () => this.scene.isPaused('Game') && this.leaveTo('LevelSelect'));
    this.input.keyboard.on('keydown-M', () => toggleMute());
    this.events.once('shutdown', () => Object.assign(touch, { left: false, right: false, jump: false, down: false }));

    this.last = {};
    this.layout();
    onViewChange(this, () => {
      this.view = fitOverlay(this);
      this.layout();
    });
  }

  // Quit the level (from the pause screen) to the menu or level select.
  leaveTo(key) {
    this.scene.stop('Game');
    this.scene.start(key);
  }

  togglePause() {
    if (!this.scene.isActive('Game') && !this.scene.isPaused('Game')) return;
    if (this.scene.isPaused('Game')) this.scene.resume('Game');
    else this.scene.pause('Game');
  }

  layout() {
    const { w, h } = this.view;
    const safe = safeInsets(this);
    const left = 16 + safe.left, right = w - 16 - safe.right;
    this.left = left;
    this.bar.setSize(w, BAR_H);

    // top bar: lives and score on the left, everything else flows in from the right
    this.hearts.forEach((heart, i) => heart.setPosition(left + 12 + i * 30, BAR_H / 2));
    this.score.setX(left + MAX_HEARTS * 30 + 16);
    // narrow screens: shrink the bar text, then drop the "SCORE" label
    for (const compact of [0, 1, 2]) {
      this.compact = compact;
      [this.score, this.stars, this.crystals, this.timer].forEach((t) => t.setFontSize(compact ? 12 : 16));
      this.score.setText(this.scoreText(this.registry.get('score')));
      let x = right;
      for (const [item, gap] of [[this.pauseBtn, 10], [this.muteBtn, 24], [this.timer, 24], [this.crystals, 8],
        [this.crystalIcon, compact ? 16 : 24], [this.stars, 8], [this.starIcon, 0]]) {
        item.setOrigin(1, 0.5).setX(x);
        x -= item.displayWidth + gap;
      }
      if (x > this.score.x + this.score.displayWidth + 16) break;
    }

    if (this.pads) {
      const bottom = h - 24 - safe.bottom;
      this.pads.left.setPosition(left + 52, bottom - 48);
      this.pads.right.setPosition(left + 172, bottom - 48);
      this.pads.jump.setPosition(right - 56, bottom - 52);
      this.pads.down.setPosition((this.pads.left.x + this.pads.right.x) / 2, bottom - 150);
    }

    this.pauseLayer[0].setSize(w, h);
    this.pauseLayer[1].setPosition(w / 2, h / 2 - 120);
    this.pauseLayer[2]?.setPosition(w / 2, h / 2 + 130);
    this.pauseButtons.forEach((b, i) => {
      const y = h / 2 - 45 + i * 64;
      b.frame.setPosition(w / 2, y);
      b.text.setPosition(w / 2, y);
    });
    if (this.banner.active) this.banner.setPosition(w / 2, h * 0.38);
  }

  scoreText(score) {
    const digits = String(score).padStart(6, '0');
    return this.compact === 2 ? digits : `SCORE ${digits}`;
  }

  refresh(r) {
    const v = {
      score: r.get('score'), lives: r.get('lives'), time: r.get('time'), muted: isMuted(),
      stars: `${r.get('stars')}/${r.get('starsTotal')}`, crystals: `${r.get('crystals')}/${r.get('crystalsTotal')}`,
    };
    const changed = (k) => v[k] !== this.last[k];
    if (changed('score')) this.score.setText(this.scoreText(v.score));
    if (changed('stars')) this.stars.setText(v.stars);
    if (changed('crystals')) this.crystals.setText(v.crystals);
    if (changed('time')) this.timer.setText(`TIME ${v.time}`).setColor(v.time <= 20 ? '#e43b44' : '#ffffff');
    if (changed('lives')) this.hearts.forEach((heart, i) => heart.setVisible(i < v.lives));
    if (changed('muted')) this.muteBtn.setTexture(v.muted ? 'btn-muted' : 'btn-sound', 0);
    if (changed('stars') || changed('crystals') || changed('time')) this.layout();
    this.last = v;
  }

  drawPowers(powers, time) {
    const g = this.powerBars.clear();
    Object.values(this.powerIcons).forEach((icon) => icon.setVisible(false));
    powers.forEach(([name, left], i) => {
      const x = this.left + 20 + i * 44, y = BAR_H + 24;
      // blink for the last couple of seconds
      const { time: total } = POWERS[name];
      const ending = total && left * total < 2 && Math.floor(time / 120) % 2;
      this.powerIcons[name].setPosition(x, y).setVisible(true).setAlpha(ending ? 0.35 : 1);
      if (!total) return;
      g.fillStyle(0x000000, 0.55).fillRect(x - 17, y + 21, 34, 6);
      g.fillStyle(Phaser.Display.Color.HexStringToColor(POWERS[name].color).color, 1).fillRect(x - 16, y + 22, 32 * left, 4);
    });
  }

  // Every finger currently on the screen counts, so you can hold a direction
  // and jump at the same time, or slide between the arrows. The area above
  // the arrows is the down button (drop through platforms).
  updateTouch() {
    const state = { left: false, right: false, jump: false, down: false };
    const paused = this.scene.isPaused('Game');
    if (this.pads && !paused) {
      const { w, h } = this.view;
      const split = (this.pads.left.x + this.pads.right.x) / 2;
      for (const p of this.input.manager.pointers) {
        if (!p.isDown) continue;
        const { x, y } = this.cameras.main.getWorldPoint(p.x, p.y);
        if (y < BAR_H + 10) continue;
        if (x >= w / 2) state.jump = true; // right half of the screen jumps
        else if (y > (this.pads.down.y + this.pads.left.y) / 2) state[x < split ? 'left' : 'right'] = true;
        else if (y > h * 0.3) state.down = true;
      }
      for (const [name, pad] of Object.entries(this.pads)) {
        pad.setFrame(state[name] ? 1 : 0).setAlpha(state[name] ? 0.9 : 0.5);
      }
    }
    Object.assign(touch, state);
  }

  update(time) {
    this.refresh(this.registry);
    this.drawPowers(this.registry.get('powers') || [], time);
    this.updateTouch();
    const paused = this.scene.isPaused('Game');
    if (paused !== this.wasPaused) {
      this.pauseLayer.forEach((o) => o.setVisible(paused));
      this.pauseButtons.forEach((b) => b.setVisible(paused));
      music.setPaused(paused);
      this.pauseBtn.setFrame(paused ? 1 : 0);
      this.wasPaused = paused;
    }
  }
}
