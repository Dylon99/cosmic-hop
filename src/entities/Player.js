import { sfx } from '../assets/sounds.js';
import { touch } from '../input.js';

const RUN_SPEED = 300;
const JUMP_VELOCITY = -760;
const STOMP_BOUNCE = -480;
const COYOTE_TIME = 0.1; // seconds you can still jump after walking off a ledge
const JUMP_BUFFER = 0.12; // seconds a jump press is remembered before landing

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'hero', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(10);
    this.body.setSize(27, 42).setOffset(12, 6);
    this.body.setMaxVelocityY(950);
    this.setCollideWorldBounds(true);

    this.keys = scene.input.keyboard.addKeys('LEFT,RIGHT,UP,A,D,W,SPACE');
    this.coyote = 0;
    this.jumpBuffer = 0;
    this.jumpHeld = false;
    this.invulnerable = 0;
    this.combo = 0;
    this.dead = false;
    this.wasOnGround = true;
  }

  update(time, delta) {
    if (this.dead || !this.body.enable) return;
    const dt = delta / 1000;
    const k = this.keys;
    const body = this.body;
    const onGround = body.blocked.down;

    const dir = (k.RIGHT.isDown || k.D.isDown || touch.right ? 1 : 0) - (k.LEFT.isDown || k.A.isDown || touch.left ? 1 : 0);
    const jumpDown = this.jumpHeldDown();
    const touchJumpPressed = touch.jump && !this.prevTouchJump;
    this.prevTouchJump = touch.jump;
    const jumpPressed = [k.UP, k.W, k.SPACE].map((key) => Phaser.Input.Keyboard.JustDown(key)).some(Boolean) || touchJumpPressed;

    // horizontal: accelerate towards target speed, slide to a stop
    let vx = body.velocity.x;
    if (dir !== 0) {
      vx = Phaser.Math.Clamp(vx + dir * (onGround ? 2600 : 1800) * dt, -RUN_SPEED, RUN_SPEED);
      this.setFlipX(dir < 0);
    } else {
      const drag = (onGround ? 2600 : 900) * dt;
      vx = Math.abs(vx) <= drag ? 0 : vx - Math.sign(vx) * drag;
    }
    body.setVelocityX(vx);

    // jumping with coyote time, buffering and variable height
    if (onGround) {
      this.coyote = COYOTE_TIME;
      this.combo = 0;
    } else {
      this.coyote -= dt;
    }
    this.jumpBuffer = jumpPressed ? JUMP_BUFFER : this.jumpBuffer - dt;
    if (this.jumpBuffer > 0 && this.coyote > 0) {
      body.setVelocityY(JUMP_VELOCITY);
      this.coyote = 0;
      this.jumpBuffer = 0;
      this.jumpHeld = true;
      sfx.jump();
      this.scene.dust.explode(6, this.x, this.body.bottom);
    }
    if (this.jumpHeld && !jumpDown && body.velocity.y < 0) {
      body.setVelocityY(body.velocity.y * 0.45);
      this.jumpHeld = false;
    }
    if (body.velocity.y >= 0) this.jumpHeld = false;

    if (onGround && !this.wasOnGround) this.scene.dust.explode(4, this.x, this.body.bottom);
    this.wasOnGround = onGround;

    if (!onGround) this.anims.play(body.velocity.y < 0 ? 'hero-jump' : 'hero-fall', true);
    else this.anims.play(Math.abs(vx) > 20 ? 'hero-run' : 'hero-idle', true);

    if (this.invulnerable > 0) {
      this.invulnerable -= dt;
      this.setAlpha(this.invulnerable > 0 && Math.floor(this.invulnerable * 16) % 2 ? 0.25 : 1);
    }
  }

  jumpHeldDown() {
    return this.keys.UP.isDown || this.keys.W.isDown || this.keys.SPACE.isDown || touch.jump;
  }

  bounce() {
    const held = this.jumpHeldDown();
    this.body.setVelocityY(held ? JUMP_VELOCITY : STOMP_BOUNCE);
    this.jumpHeld = held;
  }

  die(fellInPit) {
    this.dead = true;
    this.anims.stop();
    this.setFrame(6);
    this.setTint(0xff7070);
    this.setAlpha(1);
    this.body.setVelocity(0, fellInPit ? 0 : -600);
    this.body.setAllowGravity(!fellInPit);
    this.setCollideWorldBounds(false);
  }

  respawn(x, y) {
    this.dead = false;
    this.clearTint();
    this.setPosition(x, y);
    this.body.reset(x, y);
    this.body.setAllowGravity(true);
    this.setCollideWorldBounds(true);
    this.setFlipX(false);
    this.invulnerable = 1.5;
    this.combo = 0;
  }
}
