import { sfx } from '../assets/sounds.js';
import { touch } from '../input.js';
import { POWERS } from '../powers.js';

const RUN_SPEED = 300;
const JUMP_VELOCITY = -760;
const STOMP_BOUNCE = -480;
const COYOTE_TIME = 0.1; // seconds you can still jump after walking off a ledge
const JUMP_BUFFER = 0.12; // seconds a jump press is remembered before landing
const AIR_JUMP_VELOCITY = -680;
const SPEED_BOOST = 1.6; // run speed multiplier with hyper speed
const DROP_TIME = 0.25; // seconds platforms let you fall through after pressing down

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'hero', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(10);
    this.body.setSize(27, 42).setOffset(12, 6);
    this.body.setMaxVelocityY(950);
    this.setCollideWorldBounds(true);

    this.keys = scene.input.keyboard.addKeys('LEFT,RIGHT,UP,DOWN,A,D,W,S,SPACE');
    this.coyote = 0;
    this.jumpBuffer = 0;
    this.jumpHeld = false;
    this.invulnerable = 0;
    this.dropTimer = 0; // > 0 while falling through a floating platform
    this.riding = null; // moving platform underfoot (set by the scene's collider)
    this.carryVx = 0; // part of the x velocity that comes from that platform
    this.airCarry = 0; // platform speed kept after jumping or stepping off it
    this.combo = 0;
    this.dead = false;
    this.wasOnGround = true;

    this.powers = {}; // name -> seconds left (Infinity for the shield)
    this.airJumps = 0;
    this.ghostTimer = 0;
    this.bubble = scene.add.image(x, y, 'bubble').setDepth(11).setVisible(false)
      .setBlendMode(Phaser.BlendModes.ADD);
  }

  hasPower(name) {
    return this.powers[name] > 0;
  }

  givePower(name) {
    const { time } = POWERS[name];
    this.powers[name] = time || Infinity;
    if (name === 'jump') this.airJumps = 1;
  }

  removePower(name) {
    delete this.powers[name];
    if (name === 'nova') this.clearTint();
  }

  clearPowers() {
    Object.keys(this.powers).forEach((name) => this.removePower(name));
    this.bubble.setVisible(false);
  }

  // For the HUD: [name, fraction of time left] for every active power.
  powerStatus() {
    return Object.entries(this.powers).map(([name, left]) => [name, left === Infinity ? 1 : left / POWERS[name].time]);
  }

  update(time, delta) {
    if (this.dead || !this.body.enable) return;
    const dt = delta / 1000;
    const k = this.keys;
    const body = this.body;
    const onGround = body.blocked.down || body.touching.down; // touching = on a moving platform

    const dir = (k.RIGHT.isDown || k.D.isDown || touch.right ? 1 : 0) - (k.LEFT.isDown || k.A.isDown || touch.left ? 1 : 0);
    const jumpDown = this.jumpHeldDown();
    const touchJumpPressed = touch.jump && !this.prevTouchJump;
    this.prevTouchJump = touch.jump;
    const jumpPressed = [k.UP, k.W, k.SPACE].map((key) => Phaser.Input.Keyboard.JustDown(key)).some(Boolean) || touchJumpPressed;

    this.updatePowers(dt);
    const boost = this.hasPower('speed') ? SPEED_BOOST : this.hasPower('nova') ? 1.25 : 1;

    // On a moving platform the player's velocity also includes the
    // platform's, so physics moves them together on every step whatever the
    // frame rate. `touching` only comes from platforms (tiles set `blocked`).
    // Leaving it keeps that speed until landing, so a jump comes back down
    // on the same platform.
    if (!body.touching.down && this.riding) {
      this.airCarry = this.riding.body.velocity.x;
      this.riding = null;
    }
    if (this.riding || body.blocked.down || body.blocked.left || body.blocked.right) this.airCarry = 0;
    const carry = this.riding ? this.riding.body.velocity.x : this.airCarry;

    // horizontal: accelerate towards target speed, slide to a stop
    let vx = body.velocity.x - this.carryVx;
    if (dir !== 0) {
      const top = RUN_SPEED * boost;
      const grip = onGround && this.scene.slippery ? 0.35 : 1; // ice: slow to speed up and to stop
      vx = Phaser.Math.Clamp(vx + dir * (onGround ? 2600 * grip : 1800) * boost * dt, -top, top);
      this.setFlipX(dir < 0);
    } else {
      const drag = (onGround ? (this.scene.slippery ? 450 : 2600) : 900) * dt;
      vx = Math.abs(vx) <= drag ? 0 : vx - Math.sign(vx) * drag;
    }
    body.setVelocityX(vx + carry);
    this.carryVx = carry;

    // jumping with coyote time, buffering and variable height
    if (onGround) {
      this.coyote = COYOTE_TIME;
      this.combo = 0;
      if (this.hasPower('jump')) this.airJumps = 1;
    } else {
      this.coyote -= dt;
    }
    // down while standing on a floating platform drops through it
    this.dropTimer -= dt;
    const downHeld = k.DOWN.isDown || k.S.isDown || touch.down;
    if (downHeld && onGround && !jumpPressed && this.scene.onlyPlatformsBelow(body)) {
      this.dropTimer = DROP_TIME;
      this.coyote = 0;
      body.setVelocityY(60);
    }

    this.jumpBuffer = jumpPressed ? JUMP_BUFFER : this.jumpBuffer - dt;
    if (jumpPressed && this.coyote <= 0 && this.airJumps > 0 && this.hasPower('jump')) {
      // double jump: a second boost in mid-air, once per jump
      body.setVelocityY(AIR_JUMP_VELOCITY);
      this.airJumps = 0;
      this.jumpBuffer = 0;
      this.jumpHeld = true;
      sfx.airJump();
      this.scene.boostBurst.explode(12, this.x, this.body.bottom);
    } else if (this.jumpBuffer > 0 && this.coyote > 0) {
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
    this.updatePowerLooks(time, dt, vx);
  }

  updatePowers(dt) {
    for (const name of Object.keys(this.powers)) {
      this.powers[name] -= dt;
      if (this.powers[name] <= 0) {
        this.removePower(name);
        sfx.powerDown();
      }
    }
  }

  updatePowerLooks(time, dt, vx) {
    // shield bubble wobbles gently around the player
    const shielded = this.hasPower('shield');
    this.bubble.setVisible(shielded);
    if (shielded) {
      const wobble = Math.sin(time / 120) * 0.04;
      this.bubble.setPosition(this.x, this.y + 2).setScale(1 + wobble, 1 - wobble);
    }

    // supernova cycles through the rainbow and flashes when about to run out
    if (this.hasPower('nova')) {
      const hue = (time / 600) % 1;
      const ending = this.powers.nova < 2 && Math.floor(time / 90) % 2;
      this.setTint(ending ? 0xffffff : Phaser.Display.Color.HSVToRGB(hue, 0.55, 1).color);
    }

    // fast powers leave fading afterimages behind
    const fast = this.hasPower('speed') || this.hasPower('nova');
    this.ghostTimer -= dt;
    if (fast && Math.abs(vx) > 120 && this.ghostTimer <= 0) {
      this.ghostTimer = 0.045;
      const color = this.hasPower('nova') ? Phaser.Display.Color.HSVToRGB((time / 600) % 1, 0.7, 1).color : 0x5fd35f;
      const ghost = this.scene.add.image(this.x, this.y, this.texture.key, this.frame.name)
        .setFlipX(this.flipX).setTint(color).setAlpha(0.5).setDepth(9).setBlendMode(Phaser.BlendModes.ADD);
      this.scene.tweens.add({ targets: ghost, alpha: 0, duration: 260, onComplete: () => ghost.destroy() });
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
    this.clearPowers();
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
    this.dropTimer = 0;
    this.riding = null;
    this.carryVx = 0;
    this.airCarry = 0;
    this.combo = 0;
  }
}
