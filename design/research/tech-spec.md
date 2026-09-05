# MTF11 — Mediterranean SUN · Technical Specification

**Project:** mtf.global — Mediterranean Tourism Forum 2026, 11th edition, 25–27 November 2026, Malta
**Theme:** Mediterranean SUN — Stewardship · Unity · Net Positive
**Document:** 3D / WebGL technical direction, v1.0 — 2026-09-05
**Audience:** every coding agent building a chapter, the core/integration owner, the design & narrative directors
**Ground truth:** `/brief/01…06` and `/brief/refs/*`. This spec turns the brief into buildable architecture; it does not re-decide story or design.

---

## 0. Decisions at a glance

| Concern | Decision | One-line reason |
|---|---|---|
| Build tool | **Vite 8.2.2** (Rolldown + Oxc), static build | pear.no is a Vite app; fastest static pipeline; Vercel-native |
| Language | **TypeScript 7.0.2**, `strict`, vanilla DOM (no UI framework) | real DOM text, zero reconciliation cost, agents write plain modules with typed contracts |
| 3D | **Three.js 0.185.1**, `WebGLRenderer`, hand-written GLSL `ShaderMaterial`s | broadest agent competence, addons (SVGLoader, RoomEnvironment, PMREM), `postprocessing` compatibility |
| Post-processing | **postprocessing 6.39.4** (peer `three >=0.168 <0.186` ✔) — one merged `EffectPass` + custom `TesseraeEffect` | merges bloom/CA/grain/vignette into one fullscreen pass; clean `Effect` subclass API |
| Scroll | **Lenis 1.3.26** (lerp) → **GSAP 3.15.0 ScrollTrigger** `scrub:true` on **one master timeline** | one smoothing source, native scrollbar/keyboard kept, timeline labels for chapters |
| Pinning | **CSS `position: sticky` stage** (`.stage{height:N×100vh} > .pin{sticky;100dvh;overflow:clip}`) exactly like pear.no; ScrollTrigger only *reads* progress | no pin-spacer, no transform fights with Lenis, cheapest on resize |
| Text splitting | **GSAP SplitText** (free since 3.13; `autoSplit`, `mask`, `aria:"auto"`) | `split-type` 0.3.4 is unmaintained (2022) and has no a11y story |
| Fonts | Self-hosted **woff2** in `/public/fonts` (latin + latin-ext for Maltese Ċ Ġ Ħ Ż), preloaded, `document.fonts.ready` gate | pear.no pattern; deterministic line-splitting |
| Shaders | `.glsl` files via **vite-plugin-glsl 1.6.1** (`#include` chunks); `?raw` fallback | shareable chunk library across chapters |
| Perf | 60 fps M1 @ DPR ≤ 1.75; 30 fps mobile @ DPR ≤ 1.25; adaptive DPR; ≤ 3 fullscreen passes | see §8 budget |
| Fallbacks | `html.mode-film` (JS+GL) ↔ `html.mode-page` (no-JS / no-GL / reader / print) — same DOM, two CSS modes | accessibility + SEO + robustness from one source |
| Deploy | **Vercel static** (`dist/`), immutable asset headers, no serverless | brief |
| Licensing | three MIT · GSAP "100 % free for all users, thanks to Webflow" incl. ScrollTrigger/SplitText/DrawSVG/MorphSVG (verified gsap.com/pricing 2026-09-05) · Lenis MIT · postprocessing Zlib · fonts OFL | no paid licences anywhere |

> **Environment blocker found during research:** the workstation's data volume has **~136 MB free** (`/System/Volumes/Data` 100 % used). `npm view` already failed with `ENOSPC`. `npm install` for this stack needs ≈ 250–350 MB (three + typescript native binaries + vite). **Free ≥ 2 GB before any agent runs the install command in §12.**

---

## 1. What the technology must deliver (from the brief)

1. **A film, not a stack of sections.** pear.no: one `section.stage` with a `div.pin` (sticky, full viewport, `#0b0a09`); the page scroll (≈ 73 viewports) *is* the timeline; every content block is absolutely positioned inside the pin and faded/moved by scroll state. We replicate the architecture and exceed it with a true 3D world.
2. **A persistent 3D world** that the story moves through: Helios' sun → a sky full of stars → one star descends → Ogygia/Gozo (honey limestone, red Ramla earth, the sea) → the veil → seven years (sunrise→sunset→seasons) → the net cut → the open hand → sunrise. The Calypso's Odyssey script is the spine; the SUN pillars, three days, 11-for-11, four specialist events, MED READY, AI hospitality, coffee, stats, speakers and registration are the content beats hung on it.
3. **Mosaic / tesserae** as the signature visual grammar (Byzantine gold-glass mosaic → Mediterranean; "super mosaic, artistic"): a post-process that can turn *anything* rendered into tesserae and re-form it, plus a DOM tesserae-dissolve for text.
4. **Folk-art flat geometry** (X ref 1): flat geometric silhouettes, limited palette (sand `#f3e3c3`, sea teal `#1d4a5c/#2b5f73`, terracotta `#8c3a2b`, gold `#d9a441`, flame `#ff7a1a→#ffd166`, ink navy), paper grain, big negative space, long diagonals. Delivered as **inline SVG + `SVGLoader → ShapeGeometry` flat meshes in 3D** — no raster imagery required.
5. **Cinematic dark-stage motion** (X refs 2–3): pinned scroll-locked scenes, layered depth/parallax, restrained premium easing (`cubic-bezier(.22,1,.36,1)`), nothing bounces.
6. **Zero external imagery at launch.** Everything procedural (GLSL, SVG, typography). Generated imagery/video is an *optional* layer loaded lazily per chapter later (§9.4).
7. **All content is real DOM text**, keyboard-navigable, reduced-motion aware, crawlable; proper meta/OG/schema.org Event.
8. **Parallel agent build.** Each chapter is a self-contained module owning its DOM fragment, CSS, GSAP timeline and WebGL group; it registers into the Stage through one typed API (§5).

---

## 2. Verified versions (registry.npmjs.org, 2026-09-05)

| Package | Latest | Notes |
|---|---|---|
| `three` | **0.185.1** | MIT. `WebGLRenderer.compileAsync`, `AgXToneMapping`, `three/addons/*` (SVGLoader, RoomEnvironment, Timer). **Pin exact** — see postprocessing peer range. |
| `@types/three` | 0.185.4 | matches |
| `gsap` | **3.15.0** | Free incl. ScrollTrigger, SplitText, DrawSVG, MorphSVG, ScrollSmoother, Observer, Flip. Import: `gsap/ScrollTrigger`, `gsap/SplitText`, `gsap/DrawSVGPlugin`. |
| `lenis` | **1.3.26** | Package is `lenis` (not `@studio-freight/lenis` 1.0.42, deprecated). Official ScrollTrigger recipe: `lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0)`. |
| `postprocessing` | **6.39.4** | Zlib. Peer `three >= 0.168.0 < 0.186.0` → compatible with 0.185.1. Do not bump three to 0.186 until postprocessing does. |
| `vite` | **8.2.2** | Rolldown + Oxc by default. `build.rollupOptions` → `build.rolldownOptions`; `manualChunks` object form removed → `output.codeSplitting`; browser targets now Chrome 111 / Firefox 114 / Safari 16.4. Plugins returning transformed code may need `moduleType:'js'`. |
| `typescript` | **7.0.2** | Ships platform binaries via optional deps (`@typescript/typescript-darwin-arm64`). Used only for `tsc --noEmit` type-checking — Vite transpiles with Oxc. If any tool chokes on TS 7, pin `typescript@~5.9` with zero code change. |
| `vite-plugin-glsl` | 1.6.1 | Peer `vite >= 3.x`. `#include` chunks + minify. Fallback if Vite 8 breaks it: Vite's built-in `import frag from './x.glsl?raw'` + our 30-line `resolveIncludes()`. |
| `split-type` | 0.3.4 | Last release 2022. **Rejected** in favour of SplitText. |
| `lil-gui` / `stats-gl` | 0.21.0 / 4.2.3 | dev-only tuning + GPU/CPU stats behind `?debug` / `?stats`. |
| `ogl` | 1.0.11 | evaluated, rejected (§3.2) |
| `@react-three/fiber` | 9.7.0 | evaluated, rejected (§3.2) |
| `troika-three-text` | 0.52.5 | optional SDF 3D text upgrade (§7.10); needs `.woff`/`.ttf`, not woff2 |
| `@fontsource-variable/fraunces`, `@fontsource-variable/geist`, `@fontsource-variable/geist-mono`, `@fontsource/instrument-serif`, `@fontsource-variable/newsreader`, `@fontsource/cormorant-garamond` | 5.3.0 | dev-only source of OFL woff2 files copied into `/public/fonts` (§10) |
| Runtime | Node 22.21.0 / npm 10.9.4 | Vite 8 floor is ≥ 20.19 / 22.12 — OK |

---

## 3. Stack decisions and justification

### 3.1 Vite + TypeScript, vanilla DOM

- Vite 8 dev server gives sub-100 ms HMR for `.glsl`, `.css` and `.ts`; `vite build` produces a fully static `dist/` for Vercel.
- **No React/Svelte/Vue.** The site is one document with ~13 absolutely-positioned chapter fragments and one canvas. A VDOM adds nothing and would fight the imperative, frame-driven timeline. Vanilla + typed interfaces is also the shape LLM agents produce most reliably.
- TypeScript `strict` with `noUncheckedIndexedAccess`; every cross-agent boundary (Stage, ChapterModule, World, Uniforms) is an exported interface in `src/core/types.ts`. Agents cannot break each other silently: `npm run check` is part of "done".
- Static HTML is composed at build time from per-chapter fragments by a tiny in-repo plugin (`tooling/vite-plugin-chapters.ts`, §4.3), so the shipped `index.html` contains **all copy** for crawlers and no-JS readers, while agents own separate files (no merge conflicts).

### 3.2 Three.js vs OGL vs React-Three-Fiber

| Criterion | Three.js 0.185 | OGL 1.0 | R3F 9.7 |
|---|---|---|---|
| Agent buildability (training-data breadth, examples, error messages) | ★★★★★ | ★★ | ★★★★ (but React mental model + hooks rules) |
| Features needed here: SVGLoader→ShapeGeometry, PMREM/RoomEnvironment for gold PBR, Points/LineSegments, `compileAsync`, AgX tone mapping | all built-in | must be hand-written (no loaders, no PBR env, no PMREM) | = three |
| Post-processing | `postprocessing` lib (merged passes, HalfFloat, SMAA) | roll your own | `@react-three/postprocessing` wrapper (+React) |
| Bundle (min+gz, tree-shaken) | ≈ 150–170 KB | ≈ 25 KB | three + React (~45 KB) + fiber (~30 KB) ≈ 240 KB |
| Fit with a scroll-driven master timeline | imperative — perfect | imperative — perfect | declarative; `useFrame` per component, state plumbing for a global timeline is awkward |
| Risk with parallel agents | low; one `Group` per chapter | medium; each agent re-implements helpers | medium; hook-order and re-render bugs |

**Decision: Three.js.** OGL's 130 KB saving (pear.no uses OGL because its GL is a single fullscreen quad) does not pay for the missing loaders/PBR/postprocessing on a project with ~13 scenes and 8 shaders. R3F's only advantage (component composition) is exactly what our Stage API already gives without React.

WebGPU/TSL is **out of scope**: `postprocessing` is WebGL-only, Safari WebGPU is still uneven across the iOS 16.4+ target, and GLSL is what agents write best. Use `WebGLRenderer` everywhere; no dual-path code.

### 3.3 Scroll: Lenis + ScrollTrigger vs custom lerped scroll

pear.no hand-rolls wheel/touchmove handlers + a rAF lerp. That is what Lenis *is*, hardened: it keeps the **native scrollbar, keyboard (PgDn/Space/arrows), find-in-page, anchors and iOS momentum**, exposes `scroll/progress/velocity/direction`, handles `touch-action`, resize, `prevent()` for scrollable overlays, and its official ScrollTrigger recipe is one `gsap.ticker` — so scroll, timeline and render share one frame callback.

Custom lerp is rejected: it re-implements Lenis with less a11y and more bugs (we saw pear.no's `.pin` needing `overflow:clip` hacks and duplicated `.stage` heights in their CSS).

**Smoothing happens once.** Lenis `lerp: 0.09` (desktop) provides the creaminess; ScrollTrigger uses `scrub: true` (not a number) so we never double-smooth. On touch, Lenis `syncTouch: false` (native touch scrolling; Lenis README warns iOS<16 instability with syncTouch) — ScrollTrigger reads the native position, still perfectly in sync.

`prefers-reduced-motion` → Lenis not instantiated at all; ScrollTrigger drives the same timeline from native scroll.

### 3.4 Pinned stage + single master timeline (the pear.no "film")

- **DOM:** `section.stage` with `height: calc(var(--stage-len) * 100vh)` (JS sets `--stage-len` = Σ chapter lengths + 1) containing `div.pin { position: sticky; top: 0; height: 100dvh; overflow: clip }`. Browser does the pinning natively; no pin-spacer, no transforms, no `will-change` on the whole page.
- **Master progress:** one `ScrollTrigger.create({ trigger: stage, start: 'top top', end: 'bottom bottom', scrub: true, animation: master })`. `master` is a paused `gsap.timeline()`; ScrollTrigger sets `master.progress()` every scroll update; **the timeline's duration equals the stage length in vh** (1 unit = 1 viewport of scroll) so positions are human-readable.
- **Chapters register** (§5): each contributes (a) a local GSAP timeline placed at its start offset (DOM tweens, world-parameter tweens, camera tweens — all reversible for free), and/or (b) a `progress(p)` callback for imperative work (uniforms, particle counts, shader modes). Both are driven by the same master progress → nothing can drift.
- Why ScrollTrigger at all if sticky does the pinning: labels (`master.addLabel('ogygia')`), `scrollTo` by label, `snap` opt-in per beat, `refresh()` on font load/resize, dev scrubbing UI, and every agent already knows the API.

### 3.5 Text splitting

**GSAP SplitText** (`type: 'lines,words'`, `mask: 'lines'`, `autoSplit: true`, `aria: 'auto'`): re-splits itself on font load/resize, wraps lines in overflow-clip masks for the classic rise-in, and puts an `aria-label` on the parent with `aria-hidden` children so screen readers read whole sentences. Split only after `document.fonts.ready` and only elements inside the currently mounted chapter (cost ~1 ms/heading). `split-type` would need our own resize/aria handling.

### 3.6 Post-processing

`postprocessing` (pmndrs) over `three/addons/postprocessing` because it **merges all effects into one fullscreen shader** (`EffectPass` sorts/merges; each `Effect` contributes a `mainImage()`), uses HalfFloat buffers by default, provides Bloom (mipmap blur, luminance threshold), ChromaticAberration, Noise, Vignette, SMAA, DepthOfField, and a documented custom-`Effect` class — exactly what our `TesseraeEffect` and `GoldSparkleEffect` need.

Pipeline (desktop): `RenderPass` → `EffectPass(SMAA, Bloom, Tesserae, ChromaticAberration, Noise, Vignette)` → screen. That is **2 fullscreen passes + bloom's half-res mip chain**; the budget in §8 allows one extra pass for chapter-specific transitions.

### 3.7 Everything else is deliberate omission

No Tailwind (pear.no's Tailwind is compiled away; our CSS is ~1,200 lines of custom properties and it must be readable by agents). No state library. No router (one page + hash anchors). No analytics by default (privacy; `@vercel/analytics` is a one-line opt-in once a consent banner exists). No Playwright in `package.json` (400 MB browser download on a full disk) — screenshot tooling is optional (§11.4).

---

## 4. Architecture

### 4.1 Runtime layers (z-order inside the pin)

```
html.mode-film
└─ body
   ├─ a.skip  → "Skip to content" / "Read as a page" (toggles mode-page)          z 100
   ├─ header.chrome (fixed)  logo mark · date pill · "REGISTER →" pill CTA      z 60
   ├─ aside.rail (fixed left) vertical hairline + chapter ticks + hamburger     z 60
   ├─ nav.overlay (fixed, hidden) 6 giant serif items + mono index labels       z 80
   ├─ div.preloader (fixed)                                                     z 90
   ├─ section.stage  (height = stage-len × 100vh)
   │   └─ div.pin (sticky, 100dvh, overflow:clip, bg --press)
   │       ├─ canvas.gl  (absolute inset 0, pointer-events none, aria-hidden)   z 0
   │       ├─ div.tint   (optional navy/cream tint, mix-blend, driven by CSS var) z 1
   │       ├─ article[data-chapter=…] × N  (absolute inset 0, inert when off)   z 10
   │       └─ svg.defs (filters: #ink feTurbulence, #tear, #tesserae-mask)       —
   └─ footer.page-only (visible only in mode-page)
```

Only one `<canvas>`, one renderer, one composer, one `requestAnimationFrame` (GSAP's ticker).

### 4.2 Folder structure

```
mtfwebsite/
├─ index.html                      # skeleton + <!-- @chapter:ID --> slots + meta/OG/JSON-LD
├─ vite.config.ts · tsconfig.json · vercel.json · .nvmrc · package.json
├─ public/
│  ├─ fonts/                       # self-hosted woff2 (§10)
│  ├─ og/og-default.png            # 1200×630
│  ├─ favicon.svg · icon-192.png · icon-512.png · site.webmanifest
│  ├─ robots.txt · sitemap.xml
│  └─ media/                       # OPTIONAL future generated imagery (webp/ktx2/mp4), per chapter
├─ tooling/
│  ├─ vite-plugin-chapters.ts      # inlines src/chapters/*/chapter.html into index.html at build/dev
│  ├─ fonts.mjs                    # copies + subsets woff2 from node_modules/@fontsource* → public/fonts
│  └─ og.mjs                       # (optional) renders OG image from the site
├─ src/
│  ├─ main.ts                      # boot: mode detect → preloader → Stage → reveal
│  ├─ styles/
│  │  ├─ tokens.css                # colours, type scale, easings, z-index, spacing
│  │  ├─ base.css                  # reset, fonts (@font-face), modes (.mode-film/.mode-page), a11y
│  │  ├─ chrome.css                # header, rail, nav overlay, preloader, CTA pill
│  │  └─ motion.css                # keyframes: draw, ruleH, ruleV, cross, rim, glow, shine, settle
│  ├─ core/
│  │  ├─ types.ts                  # ChapterModule, ChapterHandle, StageContext, WorldParams … (§5)
│  │  ├─ Stage.ts                  # stage height, master timeline, chapter activation, frame loop
│  │  ├─ Scroll.ts                 # Lenis + ScrollTrigger wiring, scrollToChapter, hash routing
│  │  ├─ Renderer.ts               # WebGLRenderer, composer, DPR governor, resize, context-loss
│  │  ├─ Uniforms.ts               # shared IUniform objects: uTime uScroll uMouse uResolution …
│  │  ├─ Camera.ts                 # PerspectiveCamera + tweenable rig + mouse parallax
│  │  ├─ Input.ts                  # pointer (lerped), visibility, reduced-motion, device tier
│  │  ├─ Preloader.ts              # phases, progress, minimum time, reveal handoff
│  │  ├─ Fonts.ts                  # fonts.ready + SplitText helpers (splitLines, revertAll)
│  │  ├─ Text.ts                   # CanvasTexture text factory for GL typography
│  │  ├─ Svg.ts                    # SVGLoader → flat ShapeGeometry meshes, palette mapping
│  │  ├─ Debug.ts                  # lil-gui + stats-gl + ?chapter=&p= harness
│  │  └─ Modes.ts                  # mode-film / mode-page switching, no-GL detection
│  ├─ world/                       # PERSISTENT scene (owned by core/integrator)
│  │  ├─ World.ts                  # sky, sun, sea, stars, fog — tweenable WorldParams → uniforms
│  │  ├─ Sky.ts · Sun.ts · Sea.ts · Stars.ts · Constellations.ts
│  │  └─ shaders/…                 # sky.glsl sun.glsl sea.vert/.frag stars.vert/.frag
│  ├─ post/
│  │  ├─ Composer.ts               # RenderPass + EffectPass assembly, quality tiers
│  │  ├─ TesseraeEffect.ts + tesserae.glsl
│  │  ├─ GoldSparkleEffect.ts + sparkle.glsl
│  │  └─ FilmEffect.ts + film.glsl (grain+vignette+CA in one, used when library effects are trimmed on mobile)
│  ├─ shaders/                     # SHARED chunk library, #include-able
│  │  ├─ noise/ (hash.glsl simplex3d.glsl fbm.glsl voronoi.glsl curl.glsl)
│  │  ├─ color/ (palette.glsl tonemap.glsl dither.glsl)
│  │  ├─ light/ (fresnel.glsl ggx.glsl sunglitter.glsl)
│  │  └─ util/ (remap.glsl sdf2d.glsl rotate.glsl)
│  ├─ chapters/
│  │  ├─ index.ts                  # ORDERED registry (append-only; integrator owns)
│  │  └─ 03-ogygia/                # one folder per chapter, one agent per folder
│  │     ├─ index.ts               # export default chapter: ChapterModule
│  │     ├─ chapter.html           # the DOM fragment (real text, headings, lists, links)
│  │     ├─ chapter.css            # scoped: every rule starts with [data-chapter="ogygia"]
│  │     ├─ timeline.ts            # buildTimeline(ctx, handle): gsap.core.Timeline (duration 1)
│  │     ├─ scene.ts               # buildScene(ctx): THREE.Group + materials + update()
│  │     ├─ shaders/*.glsl
│  │     ├─ art/*.svg              # flat folk-art silhouettes (inline or SVGLoader)
│  │     └─ README.md              # beats table: p-range → what happens; budget; status
│  └─ data/
│     ├─ event.json                # dates, venue, registration URLs (single source for DOM + JSON-LD)
│     ├─ programme.json            # 25/26/27 Nov items
│     ├─ thinktanks.json           # 11 for 11
│     └─ speakers.json             # MTF10 speakers/senators until MTF11 list arrives
└─ design/ · brief/                # docs (not shipped)
```

### 4.3 Build-time HTML composition (how agents own DOM without conflicts)

`tooling/vite-plugin-chapters.ts` (≈ 40 lines) implements `transformIndexHtml`: it reads `src/chapters/index.ts`'s order (or simply the numeric folder prefix), and replaces each `<!-- @chapter:ID -->` marker in `index.html` with `src/chapters/<folder>/chapter.html`, wrapped as

```html
<article class="chapter" id="ch-ID" data-chapter="ID" aria-labelledby="ch-ID-title">…</article>
```

Works in dev (HMR full-reload on fragment change) and build. Result: shipped `index.html` holds every word of copy; agents never edit `index.html`.

Data-driven lists (speakers, think tanks, programme) are rendered from `src/data/*.json` by the same plugin using `{{#each}}`-free plain template functions in `tooling/render/*.ts` — only for genuinely repetitive markup. Everything else is hand-written HTML.

### 4.4 Frame loop (single ticker, deterministic order)

```
gsap.ticker (rAF, lagSmoothing 0)
 ├─ 1. lenis.raf(t)                → lenis emits 'scroll' → ScrollTrigger.update()
 │                                   → master.progress(P)  → GSAP tweens write DOM + WorldParams + CameraRig
 ├─ 2. stage.tick(t, dt)  (dt clamped ≤ 1/30)
 │     ├─ input.update()            (mouse lerp, velocity)
 │     ├─ uniforms.write(t, P, mouse, res)
 │     ├─ stage.activate(P)         (enter/leave, inert, visible flags)
 │     ├─ for active chapters: h.progress(pLocal, info); h.update(t, dt)
 │     ├─ world.update(t, dt)       (WorldParams → uniforms, sun position, sea time)
 │     └─ camera.update(dt)         (rig + parallax + shake)
 └─ 3. renderer.frame()             composer.render(dt); DPR governor samples frame time
```

Nothing else may call `requestAnimationFrame`. Chapters that need per-frame work implement `update()`.

---

## 5. The Stage / Timeline API (the contract every chapter implements)

`src/core/types.ts` — authoritative; excerpted:

```ts
import type * as THREE from 'three';
import type gsap from 'gsap';

/** 1 unit of "length" = one viewport height of scroll. */
export interface ChapterModule {
  id: string;                 // 'ogygia' — matches data-chapter and folder suffix
  title: string;              // for nav overlay / rail ticks
  length: number;             // scroll length in vh units (e.g. 8)
  lead?: number;              // vh of overlap BEFORE start (default 0.5) — for crossfades
  tail?: number;              // vh of overlap AFTER end   (default 0.5)
  mobileLength?: number;      // optional shorter length on touch devices
  mount(ctx: StageContext): ChapterHandle | Promise<ChapterHandle>;
}

export interface ChapterHandle {
  el: HTMLElement;                       // the <article data-chapter> (already in DOM; Stage passes it via ctx)
  group?: THREE.Group;                   // added under scene.chapters; Stage toggles .visible
  timeline?: gsap.core.Timeline;         // LOCAL time 0..1 (duration exactly 1). Stage scales to (lead+length+tail)
  enter?(dir: 1 | -1): void;             // becomes active (window = [start-lead, end+tail])
  progress?(p: number, info: ProgressInfo): void;  // every frame while active; p can be <0 or >1 inside lead/tail
  update?(t: number, dt: number): void;  // every frame while active (idle motion; skipped in reduced-motion)
  leave?(dir: 1 | -1): void;
  resize?(v: Viewport): void;
  dispose?(): void;
}

export interface ProgressInfo {
  master: number;      // 0..1 global
  velocity: number;    // px/frame, signed
  direction: 1 | -1;
  active: boolean;     // inside [0,1] (not in lead/tail)
}

export interface StageContext {
  el: HTMLElement;               // this chapter's <article>
  scene: THREE.Scene;
  chaptersRoot: THREE.Group;     // put your group here (Stage does it if handle.group is returned)
  camera: CameraRig;             // tweenable {x,y,z,tx,ty,tz,fov,roll,shake}
  world: WorldParams;            // tweenable persistent world (§6.3)
  uniforms: SharedUniforms;      // uTime, uScroll, uMouse, uResolution, uDPR, uReduced, uTier
  post: PostParams;              // tweenable {tesserae, bloom, aberration, grain, vignette, tint}
  fonts: FontsApi;               // splitLines(el, opts), whenReady()
  text: TextApi;                 // canvasText({text, font, size, color}) → THREE.Texture / Mesh
  svg: SvgApi;                   // flatShapes(url|string, palette) → THREE.Group
  viewport: Viewport;            // {w,h,dpr,aspect,isTouch,isPortrait,tier}
  reducedMotion: boolean;
  tier: 'high' | 'mid' | 'low';  // §8.3
  gsap: typeof gsap;             // registered instance (ScrollTrigger, SplitText, DrawSVG)
  debug?: DebugApi;              // gui.folder(id) when ?debug
}
```

**Stage responsibilities** (`src/core/Stage.ts`):

1. Reads the ordered registry, computes `start_i`/`end_i` in vh, writes `--stage-len`, builds the master timeline: `master.add(handle.timeline.duration(lead+length+tail), start_i - lead)` and `master.addLabel(id, start_i)`.
2. Activation window per chapter = `[start-lead, end+tail]`. On entering the window: `el.inert=false; el.hidden=false; group.visible=true; enter(dir)`. On leaving: `leave(dir); inert=true; hidden=true; group.visible=false`. Hysteresis of 0.05 vh prevents flapping.
3. Calls `progress()` with `pLocal = (Pvh - start)/length` (may exceed [0,1] within lead/tail) every frame for active chapters.
4. Exposes `scrollToChapter(id, {offset?})`, `progressOf(id)`, `master`, `labels`.
5. Never touches chapter internals. Never lets a chapter throw the loop: `try/catch` per chapter with a one-time console error and the chapter disabled (`chapter.failed`).

**Rules for chapter timelines**

- Local timeline duration is exactly `1`; normalise: enter beat 0–0.15, hold 0.15–0.85, exit 0.85–1. If you set `lead`, your enter can start at negative local time — put it at absolute `0` of your timeline and set the timeline's `startAt` accordingly (helper `ctx.gsap.utils.mapRange`).
- Tween **only**: your own DOM, `ctx.world` params, `ctx.camera` rig, `ctx.post` params, your own uniform values (plain numbers wrapped in objects — tween `.value`).
- Use `ease: 'none'` for scrubbed tweens unless intentionally shaped; the scrub gives the easing.
- No `onUpdate` heavy work in tweens; use `progress()`.

**Minimal chapter**

```ts
// src/chapters/03-ogygia/index.ts
import type { ChapterModule } from '@core/types';
import { buildScene } from './scene';
import { buildTimeline } from './timeline';
import './chapter.css';

const chapter: ChapterModule = {
  id: 'ogygia', title: 'Ogygia', length: 8, lead: 0.5, tail: 0.5,
  async mount(ctx) {
    const scene = await buildScene(ctx);          // { group, update, setProgress, dispose }
    const timeline = buildTimeline(ctx, scene);   // DOM + world + camera tweens, duration 1
    return {
      el: ctx.el, group: scene.group, timeline,
      progress: (p) => scene.setProgress(p),
      update: (t, dt) => scene.update(t, dt),
      resize: (v) => scene.resize(v),
      dispose: () => scene.dispose(),
    };
  },
};
export default chapter;
```

**Registry** (`src/chapters/index.ts`) — append-only, one line per chapter, owned by the integrator:

```ts
export const chapters = [
  () => import('./00-prologue'),
  () => import('./01-helios'),
  () => import('./02-stars'),
  () => import('./03-ogygia'),
  // …
];
```

Dynamic imports keep each chapter its own chunk; the preloader imports all of them (a scroll film cannot lazy-load mid-scroll without hitches), so this is for build isolation, not for deferring.

---

## 6. WebGL scene graph

### 6.1 Renderer (`src/core/Renderer.ts`)

```ts
const renderer = new THREE.WebGLRenderer({
  canvas, antialias: false, stencil: false, depth: true, alpha: false,
  powerPreference: 'high-performance', preserveDrawingBuffer: false,
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.AgXToneMapping;   // filmic, handles the sun's HDR bloom gracefully
renderer.toneMappingExposure = 1.0;
renderer.setPixelRatio(governor.dpr);            // §8.2
renderer.setClearColor(0x0b0a09, 1);             // --press
```

Composer buffers: `HalfFloatType`, `multisampling: 0` (SMAA effect instead), `frameBufferType: HalfFloatType`. Depth texture enabled only if a chapter requests DoF (`ctx.post.dof`).

Context loss: `webglcontextlost` → `Modes.fallback('page')` (content stays readable) and a one-time attempt to restore after 2 s.

### 6.2 Scene layout

```
scene
├─ world (Group, persistent, owned by src/world)
│  ├─ sky      fullscreen backdrop quad at far plane (sky.glsl; gradients, dawn/dusk, nebula)
│  ├─ sun      billboard + fresnel sphere (sun.glsl; modes: sun | star | eclipse)
│  ├─ sea      displaced plane 160×160 (mid) / 96×96 (low) / 240×240 (high)
│  ├─ stars    Points (18k high / 10k mid / 5k low)
│  ├─ constellations LineSegments + aProgress draw attribute
│  └─ fog      scene.fog = FogExp2(--press, 0.045) modulated via world.fogDensity
├─ chapters (Group)
│  └─ <id> (Group per chapter; visible toggled by Stage)
└─ lights: one DirectionalLight (sun-locked), one HemisphereLight (sky/sea colours) — PBR meshes only;
           ShaderMaterials read light direction from uniforms.uSunDir
scene.environment = PMREMGenerator.fromScene(new RoomEnvironment(), 0.04).texture  // gold PBR, zero assets
```

Camera: one `PerspectiveCamera(fov 34, near 0.1, far 200)`, rig default `{x:0,y:0.4,z:7, tx:0,ty:0.2,tz:0}`; mouse parallax ±0.15 units, lerp 0.06; `shake` for thunder beat (Helios chapter).

### 6.3 Shared uniforms & tweenable params

`src/core/Uniforms.ts` exports **one object of `THREE.IUniform`s** that every material references by identity (`uniforms: { uTime: shared.uTime, … }`) so a single write per frame updates all shaders:

| Uniform | Type | Meaning |
|---|---|---|
| `uTime` | float | seconds since start (paused when tab hidden) |
| `uScroll` | float | master progress 0..1 |
| `uScrollVel` | float | signed, smoothed, px/frame |
| `uMouse` | vec2 | −1..1, lerped; (0,0) on touch |
| `uMouseVel` | vec2 | for ripple/heat effects |
| `uResolution` | vec2 | drawing-buffer pixels |
| `uDPR` | float | current governed DPR |
| `uAspect` | float | |
| `uReduced` | float | 1 when prefers-reduced-motion |
| `uTier` | float | 0 low / 1 mid / 2 high |
| `uSunDir` | vec3 | normalised world sun direction |
| `uSunColor` | vec3 | linear |
| `uPalette[6]` | vec3[] | sand, teal, terracotta, gold, flame, navy — from tokens |

`WorldParams` (plain object, tweenable by chapter timelines; `World.update()` copies into uniforms each frame):

```ts
interface WorldParams {
  sun:  { elevation: number; azimuth: number; intensity: number; size: number; mode: number /*0 sun,1 star,2 eclipse*/; warmth: number };
  sky:  { dawn: number; dusk: number; night: number; nebula: number; haze: number };
  sea:  { amplitude: number; choppiness: number; speed: number; glitter: number; tint: number; opacity: number; level: number };
  stars:{ opacity: number; twinkle: number; density: number; drift: number; constellation: number /*0 none,1 Orion,2 Bear,3 guide*/; draw: number };
  fogDensity: number; exposure: number;
}
```

`PostParams`: `{ tesserae: {amount, cell, grout, gold, seed}, bloom: {intensity, threshold}, aberration, grain, vignette, tint: {r,g,b,a} }`.

### 6.4 Materials & geometry conventions

- Prefer `ShaderMaterial`/`RawShaderMaterial` with `#include` chunks; GLSL 3 (`glslVersion: THREE.GLSL3`).
- PBR only for gold/limestone hero objects: `MeshPhysicalMaterial` (`metalness 1, roughness 0.28, clearcoat 0.3`) with procedural normal map (`Text.ts`/`Svg.ts` can bake noise into a `DataTexture` 512²).
- Flat folk-art figures: `SVGLoader` → `ShapeGeometry` → `MeshBasicMaterial({color, side: DoubleSide})`, merged with `BufferGeometryUtils.mergeGeometries` per colour (one draw call per colour). Position in z for parallax layers (−2, 0, +1.5).
- Naming: uniforms `u*`, attributes `a*`, varyings `v*`, defines `MTF_*`. Every `.glsl` starts with a header comment: purpose · inputs · cost.
- No per-frame allocations (`new Vector3` in `update` is a review fail). Static meshes `matrixAutoUpdate = false`.
- `dispose()` must dispose geometries, materials, textures, render targets you created. Stage calls it only on hot-reload/harness; still mandatory.

---

## 7. Shader list

Each entry: purpose · technique · key uniforms · cost tier · used by · mobile/low variant.

### 7.1 `sun.glsl` — Helios' sun / the guiding star
- Billboard quad (always faces camera) + optional sphere core. Fragment: radial disc with limb darkening, corona = `fbm(polar(uv)*vec2(6,1) + uTime*0.05)` streaks, chromosphere flicker, halo falloff `pow(1-d, 3)`, HDR values > 1.0 so Bloom blooms it. **Modes:** `uMode` 0 sun (large, warm), 1 star (small core, 4/6-point diffraction spikes = anisotropic gaussians, twinkle `sin(uTime*7+seed)`), 2 eclipse (dark disc, rim only — Zeus' thunder beat). Morph is continuous (`uMode` is float) so "the star descends and becomes Calypso" is one tween.
- Uniforms: `uMode, uSize, uIntensity, uWarmth, uSunColor`. Cost: trivial. Mobile: same (drop 2 fbm octaves).

### 7.2 `sea.vert` / `sea.frag` — the Mediterranean
- Vertex: 4 Gerstner waves (dir/amp/len/speed arrays) + 2-octave simplex for detail; height also written to varying for foam. Fragment: normal from analytic Gerstner derivatives (no dFdx noise), fresnel (Schlick, F0 0.02), sky reflection from `sky.glsl` sampled by reflected direction (function call, not a texture), **sun glitter** = Blinn-Phong with exponent 400 × jittered micro-normals (`hash` per texel, `uGlitter`), horizon fade to fog, tint toward teal palette at `uTint`, `uLevel` raises/lowers the sea for "the wreck", "the raft", "sunrise".
- Uniforms: `uAmplitude, uChoppiness, uSpeed, uGlitter, uTint, uOpacity, uLevel, uSunDir`. Cost: vertex-bound (grid), fragment mid. Mobile: 96² grid, 3 waves, no micro-normals.

### 7.3 `tesserae.glsl` — the MOSAIC post-process (signature)
- Custom `postprocessing.Effect`. Cells: jittered-grid Voronoi (`floor(uv*cell) + hash offset`, 3×3 neighbour search = 9 taps) → irregular Byzantine tesserae; optional hex mode (`uShape`). Each cell samples the *input image* at its centre (one `texture(inputBuffer, cellCenter)`) → flat colour tile; grout = distance to cell edge < `uGrout` → dark press colour; per-cell random **tilt** perturbs a fake normal → specular glint from `uSunDir` (`uGold` mixes in gold-leaf tiles by luminance threshold); per-cell slight hue jitter for hand-set feel; `uAmount` blends original ↔ mosaic **per cell with a stagger** (`step(hash(cell), uAmount)`) so images dissolve tile by tile rather than fade — the transition device for chapter handovers and the preloader exit.
- Uniforms: `uAmount, uCell (px, DPR-aware), uGrout, uGold, uSeed, uShape, uStagger, uSunDir`. Cost: 9 hash + ≤ 2 texture taps per fragment — cheap. Mobile: enabled (it is the brand), cell size ×1.5.
- DOM twin: an SVG `<pattern>` of the same jittered cells used as `mask-image` on text blocks (`.tess-out` class, `--go` custom property like pear.no's pixel-dissolve `.out`), so DOM copy can dissolve in sympathy with the GL.

### 7.4 `stars.vert` / `stars.frag` — starfield & constellations
- `Points` with `aSeed, aSize, aTemp` attributes; vertex: `gl_PointSize = aSize * uDPR * (twinkle) / -mvPosition.z`, slow `uDrift` rotation of the whole dome; fragment: soft disc `smoothstep(0.5, 0.0, d)` + tiny cross for the brightest 2 %, colour from temperature ramp (blue-white → warm). `uOpacity`, `uTwinkle`, `uDensity` (discard by `aSeed > uDensity`).
- Constellations (`Constellations.ts`): `LineSegments` for Orion, Ursa Major and a custom "Calypso's star" asterism; `aProgress` per vertex 0..1 along the polyline, fragment `discard` where `aProgress > uDraw` → lines **draw in** with scroll; additive blend, gold at 40 % alpha.
- Cost: low. Mobile: 5k points, constellations kept.

### 7.5 `veil.vert` / `veil.frag` — Calypso's veil (kalyptein: to conceal)
- Plane 64×96, vertex displacement = flag wave (`sin(x*3 - t*2)*0.15*x`) + curl-noise wind (`uWind`) + drape gravity term; double-sided; fragment: sheer cloth = fresnel-driven alpha (0.15–0.6), thin-film iridescence via cosine palette on `NdotV` (`uIridescence`), weave = high-frequency 2-axis sine grid modulating alpha 5 %. **Tear:** `uTear` 0→1 thresholds an fbm mask (`discard` when `fbm(uv*4+seed) < uTear`) with a burnt-gold edge band 0.03 wide → "the veil tears" (Canto VI).
- Uniforms: `uWind, uTear, uIridescence, uOpacity, uColor`. Cost: low-mid. Mobile: 32×48 grid.

### 7.6 `goldleaf` (material + `sparkle.glsl` post)
- Material: `MeshPhysicalMaterial` gold (`#d9a441` base, `metalness 1`, `roughness 0.25`), `onBeforeCompile` injects hammered-leaf normal perturbation (`fbm` 2 octaves, scale 40) and anisotropic roughness streaks. Env = RoomEnvironment PMREM (no HDR file).
- `GoldSparkleEffect` (post, merged into the EffectPass): screen-space hashed sparkles on pixels above luminance 0.85 with `uSparkle` density, cell 3 px, flicker `step(0.996, hash(cell, floor(uTime*8)))` → gold glint on tesserae highlights, the SUN wordmark, the olive leaves. Cost: trivial.

### 7.7 Film stack (grain · vignette · chromatic aberration)
- Desktop: library `NoiseEffect` (premultiply, opacity 0.06, luminance-weighted via custom `FilmEffect` instead when we want luma weighting), `VignetteEffect` (offset 0.35, darkness 0.55), `ChromaticAberrationEffect` (radial, `uAberration` 0..0.004, driven by scroll velocity and thunder beats). Mobile: single custom `film.glsl` doing grain+vignette only.
- Grain must be **animated** (hash with `floor(uTime*24)` — 24 fps like film) and never above 0.08 on cream backgrounds.

### 7.8 `sky.glsl` — backdrop
- Fullscreen far quad: 3-stop vertical gradient (zenith/horizon/ground) blended across `dawn/dusk/night` params, sun-side warm scatter `pow(max(dot(dir, uSunDir),0), 8)`, `uNebula` faint fbm colour clouds for the "sky full of stars" night, `uHaze` horizon milkiness. Also exposed as a GLSL function `skyColor(dir)` for the sea reflection. Cost: trivial.

### 7.9 Chapter-local shaders (owned by chapter agents, built from the chunk library)
- `net.glsl` — the net: grid LineSegments with catenary sag, `uCut` progress along a seam that separates and falls (Canto VII). 
- `raft.glsl` — driftwood planks (flat folk-art shapes) bobbing with the sea height function (shared `seaHeight()` chunk so objects sit on waves).
- `limestone.glsl` — honey Globigerina limestone: warm base, 3-octave fbm pores, subtle horizontal strata; used for Ogygia cliffs/Calypso's cave silhouettes.
- `olive.glsl` — leaf instancing (InstancedMesh, silver underside via `gl_FrontFacing`), one leaf falls in the Conclusion.
- `hand.glsl` — the open hand: SVG silhouette → ShapeGeometry with `uOpen` morph between closed/open paths (two SVGs, same point count; morph in vertex via `aTarget`).

### 7.10 Typography in GL
- Default: **`Text.ts` CanvasTexture** — draws text with the loaded webfont on an offscreen 2D canvas at DPR×1 (max 2048 px wide), uploads as `CanvasTexture` (SRGB, anisotropy 4), renders on a plane with alpha; supports letterspacing, fill gold gradient, and feeding the tesserae/veil shaders as a mask. Zero dependencies, crisp for hero words ("SUN", "OGYGIA", "I LIVED").
- Upgrade (optional, per chapter): `troika-three-text` 0.52.5 SDF text for true 3D placement and resolution independence; requires a `.woff`/`.ttf` copy of the display font in `/public/fonts/gl/` (troika does not read woff2), lazy-loaded.

---

## 8. Performance budget

### 8.1 Targets

| Device | Target | Hard floor | DPR cap | Tier |
|---|---|---|---|---|
| M1 MacBook Air, Safari/Chrome, 1440×900 | **60 fps** sustained while scrolling | 50 fps | 1.75 | high |
| Windows laptop iGPU (Iris Xe) | 60 fps | 40 fps | 1.5 | mid |
| iPhone 13–15, Safari | **30 fps** (60 preferred) | 30 fps | 1.25 | mid |
| Android mid-range (Adreno 6xx) | 30 fps | 24 fps | 1.0 | low |

Frame budget at 60 fps = 16.6 ms: JS (Lenis+ST+GSAP+Stage) ≤ 3 ms · scene render ≤ 6 ms · post ≤ 4 ms · headroom 3 ms.

### 8.2 Governor (`Renderer.ts`)
- Start DPR = `min(devicePixelRatio, cap)`. Sample frame time over rolling 60 frames while scrolling; if p75 > 20 ms for 2 consecutive windows → step DPR −0.25 (floor 1.0), then disable Bloom mip levels (5→3), then sea grid −1 tier, then drop SMAA. If p75 < 12 ms for 5 s → step back up (max 1 step per 5 s). Persist tier in `sessionStorage` so reloads don't re-probe.
- Static-scene optimisation: when `|velocity| < 0.05` for 500 ms and no chapter `update()` is running (reduced-motion) → render at 30 fps (skip every other frame) — saves battery on the many "hold" beats.

### 8.3 Static budgets (checked in review)

| Budget | Global | Per chapter |
|---|---|---|
| Draw calls | ≤ 60 | ≤ 10 |
| Triangles | ≤ 450 k | ≤ 80 k |
| ShaderMaterials compiled | ≤ 40 | ≤ 4 |
| Fullscreen passes | ≤ 3 (Render, EffectPass, optional transition) | +0 (use `ctx.post`) |
| Textures resident | ≤ 24 MB | ≤ 4 MB (procedural DataTextures count) |
| JS initial (min+gz) | ≤ 330 KB total (three ~160 · postprocessing ~55 · gsap+ST+SplitText ~50 · lenis ~6 · app+chapters ~60) | ≤ 8 KB per chapter chunk |
| CSS | ≤ 40 KB gz | ≤ 3 KB |
| Fonts | ≤ 220 KB (3 variable woff2, subset) | — |
| DOM nodes inside pin | ≤ 2,500 | ≤ 250 (SplitText chars count!) — split words/lines, chars only for ≤ 40-char titles |

`Debug.ts` prints `renderer.info` and per-chapter budgets in the `?debug` panel; exceeding is a review fail.

### 8.4 Mobile strategy
- Same film architecture (sticky pin works on iOS ≥ 16.4; use `100dvh` and `ScrollTrigger.config({ ignoreMobileResize: true })` so the address-bar resize doesn't trigger refresh storms).
- Portrait layout per chapter via `chapter.css` `@media (max-aspect-ratio: 4/5)`; `mobileLength` can shorten beats.
- Tier `low/mid`: sea 96², stars 5k, tesserae cell ×1.5, no ChromaticAberration/SMAA, Bloom `resolutionScale 0.25`, `uMouse` = 0.
- Touch: Lenis `syncTouch: false`; `touch-action: pan-y` on the stage; no hover-only affordances.

### 8.5 Reduced motion (`prefers-reduced-motion: reduce`)
- No Lenis; native scroll drives the master timeline (scrubbed = user-controlled, allowed).
- `update()` idle loops are not called; `uReduced=1` freezes twinkle, sea speed → 0.15, grain static, no camera shake/parallax, tesserae dissolve becomes a 200 ms cross-fade, SplitText reveals become opacity-only.
- A visible "Motion: reduced / full" toggle in the rail (persisted in `localStorage`) lets users override either way.

### 8.6 `mode-page` fallback (no JS / no WebGL / reader / print)
- `index.html` ships with `<html class="mode-page">`; `main.ts` upgrades to `mode-film` only after WebGL2 creates successfully and the stage mounts. In `mode-page`: `.stage{height:auto}`, `.pin{position:static;height:auto}`, chapters are static stacked sections with full copy, CSS-gradient sky + inline SVG art, canvas hidden. This is what crawlers, screen-reader users pressing "Read as a page", and printers get.

---

## 9. Loading & preloader

### 9.1 Phases
| # | What | Gate | Visual |
|---|---|---|---|
| 0 | Inline critical CSS (tokens, base, preloader) in `<head>`; `<link rel=preload as=font>` ×2 | HTML parsed | Instant: press-black, mono label `MEDITERRANEAN TOURISM FORUM · XI`, hairline rule drawing (CSS `draw`), a 1-px sun disc |
| 1 | `main.ts` boot: mode detection, Lenis stopped, `html.is-loading` | — | Counter `00 → 100` in mono (like pear.no meta labels) |
| 2 | Parallel: `document.fonts.ready` · dynamic-import all chapters · build world · `renderer.compileAsync(scene, camera)` (parallel shader compile) · procedural textures + PMREM · first offscreen frame | all resolved, min 900 ms elapsed, max 6 s | disc grows to the Helios sun, gold rim rotating (`cfRim`), counter ticks with real progress (weights: fonts 15 · code 25 · compile 40 · first frame 20) |
| 3 | `stage.mountAll()` → `ScrollTrigger.refresh()` → apply `location.hash` (scrollToChapter, instant) → `lenis.start()` | — | — |
| 4 | Reveal: `post.tesserae.amount` 1 → 0 over 1.4 s (the mosaic re-forms into the hero), preloader DOM tesserae-dissolves (`.tess-out`), `html.is-loading` removed | — | the first "wow" |

Timeouts: if compile or fonts exceed 6 s, reveal anyway (fonts swap; shaders compile lazily on first use with a 1-frame hitch accepted).

### 9.2 What is *not* loaded
No images, no videos, no HDRs, no 3D model files at launch. Total transfer target ≤ 600 KB gz including fonts.

### 9.3 Chapter mount order
All chapters mount before reveal (a scroll film cannot mount mid-scroll without hitching), but `mount()` may return quickly and defer heavy geometry to `enter()` on first activation if its build cost > 8 ms — document it in the chapter README.

### 9.4 Optional generated media layer (later)
`ctx.assets.image(url)` / `.video(url)` helpers load `.webp`/`.ktx2` (`KTX2Loader` + basis transcoder from `/public/basis/`) or muted `.mp4`/`.webm` as `VideoTexture` **only when the chapter's window is within ±2 vh**, with a procedural placeholder until then. Client-provided generation credits produce assets into `/public/media/<chapter>/`; no code architecture changes.

---

## 10. Fonts

**Pipeline (fixed):** dev-dependency fontsource packages → `node tooling/fonts.mjs` copies the required `*-latin-*` and `*-latin-ext-*` woff2 files into `/public/fonts/` (latin-ext is mandatory: Maltese Ċ Ġ Ħ Ż, and Turkish/Croatian/French speaker names) → `@font-face` in `base.css` with `font-display: block` for the display face (avoid layout shift before SplitText) and `swap` for sans/mono → `<link rel="preload" as="font" type="font/woff2" crossorigin>` for display + sans → `Fonts.whenReady()` (= `document.fonts.ready` + `fonts.load('300 1em Display')`) gates SplitText and the preloader.

**Provisional faces** (final choice belongs to the typography spec; the pipeline is identical for any of the candidates in §2):

| Role | Face | Why |
|---|---|---|
| Display serif | **Fraunces** (variable: wght 100–900, opsz 9–144, SOFT, WONK) | one file covers hairline 300 display at opsz 144 (sharp, high-contrast, Flecha-adjacent) *and* sturdy small captions; SOFT/WONK axes give the "modern art" expressive titles the client asked for; true italics for Homer's lines |
| Alternate display | Instrument Serif (400 + italic) or Newsreader (opsz variable, 200–800) | closer to pear.no's Flecha austerity; A/B in design |
| Body sans | **Geist** (variable) | GT Standard analogue; excellent at 13–16 px on dark |
| Labels / eyebrows | **Geist Mono** (variable) | 9–12 px uppercase, `letter-spacing: .18–.24em`, translucent chips |

`font-feature-settings: "ss01", "liga"`; `font-optical-sizing: auto`; `text-rendering: geometricPrecision` on display only. Tabular figures (`tnum`) for counters, dates and stats.

---

## 11. Developer experience & parallel-agent workflow

### 11.1 Harness (`?chapter=ID&p=0.35&debug&stats`)
- `?chapter=ogygia` scrolls to the chapter start after preload and lets the harness slider lock master progress; `?p=` sets local progress directly (Stage sets `master.progress`, ScrollTrigger disabled while locked).
- `?debug` opens lil-gui with folders: Renderer (DPR, tier), World params, Post params, Camera rig, and each mounted chapter's `ctx.debug.folder(id)`; `?stats` shows stats-gl (CPU/GPU ms).
- `?mode=page` forces the fallback; `?reduced=1` forces reduced motion; `?tier=low` forces the mobile GL tier on desktop.
- Hot reload: chapter modules export `dispose()`; `import.meta.hot.accept` in `Stage.ts` remounts a single chapter without reloading the page.

### 11.2 Ownership & conventions
- One agent per `src/chapters/<NN>-<id>/`. Touch nothing outside your folder except **appending** your line to `src/chapters/index.ts` and adding your `<!-- @chapter:ID -->` slot line to `index.html` (both append-only, ordered by NN; the integrator resolves order).
- `src/core`, `src/world`, `src/post`, `src/shaders`, `src/styles` are owned by the core/integration agent. Need a change there? Open `design/research/core-requests.md` with a dated entry; do not patch.
- CSS: every selector in `chapter.css` begins with `[data-chapter="ID"]`; use tokens only (`var(--press)`, `var(--gold)`, `var(--ease-press)`); no global keyframes (name them `ID-…`).
- Shaders: import chunks with `#include "/src/shaders/noise/fbm.glsl"` (absolute from root); never copy chunk code.
- No import-time side effects (no DOM queries, no GL) — everything happens in `mount()`.
- Copy lives in `chapter.html` (single source); the timeline animates it, never re-creates it. Eyebrow labels in mono caps; one idea per line (pear.no voice).
- README per chapter with a beats table (`p 0.00–0.15 enter: …`), the draw-call/triangle count from `?debug`, known issues, and status.

### 11.3 Definition of done (per chapter)
1. Runs standalone via `?chapter=ID`, forward *and* backward scrub with no popping.
2. Meets §8.3 budgets (`?debug` numbers in README); 60 fps on M1 in Chrome and Safari; tested at 1440×900, 1920×1080, 390×844 portrait.
3. `npm run check` (tsc) and `npm run build` pass; no console errors/warnings.
4. Works in `?reduced=1`, `?tier=low` and `?mode=page`.
5. Keyboard: every link/button reachable when active; nothing focusable when inactive (Stage sets `inert`, but your own overlays must respect it).
6. Copy matches the brief verbatim where the brief is authoritative (dates, names, taglines).

### 11.4 Optional tooling
Playwright screenshot script (`tooling/snap.mjs`) at `p` steps per chapter for visual review — optional, not in `package.json` until disk space allows.

---

## 12. Install, package.json, configs

### 12.1 Exact install (after freeing disk space; from `/Users/kusha1/Documents/mtfwebsite`)

```bash
npm init -y >/dev/null && \
npm install three@0.185.1 gsap@3.15.0 lenis@1.3.26 postprocessing@6.39.4 && \
npm install -D vite@8.2.2 typescript@7.0.2 @types/three@0.185.4 vite-plugin-glsl@1.6.1 lil-gui@0.21.0 stats-gl@4.2.3 \
  @fontsource-variable/fraunces@5.3.0 @fontsource-variable/geist@5.3.0 @fontsource-variable/geist-mono@5.3.0 @fontsource/instrument-serif@5.3.0
```

(`three` and `postprocessing` are pinned exact because of the peer range; `typescript` exact because 7.x is new — fall back with `npm i -D typescript@~5.9.0` if needed.)

### 12.2 `package.json` (draft)

```json
{
  "name": "mtf-global-2026",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "engines": { "node": ">=22.12" },
  "scripts": {
    "dev": "vite --host",
    "build": "npm run check && vite build",
    "preview": "vite preview --host",
    "check": "tsc --noEmit -p tsconfig.json",
    "fonts": "node tooling/fonts.mjs",
    "og": "node tooling/og.mjs",
    "analyze": "vite build --mode analyze"
  },
  "dependencies": {
    "gsap": "3.15.0",
    "lenis": "1.3.26",
    "postprocessing": "6.39.4",
    "three": "0.185.1"
  },
  "devDependencies": {
    "@fontsource-variable/fraunces": "5.3.0",
    "@fontsource-variable/geist": "5.3.0",
    "@fontsource-variable/geist-mono": "5.3.0",
    "@fontsource/instrument-serif": "5.3.0",
    "@types/three": "0.185.4",
    "lil-gui": "0.21.0",
    "stats-gl": "4.2.3",
    "typescript": "7.0.2",
    "vite": "8.2.2",
    "vite-plugin-glsl": "1.6.1"
  }
}
```

### 12.3 `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import { fileURLToPath } from 'node:url';
import chapters from './tooling/vite-plugin-chapters';

export default defineConfig({
  plugins: [
    glsl({ include: ['**/*.glsl', '**/*.vert', '**/*.frag'], minify: true, watch: true }),
    chapters({ dir: 'src/chapters', html: 'chapter.html' }),
  ],
  resolve: {
    alias: {
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@world': fileURLToPath(new URL('./src/world', import.meta.url)),
      '@post': fileURLToPath(new URL('./src/post', import.meta.url)),
      '@shaders': fileURLToPath(new URL('./src/shaders', import.meta.url)),
      '@data': fileURLToPath(new URL('./src/data', import.meta.url)),
    },
  },
  build: {
    target: ['chrome111', 'firefox114', 'safari16.4'],
    sourcemap: false,
    assetsInlineLimit: 0,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\\/]three/ },
            { name: 'post', test: /node_modules[\\/]postprocessing/ },
            { name: 'gsap', test: /node_modules[\\/](gsap|lenis)/ },
          ],
        },
      },
    },
  },
  server: { port: 5173 },
});
```

If `vite-plugin-glsl` misbehaves under Rolldown (watch for missing `moduleType`), swap to `import src from './x.glsl?raw'` and `resolveIncludes(src)` from `@shaders/include.ts` — the chapter code does not change.

### 12.4 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "ESNext", "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true, "noUncheckedIndexedAccess": true, "noImplicitOverride": true,
    "noEmit": true, "skipLibCheck": true, "isolatedModules": true, "verbatimModuleSyntax": true,
    "types": ["vite/client", "vite-plugin-glsl/ext"],
    "baseUrl": ".", "paths": {
      "@core/*": ["src/core/*"], "@world/*": ["src/world/*"], "@post/*": ["src/post/*"],
      "@shaders/*": ["src/shaders/*"], "@data/*": ["src/data/*"]
    }
  },
  "include": ["src", "tooling", "vite.config.ts"]
}
```

### 12.5 `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/fonts/(.*)",  "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/(.*)", "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
    ] }
  ]
}
```

Static only: no functions, no ISR. Preview deployments per branch; production on `main`. `.nvmrc` = `22`.

### 12.6 `index.html` skeleton (head excerpt — the SEO contract)

```html
<!doctype html>
<html lang="en" class="mode-page">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Mediterranean Tourism Forum 2026 — Mediterranean SUN · 25–27 November, Malta</title>
  <meta name="description" content="The 11th Mediterranean Tourism Forum. Three days, one Mediterranean conversation: Stewardship, Unity, Net Positive. 25–27 November 2026, Malta.">
  <link rel="canonical" href="https://mtf.global/">
  <meta name="theme-color" content="#0b0a09">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Mediterranean Tourism Forum">
  <meta property="og:title" content="Mediterranean SUN — MTF 2026, 25–27 November, Malta">
  <meta property="og:description" content="Stewardship · Unity · Net Positive. The 11th edition of the Mediterranean Tourism Forum.">
  <meta property="og:image" content="https://mtf.global/og/og-default.png">
  <meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
  <meta property="og:url" content="https://mtf.global/">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preload" href="/fonts/fraunces-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/geist-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <style>/* critical: tokens + base + preloader + mode-page layout (≤ 6 KB) */</style>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Mediterranean Tourism Forum 2026 — Mediterranean SUN",
    "description": "11th edition. Stewardship, Unity, Net Positive.",
    "startDate": "2026-11-25",
    "endDate": "2026-11-27",
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": { "@type": "Place", "name": "Malta", "address": { "@type": "PostalAddress", "addressLocality": "Malta", "addressCountry": "MT" } },
    "image": ["https://mtf.global/og/og-default.png"],
    "organizer": { "@type": "Organization", "name": "Mediterranean Tourism Foundation", "url": "https://mtf.global/" },
    "offers": { "@type": "Offer", "url": "https://mtf.global/#register", "availability": "https://schema.org/InStock" },
    "subEvent": [
      { "@type": "Event", "name": "Knowledge & Policy Forum · Mediterranean Tourism Awards", "startDate": "2026-11-25", "endDate": "2026-11-25" },
      { "@type": "Event", "name": "11 for 11 Think Tanks · Skills Competitions · Calypso's Odyssey Gala", "startDate": "2026-11-26", "endDate": "2026-11-26" },
      { "@type": "Event", "name": "International Plenary · Beautiful Destinations · MED READY · AI-Powered Hospitality · The Coffee Experience", "startDate": "2026-11-27", "endDate": "2026-11-27" }
    ]
  }
  </script>
</head>
```

Venue name and street address are **TBC** (MTF10 was Hilton Malta — do not assume). `src/data/event.json` is the single source for dates/venue/URLs and is injected into both the DOM and the JSON-LD by the chapters plugin, so a venue change is one edit. Add `Organization` (+ `sameAs` socials from brief 04) and `WebSite` JSON-LD blocks. `robots.txt` allows all; `sitemap.xml` lists `/` only.

---

## 13. Accessibility contract

- **Content:** every word is real DOM text in narrative order; headings `h1` (hero) → `h2` per chapter → `h3` items; lists are `<ul>/<ol>`; the programme is a `<table>` or `<dl>`; speakers are `<ul>` of `<li>` with `<h3>`.
- **Two modes, one DOM:** `mode-film` (default when capable) — inactive chapters are `inert` + `hidden`, so Tab order and AT only see the active chapter; `mode-page` — everything static, nothing hidden. The first focusable element is a skip link **"Read as a page"** that switches modes (persisted), plus "Skip to registration".
- **Keyboard:** native scroll keys work (Lenis leaves keyboard to the browser); rail ticks and nav overlay are `<button>`/`<a>` with visible 1 px gold focus ring (`outline-offset: 4px`); nav overlay is a `<dialog>` (native focus trap, `Esc`); CTA pill is an `<a>`.
- **Anchors/deep links:** `a[href^="#ch-"]` intercepted → `stage.scrollToChapter(id)` (chapters are absolutely positioned so native anchor jumps would not work); `location.hash` honoured after preload; `history.replaceState` updates hash on chapter change (throttled) so URLs are shareable.
- **Motion:** §8.5; the preloader respects reduced motion (static counter).
- **Canvas:** `aria-hidden="true"`, `role="presentation"`; decorative SVGs `aria-hidden`; meaningful art (the open hand, the star) gets `<title>`.
- **Colour:** cream `#fffaea` on press `#0b0a09` ≈ 18:1; gold `#d9a441` on press ≈ 8.6:1; mono chips at ≥ 4.5:1; never rely on colour alone (ticks also change length, like pear.no's `.on i{width:22px}`).
- **Text:** SplitText `aria: 'auto'`; no text in images; `lang="en"`; `font-size` never below 12.8 px (pear.no floor); zoom to 200 % works because chapter layouts use `clamp()` and `max-width: 44ch`.
- **Preloader:** `role="progressbar" aria-valuenow`; `aria-live="polite"` announcing "Loaded".

---

## 14. Provisional chapter map (sizing the stage — narrative director owns the final)

| NN | id | Story beat (Calypso's Odyssey) | Content beat (MTF11 deck) | length (vh) | World / post state |
|---|---|---|---|---|---|
| 00 | prologue | Darkness. The Mediterranean. | Hero: "Mediterranean SUN", 25–27 Nov 2026, Malta, XI, REGISTER | 5 | sun mode 0 rising, sea calm, tesserae 1→0 (preloader exit) |
| 01 | helios | The Last Ship — Helios' cattle, thunder, the wreck | Why now? Forces reshaping tourism; "the question is no longer how many…" | 6 | sun huge → eclipse flash, camera shake, sea amplitude ↑, CA spike |
| 02 | stars | A sky full of stars; one star grows brighter and descends | Who is MTF: think · learn · act together; 1,600+ / 60-40 / 31+ countries | 6 | night, stars 1, constellations draw, sun mode 1 (star) descending |
| 03 | ogygia | The star touches earth: Calypso, Ogygia = Gozo, honey limestone, Ramla | Why Mediterranean SUN; the three questions | 8 | dawn, limestone silhouettes (SVG), sea glitter, gold sparkle |
| 04 | stewardship | The veil — kalyptein, to protect/conceal | S · Stewardship: protect what makes the Mediterranean special | 5 | veil shader, teal tint, sea tint |
| 05 | unity | The net as connection; constellation lines between ports | U · Unity: air / sea / digital / people; connect the Mediterranean | 5 | constellation 3 (Mediterranean map asterism from the MTF logo outline), lines draw |
| 06 | net-positive | The open hand; leave more than we take | N · Net Positive: hospitality culture, AI as enabler | 5 | hand morph `uOpen`, gold, sunrise warmth |
| 07 | three-days | Seven years → seasons (time passes) | Three days, one ecosystem: 25 · 26 · 27 Nov programme | 8 | sunrise→sunset cycles per day, sea level, sky dawn/dusk |
| 08 | eleven | Tesserae: 11 tiles | 11 for 11 — MTF Brain Think Tanks | 7 | tesserae post at 0.6, 11 gold tiles in a mosaic grid (DOM + GL) |
| 09 | four-events | Four stars of the morning | Beautiful Destinations · MED READY · AI-Powered Hospitality · Coffee (Lavazza) | 7 | four sun modes / four palettes; MED READY = eclipse-to-readiness beat |
| 10 | gala | The show itself: the star, the veil tears, the net cut, the open hand, "I lived" | Calypso's Odyssey Gala, 26 Nov — nine songs, the storyteller | 6 | full stack: veil tear, net cut, star returns, stars multiply |
| 11 | people | Homer: "I was telling you your story" | Foundation, speakers/senators, partners, stats | 5 | calm night, stars drift, grain |
| 12 | horizon | Sunrise. Calypso walks back toward her island | Register · Hotels · Contact · socials · footer frame (4 hairlines) | 5 | sunrise spreads, sea gold glitter max, sun mode 0 |
| | | | **Total** | **78 vh** (+1 for the sticky release) | ≈ 70,000 px at 900 px viewport — same order as pear.no's 73 vh |

---

## 15. Risks & open questions

| # | Risk / question | Mitigation / owner |
|---|---|---|
| 1 | **Disk full (136 MB free)** — install will fail | Free ≥ 2 GB (empty `~/.npm/_cacache`, Xcode/iOS simulator caches, Trash). Blocking. |
| 2 | Vite 8 + `vite-plugin-glsl` under Rolldown (`moduleType`) | `?raw` + `resolveIncludes()` fallback wired from day 1 in `@shaders/include.ts` |
| 3 | TypeScript 7.0.2 native binaries / tooling maturity | type-check only; `~5.9` fallback |
| 4 | `postprocessing` peer `< 0.186` | three pinned exact; bump both together |
| 5 | iOS Safari: sticky + `overflow:clip` + `100dvh` + address-bar resize | `ignoreMobileResize`, `dvh`, no `overflow` on `.stage`/`body`, test on real device early (week 1) |
| 6 | Double-smoothing / lag between DOM (sticky is instant) and GL | `scrub:true`, Lenis lerp 0.09 only |
| 7 | SplitText DOM count blowing the node budget | words/lines by default; chars only for short titles |
| 8 | Bloom on Apple GPUs at DPR 2 | DPR cap 1.75, `resolutionScale 0.5`, governor |
| 9 | Font choice (design decision) | pipeline is face-agnostic; swap files + `--font-display` token |
| 10 | Venue, registration URLs, MTF11 speaker list, ticket prices | `src/data/event.json` placeholders flagged `TBC`; JSON-LD generated from it |
| 11 | "Generated imagery upgrade" changing art direction later | `ctx.assets` lazy layer; procedural placeholders remain the fallback |
| 12 | Agents editing shared files | ownership rules §11.2; CI = `npm run build` on every PR |

---

## 16. Week-1 build order (integrator)

1. Free disk → install → scaffold (`index.html`, configs, `tooling/vite-plugin-chapters.ts`, `fonts.mjs`) → `npm run dev` renders the empty press-black stage with fonts.
2. `core/`: Renderer + Uniforms + Stage + Scroll + Modes + Debug harness (with a `00-prologue` stub of length 5).
3. `world/`: sky, sun, sea, stars, constellations, WorldParams — the film has a world.
4. `post/`: Composer with Bloom/SMAA/Film + `TesseraeEffect`; preloader with the tesserae reveal.
5. Publish `types.ts` + this spec + one exemplary chapter (`03-ogygia`) as the template → unleash the chapter agents in parallel.
6. Integration pass: overlaps (`lead/tail`), camera continuity, budgets, a11y audit, Vercel preview.

*End of specification.*
