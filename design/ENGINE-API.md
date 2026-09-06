# MTF11 — Engine API (the code that actually exists; read before writing a chapter or a layer)

The lead has written the shared engine. Build agents plug into it; they do NOT re-architect it.
PRECEDENCE: design/DESIGN-BIBLE.md (what to build) → this file (how the engine works) → design/research/tech-spec.md (background only).
STUBS: every file you own already exists as a lead-written STUB with the documented signature (chapters, art glyphs, layers, ui). Replace the stub's contents entirely; keep the exported names/signatures so other files keep compiling.
SCREENSHOTS: the dev server is running at http://localhost:5173. See your work with
  `node scripts/shot.mjs "http://localhost:5173/?chapter=<id>&p=0.5" shots/<id>-05.png 1440 900`  (mobile: `... 390 844`)
  then Read the PNG. It also prints console errors. Do NOT use the in-app browser tools (one shared pane) — use this script.
TYPECHECK: `npm run typecheck` checks the whole repo; errors in files you do not own may be another agent's work-in-progress — ignore those, never edit them, and make sure YOUR files are clean. `npm run build` must pass for your files.
Stack: Vite 8 + TypeScript 7 (strict) + Three.js 0.185 + postprocessing 6.39 + GSAP 3.15 (ScrollTrigger, SplitText — free) + Lenis 1.3.
Run: `npm run dev` (http://localhost:5173) · `npm run typecheck` · `npm run build`. Both typecheck and build MUST pass before you finish.

## Files (ownership)
```
index.html                      lead     — shell: #preloader, #gl canvas, #site-header, #site-nav, .rail, <main id="app">, #cursor
src/main.ts                     lead     — boot: preloader → scroll → World (+layers) → Stage.mount(chapters) → ticker loop → curtain opens ('mtf:ready')
src/engine/scroll.ts            lead     — ScrollEngine (Lenis + ScrollTrigger). exports { gsap, ScrollTrigger }
src/engine/gl.ts                lead     — World: one renderer/scene/camera/composer; Layer interface; damped Mood; sunNdc; DPR governor
src/engine/mood.ts              lead     — Mood type (all world params), DEFAULT_MOOD, hex(), lerpMood()
src/engine/chapter.ts           lead     — Chapter + ChapterCtx + Shared types
src/engine/stage.ts             lead     — mounts chapters into #app, per-chapter ScrollTrigger, blends moods
src/engine/film.ts              lead     — createFilm(ctx,{length,onUpdate}) → sticky pinned frame + scrubbed timeline; builds the breath map and the reading gates; .attach(el) re-hangs the scrub
src/engine/breath.ts            lead     — the breath's pure maths: Breath/Seg/Landing, through()/inverse(), readingMs(), beatSeconds()
src/engine/hold.ts              lead     — the film registry: stopAfter()/stopBefore() (where the wheel goes), speedAt() (the pace), playerLimit()
src/engine/play.ts              lead     — the player: step(dir) for one wheel gesture, and PLAY THE STORY for the whole film
src/engine/pacing.ts            lead     — per-chapter scroll multiplier table (filmLength)
src/engine/avoid.ts             lead     — overlap resolver: pushes text blocks clear of the headline after layout
src/engine/text.ts              lead     — reveal() (SplitText masked lines/words/chars), rise(), drawRule(), countUp()
src/engine/utils.ts             lead     — clamp, lerp, damp, smoothstep, el(), qs/qsa, prefersReducedMotion, isTouch, isMobile
src/gl/layers/{sky,sun,sea,stars,tesserae}.ts   one GL agent each — implement Layer; read Mood every frame
src/gl/layers/island.ts         lead     — the island (Ogygia): faceted limestone mesas + a rock window; placed by the island* mood keys; a mirrored reflection
src/chapters/scene.ts           lead     — shared anchors of the Ogygia scene: ISLE, ISLE_SCALE, CAVE (chapters 04 and 05)
src/gl/post/mosaic.ts           gl/post agent — MosaicEffect (postprocessing Effect); World sets .amount from mood.mosaic
src/ui/preloader.ts             ui/preloader agent — must keep initPreloader().done() contract (resolves when curtain opened)
src/ui/header.ts                ui/header agent — header + nav overlay; ids #site-header, #site-nav, [data-nav-toggle]
src/ui/cursor.ts                ui/cursor agent — custom cursor (#cursor .cursor__dot .cursor__ring)
src/styles/tokens.css           lead (from DESIGN-BIBLE) — CSS custom properties: colours, type scale, spacing, motion
src/styles/base.css             lead — reset, .chapter, .ch-inner, typography classes (.display .h1 .h2 .h3 .lead .body .eyebrow .label), split masks, .chapter--film/.pin
src/styles/components.css       lead — .chip .btn .btn--primary/.btn--ghost/.btn--paper .link .card .cross .row .stat .ticker
src/styles/ui.css               ui agents — preloader/header/nav/cursor styles
src/chapters/registry.ts        lead — ordered list of chapters (agents never edit; lead wires your export)
src/chapters/<slug>/index.ts    chapter agent — `export const <camelSlug>: Chapter`
src/chapters/<slug>/style.css   chapter agent — scoped under `#ch-<slug>` ONLY. Import it at top of your index.ts: `import './style.css'`
src/art/*.ts + src/art/formations/*.svg   art agent — SVG glyph factory functions returning SVG strings (stubs exist with the final signatures; see DESIGN-BIBLE §9)
src/content/content.json        lead (from design/research/content-model.json) — all copy/facts. Import: `ctx.content`
src/content/speakers.json       lead — 36 MTF10 headshots at /speakers/<slug>.jpg (480×480)
public/fonts/*.woff2            lead — self-hosted; @font-face in src/styles/fonts.css
public/brand/mtf-logo.png       lead — foundation logo (blue Mediterranean outline)
```

## Lead amendments already applied (DESIGN-BIBLE §10.2)
- `Mood.camYaw` (radians) is the camera's Three.js Y rotation (Euler order YXZ: yaw then pitch): POSITIVE TURNS LEFT (the view swings toward −X). Chapters 04–07 and the stars layer are built on this; Ch 08's compass labels mirror accordingly. The far-horizon point ahead of the camera is (camX − sin(yaw)·d, seaY, camZ − cos(yaw)·d). `DEFAULT_MOOD`: skyTop #090D16, skyBottom #0E3D57, seaColor #0E3D57, camYaw 0, grain .06.
- Reserved generic params: `p1` tessera WRITE amount · `p2` write mask index (0 SUN, 1 XI) · `p3` SHATTER gravity · `p4` VEIL TEAR.
- Monotonic params every chapter MUST declare explicitly (or the blend unwinds): `veil`, `camYaw`, `p4`, `tessForm` — values per DESIGN-BIBLE §8.1.
- Film chapters: the Stage's `p` (for `mood(p)` AND `onProgress(p)`) is the pinned travel `clamp((scrollY − top)/((filmLen − 1) × vh))` from `--film-len` — identical to `createFilm`'s timeline, even when flowing content (Ch 14's footer) follows the film inside the section. `stage.travelOf(m, vh)` exposes it; `?chapter=<id>&p=` and scripts/qa.mjs use it, so URL p == film p. Flowing chapters use the section's passage through the viewport.
- Mood blend between chapters: films hand over at the seam (smoothstep .86→1 of the current film's p into the next chapter's p 0); flowing sections blend from .62. Do NOT compensate for the blend inside mood(p).
- CSS live values written by the world every 3rd frame on `<html>`: `--sky-now` (rgb), `--warmth-now`, `--veil-now` (mood.veil), `--tear-now` (mood.p4), `--horizon-now` (screen % from top of the sea horizon in the camera's heading).
- `world.project(x, y, z) → { x, y, z }` = CSS px from the viewport's top-left of a world point (the result object is reused; copy values). Use it in `onFrame` to pin DOM/SVG to world objects (island, palm centre, sun). `world.sunNdc` (−1..1) and `world.sunWorld` also exist.
- Global state classes chapters may toggle on `<html>`: `theme-paper` (Ch 06 only, onEnter/onLeave), `is-black` (Ch 11 from p ≥ .96 → removed by Ch 12 at p ≥ .62), `is-register` (Ch 13 onEnter/onLeave). Header/rail/corners react in CSS.
- Events: `main.ts` dispatches `mtf:progress` `{ phase: 'fonts'|'chapters'|'frame'|'ready', value }` during boot and `mtf:ready` when the curtain opens. Chapters dispatch `mtf:glyph` `{ letter: 'S'|'U'|'N' }` (02/05/09) and `mtf:sunrise` `{ p }` (14); the preloader dispatches `mtf:night` `{ night }`; the rail listens. The active chapter sets `data-veil-line` on `#veil` (Ch 04) — the veil component renders it.
- No custom cursor (`#cursor` removed; `initCursor` is a no-op). Native pointer everywhere.
- `index.html` has: `#preloader` (with `.preloader__line`, `.preloader__rule`, `.preloader__star`, `.preloader__night`), `#gl`, `#site-header` (`.header__brand` with `.header__mark` + `.header__word`, `.header__cta.btn--sky`, `.header__menu[data-nav-toggle]`), `#site-nav`, `aside.rail`, `#veil`, `#corners`, `main#app`, `.skip` link.
- Tokens are FINAL in `src/styles/tokens.css` (bible Appendix A). Typography classes in `base.css`: `.display .h1 .h2 .h3` (Fraunces), `.s`/`.story` (Storyteller italic, WONK on), `.f`/`.lead` (Forum), `.body .small .fine .eyebrow .label .index .caps .tnum`. Components in `components.css`: `.chip .chip--gold .chip--tba .chip-row .btn .btn--primary .btn--ghost .btn--paper .btn--sky .btn--sm .flood .link .link--mono .card .card--paper .card--frame (+ .card__rule--t/r/b/l, .card__corner--tl/tr/bl/br) .cross .row .tile .tile__card .voice .voice-grid .field .field__label .field__input .field--radio .orbit .stat .tess-out`.
- Film layer classes in `base.css`: `.pin__layer.shadow` (z1, `color: var(--press)` so `currentColor` silhouettes are ink), `.pin__layer.plate` (z2), `.pin__frame` (z3), `.pin__layer.fx` (z4), `.pin__layer.flash` (z5). `.chapter--static` for the reduced-motion stack.

## The Chapter contract (src/engine/chapter.ts)
```ts
export interface Chapter {
  id: string                 // slug, becomes <section id="ch-<id>" class="chapter" data-chapter="<id>">
  label?: string; navIndex?: string; inNav?: boolean
  mount(ctx: ChapterCtx): void | Promise<void>   // build DOM inside ctx.el; create your ScrollTriggers/tweens
  onProgress?(p: number, ctx): void  // 0..1 while the section travels from entering viewport bottom → leaving top
  onEnter?(ctx): void; onLeave?(ctx): void
  onFrame?(shared: Shared, ctx): void // every frame while the section is in view (cheap work only)
  mood?: Partial<Mood> | ((p: number) => Partial<Mood>)   // the world's parameters while this chapter is centred. p = 0..1 of the section
}
export interface ChapterCtx { el: HTMLElement; world: World; scroll: ScrollEngine; shared: Shared; content: any }
export interface Shared { time, dt, scrollY, scrollProgress, velocity, mouse:{x,y,tx,ty,down}, vw, vh, dpr, reduced, touch, mobile }
```
Rules:
- Your DOM lives ONLY inside `ctx.el`. Use `ctx.el.innerHTML = ...` (template strings) or `el()` from utils. Wrap in `<div class="ch-inner">` for the max-width grid, or use `createFilm` for pinned cinema.
- Your CSS lives in `src/chapters/<slug>/style.css`, every selector prefixed `#ch-<slug>`. Use the tokens (var(--paper), var(--gold), var(--font-display), var(--fs-h1)…). Never redefine tokens. Never style global elements.
- Copy comes from `ctx.content` (src/content/content.json — see its shape; most leaves are `{ value, status, origin }` objects, so read `.value`). Where a fact is `status: "tbc"`, render it honestly (e.g. "Venue to be announced").
- Scroll-driven animation: `import { gsap, ScrollTrigger } from '../../engine/scroll'` and create ScrollTriggers with `trigger: ctx.el` or children. Text: `import { reveal, rise, drawRule, countUp } from '../../engine/text'`.
- Pinned cinematic chapter: `const { pin, tl } = createFilm(ctx, { length: 4 })` → put a `.pin__frame` inside `pin`; add tweens to `tl` at positions 0..1 (its duration is 1). The section becomes 4×100vh tall and the frame stays pinned while `tl` is scrubbed.
- The 3D world is NOT yours to add meshes to. Drive it through `mood`. Available Mood keys (all numbers unless noted):
  camX camY camZ camTilt fov · skyTop skyBottom (RGB via hex('#…')) haze · sunX sunY sunZ sunRadius sunGlow sunHeat(0 star→1 sun) sunVisible ·
  seaY seaAmp seaSpeed seaOpacity seaColor(RGB) · stars starDrift constellation ·
  tess(0 scattered→1 locked) tessForm(formation index in STORY ORDER, fractional = morph between neighbours) tessSpread tessGlint tessGold ·
  veil(0→1 cloth across the stage) · p1 p2 p3 p4 (generic per-layer parameters, documented in each layer file) ·
  bloom grain vignette mosaic(post-process 0..1) aberration · warmth(0 night→1 noon)
  Defaults in DEFAULT_MOOD (src/engine/mood.ts). Camera looks down −Z from z≈8; the sea plane sits at y=seaY; the sun is a billboard at (sunX,sunY,sunZ).
  The Stage blends your mood with the next chapter's during the last ~38% of your section, so end states should be designed to hand over.
- If you need something the world cannot do, put a CSS/SVG/Canvas layer INSIDE your section (position:absolute; pointer-events:none) — do not touch src/gl unless you are a GL agent.
- Mobile (`ctx.shared.mobile`, width < 820px) must work: shorter film lengths, stacked layouts, no hover-only affordances. Reduced motion (`ctx.shared.reduced` / html.reduced-motion): show everything, no scrubbed pins that trap content.
- Accessibility: real text in the DOM, headings in order (one h1 on the hero; h2 per chapter), buttons/links focusable, decorative SVG `aria-hidden`.
- Never `import` another chapter. Never edit registry.ts, main.ts, index.html, tokens.css, base.css, components.css — if you need a shared component, add it to your own CSS and mention it in your final report so the lead can hoist it.
- Debug: `http://localhost:5173/?chapter=<id>&p=0.5&debug` jumps straight into your chapter at 50% and shows the live mood. `&mood=tess:1,tessForm:2,sunHeat:0,skyBottom:%23FF7A1A` overrides any mood keys (numbers or hex colours) — GL agents use this to test layers before chapters exist.

## GL Layer contract (src/engine/gl.ts)
```ts
export interface Layer { name: string; init(ctx: LayerCtx): void; update(mood: Mood, shared: Shared, ctx: LayerCtx): void; resize?(w,h,ctx): void; dispose?(): void }
export interface LayerCtx { scene, camera, renderer, shared, world }   // world.sunNdc = sun position in NDC; world.mood = current damped mood
```
Layers are added in main.ts in this order: sky (NDC backdrop, renderOrder −100) → stars (−90) → tesserae (−60) → island (−55) → sun (additive billboard, −50) → sea (y=seaY, −20) → the island's reflection (−15, no depth test). One ShaderMaterial per layer; uniforms updated from Mood each frame; keep draw calls ≤ 3 per layer; no per-frame allocations. Post chain (World): Bloom → MosaicEffect → ChromaticAberration → Noise → Vignette in ONE EffectPass.

## The breath, the hold and the player (src/engine/breath.ts · film.ts · hold.ts · play.ts)
A film's timeline is walked once (after mount, and again on every ScrollTrigger refresh) into a **breath map**: scroll fraction → timeline
time, piecewise-linear. Beats (any tween) pass at their natural speed; the still moment after a beat is given 2.2× the scroll (capped at
14 % of the film); the empty run-in and run-out are *seams* — weight .75, never more than 6 % of the film. The pauses are paid for by growing
the section (`--film-len` × stretch, ≤ 1.6×), never by speeding beats up. `filmTime(el, p)` is what the Stage feeds `mood(p)` and `onProgress(p)`,
so the world and the copy share one clock.

The same walk finds every tween that **lands text** — opacity/autoAlpha → 1, a `from` hidden, a masked line rising — and every animation that
carries none. Landings within .011 of each other are one arrival (a line's own stagger, a stanza set as one beat), never spanning more than .05;
anything further apart was written as a separate moment and stands alone (the eleven stars of Ch 03 are .018 apart). The end of each arrival and
the end of each text-free animation over .04 long is a **stop**. About 278 across the film, ~20 a chapter.

**The wheel does not scrub.** Inside a film a gesture means *next* (or *back*): `player.step(dir)` plays the film from where it rests to the next
stop at the pace written here — `beatSeconds(len)` .5–3.2 s for a beat, `HOLD_SECONDS_PER_UNIT` for a still stretch that carries the world's own
motion — then rests. A fresh gesture always moves one stop, so the smallest nudge is answered; a gesture that keeps going asks for one more every
150 px of travel, and the player queues at most three, which caps a hard flick. So a sentence always lands whole and in its own time, an animation
is always seen at the speed it was made for, and no scroll is ever spent on an empty screen. Keys do the same (Home/End jump). Touch stays native
— a phone still scrubs by distance, which is why `filmLength` gives touch 1.5× the scroll. `?nohold` restores free scrolling for the QA scripts.

**The player** (`player.start/stop/toggle`, the header's PLAY pill, `?autoplay`) runs the whole film the same way, resting on every landing for its
reading time. Any wheel, key or touch takes it back. `player.estimate()` ≈ 10 min at 1440×900.

**Seams.** Two films in a row overlap by one screen (`.chapter--film + .chapter--film { margin-top: -100vh }`): the incoming pin — transparent,
empty until its first beat — rises over the outgoing film's last screen instead of after it. So a chapter's frame MUST be empty by p .90 (the seam
rule); a chapter whose frame stays live to p 1 adds `chapter--stays` on its section and keeps the plain slide after it (13 → 14). The Stage sets
`.is-live` on a film while 0 < p < 1; a pin takes the pointer only then.

A chapter whose section is more than its film (14: film + footer) calls `createFilm(ctx, {…}).attach(filmEl)` after moving the pin into
the film wrapper — never its own ScrollTrigger on `tl`, or the breath, the hold and the player all lose the film.

## Mood keys added after the bible
`sunNear` (0 celestial — pushed 140 units out along its ray and cut by the horizon; 1 an object at its declared point — the star in the island's
window; chapters 04/05 set 1). `island` (presence), `islandX/Y/Z` (the base of the rock window; Y = the waterline it stands in), `islandScale`,
`islandYaw`, `islandTone` (0 night stone → 1 the paper world's sand). 04/05 stage it near (`chapters/scene.ts`), 06/07 far on the horizon at a
matched apparent size, so the seam 05 → 06 carries it out rather than swapping it.

## Timeline of a page load
preloader shows → Lenis stopped → World + layers init → Stage mounts all chapters (your mount runs here; DOM is `visibility:hidden` until ready) → fonts ready → ScrollTrigger.refresh → first frame + world.snap() → preloader curtain → `html.is-ready` + `mtf:ready` event → Lenis starts. `reveal(..., { immediate: true })` automatically waits for `mtf:ready`.
