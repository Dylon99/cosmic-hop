class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key, anim) {
    super(scene, x, y, key, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(5);
    if (anim) this.play(anim);
    this.alive = true;
    this.stompable = true;
    this.shadow = scene.add.image(x, y, 'shadow').setDepth(1).setVisible(false);
  }

  die() {
    this.alive = false;
    this.body.enable = false;
    this.anims.stop();
    this.shadow.destroy();
  }

  // Hit by a supernova or a shield: flips over and tumbles off the screen.
  knockOut(dir) {
    Enemy.prototype.die.call(this);
    this.setFlipY(true);
    this.scene.tweens.add({ targets: this, x: this.x + dir * 120, duration: 900 });
    this.scene.tweens.add({
      targets: this, y: this.y - 80, duration: 260, ease: 'Quad.easeOut',
      onComplete: () => this.scene.tweens.add({
        targets: this, y: this.y + 700, duration: 900, ease: 'Quad.easeIn', onComplete: () => this.destroy(),
      }),
    });
  }
}

// Walks back and forth, turning at walls and ledges.
class Walker extends Enemy {
  constructor(scene, x, y, key, anim, speed) {
    super(scene, x, y, key, anim);
    this.speed = speed;
    this.dir = -1;
  }

  update() {
    if (!this.alive) return;
    const b = this.body;
    if (b.blocked.left) this.dir = 1;
    else if (b.blocked.right) this.dir = -1;
    else if (b.blocked.down) {
      const aheadX = this.dir > 0 ? b.right + 2 : b.left - 2;
      if (!this.scene.isSolidAt(aheadX, b.bottom + 4)) this.dir *= -1;
    }
    b.setVelocityX(this.dir * this.speed);
    this.setFlipX(this.flipFacesLeft ? this.dir < 0 : this.dir > 0);
  }
}

export class Blob extends Walker {
  constructor(scene, x, y) {
    super(scene, x, y, 'blob', 'blob-walk', 70);
    this.body.setSize(36, 30).setOffset(6, 18);
  }

  die() {
    super.die();
    this.setFrame(2);
    this.scene.tweens.add({ targets: this, alpha: 0, delay: 400, duration: 300, onComplete: () => this.destroy() });
  }
}

// Spiky back: cannot be stomped, you have to jump over it.
export class Crawler extends Walker {
  constructor(scene, x, y) {
    super(scene, x, y, 'crawler', 'crawler-walk', 100);
    this.body.setSize(42, 27).setOffset(3, 21);
    this.stompable = false;
    this.flipFacesLeft = true; // art faces right
  }
}

// Hovers on a figure-eight path, ignores gravity and walls.
export class Drone extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'drone', 'drone-fly');
    this.body.setAllowGravity(false);
    this.body.setSize(36, 36).setOffset(6, 6);
    this.baseX = x;
    this.baseY = y;
    this.t = Math.random() * Math.PI * 2;
  }

  update(time, delta) {
    if (!this.alive) return;
    this.t += delta / 1000;
    const nx = this.baseX + Math.sin(this.t * 0.9) * 110;
    this.setFlipX(nx < this.x);
    this.setPosition(nx, this.baseY + Math.sin(this.t * 2.6) * 22);
  }

  die() {
    super.die();
    this.scene.tweens.add({
      targets: this, y: this.y + 600, angle: 540, duration: 1100, ease: 'Quad.easeIn',
      onComplete: () => this.destroy(),
    });
  }
}

// Sits still, then leaps towards the player (or a random way when the player
// is far off). Never hops off a ledge if it can help it.
export class Hopper extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'hopper', null);
    this.body.setSize(36, 30).setOffset(6, 18);
    this.wait = 0.8 + Math.random();
  }

  update(time, delta) {
    if (!this.alive) return;
    const b = this.body;
    if (!b.blocked.down) {
      this.setFrame(1);
      return;
    }
    this.setFrame(0);
    b.setVelocityX(0);
    this.wait -= delta / 1000;
    if (this.wait > 0) return;
    this.wait = 1.2 + Math.random() * 0.8;
    const p = this.scene.player;
    let dir = Math.abs(p.x - this.x) < 400 ? Math.sign(p.x - this.x) || 1 : (Math.random() < 0.5 ? -1 : 1);
    const landsOn = (d) => this.scene.isSolidAt(this.x + d * 100, b.bottom + 4);
    if (!landsOn(dir)) dir = landsOn(-dir) ? -dir : 0;
    b.setVelocity(dir * 130, -620);
    if (dir) this.setFlipX(dir < 0);
  }

  die() {
    this.knockOut(0);
  }
}

// Rooted to the ground; turns to face the player and spits plasma at them
// when they are close and at about the same height.
export class Spitter extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'spitter', null);
    this.body.setAllowGravity(false).setImmovable(true);
    this.body.setSize(33, 39).setOffset(6, 6);
    this.cooldown = 1 + Math.random();
  }

  update(time, delta) {
    if (!this.alive) return;
    const p = this.scene.player;
    const dir = p.x < this.x ? -1 : 1;
    this.setFlipX(dir < 0);
    if (p.dead || Math.abs(p.x - this.x) > 520 || Math.abs(p.y - this.y) > 120) return;
    this.cooldown -= delta / 1000;
    if (this.cooldown > 0) return;
    this.cooldown = 2.2;
    this.setFrame(1);
    this.scene.spit(this.x + dir * 22, this.y + 3, dir);
    this.scene.time.delayedCall(260, () => this.alive && this.setFrame(0));
  }

  die() {
    this.knockOut(0);
  }
}

// Hangs in the air until the player passes underneath, then swoops down
// through them in an arc and flies back to its perch.
export class Swooper extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'swooper', 'swooper-hang');
    this.body.setAllowGravity(false);
    this.body.setSize(30, 24).setOffset(9, 15);
    this.home = { x, y };
    this.state = 'hang';
  }

  update(time, delta) {
    if (!this.alive) return;
    const dt = delta / 1000, p = this.scene.player;
    if (this.state === 'hang') {
      const depth = p.y - this.y;
      if (p.dead || Math.abs(p.x - this.x) > 220 || depth < 60 || depth > 420) return;
      // dive so the lowest point of the arc is where the player is now
      const lift = 650, vy = Math.sqrt(2 * lift * depth), t = vy / lift;
      this.v = { x: Phaser.Math.Clamp((p.x - this.x) / t, -360, 360), y: vy };
      this.state = 'dive';
      this.play('swooper-fly');
    } else if (this.state === 'dive') {
      this.v.y -= 650 * dt;
      this.setPosition(this.x + this.v.x * dt, this.y + this.v.y * dt);
      this.setFlipX(this.v.x < 0);
      if (this.v.y < 0 && this.y <= this.home.y) this.state = 'return';
    } else {
      const dx = this.home.x - this.x, dy = this.home.y - this.y, dist = Math.hypot(dx, dy);
      const step = 170 * dt;
      if (dist <= step) {
        this.setPosition(this.home.x, this.home.y);
        this.state = 'hang';
        this.play('swooper-hang');
      } else {
        this.setPosition(this.x + (dx / dist) * step, this.y + (dy / dist) * step);
        this.setFlipX(dx < 0);
      }
    }
  }

  die() {
    this.knockOut(0);
  }
}
