import { text, getHighScore, addBackdrop, updateBackdrop, pressToContinue } from '../ui.js';
import { sfx } from '../assets/sounds.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const w = this.scale.width;
    this.backdrop = addBackdrop(this, 0);
    this.scroll = 0;

    const title = text(this, w / 2, 110, 'COSMIC HOP', 56, '#ffd23f').setStroke('#7a2a00', 8);
    this.tweens.add({ targets: title, y: 122, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    text(this, w / 2, 178, 'a space platformer', 14, '#a8b0d8');

    // little parade of the cast
    const ground = 330;
    const hero = this.add.sprite(w / 2 - 150, ground, 'hero').play('hero-run');
    this.tweens.add({ targets: hero, y: ground - 70, duration: 380, yoyo: true, repeat: -1, repeatDelay: 500, ease: 'Quad.easeOut' });
    this.add.sprite(w / 2 - 50, ground, 'star');
    this.add.sprite(w / 2 + 10, ground, 'crystal');
    this.add.sprite(w / 2 + 80, ground, 'blob').play('blob-walk');
    this.add.sprite(w / 2 + 150, ground - 40, 'drone').play('drone-fly');
    this.add.sprite(w / 2 + 220, ground, 'crawler').play('crawler-walk').setFlipX(true);
    for (let x = 0; x < w; x += 48) this.add.image(x, ground + 48, 'tiles', 0).setOrigin(0, 0.5);

    text(this, w / 2, 420, 'ARROWS / WASD  move     SPACE  jump\nSTOMP aliens - but never the spiky ones!\nP  pause     M  mute', 12, '#d0d8e8')
      .setLineSpacing(10);
    const prompt = text(this, w / 2, 500, 'PRESS SPACE TO START', 18, '#41e0ff');
    this.tweens.add({ targets: prompt, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });
    text(this, w / 2, 545, `HIGH SCORE ${getHighScore()}`, 12, '#ffd23f');

    pressToContinue(this, ['SPACE', 'ENTER'], () => {
      sfx.select();
      this.registry.set({ score: 0, lives: 3 });
      this.scene.start('Game', { level: 0 });
    });
  }

  update(time, delta) {
    this.scroll += delta * 0.06;
    updateBackdrop(this.backdrop, this.scroll);
  }
}
