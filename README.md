# Cosmic Hop

A space-themed 2D platformer for the browser, built with Phaser 3. All art is original pixel art defined in code, and every sound effect is synthesized with WebAudio, so there are no asset files.

## Play

ES modules need to be served over HTTP:

```sh
cd space-platformer
python3 -m http.server 8000
```

Then open http://localhost:8000. To pick any level, press **L** (or tap **LEVELS**) on the title screen to open the level select, or add `?level=2` (up to `?level=8`) to the URL.

**Controls:** Arrows/WASD to move, Space/Up/W to jump (hold for higher), Down/S to drop through a floating platform, P or Esc to pause, M to mute (sound and music). The pause screen has buttons to resume, pick another level or go back to the main menu (keys: L for levels, Q for the main menu).

**On phones:** hold the phone in landscape. Use the ◀ ▶ buttons on the left to move and the ▼ button above them to drop through a floating platform, and tap anywhere on the right half of the screen to jump (hold for higher). Pause and mute buttons are in the top-right corner. Adding the page to your home screen runs it full screen with no browser bars.

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

## Enemies

| Enemy | Map letter | Behaviour |
|---|---|---|
| Blob | `b` | walks back and forth; stomp it |
| Spike crawler | `c` | walks back and forth; **can't** be stomped |
| Hover drone | `d` | flies a figure-eight; stomp it |
| Hopper | `h` | orange frog alien that leaps towards you every couple of seconds; stomp it |
| Spitter | `s` | pink pod that turns to face you and spits plasma balls along the ground; jump the shots, stomp the pod |
| Swooper | `w` | hangs in the air and dives at you in an arc when you walk underneath, then flies back; stomp it |

Shields block plasma, and supernova pops it.

## Music

Every level has its own background track, plus one for the menus. There are no audio files: `src/assets/music.js` composes each theme from a chord progression, bass line, arpeggio, drum patterns and a lead melody generated from a seed, and plays it with WebAudio. Each track loops intro, verse, verse with harmony and a drum-free breakdown. The music quietens while paused, stops for the level-complete and game-over jingles, and stops while the tab is hidden.

## Levels

| # | Level | What's new |
|---|---|---|
| 1 | Lunar Landing | the basics |
| 2 | Asteroid Belt | spike crawlers, hover drones |
| 3 | Alien Mothership | spike pits |
| 4 | Frozen Comet | slippery ice, moving platforms |
| 5 | Magma Fields | lava lakes crossed on moving platforms |
| 6 | Crystal Caverns | a cave ceiling with stalactites that hurt if you jump into them |
| 7 | Alien Jungle | crowds of enemies, staircases, platforms at two heights |
| 8 | Event Horizon | everything at once, near a black hole |

## Super powers

Glowing orbs in each level give you a super power. Your active powers show under the top bar, with a bar for the time left. Dying loses them all.

| Orb | Power | Lasts |
|---|---|---|
| Blue shield | **Shield**: takes one hit for you (enemies or spikes) and knocks out whatever hit you | until hit |
| Yellow arrows | **Double jump**: press jump again in mid-air | 15 s |
| Green bolt | **Hyper speed**: run 60% faster | 10 s |
| Red magnet | **Star magnet**: nearby stars and crystals fly to you | 15 s |
| Pink burst | **Supernova**: you're invincible and smash any enemy you touch, even spiky ones | 8 s |

## Looks

The pixel art is lit as if every shape were a rounded 3D object, with light from the top-left (`shadeGrid` in `src/assets/sprites.js`). The ground and platforms are stacked layers that give them depth, everything casts a shadow on the ground below it, and distant hills scroll behind the level.

## Code map

- `src/levels.js`: ASCII level maps (the legend is at the top, so editing a level is just editing text)
- `src/assets/sprites.js`: pixel-art grids, the palette and the 3D lighting
- `src/powers.js`: the super powers and their map letters
- `src/assets/sounds.js`: sound effects
- `src/assets/music.js`: the music themes and the little sequencer that plays them
- `src/entities/`: the player and enemies
- `src/scenes/`: boot, menu, game, HUD, level complete and game over
