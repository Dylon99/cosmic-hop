import { text, button, getHighScore, addBackdrop, updateBackdrop, pressToContinue, startRun } from '../ui.js';
import { sfx } from '../assets/sounds.js';
import { music } from '../assets/music.js';
import { DESIGN_W, fitUI, onViewChange } from '../view.js';
import { isTouchDevice } from '../input.js';
import { POWERS } from '../powers.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const w = DESIGN_W;
    fitUI(this);
    onViewChange(this, () => fitUI(this));
    this.backdrop = addBackdrop(this, 0);
    this.scroll = 0;
    music.play('menu');

    const title = text(this, w / 2, 110, 'COSMIC HOP', 56, '#ffd23f').setStroke('#7a2a00', 8);
    this.tweens.add({ targets: title, y: 122, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    text(this, w / 2, 178, 'a space platformer', 16, '#a8b0d8');

    // little parade of the cast
    const ground = 330;
    const hero = this.add.sprite(w / 2 - 150, ground, 'hero').play('hero-run');
    this.tweens.add({ targets: hero, y: ground - 70, duration: 380, yoyo: true, repeat: -1, repeatDelay: 500, ease: 'Quad.easeOut' });
    this.add.sprite(w / 2 - 50, ground, 'star');
    this.add.sprite(w / 2 + 10, ground, 'crystal');
    this.add.sprite(w / 2 + 80, ground, 'blob').play('blob-walk');
    this.add.sprite(w / 2 + 150, ground - 40, 'drone').play('drone-fly');
    this.add.sprite(w / 2 + 220, ground, 'crawler').play('crawler-walk').setFlipX(true);
    this.add.sprite(w / 2 - 240, ground, 'spitter');
    this.add.sprite(w / 2 + 230, ground - 80, 'swooper').play('swooper-fly');
    const hopper = this.add.sprite(w / 2 + 300, ground, 'hopper', 0).setFlipX(true);
    this.tweens.add({
      targets: hopper, y: ground - 50, duration: 300, yoyo: true, repeat: -1, repeatDelay: 700, ease: 'Quad.easeOut',
      onUpdate: () => hopper.setFrame(hopper.y < ground - 2 ? 1 : 0),
    });
    // the super power orbs, bobbing above the cast
    Object.keys(POWERS).forEach((name, i) => {
      const orb = this.add.image(w / 2 + 40 + (i - 2) * 56, 232, `power-${name}`);
      this.tweens.add({ targets: orb, y: 222, duration: 600, yoyo: true, repeat: -1, delay: i * 120, ease: 'Sine.easeInOut' });
    });
    text(this, w / 2 + 40, 268, 'GRAB ORBS FOR SUPER POWERS', 10, '#ff5ac8');
    // wide enough for ultrawide screens, which see past the 960px layout
    for (let x = -1440; x < w + 1440; x += 48) this.add.image(x, ground + 48, 'tiles', 0).setOrigin(0, 0.5);

    const help = isTouchDevice
      ? 'LEFT BUTTONS  move/drop     RIGHT SIDE  jump\nSTOMP aliens - but never the spiky ones!'
      : 'ARROWS / WASD  move     SPACE  jump     DOWN  drop\nSTOMP aliens - but never the spiky ones!\nP / ESC  pause and menu     M  mute';
    text(this, w / 2, 425, help, 12, '#d0d8e8').setLineSpacing(10);
    const prompt = text(this, w / 2 - 110, 500, isTouchDevice ? 'TAP TO START' : 'PRESS SPACE TO START', 16, '#41e0ff');
    const openLevels = () => {
      sfx.select();
      this.scene.start('LevelSelect');
    };
    button(this, w / 2 + 200, 500, isTouchDevice ? 'LEVELS' : 'L  LEVELS', openLevels, '#ffd23f', 14);
    this.input.keyboard.once('keydown-L', openLevels);
    this.tweens.add({ targets: prompt, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });
    text(this, w / 2, 545, `HIGH SCORE ${getHighScore()}`, 12, '#ffd23f');

    pressToContinue(this, ['SPACE', 'ENTER'], () => {
      sfx.select();
      startRun(this, 0);
    });
  }

  update(time, delta) {
    this.scroll += delta * 0.06;
    updateBackdrop(this.backdrop, this.cameras.main, this.scroll);
  }
}
