import { buildTextures, buildAnimations } from '../assets/sprites.js';
import { LEVELS } from '../levels.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    buildTextures(this, LEVELS);
    buildAnimations(this);

    // ?level=2 jumps straight into a level (handy for testing)
    const param = Number(new URLSearchParams(location.search).get('level'));
    if (param >= 1 && param <= LEVELS.length) {
      this.registry.set({ score: 0, lives: 3 });
      this.scene.start('Game', { level: param - 1 });
    } else {
      this.scene.start('Menu');
    }
  }
}
