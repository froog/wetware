# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev      # Vite dev server (hot reload)
npm run build    # Production build to dist/
npm run preview  # Preview the production build
```

The original design intent (README) is to open `index.html` directly with no build step. The Vite setup (`src/main.js` + `src/style.css`) is a newer layering on top of that. Both modes work.

## Architecture

Zero-dependency vanilla JS / Canvas / Web Audio app. No framework, no tests, no linting config.

**Two-canvas pipeline** (`src/main.js`):
1. `sceneCanvas` (offscreen) — all scene drawing: sky, stars, sun, mountains, grid, palms, objects
2. `canvas` (visible) — receives the composited scene then has the FX chain applied in order: chromatic aberration → static/warp overlays → ANDROID HUD layer → TV static / scanlines / grain / vignette

**State → UI → Render loop:**
- `state` object is the single source of truth (sky, sun, mountains, grid, palms, objects, fx, static, android, sound sections)
- `CONTROLS` array declaratively defines every dial; `buildUI()` auto-generates all HTML inputs from it at startup
- Any control change calls `requestRender()`, which batches via `requestAnimationFrame`
- Animated features (matrix rain, scan sweep, rolling band, and — when `static.animate` is on — sun bar scroll, sun melt, palm sway) start a continuous `animLoopRunning` RAF loop; it self-terminates when `needsAnimation()` returns false

**Render function order** (`render()` ~line 495):
Scene draw → `applyChromatic` → static/warp chain → ANDROID HUD chain → film grain/CRT chain

**Sound** (`Sound` object, Web Audio API):
- Synthesized entirely at runtime — drone oscillator + shimmer pad + vinyl crackle buffer + rain noise + convolution reverb (impulse generated from noise)
- `Sound.update()` is called directly from slider `input` events for the sound section; all other sections call `requestRender()`

**Key conventions:**
- Mountain heights use a seeded PRNG (`mulberry32`) so scenes reproduce deterministically from `state.mountains.seed`
- Stars also use `mulberry32` keyed on the same seed so they stay stable when non-seed sliders change
- `PRESETS` are partial state objects — `applyPreset()` merges them into state and calls `syncUIFromState()`
- Window chrome comes from [system.css](https://github.com/sakofchit/system.css) (`@sakun/system.css` via unpkg) using its `.window` / `.title-bar` (close/title/resize) markup. The sidebar is ONE docked window in the system.css docs-site style: `.title-bar` → `.details-bar` → scrollable `.window-pane` (authentic System 7 scrollbar) containing flat `.panel` sections (no collapse/expand). Stage window and Winamp are floating `.window`s
- Fonts are system.css's System 7 bitmap faces: Chicago_12 (`--font-chicago`, pixel-true at 16px) for chrome/headings/buttons, Geneva_9 (`--font-geneva`, pixel-true at 12px) for labels/status text. Silkscreen/VT323 survive only in the boot screen and Winamp LCD display
- `src/style.css` keeps a small override layer on top of system.css: warp filter + separator line on `.title-bar`, button skin reset for close/resize widgets, and neutralizers for system.css's global checkbox hijack (`opacity:0; position:fixed` + label pseudo-boxes) and the `<select>` arrow (use `background-color`, never `background`, on selects)
- Floating windows (`#stage-window`, `#wmp-main`, `#wmp-playlist`) are CSS-tilted; `drag.js` reads computed `left`/`top` (not `getBoundingClientRect`) so dragging preserves the tilt without jumping
- Statues (David + 7 more classical cutouts in `src/statues.js`, grayscale+alpha PNGs base64-inlined so `file://` works) are rendered via Bayer 4x4 ordered dithering with an alpha mask: bright pixels → tint, dark pixels → deep shadow tone (`solid` style, keeps the silhouette crisp) or transparent (`ghost` style). Processed canvases cache per `key|color|style`
- Scene state is shareable via URL: `#w=<base64url JSON diff vs DEFAULT_STATE>` — `encodeShareHash()`/`applyShareHash()` in `src/main.js`, no storage involved
- System 7 chrome colors are sampled 1:1 from `aesthetics/system7.png` (see `--s7-*` vars in `src/style.css`); title bar pinstripes and the 11px close/zoom widgets are inline SVG data URIs, with the `#warp` fuzz filter kept on top
- All pixel FX (chromatic aberration, glitch slices, bad blocks, wave warp) use raw `getImageData`/`putImageData` loops on the main canvas

**Files:**
- `index.html` — app shell, SVG filter defs, Mac System 7 chrome structure
- `src/main.js` — all logic (~2300 lines): presets, state, CONTROLS definitions, UI builder, render pipeline, every draw function, Sound engine, share-URL hash codec
- `src/statues.js` — generated statue pool (base64 grayscale+alpha cutouts; David from assets/david.png, the rest public-domain Wikimedia Commons)
- `src/style.css` — all styles for the System 7 / vaporwave chrome
- `assets/` — `david.png` (source for dithering), ambient audio files
- `aesthetics/` — mood board images, not used at runtime
