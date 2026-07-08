import './style.css';
import { makeDraggable } from './drag.js';
import { initWinamp } from './winamp.js';
import { STATUE_SOURCES } from './statues.js';
// PRESETS
//=========================================================================
const PRESETS = {
  'Miami Vice': {
    sky:       { topColor: '#1a0033', horizonColor: '#ff2d95' },
    sun:       { colorTop: '#ffe66d', colorBottom: '#ff2d95' },
    mountains: { colorFar: '#3d0066', colorNear: '#7a00cc' },
    grid:      { color: '#ff2d95' },
  },
  'Outrun': {
    sky:       { topColor: '#0d0221', horizonColor: '#ff6600' },
    sun:       { colorTop: '#ffec27', colorBottom: '#ff003c' },
    mountains: { colorFar: '#1a0033', colorNear: '#330033' },
    grid:      { color: '#ff003c' },
  },
  'Pastel Dream': {
    sky:       { topColor: '#b693fe', horizonColor: '#ffafcc' },
    sun:       { colorTop: '#fff5b8', colorBottom: '#ff8fab' },
    mountains: { colorFar: '#cdb4db', colorNear: '#a2d2ff' },
    grid:      { color: '#bde0fe' },
  },
  'Cyber Night': {
    sky:       { topColor: '#02010a', horizonColor: '#240046' },
    sun:       { colorTop: '#ff00ff', colorBottom: '#00f0ff' },
    mountains: { colorFar: '#0a043c', colorNear: '#160040' },
    grid:      { color: '#00f0ff' },
  },
  'Tropic Punch': {
    sky:       { topColor: '#3a0ca3', horizonColor: '#f72585' },
    sun:       { colorTop: '#ffd60a', colorBottom: '#ff8500' },
    mountains: { colorFar: '#2c0735', colorNear: '#560bad' },
    grid:      { color: '#f72585' },
  },
  'Acid Wash': {
    sky:       { topColor: '#0b0c10', horizonColor: '#1f4068' },
    sun:       { colorTop: '#39ff14', colorBottom: '#ff00ff' },
    mountains: { colorFar: '#000000', colorNear: '#0b0c10' },
    grid:      { color: '#39ff14' },
  },
  'Cotton Candy': {
    sky:       { topColor: '#c084fc', horizonColor: '#fbcfe8' },
    sun:       { colorTop: '#fef3c7', colorBottom: '#f9a8d4' },
    mountains: { colorFar: '#a78bfa', colorNear: '#f0abfc' },
    grid:      { color: '#fda4af' },
  },
};

//=========================================================================
// STATE
//=========================================================================
const state = {
  sky: { topColor: '#1a0033', horizonColor: '#ff2d95', starDensity: 0.5, starBrightness: 0.9 },
  sun: { enabled: true, x: 0.5, y: 0.55, radius: 0.22, colorTop: '#ffe66d', colorBottom: '#ff2d95', bars: true, barCount: 14, glow: 0.6, echo: 0.0, melt: 0.0 },
  mountains: { layers: 3, height: 0.45, jaggedness: 0.55, snow: true, wireframe: false, colorFar: '#3d0066', colorNear: '#7a00cc', seed: 1337 },
  grid: { color: '#ff2d95', density: 16, glow: 0.6, perspective: 0.7 },
  palms: { count: 2, side: 'both', scale: 0.6, spread: 0.22, vary: 0.4, depth: 0.0, color: '#0a0014', fronds: 9, curve: 0.5, coconuts: false, style: 'solid', sway: 0.0 },
  objects: {
    planet: false, planetX: 0.78, planetY: 0.22, planetScale: 0.5, planetColor: '#ff6ec7', planetRings: true,
    statue: false, statueKey: 'david', statueCount: 1, statueStyle: 'solid', statueX: 0.3, statueScale: 0.6, statueColor: '#ffffff',
    kanji: false, kanjiCount: 3, kanjiScale: 0.5, kanjiColor: '#ff2d95',
    bitmaps: true, bitmapCount: 4, bitmapScale: 0.7, bitmapColor: '#ffffff',
    rays: false, rayCount: 18, rayLength: 0.6, rayWidth: 0.4,
  },
  fx: { chromatic: 0.35, scanlines: 0.45, grain: 0.25, glitch: 0.15, vignette: 0.5 },
  static: {
    tvStatic: 0.0,
    rgbGhost: 0.0,
    waveWarp: 0.0,
    hueShift: 0.0,
    posterize: 0.0,
    badBlocks: 0.0,
    tapeBands: 0.0,
    invertPulse: 0.0,
    recBadge: false,
    vhsCounter: false,
    hexMarquee: false,
    animate: true,
  },
  android: {
    matrix: 0.0,
    matrixSpeed: 0.6,
    matrixColor: '#00ff66',
    matrixChars: 'kana',
    ascii: false,
    asciiSize: 10,
    reticle: false,
    telemetry: false,
    rollingBand: 0.0,
    scanSweep: false,
    anaglyph: 0.0,
  },
  sound: {
    masterVol: 0.4,
    droneFreq: 55,
    droneDetune: 12,
    padShimmer: 0.5,
    crackle: 0.35,
    rain: 0.0,
    lpfCutoff: 0.55,
    lfoRate: 0.18,
    reverb: 0.6,
  },
  wand: {},  // magic-wand auto-animate flags, keyed 'section.dial' -- filled from CONTROLS below
};

// Pristine copy for share-URL diffing; assigned after CONTROLS seeds state.wand
let DEFAULT_STATE = null;

//=========================================================================
// SHARE URL (state lives in the hash -- no server, no storage)
//=========================================================================
function stateDiff(cur, def) {
  const out = {};
  for (const [k, v] of Object.entries(cur)) {
    if (v && typeof v === 'object') {
      const d = stateDiff(v, def[k] || {});
      if (Object.keys(d).length) out[k] = d;
    } else if (def[k] !== v) {
      out[k] = v;
    }
  }
  return out;
}

function encodeShareHash() {
  const json = JSON.stringify(stateDiff(state, DEFAULT_STATE));
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(json)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return 'w=' + b64;
}

function applyShareHash() {
  const m = location.hash.match(/w=([A-Za-z0-9_-]+)/);
  if (!m) return false;
  try {
    const b64 = m[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(b64), ch => ch.charCodeAt(0));
    const diff = JSON.parse(new TextDecoder().decode(bytes));
    for (const [section, vals] of Object.entries(diff)) {
      if (state[section] && vals && typeof vals === 'object') {
        Object.assign(state[section], vals);
      }
    }
    return true;
  } catch (e) {
    console.warn('share hash rejected:', e);
    return false;
  }
}

// The URL bar tracks state live -- copy it any time, it IS the share link.
// Debounced so slider drags don't hammer it; replaceState keeps history clean.
let hashTimer = 0;
function scheduleHashUpdate() {
  clearTimeout(hashTimer);
  hashTimer = setTimeout(() => {
    const hash = encodeShareHash();
    const clean = hash === 'w=e30';  // e30 = base64('{}'), i.e. state is at defaults
    history.replaceState(null, '', clean
      ? location.pathname + location.search
      : '#' + hash);
  }, 250);
}

//=========================================================================
// CONTROL DEFINITIONS  (declarative -> auto-builds UI)
//=========================================================================
const CONTROLS = {
  sky: [
    { k: 'topColor',       type: 'color', label: 'Top color' },
    { k: 'horizonColor',   type: 'color', label: 'Horizon' },
    { k: 'starDensity',    type: 'range', label: 'Star density',  min: 0, max: 1, step: 0.01 },
    { k: 'starBrightness', type: 'range', label: 'Star bright.',  min: 0, max: 1, step: 0.01 },
  ],
  sun: [
    { k: 'enabled',     type: 'check', label: 'Sun on' },
    { k: 'x',           type: 'range', label: 'X position', min: 0, max: 1, step: 0.01 },
    { k: 'y',           type: 'range', label: 'Y (horizon)', min: 0.2, max: 0.85, step: 0.01 },
    { k: 'radius',      type: 'range', label: 'Size',       min: 0.05, max: 0.4, step: 0.005 },
    { k: 'colorTop',    type: 'color', label: 'Top color' },
    { k: 'colorBottom', type: 'color', label: 'Bottom color' },
    { k: 'glow',        type: 'range', label: 'Glow',       min: 0, max: 1, step: 0.01 },
    { k: 'bars',        type: 'check', label: 'Horiz. bars' },
    { k: 'barCount',    type: 'range', label: 'Bar count',  min: 4, max: 30, step: 1 },
    { k: 'echo',        type: 'range', label: 'Echo rings', min: 0, max: 1, step: 0.01 },
    { k: 'melt',        type: 'range', label: 'Melt',       min: 0, max: 1, step: 0.01 },
  ],
  mountains: [
    { k: 'layers',     type: 'range', label: 'Layers',     min: 1, max: 5, step: 1 },
    { k: 'height',     type: 'range', label: 'Height',     min: 0.1, max: 0.9, step: 0.01 },
    { k: 'jaggedness', type: 'range', label: 'Jaggedness', min: 0, max: 1, step: 0.01 },
    { k: 'colorFar',   type: 'color', label: 'Far color' },
    { k: 'colorNear',  type: 'color', label: 'Near color' },
    { k: 'snow',       type: 'check', label: 'Snow caps' },
    { k: 'wireframe',  type: 'check', label: 'Wireframe' },
  ],
  grid: [
    { k: 'color',       type: 'color', label: 'Line color' },
    { k: 'density',     type: 'range', label: 'Density',     min: 4, max: 30, step: 1 },
    { k: 'glow',        type: 'range', label: 'Glow',        min: 0, max: 1, step: 0.01 },
    { k: 'perspective', type: 'range', label: 'Perspective', min: 0.2, max: 1, step: 0.01 },
  ],
  palms: [
    { k: 'count',  type: 'range', label: 'Count',    min: 0, max: 16, step: 1 },
    { k: 'side',   type: 'select', label: 'Side',    options: ['left','right','both'] },
    { k: 'style',  type: 'select', label: 'Style',   options: ['solid','neon'] },
    { k: 'color',  type: 'color', label: 'Color' },
    { k: 'scale',  type: 'range', label: 'Scale',    min: 0.15, max: 1.6, step: 0.01 },
    { k: 'spread', type: 'range', label: 'Spread',   min: 0.05, max: 1, step: 0.01 },
    { k: 'vary',   type: 'range', label: 'Size vary', min: 0, max: 1, step: 0.01 },
    { k: 'depth',  type: 'range', label: 'Depth',    min: 0, max: 1, step: 0.01 },
    { k: 'fronds', type: 'range', label: 'Fronds',   min: 4, max: 16, step: 1 },
    { k: 'curve',  type: 'range', label: 'Trunk curve', min: 0, max: 1, step: 0.01 },
    { k: 'sway',   type: 'range', label: 'Sway',     min: 0, max: 1, step: 0.01 },
    { k: 'coconuts', type: 'check', label: 'Coconuts' },
  ],
  fx: [
    { k: 'chromatic',  type: 'range', label: 'Chromatic',  min: 0, max: 1, step: 0.01 },
    { k: 'scanlines',  type: 'range', label: 'Scanlines',  min: 0, max: 1, step: 0.01 },
    { k: 'grain',      type: 'range', label: 'Grain',      min: 0, max: 1, step: 0.01 },
    { k: 'glitch',     type: 'range', label: 'Glitch',     min: 0, max: 1, step: 0.01 },
    { k: 'vignette',   type: 'range', label: 'Vignette',   min: 0, max: 1, step: 0.01 },
  ],
  objects: [
    { k: 'planet',       type: 'check', label: 'Planet' },
    { k: 'planetX',      type: 'range', label: 'Planet X',     min: 0, max: 1, step: 0.01 },
    { k: 'planetY',      type: 'range', label: 'Planet Y',     min: 0, max: 0.6, step: 0.01 },
    { k: 'planetScale',  type: 'range', label: 'Planet scale', min: 0.1, max: 1.2, step: 0.01 },
    { k: 'planetColor',  type: 'color', label: 'Planet color' },
    { k: 'planetRings',  type: 'check', label: 'Rings' },
    { k: 'statue',       type: 'check', label: 'Statues' },
    { k: 'statueKey',    type: 'select', label: 'Marble', options: ['david','venus','alexander','antiochus','caracalla','cicero','augustus','liberty','mixed'] },
    { k: 'statueCount',  type: 'range', label: 'Statue count', min: 1, max: 6, step: 1 },
    { k: 'statueStyle',  type: 'select', label: 'Dither', options: ['solid','ghost'] },
    { k: 'statueX',      type: 'range', label: 'Statue X',     min: 0, max: 1, step: 0.01 },
    { k: 'statueScale',  type: 'range', label: 'Statue scale', min: 0.3, max: 1.6, step: 0.01 },
    { k: 'statueColor',  type: 'color', label: 'Marble tint' },
    { k: 'kanji',        type: 'check', label: 'Kanji' },
    { k: 'kanjiCount',   type: 'range', label: 'Kanji count',  min: 1, max: 6, step: 1 },
    { k: 'kanjiScale',   type: 'range', label: 'Kanji scale',  min: 0.4, max: 2.0, step: 0.01 },
    { k: 'kanjiColor',   type: 'color', label: 'Kanji color' },
    { k: 'bitmaps',      type: 'check', label: '80s bitmaps' },
    { k: 'bitmapCount',  type: 'range', label: 'Bitmap count', min: 1, max: 10, step: 1 },
    { k: 'bitmapScale',  type: 'range', label: 'Bitmap scale', min: 0.3, max: 1.8, step: 0.01 },
    { k: 'bitmapColor',  type: 'color', label: 'Bitmap tint' },
    { k: 'rays',         type: 'check', label: 'Sun rays' },
    { k: 'rayCount',     type: 'range', label: 'Ray count',    min: 6, max: 36, step: 1 },
    { k: 'rayLength',    type: 'range', label: 'Ray length',   min: 0.2, max: 1.2, step: 0.01 },
    { k: 'rayWidth',     type: 'range', label: 'Ray width',    min: 0.1, max: 1, step: 0.01 },
  ],
  sound: [
    { k: 'masterVol',  type: 'range', label: 'Master vol', min: 0, max: 1, step: 0.01 },
    { k: 'droneFreq',  type: 'range', label: 'Drone Hz',   min: 30, max: 220, step: 1 },
    { k: 'droneDetune',type: 'range', label: 'Detune',     min: 0, max: 80, step: 1 },
    { k: 'padShimmer', type: 'range', label: 'Pad shimmer',min: 0, max: 1, step: 0.01 },
    { k: 'crackle',    type: 'range', label: 'Vinyl crackle', min: 0, max: 1, step: 0.01 },
    { k: 'rain',       type: 'range', label: 'Rain',       min: 0, max: 1, step: 0.01 },
    { k: 'lpfCutoff',  type: 'range', label: 'LPF cutoff', min: 0.05, max: 1, step: 0.01 },
    { k: 'lfoRate',    type: 'range', label: 'LFO rate',   min: 0.02, max: 2, step: 0.01 },
    { k: 'reverb',     type: 'range', label: 'Reverb',     min: 0, max: 1, step: 0.01 },
  ],
  android: [
    { k: 'matrix',      type: 'range',  label: 'Code rain',    min: 0, max: 1, step: 0.01 },
    { k: 'matrixSpeed', type: 'range',  label: 'Rain speed',   min: 0.1, max: 2, step: 0.01 },
    { k: 'matrixColor', type: 'color',  label: 'Rain color' },
    { k: 'matrixChars', type: 'select', label: 'Rain charset', options: ['kana','binary','hex','wetware','symbols'] },
    { k: 'ascii',       type: 'check',  label: 'ASCII mode' },
    { k: 'asciiSize',   type: 'range',  label: 'ASCII cell',   min: 4, max: 24, step: 1 },
    { k: 'reticle',     type: 'check',  label: 'Sun reticle' },
    { k: 'telemetry',   type: 'check',  label: 'Telemetry' },
    { k: 'rollingBand', type: 'range',  label: 'Rolling band', min: 0, max: 1, step: 0.01 },
    { k: 'scanSweep',   type: 'check',  label: 'Scan sweep' },
    { k: 'anaglyph',    type: 'range',  label: 'Anaglyph 3D',  min: 0, max: 1, step: 0.01 },
  ],
  static: [
    { k: 'tvStatic',    type: 'range', label: 'TV static',    min: 0, max: 1, step: 0.01 },
    { k: 'rgbGhost',    type: 'range', label: 'RGB ghost',    min: 0, max: 1, step: 0.01 },
    { k: 'waveWarp',    type: 'range', label: 'Wave warp',    min: 0, max: 1, step: 0.01 },
    { k: 'hueShift',    type: 'range', label: 'Hue shift',    min: 0, max: 1, step: 0.01 },
    { k: 'posterize',   type: 'range', label: 'Posterize',    min: 0, max: 1, step: 0.01 },
    { k: 'badBlocks',   type: 'range', label: 'Bad blocks',   min: 0, max: 1, step: 0.01 },
    { k: 'tapeBands',   type: 'range', label: 'Tape bands',   min: 0, max: 1, step: 0.01 },
    { k: 'invertPulse', type: 'range', label: 'Invert pulse', min: 0, max: 1, step: 0.01 },
    { k: 'recBadge',    type: 'check', label: 'REC badge' },
    { k: 'vhsCounter',  type: 'check', label: 'VHS counter' },
    { k: 'hexMarquee',  type: 'check', label: 'Hex marquee' },
    { k: 'animate',     type: 'check', label: 'Animate' },
  ],
};

// Every range/color dial gets a magic-wand auto-animate flag (default off)
for (const [section, defs] of Object.entries(CONTROLS)) {
  for (const def of defs) {
    if (def.type === 'range' || def.type === 'color') {
      state.wand[`${section}.${def.k}`] = false;
    }
  }
}
DEFAULT_STATE = JSON.parse(JSON.stringify(state));

//=========================================================================
// MAGIC WAND -- per-dial auto-animation.
// Ranges ping-pong across their full span starting from the current value
// (sine ease); colors orbit the hue wheel like a rainbow hue slider.
//=========================================================================
const wandAnims = {};   // 'section.k' -> { section, def, base, t0, ... }

function startWandAnim(section, def) {
  const key = `${section}.${def.k}`;
  const v = state[section][def.k];
  if (def.type === 'color') {
    const { h, s, l } = hexToHsl(v);
    wandAnims[key] = {
      section, def, base: v,
      // Washed-out bases (white/grey) snap to a vivid rainbow lane
      h0: h, s: s < 30 ? 90 : s, l: s < 30 ? 60 : Math.min(75, Math.max(35, l)),
      speed: 30 + Math.random() * 25,               // deg/sec around the wheel
    };
  } else {
    const span = def.max - def.min;
    const p0 = Math.min(1, Math.max(0, (v - def.min) / span));
    wandAnims[key] = {
      section, def, base: v,
      phase: Math.asin(p0 * 2 - 1),                 // sine starts exactly at the current value
      speed: (0.7 + Math.random() * 0.6) * (Math.PI * 2 / 9),  // full sweep ~6-13s, detuned per dial
    };
  }
  wandAnims[key].t = 0;   // accumulated seconds -- only advances while animating
}

function stopWandAnim(section, def, restore) {
  const key = `${section}.${def.k}`;
  const a = wandAnims[key];
  delete wandAnims[key];
  if (a && restore) {
    state[section][def.k] = a.base;
    syncOneControl(section, def);
  }
}

let lastWandTick = 0;
function tickWands(now) {
  // Master animation off = global pause; wands hold their value and phase
  if (!state.static.animate) { lastWandTick = 0; return; }
  const dt = lastWandTick ? Math.min(0.1, (now - lastWandTick) / 1000) : 0;
  lastWandTick = now;
  let soundTouched = false;
  for (const key of Object.keys(state.wand)) {
    if (!state.wand[key]) continue;
    const a = wandAnims[key];
    if (!a) { // wand arrived via share hash / randomize without a click
      const [sec, k] = key.split('.');
      const def = (CONTROLS[sec] || []).find(d => d.k === k);
      if (def) startWandAnim(sec, def);
      continue;
    }
    a.t += dt;
    const t = a.t;
    let v;
    if (a.def.type === 'color') {
      // Quantize to 6 deg so color-keyed caches (statues) stay bounded
      const h = Math.round(((a.h0 + t * a.speed) % 360) / 6) * 6;
      v = hslToHex(h, a.s, a.l);
    } else {
      const p = 0.5 + 0.5 * Math.sin(a.phase + t * a.speed);
      v = a.def.min + p * (a.def.max - a.def.min);
      v = a.def.step >= 1 ? Math.round(v) : Math.round(v / a.def.step) * a.def.step;
    }
    state[a.section][a.def.k] = v;
    syncOneControl(a.section, a.def);
    if (a.section === 'sound') soundTouched = true;
  }
  if (soundTouched) Sound.update();
}

function syncOneControl(section, def) {
  const el = document.getElementById(`c-${section}-${def.k}`);
  if (!el) return;
  el.value = state[section][def.k];
  if (def.type === 'range') {
    const sib = el.parentElement.querySelector('.val');
    if (sib) sib.textContent = formatVal(state[section][def.k], def.step);
  }
}

function syncWandButtons() {
  for (const [key, on] of Object.entries(state.wand)) {
    const btn = document.getElementById(`w-${key.replace('.', '-')}`);
    if (btn) btn.classList.toggle('on', !!on);
    if (!on) {
      const [sec, k] = key.split('.');
      if (wandAnims[key]) stopWandAnim(sec, (CONTROLS[sec] || []).find(d => d.k === k), false);
    }
  }
}

//=========================================================================
// BUILD UI
//=========================================================================
function buildUI() {
  for (const [section, defs] of Object.entries(CONTROLS)) {
    const hostId = section === 'sound' ? 'sec-sound-dials' : 'sec-' + section;
    const host = document.getElementById(hostId);
    if (!host) continue;
    for (const def of defs) {
      host.appendChild(buildControl(section, def));
    }
  }
  // Preset dropdown
  const psel = document.getElementById('preset');
  for (const name of Object.keys(PRESETS)) {
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name;
    psel.appendChild(opt);
  }
  psel.addEventListener('change', () => { applyPreset(psel.value); requestRender(); });
}

function makeWand(section, def) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'wand';
  btn.id = `w-${section}-${def.k}`;
  btn.title = 'Magic wand: auto-animate this dial';
  btn.addEventListener('click', () => {
    const key = `${section}.${def.k}`;
    const on = !state.wand[key];
    state.wand[key] = on;
    btn.classList.toggle('on', on);
    if (on) startWandAnim(section, def);
    else stopWandAnim(section, def, true);   // hand the dial back where it started
    if (section === 'sound') Sound.update();
    requestRender();                          // kicks the anim loop via needsAnimation()
  });
  return btn;
}

function buildControl(section, def) {
  const v = state[section][def.k];
  if (def.type === 'check') {
    const row = document.createElement('div');
    row.className = 'checkrow';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!v;
    cb.id = `c-${section}-${def.k}`;
    cb.addEventListener('input', () => { state[section][def.k] = cb.checked; requestRender(); });
    const lbl = document.createElement('label');
    lbl.htmlFor = cb.id;
    lbl.textContent = def.label;
    row.append(cb, lbl);
    return row;
  }
  if (def.type === 'select') {
    const row = document.createElement('div');
    row.className = 'ctl-wide';
    const lbl = document.createElement('label');
    lbl.textContent = def.label;
    const sel = document.createElement('select');
    for (const opt of def.options) {
      const o = document.createElement('option');
      o.value = opt; o.textContent = opt;
      sel.appendChild(o);
    }
    sel.value = v;
    sel.id = `c-${section}-${def.k}`;
    sel.addEventListener('change', () => {
      state[section][def.k] = sel.value;
      if (section === 'sound') { Sound.update(); scheduleHashUpdate(); } else requestRender();
    });
    const spacer = document.createElement('span');
    spacer.className = 'wand-spacer';
    row.append(spacer, lbl, sel);
    return row;
  }
  if (def.type === 'color') {
    const row = document.createElement('div');
    row.className = 'ctl-wide';
    const lbl = document.createElement('label');
    lbl.textContent = def.label;
    const inp = document.createElement('input');
    inp.type = 'color';
    inp.value = v;
    inp.id = `c-${section}-${def.k}`;
    inp.addEventListener('input', () => { state[section][def.k] = inp.value; requestRender(); });
    row.append(makeWand(section, def), lbl, inp);
    return row;
  }
  // range
  const row = document.createElement('div');
  row.className = 'ctl';
  const lbl = document.createElement('label');
  lbl.textContent = def.label;
  const inp = document.createElement('input');
  inp.type = 'range';
  inp.min = def.min; inp.max = def.max; inp.step = def.step;
  inp.value = v;
  inp.id = `c-${section}-${def.k}`;
  const val = document.createElement('div');
  val.className = 'val';
  val.textContent = formatVal(v, def.step);
  inp.addEventListener('input', () => {
    const n = def.step >= 1 ? parseInt(inp.value, 10) : parseFloat(inp.value);
    state[section][def.k] = n;
    val.textContent = formatVal(n, def.step);
    if (section === 'sound') { Sound.update(); scheduleHashUpdate(); } else requestRender();
  });
  row.append(makeWand(section, def), lbl, inp, val);
  return row;
}

function formatVal(v, step) {
  if (typeof v !== 'number') return String(v);
  return step >= 1 ? String(v) : v.toFixed(2);
}

function syncUIFromState() {
  for (const [section, defs] of Object.entries(CONTROLS)) {
    for (const def of defs) {
      const id = `c-${section}-${def.k}`;
      const el = document.getElementById(id);
      if (!el) continue;
      const v = state[section][def.k];
      if (def.type === 'check') el.checked = !!v;
      else el.value = v;
      // update value text for ranges
      if (def.type === 'range') {
        const sibling = el.parentElement.querySelector('.val');
        if (sibling) sibling.textContent = formatVal(v, def.step);
      }
    }
  }
  syncWandButtons();
}

function applyPreset(name) {
  const p = PRESETS[name];
  if (!p) return;
  for (const [section, vals] of Object.entries(p)) {
    Object.assign(state[section], vals);
  }
  syncUIFromState();
}

//=========================================================================
// RANDOM (seeded for mountains, free for everything else on randomize)
//=========================================================================
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function rand(min, max) { return min + Math.random() * (max - min); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function randomize() {
  // Pick a random preset as the base palette
  const presetNames = Object.keys(PRESETS);
  applyPreset(pick(presetNames));
  // Then jitter
  state.sky.starDensity = rand(0.2, 0.9);
  state.sky.starBrightness = rand(0.5, 1);
  state.sun.enabled = Math.random() > 0.12;
  state.sun.x = rand(0.25, 0.75);
  state.sun.y = rand(0.45, 0.7);
  state.sun.radius = rand(0.14, 0.3);
  state.sun.bars = Math.random() > 0.15;
  state.sun.barCount = Math.floor(rand(8, 22));
  state.sun.glow = rand(0.3, 1);
  state.sun.echo = Math.random() > 0.6 ? rand(0.2, 0.9) : 0;
  state.sun.melt = Math.random() > 0.7 ? rand(0.2, 0.8) : 0;
  state.mountains.layers = Math.floor(rand(2, 5));
  state.mountains.height = rand(0.3, 0.65);
  state.mountains.jaggedness = rand(0.25, 0.85);
  state.mountains.snow = Math.random() > 0.4;
  state.mountains.wireframe = Math.random() > 0.7;
  state.mountains.seed = Math.floor(Math.random() * 1e9);
  state.grid.density = Math.floor(rand(8, 24));
  state.grid.glow = rand(0.3, 1);
  state.grid.perspective = rand(0.5, 1);
  state.palms.count = Math.floor(rand(0, 12));
  state.palms.side = pick(['left','right','both']);
  state.palms.scale = rand(0.35, 1.2);
  state.palms.spread = rand(0.15, 0.9);
  state.palms.vary = rand(0.1, 0.7);
  state.palms.depth = rand(0, 0.6);
  state.palms.style = Math.random() > 0.7 ? 'neon' : 'solid';
  state.palms.color = state.palms.style === 'neon'
    ? pick(['#ff2d95','#00f0ff','#39ff14','#ffd60a','#a06bff'])
    : '#0a0014';
  state.palms.fronds = Math.floor(rand(6, 13));
  state.palms.curve = rand(0.2, 0.9);
  state.palms.coconuts = Math.random() > 0.6;
  state.palms.sway = Math.random() > 0.6 ? rand(0.2, 0.8) : 0;
  state.fx.chromatic = rand(0.1, 0.7);
  state.fx.scanlines = rand(0.15, 0.7);
  state.fx.grain = rand(0.05, 0.45);
  state.fx.glitch = Math.random() > 0.6 ? rand(0.1, 0.45) : 0;
  state.fx.vignette = rand(0.25, 0.7);
  // Roll dice on objects too
  state.objects.planet = Math.random() > 0.55;
  state.objects.planetX = rand(0.1, 0.9);
  state.objects.planetY = rand(0.05, 0.4);
  state.objects.planetScale = rand(0.3, 0.9);
  state.objects.planetColor = pick(['#ff6ec7','#9b5cff','#00f0ff','#ff8500','#39ff14','#ffd60a']);
  state.objects.planetRings = Math.random() > 0.5;
  state.objects.statue = Math.random() > 0.5;
  state.objects.statueKey = pick(['david','david','venus','alexander','antiochus','caracalla','cicero','augustus','liberty','mixed','mixed']);
  state.objects.statueCount = Math.random() > 0.6 ? Math.floor(rand(2, 5)) : 1;
  state.objects.statueStyle = Math.random() > 0.85 ? 'ghost' : 'solid';
  state.objects.statueX = rand(0.15, 0.85);
  state.objects.statueScale = rand(0.55, 1.3);
  state.objects.statueColor = pick(['#ffffff','#ffafcc','#fff5b8','#bde0fe','#ff2d95','#a06bff']);
  state.objects.kanji = Math.random() > 0.6;
  state.objects.kanjiCount = Math.floor(rand(1, 5));
  state.objects.kanjiScale = rand(0.6, 1.6);
  state.objects.kanjiColor = pick(['#ff2d95','#00f0ff','#fff5b8','#39ff14','#ffffff']);
  state.objects.bitmaps = Math.random() > 0.25;
  state.objects.bitmapCount = Math.floor(rand(2, 8));
  state.objects.bitmapScale = rand(0.4, 1.4);
  state.objects.bitmapColor = pick(['#ffffff','#ff2d95','#00f0ff','#ffd60a','#39ff14','#ff8500','#a06bff']);
  state.objects.rays = Math.random() > 0.5;
  state.objects.rayCount = Math.floor(rand(8, 30));
  state.objects.rayLength = rand(0.3, 1.0);
  state.objects.rayWidth = rand(0.15, 0.7);
  // Static / overlay roll
  state.static.tvStatic    = Math.random() > 0.7 ? rand(0.05, 0.35) : 0;
  state.static.rgbGhost    = Math.random() > 0.7 ? rand(0.1, 0.55) : 0;
  state.static.waveWarp    = Math.random() > 0.75 ? rand(0.1, 0.45) : 0;
  state.static.hueShift    = Math.random() > 0.85 ? rand(0.05, 0.4) : 0;
  state.static.posterize   = Math.random() > 0.8 ? rand(0.2, 0.7) : 0;
  state.static.badBlocks   = Math.random() > 0.8 ? rand(0.1, 0.4) : 0;
  state.static.tapeBands   = Math.random() > 0.6 ? rand(0.1, 0.5) : 0;
  state.static.invertPulse = Math.random() > 0.9 ? rand(0.1, 0.4) : 0;
  state.static.recBadge   = Math.random() > 0.7;
  state.static.vhsCounter = Math.random() > 0.6;
  state.static.hexMarquee = Math.random() > 0.65;
  // ANDROID / HUD roll
  state.android.matrix      = Math.random() > 0.55 ? rand(0.2, 0.7) : 0;
  state.android.matrixSpeed = rand(0.4, 1.4);
  state.android.matrixColor = pick(['#00ff66','#39ff14','#00f0ff','#ff2d95','#ffd60a','#ff8500','#a06bff']);
  state.android.matrixChars = pick(['kana','binary','hex','wetware','symbols']);
  state.android.reticle     = Math.random() > 0.5;
  state.android.telemetry   = Math.random() > 0.55;
  state.android.rollingBand = Math.random() > 0.7 ? rand(0.2, 0.6) : 0;
  state.android.scanSweep   = Math.random() > 0.65;
  state.android.anaglyph    = Math.random() > 0.8 ? rand(0.15, 0.5) : 0;
  state.android.ascii       = Math.random() > 0.85;
  state.android.asciiSize   = Math.floor(rand(8, 16));
  // Magic wands: each dial has a 15% chance to come alive
  for (const key of Object.keys(state.wand)) {
    const was = state.wand[key];
    state.wand[key] = Math.random() < 0.15;
    if (was && !state.wand[key]) {
      const [sec, k] = key.split('.');
      stopWandAnim(sec, (CONTROLS[sec] || []).find(d => d.k === k), false);
    }
  }
  syncUIFromState();
  requestRender();
}

//=========================================================================
// RENDER PIPELINE
//=========================================================================
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

const sceneCanvas = document.createElement('canvas');
sceneCanvas.width = W; sceneCanvas.height = H;
const sctx = sceneCanvas.getContext('2d');

let pendingRender = false;
function requestRender() {
  if (pendingRender) return;
  pendingRender = true;
  requestAnimationFrame(() => { pendingRender = false; render(); });
}

// === Continuous animation loop ===
// Drives Matrix rain, sweep, rolling band, REC blink, marquee, sun melt/scroll, palm sway, etc.
let animLoopRunning = false;
function needsAnimation() {
  // One switch to rule them all: rain, sweep, band, noise, blinks AND wands
  return state.static.animate;
}
function startAnimLoop() {
  if (animLoopRunning) return;
  animLoopRunning = true;
  const tick = () => {
    if (!needsAnimation()) { animLoopRunning = false; return; }
    render();
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// FX entropy: stochastic effects (glitch, static, grain, bad blocks, rain
// glyphs) draw from this seeded stream instead of Math.random(). The seed
// only advances while the master Animation toggle is on, so with it off the
// noise pattern is a freeze-frame even if wands keep the RAF loop running.
let fxTick = 0;
let fxRand = mulberry32(0x5EED);

function render() {
  tickWands(performance.now());
  if (state.static.animate) fxTick++;
  fxRand = mulberry32((fxTick * 0x9E3779B9) ^ 0x5EED);
  // Reset scene
  sctx.clearRect(0, 0, W, H);
  drawSky(sctx);
  drawStars(sctx);
  if (state.objects.planet) drawPlanet(sctx);
  drawSun(sctx);
  drawMountains(sctx);
  drawGrid(sctx);
  drawPalms(sctx);
  if (state.objects.rays && state.sun.enabled) drawSunRays(sctx);
  if (state.objects.statue) drawStatues(sctx);
  if (state.objects.bitmaps) drawBitmaps(sctx);
  if (state.objects.kanji) drawKanji(sctx);

  // Composite to main with chromatic aberration
  applyChromatic(sceneCanvas, ctx);

  // Heavy static / overlay chain
  applyHueShift(ctx);
  applyPosterize(ctx);
  applyWaveWarp(ctx);
  applyRGBGhost(ctx);
  applyAnaglyph(ctx);
  applyRollingBand(ctx);
  applyTapeBands(ctx);
  applyInvertPulse(ctx);
  applyGlitch(ctx);
  applyBadBlocks(ctx);
  // ANDROID HUD layer
  applyReticle(ctx);
  applyMatrixRain(ctx);
  applyScanSweep(ctx);
  applyTelemetryHUD(ctx);
  applyAsciiMode(ctx);
  // Final film grain / CRT
  applyTVStatic(ctx);
  applyScanlines(ctx);
  applyTextOverlay(ctx);
  applyGrain(ctx);
  applyVignette(ctx);
}

//-------------------------------------------------------------------------
// SKY
//-------------------------------------------------------------------------
function horizonY() { return state.sun.y * H; }

function drawSky(c) {
  const hY = horizonY();
  // Sky gradient above horizon
  const g = c.createLinearGradient(0, 0, 0, hY);
  g.addColorStop(0, state.sky.topColor);
  g.addColorStop(1, state.sky.horizonColor);
  c.fillStyle = g;
  c.fillRect(0, 0, W, hY);
  // Floor base (so palms/effects under horizon have a base)
  c.fillStyle = '#02000a';
  c.fillRect(0, hY, W, H - hY);
}

function drawStars(c) {
  const hY = horizonY();
  const density = state.sky.starDensity;
  const bright = state.sky.starBrightness;
  const count = Math.floor(density * 360);
  // Use a stable seeded RNG keyed off seed so stars don't reshuffle on slider tweak
  const r = mulberry32(state.mountains.seed ^ 0xBEEF);
  for (let i = 0; i < count; i++) {
    const x = r() * W;
    const y = r() * hY * 0.92;
    const sz = r() * 1.4 + 0.2;
    const a = (0.4 + r() * 0.6) * bright;
    c.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
    c.fillRect(x, y, sz, sz);
  }
}

//-------------------------------------------------------------------------
// SUN
//-------------------------------------------------------------------------
function drawSun(c) {
  if (!state.sun.enabled) return;
  const cx = state.sun.x * W;
  const cy = state.sun.y * H;
  const rad = state.sun.radius * H;

  // Glow halo
  if (state.sun.glow > 0) {
    const halo = c.createRadialGradient(cx, cy, rad * 0.4, cx, cy, rad * 2.2);
    halo.addColorStop(0, hexA(state.sun.colorBottom, state.sun.glow * 0.45));
    halo.addColorStop(1, hexA(state.sun.colorBottom, 0));
    c.fillStyle = halo;
    c.fillRect(0, 0, W, H);
  }

  // Echo rings -- concentric outlines radiating out from the disc
  if (state.sun.echo > 0.01) {
    const n = Math.round(1 + state.sun.echo * 5);
    c.save();
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      c.strokeStyle = hexA(state.sun.colorBottom, state.sun.echo * 0.6 * (1 - t));
      c.lineWidth = Math.max(1, 3 - i * 0.4);
      c.beginPath();
      c.arc(cx, cy, rad * (1 + i * 0.16), 0, Math.PI * 2);
      c.stroke();
    }
    c.restore();
  }

  // Sun disc with vertical gradient
  const g = c.createLinearGradient(cx, cy - rad, cx, cy + rad);
  g.addColorStop(0, state.sun.colorTop);
  g.addColorStop(1, state.sun.colorBottom);
  c.fillStyle = g;
  c.beginPath();
  c.arc(cx, cy, rad, 0, Math.PI * 2);
  c.fill();

  // Melt -- the sun drips down past its own bottom edge
  if (state.sun.melt > 0.01) {
    const r = mulberry32(state.mountains.seed ^ 0x50BAD);
    const drips = 5 + Math.round(state.sun.melt * 9);
    c.save();
    c.fillStyle = state.sun.colorBottom;
    for (let i = 0; i < drips; i++) {
      const dx = (r() * 1.7 - 0.85) * rad;
      const yEdge = cy + Math.sqrt(Math.max(0, rad * rad - dx * dx));
      const len = (0.15 + r() * 0.85) * state.sun.melt * rad * 0.9;
      const wDrip = (0.03 + r() * 0.05) * rad;
      c.beginPath();
      c.moveTo(cx + dx - wDrip, yEdge - 4);
      c.lineTo(cx + dx + wDrip, yEdge - 4);
      c.lineTo(cx + dx + wDrip * 0.4, yEdge + len);
      c.arc(cx + dx, yEdge + len, wDrip * 0.4, 0, Math.PI);
      c.closePath();
      c.fill();
    }
    c.restore();
  }

  // Horizontal bars (cut-outs across the lower half)
  if (state.sun.bars) {
    c.save();
    c.beginPath();
    c.arc(cx, cy, rad, 0, Math.PI * 2);
    c.clip();
    const barCount = state.sun.barCount;
    c.globalCompositeOperation = 'destination-out';
    // Start bars from middle and go down
    const startY = cy - rad * 0.05;
    const endY = cy + rad;
    const span = endY - startY;
    const gap = span / barCount;
    // Bars crawl downward when Animate is on (classic outrun horizon)
    const scroll = state.static.animate ? (Date.now() * 0.012) % gap : 0;
    for (let i = 0; i < barCount; i++) {
      const yOff = (i * gap + scroll) % span;
      const t = yOff / span;
      const barH = Math.max(1.5, (1 - t) * span * 0.07);
      const y = startY + yOff + t * 6;
      c.fillStyle = '#000';
      c.fillRect(cx - rad, y, rad * 2, barH);
    }
    c.restore();
  }
}

//-------------------------------------------------------------------------
// MOUNTAINS
//-------------------------------------------------------------------------
function drawMountains(c) {
  const hY = horizonY();
  const layers = state.mountains.layers;
  const baseHeight = state.mountains.height * H * 0.55;
  const jag = state.mountains.jaggedness;

  for (let l = 0; l < layers; l++) {
    const t = layers === 1 ? 0 : l / (layers - 1);
    const layerHeight = baseHeight * (0.5 + t * 0.55);
    const yOffset = hY - (layers - 1 - l) * 18;
    const color = mixColor(state.mountains.colorFar, state.mountains.colorNear, t);
    const seed = state.mountains.seed + l * 7919;
    drawMountainLayer(c, yOffset, layerHeight, jag, color, seed, l, layers);
  }
}

function drawMountainLayer(c, yBase, height, jag, color, seed, layerIdx, layerCount) {
  const rng = mulberry32(seed);
  // Build heightmap
  const samples = 220;
  const heights = new Array(samples);
  // Layered noise
  for (let i = 0; i < samples; i++) {
    let h = 0;
    let amp = 1, freq = 1;
    for (let o = 0; o < 4; o++) {
      const x = i / samples * freq * 6;
      h += amp * (Math.sin(x * 2 + rng() * 6.28) + Math.cos(x * 1.3 + rng() * 6.28)) * 0.5;
      amp *= 0.55; freq *= 2;
    }
    heights[i] = h;
  }
  // Normalize
  let mn = Infinity, mx = -Infinity;
  for (const h of heights) { if (h < mn) mn = h; if (h > mx) mx = h; }
  for (let i = 0; i < samples; i++) {
    const t = (heights[i] - mn) / (mx - mn + 1e-9);
    heights[i] = t * height * (0.4 + jag * 0.9);
  }

  // Draw filled mountain polygon
  c.beginPath();
  c.moveTo(0, yBase);
  for (let i = 0; i < samples; i++) {
    const x = (i / (samples - 1)) * W;
    const y = yBase - heights[i];
    c.lineTo(x, y);
  }
  c.lineTo(W, yBase);
  c.closePath();
  c.fillStyle = color;
  c.fill();

  // Snow caps on the top layer(s)
  if (state.mountains.snow && layerIdx >= layerCount - 2) {
    const snowThreshold = (Math.max(...heights)) * 0.7;
    c.fillStyle = 'rgba(255, 230, 255, 0.85)';
    for (let i = 1; i < samples - 1; i++) {
      if (heights[i] > snowThreshold) {
        const x = (i / (samples - 1)) * W;
        const y = yBase - heights[i];
        const w = W / samples * 1.6;
        c.beginPath();
        c.moveTo(x - w, y + 6);
        c.lineTo(x, y);
        c.lineTo(x + w, y + 6);
        c.closePath();
        c.fill();
      }
    }
  }

  // Wireframe topo overlay
  if (state.mountains.wireframe) {
    c.save();
    c.beginPath();
    c.moveTo(0, yBase);
    for (let i = 0; i < samples; i++) {
      const x = (i / (samples - 1)) * W;
      const y = yBase - heights[i];
      c.lineTo(x, y);
    }
    c.lineTo(W, yBase);
    c.closePath();
    c.clip();
    c.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    c.lineWidth = 1;
    const lines = 14;
    for (let i = 1; i <= lines; i++) {
      const y = yBase - (i / lines) * height;
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(W, y);
      c.stroke();
    }
    c.restore();
  }
}

//-------------------------------------------------------------------------
// GRID FLOOR
//-------------------------------------------------------------------------
function drawGrid(c) {
  const hY = horizonY();
  const floorH = H - hY;
  if (floorH <= 0) return;
  const persp = state.grid.perspective;
  const vpX = W / 2;
  const vpY = hY;

  c.save();
  c.strokeStyle = state.grid.color;
  c.lineWidth = 1.4;
  if (state.grid.glow > 0) {
    c.shadowColor = state.grid.color;
    c.shadowBlur = 12 * state.grid.glow;
  }

  // Vertical perspective lines (converge to vanishing point)
  const verts = state.grid.density;
  for (let i = -verts; i <= verts; i++) {
    const t = i / verts;
    const xBottom = vpX + t * W * 0.85 / Math.max(0.3, persp);
    c.beginPath();
    c.moveTo(vpX + t * 30 * persp, vpY);
    c.lineTo(xBottom, H);
    c.stroke();
  }

  // Horizontal lines, spacing increases as we go down (closer to viewer)
  const horz = state.grid.density;
  for (let i = 1; i <= horz; i++) {
    const t = i / horz;
    // Non-linear (closer rows further apart): t^2.4
    const y = vpY + Math.pow(t, 2.4) * floorH;
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(W, y);
    c.stroke();
  }

  c.restore();
}

//-------------------------------------------------------------------------
// PALMS
//-------------------------------------------------------------------------
function drawPalms(c) {
  const p = state.palms;
  if (p.count <= 0) return;
  const side = p.side;
  const scale = p.scale;
  const spread = p.spread;          // 0.05..1 -- fraction of canvas width from edge palms may occupy
  const vary = p.vary;              // 0..1 -- scale variation between palms
  const depth = p.depth;            // 0..1 -- vertical position variation (depth feel)
  const baseY = horizonY() + 12;
  const r = mulberry32(state.mountains.seed ^ 0xC0FFEE);

  const positions = [];
  for (let i = 0; i < p.count; i++) {
    const isLeft = side === 'left' ? true : side === 'right' ? false : (r() < 0.5);
    const t = r(); // 0..1 within band
    let xT;
    if (isLeft) xT = t * spread;
    else        xT = 1 - t * spread;
    const sizeMul = 1 + (r() * 2 - 1) * vary;  // (1-vary)..(1+vary)
    const s = (0.7 + r() * 0.5) * scale * sizeMul;
    // Depth offset — smaller palms get pushed up (further away)
    const dY = (r() * 2 - 1) * depth * 90;
    positions.push({ x: xT * W, y: baseY + dY, s, isLeft });
  }
  // Draw smaller (further) palms first so larger ones overlap them
  positions.sort((a, b) => a.s - b.s);
  for (const pos of positions) {
    drawPalm(c, pos.x, pos.y, pos.s, pos.isLeft);
  }
}

function drawPalm(c, x, baseY, scale, leansLeft) {
  const p = state.palms;
  const trunkH = 230 * scale;
  const lean = leansLeft ? -1 : 1;
  const bend = (6 + p.curve * 44) * scale;   // 0 = ramrod straight, 1 = wind-blown
  // Sway -- fronds and crown breathe when Animate is on
  const swayA = (state.static.animate && p.sway > 0)
    ? Math.sin(Date.now() * 0.0011 + x * 0.013) * p.sway * 0.22
    : 0;
  const neon = p.style === 'neon';

  c.save();
  c.fillStyle = p.color;
  c.strokeStyle = p.color;
  if (neon) { c.shadowColor = p.color; c.shadowBlur = 12; }
  c.lineWidth = (neon ? 3.5 : 6) * scale;
  c.lineCap = 'round';

  // Trunk (curved)
  c.beginPath();
  c.moveTo(x, baseY);
  c.quadraticCurveTo(x + lean * bend * 0.5, baseY - trunkH * 0.5, x + lean * bend + swayA * 40 * scale, baseY - trunkH);
  c.stroke();

  // Crown center
  const cx = x + lean * bend + swayA * 40 * scale;
  const cy = baseY - trunkH;

  // Fronds
  c.lineWidth = 3 * scale;
  const fronds = p.fronds;
  for (let i = 0; i < fronds; i++) {
    const a = (i / fronds) * Math.PI * 2 + 0.15 + swayA;
    const len = (70 + Math.sin(i * 1.3) * 18) * scale;
    const ex = cx + Math.cos(a) * len;
    const ey = cy + Math.sin(a) * len * 0.7 - 8 * scale;
    c.beginPath();
    c.moveTo(cx, cy);
    c.quadraticCurveTo(cx + Math.cos(a) * len * 0.5, cy + Math.sin(a) * len * 0.5 - 22 * scale, ex, ey);
    c.stroke();
    // little leaflets
    c.lineWidth = 1.5 * scale;
    for (let k = 0; k < 5; k++) {
      const tt = (k + 1) / 6;
      const px = cx + (ex - cx) * tt;
      const py = cy + (ey - cy) * tt - 18 * scale * (1 - tt);
      c.beginPath();
      c.moveTo(px, py);
      c.lineTo(px + Math.cos(a + 0.5) * 8 * scale, py + Math.sin(a + 0.5) * 8 * scale - 3);
      c.moveTo(px, py);
      c.lineTo(px + Math.cos(a - 0.5) * 8 * scale, py + Math.sin(a - 0.5) * 8 * scale - 3);
      c.stroke();
    }
    c.lineWidth = 3 * scale;
  }

  // Coconuts tucked under the crown
  if (p.coconuts) {
    c.shadowBlur = neon ? 8 : 0;
    for (let k = 0; k < 3; k++) {
      const a = Math.PI * (0.3 + k * 0.2);
      c.beginPath();
      c.arc(cx + Math.cos(a) * 11 * scale, cy + 9 * scale + Math.sin(a) * 5 * scale, 5.5 * scale, 0, Math.PI * 2);
      c.fill();
    }
  }
  c.restore();
}

//-------------------------------------------------------------------------
// PLANET
//-------------------------------------------------------------------------
function drawPlanet(c) {
  const o = state.objects;
  const cx = o.planetX * W;
  const cy = o.planetY * H;
  const rad = o.planetScale * H * 0.16;

  // Soft glow
  const halo = c.createRadialGradient(cx, cy, rad * 0.3, cx, cy, rad * 2);
  halo.addColorStop(0, hexA(o.planetColor, 0.5));
  halo.addColorStop(1, hexA(o.planetColor, 0));
  c.fillStyle = halo;
  c.fillRect(cx - rad * 2.4, cy - rad * 2.4, rad * 4.8, rad * 4.8);

  // Disc with gradient shading
  const g = c.createRadialGradient(cx - rad * 0.3, cy - rad * 0.3, rad * 0.2, cx, cy, rad);
  g.addColorStop(0, lighten(o.planetColor, 0.3));
  g.addColorStop(0.6, o.planetColor);
  g.addColorStop(1, darken(o.planetColor, 0.5));
  c.fillStyle = g;
  c.beginPath();
  c.arc(cx, cy, rad, 0, Math.PI * 2);
  c.fill();

  // Surface bands
  c.save();
  c.beginPath(); c.arc(cx, cy, rad, 0, Math.PI * 2); c.clip();
  c.globalAlpha = 0.18;
  c.strokeStyle = darken(o.planetColor, 0.5);
  c.lineWidth = 2;
  for (let i = -4; i <= 4; i++) {
    const y = cy + i * rad * 0.18;
    c.beginPath();
    c.moveTo(cx - rad, y + Math.sin(i) * 4);
    c.bezierCurveTo(cx - rad/2, y - 4, cx + rad/2, y + 4, cx + rad, y);
    c.stroke();
  }
  c.restore();

  // Rings
  if (o.planetRings) {
    c.save();
    c.translate(cx, cy);
    c.rotate(-0.35);
    c.scale(1, 0.22);
    c.strokeStyle = hexA(o.planetColor, 0.9);
    c.lineWidth = 4;
    c.beginPath(); c.arc(0, 0, rad * 1.55, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = hexA(lighten(o.planetColor, 0.3), 0.7);
    c.lineWidth = 2;
    c.beginPath(); c.arc(0, 0, rad * 1.78, 0, Math.PI * 2); c.stroke();
    c.restore();
  }
}

//-------------------------------------------------------------------------
// STATUE POOL (low-res Bayer-dithered marble, sourced from src/statues.js)
//-------------------------------------------------------------------------
const statueImgs = {};      // key -> HTMLImageElement (lazy)
const statueCache = {};     // `${key}|${color}|${style}` -> processed canvas

function getStatueImg(key) {
  let img = statueImgs[key];
  if (!img) {
    img = new Image();
    img.addEventListener('load', () => requestRender());
    img.src = STATUE_SOURCES[key].src;
    statueImgs[key] = img;
  }
  return img;
}

const BAYER4 = [
  [ 0, 8, 2,10],
  [12, 4,14, 6],
  [ 3,11, 1, 9],
  [15, 7,13, 5],
];

function processStatue(key, color, style) {
  const img = getStatueImg(key);
  if (!img.complete || !img.naturalWidth) return null;
  // Normalize dither resolution to ~110px tall so all statues get the same grain
  const targetH = 110;
  const h = targetH;
  const w = Math.max(8, Math.round(targetH * img.naturalWidth / img.naturalHeight));

  const tmp = document.createElement('canvas');
  tmp.width = w; tmp.height = h;
  const tctx = tmp.getContext('2d', { willReadFrequently: true });
  tctx.imageSmoothingEnabled = true;
  tctx.drawImage(img, 0, 0, w, h);

  const data = tctx.getImageData(0, 0, w, h);
  const d = data.data;
  const { r, g, b } = hexToRgb(color);
  // Shadow tone: deep version of the tint so the silhouette stays solid
  const sr = (r * 0.14) | 0, sg = (g * 0.10) | 0, sb = (b * 0.20 + 12) | 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] < 96) { d[i + 3] = 0; continue; }  // outside the cutout
      const lum = 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2];
      // Bayer 4x4 ordered dither, ±44 around threshold of 128
      const ditherOffset = ((BAYER4[y % 4][x % 4] / 15) - 0.5) * 88;
      if (lum > 128 + ditherOffset) {
        d[i] = r; d[i+1] = g; d[i+2] = b; d[i+3] = 255;       // marble highlight
      } else if (style === 'ghost') {
        d[i+3] = 0;                                            // legacy see-through
      } else {
        d[i] = sr; d[i+1] = sg; d[i+2] = sb; d[i+3] = 255;    // solid shadow -> crisp silhouette
      }
    }
  }
  tctx.putImageData(data, 0, 0);
  return tmp;
}

function getStatue(key) {
  const color = state.objects.statueColor;
  const style = state.objects.statueStyle;
  const ck = `${key}|${color}|${style}`;
  if (!statueCache[ck]) {
    // Wand-animated tints churn colors; flush before the cache balloons
    const keys = Object.keys(statueCache);
    if (keys.length > 160) for (const k of keys) delete statueCache[k];
    const processed = processStatue(key, color, style);
    if (!processed) return null;
    statueCache[ck] = processed;
  }
  return statueCache[ck];
}

function drawStatues(c) {
  const o = state.objects;
  const keys = Object.keys(STATUE_SOURCES);
  const r = mulberry32(state.mountains.seed ^ 0xDA71D);
  const baseY = horizonY() + 4;

  for (let n = 0; n < o.statueCount; n++) {
    const key = o.statueKey === 'mixed'
      ? keys[Math.floor(r() * keys.length)]
      : o.statueKey;
    const bmp = getStatue(key);
    if (!bmp) continue;

    // First statue obeys the X/scale dials exactly; the rest scatter (seeded)
    const xT      = n === 0 ? o.statueX : 0.08 + r() * 0.84;
    const sizeMul = n === 0 ? 1 : 0.5 + r() * 0.75;
    const flip    = n > 0 && r() < 0.5;

    const targetHpx = o.statueScale * H * 0.55 * sizeMul;
    const scale = targetHpx / bmp.height;
    const dispW = bmp.width * scale;
    const dispH = bmp.height * scale;
    const x = xT * W - dispW / 2;
    const y = baseY - dispH;

    c.save();
    // Pedestal
    c.fillStyle = '#0a0014';
    c.fillRect(x - 12, baseY - 4, dispW + 24, 16);
    c.fillStyle = '#2d004d';
    c.fillRect(x - 8, baseY - 1, dispW + 16, 4);

    // Chunky pixel render -- no smoothing
    c.imageSmoothingEnabled = false;
    if (flip) {
      c.translate(x + dispW, y);
      c.scale(-1, 1);
      c.drawImage(bmp, 0, 0, dispW, dispH);
    } else {
      c.drawImage(bmp, x, y, dispW, dispH);
    }
    c.restore();
  }
}

//-------------------------------------------------------------------------
// KANJI / random characters (drawn with canvas text)
//-------------------------------------------------------------------------
const KANJI_POOL = ['美','夢','空','光','水','風','音','心','時','未','来','愛','宇','宙','星','月','花','雪','闇','幻','想','虚','無','電','波','現','実'];
function drawKanji(c) {
  const o = state.objects;
  const r = mulberry32(state.mountains.seed ^ 0x4321);
  const count = o.kanjiCount;
  c.save();
  c.fillStyle = o.kanjiColor;
  c.shadowColor = o.kanjiColor;
  c.shadowBlur = 18;
  for (let i = 0; i < count; i++) {
    const ch = KANJI_POOL[Math.floor(r() * KANJI_POOL.length)];
    const size = (60 + r() * 120) * o.kanjiScale;
    const x = 60 + r() * (W - 120);
    const y = 90 + r() * (horizonY() - 100);
    c.font = `bold ${size}px "MS Mincho", "Hiragino Mincho ProN", serif`;
    c.globalAlpha = 0.55 + r() * 0.35;
    c.fillText(ch, x, y);
  }
  c.restore();
}

//-------------------------------------------------------------------------
// 80s BITMAP SPRITES (pixel art silhouettes)
//-------------------------------------------------------------------------
const SPRITES = {
  cassette: [
    '################',
    '#..............#',
    '#.############.#',
    '#.#..........#.#',
    '#.#.##....##.#.#',
    '#.#.##....##.#.#',
    '#.#..........#.#',
    '#.############.#',
    '#..............#',
    '################',
    '..##........##..',
    '..##........##..',
  ],
  floppy: [
    '..############..',
    '..#..........##.',
    '..#.######...##.',
    '..#.##....#..##.',
    '..#.##....#..##.',
    '..#.##....#..##.',
    '..#.######...##.',
    '..#..........##.',
    '..#..........##.',
    '..#...####...##.',
    '..#..######..##.',
    '..#..######..##.',
    '..#..######..##.',
    '..############..',
  ],
  vhs: [
    '##################',
    '#................#',
    '#.####........####',
    '#.#..#........#..#',
    '#.####........####',
    '#................#',
    '#.####........####',
    '#.#..#........#..#',
    '#.####........####',
    '#................#',
    '##################',
  ],
  classicMac: [
    '..############..',
    '..#..........#..',
    '..#.########.#..',
    '..#.#......#.#..',
    '..#.#......#.#..',
    '..#.#......#.#..',
    '..#.#......#.#..',
    '..#.########.#..',
    '..#..........#..',
    '..#..####.##.#..',
    '..############..',
    '..#..........#..',
    '..############..',
  ],
  boombox: [
    '..####################..',
    '.######################.',
    '.##.###..#####...###..#.',
    '.##.#.#..#####...#.#..#.',
    '.##.###..#####...###..#.',
    '.######################.',
    '.##.#####...####...##.#.',
    '.##.#...#...#..#...##.#.',
    '.##.#.#.#...#.##...##.#.',
    '.##.#...#...#..#...##.#.',
    '.##.#####...####...##.#.',
    '.######################.',
  ],
  controller: [
    '.####################',
    '###..####.....####..#',
    '##.##.##........###.#',
    '##.####....##....##.#',
    '##........####...##.#',
    '##.####....##....##.#',
    '##.##.##........###.#',
    '###..####.....####..#',
    '.####################',
  ],
  lightning: [
    '.....####',
    '....####.',
    '...####..',
    '..####...',
    '.######..',
    '########.',
    '....####.',
    '...####..',
    '..####...',
    '.####....',
    '####.....',
    '##.......',
  ],
  pyramid: [
    '......##......',
    '.....####.....',
    '....##..##....',
    '...##....##...',
    '..##......##..',
    '.##........##.',
    '##..........##',
    '##############',
    '##############',
    '###.......####',
    '###.......####',
  ],
  saturn: [
    '.....######.....',
    '...##......##...',
    '..#..........#..',
    '.##....##....##.',
    '##....####....##',
    '##....####....##',
    '##############..',
    '################',
    '##############..',
    '##....####....##',
    '##....####....##',
    '.##....##....##.',
    '..#..........#..',
    '...##......##...',
    '.....######.....',
  ],
  car: [
    '...########........',
    '..####....######...',
    '.##..######....##..',
    '#####################',
    '#####################',
    '..##............##.',
    '.####..........####',
    '.####..........####',
    '..##............##.',
  ],
  diamond: [
    '.....####....',
    '....######...',
    '...########..',
    '..##########.',
    '.############',
    '.############',
    '..##########.',
    '...########..',
    '....######...',
    '.....####....',
    '......##.....',
  ],
  walkman: [
    '#################',
    '#...............#',
    '#.#####...#####.#',
    '#.##..#...#..##.#',
    '#.##..#...#..##.#',
    '#.#####...#####.#',
    '#...............#',
    '#.#............##',
    '#.##....######..#',
    '#...............#',
    '#################',
  ],
  satellite: [
    '..####....####..',
    '..####....####..',
    '..####....####..',
    '.....######.....',
    '....########....',
    '...##########...',
    '...##########...',
    '....########....',
    '.....######.....',
    '..####....####..',
    '..####....####..',
    '..####....####..',
  ],
  invader: [
    '..#.....#..',
    '...#...#...',
    '..#######..',
    '.##.###.##.',
    '###########',
    '#.#######.#',
    '#.#.....#.#',
    '...##.##...',
  ],
  column: [
    '############',
    '.##########.',
    '..##.##.##..',
    '..##.##.##..',
    '..##.##.##..',
    '..##.##.##..',
    '..##.##.##..',
    '..##.##.##..',
    '..##.##.##..',
    '..##.##.##..',
    '.##########.',
    '############',
  ],
  cocktail: [
    '#############',
    '.###########.',
    '..####.####..',
    '...##...##...',
    '....#####....',
    '.....###.....',
    '......#......',
    '......#......',
    '......#......',
    '......#......',
    '....#####....',
    '...#######...',
  ],
  cd: [
    '...#####...',
    '..#######..',
    '.#########.',
    '.####.####.',
    '####...####',
    '####.#.####',
    '####...####',
    '.####.####.',
    '.#########.',
    '..#######..',
    '...#####...',
  ],
  sunglasses: [
    '##################',
    '.#######..#######.',
    '.#######..#######.',
    '..#####....#####..',
    '...###......###...',
  ],
  heart: [
    '.###...###.',
    '#####.#####',
    '###########',
    '###########',
    '.#########.',
    '..#######..',
    '...#####...',
    '....###....',
    '.....#.....',
  ],
  phone: [
    '..####..',
    '..####..',
    '########',
    '#......#',
    '#.####.#',
    '#.####.#',
    '#......#',
    '#.#.#..#',
    '#.#.#..#',
    '#.#.#..#',
    '#......#',
    '########',
  ],
  tv: [
    '#.....#......',
    '.#...#.......',
    '..#.#........',
    '#############',
    '#...........#',
    '#.#########.#',
    '#.#########.#',
    '#.#########.#',
    '#...........#',
    '#############',
    '..##.....##..',
  ],
  rocket: [
    '....##....',
    '...####...',
    '...####...',
    '..######..',
    '..#.##.#..',
    '..######..',
    '..######..',
    '.########.',
    '###.##.###',
    '##..##..##',
    '....##....',
    '...####...',
  ],
};
const SPRITE_NAMES = Object.keys(SPRITES);

function drawSprite(c, sprite, x, y, scale, color, glow) {
  c.save();
  if (glow > 0) { c.shadowColor = color; c.shadowBlur = glow * 14; }
  c.fillStyle = color;
  for (let row = 0; row < sprite.length; row++) {
    const line = sprite[row];
    for (let col = 0; col < line.length; col++) {
      if (line[col] === '#') {
        c.fillRect(
          Math.round(x + col * scale),
          Math.round(y + row * scale),
          Math.ceil(scale),
          Math.ceil(scale)
        );
      }
    }
  }
  c.restore();
}

function drawBitmaps(c) {
  const o = state.objects;
  const r = mulberry32(state.mountains.seed ^ 0xB17ABE);
  for (let i = 0; i < o.bitmapCount; i++) {
    const name = SPRITE_NAMES[Math.floor(r() * SPRITE_NAMES.length)];
    const sprite = SPRITES[name];
    const px = (0.05 + r() * 0.9) * W;
    const py = 30 + r() * (horizonY() - 80);
    const scale = (2 + r() * 4) * o.bitmapScale;
    const w = sprite[0].length * scale;
    const h = sprite.length * scale;
    drawSprite(c, sprite, px - w / 2, py - h / 2, scale, o.bitmapColor, 0.4 + r() * 0.4);
  }
}

//-------------------------------------------------------------------------
// SUN RAYS (radiating beams from the sun)
//-------------------------------------------------------------------------
function drawSunRays(c) {
  const o = state.objects;
  const cx = state.sun.x * W;
  const cy = state.sun.y * H;
  const rad = state.sun.radius * H;
  const count = o.rayCount;
  const len = o.rayLength * H * 1.2;
  const width = (Math.PI * 2 / count) * o.rayWidth;

  c.save();
  c.globalCompositeOperation = 'screen';
  c.fillStyle = hexA(state.sun.colorTop, 0.18);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    c.beginPath();
    c.moveTo(cx + Math.cos(a - width / 2) * rad, cy + Math.sin(a - width / 2) * rad);
    c.lineTo(cx + Math.cos(a + width / 2) * rad, cy + Math.sin(a + width / 2) * rad);
    c.lineTo(cx + Math.cos(a + width / 2) * (rad + len), cy + Math.sin(a + width / 2) * (rad + len));
    c.lineTo(cx + Math.cos(a - width / 2) * (rad + len), cy + Math.sin(a - width / 2) * (rad + len));
    c.closePath();
    c.fill();
  }
  c.restore();
}

//-------------------------------------------------------------------------
// COLOR HELPERS
//-------------------------------------------------------------------------
function hexToHsl(hex) {
  let { r, g, b } = hexToRgb(hex);
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return { h: 0, s: 0, l: l * 100 };
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h;
  if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0));
  else if (mx === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h * 60, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r, g, b;
  if (h < 60)       [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else              [r, g, b] = [c, 0, x];
  const to2 = v => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

function lighten(hex, amt) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.min(255, r + 255 * amt) | 0},${Math.min(255, g + 255 * amt) | 0},${Math.min(255, b + 255 * amt) | 0})`;
}
function darken(hex, amt) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.max(0, r - 255 * amt) | 0},${Math.max(0, g - 255 * amt) | 0},${Math.max(0, b - 255 * amt) | 0})`;
}

//=========================================================================
// FX
//=========================================================================
function applyChromatic(srcCanvas, destCtx) {
  const amount = state.fx.chromatic;
  if (amount < 0.01) {
    destCtx.clearRect(0, 0, W, H);
    destCtx.drawImage(srcCanvas, 0, 0);
    return;
  }
  const offset = Math.round(amount * 10);
  const src = srcCanvas.getContext('2d').getImageData(0, 0, W, H);
  const out = destCtx.createImageData(W, H);
  const s = src.data, o = out.data;
  for (let y = 0; y < H; y++) {
    const rowBase = y * W * 4;
    for (let x = 0; x < W; x++) {
      const xR = x - offset; const xB = x + offset;
      const iR = (xR < 0 ? 0 : xR >= W ? W - 1 : xR);
      const iB = (xB < 0 ? 0 : xB >= W ? W - 1 : xB);
      const i = rowBase + x * 4;
      o[i]     = s[rowBase + iR * 4];     // R
      o[i + 1] = s[rowBase + x * 4 + 1];  // G
      o[i + 2] = s[rowBase + iB * 4 + 2]; // B
      o[i + 3] = 255;
    }
  }
  destCtx.putImageData(out, 0, 0);
}

function applyGlitch(c) {
  const amt = state.fx.glitch;
  if (amt < 0.01) return;
  const slices = Math.floor(amt * 14) + 1;
  for (let i = 0; i < slices; i++) {
    if (fxRand() > 0.65) continue;
    const sy = Math.floor(fxRand() * H);
    const sh = Math.floor(fxRand() * 22) + 3;
    const dx = (fxRand() - 0.5) * amt * 140;
    if (sy + sh > H) continue;
    const img = c.getImageData(0, sy, W, sh);
    c.clearRect(0, sy, W, sh);
    c.putImageData(img, dx, sy);
    // Fill the gap left behind
    if (dx > 0) {
      const edge = c.getImageData(0, sy, 2, sh);
      // (leave as-is; works fine visually)
    }
  }
}

function applyScanlines(c) {
  const amt = state.fx.scanlines;
  if (amt < 0.01) return;
  c.save();
  c.globalAlpha = amt * 0.45;
  c.fillStyle = '#000';
  for (let y = 0; y < H; y += 3) {
    c.fillRect(0, y, W, 1);
  }
  c.restore();
}

function applyGrain(c) {
  const amt = state.fx.grain;
  if (amt < 0.01) return;
  const img = c.getImageData(0, 0, W, H);
  const d = img.data;
  const strength = amt * 60;
  for (let i = 0; i < d.length; i += 4) {
    const n = (fxRand() - 0.5) * strength;
    d[i]   = clamp255(d[i] + n);
    d[i+1] = clamp255(d[i+1] + n);
    d[i+2] = clamp255(d[i+2] + n);
  }
  c.putImageData(img, 0, 0);
}

function applyVignette(c) {
  const amt = state.fx.vignette;
  if (amt < 0.01) return;
  const g = c.createRadialGradient(W/2, H/2, Math.min(W,H) * 0.35, W/2, H/2, Math.max(W,H) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${(amt * 0.85).toFixed(3)})`);
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
}

//=========================================================================
// STATIC :: OVERLAYS
//=========================================================================
const fxBuf = document.createElement('canvas');
fxBuf.width = W; fxBuf.height = H;
const fxBufCtx = fxBuf.getContext('2d', { willReadFrequently: true });

function applyTVStatic(c) {
  const amt = state.static.tvStatic;
  if (amt < 0.01) return;
  const img = c.getImageData(0, 0, W, H);
  const d = img.data;
  const dose = amt * 0.55;
  for (let i = 0; i < d.length; i += 4) {
    if (fxRand() < dose) {
      const n = (fxRand() * 255) | 0;
      d[i] = n; d[i+1] = n; d[i+2] = n;
    }
  }
  c.putImageData(img, 0, 0);
}

function applyRGBGhost(c) {
  const amt = state.static.rgbGhost;
  if (amt < 0.01) return;
  fxBufCtx.clearRect(0, 0, W, H);
  fxBufCtx.drawImage(c.canvas, 0, 0);
  c.save();
  c.globalAlpha = amt * 0.55;
  c.globalCompositeOperation = 'screen';
  const off = Math.round(amt * 24);
  c.drawImage(fxBuf, off, -2);
  c.drawImage(fxBuf, -off, 2);
  c.restore();
}

function applyWaveWarp(c) {
  const amt = state.static.waveWarp;
  if (amt < 0.01) return;
  fxBufCtx.clearRect(0, 0, W, H);
  fxBufCtx.drawImage(c.canvas, 0, 0);
  c.clearRect(0, 0, W, H);
  const amp = amt * 28;
  const t = state.static.animate ? Date.now() * 0.001 : 0;
  const step = 4;
  for (let y = 0; y < H; y += step) {
    const dx = Math.sin(y * 0.04 + t * 1.4) * amp + Math.sin(y * 0.013 + t * 0.7) * amp * 0.4;
    c.drawImage(fxBuf, 0, y, W, step, dx, y, W, step);
  }
}

function applyHueShift(c) {
  const amt = state.static.hueShift;
  if (amt < 0.01) return;
  fxBufCtx.clearRect(0, 0, W, H);
  fxBufCtx.drawImage(c.canvas, 0, 0);
  c.save();
  c.filter = `hue-rotate(${(amt * 360).toFixed(1)}deg)`;
  c.drawImage(fxBuf, 0, 0);
  c.restore();
}

function applyPosterize(c) {
  const amt = state.static.posterize;
  if (amt < 0.01) return;
  const levels = Math.max(2, Math.round(16 - amt * 14));
  const img = c.getImageData(0, 0, W, H);
  const d = img.data;
  const step = 255 / (levels - 1);
  for (let i = 0; i < d.length; i += 4) {
    d[i]   = Math.round(d[i]   / step) * step;
    d[i+1] = Math.round(d[i+1] / step) * step;
    d[i+2] = Math.round(d[i+2] / step) * step;
  }
  c.putImageData(img, 0, 0);
}

function applyBadBlocks(c) {
  const amt = state.static.badBlocks;
  if (amt < 0.01) return;
  const count = Math.floor(amt * 10) + 1;
  c.save();
  for (let i = 0; i < count; i++) {
    const x = fxRand() * W;
    const y = fxRand() * H;
    const w = (20 + fxRand() * 200) * amt;
    const h = (3 + fxRand() * 28);
    const r = fxRand();
    c.fillStyle = r < 0.45 ? '#000' :
                  r < 0.75 ? '#ff00ff' :
                  r < 0.92 ? '#00f0ff' : '#0a0014';
    c.fillRect(x, y, w, h);
  }
  c.restore();
}

function applyTapeBands(c) {
  const amt = state.static.tapeBands;
  if (amt < 0.01) return;
  const count = Math.floor(amt * 7) + 1;
  c.save();
  c.globalCompositeOperation = 'screen';
  for (let i = 0; i < count; i++) {
    const y = fxRand() * H;
    const h = 2 + fxRand() * 10;
    const hue = (fxRand() * 360) | 0;
    c.fillStyle = `hsla(${hue}, 100%, 60%, ${(amt * 0.5).toFixed(2)})`;
    c.fillRect(0, y, W, h);
  }
  c.restore();
}

function applyInvertPulse(c) {
  const amt = state.static.invertPulse;
  if (amt < 0.01) return;
  const slabs = Math.floor(amt * 4) + 1;
  c.save();
  c.globalCompositeOperation = 'difference';
  c.fillStyle = '#fff';
  for (let i = 0; i < slabs; i++) {
    const y = fxRand() * H;
    const h = (10 + fxRand() * 80) * amt;
    c.fillRect(0, y, W, h);
  }
  c.restore();
}

function applyTextOverlay(c) {
  const s = state.static;
  if (!s.recBadge && !s.vhsCounter && !s.hexMarquee) return;
  c.save();
  c.font = 'bold 28px "VT323", "Silkscreen", monospace';

  if (s.recBadge) {
    const blink = s.animate ? (Math.floor(Date.now() / 600) % 2) : 1;
    if (blink) {
      c.fillStyle = '#ff003c';
      c.beginPath(); c.arc(40, 38, 10, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = '#fff';
    c.fillText('REC', 60, 48);
  }

  if (s.vhsCounter) {
    const totalSec = s.animate ? Math.floor(Date.now() / 1000) % 36000 : 1487;
    const hh = Math.floor(totalSec / 3600);
    const mm = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const ss = (totalSec % 60).toString().padStart(2, '0');
    c.fillStyle = '#fff';
    c.fillText(`SP  ${hh.toString().padStart(2,'0')}:${mm}:${ss}`, 28, H - 28);
  }

  if (s.hexMarquee) {
    const hex = 'DEAD BEEF C0FFEE BAD F00D CAFE BABE 1337 FACE FEED ';
    const repeat = hex + hex + hex + hex;
    c.font = '20px "VT323", monospace';
    c.fillStyle = 'rgba(255,45,149,0.85)';
    const offset = s.animate ? -((Date.now() * 0.06) % 200) : 0;
    c.fillText(repeat, offset, H - 10);
  }

  c.restore();
}

//=========================================================================
// ANDROID :: HUD  (matrix rain, ASCII mode, reticle,
//                  telemetry, rolling band, scan sweep, anaglyph 3D)
//=========================================================================
const MATRIX_CHARSETS = {
  kana:    'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ',
  binary:  '01',
  hex:     '0123456789ABCDEF',
  wetware: 'WETWARE.SYS美夢空光水風音心><=#@%&',
  symbols: '◆◇○●□■△▲▽▼☆★♀♂※†‡§¶∞∆∇∂∫√≠≈',
};

const matrixBuf = document.createElement('canvas');
matrixBuf.width = W; matrixBuf.height = H;
const matrixCtx = matrixBuf.getContext('2d');
let matrixDrops = [];
let matrixLastT = 0;

function applyMatrixRain(c) {
  const amt = state.android.matrix;
  if (amt < 0.01) return;
  const cellSize = 14;
  const cols = Math.floor(W / cellSize);
  const fresh = matrixDrops.length !== cols;
  if (fresh) {
    matrixDrops = new Array(cols).fill(0).map(() => fxRand() * H);
  }
  // Only advance the rain while the master Animation toggle is on --
  // otherwise the buffer holds a freeze-frame (wands may keep the loop hot)
  if (state.static.animate || fresh) {
    // Fade for trail
    matrixCtx.fillStyle = 'rgba(0,0,0,0.10)';
    matrixCtx.fillRect(0, 0, W, H);
    matrixCtx.font = `${cellSize}px "VT323", "Courier New", monospace`;

    const chars = MATRIX_CHARSETS[state.android.matrixChars] || MATRIX_CHARSETS.kana;
    const color = state.android.matrixColor;
    const stepBase = cellSize * 1.4 * state.android.matrixSpeed;

    for (let i = 0; i < cols; i++) {
      const x = i * cellSize;
      const y = matrixDrops[i];
      const ch = chars[Math.floor(fxRand() * chars.length)];
      matrixCtx.fillStyle = color;
      matrixCtx.fillText(ch, x, y);
      // White-hot head occasionally
      if (fxRand() < 0.08) {
        matrixCtx.fillStyle = '#fff';
        matrixCtx.fillText(ch, x, y);
      }
      matrixDrops[i] += stepBase * (0.6 + fxRand() * 0.8);
      if (matrixDrops[i] > H && fxRand() < 0.025) {
        matrixDrops[i] = -cellSize * Math.floor(fxRand() * 8);
      }
    }
  }

  c.save();
  c.globalCompositeOperation = 'screen';
  c.drawImage(matrixBuf, 0, 0);
  c.restore();
}

function applyAnaglyph(c) {
  const amt = state.android.anaglyph;
  if (amt < 0.01) return;
  const off = Math.round(amt * 14);
  const img = c.getImageData(0, 0, W, H);
  const out = c.createImageData(W, H);
  const s = img.data, o = out.data;
  for (let y = 0; y < H; y++) {
    const rowBase = y * W * 4;
    for (let x = 0; x < W; x++) {
      const xR = x - off;
      const xC = x + off;
      const iR = (xR < 0 ? 0 : xR >= W ? W - 1 : xR);
      const iC = (xC < 0 ? 0 : xC >= W ? W - 1 : xC);
      const i = rowBase + x * 4;
      o[i]     = s[rowBase + iR * 4];        // R
      o[i + 1] = s[rowBase + iC * 4 + 1];    // G
      o[i + 2] = s[rowBase + iC * 4 + 2];    // B
      o[i + 3] = 255;
    }
  }
  c.putImageData(out, 0, 0);
}

function applyRollingBand(c) {
  const amt = state.android.rollingBand;
  if (amt < 0.01) return;
  const animating = state.static.animate;
  const t = animating ? Date.now() * 0.0005 : 0.35;
  const bandY = ((t * H) % (H + 120)) - 60;
  const bandH = 60;
  if (bandY <= -bandH || bandY >= H) return;
  const top = Math.max(0, Math.floor(bandY));
  const bot = Math.min(H, Math.floor(bandY + bandH));
  if (bot <= top) return;
  const h = bot - top;
  fxBufCtx.clearRect(0, 0, W, H);
  fxBufCtx.drawImage(c.canvas, 0, 0);
  c.clearRect(0, top, W, h);
  c.drawImage(fxBuf, 0, top, W, h, Math.round(34 * amt), top, W, h);
  c.save();
  c.fillStyle = `rgba(255,255,255,${0.18 * amt})`;
  c.fillRect(0, top, W, 2);
  c.fillRect(0, bot - 2, W, 2);
  c.restore();
}

function applyReticle(c) {
  if (!state.android.reticle) return;
  const cx = state.sun.x * W;
  const cy = state.sun.y * H;
  const rad = state.sun.radius * H;
  const off = rad + 16;
  const len = 22;
  const color = state.android.matrixColor;
  c.save();
  c.strokeStyle = color;
  c.fillStyle = color;
  c.lineWidth = 2;
  c.shadowColor = color;
  c.shadowBlur = 4;

  // Corner brackets
  const brackets = [
    [cx - off, cy - off,  1,  1],
    [cx + off, cy - off, -1,  1],
    [cx - off, cy + off,  1, -1],
    [cx + off, cy + off, -1, -1],
  ];
  for (const [x, y, dx, dy] of brackets) {
    c.beginPath();
    c.moveTo(x + dx * len, y);
    c.lineTo(x, y);
    c.lineTo(x, y + dy * len);
    c.stroke();
  }
  // Center crosshair
  c.beginPath();
  c.moveTo(cx - 7, cy); c.lineTo(cx + 7, cy);
  c.moveTo(cx, cy - 7); c.lineTo(cx, cy + 7);
  c.stroke();

  // Diagonal tick marks
  c.lineWidth = 1;
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const r1 = rad + 28, r2 = rad + 38;
    c.beginPath();
    c.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    c.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    c.stroke();
  }

  // Readouts
  c.font = '14px "VT323", monospace';
  c.fillText(`TGT::LOCK`, cx + off + 10, cy - off + 12);
  c.fillText(`R:${rad.toFixed(0)}`,   cx + off + 10, cy - off + 28);
  c.fillText(`AZ:${(state.sun.x * 360).toFixed(1)}°`, cx + off + 10, cy - off + 44);
  c.restore();
}

function applyScanSweep(c) {
  if (!state.android.scanSweep) return;
  const animating = state.static.animate;
  const t = animating ? Date.now() * 0.0015 : 0.3;
  const sweepY = (Math.sin(t) * 0.5 + 0.5) * H;
  const color = state.android.matrixColor;
  c.save();
  c.fillStyle = color;
  c.globalAlpha = 0.6;
  c.fillRect(0, sweepY - 1, W, 2);
  const grad = c.createLinearGradient(0, sweepY, 0, sweepY + 90);
  grad.addColorStop(0, hexA(color, 0.35));
  grad.addColorStop(1, hexA(color, 0));
  c.fillStyle = grad;
  c.fillRect(0, sweepY, W, 90);
  c.restore();
}

function applyTelemetryHUD(c) {
  if (!state.android.telemetry) return;
  const color = state.android.matrixColor;
  const r = mulberry32(state.mountains.seed ^ 0xC1A0);
  const psi = (r() * 9.99).toFixed(2);
  const hdg = Math.floor(r() * 360).toString().padStart(3, '0');
  const alt = (r() * 9999).toFixed(0).padStart(4, '0');
  const tmp = (60 + r() * 30).toFixed(1);
  const sig = Math.floor(r() * 100);
  const ts = state.static.animate
    ? new Date().toISOString().slice(11, 19)
    : '04:20:69';

  c.save();
  c.font = '18px "VT323", monospace';
  c.fillStyle = color;
  c.shadowColor = color;
  c.shadowBlur = 3;
  // Top-left
  c.fillText('> WETWARE.OS // wake_state=DREAM', 16, 36);
  c.fillText(`> SIG:${sig}%  TMP:${tmp}°C  RX:HOT`, 16, 56);
  // Top-right
  const tr = [`SYS::OK`, `PWR:88%`, `HDG:${hdg}°`, `PSI:${psi}`];
  for (let i = 0; i < tr.length; i++) {
    c.fillText(tr[i], W - 170, 36 + i * 20);
  }
  // Bottom-left
  c.fillText(`ALT:${alt}m   T:${ts}`, 16, H - 40);
  // Bottom-right
  c.fillText('// VAPORWAVE.BAS', W - 200, H - 40);
  // Corner reticles
  c.strokeStyle = color;
  c.lineWidth = 1.5;
  const corner = 24;
  const cornerOff = 12;
  const drawCorner = (x, y, dx, dy) => {
    c.beginPath();
    c.moveTo(x + dx * corner, y);
    c.lineTo(x, y);
    c.lineTo(x, y + dy * corner);
    c.stroke();
  };
  drawCorner(cornerOff, cornerOff, 1, 1);
  drawCorner(W - cornerOff, cornerOff, -1, 1);
  drawCorner(cornerOff, H - cornerOff, 1, -1);
  drawCorner(W - cornerOff, H - cornerOff, -1, -1);
  c.restore();
}

function applyAsciiMode(c) {
  if (!state.android.ascii) return;
  const cell = state.android.asciiSize;
  const ramp = '  .\'`,:_-+=*#%@';
  const data = c.getImageData(0, 0, W, H).data;
  c.fillStyle = '#000';
  c.fillRect(0, 0, W, H);
  c.font = `bold ${cell}px "VT323", "Silkscreen", monospace`;
  c.textBaseline = 'top';
  for (let y = 0; y < H; y += cell) {
    for (let x = 0; x < W; x += cell) {
      const i = ((y | 0) * W + (x | 0)) * 4;
      const r = data[i], g = data[i+1], b = data[i+2];
      const lum = (r + g + b) / 3;
      const idx = Math.min(ramp.length - 1, Math.floor(lum / 255 * (ramp.length - 1)));
      const ch = ramp[idx];
      if (ch === ' ') continue;
      c.fillStyle = `rgb(${r},${g},${b})`;
      c.fillText(ch, x, y);
    }
  }
}

//=========================================================================
// UTIL
//=========================================================================
function clamp255(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }

function hexToRgb(hex) {
  const h = hex.replace('#','');
  return {
    r: parseInt(h.substring(0,2), 16),
    g: parseInt(h.substring(2,4), 16),
    b: parseInt(h.substring(4,6), 16),
  };
}
function hexA(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
function mixColor(hexA_, hexB, t) {
  const a = hexToRgb(hexA_), b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bl})`;
}

//=========================================================================
// SOUND :: weird ambient vibes via Web Audio
//=========================================================================
const Sound = (() => {
  let ctx = null;
  let nodes = null; // bag of nodes when running
  let running = false;
  let lfoFreqVal = 0.2; // smooth handoff value

  function ensureCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function makeReverbImpulse(ac, duration, decay) {
    const rate = ac.sampleRate;
    const len = rate * duration;
    const ir = ac.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return ir;
  }

  function makeNoiseBuffer(ac, seconds) {
    const len = ac.sampleRate * seconds;
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function start() {
    if (running) return;
    const ac = ensureCtx();
    if (ac.state === 'suspended') ac.resume();
    const s = state.sound;

    const master = ac.createGain();
    master.gain.value = s.masterVol;

    const lpf = ac.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 200 + s.lpfCutoff * 6000;
    lpf.Q.value = 1.2;

    const wetGain = ac.createGain();
    wetGain.gain.value = s.reverb;
    const dryGain = ac.createGain();
    dryGain.gain.value = 1 - s.reverb * 0.5;
    const conv = ac.createConvolver();
    conv.buffer = makeReverbImpulse(ac, 4.5, 2.5);

    // Bus: sources -> lpf -> (dry + (wet -> conv)) -> master -> destination
    lpf.connect(dryGain);
    lpf.connect(conv);
    conv.connect(wetGain);
    dryGain.connect(master);
    wetGain.connect(master);
    master.connect(ac.destination);

    // --- Drone: 2 detuned sawtooths + sub sine ---
    const droneA = ac.createOscillator();
    const droneB = ac.createOscillator();
    const sub    = ac.createOscillator();
    droneA.type = 'sawtooth';
    droneB.type = 'sawtooth';
    sub.type = 'sine';
    droneA.frequency.value = s.droneFreq;
    droneB.frequency.value = s.droneFreq;
    droneB.detune.value = s.droneDetune;
    sub.frequency.value = s.droneFreq / 2;

    const droneGain = ac.createGain();
    droneGain.gain.value = 0.35;
    droneA.connect(droneGain);
    droneB.connect(droneGain);
    const subGain = ac.createGain();
    subGain.gain.value = 0.3;
    sub.connect(subGain);
    droneGain.connect(lpf);
    subGain.connect(lpf);

    // --- LFO modulating LPF cutoff ---
    const lfo = ac.createOscillator();
    const lfoGain = ac.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = s.lfoRate;
    lfoGain.gain.value = 800;
    lfo.connect(lfoGain);
    lfoGain.connect(lpf.frequency);

    // --- Pad shimmer: noise -> bandpass with slow chirp ---
    const noiseBuf = makeNoiseBuffer(ac, 4);
    const padSrc = ac.createBufferSource();
    padSrc.buffer = noiseBuf; padSrc.loop = true;
    const padBP = ac.createBiquadFilter();
    padBP.type = 'bandpass';
    padBP.frequency.value = 1800;
    padBP.Q.value = 5;
    const padGain = ac.createGain();
    padGain.gain.value = s.padShimmer * 0.18;
    padSrc.connect(padBP);
    padBP.connect(padGain);
    padGain.connect(lpf);
    // Slow chirp on the bandpass
    const padLfo = ac.createOscillator();
    const padLfoGain = ac.createGain();
    padLfo.type = 'sine';
    padLfo.frequency.value = 0.07;
    padLfoGain.gain.value = 600;
    padLfo.connect(padLfoGain);
    padLfoGain.connect(padBP.frequency);

    // --- Vinyl crackle: noise -> highpass, gated by random impulses via gain ramps ---
    const crackleSrc = ac.createBufferSource();
    crackleSrc.buffer = makeNoiseBuffer(ac, 4);
    crackleSrc.loop = true;
    const crackleHP = ac.createBiquadFilter();
    crackleHP.type = 'highpass';
    crackleHP.frequency.value = 2200;
    const crackleGain = ac.createGain();
    crackleGain.gain.value = s.crackle * 0.18;
    crackleSrc.connect(crackleHP);
    crackleHP.connect(crackleGain);
    crackleGain.connect(master); // bypass reverb for crisper crackles

    // --- Rain: noise -> lowpass ---
    const rainSrc = ac.createBufferSource();
    rainSrc.buffer = makeNoiseBuffer(ac, 4);
    rainSrc.loop = true;
    const rainLP = ac.createBiquadFilter();
    rainLP.type = 'lowpass';
    rainLP.frequency.value = 1400;
    const rainGain = ac.createGain();
    rainGain.gain.value = s.rain * 0.25;
    rainSrc.connect(rainLP);
    rainLP.connect(rainGain);
    rainGain.connect(lpf);

    // Start all
    const t = ac.currentTime + 0.05;
    droneA.start(t); droneB.start(t); sub.start(t);
    lfo.start(t); padSrc.start(t); padLfo.start(t);
    crackleSrc.start(t); rainSrc.start(t);

    // Fade in
    master.gain.setValueAtTime(0, ac.currentTime);
    master.gain.linearRampToValueAtTime(s.masterVol, ac.currentTime + 1.2);

    nodes = {
      master, lpf, dryGain, wetGain,
      droneA, droneB, sub, droneGain, subGain,
      lfo, lfoGain, padSrc, padBP, padGain, padLfo, padLfoGain,
      crackleSrc, crackleHP, crackleGain,
      rainSrc, rainLP, rainGain,
    };
    running = true;
  }

  function stop() {
    if (!running || !nodes) return;
    const ac = ctx;
    const now = ac.currentTime;
    nodes.master.gain.cancelScheduledValues(now);
    nodes.master.gain.linearRampToValueAtTime(0, now + 0.4);
    const n = nodes;
    setTimeout(() => {
      try {
        ['droneA','droneB','sub','lfo','padSrc','padLfo','crackleSrc','rainSrc'].forEach(k => n[k].stop());
      } catch (_) {}
    }, 500);
    nodes = null;
    running = false;
  }

  function update() {
    if (!running || !nodes) return;
    const s = state.sound;
    const t = ctx.currentTime;
    const ramp = (param, v) => param.setTargetAtTime(v, t, 0.05);
    ramp(nodes.master.gain, s.masterVol);
    ramp(nodes.droneA.frequency, s.droneFreq);
    ramp(nodes.droneB.frequency, s.droneFreq);
    nodes.droneB.detune.setTargetAtTime(s.droneDetune, t, 0.05);
    ramp(nodes.sub.frequency, s.droneFreq / 2);
    ramp(nodes.lpf.frequency, 200 + s.lpfCutoff * 6000);
    ramp(nodes.lfo.frequency, s.lfoRate);
    ramp(nodes.padGain.gain, s.padShimmer * 0.18);
    ramp(nodes.crackleGain.gain, s.crackle * 0.18);
    ramp(nodes.rainGain.gain, s.rain * 0.25);
    ramp(nodes.wetGain.gain, s.reverb);
    ramp(nodes.dryGain.gain, 1 - s.reverb * 0.5);
  }

  return { start, stop, update, get running() { return running; } };
})();

//=========================================================================
// EXPORT
//=========================================================================
function exportPNG() {
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `wetware-vaporwave-${Date.now()}.png`;
  a.click();
}

//=========================================================================
// BOOT
//=========================================================================
buildUI();
document.getElementById('preset').value = 'Miami Vice';
applyPreset('Miami Vice');
if (applyShareHash()) syncUIFromState();
document.getElementById('randomize').addEventListener('click', randomize);
document.getElementById('export').addEventListener('click', exportPNG);
// Master animation toggle -- same flag as the STATIC panel's Animate box
const masterAnimate = document.getElementById('master-animate');
masterAnimate.checked = state.static.animate;
masterAnimate.addEventListener('input', () => {
  state.static.animate = masterAnimate.checked;
  syncUIFromState();
  requestRender();
});
document.getElementById('sound-play').addEventListener('click', () => {
  Sound.start();
  document.getElementById('snd-status').textContent = 'PLAYING';
});
document.getElementById('sound-stop').addEventListener('click', () => {
  Sound.stop();
  document.getElementById('snd-status').textContent = 'STANDBY';
});
document.getElementById('preset').addEventListener('change', e => {
  document.getElementById('stage-preset').textContent = e.target.value;
});
syncUIFromState();
render();

// === STATUS BAR LIVE UPDATES ===
function pad2(n) { return n.toString().padStart(2, '0'); }
function updateClock() {
  const d = new Date();
  let h = d.getHours();
  const m = pad2(d.getMinutes());
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12; if (h === 0) h = 12;
  document.getElementById('clock').textContent = `${h}:${m} ${ampm}`;
}
updateClock();
setInterval(updateClock, 30 * 1000);

// Active FX summary in stage bottom bar
function refreshFxStatus() {
  const labels = {
    chromatic: 'CHROMA', scanlines: 'SCAN', grain: 'GRAIN',
    glitch: 'GLITCH', vignette: 'VIGNETTE',
  };
  const statics = {
    tvStatic: 'STATIC', rgbGhost: 'GHOST', waveWarp: 'WARP',
    hueShift: 'HUE', posterize: 'POSTER', badBlocks: 'BLOCK',
    tapeBands: 'BAND', invertPulse: 'INVERT',
  };
  const droids = {
    matrix: 'RAIN', rollingBand: 'ROLL', anaglyph: 'ANAGLYPH',
  };
  const a = state.android;
  const droidFlags = [
    a.ascii && 'ASCII', a.reticle && 'TGT',
    a.telemetry && 'TLM', a.scanSweep && 'SWEEP',
  ].filter(Boolean);
  const active = [
    ...Object.keys(labels).filter(k => state.fx[k] > 0.05).map(k => labels[k]),
    ...Object.keys(statics).filter(k => state.static[k] > 0.05).map(k => statics[k]),
    ...Object.keys(droids).filter(k => state.android[k] > 0.05).map(k => droids[k]),
    ...droidFlags,
  ];
  document.getElementById('stage-fx').textContent = active.length
    ? active.join(' / ')
    : 'CLEAN SIGNAL';
  const sBar = document.getElementById('static-status');
  if (sBar) {
    const sCnt = Object.keys(statics).filter(k => state.static[k] > 0.05).length;
    sBar.textContent = state.static.animate ? `LIVE x${sCnt}` : (sCnt > 0 ? `${sCnt} ACTIVE` : 'DRY');
  }
  const aBar = document.getElementById('android-status');
  if (aBar) {
    const aCnt = Object.keys(droids).filter(k => state.android[k] > 0.05).length + droidFlags.length;
    aBar.textContent = aCnt > 0 ? `${aCnt} ONLINE` : 'DORMANT';
  }
  // Master toggle mirrors static.animate however it was changed
  const mAnim = document.getElementById('master-animate');
  if (mAnim) mAnim.checked = state.static.animate;
}
const origRequestRender = requestRender;
requestRender = function() {
  refreshFxStatus();
  if (needsAnimation()) startAnimLoop();
  scheduleHashUpdate();     // URL bar always carries the current scene
  origRequestRender();
};
refreshFxStatus();
// A share URL can arrive with animation already on (wands, animate flag,
// rain...) -- the boot render() bypasses the wrapper, so kick the loop here
if (needsAnimation()) startAnimLoop();

// === BOOT INTRO ===
(function bootIntro() {
  const lines = [
    'WETWARE.OS  v7.5.3',
    'Copyright (c) 1989-2026 wetware.sys',
    '',
    '> POST                                    ........ [OK]',
    '> Mounting /dev/dreams                    ........ [OK]',
    '> Calibrating chrominance LUT             ........ [OK]',
    `> Loading sprite pool [${SPRITE_NAMES.length} entries]        ........ [OK]`,
    `> Bayer-dithering marble pool [${Object.keys(STATUE_SOURCES).length} statues]   ........ [OK]`,
    '> Detuning oscillators                    ........ [OK]',
    '> Spawning katakana entropy               ........ [OK]',
    '> Targeting reticle: standby              ........ [OK]',
    '> Hydrating state from URL hash           ........ [OK]',
    '> RUNTIME ACTIVE',
    '',
    '> RUN VAPORWAVE.BAS',
  ];
  const el = document.getElementById('boot-text');
  if (!el) return;
  let i = 0;
  const tick = () => {
    if (i >= lines.length) {
      setTimeout(() => {
        const boot = document.getElementById('boot');
        if (boot) {
          boot.classList.add('fading');
          setTimeout(() => boot.remove(), 1300);
        }
      }, 600);
      return;
    }
    el.textContent += lines[i] + '\n';
    i++;
    setTimeout(tick, 75 + Math.random() * 60);
  };
  tick();
  // Skip on space / click
  const skip = () => {
    const boot = document.getElementById('boot');
    if (boot) { boot.classList.add('fading'); setTimeout(() => boot.remove(), 600); }
  };
  window.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') skip(); }, { once: true });
  document.addEventListener('click', skip, { once: true });
})();

// Keyboard shortcuts: R = randomize, E = export
window.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  if (e.key === 'r' || e.key === 'R') randomize();
  if (e.key === 'e' || e.key === 'E') exportPNG();
});

// Stage window drag
const stageWin = document.getElementById('stage-window');
makeDraggable(stageWin.querySelector('.title-bar'), stageWin);

initWinamp();

