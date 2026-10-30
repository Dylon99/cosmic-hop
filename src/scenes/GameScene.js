import { LEVELS } from '../levels.js';
import { TILE, TILE_INDEX, groundTiles } from '../assets/sprites.js';
import { sfx } from '../assets/sounds.js';
import { music } from '../assets/music.js';
import { text, addBackdrop, updateBackdrop } from '../ui.js';
import { fitGame, onViewChange } from '../view.js';
import Player from '../entities/Player.js';
import { Blob, Crawler, Drone, Hopper, Spitter, Swooper } from '../entities/enemies.js';
import { POWERS, POWER_BY_CHAR } from '../powers.js';

const POINTS = { star: 10, crystal: 50, stomp: 100, clear: 500, perSecond: 5, allStars: 250 };
const SLAB_STEPS = 12; // copies of the tilemap stacked behind it to give blocks depth
const SLAB_STEP = 1; // px each copy moves up and to the right
const MAGNET_RANGE = 260;
const MOVER_SPEED = 100; // px per second

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
    this.slippery = L.ground === 'ice';
    music.play(L.music);

    this.backdrop = addBackdrop(this, level);
    this.buildTilemap(rows, L.ground);
    this.createEffects();

    this.pickups = this.add.group();
    this.walkers = this.add.group({ runChildUpdate: true });
    this.drones = this.add.group({ runChildUpdate: true }); // enemies that ignore the ground
    this.shots = this.physics.add.group({ allowGravity: false });
    this.spikes = []; // every deadly rectangle: spikes, stalactites and lava
    this.beacons = [];
    this.lavaTiles = [];
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
        case 'h': this.walkers.add(new Hopper(this, x, y)); break;
        case 's': this.drones.add(new Spitter(this, x, y)); break;
        case 'w': this.drones.add(new Swooper(this, x, y)); break;
        case '^':
          this.add.image(x, y, 'spike').setDepth(4);
          this.spikes.push(new Phaser.Geom.Rectangle(x - 18, y + 6, 36, 18));
          break;
        case 'v':
          this.add.image(x, y - TILE / 2, 'spike-down').setOrigin(0.5, 0).setDepth(4);
          this.spikes.push(new Phaser.Geom.Rectangle(x - 18, y - 24, 36, 18));
          break;
        case '~':
          this.add.sprite(x, y, 'lava').play('lava-flow').setDepth(4);
          this.spikes.push(new Phaser.Geom.Rectangle(x - 24, y - 12, 48, 36));
          this.lavaTiles.push({ x, y: y - 14 });
          break;
        case 'C':
          this.beacons.push(this.add.sprite(x, y, 'beacon', 0).setDepth(3));
          break;
        case 'R':
          this.rocket = this.add.sprite(x, (ty + 1) * TILE, 'rocket', 0).setOrigin(0.5, 1).setDepth(6);
          this.rocketZone = new Phaser.Geom.Rectangle(x - 24, (ty + 1) * TILE - 60, 48, 60);
          break;
        default:
          if (POWER_BY_CHAR[ch]) this.addPowerUp(x, y, POWER_BY_CHAR[ch]);
      }
    }));
    this.respawnPoint = start;
    this.createMovers(rows);

    this.player = new Player(this, start.x, start.y);
    this.playerShadow = this.add.image(start.x, start.y, 'shadow').setDepth(1);
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH, true, true, false, false);
    // floating platforms stop holding the player up for a moment after they press down
    this.layerCollider = this.physics.add.collider(this.player, this.layer, null,
      (player, tile) => !(tile.index === TILE_INDEX.platform && player.dropTimer > 0));
    this.moverCollider = this.physics.add.collider(this.player, this.movers, (player, mover) => {
      if (player.body.touching.down) player.riding = mover;
    }, (player) => player.dropTimer <= 0);
    this.physics.add.collider(this.walkers, this.layer);
    this.physics.add.overlap(this.player, this.walkers, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.drones, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.shots, this.hitShot, null, this);
    this.physics.add.collider(this.shots, this.layer, (shot) => this.popShot(shot));
    this.physics.add.overlap(this.player, this.pickups, this.collect, null, this);

    const cam = this.cameras.main;
    fitGame(this, this.worldW);
    onViewChange(this, () => {
      fitGame(this, this.worldW);
      updateBackdrop(this.backdrop, cam);
    });
    cam.startFollow(this.player, true, 0.15, 0.15);
    cam.setDeadzone(120, 200);
    cam.fadeIn(400);
    // move the backdrop once the camera has its final position for the frame
    cam.on('followupdate', () => updateBackdrop(this.backdrop, cam));
    updateBackdrop(this.backdrop, cam);

    this.registry.set({
      level: level + 1, levelName: L.name, time: Math.ceil(this.timeLeft),
      stars: 0, starsTotal: stars, crystals: 0, crystalsTotal: crystals, powers: [],
    });
    this.scene.launch('HUD');
  }

  buildTilemap(rows, theme) {
    // the top row counts as covered too, so cave ceilings use the filler tile
    const solidAbove = (x, y, ch) => y === 0 || rows[y - 1][x] === ch;
    const ground = groundTiles(theme);
    const data = rows.map((row, y) => [...row].map((ch, x) => {
      if (ch === '#') return solidAbove(x, y, '#') ? ground.fill : ground.top;
      if (ch === '%') return solidAbove(x, y, '%') ? TILE_INDEX.hullFill : TILE_INDEX.hullTop;
      if (ch === '=') return TILE_INDEX.platform;
      return -1;
    }));
    const makeLayer = (x, y) => {
      const map = this.make.tilemap({ data, tileWidth: TILE, tileHeight: TILE });
      const tileset = map.addTilesetImage('tiles', 'tiles', TILE, TILE, 0, 0);
      return map.createLayer(0, tileset, x, y);
    };
    // Shaded copies stacked up and to the right behind the real layer give
    // every block a visible top and side, so the ground reads as solid slabs.
    for (let i = SLAB_STEPS; i >= 1; i--) {
      const v = Math.round(215 - (i / SLAB_STEPS) * 70);
      makeLayer(i * SLAB_STEP, -i * SLAB_STEP).setTint(Phaser.Display.Color.GetColor(v, v, v + 25)).setDepth(-1);
    }
    this.layer = makeLayer(0, 0);
    this.layer.setCollisionByExclusion([-1]);
    // platforms are one-way: solid only when landing on them from above
    this.layer.forEachTile((t) => {
      if (t.index === TILE_INDEX.platform) t.setCollision(false, false, true, false);
    });
  }

  // Each run of '-' in a row is a track; a 2-tile platform slides along it.
  createMovers(rows) {
    this.movers = this.physics.add.group({ allowGravity: false, immovable: true });
    rows.forEach((row, ty) => {
      for (const m of row.matchAll(/-+/g)) {
        const minX = m.index * TILE + TILE, maxX = (m.index + m[0].length) * TILE - TILE;
        const mover = this.movers.create(minX, ty * TILE + TILE / 2, 'mover').setDepth(3);
        mover.body.setSize(TILE * 2, 18).setOffset(0, 0);
        Object.assign(mover.body.checkCollision, { down: false, left: false, right: false });
        mover.minX = minX;
        mover.maxX = Math.max(minX, maxX);
        mover.body.setVelocityX(MOVER_SPEED);
        mover.shadow = this.add.image(minX, 0, 'shadow').setDepth(1);
      }
    });
  }

  updateMovers() {
    for (const m of this.movers.getChildren()) {
      if (m.x >= m.maxX) m.body.setVelocityX(-MOVER_SPEED);
      else if (m.x <= m.minX) m.body.setVelocityX(MOVER_SPEED);
      this.castShadow(m.shadow, m.x, m.body.bottom + 6, 90);
    }
  }

  // Sparks drifting up from lava the camera can see.
  emitEmbers() {
    const view = this.cameras.main.worldView;
    const visible = this.lavaTiles.filter((t) => t.x > view.x - TILE && t.x < view.right + TILE);
    if (!visible.length) return;
    const t = Phaser.Utils.Array.GetRandom(visible);
    this.embers.emitParticleAt(t.x + Phaser.Math.Between(-20, 20), t.y);
  }

  createEffects() {
    const burst = (tint) => this.add.particles(0, 0, 'spark', {
      speed: { min: 80, max: 260 }, lifespan: 550, gravityY: 400,
      scale: { start: 1.2, end: 0 }, tint, emitting: false,
    }).setDepth(20);
    this.goldBurst = burst([0xffd23f, 0xfff7c2, 0xf7a21b]);
    this.cyanBurst = burst([0x41e0ff, 0xd2ffff, 0x9b5de5]);
    this.greenBurst = burst([0x5fd35f, 0xb8ff9a, 0x2e8f3a]);
    this.powerBurst = burst(0xffffff);
    this.boostBurst = this.add.particles(0, 0, 'spark', {
      speedX: { min: -60, max: 60 }, speedY: { min: 80, max: 220 }, lifespan: 350,
      scale: { start: 1.1, end: 0 }, tint: [0xffd23f, 0xff8c1a, 0xffffff], emitting: false,
    }).setDepth(9);
    this.dust = this.add.particles(0, 0, 'spark', {
      speedX: { min: -90, max: 90 }, speedY: { min: -70, max: -10 }, lifespan: 380,
      scale: { start: 0.9, end: 0 }, alpha: { start: 0.8, end: 0 }, tint: 0xa8b0d8, emitting: false,
    }).setDepth(9);
    this.embers = this.add.particles(0, 0, 'spark', {
      speedY: { min: -140, max: -60 }, speedX: { min: -25, max: 25 }, lifespan: 1100,
      scale: { start: 0.8, end: 0 }, alpha: { start: 1, end: 0 },
      tint: [0xffd23f, 0xff8c1a, 0xe43b44], emitting: false,
    }).setDepth(5);
    this.time.addEvent({ delay: 90, loop: true, callback: () => this.emitEmbers() });
    this.exhaust = this.add.particles(0, 0, 'spark', {
      speedY: { min: 150, max: 320 }, speedX: { min: -50, max: 50 }, lifespan: 600,
      scale: { start: 1.8, end: 0 }, tint: [0xffd23f, 0xff8c1a, 0xe43b44, 0xffffff],
      frequency: 15, emitting: false,
    }).setDepth(5);
  }

  addPickup(x, y, kind, texture = kind) {
    const item = this.physics.add.image(x, y, texture).setDepth(4);
    item.kind = kind;
    this.pickups.add(item);
    item.body.setAllowGravity(false);
    item.body.setSize(30, 30);
    item.shadow = this.add.image(x, y, 'shadow').setDepth(1);
    this.castShadow(item.shadow, x, y + 18, 28);
    this.tweens.add({ targets: item, y: y - 6, duration: 700 + Math.random() * 200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    // stars and crystals spin like coins
    if (kind === 'star') {
      this.tweens.add({ targets: item, scaleX: 0.15, duration: 450, yoyo: true, repeat: -1, repeatDelay: 900, delay: Math.random() * 800 });
    } else if (kind === 'crystal') {
      this.tweens.add({ targets: item, scaleX: 0.2, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    return item;
  }

  addPowerUp(x, y, power) {
    const item = this.addPickup(x, y, 'power', `power-${power}`);
    item.power = power;
    this.tweens.add({ targets: item, scale: 1.15, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    if (item.preFX) { // WebGL only
      item.preFX.setPadding(12);
      item.preFX.addGlow(Phaser.Display.Color.HexStringToColor(POWERS[power].color).color, 5, 0, false, 0.1, 12);
    }
  }

  // Ground directly below (x, y): the top of the first solid tile, or null over a pit.
  groundBelow(x, y) {
    const tx = Math.floor(x / TILE);
    for (let ty = Math.max(0, Math.floor((y - 8) / TILE)); ty < this.layer.layer.height; ty++) {
      const t = this.layer.getTileAt(tx, ty);
      if (t && t.collides && t.pixelY >= y - 8) return t.pixelY;
    }
    return null;
  }

  // Shadows shrink and fade the higher something is above the ground.
  castShadow(shadow, x, feetY, width = 40) {
    const ground = this.groundBelow(x, feetY);
    if (ground === null) return shadow.setVisible(false);
    const k = Phaser.Math.Clamp(1 - (ground - feetY) / 300, 0.3, 1);
    return shadow.setVisible(true).setPosition(x, ground - 3).setScale((width / 48) * k, k).setAlpha(k);
  }

  updateShadows() {
    const p = this.player;
    if (p.visible) this.castShadow(this.playerShadow, p.x, p.body.bottom, 36);
    else this.playerShadow.setVisible(false);
    for (const e of [...this.walkers.getChildren(), ...this.drones.getChildren()]) {
      if (e.alive) this.castShadow(e.shadow, e.x, e.body.bottom, 40);
    }
  }

  // Stars and crystals in range fly to the player while the magnet is on,
  // and keep flying once they have started.
  pullPickups(dt) {
    const p = this.player;
    const magnet = p.hasPower('magnet');
    for (const item of this.pickups.getChildren()) {
      if (item.kind === 'power') continue;
      const dist = Phaser.Math.Distance.Between(item.x, item.y, p.x, p.y);
      if (!item.pulled) {
        if (!magnet || dist > MAGNET_RANGE) continue;
        item.pulled = true;
        this.tweens.killTweensOf(item);
        item.setScale(1);
        item.shadow.setVisible(false);
      }
      const step = Math.min(dist, (500 + Math.max(0, MAGNET_RANGE - dist) * 5) * dt);
      const angle = Math.atan2(p.y - item.y, p.x - item.x);
      item.setPosition(item.x + Math.cos(angle) * step, item.y + Math.sin(angle) * step);
    }
  }

  // True when everything under the body's feet is a floating platform.
  onlyPlatformsBelow(body) {
    const tiles = [body.left + 1, body.right - 1].map((x) => this.layer.getTileAtWorldXY(x, body.bottom + 2));
    const onMover = this.movers.getChildren().some((m) => Math.abs(m.body.top - body.bottom) < 4
      && body.right > m.body.left && body.left < m.body.right);
    return (onMover || tiles.some((t) => t?.index === TILE_INDEX.platform))
      && tiles.every((t) => !t || !t.collides || t.index === TILE_INDEX.platform);
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
    } else if (item.kind === 'crystal') {
      this.registry.inc('crystals', 1);
      this.addScore(POINTS.crystal, item.x, item.y - 20, '#41e0ff');
      this.cyanBurst.explode(24, item.x, item.y);
      sfx.crystal();
    } else {
      const { label, color } = POWERS[item.power];
      const tint = Phaser.Display.Color.HexStringToColor(color).color;
      player.givePower(item.power);
      this.popup(item.x, item.y - 30, label, color, 14);
      this.powerBurst.setParticleTint(tint).explode(30, item.x, item.y);
      // expanding shockwave ring
      const ring = this.add.image(item.x, item.y, 'bubble').setTint(tint).setDepth(20).setScale(0.3)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: ring, scale: 2.5, alpha: 0, duration: 450, ease: 'Quad.easeOut', onComplete: () => ring.destroy() });
      sfx.powerUp();
    }
    this.tweens.killTweensOf(item);
    item.shadow.destroy();
    item.destroy();
  }

  hitEnemy(player, enemy) {
    if (player.dead || !enemy.alive || this.finished) return;
    if (player.hasPower('nova')) {
      this.smash(enemy);
      return;
    }
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
      if (player.hasPower('shield')) {
        this.breakShield();
        this.smash(enemy);
      } else {
        this.killPlayer(false);
      }
    }
  }

  // A plasma ball flying along the ground.
  spit(x, y, dir) {
    const shot = this.shots.create(x, y, 'plasma').setDepth(6).setFlipX(dir < 0);
    shot.body.setCircle(9, 3, 3).setVelocityX(dir * 230);
    shot.life = 3;
    sfx.spit();
    return shot;
  }

  popShot(shot) {
    this.greenBurst.explode(6, shot.x, shot.y);
    shot.destroy();
  }

  hitShot(player, shot) {
    if (player.dead || this.finished || !shot.active) return;
    if (player.hasPower('nova') || player.invulnerable > 0) {
      if (player.hasPower('nova')) this.popShot(shot);
      return;
    }
    this.popShot(shot);
    if (player.hasPower('shield')) this.breakShield();
    else this.killPlayer(false);
  }

  updateShots(dt) {
    for (const shot of this.shots.getChildren()) {
      shot.life -= dt;
      shot.angle += 720 * dt * Math.sign(shot.body.velocity.x);
      if (shot.life <= 0) shot.destroy();
    }
  }

  // Knocks out any enemy, even a spiky one (supernova and shield hits).
  smash(enemy) {
    enemy.knockOut(enemy.x < this.player.x ? -1 : 1);
    this.addScore(POINTS.stomp, enemy.x, enemy.y - 30, '#ff5ac8');
    this.greenBurst.explode(14, enemy.x, enemy.y);
    this.cameras.main.shake(80, 0.004);
    sfx.stomp();
  }

  breakShield() {
    const p = this.player;
    p.removePower('shield');
    p.invulnerable = 1;
    p.body.setVelocityY(-420);
    this.cyanBurst.explode(30, p.x, p.y);
    this.popup(p.x, p.y - 40, 'SHIELD BROKEN', '#41e0ff');
    sfx.shieldBreak();
  }

  killPlayer(fellInPit) {
    if (this.player.dead || this.finished) return;
    this.player.die(fellInPit);
    this.layerCollider.active = false;
    this.moverCollider.active = false;
    sfx.hurt();
    this.cameras.main.shake(250, 0.012);
    const lives = this.registry.get('lives') - 1;
    this.registry.set('lives', lives);
    this.time.delayedCall(1300, () => {
      if (lives <= 0) {
        music.stop();
        sfx.gameOver();
        this.scene.stop('HUD');
        this.scene.start('GameOver', { level: this.levelIndex });
        return;
      }
      this.player.respawn(this.respawnPoint.x, this.respawnPoint.y);
      this.layerCollider.active = true;
      this.moverCollider.active = true;
    });
  }

  checkTriggers() {
    const p = this.player;
    const box = new Phaser.Geom.Rectangle(p.body.x, p.body.y, p.body.width, p.body.height);

    if (p.invulnerable <= 0 && !p.hasPower('nova') && this.spikes.some((s) => Phaser.Geom.Intersects.RectangleToRectangle(box, s))) {
      if (p.hasPower('shield')) {
        this.breakShield();
      } else {
        this.killPlayer(false);
        return;
      }
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
    music.stop();
    this.player.clearPowers();
    this.player.body.enable = false;
    this.player.setVisible(false);
    this.playerShadow.setVisible(false);
    this.registry.set('powers', []);
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
    if (this.finished) return;
    this.updateMovers();
    this.player.update(time, delta);
    this.registry.set('powers', this.player.powerStatus());
    this.updateShadows();
    this.pullPickups(delta / 1000);
    this.updateShots(delta / 1000);
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
