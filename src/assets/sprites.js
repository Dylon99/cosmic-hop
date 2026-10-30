// Original pixel art for the game. Each sprite is a grid of characters;
// every character maps to a palette colour ('.' is transparent). Grids are
// drawn into canvas textures at boot, scaled up so one art pixel = SCALE px,
// and lit as if they were rounded 3D shapes (see shadeGrid below).

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
  // ground themes
  i: '#7cc4ee', j: '#4a92cc', k: '#2c5f94', // ice
  u: '#6a3a3a', X: '#4a2a2e', x: '#2e1a20', V: '#ff7a1a', // lava rock
  h: '#e0b0ff', q: '#3e1a70', // crystal
  z: '#4a3020', Z: '#2e1c12', A: '#7a5a30', // jungle soil
  a: '#12131f', e: '#1c1e30', // void
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

// Hops towards you every couple of seconds.
const hopper = [
  [
    '................',
    '................',
    '................',
    '................',
    '................',
    '....KKK..KKK....',
    '...KWWWKKWWWK...',
    '...KWKWKKWKWK...',
    '..KOOOOOOOOOOK..',
    '.KOoOOOOOOOOOOK.',
    '.KOOOKKKKKKOOOK.',
    '.KOOOOOOOOOOOOK.',
    '.KyOOOOOOOOOOyK.',
    'KyyKyyOOOOyyKyyK',
    'KyyKKyyyyyyKKyyK',
    '.KKK.KKKKKK.KKK.',
  ],
  [
    '....KKK..KKK....',
    '...KWWWKKWWWK...',
    '...KWKWKKWKWK...',
    '..KOOOOOOOOOOK..',
    '.KOoOOOOOOOOOOK.',
    '.KOOOKKKKKKOOOK.',
    '.KOOOOOOOOOOOOK.',
    '..KOOOOOOOOOOK..',
    '..KyyOOOOOOyyK..',
    '...KyyKKKKyyK...',
    '...KyK....KyK...',
    '..KyyK....KyyK..',
    '..KyK......KyK..',
    '.KyyK......KyyK.',
    '.KKK........KKK.',
    '................',
  ],
];

// Plant pod that spits plasma balls along the ground. Frame 1 has its mouth open.
const spitter = [
  [
    '................',
    '................',
    '......KKKK......',
    '....KKEEEEKK....',
    '...KEELEEEEEK...',
    '..KEELEEEEEEEK..',
    '..KEEEEEWWKEEK..',
    '..KEEEEEWKKEEK..',
    '..KEEEEEEEEKKK..',
    '..KpEEEEEEEEEK..',
    '...KpEEEEEEEK...',
    '....KKppppKK....',
    '.....KnnnnK.....',
    '....KnNNNNnK....',
    '..KKnNNNNNNnKK..',
    '.KKKKKKKKKKKKKK.',
  ],
  [
    '................',
    '................',
    '......KKKK......',
    '....KKEEEEKK....',
    '...KEELEEEEEK...',
    '..KEELEEEEEEEK..',
    '..KEEEEEWWKEEK..',
    '..KEEEEEWKKRRK..',
    '..KEEEEEEKRRRRK.',
    '..KpEEEEEEKKKKK.',
    '...KpEEEEEEEK...',
    '....KKppppKK....',
    '.....KnnnnK.....',
    '....KnNNNNnK....',
    '..KKnNNNNNNnKK..',
    '.KKKKKKKKKKKKKK.',
  ],
];
const plasma = [
  [
    '..KKKK..',
    '.KMMMNK.',
    'KMWMMNnK',
    'KMMMMNnK',
    'KNMMNNnK',
    'KNNNNnnK',
    '.KnnnnK.',
    '..KKKK..',
  ],
];

// Hangs in the air, then dives at you when you walk underneath.
const swooper = [
  [
    '................',
    'K..............K',
    'PK............KP',
    'PPK..........KPP',
    'pPPK.K....K.KPPp',
    '.pPPKCK..KCKPPp.',
    '..ppKCCCCCCKpp..',
    '....KCWCCWCK....',
    '....KCRCCRCK....',
    '....KcCCCCcK....',
    '.....KcLLcK.....',
    '......KccK......',
    '.......KK.......',
    '................',
    '................',
    '................',
  ],
  [
    '................',
    '................',
    '................',
    '................',
    '.....K....K.....',
    '....KCK..KCK....',
    '....KCCCCCCK....',
    '..KKKCWCCWCKKK..',
    '.KPPKCRCCRCKPPK.',
    'KPPpKcCCCCcKpPPK',
    'PPpK.KcLLcK.KpPP',
    'Pp....KccK....pP',
    'p......KK......p',
    '................',
    '................',
    '................',
  ],
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

// Other looks for the '#' ground: the moon rock grids with their colours swapped.
const THEME_COLORS = {
  ice: { t: 'W', T: 'D', b: 'i', B: 'j', K: 'k' },
  lava: { t: 'u', T: 'X', b: 'x', B: 'V', K: 'Y' },
  crystal: { t: 'h', T: 'P', b: 'p', B: 'q', K: 'E' },
  jungle: { t: 'M', T: 'N', b: 'z', B: 'Z', K: 'A' },
  void: { t: 'C', T: 'c', b: 'a', B: 'e', K: 'C' },
};
const recolor = (grid, map) => grid.map((row) => [...row].map((ch) => map[ch] || ch).join(''));
const themes = Object.keys(THEME_COLORS);

// Tile indices of the top and filler ground tiles for a level's `ground` theme.
export function groundTiles(theme = 'moon') {
  const i = themes.indexOf(theme);
  if (i < 0) return { top: TILE_INDEX.groundTop, fill: TILE_INDEX.groundFill };
  return { top: 5 + i * 2, fill: 6 + i * 2 };
}

const tiles = [
  groundTop, groundFill, platform, hullTop, hullFill,
  ...themes.flatMap((t) => [recolor(groundTop, THEME_COLORS[t]), recolor(groundFill, THEME_COLORS[t])]),
];

// Moving platform: two platform tiles side by side.
const mover = [platform.map((row) => row + row)];

// Lava, two frames of the surface rolling to the left.
const lavaGrid = [
  '................',
  '................',
  '..LL.......LL...',
  '.LYYL.....LYYL..',
  'LYYYYLLLLLYYYYLL',
  'YYYyyYYYYYYyyYYY',
  'yyyyyyyyyyyyyyyy',
  'yyOyyyyyyyOyyyyy',
  'OOOOOyyOOOOOOyyO',
  'OOOOOOOOOOOOOOOO',
  'ROOOOOOROOOOOOOR',
  'RROOORRRRROOORRR',
  'RRRRRRRRRRRRRRRR',
  'rRRRRRrRRRRRRrRR',
  'rrRRrrrrrRRrrrrr',
  'rrrrrrrrrrrrrrrr',
];
const lava = [lavaGrid, lavaGrid.map((row) => row.slice(4) + row.slice(0, 4))];

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
  down: ['..WWWW..', '..WWWW..', '..WWWW..', 'WWWWWWWW', '.WWWWWW.', '..WWWW..', '...WW...', '........'],
  pause: ['........', '.WW..WW.', '.WW..WW.', '.WW..WW.', '.WW..WW.', '.WW..WW.', '.WW..WW.', '........'],
  sound: ['........', '...W..W.', '..WW...W', 'WWWW.W.W', 'WWWW.W.W', '..WW...W', '...W..W.', '........'],
  muted: ['........', '...W....', '..WW.W.W', 'WWWW..W.', 'WWWW.W.W', '..WW....', '...W....', '........'],
  shield: ['.WWWWWW.', '.WWWWWW.', '.WWWWWW.', '.WWWWWW.', '..WWWW..', '..WWWW..', '...WW...', '........'],
  jump: ['...WW...', '..WWWW..', '.WW..WW.', '...WW...', '..WWWW..', '.WW..WW.', '........', '........'],
  speed: ['....WWW.', '...WWW..', '..WWW...', '.WWWWWW.', '...WWW..', '..WWW...', '.WW.....', 'W.......'],
  magnet: ['........', '.WW..WW.', '.WW..WW.', '.WW..WW.', '.WW..WW.', '.WWWWWW.', '..WWWW..', '........'],
  nova: ['...W....', 'W..W..W.', '.W.W.W..', '..WWW...', 'WWWWWWW.', '..WWW...', '.W.W.W..', 'W..W..W.'],
};
// The power name doubles as glyph name: [fill, rim]
const ORB_COLORS = { shield: ['c', 'C'], jump: ['y', 'Y'], speed: ['n', 'N'], magnet: ['r', 'R'], nova: ['p', 'E'] };

// Round button: outline, fill, and the glyph scaled up `g` times in the middle.
function buttonGrid(glyph, size, g, fill, rim = 'w') {
  const c = (size - 1) / 2, off = (size - 8 * g) / 2;
  return Array.from({ length: size }, (_, y) => {
    let row = '';
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - c, y - c);
      const gx = Math.floor((x - off) / g), gy = Math.floor((y - off) / g);
      const inGlyph = gx >= 0 && gx < 8 && gy >= 0 && gy < 8 && glyph[gy][gx] === 'W';
      row += d > c + 0.5 ? '.' : d > c - 1 ? 'K' : inGlyph ? 'W' : d > c - 2 ? rim : fill;
    }
    return row;
  });
}
const bigButton = (name) => [buttonGrid(glyphs[name], 24, 2, 'G'), buttonGrid(glyphs[name], 24, 2, 'c')];
const smallButton = (name) => [buttonGrid(glyphs[name], 12, 1, 'G'), buttonGrid(glyphs[name], 12, 1, 'c')];
const powerOrb = (name) => [buttonGrid(glyphs[name], 16, 1, ...ORB_COLORS[name])];

// ---------------------------------------------------------------- builders
// ---------------------------------------------------------------- 3D lighting
const RGB = Object.fromEntries(Object.entries(PALETTE).map(([k, hex]) =>
  [k, [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))]));

const unit = ([x, y, z]) => {
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l];
};
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const LIGHT = unit([-0.55, -0.75, 0.9]); // from the top-left, in front of the screen
const HALF = unit([LIGHT[0], LIGHT[1], LIGHT[2] + 1]); // for the specular highlight

// Turns a pixel grid into lit RGBA pixels at `s` px per art pixel.
// Every shape bounded by outline or transparency is treated as a dome that
// rises `radius` art px from its edges; brighter colours also sit a little
// higher (`bump`), so details read as raised or sunk into the surface.
// `open` lists the grid sides that count as empty space (t, r, b, l);
// tiles leave sides closed so neighbouring tiles join without a seam.
// With `outline: false` the dark K pixels are part of the surface, not edges.
function shadeGrid(grid, s, { radius = 3, bump = 0.8, gloss = 0.55, open = 'trbl', outline = true, depth = 0.8 } = {}) {
  const h = grid.length, w = grid[0].length;
  const cell = (x, y) => grid[y][x];
  const isEdge = (ch) => !RGB[ch] || (outline && ch === 'K');
  const edges = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (isEdge(cell(x, y))) edges.push([x, y]);

  const height = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = cell(x, y);
      if (isEdge(ch)) continue;
      let d = Infinity;
      for (const [ex, ey] of edges) d = Math.min(d, Math.hypot(ex - x, ey - y));
      if (open.includes('t')) d = Math.min(d, y + 1);
      if (open.includes('b')) d = Math.min(d, h - y);
      if (open.includes('l')) d = Math.min(d, x + 1);
      if (open.includes('r')) d = Math.min(d, w - x);
      const t = Math.min(Math.max((d - 0.5) / radius, 0), 1);
      const [r, g, b] = RGB[ch];
      const lum = (0.3 * r + 0.55 * g + 0.15 * b) / 255;
      height[y * w + x] = (radius * Math.sqrt(1 - (1 - t) ** 2) + bump * lum) * depth;
    }
  }

  // height between art pixel centres, with open sides dropping to zero
  const at = (x, y) => {
    if ((y < 0 && open.includes('t')) || (y >= h && open.includes('b'))
      || (x < 0 && open.includes('l')) || (x >= w && open.includes('r'))) return 0;
    return height[Math.min(Math.max(y, 0), h - 1) * w + Math.min(Math.max(x, 0), w - 1)];
  };
  const sample = (u, v) => {
    const x0 = Math.floor(u), y0 = Math.floor(v), fx = u - x0, fy = v - y0;
    return (at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx) * (1 - fy)
      + (at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx) * fy;
  };

  const out = new Uint8ClampedArray(w * s * h * s * 4);
  for (let py = 0; py < h * s; py++) {
    for (let px = 0; px < w * s; px++) {
      const ch = cell(Math.floor(px / s), Math.floor(py / s));
      const base = RGB[ch];
      if (!base) continue;
      const i = (py * w * s + px) * 4;
      out[i + 3] = 255;
      if (outline && ch === 'K') {
        out.set(base, i);
        continue;
      }
      const u = (px + 0.5) / s - 0.5, v = (py + 0.5) / s - 0.5;
      const n = unit([sample(u - 0.5, v) - sample(u + 0.5, v), sample(u, v - 0.5) - sample(u, v + 0.5), 1]);
      const diffuse = Math.max(0, dot(n, LIGHT)) / LIGHT[2]; // 1 on a flat face
      const spec = Math.max(0, dot(n, HALF)) ** 30 * gloss * 255;
      const shade = 0.38 + 0.62 * diffuse;
      for (let c = 0; c < 3; c++) out[i + c] = base[c] * shade + spec;
    }
  }
  return out;
}

// Lays frames out side by side in one canvas texture; frame names are 0..n-1.
// `light` is shading options for every frame, an array of them per frame,
// or false for flat colour.
function addSheet(scene, key, frames, s = SCALE, light = {}) {
  const fw = frames[0][0].length * s;
  const fh = frames[0].length * s;
  const tex = scene.textures.createCanvas(key, fw * frames.length, fh);
  const ctx = tex.getContext();
  frames.forEach((grid, i) => {
    const opts = Array.isArray(light) ? light[i] : light;
    const img = ctx.createImageData(fw, fh);
    if (opts) {
      img.data.set(shadeGrid(grid, s, opts));
    } else {
      grid.forEach((row, y) => [...row].forEach((ch, x) => {
        if (!RGB[ch]) return;
        for (let dy = 0; dy < s; dy++) {
          for (let dx = 0; dx < s; dx++) img.data.set([...RGB[ch], 255], (((y * s + dy) * fw) + x * s + dx) * 4);
        }
      }));
    }
    ctx.putImageData(img, i * fw, 0);
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

// Glassy sphere drawn around the player while the shield is up.
function addBubble(scene) {
  const size = 96, c = size / 2;
  const tex = scene.textures.createCanvas('bubble', size, size);
  const ctx = tex.getContext();
  const g = ctx.createRadialGradient(c, c, 0, c, c, c - 1);
  g.addColorStop(0, 'rgba(65, 224, 255, 0.04)');
  g.addColorStop(0.72, 'rgba(65, 224, 255, 0.14)');
  g.addColorStop(0.93, 'rgba(160, 240, 255, 0.65)');
  g.addColorStop(1, 'rgba(65, 224, 255, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const shine = ctx.createRadialGradient(c - 17, c - 19, 0, c - 17, c - 19, 16);
  shine.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  shine.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, size, size);
  tex.refresh();
}

// Soft oval that things cast onto the ground below them.
function addShadow(scene) {
  const w = 48, h = 14;
  const tex = scene.textures.createCanvas('shadow', w, h);
  const ctx = tex.getContext();
  ctx.scale(1, h / w);
  const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  g.addColorStop(0, 'rgba(5, 6, 15, 0.6)');
  g.addColorStop(0.6, 'rgba(5, 6, 15, 0.35)');
  g.addColorStop(1, 'rgba(5, 6, 15, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, w);
  tex.refresh();
}

// Two ranges of distant hills, lit from the left like the sprites. The
// ridge lines only use whole waves across the width so the texture tiles.
function addHills(scene, key, { sky, planet }, seed) {
  const w = 960, h = 576;
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  const r = rand(seed);
  const mix = (a, b, t) => {
    const ca = Phaser.Display.Color.HexStringToColor(a), cb = Phaser.Display.Color.HexStringToColor(b);
    const c = Phaser.Display.Color.Interpolate.ColorWithColor(ca, cb, 100, t * 100);
    return `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
  };
  [[0.35, 300, 0.55], [0.6, 380, 0.85]].forEach(([tone, base, alpha]) => {
    const waves = [1, 2, 3, 5, 8].map((k) => [k, r() * Math.PI * 2, (40 / k) * (0.5 + r())]);
    const ridge = (x) => base + waves.reduce((y, [k, ph, amp]) => y + Math.sin((x / w) * k * Math.PI * 2 + ph) * amp, 0);
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 4) ctx.lineTo(x, ridge(x));
      ctx.lineTo(w, h);
      ctx.closePath();
    };
    ctx.globalAlpha = alpha;
    const fill = ctx.createLinearGradient(0, base - 60, 0, h);
    fill.addColorStop(0, mix(sky[1], planet[1], tone));
    fill.addColorStop(1, mix(sky[0], '#000000', 0.4));
    ctx.fillStyle = fill;
    path();
    ctx.fill();
    // sunlit slopes: brighten where the ridge rises towards the right
    ctx.save();
    path();
    ctx.clip();
    for (let x = 0; x < w; x += 2) {
      const slope = ridge(x) - ridge(x + 6);
      if (slope <= 0) continue;
      ctx.fillStyle = planet[2];
      ctx.globalAlpha = Math.min(slope / 14, 1) * 0.22 * alpha;
      ctx.fillRect(x, ridge(x), 2, 70);
    }
    ctx.restore();
    ctx.globalAlpha = alpha * 0.8;
    ctx.strokeStyle = mix(planet[2], sky[1], 0.4);
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 4) ctx[x ? 'lineTo' : 'moveTo'](x, ridge(x));
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
  tex.refresh();
}

export function buildTextures(scene, levels) {
  addSheet(scene, 'hero', hero);
  addSheet(scene, 'blob', blob);
  addSheet(scene, 'drone', drone);
  addSheet(scene, 'crawler', crawler);
  addSheet(scene, 'hopper', hopper);
  addSheet(scene, 'spitter', spitter);
  addSheet(scene, 'plasma', plasma, SCALE, { radius: 2, gloss: 1 });
  addSheet(scene, 'swooper', swooper);
  addSheet(scene, 'star', star);
  addSheet(scene, 'crystal', crystal);
  addSheet(scene, 'spike', spike);
  addSheet(scene, 'spike-down', [[...spike[0]].reverse()]);
  addSheet(scene, 'lava', lava, SCALE, false);
  addSheet(scene, 'mover', mover, SCALE, { open: 'trbl', radius: 2 });
  addSheet(scene, 'rocket', rocket);
  addSheet(scene, 'beacon', beacon);
  // ground is one continuous lumpy surface rounded only along its top;
  // platforms and hull panels are separate slabs
  const ground = { outline: false, bump: 1.6, radius: 4, gloss: 0.3 };
  addSheet(scene, 'tiles', tiles, SCALE, [
    { ...ground, open: 't' }, { ...ground, open: '' },
    { open: 'tb', radius: 2 }, { radius: 3, gloss: 0.8 }, { radius: 3, gloss: 0.8 },
    ...themes.flatMap((t) => {
      const look = t === 'ice' || t === 'crystal' ? { ...ground, gloss: 0.9 } : ground;
      return [{ ...look, open: 't' }, { ...look, open: '' }];
    }),
  ]);
  addSheet(scene, 'heart-icon', heart, 2);
  addSheet(scene, 'star-icon', star, 2);
  addSheet(scene, 'crystal-icon', crystal, 2);
  ['left', 'right', 'jump', 'down'].forEach((n) => addSheet(scene, `btn-${n}`, bigButton(n), 4));
  ['pause', 'sound', 'muted'].forEach((n) => addSheet(scene, `btn-${n}`, smallButton(n), 3));
  Object.keys(ORB_COLORS).forEach((n) => {
    addSheet(scene, `power-${n}`, powerOrb(n), SCALE, { radius: 6, gloss: 1 });
    addSheet(scene, `power-${n}-icon`, powerOrb(n), 2, { radius: 6, gloss: 1 });
  });
  addBubble(scene);
  addShadow(scene);

  const spark = scene.textures.createCanvas('spark', 6, 6);
  spark.getContext().fillStyle = '#ffffff';
  spark.getContext().fillRect(0, 0, 6, 6);
  spark.refresh();

  addStarfield(scene, 'stars-far', 960, 576, 260, [1, 2], 0.6, 7);
  addStarfield(scene, 'stars-near', 960, 576, 70, [2, 3], 1, 99);
  levels.forEach((lvl, i) => {
    addSky(scene, `sky-${i}`, lvl.sky, 31 + i * 17);
    addPlanet(scene, `planet-${i}`, lvl.planet);
    addHills(scene, `hills-${i}`, lvl, 53 + i * 11);
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
  a('swooper-hang', 'swooper', [0, 1], 3);
  a('swooper-fly', 'swooper', [0, 1], 12);
  a('rocket-fire', 'rocket', [1, 2], 14);
  a('lava-flow', 'lava', [0, 1], 3);
}
