# MTF11 · Mediterranean SUN — Illustration & 3D Art Plan
**Mythic Art Director deliverable · 2026-09-05 · for coding agents (no image generation required)**

Stack this plan is written against (already in `package.json`): Vite 8, Three r185, GSAP 3.15 (ScrollTrigger), Lenis, `postprocessing` 6.39 (pmndrs), `vite-plugin-glsl`, `split-type`. Every item below is buildable today with SVG + CSS + Three.js + GLSL. Section E is the optional paid-imagery layer for later.

---

## 0. The idea in one paragraph

The website is the gala script, *Calypso's Odyssey*, turned into a scroll-driven film — one pinned stage, pear.no-grade restraint — whose imagery is drawn in the language of the client's folk-art reference (flat geometric figures, a five-colour palette, storybook composition, long diagonal "spear" lines, enormous negative space) but transposed to the Mediterranean myth: Helios' sun and cattle, Zeus' bolt, the star that descends and becomes Calypso, Ogygia = Gozo (red Ramla sand, honey limestone, Ġgantija stone), the veil (*kalyptein*), seven years, the net cut open, the raft built from wreckage, the open hand, the olive tree, Homer. The "futuristic / modern-art" half comes from three devices: (1) a **mosaic post-process** that tessellates the whole frame into tesserae with grout and gold glints (mosaic is simultaneously Roman-Maltese and pixel), (2) **instrument framing** — every folk-art icon sits inside a precise hairline/mono-label frame with coordinates, ticks and crosshairs, and (3) **glass-and-gold 3D objects** (the Sun Ring) and procedural Bauhaus / Matisse / Rothko / LeWitt compositions. The result should feel like a Roman mosaic floor lit by a laser.

### 0.1 Visual DNA transposition (from the X reference to ours)

| Folk-art reference (Hanuman frames) | MTF11 transposition |
|---|---|
| Flat, faceless geometric figures, no outlines | Calypso, Ulysses, Homer, sailors, cattle = silhouettes built from primitives (circle, capsule, trapezoid). No faces. Ever. |
| Cream ground `#f3e3c3`, deep teal `#1d4a5c`, terracotta `#8c3a2b`, gold `#d9a441`, flame `#ff7a1a→#ffd166` | Same five, plus stage black `#0b0a09`, Ramla red `#c4633a`, honey limestone `#d9b77a`, olive `#6b7a4f`, leaf-silver `#b9c2b0` |
| Armies as repeated units, huge empty ground | Helios' cattle as a frieze of 7 repeated silhouettes; the sailors as 6 identical marks; 70%+ negative space in every icon |
| Long diagonal spears leading the eye | Zeus' bolt, Hermes' descent line, Orion's lines "extended beyond their stars", oars, rays. One dominant diagonal per composition |
| Flame trail as a single continuous ribbon | The descending star's trail; the veil's edge; the sun path on water |
| Paper grain + vintage print | SVG `feTurbulence` grain at 4–6% over cream sections; film grain in the WebGL post pass |
| Storybook framing (wide, low horizon) | Every landscape icon is 16:9 or wider with the horizon at 55–70% height |

### 0.2 Colour tokens (single source of truth — put in `src/styles/tokens.css` and mirror in `src/three/palette.ts`)

```css
:root{
  --press:#0b0a09;        /* stage black (pear) */
  --ink:#1d1c19;  --ink-soft:#33322d;
  --navy:#071a2b; --navy-2:#0d2233;      /* night sea / ink navy */
  --teal:#1d4a5c; --teal-2:#2b5f73;      /* deep sea */
  --sky:#015186;                          /* pear sky, used sparingly */
  --sand:#f3e3c3; --paper:#f2f1ed; --cream:#fffaea;
  --terracotta:#8c3a2b; --ramla:#c4633a;
  --limestone:#d9b77a; --limestone-2:#e3c58e; --limestone-3:#c9a86a;
  --gold:#d9a441; --gold-2:#ffd682; --gold-3:#ffc86e; --gold-pale:#ffd166;
  --flame:#ff7a1a;
  --olive:#6b7a4f; --olive-dark:#4b5a37; --leaf-silver:#b9c2b0;
  --rule:rgba(255,255,255,.22); --rule-dark:rgba(29,28,25,.16);
  --ease-press:cubic-bezier(.22,1,.36,1);
}
```
JS equivalents: `easeOutQuint(x)=1-Math.pow(1-x,5)` (≈ `--ease-press`), `easeInOutCubic` for morphs, `easeInCubic` for departures/falls.

### 0.3 Chapter map (the story spine the art is keyed to)

Whole-page scroll progress `P ∈ [0,1]`. Each chapter receives a local `p ∈ [0,1]`. Numbers are a starting proposal; the narrative director may re-key. Object codes refer to sections A (icons), B (3D), D (modern-art moves).

| # | Chapter (gala canto) | Site content it carries | Emotion / palette field | Art |
|---|---|---|---|---|
| 00 | PROLOGUE — hero | "MEDITERRANEAN SUN · 25–27 Nov 2026 · Malta · 11th edition" | Destiny · press black → gold | B1 sun disc, B2 ocean, B7 ring far away, C mosaic-dissolve reveal, U1 SUN sigil |
| 01 | THE LAST SHIP | **S — Stewardship**: "Do not touch what belongs to the Sun" → What must we protect? | Loss · navy, gold, flame | A1 Helios & cattle, A2 the ship breaks, B10 storm |
| 02 | A SKY FULL OF STARS | Why now — forces reshaping tourism; "Where do I go from here?" | Direction · navy, cream | A3 star field → descent, B4 constellation particles |
| 03 | THE STRANGER — OGYGIA | Malta & Gozo (venue), Who is MTF (foundation), the veil | Concealment · limestone, ramla, teal | A4 veil, A5 Gozo, B6 megaliths, B8 3D veil |
| 04 | THE AWAKENING | **U — Unity**: "a hand when we needed one" → Connect people, destinations, opportunity | Healing · teal → sand | B7 Sun Ring centre-stage (S/U/N arcs), A11 hand prelude, D LeWitt connection lines |
| 05 | PARADISE | THREE DAYS. ONE ECOSYSTEM. (25/26/27), awards, gala, concert, coffee | Joy · gold, terracotta, ramla | A5 dawn variant, U3 triptych, B5 leaves drifting, D Matisse cut-outs |
| 06 | SEVEN YEARS | 11 FOR 11 — 11th edition, 11 think tanks | Time · seasonal ring | A6 wheel of seasons, U2 11-for-11 wheel |
| 07 | FOREVER / THE OTHER WOMAN | MED READY + the four specialist events (readiness = reading the stars again) | Fear → navigation · cold teal, black, cream | A8 Orion & the Bear, U4 event glyphs, A4 veil tear |
| 08 | THE OPEN HAND | **N — Net Positive**: Hermes, the raft from wreckage, the net cut → "Leave more than we take" | Letting go · cream, gold | A9 Hermes, A10 raft, A11 net → open hand, B3 tesserae field forms the hand, B9 3D raft |
| 09 | THE POET | Voices (speakers), "I lived", register CTA | Life · black → cream | A12 Homer, A7 olive, B5 leaf fall |
| 10 | SUNRISE — footer | Contacts, socials, associates | Catharsis · dawn | B1 sun rises, A11 hand becomes horizon, B2 dawn ocean |

---

## A. Icons of the Odyssey — 12 procedural SVG compositions (+4 utility glyphs)

### A.0 Shared rules for every icon
- **ViewBox** `0 0 1000 1000` unless noted (landscapes `0 0 1600 900`). Transparent background; the stage or a Rothko field (D3) sits behind.
- **Construction** = primitives only: `circle`, `rect rx`, `path` with ≤ 3 curves, `polygon`. No outlines on figures (Matisse rule), hairlines only for "instrument" parts (rules, ticks, constellations, rays) at `stroke-width .75–1.25` in `--cream` at 25–60% alpha.
- **Instrument frame** (D6) around each icon: a 1px `--rule` frame inset 4%, corner crosshairs (two 12px lines), mono caps label top-left (`CANTO 01 · THE LAST SHIP`), coordinates bottom-right (`36.0451° N · 14.2470° E` for Ramla), and a 72-tick ring or ruler that draws in with the icon. This is what keeps folk-art from reading as vintage.
- **Grain**: one shared `<filter id="grain">` (`feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2"` → `feColorMatrix` to alpha .06 → `feBlend multiply`) applied to the icon group on cream/sand grounds only. Skip on dark grounds (banding).
- **Driver**: every icon exposes `setProgress(p)` (0–1, scroll-scrubbed) and an optional `tick(t)` idle loop. Implement with GSAP timelines (`paused:true`, `tl.progress(p)`) built once per icon; stroke draws use `stroke-dasharray = stroke-dashoffset = pathLength` (set `pathLength="1"` on paths so dasharray is always `1`). ScrollTrigger `scrub: 0.6` through Lenis.
- **Shared symbols** (`<defs>` in a single inline sprite): `#theStar` (r=6 gold disc + 4 diffraction spikes 60px at 0/90° and 30px at 45°, halo `radialGradient` r=40 gold→transparent), `#plank1..5` (from A2, reused in A10), `#hand-open`, `#hand-fist` (A11), `#cow` (A1), `#figure` (circle head r=46 + capsule torso 120×260 rx 60 + two arm capsules 34×170 rx 17), `#leaf` (A7), `#tick72`.
- **Reduced motion**: `setProgress` still works (scroll = time); `tick` idle loops are disabled; no autonomous rotation.
- **Mobile**: icons ≤ 640px rendered width; `feDisplacementMap`/`feTurbulence` filters swapped for CSS fallbacks noted per icon.

---

### A1 · HELIOS — The Sun and the Cattle  (Canto: Preamble · Stewardship)
*"Do not touch what belongs to the Sun."*

**Geometry (viewBox 0 0 1000 1000)**
- Sun disc: `circle cx=500 cy=420 r=60`, fill `radialGradient` (`#fff5d6` 0% → `#ffd166` 55% → `#ff7a1a` 100%).
- Seven rings, centre (500,420), radii **110, 160, 210, 260, 310, 360, 410**. Stroke widths `1.25, 1, 1, .75, .75, .75, .75`. Colours: rings 1–3 `--gold-pale` at α .8/.55/.35; rings 4–7 `--cream` at α .25/.18/.12/.08. Each ring k uses `stroke-dasharray` = `(2πr/(12k))·0.7, (2πr/(12k))·0.3` so rings read as broken ray-arcs, not target circles.
- Rays: 24 hairlines every 15°, from r=430 to r=490 (long, at 0°,30°…) and r=430→460 (short, at 15°,45°…), stroke `--gold-pale` α .6. Group `#rays`.
- Horizon: line x 80→920 at y=700, `--cream` α .6, 1px. Sand field `rect 80 700 840 60` fill `--sand` α .06.
- **Cattle** `#cow` symbol (all rects `rx` so it is soft, no outline): body `rect 0 40 120 56 rx 24`; neck `polygon 108,48 150,30 150,70 118,86`; head `rect 140 22 44 34 rx 12`; horns two crescents `path M150,22 a14,14 0 0 1 22,-12` and mirrored; legs 4× `rect 14 90 10 54 rx 4` at x = 14, 34, 82, 102 (front pair splayed by `rotate(-4)` / `rotate(4)` about top); tail `path M0,52 q-16,10 -10,40` stroke 4 round; **brand of the Sun**: `circle 60 62 r=6` fill `--gold` (every cow carries the sun's mark).
- Seven cows on baseline y=700 (feet at 700): x = 140, 250, 380, 470, 600, 720, 840; scales 1.0, .8, 1.0, .75, .9, 1.0, .8 (alternate depth); fills `--terracotta` (5) and `--navy-2` (cows 2 and 4, reading as the far row). Cows face right.
- Zeus' bolt (hidden until p>.85): `polyline 680,60 630,300 690,360 560,560 600,600 520,700` stroke `--cream` 3px, duplicated behind with `feGaussianBlur stdDeviation=6` in `--gold-pale` (glow).

**Scroll animation `p`**
- 0–.25: disc `scale .2→1` (origin 500 420, easeOutQuint); rings draw in (dashoffset 1→0) staggered .04 p each; rays scale-y from 0 at their inner end.
- .25–.60: the cattle walk: each cow `translateX += 40·p_local`; leg pairs alternate `rotate(±6°)` on a 4-step `steps()` cadence keyed to p (no easing = the folk-art stop-motion feel).
- .60–.85: **the taking** — cow 5 (front, x=600) fills to `--gold` in one step at p=.62; from p=.66 all rings and rays interpolate `--gold-pale → --flame`, rays lengthen ×1.6, the disc's outer gradient stop moves inward (wrath).
- .85–1: **thunder** — bolt draws (dashoffset) in 0.03 p, a full-viewbox white `rect` flashes α .85→0 in 3 `steps()`, container `translate(±6px)` shake ×3, rings scale to 1.15 and fade to 0, cattle fade to .25. Hold.
- Idle `tick`: `#rays` rotate .5°/s; disc breathes scale 1↔1.02 over 6s.

---

### A2 · THE SHIP BREAKS  (Canto: Preamble → wreckage)
*"Thunder. The ship breaks apart. The sailors disappear."*

**Geometry**
- Sea: three `path`s under the hull (y 720, 760, 800), sine wave amplitude 8 wavelength 180, stroke `--teal-2` 1px α .6.
- Hull: `path M150,600 L850,600 L780,700 Q500,745 220,700 Z` fill `--navy-2`.
- Mast `rect 495 250 10 350` fill `--ink`; sail `polygon 505,270 760,560 505,560` fill `--sand`.
- Oars: 9 lines from hull underside at x = 230…770 step 67.5, going down-left 30°, length 140, stroke `--cream` α .5 1px — the "spear" diagonals.
- Sailors: 6 × (`circle r=10` head + `rect 16×30 rx 6` body) on deck at y=560, x = 300…700 step 80, fill `--sand`.
- **Pre-split planks**: hull is cut into 9 polygons by 8 lines radiating from the strike point **(500,−100)** at angles 74°, 82°, 88°, 93°, 98°, 104°, 110°, 118° (measured from +x). Implement as 9 `clipPath`s over a copy of the hull path, each in `<g class="plank" id="plankN">` with `transform-origin` at the polygon's centroid. Planks 2, 4, 5, 7, 8 are the survivors — export them as `#plank1..5` symbols for A10.
- Bolt: same `polyline` as A1 but entering from (560,0) to (500,590).

**Scroll animation**
- 0–.30: ship rocks `rotate(±2.5°)` about (500,650) as `sin(p·6π)`; sail billows via `scaleX .96↔1.04` at 3× the rock frequency; sailors bob 3px.
- .30–.40: bolt draws (0.02 p) → white flash → sail splits into two triangles along the line (505,270)→(640,560), halves translate ±30 and rotate ∓8°.
- .40–.85: **scatter** — each plank travels along its own vector away from (500,−100): distance 80–240 px (index-hashed), rotation −35°…+35°, easeOutQuint, stagger .03; mast rotates 40° about its base and slides down 120; sailors drop (translateY +260, easeInCubic) and fade to 0 — one by one, .05 apart ("the drowned sailors disappear one by one").
- .85–1: non-survivor planks sink (translateY +140, α→.1). Survivors settle at the bottom-left third of the canvas (final positions are the **start positions of A10**), α .55. Sea lines calm.

---

### A3 · A SKY FULL OF STARS → THE STAR DESCENDS  (Canto: Preamble/I · Why now)
*"Nine nights. One star follows Ulysses and gradually descends. On the tenth dawn the star touched the earth."*

**Geometry**
- Star field: 120 `circle`s; positions from a seeded hash so every visit is identical: `x_i = fract(sin(i·12.9898)·43758.5453)·1000`, `y_i = fract(sin(i·78.233)·43758.5453)·760`, `r_i = .8 + fract(sin(i·39.425)·43758.5453)·1.4`, α `= .35 + r_i/3`. Fill `--cream`.
- Horizon line y=880 (hairline `--cream` α .4). Below it nothing (black sea).
- Nine constellations (the nine nights), simplified vertex lists in 1000×1000 (approximate shapes — agents may substitute a catalogue; keep line counts):
  - **Orion** (belt diagonal): pts (620,300)(660,330)(700,360) belt; (600,200)(760,210) shoulders; (580,460)(770,470) feet; (690,395)(700,430) sword. Lines: belt chain, shoulders→belt ends, belt ends→feet, belt middle→sword.
  - **Ursa Major / the Bear (Dipper)**: (150,180)(215,205)(285,195)(350,235)(330,300)(255,310)(190,270). Bowl = last 4 closed; handle = first 4 chained.
  - **Cassiopeia**: W at (420,110)(470,150)(520,120)(570,165)(620,130).
  - **Pleiades**: 7-dot cluster in a 60px ellipse at (860,250), no lines, r .9–1.6.
  - **Boötes** (kite): (300,520)(340,470)(400,500)(390,580)(330,600) closed.
  - **Cygnus** (cross): (500,560)(500,700) and (440,630)(560,630).
  - **Lyra**: triangle (820,520)(850,545)(815,560) + parallelogram (830,565)(870,570)(880,620)(840,615).
  - **Aquila**: (720,600)(700,660)(740,700) with wings (660,650)(780,650).
  - **Scorpius** (hook): (80,600)(130,640)(180,690)(240,720)(300,720)(330,690)(320,660).
  - Lines: `--cream` .75px α .5, `pathLength=1`, draw via dashoffset.
- **The One Star** `<use href="#theStar">` at (500,300), scale 1.

**Scroll animation**
- 0–.35: nine constellations draw in sequence (night 1…9), each .035 p; big stars twinkle (CSS `@keyframes` α .6↔1, 2.5–4s, only the 30 largest).
- .35–.55: lines retract (dashoffset 0→1, reverse direction); **collapse**: every star lerps toward the One Star along a straight line, `t = easeInCubic(clamp((p−.35−d_i·.1)/.2))` where `d_i` = normalised distance (far stars start later); α fades with t.
- .55–.75: the One Star brightens: halo r 40→140 (`mix-blend-mode: screen`), spikes ×2.2, a thin ring r=180 draws once.
- .75–1: **descent** along a motion path `M500,300 C500,480 380,560 470,720 S540,860 500,880` (`offset-path` / GSAP MotionPathPlugin), easeInOutCubic; trail = 12 ghost `<use>` at previous sampled positions with α decaying .5→0 and scale .8→.3. At p=1: touch — three concentric ripple circles at (500,880) expand r 0→60/120/180 and fade. The star is now on the horizon = **Calypso** (A4 begins with a figure at that spot).

---

### A4 · CALYPSO'S VEIL — *kalyptein*  (Canto I cover · Canto VI tear)
*"To cover. To conceal. To draw a veil."*

**Geometry**
- Figure `#figure` variant "Calypso": head `circle 500 300 r=46`; hair = big black shape: `path M454,300 a46,46 0 0 1 92,0 L640,470 L560,420 Z` (`--ink`, a semicircle with a long triangle blowing right, as in the reference's flowing hair); torso trapezoid `polygon 440,352 560,352 590,720 410,720` fill `--teal-2`; arms two capsules 34×180 rx 17 from shoulders, angled 15° outwards; jewellery: necklace `path M455,372 q45,40 90,0` stroke `--gold` 4px; two armlets `rect` 40×8 gold. No face.
- Veil: `rect 150 200 700 560` fill `--sand` α .22, plus a hairline grid inside it (`pattern` 40×40, lines `--gold` α .18). Bottom edge scalloped: replace the rect with `path` whose bottom edge is 6 quadratic scallops of 116px.
- Two veils stacked (`#veilA`, `#veilB`), B offset (−30, +20), α .14, `mix-blend-mode: screen`.
- Displacement filter: `<filter id="veilWarp" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.008 0.02" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="40" xChannelSelector="R" yChannelSelector="G"/></filter>`. Animate: `<animate attributeName="baseFrequency" values="0.008 0.02;0.010 0.024;0.008 0.02" dur="9s" repeatCount="indefinite"/>` (or JS setAttribute at 30fps; different seed on veil B).
- Tear line (hidden): jagged `polyline` from (500,200) to (500,760) with 9 vertices jittered ±14 in x, stroke `--cream` 1.5px.

**Scroll animation**
- 0–.40 **cover**: veil A slides in from right (translateX 900→0) with displacement `scale` 90→40 (settling), veil B follows .06 later; figure fades in behind (α 0→1).
- .40–.70 **conceal**: veil α .22→.55, grid α up, figure α 1→.15. Hold (this is the Canto I / Ogygia state).
- .70–1 **tear** (re-used at Canto VI "The veil tears"): tear line draws top→bottom (.06 p); the two veil halves (clip the veil with two `clipPath`s split along the tear polyline) translate ±140 and rotate ∓4° (origin top), displacement scale spikes 40→110→30; figure returns to α 1, and the text lockup *I AM ULYSSES* is the typographic moment outside the icon.
- Mobile fallback (no `feDisplacementMap`): CSS `mask-image: repeating-linear-gradient(…)` with `mask-position` keyframes + a 2° rotated duplicate — an op-art moiré veil (D5).

---

### A5 · OGYGIA — Gozo, the island  (Canto I/III · Venue)
*"Red earth at Ramla. Honey-coloured limestone. Caves watching the horizon. A diamond set in blue."*

**Geometry (viewBox 0 0 1600 900)**
- Sky band `rect 0 0 1600 520`, `linearGradient` vertical: night `--navy` → `--teal` (night state) / `--gold-2` → `--sand` near horizon (dawn state) — implement as two gradients cross-faded by opacity.
- Sea band `rect 0 520 1600 380` fill `--teal`; five wave hairlines at y = 560, 620, 690, 770, 850 (sine amp 6, λ 160), `--cream` α .3; sun-path column: `line x=800 y 520→900`, `stroke-dasharray 8 14`, `--gold` α .5, 6px wide.
- **Gozo = stepped mesas** (Gozo's hills are flat-topped): back plateau `polygon 300,520 380,360 900,340 1180,380 1320,520` fill `--limestone` α .7; mid plateau `polygon 420,520 520,420 780,400 1000,430 1120,520` fill `--limestone-2`; front cliffs `polygon 560,520 640,470 900,455 1060,520` fill `--limestone-3`. Strata: hairlines every 18px inside each polygon (`clipPath`), `--ink` α .12 — globigerina limestone bedding.
- **Ramla bay**: red crescent `path M520,520 q140,-60 280,0 L800,560 Q660,600 520,560 Z` fill `--ramla`; 30 sand-grain dots r=1 `--cream` α .5 hashed inside it.
- **Calypso's cave = an eye** above Ramla on the mid plateau: almond `path M640,470 q60,-34 120,0 q-60,34 -120,0` fill `--press`; iris `circle 700 470 r=3` fill `--gold-pale` (the star lives in the cave). "Its eye upon the sea."
- Ġgantija nod on the back plateau: trilithon — `rect 940 336 10 26`, `rect 964 336 10 26`, lintel `rect 936 330 42 8`, fill `--ink`.
- Olive trees: 5 lollipops (circle r=14 `--olive` on a 2×22 stem `--olive-dark`) on the mid plateau, each with a `--leaf-silver` circle behind it offset (3,−2).
- Sun/moon disc: `circle 800 520 r=70` fill `--gold-pale`, initially translated to y+160 (below horizon), behind the back plateau via z-order.

**Scroll animation**
- 0–.30 **emerges**: bands slide up (`translateY 120→0`) back→front, stagger .05, easeOutQuint; sea waves fade in.
- .30–.60: strata hairlines draw left→right (dashoffset); Ramla fills via a `clipPath rect` widening from x=520 to 800; grain dots pop.
- .60–.80: the cave eye **opens**: animate `d` between a flat lid `M640,470 q60,0 120,0 q-60,0 -120,0` and the almond (same command count → GSAP/`d` interpolation); iris appears.
- .80–1 **dawn** (used in Canto III / Paradise and in the footer): gradient cross-fade to dawn; disc rises translateY 160→0; sun-path dashes drift downward (`stroke-dashoffset` loop); olive circles flip to silver (`--olive` ↔ `--leaf-silver` swap in a wave).
- Idle: waves `translateX` loop 20s; dash drift 2s.
- Variant **venue card**: same icon at 3:1 crop, dawn state, with mono label `GOZO · OGYGIA · 36.05° N 14.25° E`.

---

### A6 · SEVEN YEARS — The Wheel of Seasons  (Canto IV · 11 FOR 11)
*"At first they counted the days. Then… they stopped counting."*

**Geometry**
- Centre (500,500). Seven concentric rings = seven years, `stroke-width 40`, gap 8: radii **120, 168, 216, 264, 312, 360, 408** (stroke centred).
- Each ring is four seasonal arcs of 90° using four overlaid `circle`s with `stroke-dasharray` = quarter-circumference: spring `--olive`, summer `--gold`, autumn `--terracotta`, winter `--teal`. Gaps of 6px between seasons (subtract from dash length). These are Rothko fields bent into rings (D3).
- Sun marker `circle r=10` `--gold-pale` on the outer ring via `offset-path: circle(432px at 500px 500px)`.
- Centre: two tiny figures (`#figure` at scale .28): Calypso `--teal-2` at (470,500), Ulysses `--terracotta` at (530,500) — unchanged while everything turns.
- Year numerals 1–7 in mono 11px at each ring's 12 o'clock, `--cream` α .5.

**Scroll animation**
- 0–.85: rings fill sequentially inner→outer: each ring's four arcs draw (dashoffset) spring→winter over .11 p; the whole ring group rotates `k·20°` for ring k (outer rings spin faster = time accelerating); ring k begins .02 p after ring k−1 finishes but overlaps grow as p rises (compress durations: ring 1 = .16 p, ring 7 = .06 p — "they stopped counting").
- .85–1: `filter: saturate(.3)` on all rings, numerals fade — time unnoticed; the display-serif "7" sets in the centre behind the figures (type handled outside icon).
- Desktop hover: container `perspective: 900px; transform: rotateX(55deg)` → a sundial; the sun marker's shadow (a 1px line from centre to marker) appears.
- Idle: sun marker orbits 24s linear.

---

### A7 · THE OLIVE  (Canto III leaves · Conclusion tree)
*"Olive leaves turning silver… A single olive tree. A leaf falls."*

**Geometry**
- `#leaf`: lens `path M0,0 q35,-9 70,0 q-35,9 -70,0` (70×18), two stacked fills: `.front` `--olive`, `.back` `--leaf-silver`; midrib hairline `--olive-dark` α .5.
- Branch: stem `path M200,760 C380,620 560,420 820,240` stroke `--olive-dark` 3px, `pathLength=1`. 13 leaves at t = .08…1 step .0767, alternating sides, rotated to tangent ±35°, scale .7 (tip) → 1 (base). 5 olives `circle r=12` `--navy-2` with highlight `circle r=3` `--cream` at (−4,−4).
- **Tree variant**: trunk `path M470,900 C480,700 520,600 500,420 L540,420 C520,610 560,700 560,900 Z` fill `--olive-dark`; three branch paths; canopy = 40 `#leaf` instances on three nested ellipses (rx 260/190/120, ry 150/110/70) centred (500,380), random rotation ±40°.

**Scroll animation**
- 0–.40: stem draws; leaves scale 0→1 from their stem attachment (transform-origin at the leaf's base), in stem order, easeOutQuint, stagger .025.
- .40–.80 **turning silver**: leaves flip `rotateY 0→180°` (CSS 3D on SVG elements — Chromium/Safari OK; fallback `scaleX 1→−1` while cross-fading `.front`/`.back`) in a wave from base to tip; wind term `+ sin(t·1.3 + i)·12°` in idle.
- .80–1 **the leaf falls** (Conclusion only): leaf #7 detaches, follows `offset-path M0,0 c40,60 -60,120 -10,200 s60,120 20,220` over .2 p with `rotate` auto, fades to `--press` (fill → black) at the end. "A leaf falls. Black."

---

### A8 · ORION AND THE BEAR — Navigation Returns  (Canto VI · MED READY)
*"The same stars that guided him toward Ogygia now pointed beyond it."*

**Geometry**
- Background: A3 star field at 40% density (48 stars), no constellations.
- Orion left (vertices as A3, translated to x−120), Ursa Major right (A3 coords translated x+480, y+80). Lines `--cream` α .55 .75px.
- Horizon hairline y=820. Labels in mono caps: `EAST` at (60,800), `WEST` at (900,800) — the script's "East. West."
- Ulysses `#figure` at scale .45, feet on horizon, x=500, fill `--terracotta`; dotted sightline `line 500,640 → 660,345` `stroke-dasharray 2 6` `--gold` α .6.

**Scroll animation**
- 0–.30: stars scale 0→1 (bright first); .30–.60: constellation lines draw.
- .60–.85 **pointing beyond**: each constellation line extends past its end star as a long diagonal running off-canvas toward the right edge (draw a second line segment from the end star along the same direction, length 900, α .25) — the folk-art spear diagonal; the sightline swings from the belt to the right edge.
- .85–1: the figure turns — `scaleX 1→−1` about its centre in one `steps(1)` at p=.9 (a decision, not a tween); a small `--gold` `#theStar` appears at the far right on the horizon.

---

### A9 · HERMES DESCENDS  (Canto VII)
*"Zeus sent Hermes with one command: Release him. … Hermes disappears."*

**Geometry**
- The messenger's path: `line 980,20 → 300,760` (the single dominant diagonal), `--cream` 1.25px, `pathLength=1`. Five parallel speed hairlines offset ±14, ±28, ±42 px perpendicular, shorter (60% length), α .25.
- Winged sandal glyph at the leading end (group `#sandal`, 90×40): sole capsule `rect 0 14 60 14 rx 7` `--gold`; two wings each = three tapered triangles `polygon 0,0 34,-6 6,10`, stacked 6px apart, `--cream`; strap `path` gold 2px.
- Command ring at the endpoint (300,760): `circle r=30` stroke `--gold` 2px + inner `circle r=4` gold.

**Scroll animation**
- 0–.50: path draws from top-right with easeInCubic (accelerating); `#sandal` travels along it (`offset-path`, `offset-rotate: auto`); wing triangles rotate ±15° over 6 flap cycles.
- .50–.70 **the command**: ring stamps (scale 1.6→1, α 0→1, easeOutQuint), a pulse ring r 30→160 fades; speed lines snap off (α→0).
- .70–1 **Hermes disappears**: the line retracts from its tail (animate `stroke-dasharray` from `1 0` to `0 1` while dashoffset advances), sandal fades; only the ring remains. Hold — the command outlives the messenger.

---

### A10 · THE RAFT FROM WRECKAGE  (Canto VII · Net Positive)
*"The wood that carried him toward death would carry him toward life. Build from it."*

**Geometry**
- Uses `#plank1..5` (A2 survivors) starting at A2's final scattered positions/rotations (bottom-left third), α .55.
- Target raft: 5 planks laid horizontally in a `520×220` rectangle at (240,560): plank i at y = 560 + i·44, gaps 6 (planks are re-fitted with a `clipPath` to a 520×38 bar each — the wreck shapes still show at the ends). Two cross-battens `rect 240 590 520 14` and `rect 240 700 520 14` `--ink-soft`; mast `rect 496 300 8 260` `--ink`; sail `polygon 504,310 700,420 504,530` `--sand`; four lashings at plank ends = two crossed 1.5px lines 18px, `--gold`.
- Calypso's hand `#hand-open` (A11 construction) at scale .5 at right (760,600), `--teal-2`, pushing the last plank.
- Sea: two wave hairlines at y=790, 840.

**Scroll animation**
- 0–.60 **assemble**: plank i travels from scattered → target along a quadratic arc (control point lifted 120px), rotation → 0, easeOutQuint, stagger .08; α → 1; the hand enters from right with plank 5 and stops touching it.
- .60–.75: battens drop from above (translateY −80→0, easeOutQuint); lashings draw.
- .75–.90: mast `scaleY 0→1` (origin bottom); sail unfurls via `clipPath rect` height 0→full.
- .90–1: the raft slides right onto the sea (translateX +160) and the hand stays behind (Calypso does not go); idle bob `rotate ±1.5°` 4s + `translateY ±4`.

---

### A11 · THE NET → THE OPEN HAND  (Canto VII · finale · the brand's closing image)
*"Love is not the hand that closes. Love is the hand that opens."*

**State A — the net and the fist**
- Net: two families of hairlines at +45° / −45°, spacing 44px, clipped to `circle r=380` at (500,500); `--cream` α .55 .75px; knots = `circle r=1.5` at intersections (≈ 230), `--cream`.
- Fist `#hand-fist`: palm `rect 390 420 220 200 rx 60`; four folded fingers = `rect 56×90 rx 28` stacked across the top with 6px gaps (x = 396, 458, 520, 582, y=360), each with a knuckle `circle r=28` at its base so the fold reads; thumb `rect 150×52 rx 26` across the palm rotated −20° about (400,520). Fill `--teal-2`, 1px `--gold` hairline outline (the one place an outline is allowed — it is jewellery).
- Cut line: `line 500,120 → 500,880` `--cream` 2px, `pathLength=1`.

**State B — the open hand as mosaic**
- `#hand-open` silhouette (used as `clipPath`): palm `rect 380 420 240 260 rx 80`; five finger capsules, width 54, lengths 150/200/220/200/150, attached along the palm's top edge at x = 396, 452, 500, 548, 604, rotated from vertical by −38°, −18°, 0°, +16°, +34° about their base; thumb capsule 170×54 from (392,600) rotated −70°. Slightly rough edge: `feTurbulence baseFrequency .04` + `feDisplacementMap scale 3` on the clipPath source (Matisse scissors, D2).
- **Tesserae**: a jittered grid of ≈ 420 squares filling the hand's bounding box (x 300–740, y 180–720): cell pitch 26, tile size 22–26 (hash), rotation ±12° (hash), gap ≥ 3px (grout = stage black shows through). Tile colour from a 5-stop ramp by distance from the palm centre (500,540): 0–80px `--gold-pale`, →160 `--gold`, →240 `--terracotta`, →320 `--teal-2`, →∞ `--teal`; 8% of tiles (hash > .92) are pure `--gold-2` glints. Generate tiles in JS (one `<rect>` each, or a `<canvas>` layer if >600); store per tile: `target (x,y,rot)`, `start = polar(r=600, θ=hash·2π)`, `delay = dist_to_centre/340`.
- Specular sweep: a `linearGradient` mask (transparent → white 12% band → transparent) rotated −30°, `gradientTransform` translated across the hand.

**Scroll animation**
- 0–.35: net draws, fist static, net group `scale 1→.96` ("holding tighter").
- .35–.50 **the cut**: cut line draws top→bottom; net lines on each side retreat away from the cut (dashoffset on each line, direction by side) with `rotate ±3°`; knots fall (translateY +200, easeInCubic, stagger by y) and fade.
- .50–.90 **opening + assembling**: fingers un-fold — each finger `rotate 170°→0°` about its knuckle, pinky→index stagger .05, thumb last; the solid `--teal-2` fill fades out while every tile flies from `start` to `target` (scale 0→1, rot → target rot, easeOutQuint, `t = clamp((p−.5−delay·.4)/.3)`), so the hand assembles as a mosaic while it opens.
- .90–1 **gold sweep**: the specular band crosses −30° from bottom-left to top-right; gold tiles `brightness 1→1.6→1`; hold.
- **Footer morph** (chapter 10): the palm's top edge flattens into a horizon line (tween the palm `rx` to 0 and its height to 2px while fingers fade), tiles beyond the line drop away, `#theStar` sits above it, then the sun disc rises — "the image of an open hand becomes the Mediterranean horizon."

---

### A12 · HOMER — The Cloak, the Star, "I LIVED"  (Conclusion)
*"The Storyteller removes his cloak. I am Homer. Then one star appears above him."*

**Geometry**
- Cloak: `polygon 500,180 290,900 710,900` fill `--ink` (a tall triangle = a cloaked figure), hood = `circle 500 200 r=48` `--ink`. Pre-split down the centre line into two halves (`clipPath`s), origin at their bottom outer corners.
- Homer beneath: `#figure` at scale .9, fill `--cream`, plus a staff `line 640,420 → 640,900` `--gold` 3px.
- Star: `#theStar` at (500,120). Multiplying stars: 3 → 9 → 27 → 81 positions from the seeded hash, r 2.4 → 1.2, `--cream`.
- Sunrise: horizon hairline y=880 + semicircle `path M300,880 a200,200 0 0 1 400,0` `--gold-pale` clipped above the horizon, initially translated y+200.

**Scroll animation**
- 0–.30: everything black; cloak fades in (α 0→1) — the only thing on stage.
- .30–.50 **the cloak removed**: halves rotate outward ±70° about their bottom outer corners and drop (translateY +200, α→0), revealing Homer (α 0→1 in .05). Hold .50–.70 in silence (no motion; the copy carries it).
- .70–.85: `#theStar` appears (scale 0→1, halo), then stars multiply in four steps (`steps(1)` at .74/.78/.82/.85) — a geometric series, not a tween.
- .85–1 **sunrise**: semicircle rises (translateY 200→0, easeOutQuint) and the whole composition's cream shifts to gold; the mosaic post-process (C) fully dissolves to reveal the live 3D sunrise behind.

---

### Utility glyphs

**U1 · SUN sigil (brand mark, loader, page-progress instrument)** — three concentric hairline rings r 150/165/180 at (500,500); letters S · U · N in the display serif set on a circular `textPath` (upper arc) with the three expanded words `STEWARDSHIP · UNITY · NET POSITIVE` in mono 10px on the lower arc; inside, a 60px gold disc; outer tick ring `#tick72` (72 ticks every 5°, 12px; every 6th tick 24px; `--cream` α .5) that rotates 360° over the whole page (`rotate = P·360`) — it is the site's progress indicator in the left rail at 44px and the loader at 240px. Loader: rings draw in (dashoffset) while the disc fills from the bottom (clipPath) as assets/compile finish.

**U2 · 11 FOR 11 wheel** — 11 spokes at 32.727° from (500,500) r 120→400; node `circle r=14` at the tip with the number in mono; inner ring r=118 carries `THINK → CHALLENGE → DESIGN → ACT` on a `textPath`; sectors (`path` arcs of 32.727°, r 130–420) fill `--gold` α .12 on hover/focus and the think-tank title appears at the node. Scroll: spokes draw outward, nodes pop with stagger .04, the inner text ring rotates one full turn over the chapter. Three colour groups: 01–03 People & Innovation `--gold`, 04–06 Regional Action `--teal-2`, 07–11 Responsibility/Value/Culture `--terracotta`.

**U3 · Three-day triptych** — three tall panels 300×640 at x 80/350/620 (the gala's three screens): 25 = night with `#theStar` (Knowledge & Policy, Forbes, B2B, Awards), 26 = sun at zenith `circle r=48` (Forum, Skills, Careers, 11 for 11, **Calypso's Odyssey Gala**), 27 = sunrise semicircle (Plenary + four specialist events). Sun position tweens between panels as the user scrolls the three days; panel grounds are Rothko fields (D3).

**U4 · Four specialist-event glyphs** (120×120, one modern-art move each): **Beautiful Destinations** = Matisse cut-out arch (`--sand` semicircle over `--teal` rect) + one palm frond of 5 lens leaves; **MED READY** = shield of 5 concentric hairline arcs + a radar sweep (a 30° sector `--gold` α .3 rotating 8s) + a pulsing dot; **AI-Powered Hospitality** = Sol LeWitt 6×6 hairline grid where exactly one cell is a `--gold` circle ("AI in the back office, humans at the front"); **The Coffee Experience** = a cup from two concentric semicircles (`--terracotta`) + three rising wavy hairlines through a tiny `feDisplacementMap` (the veil filter at scale 6) = steam.

---

## B. Three.js scene list

### B.0 Architecture
- **One** `WebGLRenderer` (`antialias:false` — AA comes from the post chain; `powerPreference:'high-performance'`), `outputColorSpace = SRGBColorSpace`, `toneMapping = ACESFilmicToneMapping`, `toneMappingExposure = 1.0`, `setPixelRatio(Math.min(devicePixelRatio, 1.75))`. Canvas fixed full-viewport inside the pinned stage, behind the DOM type layer (`z-index` below `.copy`), pear-style navy tint div above it only where copy needs contrast.
- **One** `Scene`, chapters are `Group`s toggled by `visible`; a single scroll timeline (Lenis → GSAP ScrollTrigger `scrub`) writes `uniforms.uP` and drives a `CameraRig` with keyframes (position, target, fov) interpolated with `MathUtils.damp` (λ 6) for the "lerped scroll" feel.
- **Environment without assets**: build a 1024×512 equirect on a `<canvas>`: sky gradient (`--navy` top → `--teal` → horizon band `--sand` → sea `--teal` → `--navy-2` bottom), a sun disc (r 40px, gold) + soft halo at the horizon, faint horizontal glint; `CanvasTexture` with `EquirectangularReflectionMapping` → `PMREMGenerator.fromEquirectangular`. Two variants (night / dawn) cross-faded via `scene.environmentIntensity` and a material uniform swap. This gives gold and glass something real to reflect.
- **Post chain** (`postprocessing`): `RenderPass` → `EffectPass(MosaicEffect, BloomEffect{luminanceThreshold:.85,intensity:.35,radius:.6}, ChromaticAberrationEffect{offset:.0008}, NoiseEffect{premultiply:true, opacity:.06}, VignetteEffect{darkness:.55,offset:.35})`. Mosaic is a custom `Effect` (section C). Keep everything in ONE `EffectPass` where possible (pmndrs merges shaders).
- **Budgets**: ≤ 40 draw calls, ≤ 350k triangles, 2 render targets. Adaptive quality: sample frame time over 60 frames; if > 20 ms → DPR 1.25, bloom off, tesserae 12k→5k, ocean 256²→128²; if still > 24 ms → mosaic off. `prefers-reduced-motion`: time uniforms frozen except when scrolling (scroll = time), no idle precession. No WebGL: hide canvas, the SVG icons + Rothko CSS fields carry the site alone.
- **File layout suggestion**: `src/three/{Stage.ts, CameraRig.ts, palette.ts, env/ProceduralEnv.ts, objects/{SunDisc,Ocean,Tesserae,Constellations,OliveLeaves,Megaliths,SunRing,Veil,Raft,Storm,SkyDome}.ts, post/MosaicEffect.ts, shaders/*.glsl}`.

### B1 · Hero Sun Disc + corona + rays
- **Geometry**: `SphereGeometry(1.0, 96, 96)` at (0, 1.2, −12) world (behind the headline); corona `PlaneGeometry(6,6)` billboard at the same position; 48 ray quads `PlaneGeometry(0.06, 5)` rotated every 7.5°, additive, α .08 → .0 along length, in a `Group` that rotates .002 rad/frame.
- **Disc shader** (ShaderMaterial, `uTime, uWrath`):
```glsl
float r = length(vUv*2.0-1.0);
float limb = pow(max(1.0 - r*r, 0.0), 0.45);              // limb darkening
float gran = fbm(vNormal.xy*4.0 + uTime*0.05)*0.25;         // granulation
vec3 core = mix(vec3(1.0,.96,.84), vec3(1.0,.82,.40), smoothstep(0.0,.7,r));
vec3 rim  = mix(core, vec3(1.0,.48,.10), smoothstep(.6,1.0,r));
vec3 col  = mix(rim, vec3(1.0,.30,.05), uWrath*smoothstep(.3,1.0,r));
gl_FragColor = vec4(col*(limb+gran)*1.6, 1.0);              // >1 feeds bloom
```
- **Corona shader** (additive, `depthWrite:false`): `a = atan(p.y,p.x); r = length(p); streaks = fbm(vec2(a*3.0, r*2.0 - uTime*0.15)); glow = smoothstep(1.0,0.0,(r-1.0)/1.6)*(0.55+0.45*streaks)` × `--gold-pale`; `uWrath` multiplies streak speed ×3 and shifts colour to `--flame`.
- **Lights**: `PointLight(#ffd166, 40, 0, 2)` at the sun; `DirectionalLight(#ffe4b0, 2.2)` from sun toward origin (castShadow on desktop, 2048 map, PCFSoft); `HemisphereLight(#1d4a5c, #8c3a2b, .35)`.
- **Motion**: hero — disc rises y −1.2→1.2 over P 0–.06 with a slow "breath" (scale 1↔1.015, 6s); mouse parallax −2% (inverse of cursor). Chapter 01 — `uWrath` 0→1 over its first half; then B10's black disc eclipses it. Chapter 10 — rises again from below the ocean horizon in dawn palette, corona max.

### B2 · Ocean plane — Gerstner + fbm
- `PlaneGeometry(60, 60, 256, 256)` rotated −90° X at y=−1.5 (mobile 128²). One draw call.
- **Vertex** (four Gerstner waves, `vec4 wave = (dir.x, dir.y, steepness, wavelength)`):
```glsl
vec3 gerstner(vec4 w, vec3 p, inout vec3 T, inout vec3 B, float t){
  float k = 6.28318/w.w; float c = sqrt(9.8/k); vec2 d = normalize(w.xy);
  float f = k*(dot(d, p.xz) - c*t); float a = w.z/k;
  T += vec3(-d.x*d.x*w.z*sin(f), d.x*w.z*cos(f), -d.x*d.y*w.z*sin(f));
  B += vec3(-d.x*d.y*w.z*sin(f), d.y*w.z*cos(f), -d.y*d.y*w.z*sin(f));
  return vec3(d.x*a*cos(f), a*sin(f), d.y*a*cos(f));
}
// T=(1,0,0) B=(0,0,1); p += Σ gerstner(wave_i…); vNormal = normalize(cross(B,T));
```
  Wave tables — **calm**: (1,.3,.12,9), (−.6,1,.08,5.5), (.3,−.8,.06,3.2), (1,1,.04,1.6). **Storm**: steepness ×2.4, wavelength ×1.3, time ×1.6, direction rotating .05 rad/s. Mix by `uStorm` 0→1.
- **Fragment**: depth colour `mix(#0d2233, #1d4a5c, h)` then `mix(…, #2b5f73, crest)`; fresnel `pow(1−dot(n,v),3)` mixes in the env (sample `envMap` via `textureCube` of the PMREM, or a 3-stop sky gradient by view-dir y); sun specular Blinn-Phong shininess 400 in `--gold-pale` (hard glint) + shininess 24 at .15 (the wide sun path); micro-ripples via noise-derivative normal perturbation; foam `smoothstep(.55,.9,h)·noise` in `--cream`. `uNight` swaps sky to navy, sun to a star-white reflection column, and adds star sparkles (`step(.995, hash(n.xz·400 + t))`).
- Provide the same 4-wave function in TS (`oceanHeightAt(x,z,t)`) so the raft (B9) and debris ride the surface.
- **Chapter use**: hero calm + sun path; 01 storm (camera drops to y .3 near the surface); 03 dawn calm; 08 raft; 10 sunrise.

### B3 · Tesserae mosaic field (the signature 3D device)
- `InstancedMesh(PlaneGeometry(.08,.08), ShaderMaterial, 12000)` (mobile 4000). Instance attributes: `aTargetA/B/C` (vec3 ×3 layouts), `aStart` (vec3, scattered on a sphere shell r 6–9), `aColorA/B/C` (vec3), `aRand` (float).
- **Targets are rasterised from SVG**: draw the target SVG (A11 open hand; the MTF logo's Mediterranean outline; the word "SUN" in the display serif) onto a 160×90 offscreen canvas, read `getImageData`, and for each cell with α > .5 emit a target position on a slightly curved sheet (`z = −.15·(x²+y²)`, a shallow concave "apse") with the sampled colour quantised to the palette. Cell pitch = tile size / .85 so grout shows.
- **Vertex**: `pos = mix(aStart, target, easeOutQuint(clamp(uP − aRand*.35, 0, 1)))`; billboard the quad to the camera then add a per-tile tilt `rotateX/Y(noise(aRand, uTime*.2)*.25)`; scale ×(0.85 + .15·aRand). `target = mix(mix(aTargetA,aTargetB,uMorphAB), aTargetC, uMorphC)`.
- **Fragment**: `col = aColor*(.75+.25·ndotl)`; gold tiles (`aRand > .92`) get `col = gold`, spec `pow(max(dot(reflect(-L,n),v),0),60)·2.5`; all tiles get a **sweep glint** `smoothstep(.03,0,abs(dot(worldPos.xy, uSweepDir) − uSweep))·1.5` so a diagonal shine crosses the field as `uSweep` scrubs with scroll; bevel: darken .15 at the quad's edge via `smoothstep(0,.12,min(uv.x,uv.y,1−uv.x,1−uv.y))`.
- **Story use**: hero end — scattered → "SUN"; chapter 03 — "SUN" → the Mediterranean outline (Who is MTF); chapter 08 — outline → the open hand (fully assembled at the *LOVE IS THE HAND THAT OPENS* line); chapter 10 — hand dissolves upward into the sunrise (`uP` → 0 with `aStart` re-seeded above). Camera: field at z=−4, facing camera; ring (B7) can pass through it.

### B4 · Constellation particles + the descending star
- `Points` 2500 stars on a shell r=40 around the camera, upper hemisphere weighted (`y = |y|^.6`); attributes `aSize .5–3`, `aPhase`. Vertex: `gl_PointSize = aSize*(320/−mvPos.z)*(.85+.15·sin(uTime*1.7+aPhase))`; fragment: soft disc `smoothstep(.5,.2,d)` + a tiny cross for `aSize>2.4`; cream with ±4% warm/cool hue by hash.
- Constellation edges: `LineSegments` (cream α .35) built from the nine A3 vertex lists projected onto the shell; drawn via a `uDraw` uniform against a per-segment `aOrder` attribute (`discard` if `aOrder > uDraw`).
- **Collapse**: second position attribute `aCollapseTarget` = the One Star's position; `pos = mix(pos, aCollapseTarget, easeInCubic(clamp(uCollapse − (1−aSize/3)*.3, 0, 1)))`.
- **The One Star**: a `Sprite` (halo shader: `pow(1−d, 3)` gold + spikes) that at chapter 02→03 travels a `CatmullRomCurve3` from the sky (0, 14, −20) to the horizon (2, −1.4, −8) over .2 P, with a 24-sample trail (`Points` ring buffer, sizes decaying). It lands exactly where the 3D veil (B8) and the megaliths (B6) will appear.
- Chapter 07 re-shows Orion and the Bear only, and *extends* their edge segments (scale about the end vertex ×6, α .2) — the 3D twin of A8.

### B5 · Olive-leaf particles
- Leaf geometry: `ShapeGeometry` of the A7 lens (two quadratic curves), 8 segments; `InstancedMesh` 600 (mobile 200); custom `ShaderMaterial` `side: DoubleSide`, fragment `gl_FrontFacing ? olive : leafSilver` — turning silver is literal: the wind flips them.
- Vertex: instance rotation = base + `sin(uTime*1.3 + aRand*6.28)*.4` on X and `*.25` on Y (wind); slight bend `z += sin(uv.x*3.14)*.02`.
- **Drift** (chapter 05): leaves float across the frame right→left at 1.2 units/s with sinusoidal lift; **tree** (chapter 09): a low-poly tree — trunk `CylinderGeometry(.18,.32,2.6,7)` + 3 branch cylinders, `MeshStandardMaterial(#4b5a37, roughness .95)` with a vertex-noise gnarl; canopy = leaves placed on an ellipsoid (rx 1.8, ry 1.1, rz 1.4); **fall** (`uFall` 0→1): each leaf's y descends 3 units along a helical sway (`x += sin(uFall*9+aRand)*.3`), landing on the ground plane; one hero leaf falls first and turns black (`mix(col, press, uFall)`).

### B6 · Limestone megaliths (Ġgantija, Gozo)
- **Forms**: 7 uprights arranged as two apses (a horseshoe of 3 slabs each, radius 3.2, facing the camera) + a central altar block; a trilithon (two uprights + lintel `Box(3.6,.6,.8)`) as the entrance the camera dollies through. Slab = `RoundedBoxGeometry(1.6, 4.2, .7, 4, .18)` (examples/jsm) with vertex fbm displacement ×.08; each slab leans ±4° (real megaliths do); heights vary 3.4–4.6.
- **Material**: `MeshStandardMaterial({color:#d9b77a, roughness:.92, metalness:0})` + `onBeforeCompile`: triplanar fbm modulating albedo ±8% and roughness ±.1; horizontal bedding `1 − .04·step(.5, fract(worldPos.y*4.5))`; upper-face pitting from cellular noise (Voronoi F1 < .12 → darken .25) — globigerina honeycomb weathering. Receives the warm directional sun (low angle for long shadows); ground = a `CircleGeometry(20)` in `--sand` at exposure .6 or the ocean plane where the island meets the sea.
- **Motion**: chapter 03 — slabs rise from the ground (y −4→0, easeOutQuint, stagger .04) as "Gozo emerges"; camera passes through the trilithon; the descended star (B4) hovers inside the apse and becomes the veil (B8). Stewardship pillar — the stones hold still while the ring (B7) hovers above them (heritage under the sun).

### B7 · The Sun Ring — glass and gold (the futuristic hero object)
- Three arcs of 120° on a `TorusGeometry(1.6, .22, 64, 256)` (build each with the `arc` parameter and rotate): **S** arc = gold `MeshPhysicalMaterial({color:#d9a441, metalness:1, roughness:.16, clearcoat:.6, clearcoatRoughness:.2, envMap})`; **U** arc = glass `MeshPhysicalMaterial({transmission:1, thickness:1.2, roughness:.06, ior:1.45, iridescence:.35, iridescenceIOR:1.3, attenuationColor:#ffd166, attenuationDistance:2.5, envMap})`; **N** arc = glass with `attenuationColor:#8fb37a` (net-positive green-gold). Seams: three tiny gold `CylinderGeometry` caps. Inner light ring `TorusGeometry(1.6,.018,16,256)` emissive `--gold-pale` ×3 (feeds bloom). Dial ring: 72 instanced tick boxes `Box(.02,.08,.02)` on r=2.1 rotating opposite to the ring. 11 node spheres `Sphere(.045)` gold on the ring for the 11-for-11 chapter (each glows when its sector is hovered in U2).
- **Motion**: idle precession `rotation.x = .35 + sin(t·.2)·.08`, `rotation.y += .0025/frame`; mouse tilt ±6°. Hero: ring far (z=−9, small, catching sun glints). Chapter 04 (Unity): ring dollies to (0,0,0), camera z 8→3.5 with azimuth −20°→+15° over the chapter; each pillar's copy beat rotates the ring so its arc faces the camera and lifts that arc's emissive (`emissive` gold ×1.5 for S; for glass arcs, raise `attenuationDistance` = brighter). Chapter 08: the ring passes through the tesserae hand (B3) and its glass refracts the tiles — the one "wow" refraction moment; keep `transmission` samples default (r185 handles it in one extra pass).
- Cost: transmission triggers a scene render to a transmission RT — only enable glass while the ring is on screen (`material.transmission = 0` and swap to a cheap `MeshStandardMaterial` otherwise).

### B8 · The Veil (3D)
- `PlaneGeometry(6, 4, 120, 80)`, `ShaderMaterial` double-sided, transparent. Vertex: `z += fbm(uv*3 + uTime*.1)*.35 + sin(uv.x*10 + uTime)*.05`, gravity sag `y −= (1−uv.y)²·.3`, drape from top edge. Fragment: `--sand` α .35, fresnel rim `--gold` α .5, hairline grid `step(.97, fract(uv*40))` at α .12, back-lit: add `pow(max(dot(sunDir, n),0),2)·.4`. Blending normal, `depthWrite:false`, render after opaque.
- **Tear** (`uTear` 0→1): fragment `discard` where `abs(uv.x − .5 + noise(uv.y*6)*.05) < uTear*.02`; vertex `x += sign(uv.x−.5)*uTear*1.5` past the tear so the halves part. Twin of A4.

### B9 · The Raft (3D)
- 5 planks `Box(2.4,.12,.36)` wood `MeshStandardMaterial(#8c5a3a, roughness .85)` + `onBeforeCompile` grain stripes `sin(worldPos.x*40 + fbm*6)·.06`; 2 battens; mast `Cylinder(.04,.05,2.2)`; sail `PlaneGeometry(1.4,1.2,20,16)` cloth sine in vertex (`z += sin(uv.y*6+uTime*2)*.05*uv.x`), `--sand` double-sided; rope lashings = four small `TorusKnotGeometry(.08,.02,64,8,2,3)` in `#d9a441` roughness .7.
- Debris → raft: planks start as flotsam riding `oceanHeightAt()` (pitch/roll from the surface slope: sample height at ±.5 in x/z), then lerp to raft configuration over chapter 08's first half; the assembled raft then rides the surface as one rigid body (sample at its centre). It departs to the right (x 0→9) while the camera stays with the shore.

### B10 · Storm (chapter 01)
- Eclipse: `CircleGeometry(1.15, 96)` in `--press` (MeshBasicMaterial) sliding across the sun disc (x −4→0 over the chapter's second half) — Kandinsky "Several Circles" as event.
- Lightning: `Line2`/`LineSegments2` (examples/jsm fat lines) bolt of 6 segments re-randomised per strike (jitter ±.4), emissive `--cream` ×4 + `PointLight(#e2eeff)` intensity 0→200→0 over 180 ms, 3 strikes triggered at local p .42/.47/.55 (scroll-triggered, not timers, so it is deterministic). Rain: 3000 `LineSegments` 0.25 long falling at 12 u/s — desktop only.
- Ocean `uStorm` 0→1; fog `FogExp2(#071a2b, .06)`; camera drops to y .4 and rolls ±2°.

### B11 · Sky dome, fog, motes
- `SphereGeometry(80, 32, 16)` `BackSide` gradient shader: three stops keyed by `uDawn` (night `--navy`→`--teal`; dawn `--gold-2`→`--sand`→`--teal`), sun glow `pow(max(dot(dir, sunDir),0),24)·gold`. Fog: night `FogExp2(#071a2b,.035)`, dawn `Fog(#f3e3c3, 8, 40)`. Dust motes: `Points` 400 within 3 units of the camera, drifting, α .25 — depth cue for free.

### B12 · Camera & chapter table (world units; sun at (0,1.2,−12); ocean y=−1.5; ring/hand at origin; megaliths at (0,−1.5,−4))

| Ch | Camera pos → | Target | fov | Visible | Light / env | Mosaic (C) `uAmount` |
|---|---|---|---|---|---|---|
| 00 | (0,.6,9) → (0,.4,7) | (0,.8,−12) | 38 | Sun, ocean calm, ring far, stars faint | night env, sun point | 1 → 0 (mosaic dissolves radially from the sun over P 0–.05) |
| 01 | (0,.4,6) → (.8,.3,4) roll ±2° | sun | 42 | Sun (wrath), ocean storm, eclipse disc, lightning, rain | flashes | 0, spikes to .6 for 120 ms on each strike |
| 02 | (0,1,4) → (0,2.4,3) tilt up 25° | sky | 50 | Stars, constellations, One Star descent, calm night ocean | starlight only | 0 |
| 03 | (0,.2,10) → through trilithon → (0,.2,1) | apse centre | 36 | Megaliths rise, veil, tesserae "SUN"→Med outline | dawn env fade-in, long shadows | .35 (opus vermiculatum, tiles follow the stones) |
| 04 | (3,1,8) → (−1,.5,3.5) azimuth sweep | ring | 34 | Ring centre, LeWitt lines (DOM/SVG), tesserae behind | dawn env | 0 |
| 05 | (0,.8,7) slow dolly | horizon | 40 | Dawn ocean, leaves drifting, sun mid-sky | dawn, exposure 1.15 | .25 with Rothko fields showing through grout |
| 06 | static (0,1.4,6) | (0,0,0) | 38 | Ring tilted 55° as a sundial (its 72 ticks), 11 nodes | dawn → dusk sweep over the chapter | 0 |
| 07 | (0,.6,5) → (0,2,4) tilt up | Orion | 46 | Stars return, Orion + Bear extended lines, veil tear | night, cold | 0 |
| 08 | (0,.5,7) → (2,.8,5) | hand | 38 | Tesserae hand assembling, ring passing through, raft departing right | dawn | 0 → .5 → 0 (the frame becomes mosaic as the hand assembles, then clears) |
| 09 | (0,.9,6) | tree | 36 | Black stage, olive tree, leaf fall, One Star | single warm key from the star | 0 |
| 10 | (0,.6,8) → (0,1.4,10) pull back | sun | 40 | Sunrise, dawn ocean, hand→horizon, stars multiplying | dawn max | 1 at the very end (the final frame freezes into a mosaic — the site's last image is a mosaic sunrise) |

Transitions between chapters use a 12–18% overlap; objects fade via material `opacity`/`uFade` — never a hard cut except the two `steps()` moments (I AM ULYSSES, I am Homer).

---

## C. The mosaic post-process (tesserae tessellation of the frame)

### C.1 Concept
Screen-space "opus tessellatum" (jittered-grid Voronoi tesserae) with optional "opus vermiculatum" (tiles follow a flow field around subjects, as Roman mosaics wrap figures). Grout lines in stage black, per-tile tone variation, bevelled edges and gold tiles with a travelling specular glint. `uAmount` blends between the live render and the mosaic; a **reveal mask** lets the frame *become* mosaic from a point (the sun) outward or dissolve back — the site opens and closes on this.

### C.2 Maths sketch
- Scale uv into cell space with aspect correction: `p = R(θ) · (uv · (aspect,1)) · N` where `N` = tiles across the height (desktop 56, mobile 34 — tile ≈ 16px at 1440×900; grout 1.5 px).
- Jittered Voronoi: for the cell `g = floor(p)` and its 8 neighbours, site `s = g + o + .5 + (hash2(g+o) − .5)·J` (`J` = .45). Keep the nearest (`d1`, `site`) and second-nearest (`d2`). **Edge function** `e = d2 − d1` is 0 on the grout centre-line and grows into the tile → grout where `e < G` (G = .12 cell), bevel darkening via `smoothstep(0,.22,e)`.
- Tile colour = scene sampled **at the site** (one colour per tile), optionally quantised toward a 12-level palette to get the poster look; ±7% luminance per tile from `hash(site)`.
- Flow field (vermiculatum): `θ(uv) = (vnoise(uv·2) − .5)·F`, F ≈ 1.2 rad; the inverse mapping for sampling is `siteUV = (Rᵀ · site / N) / (aspect,1)`. (θ is evaluated at the pixel, not the site — the tiny inconsistency reads as hand-set tiles. If it bothers you, evaluate θ at `site/N` in a second pass.)
- Gold tiles: `hash(site) > .93`. Per-tile tilt normal `n = normalize(vec3((hash2(site+3.1) − .5)·.6, 1))`; light direction rotates with `uSweep` (scroll-driven) so `spec = pow(max(dot(reflect(−L,n),V),0),48)` sweeps across the frame: gold ×2.2, other tiles ×.18.
- Reveal: `amount = uAmount · smoothstep(uR + .12, uR − .12, distance(uv·asp, uCenter·asp))` (radial from the sun) or a −30° diagonal wipe `smoothstep(uW+.1, uW−.1, dot(uv·asp, dir))`.

### C.3 GLSL (drop into `src/three/post/mosaic.frag`; wrap in a pmndrs `Effect` whose `mainImage(inputColor, uv, outputColor)` calls this)
```glsl
uniform vec2  uRes; uniform float uAmount, uCells, uGrout, uJitter, uSweep, uQuant, uFlow, uReveal;
uniform vec2  uCenter;
vec2  hash2(vec2 p){ p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))); return fract(sin(p)*43758.5453); }
float hash1(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
float vnoise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash1(i),hash1(i+vec2(1,0)),f.x),mix(hash1(i+vec2(0,1)),hash1(i+vec2(1,1)),f.x),f.y); }

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor){
  vec2 asp = vec2(uRes.x/uRes.y, 1.0);
  float ang = (vnoise(uv*2.0)-0.5)*uFlow;
  mat2 R = mat2(cos(ang),-sin(ang),sin(ang),cos(ang));
  vec2 p = R*(uv*asp)*uCells;
  vec2 g = floor(p); float d1=8.0, d2=8.0; vec2 site=g;
  for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){
    vec2 o=vec2(float(x),float(y));
    vec2 s=g+o+0.5+(hash2(g+o)-0.5)*uJitter;
    float d=length(p-s);
    if(d<d1){ d2=d1; d1=d; site=s; } else if(d<d2){ d2=d; }
  }
  float e = d2-d1;                                            // 0 on grout centre-line
  vec2 siteUV = (transpose(R)*(site/uCells))/asp;             // inverse map to screen
  vec3 tile = texture2D(inputBuffer, siteUV).rgb;             // one colour per tessera
  tile = mix(tile, floor(tile*uQuant+0.5)/uQuant, 0.6);       // poster quantise
  float h = hash1(site);
  vec3 n = normalize(vec3((hash2(site+3.1)-0.5)*0.6, 1.0));
  vec3 L = normalize(vec3(cos(uSweep), sin(uSweep), 1.2));
  float spec = pow(max(dot(reflect(-L,n), vec3(0,0,1)),0.0), 48.0);
  bool gold = h > 0.93;
  tile = gold ? mix(tile, vec3(1.0,0.82,0.40), 0.85) : tile;
  tile *= 1.0 + (h-0.5)*0.14;                                 // hand-set tone variation
  tile += spec * (gold ? 2.2 : 0.18);                         // glint
  tile *= smoothstep(0.0, 0.22, e);                           // bevel
  float grout = 1.0 - smoothstep(uGrout*0.5, uGrout*0.5+0.02, e);
  vec3 mosaic = mix(tile, vec3(0.043,0.039,0.035), grout);    // press black grout
  float reveal = smoothstep(uReveal+0.12, uReveal-0.12, distance(uv*asp, uCenter*asp));
  outputColor = vec4(mix(inputColor.rgb, mosaic, uAmount*reveal), inputColor.a);
}
```
Defaults: `uCells 56, uGrout .12, uJitter .45, uQuant 12, uFlow 1.2, uSweep` = `P·6.28`, `uReveal` from 0 → 2 (in aspect units) over the hero. Cost: 9 taps of hash + 1 texture fetch per pixel = cheap; runs inside the merged `EffectPass`.
- **Cheaper variant** (mobile): drop Voronoi — square tiles with rotation jitter: `p = R(hash·.4) · fract(uv·N)`, edge `e = min(p.x,p.y,1−p.x,1−p.y)`; same shading.
- **DOM/CSS fallback** for non-WebGL hero: an SVG `pattern` of grout lines (`--press` 1.5px, 16px pitch, rotated 3°) as an overlay with `mix-blend-mode: multiply` over the Rothko field + a second pattern of 8% gold squares with `mix-blend-mode: screen`.

---

## D. Modern-art moves (how the mythic stays futuristic)

**D1 · Bauhaus / Kandinsky — the grammar of primitives.** Circle = sun, triangle = sail, square = stone. Every chapter opens on a "poster grid": 12-column, one giant primitive (≥ 40% of the viewport), one hairline rule, one mono label — nothing else (Bauhaus posters, not Bauhaus clutter). The storm is literally a black circle eclipsing a gold circle (B10). Moholy-Nagy transparency: where two silhouettes overlap (Calypso teal × sun gold) use `mix-blend-mode: multiply` so a third colour (olive) appears — an honest overlap, never a drop shadow.

**D2 · Matisse cut-outs ("Jazz", "The Sheaf").** All figures, leaves and hands are scissor-cut paper: no outlines, slightly irregular edges (`feTurbulence baseFrequency .04` + `feDisplacementMap scale 2–3` on the clip source), a 2px paper shadow (`filter: drop-shadow(0 2px 0 rgba(0,0,0,.12))`) on cream grounds only, and a visible **pin** (a 3px `--ink` dot) at one anchor point. Cut-outs never rotate wildly: they *slide and settle* (translate + ≤ 4° rotate, easeOutQuint). Speaker portraits (when photos exist) sit inside cut-out arches or leaf shapes as `clip-path`, duotone via `mix-blend-mode` over a `--teal`/`--sand` field.

**D3 · Rothko colour fields.** Each chapter's background = 2–3 stacked soft-edged rectangles in the chapter's emotion colours, edges blurred (`filter: blur(60px)` on divs or `feGaussianBlur 40` in SVG), grain overlay 5%, fields inset 6–8% from the viewport edges (Rothko never touches the frame), tone-on-tone with a luminous halo on the top field. Field recipes: Destiny navy/black · Loss ink with a thin terracotta band · Healing teal → sand · Joy gold/terracotta/ramla · Time seasonal quartet · Fear deep red `#5a1f18` over black · Jealousy cold teal & black · Letting go cream & gold · Life dawn (`--gold-2` → `--sand` → `--teal`). In 3D the same fields are the sky-dome stops (B11) so DOM and WebGL agree.

**D4 · Sol LeWitt wall drawings — rules, not pictures.** Connective tissue between chapters is generated line systems from written instructions, e.g. *"Lines from the centre of the sun to 60 points on a grid"* (chapter 04 Unity — connection), *"Arcs from the four corners, 24 each, not touching"* (speakers grid background), *"Not-straight lines, from the left edge to the right, 40, in cream"* (the sea between sections), *"All combinations of two lines crossing"* (11-for-11 board). Implementation: a `lewitt.ts` that takes `{rule, seed, n, color}` and returns SVG; hairlines .75px `--cream`/`--gold` on press black or `--ink` on paper; they draw in on scroll (pear's `ruleH/ruleV/draw` language). Every visit uses a fixed seed per section so it is stable, with `?seed=` for variation.

**D5 · Bridget Riley op-art for the veil and water.** Two `repeating-linear-gradient` line layers at 2° offset, one animated (`background-position`), produce a moiré that breathes — used as the mobile veil (A4 fallback) and as the "sun path on water" behind copy.

**D6 · The instrument layer (this is what keeps it 2026).** Mono coordinates (`36.0451° N 14.2470° E` Ramla; `35.9375° N 14.3754° E` Malta), a live Malta clock (CET), scroll percent, chapter index (`CANTO 07 / 10`), 72-tick rulers, corner crosshairs, the SUN-sigil progress dial (U1), hairline frames around every folk-art icon, glass and gold materials (B7), and a per-visit seed shown as a tiny mono string. Folk art inside an instrument = archive meets observatory.

**D7 · Ellsworth Kelly title cards & Agnes Martin grids.** Chapter title cards = one hard-edged shape alone on the field (a red Ramla crescent on cream; a black circle on gold). Paper sections (programme, speakers, hotels) carry a faint 24px pencil grid (`--rule-dark` at 6%) for order.

**D8 · Mosaic as the bridge.** Mosaic is both the Domus Romana floor in Rabat and the pixel; the post-process (C) and the tesserae field (B3) make that equation explicit. Rule: the site *enters* as mosaic (hero dissolve) and *exits* as mosaic (final frame freezes), and every "meaning" (SUN → Mediterranean → open hand) is a re-assembly of the same tesserae.

---

## E. OPTIONAL upgrade layer — image/video generation prompts (spend credits later)

Rules for all: **the procedural version stays as the fallback and the loading state**; generated assets are dropped in behind/inside the same frames. Style lock string to append to every image prompt: `flat geometric folk-art illustration, faceless silhouetted figures, limited palette: cream #f3e3c3, deep teal #1d4a5c, terracotta #8c3a2b, gold #d9a441, flame orange #ff7a1a, ink navy #0d2233; vintage editorial print texture, paper grain, storybook composition, vast negative space, long diagonal lines, no outlines, Mediterranean myth, modern-art poster`. Universal negative: `text, letters, watermark, signature, realistic faces, photoreal, 3D render, plastic, glossy, anime, extra limbs, clutter, busy background, gradients banding, frame, border`. Deliver WebP/AVIF, ≤ 350 KB per still, 24-bit + alpha where noted; videos H.265/WebM VP9, ≤ 8 MB, loopable.

| # | Asset & placement | Ratio / size | Model | Prompt (add style lock) | Negative (add universal) |
|---|---|---|---|---|---|
| E1 | **Hero plate** behind the headline (replaces nothing — sits between B2 ocean and the type; the mosaic dissolve reveals it) | 16:9 3840×2160 + 9:16 1080×1920 | Flux 1.1 Pro / Midjourney v7 `--ar 16:9 --style raw` | Vast Mediterranean at night from a low shore, a single enormous flat gold sun disc half-risen on the horizon with seven thin concentric rings, calm sea drawn as a few thin horizontal cream lines, everything else empty ink-navy paper | sky clutter, clouds, boats, realistic water |
| E2 | **Helios' cattle frieze** (chapter 01, wide band under the copy; replaces A1's cattle row on desktop, A1 stays on mobile) | 5:1 5000×1000 | Flux / MJ `--ar 5:1` | A frieze of seven identical flat terracotta cattle silhouettes walking right along a thin cream line, each with a small gold sun mark on its flank, under a flame-orange sun ring, cream ground | perspective, shading, grass, realism |
| E3 | **The ship breaks** (chapter 01 title card) | 3:2 3000×2000 | MJ v7 | A single flat navy ship seen side-on splitting into nine wedge-shaped planks along lines radiating from one point in the sky, a cream zig-zag bolt, six small cream figures falling, ink-navy paper, huge empty sky | fire, smoke, dramatic clouds, realistic sea |
| E4 | **The descending star** (chapter 02, video loop behind the copy; replaces A3's trail only) | 9:16 1080×1920, 8 s loop | Kling 2.x / Veo | Slow vertical drift of a single gold star with faint diffraction spikes descending through an ink-navy sky of tiny cream stars, thin constellation lines fading, no camera move, seamless loop, flat illustration style | fast motion, lens flare, clouds, realism |
| E5 | **Ogygia / Gozo** (chapter 03 venue plate; replaces A5's mesas; A5's cave-eye and Ramla overlay remain SVG on top) | 21:9 4200×1800 | Flux / MJ `--ar 21:9` | Gozo as stepped flat-topped honey-limestone mesas with thin horizontal bedding lines, a red-sand crescent bay at the left, a dark almond-shaped cave above it, five lollipop olive trees, calm teal sea as three thin lines, dawn cream sky | tourists, buildings, roads, realism, photographic |
| E6 | **Calypso** (chapter 03/04 figure, keyed cut-out) | 2:3 2000×3000, alpha | Flux Kontext / Ideogram (solid `#00ff00` background then key) | A flat teal faceless woman silhouette with a large black hair shape flowing to one side like a flag, gold necklace and armlets, arms slightly open, standing, paper cut-out edges, on a plain flat green background | face, eyes, hands detail, dress folds |
| E7 | **Ulysses on the raft** (chapter 08 side plate) | 3:2 | MJ v7 | A small flat terracotta faceless man standing on a raft of five planks with a cream triangular sail, tiny against a vast cream sea drawn as a few lines, a gold star above the horizon at the right edge | sea monsters, waves, realism |
| E8 | **The veil** macro (chapter 03 behind copy, video) | 16:9 1920×1080, 10 s loop | Kling / Runway Gen-4 | Slow-motion sheer cream silk with a faint gold grid drifting across an ink-navy void, backlit, nothing else, seamless loop | body, hands, wind machine look, realism of skin |
| E9 | **Tesserae texture** (source for B3 colours and C grout look; tileable) | 1:1 2048, tileable | Flux (`tileable`) / Recraft | Top-down Roman mosaic of small gold, terracotta, teal and cream stone tesserae with dark grout, hand-set irregular grid, matte stone, seamless tile | shine, wet look, perspective, figures |
| E10 | **Honey limestone** PBR (B6 albedo/roughness; tileable) | 1:1 2048, tileable | Flux / Recraft | Seamless globigerina limestone wall texture, honey colour, horizontal bedding, honeycomb weathering pits, matte, flat lighting | moss, graffiti, bricks, mortar, shadows |
| E11 | **The olive tree** (chapter 09 plate) | 2:3 | MJ v7 | A single flat olive tree with an olive-green canopy of lens-shaped leaves, half of them silver, on a black void, one leaf falling, a single small gold star above | ground, grass, landscape, realism |
| E12 | **Homer** (chapter 09 cut-out) | 2:3, alpha | Flux Kontext / Ideogram | A flat cream faceless old man silhouette holding a tall gold staff, cloak falling from his shoulders to the ground in two black triangular halves, plain flat green background | beard detail, face, eyes, sandals |
| E13 | **The open hand mosaic** (chapter 08/10 hero image; replaces A11 state B if credits allow) | 1:1 3000 | MJ v7 / Flux | An open human hand, palm forward, fingers gently splayed, made entirely of small gold, terracotta and teal mosaic tesserae with dark grout, glowing gold at the palm centre, on a black void, modern-art poster | fingers realism, skin, jewellery, rings, wrist detail |
| E14 | **Sunrise across three screens** (footer video) | 32:9 3840×1080, 12 s | Kling / Veo | A flat gold sun rising slowly over a calm Mediterranean drawn as thin cream lines, ink-navy sky turning cream, stars fading, no clouds, seamless, flat folk-art illustration | lens flare, clouds, birds, boats, realism |
| E15 | **Speaker portrait treatment** (style instruction, no generation) | 1:1 800 | Flux Kontext (img2img) | Convert the supplied portrait into a flat two-tone cut-out: cream face-shape silhouette on a teal field, no facial features, keep the hairline and shoulder shape, paper grain | facial features, gradients, photo |

Placement note: every generated still enters through the same **instrument frame** and the same mosaic dissolve, so the site reads as one hand even where credits were spent.

---

## F. Hand-off checklist for the coding agents

1. Tokens first: `tokens.css` + `palette.ts` from §0.2; no hex literals elsewhere.
2. Build `sprite.svg` with the shared symbols (§A.0) and the `grain`, `veilWarp`, `glow` filters; every icon imports from it.
3. Each icon = a module exporting `mount(el, opts) → {setProgress(p), tick(t), destroy()}`; a GSAP `paused` timeline built once; `pathLength="1"` on all drawn paths.
4. Three: `Stage.ts` owns renderer, composer, `CameraRig`, chapter groups; objects expose `update(P, t)`; the chapter table (§B12) lives in `chapters.ts` as data, not code.
5. Mosaic `Effect` (§C.3) first — it is the site's signature; test at `uAmount 1` on the hero before anything else.
6. Ocean height function duplicated in TS (`oceanHeightAt`) and unit-checked against the shader by rendering one frame with a debug plane.
7. Reduced-motion and no-WebGL paths are first-class: the SVG icons + Rothko fields must make a beautiful site alone.
8. Performance gates: 60 fps at DPR 1.5 on an M1 MacBook Air, 40 fps on an iPhone 13 at DPR 1.25; adaptive downgrades from §B.0 wired before launch.
9. QA the story: scrub the whole page at 2% steps — every chapter must land on a *composed* still (Bauhaus poster rule), never a mid-tween mess.
