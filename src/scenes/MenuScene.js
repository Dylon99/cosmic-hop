import { text, getHighScore, addBackdrop, updateBackdrop, pressToContinue } from '../ui.js';
import { sfx } from '../assets/sounds.js';
import { DESIGN_W, fitUI, onViewChange } from '../view.js';
import { isTouchDevice } from '../input.js';

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
    // wide enough for ultrawide screens, which see past the 960px layout
    for (let x = -1440; x < w + 1440; x += 48) this.add.image(x, ground + 48, 'tiles', 0).setOrigin(0, 0.5);

    const help = isTouchDevice
      ? 'LEFT BUTTONS  move     RIGHT SIDE  jump\nSTOMP aliens - but never the spiky ones!'
      : 'ARROWS / WASD  move     SPACE  jump\nSTOMP aliens - but never the spiky ones!\nP  pause     M  mute';
    text(this, w / 2, 425, help, 12, '#d0d8e8').setLineSpacing(10);
    const prompt = text(this, w / 2, 500, isTouchDevice ? 'TAP TO START' : 'PRESS SPACE TO START', 16, '#41e0ff');
    this.tweens.add({ targets: prompt, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });
    text(this, w / 2, 545, `HIGH SCORE ${getHighScore()}`, 12, '#ffd23f');

    pressToContinue(this, ['SPACE', 'ENTER'], () => {
      sfx.select();
      // hide the browser bars on phones that allow it (not iPhone Safari)
      if (isTouchDevice && this.scale.fullscreen.available && !this.scale.isFullscreen) {
        try {
          this.scale.startFullscreen();
        } catch {
          // not allowed here - play in the normal browser view
        }
      }
      this.registry.set({ score: 0, lives: 3 });
      this.scene.start('Game', { level: 0 });
    });
  }

  update(time, delta) {
    this.scroll += delta * 0.06;
    updateBackdrop(this.backdrop, this.cameras.main, this.scroll);
  }
}
