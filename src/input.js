// On-screen touch buttons write here (HUDScene); the player reads it.
export const touch = { left: false, right: false, jump: false, down: false };

export const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Two players share one keyboard, so only offer it where there is likely to
// be one (touchscreen laptops have a fine pointer too, phones don't).
export const canPlayTwo = !isTouchDevice || window.matchMedia('(any-pointer: fine)').matches;

// Keys per control scheme. One player gets both sets plus the touch buttons;
// with two, player 1 is on WASD (+ Space) and player 2 on the arrows.
export const CONTROLS = {
  solo: { left: ['LEFT', 'A'], right: ['RIGHT', 'D'], jump: ['UP', 'W', 'SPACE'], down: ['DOWN', 'S'], touch: true },
  p1: { left: ['A'], right: ['D'], jump: ['W', 'SPACE'], down: ['S'], touch: false },
  p2: { left: ['LEFT'], right: ['RIGHT'], jump: ['UP'], down: ['DOWN'], touch: false },
};
