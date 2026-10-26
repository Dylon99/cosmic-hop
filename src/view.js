// The canvas is rendered at the device's real resolution (see main.js) and
// every scene zooms its camera so the game works in "logical" pixels:
// the level is always 576 logical px tall, whatever the screen size.

export const DESIGN_W = 960;
export const DESIGN_H = 576;
const MIN_GAME_W = 720; // narrower than this and we show extra sky instead

export const gameZoom = (scene) => Math.min(scene.scale.height / DESIGN_H, scene.scale.width / MIN_GAME_W);

// The world-space rectangle a camera currently shows.
export function visibleRect(cam) {
  const w = cam.width / cam.zoom, h = cam.height / cam.zoom;
  return new Phaser.Geom.Rectangle(cam.scrollX + (cam.width - w) / 2, cam.scrollY + (cam.height - h) / 2, w, h);
}

export const textResolution = (scene) => Phaser.Math.Clamp(scene.cameras.main.zoom, 1, 4);

// Re-render text at the camera's zoom so it is drawn at device resolution.
export function syncTextResolution(scene) {
  const res = textResolution(scene);
  scene.children.list.forEach((o) => {
    if (o.type === 'Text' && o.style.resolution !== res) o.setResolution(res);
  });
}

// Gameplay camera: fill the screen height; wider screens see more of the level.
export function fitGame(scene, worldW) {
  const cam = scene.cameras.main;
  const zoom = gameZoom(scene);
  const viewH = cam.height / zoom;
  cam.setZoom(zoom);
  cam.setBounds(0, Math.min(0, DESIGN_H - viewH), worldW, Math.max(DESIGN_H, viewH));
  syncTextResolution(scene);
}

// Menus: keep the 960x576 layout fully visible and centred.
export function fitUI(scene) {
  const cam = scene.cameras.main;
  cam.setZoom(Math.min(cam.width / DESIGN_W, cam.height / DESIGN_H));
  cam.centerOn(DESIGN_W / 2, DESIGN_H / 2);
  syncTextResolution(scene);
}

// HUD overlay: same scale as the game, origin at the top-left screen corner.
// Returns the visible size in logical px.
export function fitOverlay(scene) {
  const cam = scene.cameras.main;
  const zoom = gameZoom(scene);
  const w = cam.width / zoom, h = cam.height / zoom;
  cam.setZoom(zoom);
  cam.centerOn(w / 2, h / 2);
  syncTextResolution(scene);
  return { w, h };
}

// Calls fn whenever the canvas is resized, until the scene shuts down.
export function onViewChange(scene, fn) {
  scene.scale.on('resize', fn, scene);
  scene.events.once('shutdown', () => scene.scale.off('resize', fn, scene));
}

// Phone notch / home-bar insets, converted to logical px for this scene.
export function safeInsets(scene) {
  const probe = document.getElementById('safe-area');
  const s = probe ? getComputedStyle(probe) : null;
  const px = (v) => (s ? parseFloat(s[v]) || 0 : 0);
  const toLogical = scene.scale.width / window.innerWidth / scene.cameras.main.zoom;
  return {
    top: px('paddingTop') * toLogical,
    right: px('paddingRight') * toLogical,
    bottom: px('paddingBottom') * toLogical,
    left: px('paddingLeft') * toLogical,
  };
}
