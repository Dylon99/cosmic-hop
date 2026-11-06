import { DESIGN_H, visibleRect, textResolution } from './view.js';
import { isTouchDevice, canPlayTwo } from './input.js';

export const FONT = '"Press Start 2P", monospace';

export const text = (scene, x, y, str, size = 16, color = '#ffffff') =>
  scene.add.text(x, y, str, {
    fontFamily: FONT, fontSize: `${size}px`, color, align: 'center', resolution: textResolution(scene),
  })
    .setOrigin(0.5)
    .setShadow(3, 3, '#000000', 0, false, true);

// A tappable / clickable text button with a framed background.
export function button(scene, x, y, label, onPress, color = '#41e0ff', size = 16) {
  const frame = scene.add.rectangle(x, y, 10, 10, 0x05060f, 0.6)
    .setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(color).color);
  const t = text(scene, x, y, label, size, color);
  frame.setSize(t.width + 40, t.height + 26);
  frame.setInteractive({ useHandCursor: true }).on('pointerdown', (pointer, lx, ly, event) => {
    event.stopPropagation();
    onPress();
  });
  return { frame, text: t, setVisible: (v) => (frame.setVisible(v), t.setVisible(v)) };
}

const HIGH_KEY = 'cosmic-hop-highscore';

export function getHighScore() {
  try {
    return Number(localStorage.getItem(HIGH_KEY)) || 0;
  } catch {
    return 0;
  }
}

// Returns true when the score is a new record.
export function saveHighScore(score) {
  if (score <= getHighScore()) return false;
  try {
    localStorage.setItem(HIGH_KEY, String(score));
  } catch {
    // storage blocked (private mode etc.) - keep playing without it
  }
  return true;
}

// Sky gradient, two parallax star layers, a planet and distant hills. They
// live in world space and updateBackdrop() keeps them covering whatever the
// camera shows.
export function addBackdrop(scene, level) {
  return {
    sky: scene.add.image(0, 0, `sky-${level}`).setOrigin(0).setDepth(-10),
    far: scene.add.tileSprite(0, 0, 16, 16, 'stars-far').setOrigin(0).setDepth(-9),
    planet: scene.add.image(0, 0, `planet-${level}`).setScale(3).setDepth(-8),
    near: scene.add.tileSprite(0, 0, 16, 16, 'stars-near').setOrigin(0).setDepth(-7),
    hills: scene.add.tileSprite(0, 0, 16, 16, `hills-${level}`).setOrigin(0).setDepth(-6),
  };
}

export function updateBackdrop(backdrop, cam, scroll = cam.scrollX) {
  const r = visibleRect(cam);
  // a couple of px of overlap so rounding never shows a seam at the edges
  const x = r.x - 2, y = r.y - 2, w = Math.ceil(r.width) + 4, h = Math.ceil(r.height) + 4;
  backdrop.sky.setPosition(x, y).setDisplaySize(w, h);
  for (const [layer, speed] of [[backdrop.far, 0.08], [backdrop.near, 0.25]]) {
    if (layer.width !== w || layer.height !== h) layer.setSize(w, h);
    layer.setPosition(x, y);
    layer.tilePositionX = scroll * speed;
  }
  backdrop.planet.setPosition(r.x + r.width * 0.72 - scroll * 0.04, r.y + r.height * 0.28);
  // the hills sit on the bottom of the level, or of the screen in menus
  const { hills } = backdrop;
  if (hills.width !== w) hills.setSize(w, DESIGN_H);
  hills.setPosition(x, Math.max(DESIGN_H, y + h) - DESIGN_H);
  hills.tilePositionX = scroll * 0.35;
}

export function pressToContinue(scene, keys, cb, tap = true) {
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    cb();
  };
  keys.forEach((k) => scene.input.keyboard.once(`keydown-${k}`, go));
  // taps on buttons don't count
  if (tap) scene.input.on('pointerdown', (pointer, over) => over.length || go());
}

const PLAYERS_KEY = 'cosmic-hop-players';
const LIVES_PER_PLAYER = 3;

// 1 or 2 players, remembered in the browser.
export function getPlayers() {
  if (!canPlayTwo) return 1;
  try {
    return localStorage.getItem(PLAYERS_KEY) === '2' ? 2 : 1;
  } catch {
    return 1;
  }
}

export function setPlayers(n) {
  try {
    localStorage.setItem(PLAYERS_KEY, String(n));
  } catch {
    // storage blocked - the choice just won't be remembered
  }
}

// Two players share one pool of hearts: 3 each.
export const startingLives = (players) => LIVES_PER_PLAYER * players;

// Score, lives and player count for a fresh run.
export function resetRun(registry, players = getPlayers()) {
  const lives = startingLives(players);
  registry.set({ score: 0, score1: 0, score2: 0, lives, maxLives: lives, players });
}

export const PLAYER_COLORS = ['#ffd23f', '#b8ff9a'];

// Two players: who has scored more so far. Returns 0 or 1, or -1 for a tie.
export function leader(registry) {
  const a = registry.get('score1'), b = registry.get('score2');
  return a === b ? -1 : a > b ? 0 : 1;
}

// Starts a new game (score 0, full lives) at the given level.
export function startRun(scene, level) {
  // hide the browser bars on phones that allow it (not iPhone Safari)
  if (isTouchDevice && scene.scale.fullscreen.available && !scene.scale.isFullscreen) {
    try {
      scene.scale.startFullscreen();
    } catch {
      // not allowed here - play in the normal browser view
    }
  }
  resetRun(scene.registry);
  scene.scene.start('Game', { level });
}
