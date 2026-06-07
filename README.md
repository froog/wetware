```
 ██╗    ██╗███████╗████████╗██╗    ██╗ █████╗ ██████╗ ███████╗
 ██║    ██║██╔════╝╚══██╔══╝██║    ██║██╔══██╗██╔══██╗██╔════╝
 ██║ █╗ ██║█████╗     ██║   ██║ █╗ ██║███████║██████╔╝█████╗
 ██║███╗██║██╔══╝     ██║   ██║███╗██║██╔══██║██╔══██╗██╔══╝
 ╚███╔███╔╝███████╗   ██║   ╚███╔███╔╝██║  ██║██║  ██║███████╗
  ╚══╝╚══╝ ╚══════╝   ╚═╝    ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
   ░░░░░ V A P O R W A V E   G E N E R A T O R ░░░░░░░░░░░░░
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   // SYSTEM 7.5.3  ▓  RUNTIME OK  ▓  美 夢 空 光 水 風 音 心
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

```
╔══════════════════════════════════════════════════════════════╗
║  > LOADING WETWARE.APP ...                                   ║
║  > SECTORS: ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ [OK]    ║
║  > TAPE HEAD: misaligned ▒ chroma bleeding ▒ vibes nominal   ║
║  > PRESS ANY DIAL TO BEGIN                                   ║
╚══════════════════════════════════════════════════════════════╝
```

s̶i̷n̴g̶l̵e ̷f̶i̸l̴e̶ ̶v̷a̴p̶o̸r̴w̸a̷v̷e — open `index.html` in any modern browser. that's it. no build step, no server, no `npm install`, no nothing. just a chunky 2200-line `<html>` that pretends to be a 1991 Mac with a procedural sunset bolted on.

```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                W H A T   T H I S   I S
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

a vaporwave aesthetic generator that lets you tweak a whole sunset down to the bone:

- procedural sky / sun / mountains / grid floor / palm trees
- floating planets, dithered Statue of David, kanji, sun-rays, 80s pixel sprites
- CRT-grade FX stack: chromatic aberration, scanlines, grain, glitch slices, vignette
- a whole second STATIC layer: TV static, RGB ghost, wave warp, hue shift,
  posterize, bad blocks, tape bands, invert pulse, REC/SP/hex marquee overlays
- live Web Audio ambient synth (drone + pad + crackle + rain + LFO + reverb)
- export to PNG at 1280x720
- the chrome itself looks like a System 7 Finder that fell into a puddle

```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                Q U I C K   S T A R T
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

```sh
git clone git@github.com:froog/wetware.git
cd wetware
open index.html       # macOS
# or just double-click it. fr.
```

> ╳ HEADS UP ╳ if you serve via `file://` and edit the David source image,
> you'll re-trigger a canvas-taint error. the photo is already inlined
> as base64 so the shipped build runs everywhere with no server.

```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                T H E   D I A L S
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

nine windows of dials, all of which talk to one canvas. presets included:
**Miami Vice, Outrun, Pastel Dream, Cyber Night, Tropic Punch, Acid Wash, Cotton Candy**.

```
┌──────────────────┬─────────────────────────────────────────┐
│ ▓░ SKY           │ top/horizon colors, star density+bright │
│ ▓░ SUN           │ x/y/size, top/bottom color, glow, bars  │
│ ▓░ MOUNTAINS     │ layers, height, jaggedness, snow caps,  │
│                  │ wireframe topo overlay, colors          │
│ ▓░ GRID FLOOR    │ color, density, glow, perspective       │
│ ▓░ PALMS         │ count 0-16, side, scale, spread, vary,  │
│                  │ depth (for foreshortened tropical guys) │
│ ▓░ OBJECTS       │ planet+rings, David (1-bit dithered),   │
│                  │ kanji, 80s bitmap sprites, sun rays     │
│ ▓░ FX::GLITCH    │ chroma, scanlines, grain, glitch slices │
│ ▓░ STATIC        │ tv static, rgb ghost, wave warp, hue,   │
│                  │ posterize, bad blocks, tape bands,      │
│                  │ invert pulse, REC, SP counter, hex      │
│                  │ marquee, Animate (RAF loop kicks in)    │
│ ▓░ SOUND         │ drone Hz+detune, pad shimmer, vinyl     │
│                  │ crackle, rain, LPF cutoff, LFO rate,    │
│                  │ convolution reverb                      │
└──────────────────┴─────────────────────────────────────────┘
```

```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                S P R I T E   B I N
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

the 80s pixel-art object pool, all hand-typed as `# . # . #` strings:

```
[cassette] [floppy] [VHS] [classic Mac] [boombox] [NES pad]
[lightning] [pyramid] [Saturn] [80s car] [diamond] [walkman]
[satellite]
```

each render picks `bitmapCount` of these at random, tints them with
`bitmapColor`, drops them above the horizon at a chunky pixel scale.
seeded RNG so the same scene reproduces until you bump RANDOMIZE.

```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                K E Y S . S Y S
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

```
┌─────────┬──────────────────────────────┐
│   R     │   RANDOMIZE everything       │
│   E     │   EXPORT PNG                 │
│ click   │   PLAY / STOP synth          │
│ Animate │   live overlays moving       │
└─────────┴──────────────────────────────┘
```

```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                A E S T H E T I C
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

the `aesthetics/` folder is the mood board. references include:

- the canonical pink/sun + wireframe mountain shot
- palms-and-grid-floor sunset
- a glitched Greek statue (RIP procedural version, long live David.jpg)
- a melting CRT television
- a real `System 7.0` Finder screenshot — every striped title bar,
  close box, status strip, and "X items | Y MB | Z available" line in
  the app is calqued off it

David himself is a Wikimedia Commons public-domain photograph
(`Michelangelos_David.jpg`), downsampled to 70px wide and threshold-
dithered through a Bayer 4x4 matrix at runtime so he renders as
chunky 1-bit pixels at any zoom.

```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                T E C H
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

```
                       ┌──────────────────┐
                       │  index.html only │
                       └──────────────────┘
                                │
                 ┌──────────────┼──────────────┐
                 ▼              ▼              ▼
            <canvas>      <SVG filters>    Web Audio
          1280 x 720     warp + grime    drone, pad,
                        on the chrome   reverb, LFO
                 │              │              │
                 ▼              ▼              ▼
            scene draw     UI distress    weird vibes
            + ImageData    (≤ 1.2 px      (live, no
            FX passes      displacement)   samples)
```

- **zero deps** — vanilla HTML / CSS / JS
- **canvas** for everything visual; offscreen scene canvas + main canvas pipeline
- **chromatic aberration** done via `getImageData` channel-shift loop
- **glitch slices** via `getImageData(0,y,W,h)` + `putImageData(_, dx, y)`
- **convolution reverb** via runtime-generated noise impulse response
- **Bayer 4x4 ordered dither** on David, baked tint per `statueColor`
- **fonts** — Silkscreen (chrome) + DotGothic16 (body) + VT323 (mono) via
  Google Fonts; falls back gracefully if offline
- **SVG filters** — `feTurbulence` + `feDisplacementMap` for the warp
  applied to title bars; menu bar kept crisp on purpose
- **inlined data URL** for David so `file://` doesn't taint the canvas

```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                L I C   /   C R E D I T S
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

- code: do whatever you want with it. attribution appreciated.
- David photograph: Wikimedia Commons, public domain.
- everything else is procedurally drawn, no external sprites or samples.

```
█▓▒░ E N D   O F   T R A N S M I S S I O N ░▒▓█
▒░ if your screen starts melting that's by design ░▒
.. ▓ ░ // signal lost // 信号失わ ▒ ░ ▓ ..
```
