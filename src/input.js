// On-screen touch buttons write here (HUDScene); the player reads it.
export const touch = { left: false, right: false, jump: false };

export const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
