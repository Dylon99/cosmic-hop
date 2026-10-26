import { LEVELS } from '../levels.js';
import { TILE, TILE_INDEX } from '../assets/sprites.js';
import { sfx } from '../assets/sounds.js';
import { text, addBackdrop, updateBackdrop } from '../ui.js';
import Player from '../entities/Player.js';
import { Blob, Crawler, Drone } from '../entities/enemies.js';

const POINTS = { star: 10, crystal: 50, stomp: 100, clear: 500, perSecond: 5, allStars: 250 };

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create({ level = 0 }) {
    this.levelIndex = level;
    const L = LEVELS[level];
    const rows = L.map;
    const H = rows.length, W = rows[0].length;
    this.worldW = W * TILE;
    this.worldH = H * TILE;
    this.finished = false;
    this.timeLeft = L.time;

    this.backdrop = addBackdrop(this, level);
    this.buildTilemap(rows);
    this.createEffects();

    this.pickups = this.add.group();
    this.walkers = this.add.group({ runChildUpdate: true });
    this.drones = this.add.group({ runChildUpdate: true });
    this.spikes = [];
    this.beacons = [];
    let start = { x: TILE, y: TILE * 9 };
    let stars = 0, crystals = 0;

    rows.forEach((row, ty) => [...row].forEach((ch, tx) => {
      const x = tx * TILE + TILE / 2, y = ty * TILE + TILE / 2;
      switch (ch) {
        case 'P': start = { x, y }; break;
        case '*': this.addPickup(x, y, 'star'); stars++; break;
        case '$': this.addPickup(x, y, 'crystal'); crystals++; break;
        case 'b': this.walkers.add(new Blob(this, x, y)); break;
        case 'c': this.walkers.add(new Crawler(this, x, y)); break;
        case 'd': this.drones.add(new Drone(this, x, y)); break;
        case '^':
          this.add.image(x, y, 'spike').setDepth(4);
          this.spikes.push(new Phaser.Geom.Rectangle(x - 18, y + 6, 36, 18));
          break;
        case 'C':
          this.beacons.push(this.add.sprite(x, y, 'beacon', 0).setDepth(3));
          break;
        case 'R':
          this.rocket = this.add.sprite(x, (ty + 1) * TILE, 'rocket', 0).setOrigin(0.5, 1).setDepth(6);
          this.rocketZone = new Phaser.Geom.Rectangle(x - 24, (ty + 1) * TILE - 60, 48, 60);
          break;
      }
    }));
    this.respawnPoint = start;

    this.player = new Player(this, start.x, start.y);
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH, true, true, false, false);
    this.layerCollider = this.physics.add.collider(this.player, this.layer);
    this.physics.add.collider(this.walkers, this.layer);
    this.physics.add.overlap(this.player, this.walkers, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.drones, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.pickups, this.collect, null, this);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.worldW, this.worldH);
    cam.startFollow(this.player, true, 0.15, 0.15);
    cam.setDeadzone(120, 200);
    cam.fadeIn(400);

    this.registry.set({
      level: level + 1, levelName: L.name, time: Math.ceil(this.timeLeft),
      stars: 0, starsTotal: stars, crystals: 0, crystalsTotal: crystals,
    });
    this.scene.launch('HUD');

    const banner = text(this, 480, 230, `LEVEL ${level + 1}\n${L.name}`, 28, '#ffd23f')
      .setScrollFactor(0).setDepth(50).setLineSpacing(16);
    this.tweens.add({ targets: banner, alpha: 0, delay: 1600, duration: 600, onComplete: () => banner.destroy() });
  }

  buildTilemap(rows) {
    const solidAbove = (x, y, ch) => y > 0 && rows[y - 1][x] === ch;
    const data = rows.map((row, y) => [...row].map((ch, x) => {
      if (ch === '#') return solidAbove(x, y, '#') ? TILE_INDEX.groundFill : TILE_INDEX.groundTop;
      if (ch === '%') return solidAbove(x, y, '%') ? TILE_INDEX.hullFill : TILE_INDEX.hullTop;
      if (ch === '=') return TILE_INDEX.platform;
      return -1;
    }));
    const map = this.make.tilemap({ data, tileWidth: TILE, tileHeight: TILE });
    const tileset = map.addTilesetImage('tiles', 'tiles', TILE, TILE, 0, 0);
    this.layer = map.createLayer(0, tileset, 0, 0);
    this.layer.setCollision([TILE_INDEX.groundTop, TILE_INDEX.groundFill, TILE_INDEX.hullTop, TILE_INDEX.hullFill]);
    // platforms are one-way: solid only when landing on them from above
    this.layer.forEachTile((t) => {
      if (t.index === TILE_INDEX.platform) t.setCollision(false, false, true, false);
    });
  }

  createEffects() {
    const burst = (tint) => this.add.particles(0, 0, 'spark', {
      speed: { min: 80, max: 260 }, lifespan: 550, gravityY: 400,
      scale: { start: 1.2, end: 0 }, tint, emitting: false,
    }).setDepth(20);
    this.goldBurst = burst([0xffd23f, 0xfff7c2, 0xf7a21b]);
    this.cyanBurst = burst([0x41e0ff, 0xd2ffff, 0x9b5de5]);
    this.greenBurst = burst([0x5fd35f, 0xb8ff9a, 0x2e8f3a]);
    this.dust = this.add.particles(0, 0, 'spark', {
      speedX: { min: -90, max: 90 }, speedY: { min: -70, max: -10 }, lifespan: 380,
      scale: { start: 0.9, end: 0 }, alpha: { start: 0.8, end: 0 }, tint: 0xa8b0d8, emitting: false,
    }).setDepth(9);
    this.exhaust = this.add.particles(0, 0, 'spark', {
      speedY: { min: 150, max: 320 }, speedX: { min: -50, max: 50 }, lifespan: 600,
      scale: { start: 1.8, end: 0 }, tint: [0xffd23f, 0xff8c1a, 0xe43b44, 0xffffff],
      frequency: 15, emitting: false,
    }).setDepth(5);
  }

  addPickup(x, y, kind) {
    const item = this.physics.add.image(x, y, kind).setDepth(4);
    item.kind = kind;
    this.pickups.add(item);
    item.body.setAllowGravity(false);
    item.body.setSize(30, 30);
    this.tweens.add({ targets: item, y: y - 6, duration: 700 + Math.random() * 200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    if (kind === 'star') {
      this.tweens.add({ targets: item, scaleX: 0.15, duration: 450, yoyo: true, repeat: -1, repeatDelay: 900, delay: Math.random() * 800 });
    } else {
      this.tweens.add({ targets: item, alpha: 0.65, duration: 300, yoyo: true, repeat: -1 });
    }
  }

  isSolidAt(x, y) {
    const t = this.layer.getTileAtWorldXY(x, y);
    return !!(t && t.collides);
  }

  popup(x, y, str, color = '#ffffff', size = 12) {
    const t = text(this, x, y, str, size, color).setDepth(30);
    this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 900, ease: 'Quad.easeOut', onComplete: () => t.destroy() });
  }

  addScore(points, x, y, color) {
    this.registry.inc('score', points);
    this.popup(x, y, `+${points}`, color);
  }

  collect(player, item) {
    if (player.dead || !item.active) return;
    if (item.kind === 'star') {
      this.registry.inc('stars', 1);
      this.addScore(POINTS.star, item.x, item.y - 20, '#ffd23f');
      this.goldBurst.explode(10, item.x, item.y);
      sfx.star();
    } else {
      this.registry.inc('crystals', 1);
      this.addScore(POINTS.crystal, item.x, item.y - 20, '#41e0ff');
      this.cyanBurst.explode(24, item.x, item.y);
      sfx.crystal();
    }
    this.tweens.killTweensOf(item);
    item.destroy();
  }

  hitEnemy(player, enemy) {
    if (player.dead || !enemy.alive || this.finished) return;
    const falling = player.body.velocity.y > 0;
    const fromAbove = player.body.bottom - enemy.body.top < 22;
    if (enemy.stompable && falling && fromAbove) {
      // chained stomps without touching the ground double up: 100, 200, 400, 800
      const points = POINTS.stomp * 2 ** Math.min(player.combo, 3);
      player.combo++;
      enemy.die();
      player.bounce();
      this.addScore(points, enemy.x, enemy.y - 30, player.combo > 1 ? '#ff5ac8' : '#b8ff9a');
      this.greenBurst.explode(14, enemy.x, enemy.y);
      this.cameras.main.shake(80, 0.004);
      sfx.stomp();
    } else if (player.invulnerable <= 0) {
      this.killPlayer(false);
    }
  }

  killPlayer(fellInPit) {
    if (this.player.dead || this.finished) return;
    this.player.die(fellInPit);
    this.layerCollider.active = false;
    sfx.hurt();
    this.cameras.main.shake(250, 0.012);
    const lives = this.registry.get('lives') - 1;
    this.registry.set('lives', lives);
    this.time.delayedCall(1300, () => {
      if (lives <= 0) {
        sfx.gameOver();
        this.scene.stop('HUD');
        this.scene.start('GameOver', { level: this.levelIndex });
        return;
      }
      this.player.respawn(this.respawnPoint.x, this.respawnPoint.y);
      this.layerCollider.active = true;
    });
  }

  checkTriggers() {
    const p = this.player;
    const box = new Phaser.Geom.Rectangle(p.body.x, p.body.y, p.body.width, p.body.height);

    if (p.invulnerable <= 0 && this.spikes.some((s) => Phaser.Geom.Intersects.RectangleToRectangle(box, s))) {
      this.killPlayer(false);
      return;
    }

    for (const b of this.beacons) {
      if (b.frame.name !== 0 || Math.abs(p.x - b.x) > 30 || Math.abs(p.y - b.y) > 60) continue;
      b.setFrame(1);
      this.respawnPoint = { x: b.x, y: b.y };
      this.greenBurst.explode(20, b.x, b.y - 30);
      this.popup(b.x, b.y - 50, 'CHECKPOINT', '#b8ff9a');
      sfx.checkpoint();
    }

    if (this.rocket && Phaser.Geom.Intersects.RectangleToRectangle(box, this.rocketZone)) this.launch();
  }

  launch() {
    this.finished = true;
    this.player.body.enable = false;
    this.player.setVisible(false);
    sfx.launch();
    this.rocket.play('rocket-fire');
    this.cameras.main.stopFollow();
    this.cameras.main.shake(1800, 0.004);
    this.exhaust.startFollow(this.rocket, 0, -4);
    this.exhaust.start();
    this.tweens.add({ targets: this.rocket, y: this.rocket.y - 750, duration: 1700, delay: 300, ease: 'Cubic.easeIn' });
    this.time.delayedCall(2300, () => this.completeLevel());
  }

  completeLevel() {
    const r = this.registry;
    const breakdown = {
      stars: `${r.get('stars')}/${r.get('starsTotal')}`,
      crystals: `${r.get('crystals')}/${r.get('crystalsTotal')}`,
      clear: POINTS.clear,
      time: Math.ceil(this.timeLeft) * POINTS.perSecond,
      allStars: r.get('stars') === r.get('starsTotal') ? POINTS.allStars : 0,
    };
    r.inc('score', breakdown.clear + breakdown.time + breakdown.allStars);
    sfx.complete();
    this.scene.stop('HUD');
    this.scene.start('LevelComplete', { level: this.levelIndex, breakdown });
  }

  update(time, delta) {
    updateBackdrop(this.backdrop, this.cameras.main.scrollX);
    if (this.finished) return;
    this.player.update(time, delta);
    if (this.player.dead) return;

    if (this.player.y > this.worldH + 40) {
      this.killPlayer(true);
      return;
    }
    this.checkTriggers();

    this.timeLeft -= delta / 1000;
    if (this.timeLeft <= 0) {
      this.timeLeft = LEVELS[this.levelIndex].time;
      this.popup(this.player.x, this.player.y - 40, 'OUT OF TIME', '#e43b44', 14);
      this.killPlayer(false);
    }
    this.registry.set('time', Math.max(0, Math.ceil(this.timeLeft)));
  }
}
