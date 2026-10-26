class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key, anim) {
    super(scene, x, y, key, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(5);
    this.play(anim);
    this.alive = true;
    this.stompable = true;
  }

  die() {
    this.alive = false;
    this.body.enable = false;
    this.anims.stop();
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
