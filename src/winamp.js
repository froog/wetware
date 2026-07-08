import { makeDraggable } from './drag.js';

export function initWinamp() {
  const TRACKS = [
    { name: 'Flash Boy - Crusing Sunset',       file: '/assets/Flash_Boy_-_Crusing_Sunset.mp3' },
    { name: 'The Chaser - Neon Trigger',        file: '/assets/The_Chaser_-_Neon_Trigger.mp3' },
    { name: 'Hurricane Huck - Trigger Point',   file: '/assets/Hurricane_Huck_-_Trigger_Point.mp3' },
    { name: 'MC Master - Tape Static',          file: '/assets/MC_Master_-_Tape_Static.mp3' },
    { name: '咲きたい - 今ここで、街の真ん中で', file: encodeURI('/assets/咲きたい_-_今ここで_街の真ん中で.mp3') },
  ];

  let currentIdx = 0;
  let playing    = false;
  let shuffle    = false;
  let repeat     = false;
  let plOpen     = false;
  let shaded     = false;

  const audio = new Audio();
  audio.volume = 0.8;
  audio.crossOrigin = 'anonymous';

  let actx = null, analyser = null, panner = null;

  const BARS = 20;
  const peaks    = new Float32Array(BARS);
  const peakVel  = new Float32Array(BARS);

  const BAR_TILT  = Float32Array.from({length: BARS}, () => (Math.random() - 0.5) * 0.32);
  const BAR_WMult = Float32Array.from({length: BARS}, () => 0.55 + Math.random() * 0.6);
  const BAR_YOff  = Float32Array.from({length: BARS}, () => (Math.random() - 0.5) * 3);

  // ---- Audio context (lazy init on first play) ----
  function initCtx() {
    if (actx) return;
    actx = new AudioContext();
    analyser = actx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.55;
    panner = actx.createStereoPanner();
    const src = actx.createMediaElementSource(audio);
    src.connect(analyser);
    analyser.connect(panner);
    panner.connect(actx.destination);
  }

  // ---- Playback controls ----
  function loadTrack(idx) {
    currentIdx = idx;
    audio.src = TRACKS[idx].file;
    updateMarquee();
    updatePlaylist();
  }

  function play() {
    initCtx();
    if (actx.state === 'suspended') actx.resume();
    audio.play().catch(() => {});
    playing = true;
    setLamp(true);
    setPlayBtn(true);
  }

  function pause() {
    audio.pause();
    playing = false;
    setLamp(false);
    setPlayBtn(false);
  }

  function stop() {
    audio.pause();
    audio.currentTime = 0;
    playing = false;
    setLamp(false);
    setPlayBtn(false);
    q('#wmp-time').textContent = '0:00';
    q('#wmp-seek').value = 0;
  }

  function prevTrack() {
    loadTrack((currentIdx - 1 + TRACKS.length) % TRACKS.length);
    if (playing) play();
  }

  function nextTrack(autoPlay = true) {
    const idx = shuffle
      ? Math.floor(Math.random() * TRACKS.length)
      : (currentIdx + 1) % TRACKS.length;
    loadTrack(idx);
    if (autoPlay) play();
  }

  audio.addEventListener('ended', () => {
    if (repeat) { audio.currentTime = 0; play(); }
    else nextTrack(true);
  });

  audio.addEventListener('timeupdate', () => {
    const t = q('#wmp-time');
    const s = q('#wmp-seek');
    if (t) t.textContent = fmt(audio.currentTime);
    if (s && !s.dataset.dragging && audio.duration) {
      s.value = (audio.currentTime / audio.duration) * 1000;
    }
  });

  // ---- UI helpers ----
  function q(sel) { return document.querySelector(sel); }

  function fmt(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function setLamp(on) {
    const lamp = q('.wmp-lamp');
    const txt  = q('#wmp-state-txt');
    if (lamp) lamp.classList.toggle('on', on);
    if (txt)  txt.textContent = on ? 'PLAYING' : (audio.currentTime > 0 ? 'PAUSED' : 'STOPPED');
  }

  function setPlayBtn(isPlaying) {
    const btn = q('#wmp-play-btn');
    if (btn) btn.textContent = isPlaying ? '⏸' : '▶';
  }

  function updateMarquee() {
    const el = q('#wmp-marquee-text');
    if (!el) return;
    const t = TRACKS[currentIdx];
    el.textContent = `${currentIdx + 1}. ${t.name.toUpperCase()}   ›   WETWARE AUDIO v2.0   ›   `;
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';
  }

  function updatePlaylist() {
    document.querySelectorAll('.wmp-pl-item').forEach((el, i) => {
      el.classList.toggle('active', i === currentIdx);
    });
  }

  // ---- Spectrum visualizer ----
  let visRaf = null;
  function drawSpectrum() {
    visRaf = requestAnimationFrame(drawSpectrum);
    const canvas = q('#wmp-vis-canvas');
    if (!canvas) return;
    const c = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    c.fillStyle = '#0a0014';
    c.fillRect(0, 0, W, H);

    let data;
    if (analyser) {
      data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
    }

    const bw = W / BARS;

    for (let i = 0; i < BARS; i++) {
      let val = 0;
      if (data) {
        const di = Math.floor(Math.pow(i / BARS, 0.62) * data.length);
        val = data[di] / 255;
        val = Math.min(1, val + (Math.random() * 0.04));
      } else {
        val = 0.04 + Math.random() * 0.05;
      }

      const midBoost = 1 + 0.35 * Math.sin((i / BARS) * Math.PI);
      const barH = Math.max(2, val * H * 0.93 * midBoost);

      if (barH >= peaks[i]) {
        peaks[i]   = barH;
        peakVel[i] = -1.2;
      } else {
        peakVel[i] += 0.55;
        peaks[i]   = Math.max(2, peaks[i] - peakVel[i]);
      }

      const cx   = i * bw + bw / 2;
      const jx   = (Math.random() - 0.5) * 1.4;
      const jy   = BAR_YOff[i] + (Math.random() - 0.5) * 0.8;
      const barW = bw * BAR_WMult[i];

      c.save();
      c.translate(cx + jx, H + jy);
      c.rotate(BAR_TILT[i]);

      const t = i / (BARS - 1);
      const grad = c.createLinearGradient(0, -barH, 0, 0);
      grad.addColorStop(0,    '#ff2d95');
      grad.addColorStop(0.45, `hsl(${295 - t * 110}, 100%, 62%)`);
      grad.addColorStop(1,    '#00d4d4');
      c.fillStyle = grad;
      c.fillRect(-barW / 2, -barH, barW, barH);

      const peakBrightness = Math.min(1, peaks[i] / H + 0.3);
      c.fillStyle = `rgba(255,255,255,${peakBrightness.toFixed(2)})`;
      c.fillRect(-barW / 2, -peaks[i], barW, 2);

      c.restore();
    }
  }

  // ---- Build DOM ----
  function buildHTML() {
    const root = document.getElementById('winamp');
    root.innerHTML = `
<div class="window" id="wmp-main">
  <div class="title-bar" id="wmp-titlebar">
    <button aria-label="Close" class="close" id="wmp-close-btn"></button>
    <h1 class="title">LLAMAS-ASS.APP</h1>
    <button aria-label="Resize" class="resize" id="wmp-shade-btn"></button>
  </div>

  <div id="wmp-display">
    <div class="wmp-disp-row1">
      <div id="wmp-time">0:00</div>
      <canvas id="wmp-vis-canvas" width="118" height="32"></canvas>
      <div class="wmp-stats">
        <div class="wmp-stat">128<sub>kbps</sub></div>
        <div class="wmp-stat">44<sub>kHz</sub></div>
        <div id="wmp-stereo-badge">STEREO</div>
      </div>
    </div>
    <div class="wmp-disp-marquee">
      <span id="wmp-marquee-text">WETWARE AUDIO SYSTEM *** LOADING ***</span>
    </div>
  </div>

  <div id="wmp-status-row">
    <span><span class="wmp-lamp"></span><span id="wmp-state-txt">STOPPED</span></span>
    <span>128 KBPS</span>
    <span>44 KHZ</span>
    <div class="wmp-eqpl-bar">
      <button class="wmp-eqpl-btn" id="wmp-eq-btn">EQ</button>
      <button class="wmp-eqpl-btn" id="wmp-pl-btn">PL</button>
      <button class="wmp-eqpl-btn" id="wmp-shuf-btn">SHF</button>
      <button class="wmp-eqpl-btn" id="wmp-rep-btn">REP</button>
    </div>
  </div>

  <div id="wmp-seek-row">
    <input type="range" id="wmp-seek" min="0" max="1000" value="0">
  </div>

  <div id="wmp-controls">
    <button class="wmp-btn" id="wmp-prev-btn"  title="Previous">⏮</button>
    <button class="wmp-btn" id="wmp-play-btn"  title="Play / Pause">▶</button>
    <button class="wmp-btn" id="wmp-stop-btn"  title="Stop">⏹</button>
    <button class="wmp-btn" id="wmp-next-btn"  title="Next">⏭</button>
    <button class="wmp-btn" id="wmp-eject-btn" title="Playlist">⏏</button>
  </div>

  <div id="wmp-sliders">
    <div class="wmp-sl-row">
      <span class="wmp-sl-label">VOL</span>
      <input type="range" id="wmp-vol" min="0" max="100" value="80">
    </div>
    <div class="wmp-sl-row">
      <span class="wmp-sl-label">BAL</span>
      <input type="range" id="wmp-bal" min="-100" max="100" value="0">
    </div>
  </div>
</div>

<div class="window" id="wmp-playlist">
  <div class="title-bar" id="wmp-pl-titlebar">
    <button aria-label="Close" class="close" id="wmp-pl-close-btn"></button>
    <h1 class="title">PLAYLIST</h1>
    <button aria-label="Resize" disabled class="hidden"></button>
  </div>
  <div id="wmp-pl-count-bar">
    <span>${TRACKS.length} tracks</span>
    <span>WETWARE AUDIO</span>
  </div>
  <div id="wmp-pl-list"></div>
  <div id="wmp-pl-footer">
    <button class="wmp-pl-fbtn">+ADD</button>
    <button class="wmp-pl-fbtn">-REM</button>
  </div>
</div>`;
  }

  function buildPlaylist() {
    const list = q('#wmp-pl-list');
    TRACKS.forEach((t, i) => {
      const item = document.createElement('div');
      item.className = 'wmp-pl-item' + (i === 0 ? ' active' : '');
      item.innerHTML = `
        <span class="wmp-pl-num">${i + 1}.</span>
        <span class="wmp-pl-name">${t.name.toUpperCase()}</span>
        <span class="wmp-pl-dur" id="wmp-dur-${i}">--:--</span>`;
      item.addEventListener('click', () => { loadTrack(i); play(); });
      list.appendChild(item);

      const probe = new Audio(t.file);
      probe.addEventListener('loadedmetadata', () => {
        const el = q(`#wmp-dur-${i}`);
        if (el) el.textContent = fmt(probe.duration);
      });
    });
  }

  function wireEvents() {
    // Shade (collapse body, keep titlebar)
    q('#wmp-shade-btn').addEventListener('click', () => {
      shaded = !shaded;
      ['#wmp-display','#wmp-status-row','#wmp-seek-row','#wmp-controls','#wmp-sliders'].forEach(sel => {
        q(sel).style.display = shaded ? 'none' : '';
      });
      if (plOpen && shaded) {
        q('#wmp-playlist').classList.remove('visible');
      } else if (plOpen) {
        q('#wmp-playlist').classList.add('visible');
      }
    });

    q('#wmp-close-btn').addEventListener('click', () => { q('#wmp-main').style.display = 'none'; });

    // Transport
    q('#wmp-prev-btn').addEventListener('click', prevTrack);
    q('#wmp-play-btn').addEventListener('click', () => { playing ? pause() : play(); });
    q('#wmp-stop-btn').addEventListener('click', stop);
    q('#wmp-next-btn').addEventListener('click', () => nextTrack(true));
    q('#wmp-eject-btn').addEventListener('click', togglePlaylist);

    // Seek bar
    const seek = q('#wmp-seek');
    seek.addEventListener('mousedown', () => { seek.dataset.dragging = '1'; });
    seek.addEventListener('mouseup',   () => {
      delete seek.dataset.dragging;
      if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
    });

    // EQ/PL/SHUF/REP toggles
    q('#wmp-pl-btn').addEventListener('click', togglePlaylist);
    q('#wmp-eq-btn').addEventListener('click', e => e.target.classList.toggle('active'));
    q('#wmp-shuf-btn').addEventListener('click', e => {
      shuffle = !shuffle;
      e.target.classList.toggle('active', shuffle);
    });
    q('#wmp-rep-btn').addEventListener('click', e => {
      repeat = !repeat;
      e.target.classList.toggle('active', repeat);
    });

    // Volume & balance
    q('#wmp-vol').addEventListener('input', e => { audio.volume = e.target.value / 100; });
    q('#wmp-bal').addEventListener('input', e => { if (panner) panner.pan.value = e.target.value / 100; });

    // Playlist close button (now in title bar)
    q('#wmp-pl-close-btn').addEventListener('click', () => {
      plOpen = false;
      q('#wmp-playlist').classList.remove('visible');
      q('#wmp-pl-btn').classList.remove('active');
    });

    // Drag — main window and playlist independently
    makeDraggable(q('#wmp-titlebar'),    q('#wmp-main'));
    makeDraggable(q('#wmp-pl-titlebar'), q('#wmp-playlist'));
  }

  function togglePlaylist() {
    plOpen = !plOpen;
    const pl = q('#wmp-playlist');
    pl.classList.toggle('visible', plOpen);
    q('#wmp-pl-btn').classList.toggle('active', plOpen);
    if (plOpen && !pl.style.top) {
      // First open: snap below main window
      const mainR = q('#wmp-main').getBoundingClientRect();
      pl.style.top   = (mainR.bottom + 4) + 'px';
      pl.style.left  = mainR.left + 'px';
      pl.style.right = 'auto';
    }
  }

  // ---- Public init ----
  function init() {
    buildHTML();
    buildPlaylist();
    wireEvents();
    loadTrack(0);
    drawSpectrum();
  }

  init();
}
