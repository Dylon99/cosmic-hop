import { buildTextures, buildAnimations } from '../assets/sprites.js';
import { LEVELS } from '../levels.js';
import { resetRun, setPlayers } from '../ui.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    buildTextures(this, LEVELS);
    buildAnimations(this);

    // ?level=2 jumps straight into a level (handy for testing), ?players=2 for co-op
    const params = new URLSearchParams(location.search);
    if (['1', '2'].includes(params.get('players'))) setPlayers(Number(params.get('players')));
    const param = Number(params.get('level'));
    if (param >= 1 && param <= LEVELS.length) {
      resetRun(this.registry);
      this.scene.start('Game', { level: param - 1 });
    } else {
      this.scene.start('Menu');
    }
  }
}
