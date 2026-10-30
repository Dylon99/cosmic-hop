// Background music, composed on the fly. Each theme is a chord progression
// with a bass line, an arpeggio, drums and a lead melody that is made up from
// a seed (so a level always gets the same tune). Notes are scheduled a little
// ahead of time on the WebAudio clock so they stay in time.

import { audio, output } from './sounds.js';

const MODES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  harmonic: [0, 2, 3, 5, 7, 8, 11],
};

// Patterns are one bar of 16th notes.
//   bass:  x root, o octave up, 5 fifth, . rest
//   arp:   0-3 chord tone (root, third, fifth, seventh), . rest
//   lead:  x a melody note starts here
//   drums: x hit
// `prog` lists the chord (scale degree, 0 = tonic) for each bar.
export const THEMES = {
  menu: {
    bpm: 100, root: 45, mode: 'dorian', prog: [0, 5, 3, 4], seed: 11, echo: 0.3,
    bass: 'x...x.o.x...x.o.', bassWave: 'triangle',
    arp: '0.1.2.1.0.1.2.1.', arpWave: 'triangle', arpOct: 2,
    lead: 'x..x..x.x...x...', leadWave: 'square',
    kick: 'x.......x.......', snare: '....x.......x...', hat: '..x...x...x...x.',
  },
  moon: {
    bpm: 112, root: 48, mode: 'major', prog: [0, 5, 3, 4], seed: 21, echo: 0.2,
    bass: 'x..x..x.x..x..x.', bassWave: 'square', bassCut: 700,
    arp: '0.2.1.2.0.2.1.2.', arpWave: 'triangle', arpOct: 2,
    lead: 'x.x.x...x.x.xx..', leadWave: 'square',
    kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.',
  },
  asteroid: {
    bpm: 132, root: 50, mode: 'minor', prog: [0, 6, 5, 6], seed: 33, echo: 0.15,
    bass: 'xxoxxxoxxxoxxxox', bassWave: 'sawtooth', bassCut: 900,
    arp: '0120012001200120', arpWave: 'square', arpOct: 1,
    lead: 'x...x.x...x.x.x.', leadWave: 'sawtooth',
    kick: 'x...x...x...x...', snare: '....x.......x..x', hat: 'xxxxxxxxxxxxxxxx',
  },
  mothership: {
    bpm: 120, root: 45, mode: 'phrygian', prog: [0, 1, 0, 6], seed: 47, echo: 0.25,
    bass: 'x.x.x.x.x.x.x.x.', bassWave: 'square', bassCut: 600,
    arp: '0.1.2.3.2.1.0...', arpWave: 'square', arpOct: 1,
    lead: 'x.....x.x...x...', leadWave: 'sawtooth',
    kick: 'x..x..x.x..x..x.', snare: '....x.......x...', hat: '..x...x...x...x.',
  },
  ice: {
    bpm: 104, root: 52, mode: 'lydian', prog: [0, 1, 0, 1], seed: 59, echo: 0.45, pad: true,
    bass: 'x.......x...o...', bassWave: 'triangle',
    arp: '0123321001233210', arpWave: 'sine', arpOct: 2,
    lead: 'x...x...x.x.x...', leadWave: 'triangle',
    kick: 'x.........x.....', snare: '................', hat: '..x...x...x...x.',
  },
  lava: {
    bpm: 90, root: 40, mode: 'harmonic', prog: [0, 0, 5, 4], seed: 61, echo: 0.2,
    bass: 'x.xxx.x.x.xxx.o.', bassWave: 'sawtooth', bassCut: 500,
    arp: '0...1...2...1...', arpWave: 'square', arpOct: 1,
    lead: 'x.....x.x.......', leadWave: 'sawtooth',
    kick: 'x.x...x.x.x...x.', snare: '....x.......x...', hat: '....x...x...x...',
  },
  crystal: {
    bpm: 108, root: 49, mode: 'minor', prog: [0, 5, 2, 6], seed: 73, echo: 0.55, pad: true,
    bass: 'x.......x.......', bassWave: 'triangle',
    arp: '0120312001203120', arpWave: 'sine', arpOct: 2,
    lead: 'x..x..x...x.....', leadWave: 'triangle',
    kick: 'x.......x..x....', snare: '........x.......', hat: '..x...x...x...x.',
  },
  jungle: {
    bpm: 126, root: 47, mode: 'dorian', prog: [0, 3, 0, 4], seed: 87, echo: 0.2,
    bass: 'x..x..x...x..x..', bassWave: 'square', bassCut: 800,
    arp: '0.2..1.20.2..1.2', arpWave: 'triangle', arpOct: 1,
    lead: 'x.xx.x..x.x.x...', leadWave: 'square',
    kick: 'x..x..x...x..x..', snare: '....x..x....x...', hat: 'x.xxx.xxx.xxx.xx',
  },
  void: {
    bpm: 140, root: 44, mode: 'harmonic', prog: [0, 5, 3, 4], seed: 97, echo: 0.3,
    bass: 'xoxoxoxoxoxoxoxo', bassWave: 'sawtooth', bassCut: 1200,
    arp: '0123012301230123', arpWave: 'square', arpOct: 1,
    lead: 'x.x.x...x.x.x.x.', leadWave: 'sawtooth',
    kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.xxx.xxx.xxx.xx',
  },
};

const VOLUME = 0.55;
const freq = (midi) => 440 * 2 ** ((midi - 69) / 12);

function rand(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
}

// MIDI note of scale degree `d` (any integer; 7 = an octave up).
const pitch = (theme, d) => {
  const scale = MODES[theme.mode];
  return theme.root + scale[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7);
};

// Steps until the next non-rest in a pattern, so notes ring until the next one.
const length = (pattern, s) => {
  let n = 1;
  while (s + n < 16 && pattern[s + n] === '.') n++;
  return n;
};

// The lead: a seeded random walk over the scale that lands on a chord tone
// on every beat. Returns [bar][step] -> { degree, steps } or undefined.
function compose(theme) {
  const r = rand(theme.seed);
  let d = theme.prog[0] + 7;
  return theme.prog.map((chord) => {
    const bar = [];
    for (let s = 0; s < 16; s++) {
      if (theme.lead[s] !== 'x') continue;
      d += [-2, -1, -1, 0, 1, 1, 2][Math.floor(r() * 7)];
      d = Phaser.Math.Clamp(d, chord + 4, chord + 12);
      if (s % 4 === 0) {
        // snap to the nearest chord tone (root, third or fifth)
        const tones = [0, 2, 4, 7, 9, 11].map((t) => chord + t);
        d = tones.reduce((best, t) => (Math.abs(t - d) < Math.abs(best - d) ? t : best));
      }
      bar[s] = { degree: d, steps: Math.min(length(theme.lead, s), 4) };
    }
    return bar;
  });
}

let noiseBuffer = null;
function noise(ac) {
  if (!noiseBuffer) {
    noiseBuffer = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

// One theme playing into `out` on the audio context `ac`.
export class Song {
  constructor(name, ac, out) {
    this.name = name;
    this.theme = THEMES[name];
    this.melody = compose(this.theme);
    this.ac = ac;
    this.bus = ac.createGain();
    this.bus.gain.value = VOLUME;
    this.bus.connect(out);
    // echo: a delay that feeds back into itself
    this.echo = ac.createDelay(1);
    this.echo.delayTime.value = (60 / this.theme.bpm) * 0.75;
    const feedback = ac.createGain();
    feedback.gain.value = this.theme.echo;
    this.echoIn = ac.createGain();
    this.echoIn.gain.value = this.theme.echo * 0.6;
    this.echoIn.connect(this.echo).connect(feedback).connect(this.echo);
    this.echo.connect(this.bus);
    this.step = 0;
  }

  start() {
    this.next = this.ac.currentTime + 0.1;
    this.timer = setInterval(() => this.schedule(), 25);
  }

  schedule() {
    const ac = this.ac;
    // after a long stall (background tab) skip ahead rather than catch up
    if (this.next < ac.currentTime - 0.1) this.next = ac.currentTime + 0.05;
    const stepTime = 60 / this.theme.bpm / 4;
    while (this.next < ac.currentTime + 0.15) {
      this.play(this.step, this.next, stepTime);
      this.next += stepTime;
      this.step++;
    }
  }

  // One 16th note. The song runs intro, then loops verse, verse with
  // harmony, and a breakdown without drums.
  play(step, t, stepTime) {
    const th = this.theme;
    const bars = th.prog.length;
    const s = step % 16, bar = Math.floor(step / 16) % bars;
    const cycle = Math.floor(step / 16 / bars);
    const section = cycle === 0 ? 'intro' : ['verse', 'harmony', 'break'][(cycle - 1) % 3];
    const chord = th.prog[bar];

    if (section !== 'break') {
      if (th.kick[s] === 'x') this.kick(t);
      if (th.snare[s] === 'x' && section !== 'intro') this.snare(t);
    }
    if (th.hat[s] === 'x') this.hat(t);

    const b = th.bass[s];
    if (b !== '.' && section !== 'break') {
      const midi = pitch(th, chord) + (b === 'o' ? 12 : 0) + (b === '5' ? 7 : 0);
      this.voice(midi, t, stepTime * length(th.bass, s), { wave: th.bassWave, vol: 0.16, cut: th.bassCut || 1500 });
    }

    const a = th.arp[s];
    if (a !== '.') {
      const midi = pitch(th, chord + Number(a) * 2) + 12 * th.arpOct;
      this.voice(midi, t, stepTime * 0.9, { wave: th.arpWave, vol: 0.05, cut: 4000, echo: true });
    }

    if ((th.pad || section === 'break') && s === 0) {
      [0, 2, 4].forEach((k) => this.voice(pitch(th, chord + k) + 12, t, stepTime * 16,
        { wave: 'triangle', vol: 0.035, attack: stepTime * 4, cut: 1800 }));
    }

    const note = this.melody[bar][s];
    if (note && (section === 'verse' || section === 'harmony')) {
      const len = stepTime * note.steps;
      const opts = { wave: th.leadWave, vol: 0.055, cut: 2600, echo: true, vibrato: true };
      this.voice(pitch(th, note.degree) + 12, t, len, opts);
      if (section === 'harmony') this.voice(pitch(th, note.degree + 2) + 12, t, len, { ...opts, vol: 0.03 });
    }
  }

  voice(midi, t, dur, { wave, vol, cut, attack = 0.005, echo = false, vibrato = false }) {
    const ac = this.ac;
    const osc = ac.createOscillator();
    osc.type = wave;
    osc.frequency.value = freq(midi);
    if (vibrato && dur > 0.25) {
      const lfo = ac.createOscillator(), depth = ac.createGain();
      lfo.frequency.value = 5.5;
      depth.gain.value = freq(midi) * 0.01;
      lfo.connect(depth).connect(osc.frequency);
      lfo.start(t + 0.12);
      lfo.stop(t + dur + 0.1);
    }
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cut;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + attack);
    gain.gain.setValueAtTime(vol, t + Math.max(attack, dur * 0.6));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
    osc.connect(filter).connect(gain).connect(this.bus);
    if (echo) gain.connect(this.echoIn);
    osc.start(t);
    osc.stop(t + dur + 0.1);
  }

  kick(t) {
    const ac = this.ac;
    const osc = ac.createOscillator(), gain = ac.createGain();
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    gain.gain.setValueAtTime(0.32, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(gain).connect(this.bus);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  hiss(t, dur, vol, type, hz) {
    const ac = this.ac;
    const src = ac.createBufferSource();
    src.buffer = noise(ac);
    const filter = ac.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = hz;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(gain).connect(this.bus);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.02);
  }

  snare(t) {
    this.hiss(t, 0.14, 0.13, 'bandpass', 1800);
  }

  hat(t) {
    this.hiss(t, 0.04, 0.035, 'highpass', 7000);
  }

  setPaused(paused) {
    this.bus.gain.setTargetAtTime(paused ? VOLUME * 0.25 : VOLUME, this.ac.currentTime, 0.1);
  }

  stop() {
    clearInterval(this.timer);
    const { bus, ac } = this;
    bus.gain.setTargetAtTime(0, ac.currentTime, 0.15);
    setTimeout(() => bus.disconnect(), 1500);
  }
}

let song = null;

export const music = {
  // Starts a theme, unless it is already playing.
  play(name) {
    if (!THEMES[name] || !audio()) return;
    if (song?.name === name) {
      song.setPaused(false);
      return;
    }
    song?.stop();
    song = new Song(name, audio(), output());
    song.start();
  },
  stop() {
    song?.stop();
    song = null;
  },
  setPaused(paused) {
    song?.setPaused(paused);
  },
};
