# Cosmic Hop

A space-themed 2D platformer for the browser, built with Phaser 3. All art is original pixel art defined in code, and every sound effect is synthesized with WebAudio, so there are no asset files.

## Play

ES modules need to be served over HTTP:

```sh
cd space-platformer
python3 -m http.server 8000
```

Then open http://localhost:8000. Add `?level=2` or `?level=3` to the URL to jump straight to a level.

**Controls:** Arrows/WASD to move, Space/Up/W to jump (hold for higher), P to pause, M to mute.

**On phones:** hold the phone in landscape. Use the ◀ ▶ buttons on the left to move, and tap anywhere on the right half of the screen to jump (hold for higher). Pause and mute buttons are in the top-right corner. Adding the page to your home screen runs it full screen with no browser bars.

The game always fills the window. Wider screens show more of the level, and the canvas renders at the screen's real resolution so pixels and text stay sharp.

## Scoring

| | Points |
|---|---|
| Star | 10 |
| Energy crystal (3 per level, some hidden up high) | 50 |
| Stomp an alien (chained stomps double: 100 → 200 → 400 → 800) | 100+ |
| Reach the rocket | 500 |
| Time bonus | 5 per second left |
| Collect every star in a level | 250 |

Purple spike crawlers can't be stomped, so jump over them. The high score is saved in the browser.

## Code map

- `src/levels.js`: ASCII level maps (the legend is at the top, so editing a level is just editing text)
- `src/assets/sprites.js`: pixel-art grids and the palette
- `src/assets/sounds.js`: sound effects
- `src/entities/`: the player and enemies
- `src/scenes/`: boot, menu, game, HUD, level complete and game over
