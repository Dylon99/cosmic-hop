import { LEVELS } from '../levels.js';
import { TILE_INDEX, groundTiles } from '../assets/sprites.js';
import { text, button, addBackdrop, updateBackdrop, startRun } from '../ui.js';
import { sfx } from '../assets/sounds.js';
import { music } from '../assets/music.js';
import { DESIGN_W, fitUI, onViewChange } from '../view.js';
import { isTouchDevice } from '../input.js';

const COLS = 4;
const CARD_W = 190, CARD_H = 120, GAP_X = 30;
const ROW_Y = [215, 395];

// A card per level previewing its sky, planet and ground. Pick with the
// arrows and Space, a number key, or a click / tap.
export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelect');
  }

  create() {
    const w = DESIGN_W;
    this.backdrop = addBackdrop(this, 0);
    const fit = () => {
      fitUI(this);
      updateBackdrop(this.backdrop, this.cameras.main, 0);
    };
    fit();
    onViewChange(this, fit);
    this.cameras.main.fadeIn(250);
    music.play('menu');

    text(this, w / 2, 75, 'SELECT LEVEL', 32, '#ffd23f').setStroke('#7a2a00', 6);
    button(this, 80, 75, 'BACK', () => this.back(), '#a8b0d8', 12);

    const left = (w - (COLS * CARD_W + (COLS - 1) * GAP_X)) / 2 + CARD_W / 2;
    this.cards = LEVELS.map((lvl, i) => this.addCard(lvl, i, left + (i % COLS) * (CARD_W + GAP_X), ROW_Y[Math.floor(i / COLS)]));
    // Phaser reuses this scene object, so reset state from the last visit
    this.starting = false;
    this.selected = 0;
    this.select(0);

    const hint = isTouchDevice ? 'TAP A LEVEL TO PLAY' : 'ARROWS choose   SPACE play   1-8 jump in   ESC back';
    text(this, w / 2, 540, hint, 12, '#d0d8e8');

    const kb = this.input.keyboard;
    kb.on('keydown-LEFT', () => this.select(this.selected - 1));
    kb.on('keydown-RIGHT', () => this.select(this.selected + 1));
    kb.on('keydown-UP', () => this.select(this.selected - COLS));
    kb.on('keydown-DOWN', () => this.select(this.selected + COLS));
    kb.on('keydown-SPACE', () => this.play(this.selected));
    kb.on('keydown-ENTER', () => this.play(this.selected));
    kb.on('keydown-ESC', () => this.back());
    kb.on('keydown', (e) => {
      const n = Number(e.key);
      if (n >= 1 && n <= LEVELS.length) this.play(n - 1);
    });
  }

  addCard(lvl, i, x, y) {
    const hull = lvl.map.some((row) => row.includes('%'));
    const tile = hull ? TILE_INDEX.hullTop : groundTiles(lvl.ground).top;
    const frame = this.add.rectangle(0, 0, CARD_W, CARD_H).setStrokeStyle(4, 0x454b70)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.select(i))
      .on('pointerdown', (pointer, lx, ly, event) => {
        event.stopPropagation();
        this.play(i);
      });
    // card contents are relative to its centre so the whole card can grow
    const card = this.add.container(x, y, [
      this.add.image(0, 0, `sky-${i}`).setDisplaySize(CARD_W, CARD_H),
      this.add.image(50, -CARD_H / 2 + 34, `planet-${i}`),
      this.add.tileSprite(0, CARD_H / 2 - 14, CARD_W, 28, 'tiles', tile).setTileScale(0.6),
      text(this, -CARD_W / 2 + 22, -CARD_H / 2 + 24, String(i + 1), 24, '#ffffff').setStroke('#05060f', 6),
      frame,
    ]);
    const name = text(this, x, y + CARD_H / 2 + 22, lvl.name, 10, '#a8b0d8');
    return { card, frame, name };
  }

  select(i) {
    const n = this.cards.length;
    const next = ((i % n) + n) % n;
    if (next !== this.selected) sfx.select();
    this.selected = next;
    this.cards.forEach((card, j) => {
      const on = j === next;
      card.frame.setStrokeStyle(4, on ? 0xffd23f : 0x454b70);
      card.name.setColor(on ? '#ffd23f' : '#a8b0d8');
      card.card.setDepth(on ? 1 : 0);
      this.tweens.killTweensOf(card.card);
      this.tweens.add({ targets: card.card, scale: on ? 1.08 : 1, duration: 120 });
    });
  }

  play(i) {
    if (this.starting) return;
    this.starting = true;
    sfx.select();
    startRun(this, i);
  }

  back() {
    this.scene.start('Menu');
  }
}
