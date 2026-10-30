// Super powers, picked up from glowing orbs placed in the level maps.
// `time` is how many seconds a power lasts (0 = until it is used up).

export const POWERS = {
  shield: { char: 'O', label: 'SHIELD', color: '#41e0ff', time: 0 }, // absorbs one hit
  jump: { char: 'J', label: 'DOUBLE JUMP', color: '#ffd23f', time: 15 }, // jump again in mid-air
  speed: { char: 'Z', label: 'HYPER SPEED', color: '#5fd35f', time: 10 }, // run much faster
  magnet: { char: 'M', label: 'STAR MAGNET', color: '#ff6b6b', time: 15 }, // pulls stars and crystals in
  nova: { char: 'N', label: 'SUPERNOVA', color: '#ff5ac8', time: 8 }, // invincible, smash anything
};

export const POWER_BY_CHAR = Object.fromEntries(Object.entries(POWERS).map(([name, p]) => [p.char, name]));
