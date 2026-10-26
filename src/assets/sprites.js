// Original pixel art for the game. Each sprite is a grid of characters;
// every character maps to a palette colour ('.' is transparent). Grids are
// drawn into canvas textures at boot, scaled up so one art pixel = SCALE px.

export const SCALE = 3;
export const TILE = 16 * SCALE;

const PALETTE = {
  K: '#1a1c2c', // outline
  W: '#f4f4f4', w: '#b8c0d0', // suit white / shade
  G: '#3d4455', g: '#6b7385', // dark greys
  O: '#ff8c1a', o: '#ffe08a', // visor
  R: '#e43b44', r: '#a32030',
  Y: '#ffd23f', y: '#f7a21b', L: '#fff7c2',
  C: '#41e0ff', c: '#1a8fc4', D: '#d2ffff',
  N: '#5fd35f', n: '#2e8f3a', M: '#b8ff9a',
  P: '#9b5de5', p: '#5b2a9a', E: '#ff5ac8',
  B: '#262a45', b: '#454b70', T: '#7a80a8', t: '#a8b0d8',
  S: '#8a95a8', s: '#5a6378', H: '#d0d8e8',
};

// ---------------------------------------------------------------- hero
const heroTop = [
  '................',
  '.....KKKKKK.....',
  '....KWWWWWWK....',
  '...KWWWWWWWWK...',
  '..KKWWKKKKKKWK..',
  '.KGKWKOOOOooKWK.',
  '.KGKWKOOOOOoKWK.',
  '.KGKWKOOOOOOKWK.',
  '.KGKWWKKKKKKWWK.',
];
const heroTopBlink = heroTop.map((r, i) => (i === 5 ? '.KGKWKOOOoOoKWK.' : r));
const heroBody = [
  '.KGKKWWWWWWWWK..',
  '.KGKWWCRWWWWWWK.',
  '.KKKWWWWWWWKWWK.',
  '...KWWWWWWWKKK..',
];
const heroArmUp = [
  '.KGKKWWWWWWWWKK.',
  '.KGKWWCRWWWWKWK.',
  '.KKKWWWWWWWK.K..',
  '...KWWWWWWWK....',
];
const legs = {
  stand: ['...KWWWKKWWWK...', '...KGGGK.KGGGK..', '...KKKKK.KKKKK..'],
  wide: ['..KWWWKK.KWWWK..', '.KGGGK....KGGGK.', '.KKKKK....KKKKK.'],
  pass: ['....KWWWWWK.....', '....KGGGGGK.....', '....KKKKKKK.....'],
  mid: ['...KWWK..KWWK...', '..KGGGK..KGGGK..', '..KKKKK..KKKKK..'],
  tuck: ['..KWWWKKKWWWK...', '..KGGK...KGGK...', '..KKK.....KKK...'],
};
const hero = [
  [...heroTop, ...heroBody, ...legs.stand], // 0 idle
  [...heroTopBlink, ...heroBody, ...legs.stand], // 1 idle
  [...heroTop, ...heroBody, ...legs.wide], // 2 run
  [...heroTop, ...heroBody, ...legs.pass], // 3 run
  [...heroTop, ...heroBody, ...legs.mid], // 4 run
  [...heroTop, ...heroBody, ...legs.pass], // 5 run
  [...heroTop, ...heroArmUp, ...legs.tuck], // 6 jump
  [...heroTop, ...heroArmUp, ...legs.stand], // 7 fall
];

// ---------------------------------------------------------------- enemies
const blob = [
  [
    '................', '................', '................', '................', '................',
    '......KKKK......',
    '....KKNNNNKK....',
    '...KNNMMNNNNK...',
    '..KNMMNNNNNNNK..',
    '..KNNWWNNWWNNK..',
    '.KNNNWKNNWKNNNK.',
    '.KNNNWKNNWKNNNK.',
    '.KNNNNNNNNNNNNK.',
    '.KnNNNNKKNNNNnK.',
    '.KnnNnnNNnnNnnK.',
    '..KKKKKKKKKKKK..',
  ],
  [
    '................', '................', '................', '................', '................', '................',
    '......KKKK......',
    '...KKKNNNNKKK...',
    '..KNNMMNNNNNNK..',
    '.KNMMNNNNNNNNNK.',
    '.KNNNWWNNWWNNNK.',
    '.KNNNWKNNWKNNNK.',
    'KNNNNWKNNWKNNNNK',
    'KnNNNNNKKNNNNNnK',
    'KnnNnnNNNNnnNnnK',
    '.KKKKKKKKKKKKKK.',
  ],
  [
    '................', '................', '................', '................', '................', '................',
    '................', '................', '................', '................', '................', '................',
    '....KKKKKKKK....',
    '..KKNNKNNKNNKK..',
    '.KnNNNNNNNNNNnK.',
    'KKKKKKKKKKKKKKKK',
  ],
];

const droneBody = [
  '.......KK.......',
  '.....KKSSKK.....',
  '...KKSSHHSSKK...',
  '..KSSHHSSSSSSK..',
  '.KSSKKKKKKKKSSK.',
  '.KSKGGRRRRGGKSK.',
  '.KSKGRRLLRRGKSK.',
  '.KSKGGRRRRGGKSK.',
  '.KSSKKKKKKKKSSK.',
  '..KssSSSSSSssK..',
  '...KKssssssKK...',
  '.....KKKKKK.....',
];
const drone = [
  ['................', '...HHHHHHHHHH...', ...droneBody, '......C..C......', '......c..c......'],
  ['................', '......HHHH......', ...droneBody, '......c..c......', '................'],
];

const crawlerTop = [
  '................', '................', '................', '................',
  '....H...H...H...',
  '...KHK.KHK.KHK..',
  '..KHHHKHHHKHHHK.',
  '..KPPPPPPPPPPPK.',
  '.KPPEPPPPPPPPPK.',
  '.KPEPPPPPPPWWPK.',
  'KPPPPPPPPPPWKPK.',
  'KPPPPPPPPPPPPPPK',
  'KppPPPPPPPPPPppK',
  '.KppppppppppppK.',
];
const crawler = [
  [...crawlerTop, '.KK.K.K.K.K.KK..', '................'],
  [...crawlerTop, '..KK.K.K.K.K.KK.', '................'],
];

// ---------------------------------------------------------------- pickups
const star = [[
  '................',
  '.......KK.......',
  '......KYYK......',
  '......KYYK......',
  '.....KYLYYK.....',
  'KKKKKKYLYYKKKKKK',
  'KYYYYYLYYYYYYYYK',
  '.KYYYYYYYYYYyyK.',
  '..KYYYYYYYYyyK..',
  '...KYYYYYYyyK...',
  '...KYYYYYYyyK...',
  '..KYYYYKKYYyyK..',
  '..KYYYK..KYyyK..',
  '.KYYK......KyyK.',
  '.KKK........KKK.',
  '................',
]];

const crystal = [[
  '................',
  '......KKKK......',
  '.....KDDCCK.....',
  '....KDDCCCCK....',
  '...KDDCCCCCCK...',
  '..KDDCCCCCCCcK..',
  '..KKKKKKKKKKKK..',
  '..KDCCCCCCCCcK..',
  '...KDCCCCCCcK...',
  '...KDCCCCCCcK...',
  '....KDCCCCcK....',
  '.....KDCCcK.....',
  '......KCcK......',
  '.......KK.......',
  '................',
  '................',
]];

const heart = [[
  '................',
  '................',
  '..KKK....KKK....',
  '.KRRRK..KRRRK...',
  'KRLRRRKKRRRRrK..',
  'KRLRRRRRRRRRrK..',
  'KRRRRRRRRRRRrK..',
  '.KRRRRRRRRRrK...',
  '..KRRRRRRRrK....',
  '...KRRRRRrK.....',
  '....KRRRrK......',
  '.....KRrK.......',
  '......KK........',
  '................',
  '................',
  '................',
]];

// ---------------------------------------------------------------- world
const groundTop = [
  'tTTTTtTTTTTTtTTT',
  'TtTTTTTTTtTTTTTT',
  'TTTTTTbTTTTTTTbT',
  'bTTbbbbbTTbbbbbb',
  'bbbbbbbbbbbbbbbb',
  'bbBbbbbbbbbbbBbb',
  'bbbbbbbBBbbbbbbb',
  'bbbbbbBKKBbbbbbb',
  'bbbbbbbBBbbbbbbb',
  'bbbbbbbbbbbbbbbb',
  'bBbbbbbbbbbbBBbb',
  'bbbbbbbbbbbBKKBb',
  'bbbbBbbbbbbbBBbb',
  'bbbbbbbbbbbbbbbb',
  'bbbbbbbbBbbbbbbb',
  'BbbbbbbbbbbbbbbB',
];
const groundFill = [
  'bbbbbbbbbbbbbbbb',
  'bbbBbbbbbbbbbbbb',
  'bbBKBbbbbbbbbbbb',
  'bbbBbbbbbbBbbbbb',
  'bbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbb',
  'bbbbbbbbBBbbbbbb',
  'bbbbbbbBKKBbbbbb',
  'bbbbbbbbBBbbbbbb',
  'bbbbbbbbbbbbbbbb',
  'bBbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbBbb',
  'bbbbbbbbbbbbBKBb',
  'bbbbBbbbbbbbbBbb',
  'bbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbb',
];
const platform = [
  'KKKKKKKKKKKKKKKK',
  'HHHHHHHHHHHHHHHH',
  'SSSSSSSSSSSSSSSS',
  'SKSSSSSSSSSSSSKS',
  'SSSSSSSSSSSSSSSS',
  'ssssssssssssssss',
  'KKKKKKKKKKKKKKKK',
  '.Ks..........sK.',
  '..K..........K..',
  ...Array(7).fill('................'),
];
const hullTop = [
  'KKKKKKKKKKKKKKKK',
  'KHHHHHHHHHHHHHsK',
  'KHSSSSSSSSSSSSsK',
  'KHSKSSSSSSSSKSsK',
  'KHSSSSSSSSSSSSsK',
  'KHSSSSEEEESSSSsK',
  'KHSSSSSSSSSSSSsK',
  'KHSSSSSSSSSSSSsK',
  'KHSSSSSSSSSSSSsK',
  'KHSSSSSSSSSSSSsK',
  'KHSSSSSSSSSSSSsK',
  'KHSSSSSSSSSSSSsK',
  'KHSKSSSSSSSSKSsK',
  'KHSSSSSSSSSSSSsK',
  'KssssssssssssssK',
  'KKKKKKKKKKKKKKKK',
];
const hullFill = hullTop.map((r, i) => (i === 5 ? 'KHSSSSSSSSSSSSsK' : r.replace(/H/g, 'S')));

// tileset order = tile index used by the tilemap
export const TILE_INDEX = { groundTop: 0, groundFill: 1, platform: 2, hullTop: 3, hullFill: 4 };
const tiles = [groundTop, groundFill, platform, hullTop, hullFill];

const spike = [[
  ...Array(8).fill('................'),
  '...H.......H....',
  '...H.......H....',
  '..HSK.....HSK...',
  '..HSK.....HSK...',
  '.HSSSK...HSSSK..',
  '.HSSSK...HSSSK..',
  'HSSSSSK.HSSSSSK.',
  'KKKKKKKKKKKKKKKK',
]];

const rocketBody = [
  '.......KK.......',
  '......KRRK......',
  '.....KRRRrK.....',
  '.....KRRRrK.....',
  '....KWWWWWwK....',
  '....KWWWWWwK....',
  '....KWKKKWwK....',
  '....KWKCDKwK....',
  '....KWKCCKwK....',
  '....KWKKKWwK....',
  '....KWWWWWwK....',
  '....KWWWWWwK....',
  '....KRRRRRrK....',
  '....KWWWWWwK....',
  '...KKWWWWWwKK...',
  '..KRKWWWWWwKRK..',
  '.KRRKWWWWWwKRrK.',
  '.KRRKWWWWWwKRrK.',
  '.KRRKKKKKKKKRrK.',
  '.KKK.KGGGGK.KKK.',
  '......KKKK......',
];
const rocket = [
  [...rocketBody, '................', '................', '................'],
  [...rocketBody, '......YLLY......', '.......YY.......', '.......RR.......'],
  [...rocketBody, '.....YLLLLY.....', '......YLLY......', '......RYYR......'],
];

const beaconGrid = (X, x) => [
  '................',
  '......KKKK......',
  `.....K${X}${X}${X}${X}K.....`,
  `.....K${X}${x}${X}${X}K.....`,
  '......KKKK......',
  '.......KK.......',
  ...Array(8).fill('.......SK.......'),
  '.....KKKKKK.....',
  '....KSSSSSSK....',
];
const beacon = [beaconGrid('g', 'w'), beaconGrid('N', 'M')];

// ---------------------------------------------------------------- touch buttons
const glyphs = {
  left: ['.....W..', '....WW..', '...WWW..', '..WWWW..', '..WWWW..', '...WWW..', '....WW..', '.....W..'],
  right: ['..W.....', '..WW....', '..WWW...', '..WWWW..', '..WWWW..', '..WWW...', '..WW....', '..W.....'],
  jump: ['........', '...WW...', '..WWWW..', '.WWWWWW.', 'WWWWWWWW', '..WWWW..', '..WWWW..', '..WWWW..'],
  pause: ['........', '.WW..WW.', '.WW..WW.', '.WW..WW.', '.WW..WW.', '.WW..WW.', '.WW..WW.', '........'],
  sound: ['........', '...W..W.', '..WW...W', 'WWWW.W.W', 'WWWW.W.W', '..WW...W', '...W..W.', '........'],
  muted: ['........', '...W....', '..WW.W.W', 'WWWW..W.', 'WWWW.W.W', '..WW....', '...W....', '........'],
};

// Round button: outline, fill, and the glyph scaled up `g` times in the middle.
function buttonGrid(glyph, size, g, fill) {
  const c = (size - 1) / 2, off = (size - 8 * g) / 2;
  return Array.from({ length: size }, (_, y) => {
    let row = '';
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - c, y - c);
      const gx = Math.floor((x - off) / g), gy = Math.floor((y - off) / g);
      const inGlyph = gx >= 0 && gx < 8 && gy >= 0 && gy < 8 && glyph[gy][gx] === 'W';
      row += d > c + 0.5 ? '.' : d > c - 1 ? 'K' : inGlyph ? 'W' : d > c - 2 ? 'w' : fill;
    }
    return row;
  });
}
const bigButton = (name) => [buttonGrid(glyphs[name], 24, 2, 'G'), buttonGrid(glyphs[name], 24, 2, 'c')];
const smallButton = (name) => [buttonGrid(glyphs[name], 12, 1, 'G'), buttonGrid(glyphs[name], 12, 1, 'c')];

// ---------------------------------------------------------------- builders
function drawGrid(ctx, grid, ox, oy, s) {
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const col = PALETTE[row[x]];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(ox + x * s, oy + y * s, s, s);
    }
  });
}

// Lays frames out side by side in one canvas texture; frame names are 0..n-1.
function addSheet(scene, key, frames, s = SCALE) {
  const fw = frames[0][0].length * s;
  const fh = frames[0].length * s;
  const tex = scene.textures.createCanvas(key, fw * frames.length, fh);
  const ctx = tex.getContext();
  frames.forEach((grid, i) => {
    drawGrid(ctx, grid, i * fw, 0, s);
    tex.add(i, 0, i * fw, 0, fw, fh);
  });
  tex.refresh();
}

function rand(seed) {
  // tiny deterministic PRNG so backgrounds look the same every run
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
}

function addStarfield(scene, key, w, h, count, sizes, alpha, seed) {
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  const r = rand(seed);
  for (let i = 0; i < count; i++) {
    const x = Math.floor(r() * w), y = Math.floor(r() * h);
    const s = sizes[Math.floor(r() * sizes.length)];
    ctx.globalAlpha = alpha * (0.5 + r() * 0.5);
    ctx.fillStyle = ['#ffffff', '#cfe8ff', '#fff2c4', '#ffd0f0'][Math.floor(r() * 4)];
    ctx.fillRect(x, y, s, s);
    if (s >= 3 && r() < 0.3) {
      ctx.fillRect(x - s, y + 1, s * 3, 1); // little twinkle cross
      ctx.fillRect(x + 1, y - s, 1, s * 3);
    }
  }
  tex.refresh();
}

function addSky(scene, key, [top, bottom], seed) {
  const w = 960, h = 576;
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // soft nebula clouds
  const r = rand(seed);
  for (let i = 0; i < 6; i++) {
    const x = r() * w, y = r() * h * 0.8, rad = 120 + r() * 220;
    const n = ctx.createRadialGradient(x, y, 0, x, y, rad);
    const hue = Math.floor(r() * 360);
    n.addColorStop(0, `hsla(${hue}, 70%, 55%, 0.16)`);
    n.addColorStop(1, `hsla(${hue}, 70%, 55%, 0)`);
    ctx.fillStyle = n;
    ctx.fillRect(0, 0, w, h);
  }
  tex.refresh();
}

// Small canvas so it pixelates nicely when displayed at 3x.
function addPlanet(scene, key, [base, dark, light]) {
  const w = 80, h = 56;
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  const cx = 40, cy = 28, rad = 20;
  ctx.strokeStyle = light;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 37, 9, -0.25, Math.PI, Math.PI * 2); // back half of ring
  ctx.stroke();
  ctx.globalAlpha = 1;
  const g = ctx.createRadialGradient(cx - 7, cy - 7, 2, cx, cy, rad);
  g.addColorStop(0, light);
  g.addColorStop(0.45, base);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, rad, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = dark;
  ctx.globalAlpha = 0.35;
  ctx.fillRect(cx - 18, cy - 4, 36, 3); // bands
  ctx.fillRect(cx - 16, cy + 6, 32, 2);
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = light;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 37, 9, -0.25, 0, Math.PI); // front half of ring
  ctx.stroke();
  tex.refresh();
}

export function buildTextures(scene, levels) {
  addSheet(scene, 'hero', hero);
  addSheet(scene, 'blob', blob);
  addSheet(scene, 'drone', drone);
  addSheet(scene, 'crawler', crawler);
  addSheet(scene, 'star', star);
  addSheet(scene, 'crystal', crystal);
  addSheet(scene, 'spike', spike);
  addSheet(scene, 'rocket', rocket);
  addSheet(scene, 'beacon', beacon);
  addSheet(scene, 'tiles', tiles);
  addSheet(scene, 'heart-icon', heart, 2);
  addSheet(scene, 'star-icon', star, 2);
  addSheet(scene, 'crystal-icon', crystal, 2);
  ['left', 'right', 'jump'].forEach((n) => addSheet(scene, `btn-${n}`, bigButton(n), 4));
  ['pause', 'sound', 'muted'].forEach((n) => addSheet(scene, `btn-${n}`, smallButton(n), 3));

  const spark = scene.textures.createCanvas('spark', 6, 6);
  spark.getContext().fillStyle = '#ffffff';
  spark.getContext().fillRect(0, 0, 6, 6);
  spark.refresh();

  addStarfield(scene, 'stars-far', 960, 576, 260, [1, 2], 0.6, 7);
  addStarfield(scene, 'stars-near', 960, 576, 70, [2, 3], 1, 99);
  levels.forEach((lvl, i) => {
    addSky(scene, `sky-${i}`, lvl.sky, 31 + i * 17);
    addPlanet(scene, `planet-${i}`, lvl.planet);
  });
}

export function buildAnimations(scene) {
  const a = (key, tex, frames, frameRate, repeat = -1) =>
    scene.anims.create({ key, frames: frames.map((f) => ({ key: tex, frame: f })), frameRate, repeat });
  a('hero-idle', 'hero', [0, 0, 0, 1], 3);
  a('hero-run', 'hero', [2, 3, 4, 5], 12);
  a('hero-jump', 'hero', [6], 1);
  a('hero-fall', 'hero', [7], 1);
  a('blob-walk', 'blob', [0, 1], 4);
  a('drone-fly', 'drone', [0, 1], 14);
  a('crawler-walk', 'crawler', [0, 1], 8);
  a('rocket-fire', 'rocket', [1, 2], 14);
}
