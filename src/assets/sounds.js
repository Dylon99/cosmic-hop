// Tiny WebAudio synth: every sound effect is generated, no audio files.

let ctx = null;
let master = null;
let muted = false;

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone({ freq, to = freq, dur = 0.15, type = 'square', vol = 0.12, delay = 0 }) {
  const ac = audio();
  if (!ac || muted) return;
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise({ dur = 0.5, vol = 0.2, from = 1200, to = 200, delay = 0 }) {
  const ac = audio();
  if (!ac || muted) return;
  const t = ac.currentTime + delay;
  const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + dur);
  const gain = ac.createGain();
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(filter).connect(gain).connect(master);
  src.start(t);
}

const notes = (list, step, opts) =>
  list.forEach((freq, i) => tone({ freq, delay: i * step, ...opts }));

export const sfx = {
  jump: () => tone({ freq: 260, to: 620, dur: 0.14, vol: 0.07 }),
  star: () => notes([988, 1319], 0.06, { dur: 0.1, vol: 0.07 }),
  crystal: () => notes([784, 988, 1175, 1568], 0.05, { dur: 0.12, type: 'triangle', vol: 0.14 }),
  stomp: () => tone({ freq: 220, to: 55, dur: 0.18, type: 'triangle', vol: 0.25 }),
  hurt: () => tone({ freq: 440, to: 70, dur: 0.45, type: 'sawtooth', vol: 0.1 }),
  checkpoint: () => notes([523, 659, 784], 0.08, { dur: 0.14, type: 'triangle', vol: 0.15 }),
  launch: () => {
    noise({ dur: 1.8, vol: 0.25, from: 300, to: 2400 });
    tone({ freq: 60, to: 240, dur: 1.6, type: 'sawtooth', vol: 0.06 });
  },
  complete: () => notes([523, 659, 784, 1047, 784, 1047], 0.11, { dur: 0.16, vol: 0.08 }),
  gameOver: () => notes([392, 330, 262, 196], 0.22, { dur: 0.3, type: 'triangle', vol: 0.18 }),
  select: () => tone({ freq: 660, to: 880, dur: 0.08, vol: 0.06 }),
};

export function toggleMute() {
  muted = !muted;
  return muted;
}

export const isMuted = () => muted;
