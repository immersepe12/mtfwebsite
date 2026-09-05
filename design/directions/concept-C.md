# CONCEPT C — "THE LONG TAKE"
### Creative Director C · lens: PEAR-PURIST-CINEMA
### MTF11 · Mediterranean Tourism Forum 2026 · 11th edition · 25–27 November 2026 · Malta · "Mediterranean SUN"

Status: design concept v1 · 2026-09-05 · built on `/design/research/*` and `/brief/*` (ground truth).
Stack assumed: Vite 8 + TypeScript + Three.js r185 + postprocessing + GSAP ScrollTrigger/SplitText + Lenis (tech-spec.md).
Everything below is buildable by a team of coding agents in one day **because the asset list is tiny** — that is the whole point of this direction.

---

## 1. THE BIG IDEA

**Name: THE LONG TAKE.**

The site is one uncut shot. The camera is on the Mediterranean at the moment the sun touches the horizon (Helios, "the Sun fills the screens"), and over ~40,000 px of scroll it never cuts: it sinks toward the water, tilts up to a sky full of stars, follows one star down to an island, turns a full circle to read the four horizons, threads through a net, goes black once, and rises again as the tenth dawn breaks and the sun comes back up through the type — the same sun the visitor saw in the first frame. A mono clock in the corner runs from **16:56 · SUNSET** to **06:51 · SUNRISE** (Malta, 25 Nov 2026; verify with a solar calculator at build). The story of the star, the island, the veil, the net and the open hand is told by the same Storyteller as the gala, in cream serif on deep ink, and the Forum — dates, three days, 11 for 11, the four events, MED READY, the gala, the speakers, the registration — is what the story turns out to have been about. There is no cattle scene, no island model, no compass object, no olive tree, no raft set-piece. There is a sky, a sea, a horizon, one star, and type. The myth is allowed on screen exactly **four times** as something physical — the shadow frieze at sunset, the star, the shatter, the open hand — and the mosaic is allowed exactly four times too. Because they are rare, they land like a blow.

**The one sentence a visitor should feel:**
*"I have been on the water all night, and someone I trust was talking to me the whole time."*

**Why this lens wins the brief.** pear.no's authority comes from what it refuses to do. The client asked for "sheer pure quality of pear.no" *and* "super mosaic, audacious". Most teams will read that as "pear.no plus more stuff". This direction reads it as: keep pear.no's monastic system, and spend the entire audacity budget on **one continuous camera move** (no conference site has ever been one shot) and **four precious moments** (the shatter and the open hand are as violent and as beautiful as anything in the folk-art reference — they just happen once). Restraint is the luxury; the mosaic is the jewel it is set in.

**Three rules that everything else follows from**
1. **One shot.** One `section.stage > div.pin`, one camera, one spline, no cuts except the single true black at "I am Homer".
2. **Two materials.** Everything physical in the world is either **shadow** (flat ink silhouettes backlit by the sky — Mediterranean shadow theatre, Karagiozis) or **gold** (tesserae). Nothing is ever textured, lit, or photoreal.
3. **Four and four.** Four shadow moments (frieze, star, net, raft), four mosaic moments (loader star, shatter, open hand, dawn path). Anything else that wants to be a "3D object" becomes a hairline, a mono label, or a line of type.

---

## 2. TYPOGRAPHY & PALETTE

### 2.1 Type — "Fraunces + Geist + Geist Mono" (hybrid of research Systems A and B, chosen for one reason each)

| Role | Family / settings | Why |
|---|---|---|
| Display serif (hero, chapter heads, stats) | **Fraunces** · wght 300 · opsz 144 (pinned on hero) · SOFT 0 · WONK 0 | Categorically what Flecha is: sharp old-style, optical sizes, a light weight that stays crisp at 120 px in cream on ink. |
| Storyteller voice (script lines) | **Fraunces Italic** · wght 300 · WONK 1 · SOFT 12 | The only place WONK is on. The hand in the letter is Homer's voice. |
| Body / Forum voice | **Geist** · 400 (500 emphasis) | Geist and Geist Mono are one drawing — the pear.no GT Standard L / GT Standard Mono sibling relationship. Instrument Sans is lovelier alone but is not the mono's sibling; the chips must sit *inside* the body voice, not beside it. |
| Labels, chips, clock, rail, indices | **Geist Mono** · 400 (500 at ≤10 px on ink) · uppercase · tracking .2em · `tnum` | The instrument layer. |
| Fallback stack | "Fraunces","Fraunces Fallback"(size-adjust 104%),"Source Serif 4",Georgia / "Geist","Helvetica Neue",Arial / "Geist Mono",ui-monospace,Menlo | CLS ≈ 0; Source Serif 4 is pear.no's own Flecha fallback. |

Self-hosted woff2, latin + latin-ext (Ċ Ġ Ħ Ż), `font-display: block` on the serif with preload, `swap` on Geist/Geist Mono. `font-optical-sizing: auto`; `"opsz" 144` pinned on the hero only. `text-wrap: balance` on titles, `pretty` on body. No uppercase serif anywhere. No variable-axis animation anywhere **except two beats**: the hero's `wght 200→300` on load (ink arriving, 1.2 s) and `SOFT 0→40→0` on the storyteller line during the veil (Ch 04→05 and Ch 08). That is the purist's whole allowance.

**Scale (rem = 16px)** — from design-language.md, with one addition for the knockout word:

```css
:root{
  --t-sun:     clamp(6.5rem, 26vw, 24rem);   /* the word SUN only; lh .82; ls -.04em */
  --t-hero:    clamp(3rem,   8.5vw, 7.5rem);  /* lh .96; ls -.028em  — "Mediterranean", "I lived." */
  --t-display: clamp(2.25rem,5vw,   4.5rem);  /* lh 1.02; ls -.022em — chapter headlines */
  --t-chapter: clamp(1.75rem,3.2vw, 3rem);    /* lh 1.08 — second-movement heads */
  --t-sub:     clamp(1.25rem,1.9vw, 1.75rem); /* lh 1.18 — storyteller lines, card titles */
  --t-lead:    clamp(1.125rem,1.4vw,1.375rem);/* lh 1.4  — forum leads */
  --t-body:    clamp(.9375rem,1.05vw,1.0625rem); /* lh 1.55 */
  --t-small:   clamp(.8125rem,.95vw,.875rem);
  --t-label:   clamp(.5625rem,.66vw,.6875rem);/* 9→11px; ls .2em */
  --t-index:   .5625rem;                       /* 9px; ls .24em — rail, nav indices, clock */
  --measure-body: 52ch; --measure-lead: 30em; --measure-title: 11em; --measure-hero: 8em;
}
```

Storyteller lines are always short, one idea per line, left-aligned at `left: 7%`, never centred (centring is reserved for the *emblema* moments: the sun, the hand, the star). Forum copy is never wider than 52ch. Eyebrows are mono chips; every eyebrow is preceded by its chapter index (`04 —`).

### 2.2 Palette — Palette A "Ogygia", reduced

The lens collapses the system to what a night at sea actually contains. Tokens (hex) are the research palette; the *usage* is the direction.

```css
:root{
  /* stage — the sea at night, never grey, never pure black except once */
  --press:      #090D16;  /* the pin background; night-sea black */
  --abyss:      #06192B;  /* below the horizon */
  --sea:        #0E3D57;  /* chapter grounds, nav veil base */
  --sky:        #0F5A80;  /* the blurred-light sky at dusk/dawn edges */
  --lagoon:     #2B8FA3;  /* glints only; never text */
  --black:      #000000;  /* used ONCE: Chapter 12 */
  /* type on dark */
  --cream:      #FFF7E1;  /* primary type on the stage (18.18:1 on press) */
  --star:       #FFF9EA;  /* hairlines, points, crosshairs */
  --paper-75:   color-mix(in oklab, #F3EEE3 75%, transparent); /* secondary (9.58:1) */
  --paper-55:   color-mix(in oklab, #F3EEE3 55%, transparent); /* tertiary (5.56:1) */
  /* the one light chapter (06 Paradise) + satellite/print mode */
  --paper:      #F3EEE3;  --sand: #E8DCC2;  --stone: #D6C39C;
  --ink:        #1B1A17;  --ink-soft: #3B3934;  --terra: #8C3A2B; /* the only red allowed as text on paper (6.59:1) */
  /* gold is a range, never a flat */
  --gold-leaf:  #F1C86A;  --gold: #D9A441;  --gold-deep: #A67C2E;
  /* narrative only — never UI */
  --ramla:      #B44A2D;  --flame: #FF7A1A;  --flame-hot: #FFD166;  --olive-silver: #A9B39C;
  /* derived */
  --rule-dark:  color-mix(in oklab, var(--star) 22%, transparent);
  --rule:       color-mix(in oklab, var(--ink) 14%, transparent);
  --cross:      color-mix(in oklab, var(--star) 53%, transparent);
  --chip:       color-mix(in oklab, var(--star) 14%, transparent);
  --veil:       color-mix(in oklab, var(--sea) 58%, transparent);  /* nav overlay + backdrop-filter blur(26px) saturate(1.15) */
  --grain:      .06;
}
```

**Temperature arc of the film (the sky shader's own timeline):**
`01 flame→gold at the horizon on sea-navy ▸ 02 ember, thunder-navy flash ▸ 03 abyss + starlight ▸ 04 abyss with one gold point, a warm lamp on the island ▸ 05 sea-navy with gold hairlines ▸ 06 PAPER — the single daylight chapter ▸ 07 sky cycling fast, desaturating ▸ 08 abyss, brass hairlines ▸ 09 cold sky-blue → gold ▸ 10 sea-navy, olive-silver ▸ 11 ink + cream lines, then gold ▸ 12 #000 ▸ 13 abyss → first grey of dawn ▸ 14 flame → gold → cream sunrise`

Rules: gold is never body text on paper; ramla/flame/olive-silver are colours of things in the story, never of interface; there is no grey in the system — every neutral is stone or water. Film grain at `.06` over the stage at all times (animated at 24 fps in the post pass). This is what makes procedural light look photographed.

---

## 3. THE WORLD (what actually exists in 3D — the whole list)

| Object | Built as | Draw calls | Lives |
|---|---|---|---|
| **Sky** | Fullscreen far quad, `sky.glsl`: 3-stop gradient (zenith/horizon/ground) × dawn/dusk/night, sun-side scatter, nebula fbm at night. **Rendered at 0.5× resolution and upscaled** — the blur is real, not faked (pear.no's blurred-photo look, procedurally). | 1 | always |
| **Sea** | 160×160 plane, 4 Gerstner waves + glitter toward `uSunDir`, fresnel, horizon fog. Never foam, never white water. | 1 | always |
| **Sun / star** | One billboard, `sun.glsl` with `uMode` 0 sun · 1 star · 2 eclipse; HDR > 1 feeds bloom. The sun and the star are **the same object**; it is never duplicated. | 1 | always |
| **Stars** | `Points` 12k (5k mobile) + `LineSegments` constellations with `aProgress` draw. | 2 | 03, 08, 12 |
| **Shadow layer** | Flat ink `ShapeGeometry` from inline SVG (frieze of seven cattle, island silhouette, olive branch, five planks). One `MeshBasicMaterial` colour = `--press`. Backlit by the sky = shadow theatre. | ≤2 | 02, 04–07, 10, 13 |
| **Veil** | One 64×96 plane, `veil.glsl` (sheer, flag wave, `uTear`). | 1 | 04→05, 08 |
| **Net** | `LineSegments` grid in camera space with catenary sag; `uCut`. | 1 | 11 |
| **Tesserae** | One `InstancedMesh` of flat quads, ≤ 6,000 (1,500 mobile). Targets: (a) loader star, (b) shatter cloud, (c) open hand, (d) dawn sun-path. Idle everywhere else (`count = 0`). | 1 | loader, 02, 11, 14 |
| **Post** | `RenderPass` → one `EffectPass`(SMAA, Bloom, TesseraeEffect, Noise .06, Vignette). ChromaticAberration only during the shatter and the tear. | 2 passes | always |

Ten draw calls in the worst chapter. Nothing else is permitted. A chapter agent who needs "one more mesh" writes a hairline or a mono label instead.

**The camera (the actual hero of the site).** One `PerspectiveCamera`, fov 30–42, on a Catmull-Rom position spline + a separate lookAt spline, both sampled by master progress with `MathUtils.damp` λ 6. Sea at y = 0, horizon effectively at z = −80. Mouse parallax ±0.12 units, lerp .06 (off on touch). Keyframes are in the storyboard. The move is designed so **every chapter is reachable by scrolling backwards with no popping** — the spline is C1 continuous and no chapter owns a discontinuity except Chapter 12's cut to black, which is a post-tint, not a camera jump.

---

## 4. CHAPTER-BY-CHAPTER STORYBOARD

Scroll map (≈ 40,400 px on a 900 px viewport ≈ 45 vh units). `p` = local chapter progress 0→1. Camera positions are `(x, y, z)` world units; `look` is the lookAt point. The clock is the bottom-right mono label. Copy is the narrative spine's (verbatim from script/deck); this document decides *how it is shot*.

| # | Chapter | Canto | vh | Master | Clock |
|---|---|---|---|---|---|
| 01 | The Sun | Overture | 2.5 | 0–5.5% | 16:56 · SUNSET |
| 02 | The Warning | I | 3.5 | 5.5–13% | 17:40 |
| 03 | A Sky Full of Stars | II | 3.5 | 13–21% | 21:10 |
| 04 | The Tenth Dawn (Ogygia) | III | 3.5 | 21–29% | 23:00 |
| 05 | The Hand That Lifts | IV | 3 | 29–35.5% | 00:15 |
| 06 | Paradise | V | 4 | 35.5–44.5% | — · STAY TODAY (the clock stops) |
| 07 | Seven Years, Eleven Editions | VI | 4.5 | 44.5–54.5% | spins 01:00 → 04:00 |
| 08 | The Hand Upon the Rudder | VII | 4.5 | 54.5–64.5% | 04:10 |
| 09 | Forever | VIII | 3 | 64.5–71% | 04:50 |
| 10 | What Remains | IX | 3.5 | 71–79% | 05:20 |
| 11 | The Open Hand | X | 3.5 | 79–86.5% | 05:55 |
| 12 | I Am Homer | XI | 2.5 | 86.5–92% | 06:20 |
| 13 | The Raft | Coda | 2.5 | 92–97.5% | 06:40 |
| 14 | Sunrise | Finale | 1.2 (+ footer) | 97.5–100% | 06:51 · SUNRISE |

Emotional curve: AWE → GRAVITY → LOST/HOPE → ARRIVAL → TENDERNESS → JOY → TIME → RESOLVE → FEAR→CLARITY → LEGACY → LETTING GO → REVELATION → COURAGE → CATHARSIS.

---

### 01 · THE SUN — Overture · 16:56
**Frame (film still).** Background: the sky shader at dusk — a blurred disc of white-gold light sitting exactly on the horizon line at 62% of viewport height, its bloom spreading in an out-of-focus halo across the lower sky; above it the sky runs flame → gold → sea-navy → abyss at the top edge. Midground: the sea, glitter pointing straight at the camera, a gold path of light from the horizon to the bottom edge. Foreground: type. The word **SUN** in Fraunces 300 at `--t-sun` fills the width, baseline on the horizon line, **cut out of a press-black plate** — the letters are holes and the sun pours through them (CSS `mask-image` with the SVG-rendered word, or `mix-blend-mode: multiply` on a black `<h1>` layer over the canvas; the tech spec's `Text.ts` CanvasTexture route if we want it in GL). Above SUN, small, left-aligned at 7%: *Mediterranean* in italic cream at `--t-hero`. Top-left eyebrow chip: `01 — MEDITERRANEAN TOURISM FORUM · 11TH EDITION · MALTA · 25–27 NOVEMBER 2026`. Bottom-left crosshair + `THE SUN`. Bottom-right `01 / 14 · SCROLL` with the breathing 1 px rule, and the clock. Temperature: hot horizon, cold zenith. Camera `(0, 3.2, 8)`, look `(0, 0.6, −80)`, fov 34.
**Choreography 0→1.** p 0–.15: (from preloader) the rising sun settles; `Mediterranean` line-masks up; `SUN` plate is already there — the sun *is* the reveal. p .15–.45: on first scroll tick the sub-line `Stewardship · Unity · Net Positive` settles under the word; three hairline-framed question cards draw in sequence at right (`S WHAT MUST WE PROTECT?` / `U WHAT CAN WE ACHIEVE TOGETHER?` / `N WHAT SHOULD TOURISM LEAVE BEHIND?`), each rule `ruleH` 1.15 s then label. p .45–1: the camera sinks from y 3.2 → 1.6 and the sun sinks with the scroll so the light inside the letters drains from the top down — each letter goes dark like a sunset happening inside it — while the sky reddens gold → flame → ember. `SUN` ends as a black word on a black sky with an ember rim along its baseline. Forum lines (`For thousands of years, the Sun has shaped…`) settle at left over the darkening water.
**Transition out.** No cut. The ember disc is now a thin line. Against it, at horizon scale (5% of the frame), seven horned silhouettes begin to cross from the right: the shadow frieze. Mono rewrites `THE WARNING`.

### 02 · THE WARNING — Canto I · Stewardship · 17:40
**Frame.** Background: the last ember of the sun, a horizontal blur of flame on abyss, the sky already navy. Midground: **the frieze** — seven flat ink cattle (folk-art proportions: long horns, block bodies, the sun's mark as a hole in each flank through which the ember shows) walking left along the horizon line, tiny, precise, a shadow play. The sea reflects them as broken glitter. Foreground: headline at left, `--t-display`, cream: *Do not touch what belongs to the Sun.* Storyteller lines below it, italic, one per beat. Eyebrow `02 — S · STEWARDSHIP — WHAT MUST WE PROTECT?`. Camera `(0, 1.6, 7)`, look `(0, 0.5, −80)`, fov 34, a barely perceptible drift right (x 0 → 0.6) as the cattle cross.
**Choreography.** p 0–.35: cattle walk (stop-motion `steps(4)` leg cycle keyed to scroll — no easing, the folk-art feel); storyteller lines settle one per 6% (`They knew. / And still they did.`). p .35–.42 **THE SHATTER (mosaic moment 1 of 4)**: the stage flashes navy twice (`steps(2)`, 120 ms), a 1 px white bolt draws top→horizon in 60 ms, chromatic aberration spikes to .004, camera shakes ±0.04 for 400 ms — and then **the entire frame becomes tesserae**: `post.tesserae.amount` 0→1 in 300 ms (the sky, the sea, the cattle, the *type*, the chrome — everything is tiled with dark grout), holds for one beat, then the instanced tesserae take over: 6,000 gold-and-ink tiles fall out of the image into the sea over 1.4 s along the sea's flow field (`--ease-set`), the post amount returns to 0 underneath so the "real" frame is revealed with the cattle gone. This is the shipwreck; nobody needs to see a ship. p .42–.8: Forum copy lands over the settling water — `Tourism brings opportunity — but also responsibility…`, chip row `HERITAGE · ENVIRONMENT · COMMUNITIES · CULTURE · DESTINATIONS · SEA`, verb row `PROTECT → RESPECT → PRESERVE → ENHANCE`, closing serif *Enjoy the destination. Respect the place.* p .8–1: rail glyph **S fills gold** (the first of three). The sky is fully abyss.
**Transition out.** The sunk tiles glow faintly under the surface, then one by one rise *out* of the water as points of light and keep rising. `[S] Ulysses alone. / No ship. / No companions. / Only a man… / between sea and sky.` The camera begins to tilt up.

### 03 · A SKY FULL OF STARS — Canto II · Why now · 21:10
**Frame.** Background: the full night sky — nebula fbm barely visible, 12k stars with true parallax as the camera tilts. Midground: **eleven brighter stars** with mono labels (`AI & AUTOMATION` … `SUSTAINABILITY & INVESTMENT`), hairlines drawing between them (Miró's constellation lines, Agnes Martin's weight). The constellation they form is the logo's sea outline — the Mediterranean, in stars. Foreground: headline *Where do I go from here?* top-left, `--t-display`; the two questions as opposing weights at right: `HOW MANY TOURISTS CAN WE ATTRACT?` small, struck through by a drawing hairline; `WHAT KIND OF TOURISM CREATES THE GREATEST VALUE AND RESILIENCE FOR PEOPLE, PLACES AND BUSINESSES?` at `--t-chapter`, cream. The horizon is at the bottom 8% of the frame. Camera: `(0.6, 1.6, 7)` → look tilts from `(0, 0.5, −80)` to `(0, 34, −80)`, fov 34 → 42 (wider — the sky opens).
**Choreography.** p 0–.25: tilt up; the risen tiles are now stars; storyteller `For thousands of years, sailors of this sea looked to the stars…`. p .25–.6: eleven stars brighten one by one with their labels (each label follows its rule, never precedes it); constellation lines draw (`aProgress`); the old question strikes through; the new question settles. p .6–.85: `[S] One star grows brighter. / Was it Athena? / Destiny? / Hope?` — the star at Malta's position on the constellation swells, gold, `uMode` → 1 with diffraction spikes; the other stars dim to 40%. p .85–1: the star begins to descend; the rail's ticks pulse in sequence (nine ticks = nine nights); mono hint bottom-right `NINE NIGHTS ↓`.
**Transition out.** Pure light: the star descends through the frame while the camera pans right; a horizon rule draws (`ruleH`) and a black shape rises on it. `[S] On the tenth dawn… / the star touched the earth.`

### 04 · THE TENTH DAWN — Canto III · Ogygia · Malta · Who is MTF · 23:00
**Frame.** Background: abyss sky, thin stars. Midground: **the island** — Gozo as a single flat ink silhouette on the horizon (flat-topped mesas, the Ramla notch, a cave arch as a hole in the cliff), 30% of the frame width, shadow-theatre black against the faint blue of the sky. The star has landed *in the cave*: one warm gold point shining out of the hole — "Caves watching the horizon. Its eye upon the sea." The sea carries a thin gold path from the cave to the camera. Foreground: headline *A diamond set in blue.* left; storyteller stack (`A nymph. / Calypso. / … / Gozo.`). Eyebrow `04 — OGYGIA · GOZO · MALTA — THE HEART OF THE MEDITERRANEAN`. Camera pans 38° right and dollies in: `(0.6, 1.6, 7)` → `(2, 1.4, 2)`, look → `(22, 1.2, −80)`.
**Choreography.** p 0–.3: the silhouette rises out of the water (translateY on the shape, `--ease-tide`) as the star drops into it; ripple rings on the sea at the touch point. p .3–.55: storyteller stack; the mono coordinates `36.05° N · 14.25° E` draw under the eyebrow (the instrument frame from the art plan, used once). p .55–.9 **second movement — the host**: mono `WHO IS MTF?`; forum copy `Mediterranean Tourism Foundation… Advancing peace, prosperity and a better quality of life through tourism.`; stat trio in Fraunces 300 numerals with mono units — **1,600+** PARTICIPANTS · **60 % / 40 %** MALTA / INTERNATIONAL · **31+** COUNTRIES — counting up once (`.9s --ease-press`, tabular); `ONE MEDITERRANEAN CONVERSATION.` in serif; date chip `25 — 27 NOVEMBER 2026 · MALTA · VENUE TO BE ANNOUNCED`. Mono link `BOOK A HOTEL IN MALTA ↗`. p .9–1: the cave light dims to a lamp.
**Transition out — THE VEIL (first appearance).** The veil plane crosses right→left in front of the camera, sheer cream, carrying `[S] Kalyptein. / To cover. To conceal. To draw a veil.` (DOM text whose `SOFT` axis rises 0→40 and back as the cloth passes); the island dims behind it to two figures' worth of light. The veil is the transition language from here until it tears in Ch 08.

### 05 · THE HAND THAT LIFTS — Canto IV · Unity · 00:15
**Frame.** Background: sea-navy sky, the island now small at far right. Midground: **no hands.** (The hand is reserved for Ch 11; if we show it here it is cheap there.) Instead: **portolan lines** — gold hairlines drawing across the sea plane from island to island, port to port, in the sea's own perspective, rhumb lines meeting at Malta. Foreground: headline *Achieve together what we cannot achieve alone.*; storyteller `When she asked the stranger his name… / he answered: / Nobody.` … `I was different because you were there.` in italic; at right the four strengthen-lines as mono-labelled rows — `AIR — destinations and markets` / `SEA — islands, ports and communities` / `DIGITAL — knowledge, business and opportunity` / `PEOPLE — Mediterranean talent and careers` — each row's rule drawing a corresponding line on the water (air = an arc lifted above the plane, sea = a coast-hugging line, digital = dotted, people = pulsing points at ports). Camera holds `(2, 1.4, 2)`, look drifts to `(10, 1, −80)`; fov 34.
**Choreography.** p 0–.3 storyteller; p .3–.75 the four routes and their rows (rule → label → line-on-water, staggered 60 ms); the chip row `KNOWLEDGE · SKILLS · RECRUITMENT · ETHICAL MOBILITY · TRAINING · REGIONAL CONNECTIVITY · SHARED CHALLENGES`; p .75–.95 `CONNECT PEOPLE · CONNECT DESTINATIONS · CONNECT OPPORTUNITY` then the serif sign-off *Connect the Mediterranean.*; p .95–1 rail glyph **U fills gold**. Mono link `B2B BUSINESS MEETINGS ↓`.
**Transition out.** The lines on the water thicken and warm; the sky begins, impossibly, to lighten. `[S] And then… / they were happy.` The clock label fades and is replaced by `— · STAY TODAY`.

### 06 · PARADISE — Canto V · Three Days · the clock stops
**Frame — the single daylight chapter.** Everything inverts. Background: the sky shader at full noon — paper-cream with the faintest sky-blue at the top; the sea a flat, glittering `--stone`-gold plane. The island silhouette is now *paper on cream*, barely there. Foreground: **ink type on paper** for the first and only time — the headline *Stay today.* at `--t-hero`, ink; storyteller lines (`Morning over Ramla. / Red earth. / Thyme upon the wind. / Olive leaves turning silver. / Salt. / Wine. / Music.`) in italic ink-soft. The programme arrives as **three day-columns** in the lower two-thirds: hairline-ruled `.fq`-style cards, `--sand` faces, 1 px grout between them (opus sectile — three cut stones), each with mono head `DAY 01 — 25 NOVEMBER` and the day's items as a sans list with `tnum` indices. Above each column a small sun disc (a 10 px gold circle) marks the sun's position — dawn / noon / dusk. Eyebrow `06 — THREE DAYS · ONE ECOSYSTEM — 25 · 26 · 27 NOVEMBER 2026`. Camera rises a little `(2, 1.4, 2)` → `(2, 2.4, 2)`, look `(6, 0.8, −80)`; fov 34.
**Choreography.** p 0–.2: the inversion — sky to paper over 12% of scroll, `linear` colour (hue never eases), grain drops to .03. p .2–.8: three sunrises — the sun billboard crosses the sky three times (sunrise → noon → sunset once per 20%); each sunrise slides that day's column up from below (`settle`, `--d-5`), so DAY 01 / DAY 02 / DAY 03 arrive with three dawns; the day's mono summary (`KNOWLEDGE · BUSINESS · CONNECTION · RECOGNITION` etc.) follows its rule. Items: verbatim deck lists; Day 03 carries the four specialist events as an indented sub-list with `→ THE FOUR` link to Ch 08. Storyteller `Stay today. / Again. / And again.` lands between columns. p .8–1: `Calypso was happy. / The island that had always been paradise… / was no longer lonely.`; pill `FULL PROGRAMME →` beside the persistent `REGISTER →` (which on paper turns to `--ink` face / cream text).
**Transition out.** The third sunset does not stop. The sun keeps going; the sky cycles day → night → day, faster and faster; the clock label restarts and begins to spin. `[S] And time passed.`

### 07 · SEVEN YEARS, ELEVEN EDITIONS — Canto VI · 11 for 11 · 01:00 → 04:00
**Frame.** Background: the horizon held absolutely still while the sky time-lapses (day/night cycle ~every 6% of scroll, decelerating), the island silhouette flickering between paper and ink with it, the sea's glitter swinging with the sun. The clock spins through the hours (`tnum`, `steps()`). Foreground: headline *11th edition. 11 think tanks. One Mediterranean.*; storyteller `At first they counted the days. / Then the months. / Then… / they stopped counting.` … `THAT WAS OUR LIFE.`; then the **eleven tesserae**: eleven stone-faced tiles in a brickwork grid (odd rows offset ½ cell) across the lower 60% of the frame — `--sand` at 8% on dark with 1 px grout, each carrying its numeral in Fraunces 300 (`01`…`11`), its title in serif `--t-sub`, its subtitle in sans, its group in a mono chip (`PEOPLE & INNOVATION` · `REGIONAL ACTION` · `RESPONSIBILITY & VALUE` · `CULTURE & SERVICE`). The four group headers are hairline sectors above the grid. Eyebrow `07 — 11 FOR 11 · MTF BRAIN THINK TANKS · 26 NOVEMBER`. Camera locked `(2, 2.0, 2)`, look `(6, 0.8, −80)` — the stillest chapter; time moves, the camera does not.
**Choreography.** p 0–.25 storyteller and the accelerating sky; p .25–.7 tiles assemble one at a time (`settle` + a single 14 px rise, stagger 60 ms) — the only "mosaic assembling" the forum gets, and it is DOM; `THINK → CHALLENGE → DESIGN → ACT` mono row; forum lead `11 Challenges • 11 Expert Groups • 11 Actions`. p .7–.9: the sky cycle slows and settles on deep night (the years are over); the tiles' grain darkens slightly ("the world ages around them"). p .9–1: mono link `JOIN A THINK TANK →`. Interaction: hover/focus lifts a tile ≤ 6° (`perspective`, the Domvs Romana cubes) and slides its card in from the right (deck body copy verbatim, e.g. `AI IN THE BACK OFFICE. HUMANS AT THE FRONT.`); tap on mobile expands in place.
**Transition out.** The veil crosses again, faster, carrying nothing. Behind it the sky goes to full abyss and the stars come back. `[S] Then one night… / the heavens reminded him.`

### 08 · THE HAND UPON THE RUDDER — Canto VII · The Four · 04:10
**Frame.** Background: night sky, stars, the sea black glass. Midground: **no compass object.** The camera *is* the compass: over this chapter it yaws a full 360° on the spot, and at each cardinal bearing a constellation is drawn and a specialist event's panel is waiting. Foreground: headline (two lines) *The wind may belong to destiny. / The hand upon the rudder remains ours.*; storyteller `Orion. / The Bear. / East. / West.` with mono `EAST` / `WEST` labels pinned at the true screen positions of those bearings as the camera turns; a hairline ring at the frame's centre with 72 ticks that counter-rotates with the yaw (the only instrument overlay in the film); the needle is a 1 px vertical rule that trembles with the mouse. Eyebrow `08 — 27 NOVEMBER · INTERNATIONAL MORNING PLENARY · FOUR SPECIALIST EVENTS`. Camera `(2, 1.6, 2)`, look sweeps 360° on the horizon, fov 36.
**Choreography.** p 0–.15: storyteller; Orion draws to the east. p .15–.85 **four bearings, 90° each**, the yaw easing to a soft lock at each (a click of light: the ring's ticks flash once):
- **N · BEAUTIFUL DESTINATIONS** — panel slides in from the right: `BEAUTY CREATES VALUE.` / `BEAUTIFUL • GREEN • ACCESSIBLE • LIVEABLE • INVESTABLE?` / `Green can be beautiful. Accessible can be beautiful. Functional can be beautiful.` / mono `BEAUTY → QUALITY → INVESTMENT → VALUE`.
- **E · MED READY** — `HOW MED READY IS YOUR DESTINATION?`; the acronym ladder draws one letter per line (`M Mediterranean · E Emergency · D Destination · R Resilience · E Early Warning · A Action · D Disruption Readiness · Y Year-Round`); the tick ring becomes a radar sweep for one rotation; `FROM CRISIS REACTION → TO DESTINATION READINESS.`; Centre of Excellence body and `MED READY CERTIFIED DESTINATION / PROPERTY`.
- **S · AI-POWERED HOSPITALITY** — `AI should not simply automate today's hospitality business. / IT SHOULD HELP US REDESIGN TOMORROW'S.`; the six Ps as six mono chips orbiting the ring once; `SMARTER BEHIND THE SCENES. MORE HUMAN IN FRONT OF THE GUEST.`
- **W · THE COFFEE EXPERIENCE — Powered by Lavazza** — `Coffee is more than a product…`; chip row; `FROM COFFEE AS A PRODUCT → TO COFFEE AS AN EXPERIENCE`. (Lavazza wordmark as a single-colour mark, permission TBC.)
Each bearing: mono `EXPLORE →`. p .85–.95: `[S] And the man who arrived calling himself Nobody remembered: / I AM ULYSSES.` at `--t-display`. p .95–1: chapter link `THE FOUR — FULL DETAILS →`.
**Transition out — THE VEIL TEARS.** The veil enters one last time and **rips down the centre** (`uTear` 0→1 with the burnt-gold edge; DOM twin `#tear` filter on the type), the camera completes its circle facing the open sea, and a cold blue field floods the sky from the horizon up.

### 09 · FOREVER — Canto VIII · Net Positive · 04:50
**Frame.** Background: a cold, even sky-blue field, the sea the same blue — Rothko's two bands meeting at the horizon, no sun, no stars. Foreground: across the full width, a **counter of arrivals rolling upward forever** — nine mono digits at `--t-display` scale, tabular, climbing without end (Opałka), paper-55 on blue; the storyteller sits over it: `She offered Ulysses immortality. / No ageing. / No sickness. / No grave. / Forever young. / Forever together.` Headline *Leave more than we take.* Eyebrow `09 — N · NET POSITIVE — WHAT SHOULD TOURISM LEAVE BEHIND?` Camera `(2, 1.6, 2)`, look `(0, 1.2, −80)`, fov 34, a slow push-in z 2 → −4.
**Choreography.** p 0–.4 the counter climbs at a rate tied to scroll velocity (it never stops while you move); p .4–.5 on `Life matters because it ends.` the counter **freezes** on whatever number it reached, then dissolves tile-wise (`.tess-out` DOM mask, 600 ms) — the only DOM tesserae dissolve in the film; p .5–.85 the blue warms to gold in three sliding Rothko bands (`linear`), and the Forum lands: `Tourism's success should not be measured only by arrivals, nights and expenditure.` / `DOES TOURISM IMPROVE THE STANDARD OF LIVING OF THE COMMUNITIES THAT HOST IT?` at `--t-chapter` / chip row `BETTER JOBS · BETTER CAREERS · BETTER PUBLIC SPACES · BETTER SERVICES · STRONGER LOCAL BUSINESSES · HEALTHIER ENVIRONMENTS · BETTER EXPERIENCES · GREATER OPPORTUNITY` / `FROM A HOSPITALITY INDUSTRY → TO A HOSPITALITY CULTURE.` p .85–1: rail glyph **N fills gold — S·U·N reads whole for the first time** and the three letters glow for one beat (`shine`).
**Transition out.** The gold field holds. In the top-left of the frame a single **olive branch** silhouette enters (shadow), and `[S] A leaf falls.` — one leaf detaches and drifts down through the whole transition.

### 10 · WHAT REMAINS — Canto IX · People · 05:20
**Frame.** Background: sea-navy sky with the first pre-dawn grey at the horizon; sea calm. Midground: the olive branch across the top-left third of the frame, flat ink, its leaves two-tone (olive / olive-silver quads that flip with the mouse — "olive leaves turning silver"); the fallen leaf lies on the water. Foreground: headline *Perhaps immortality is what remains because we lived.*; storyteller `A child. / A kindness. / A courage. / A love. / A story. / Did we help someone stand?`; four programme blocks as hairline-framed columns in the lower half — `HOSPITALITY SKILLS COMPETITIONS — 26 NOVEMBER` (`FRONT OFFICE · HOUSEKEEPING · RESTAURANT SERVICE · CHEFS · FOOD & BEVERAGE`), `HOSPITALITY CAREERS PROGRAMME — 26 NOVEMBER`, `B2B BUSINESS MEETINGS & NETWORKING — 25–26 NOVEMBER` (`CONTACTS → RELATIONSHIPS → OPPORTUNITIES → PARTNERSHIPS → BUSINESS`), `MEDITERRANEAN KNOWLEDGE & POLICY FORUM — 25–27 NOVEMBER` (`RESEARCH → POLICY → BUSINESS → IMPLEMENTATION`, `TURN KNOWLEDGE INTO POLICY — AND POLICY INTO ACTION.`). Eyebrow `10 — PEOPLE · SKILLS · IDEAS · BUSINESS — 25–27 NOVEMBER`. Camera `(2, 1.6, −4)` → `(1, 2.4, −8)` rising slowly, look `(0, 1.4, −80)`.
**Choreography.** p 0–.3 storyteller under the branch; p .3–.8 the four columns draw (frame rules from the corner marks outward, then labels, then lists); falling leaves become the mono arrows (a leaf's fall path ends where each `→` row begins — a small, deliberate rhyme); per-column mono links `ENTER THE COMPETITIONS →` · `CAREERS PROGRAMME →` · `REQUEST B2B MEETINGS →` · `SUBMIT RESEARCH →` (TBC). p .8–1: night deepens one last time; the branch's silver goes to thread.
**Transition out.** The silver threads pull taut across the lens: a line, a knot, another line. The net is being woven in camera space. `[S] Then came the net.`

### 11 · THE OPEN HAND — Canto X · The Gala · Awards · 05:55
**Frame.** Background: ink. Midground: **the net** — a wireframe of cream threads in camera space with catenary sag, tightening as you scroll; the type reads through it. Then, at the cut, **the hand**: a folk-art fist in gold tesserae at centre, closed, that opens finger by finger until the open palm fills 80% of the viewport — **mosaic moment 3 of 4, the only full mosaic in the site**. ~6,000 instanced tiles, cell pitch ≈ 22 px at 1440, ±12° rotation jitter, 3 px grout showing the ink behind, a 5-stop ramp from gold-leaf at the palm's centre to terra and sea at the fingertips, 8% pure gold glints, per-tile tilt so a specular sweep crosses the hand as the pointer moves. Foreground: the gala title drawn in stroke (SVG paths, Fraunces-based lettering with Greek-inflected terminals): **CALYPSO'S ODYSSEY** / *The Greatest Journeys Are Not Always Across the Sea*. Storyteller `For seven years Calypso had tried to keep what she loved. / … / Hold tighter. / But holding tighter does not stop departure.` then, on the cut: **Love is not the hand that closes. / Love is the hand that opens.** Eyebrow `11 — 26 NOVEMBER · CALYPSO'S ODYSSEY · THE GALA`. Camera holds `(1, 2.4, −8)`, look `(0, 1.4, −80)`; fov 34 → 30 (slight tightening = "holding tighter").
**Choreography.** p 0–.3: the net draws and tightens (`scale 1 → .96`); storyteller. p .3–.4 **the cut**: a 2 px cream line draws top→bottom; the net's strands recoil away from it (`uCut`), knots fall into the sea and fade. p .4–.75 **opening + assembling**: the fist is present as a flat gold silhouette; each finger unfolds (`rotate 170° → 0°` about its knuckle, pinky → index, thumb last) while every tile flies from a polar start (r = 600 px, hashed θ) to its target with a delay proportional to distance from the palm's centre, `--ease-press`; the solid silhouette fades out as the tiles arrive, so the hand is a mosaic by the time it is open. The couplet lands one line per finger-group. p .75–.9 **gold sweep**: the specular band crosses −30° bottom-left → top-right; gold tiles brighten 1 → 1.6 → 1; the gala title strokes on across the open palm (`draw`, 1.4 s). Forum (adapted): `One Storyteller. No dialogue. Nine songs. One night.`; canto strip in mono, nine ticks (`THE LAST SHIP · THE STRANGER · THE AWAKENING · PARADISE · SEVEN YEARS · FOREVER · THE OTHER WOMAN · THE OPEN HAND · THE POET`); meta chip `26 NOVEMBER 2026 · MALTA · APPROX. 70 MINUTES · BY INVITATION (TBC)`; pill `REQUEST AN INVITATION →` sitting **in the palm**. p .9–1 **second movement — Awards**: mono `MEDITERRANEAN TOURISM AWARDS · 25 NOVEMBER`; `[S] And yet… three thousand years later… you know his name.`; the open hand holds one gold tile at its centre that becomes the star (`uMode` → 1); mono `AWARDS — NOMINATE →` (TBC).
**Transition out — the only cut.** `[S] Everything disappears. / No acrobats. / No projections. / No music. / Only the Storyteller.` Every layer — sky, sea, hand, chrome rules — fades to `#000` over 1.2 vh of scroll. The clock keeps ticking; it is the only thing left.

### 12 · I AM HOMER — Canto XI · Voices · 06:20
**Frame.** `#000`. Nothing. Not the stage's near-black: black. The eyebrow `12 — VOICES OF MTF · MTF11 SPEAKERS TO BE ANNOUNCED` and the clock. Then one serif line: *There remains only one thing I have kept from you. My name.* Camera irrelevant (post tint 1.0 black); the world keeps moving underneath so scrolling back is seamless.
**Choreography.** p 0–.25: black, the line settles. p .25–.45 **the hold**: `I am Homer.` — and then 1.2 viewports of scroll in which **nothing happens**. No new line, no motion, no tick. The site holds a beat the way the script does ("Hold for three or four seconds. No visual. No music."). It is scroll distance, not a scroll lock; the user can keep scrolling, and the stage simply refuses to give them anything yet. p .45–.55: one star appears above the type (the same billboard, `uMode` 1). `You thought I was telling you an ancient story. / I was telling you your story.` p .55–1 **the voices**: as you scroll, the star's light falls on a row of hairline orb rims (pear `cfRim`, 7.5 s / 11 s counter-rotation) — sub-block A `MTF11 · 2026 — SPEAKERS TO BE ANNOUNCED`, rims labelled `TBA`, each filling with a star as names are confirmed (CMS/JSON driven); sub-block B `VOICES OF THE 10TH EDITION`: curated MTF10 portraits (rights TBC) inside orbs — name in Fraunces 400, title in mono, country chip — e.g. H.E. Myriam Spiteri Debono · Hon. Dr Ian Borg · Tony Zahra · Andrew Agius Muscat · Rajan Datar · Alex Connock · Manfredi Lefebvre d'Ovidio · Taleb Rifai · Sara Roversi · Anna Pollock · Dimitrios Buhalis · Glenn Mandziuk · Vitomir Maričić; a `THE MTF SENATE` mono strip beneath. Mono links `SPEAK AT MTF11 →` · `ALL VOICES →`. No other geometry: after eleven cantos of a moving world, stillness is the effect.
**Transition out.** `[S] Not every star is our destination. / Some enter our darkness only long enough to show us the way.` The black tint lifts from the bottom up like water draining; the star sits low on the horizon; the pre-dawn sea returns, and on it, dark shapes: planks.

### 13 · THE RAFT — Coda · Register · Hotels · Partners · 06:40
**Frame.** Background: the first grey-blue of dawn along the horizon, abyss above; the star (Ch 12) low ahead as a bearing. Midground: **the raft** — five flat ink planks (the survivors of the shatter, by geometry: the same five shapes) drifting together on the wave function and locking into a raft with a cream sail; small, at the horizon scale, moving slowly toward the star. Foreground: the **registration form is the deck** — pear's contact-form grammar: pill fields (Name · Organisation · Country · Email · `I am a: Delegate / Speaker / Partner / Student / Media`), two orbiting hairline ellipses circling the gold submit button (`REGISTER →`, cartellina inner highlight, rim orbit), a segmented control `MALTA-BASED / INTERNATIONAL` (2025 pattern, mechanics TBC); the persistent CTA pill is hidden in this chapter. Right column: `STAY` — `Book your hotel in Malta with us — enjoy special rates.` `BOOK NOW →`; `THE FLEET` — partner marks as single-colour tesserae in the sail (`OUR ASSOCIATES` · `OFFICIAL AIRLINE OF THE MEDITERRANEAN TOURISM FORUM 2026` · `POWERED BY LAVAZZA`, all TBC) and `BECOME AN MTF11 ASSOCIATE → ENQUIRE →` (deck slide 26). Headline *Build from it.* Eyebrow `13 — THE APPLICATION — REGISTER FOR MTF11 · 25–27 NOVEMBER 2026 · MALTA`. Camera drops to the water: `(1, 2.4, −8)` → `(0, 0.7, −12)`, look `(0, 0.8, −80)`, fov 34 — the lowest, most human camera in the film.
**Choreography.** p 0–.25 storyteller `Seven years earlier, the sea had thrown Ulysses onto Ogygia beside the wreckage of his ship. / Broken… but not destroyed. / … / Build from it.` while the planks assemble; p .25–.85 the form and columns draw (frames first, fields second, the button's rims last); p .85–1 the raft's sail catches the first light. Success state: sail fills gold, the raft moves toward the star, mono `RAFT LAUNCHED — SEE YOU IN MALTA`.
**Transition out.** `[S] The raft reaches the sea.` The camera begins to rise and the horizon begins to burn.

### 14 · SUNRISE — Finale · Footer · 06:51
**Frame.** Background: the sky shader at dawn — flame at the horizon, gold above, cream at the zenith by the end. Midground: the sun rising through the horizon, bloom at maximum; **mosaic moment 4 of 4**: the sun's reflection on the water is laid as a **path of gold tesserae** from the horizon to the camera — the open hand from Ch 11 has lain down flat and become the horizon line ("the image of an open hand becomes the Mediterranean horizon"): the palm's top edge flattens to a 2 px line, the finger tiles fall away, the remaining tiles stream into the sun path. Foreground: **I lived.** at `--t-hero` — the largest type since the hero — left; storyteller stack `So when your own Odyssey reaches its final shore… / do not count the years. / Remember the people. / … / And the people you loved enough… to let go.`; the final couplet in mono caps wide-tracked, `LOVE IS NOT THE HAND THAT CLOSES.` — pause — `LOVE IS THE HAND THAT OPENS.` Then the footer, framed by four hairlines drawn from corner meander marks (pear `.fin-*`): the Foundation blurb (current site, verbatim), columns `THE FORUM` / `THE FOUNDATION` / `CONTACT` (forum@ / info@medtourismfoundation.com) / `FOLLOW` (Facebook · Instagram · LinkedIn — Mediterranean Observer), bottom rule `THINK TOGETHER · LEARN TOGETHER · ACT TOGETHER` · `© 2026 MEDITERRANEAN TOURISM FOUNDATION` · Privacy · Cookies · `MOTION: FULL / REDUCED` · `BACK TO THE BEGINNING ↑`. Camera rises `(0, 0.7, −12)` → `(0, 3.2, −12)`, look `(0, 0.6, −80)` — **the hero's framing again, from the far side of the night**.
**Choreography.** p 0–.35 the sun rises (the rail's three gold glyphs S · U · N detach, travel to the horizon and are absorbed into the disc as it breaks the line); *I lived.* settles; p .35–.6 the couplet; p .6–1 the footer frame draws and the text sits on the lit sea; the persistent CTA returns as a large gold pill on the water. `BACK TO THE BEGINNING ↑` scrolls to the top, where the same sun is waiting at sunset: the long take loops.

---

## 5. SIGNATURE MOMENTS — five things no conference website has done

1. **The Long Take.** One uncut camera move across the whole page, with a real clock running sunset → sunrise in the corner. Not "sections with 3D"; one shot. Scroll backwards from the footer and you watch the sun set again.
2. **The word SUN as a hole in the night.** The hero's three letters are knockouts through which the real, blurred, blooming WebGL sun pours — and as you scroll, the sun sets *inside each letter*, top-down, until the word is black on black with an ember baseline. The theme is not written; it is lit.
3. **The Shatter.** Once, and only once, the entire frame — sky, sea, type, chrome, the cursor's own hairlines — becomes a Roman mosaic with dark grout for a single beat and falls into the sea. The shipwreck without a ship. Because the site has been so still, this is genuinely shocking.
4. **The Open Hand.** Six thousand gold tesserae assemble a folk-art hand that opens finger by finger until it fills the viewport, and the gala's invitation button sits in its palm. It is the only full mosaic on the site, so it is unforgettable. In the footer, the same hand lies down and becomes the horizon the sun rises over.
5. **The hold.** At "I am Homer." the site goes to true black and, for 1.2 viewports of scroll, gives you nothing — no line, no star, no tick. A conference website that dares to withhold. Then one star, and the speakers.

Runner-ups that also don't exist elsewhere: the clock that **stops** in Paradise and **spins** in Seven Years; the camera as compass (a 360° yaw is the "four events" navigation); the `REGISTER →` pill whose background is the current sky colour (driven by the same uniforms as the shader via CSS custom properties) so the button warms from dusk to dawn as you scroll; the counter of arrivals that climbs only while you move and freezes on "Life matters because it ends."

---

## 6. THE MOSAIC SYSTEM

**Doctrine.** Tesserae are precious because the budget is four beats. Everywhere else the mosaic exists only as *grammar* — grout hairlines, brickwork grids, corner meanders, glints — never as a texture behind copy.

| Where | What | How |
|---|---|---|
| **Preloader** | The single star is one gold tessera, tilted, catching light. The horizon rule beneath it is grout (`--rule-dark`). | One instance of the tesserae mesh, `uMode` star; CSS `draw` for the rule. |
| **Ch 02 — the Shatter** | The full frame tessellates and falls. Post `TesseraeEffect.amount` 0→1 (300 ms, per-cell stagger `step(hash(cell), amount)`), hold one beat, then the instanced field (spawned at cell centres, coloured by sampling the framebuffer once) falls along the sea flow field for 1.4 s while `amount` returns to 0. The DOM type layer dissolves in sympathy with the `.tess-out` SVG-pattern mask (same jittered cells) so type and GL break together. | `tesserae.glsl` (jittered-grid Voronoi, grout `uGrout .08`, quantised tilt, gold by luminance threshold) + `InstancedMesh` 6,000 + `mask-image` twin. Once per session; a second visit to the beat plays a 300 ms crossfade. |
| **Ch 07 — 11 for 11** | Eleven DOM tiles, brickwork offset, 1 px grout, `--sand @8%` faces, ≤ 6° tilt on hover with the Domvs Romana "tumbling cubes" logic. Not a shader; not "mosaic" in the precious sense — it is the grammar. | HTML/CSS. |
| **Ch 09 — the counter** | The frozen arrivals number dissolves tile-wise. | `.tess-out` mask, 600 ms. |
| **Ch 11 — the Open Hand** | The full instanced field, assembling. Cell pitch 22 px (1440 w), tile 18–22 px hashed, rotation ±12°, 3 px grout, 5-stop radial ramp gold-leaf → gold → terra → sea → sea-deep, 8% glints, per-tile normal ±7° (Ravenna setters) so `uLight` from the pointer sweeps a specular across the palm. | `InstancedMesh` with `aTarget`/`aStart`/`aDelay` attributes; targets rasterised at build from `hand-open.svg`; GSAP tweens `uAssemble` 0→1 with the fingers' rotation; `hand.glsl`. Mobile: 1,500 tiles, pitch ×1.6. |
| **Ch 14 — the sun path** | The hand flattens; its tiles stream into the sun's reflection on the water — a path of gold tesserae. | Same instances, new targets (a lane on the sea plane), `uAssemble` retargeted. |
| **Hover / UI** | Gold CTA: conic rim orbit 7.5 s / 11 s reverse + `cartellina` inner highlight (`inset 0 1px rgba(255,250,232,.7)`); tessera glint on cards and gold surfaces = a `radial-gradient` at `--mx --my`, max opacity .22, `linear`. Crosshair `shine` bursts on one mark at a time (the gold cube catching the lamp). | CSS. |
| **Chrome** | Rail = a guilloche: the hairline plus a second gold strand that braids as progress. Corner marks = 9 px meanders. Chips are tesserae: separated by 1 px of ground, never margins. | CSS. |
| **Never** | Behind body copy; on the programme; hexagons; organic Voronoi; white grout; gold above 30% of any field; photographic mosaic textures. | — |

---

## 7. THE MYTHOLOGICAL ART — shadow and gold

**Style decision.** The client's folk-art reference gives us flat geometric figures, a five-colour palette, huge negative space, one long diagonal per frame. Transposed to this lens it becomes **Mediterranean shadow theatre**: every mythic figure is a flat ink silhouette backlit by the sky, seen at horizon scale, never outlined, never faced — Karagiozis and the Maltese *luzzu* eye rather than an illustrated storybook. The only other material is gold tesserae. Two materials, four figures, four mosaics. No generated imagery is required; if credits arrive, generated plates go *behind* the sky as blurred light (pear.no's hero-photo treatment), never as figures.

| Figure / glyph | Chapter | Style | Built how |
|---|---|---|---|
| **The Sun / the Star** | 01, 03–04, 11–14 | Blurred light (Eliasson's indoor sun) | `sun.glsl` billboard, `uMode` sun/star/eclipse; bloom. |
| **Helios' cattle — the frieze** | 02 | Shadow. Seven horned silhouettes with the sun's mark as a hole in each flank, walking on the horizon line at ~5% frame height. Stop-motion leg cycle (`steps(4)`). | Inline SVG (art plan A1's `#cow`, no fills but ink) → `SVGLoader → ShapeGeometry`, merged, one draw call; positioned on the sea plane at the horizon. |
| **Zeus' bolt** | 02 | One 1 px cream line, top → horizon, 60 ms. | SVG `polyline`, `draw`. |
| **The constellation of the eleven forces** | 03 | Hairlines and points (Miró / Agnes Martin) forming the logo's sea outline. | `Points` + `LineSegments` with `aProgress`. |
| **Ogygia / Gozo** | 04–07 | Shadow. One flat-topped island silhouette with a cave hole; the star lands in the cave (its eye upon the sea). Paper-on-cream in Ch 06. | SVG (art plan A5 mesas simplified to one path) → `ShapeGeometry`, ink; colour uniform swaps to `--sand` in Paradise. |
| **The Veil (kalyptein)** | 04→05, 07→08, tears at 08 | Sheer cloth in front of the lens; the type's SOFT axis breathes under it. | `veil.glsl` plane; DOM `#tear` filter twin. |
| **Portolan routes** | 05 | Gold hairlines on the sea plane (rhumb lines), the *luzzu* eye once at the bow of a sea-line. | `Line2`/`LineSegments` on the sea; SVG eye. |
| **The olive branch and the leaf** | 09→10 | Shadow with two-tone leaves (olive / olive-silver) that flip with the pointer; one leaf falls. | SVG (A7) → `ShapeGeometry`; leaf instances with `gl_FrontFacing` colour; the falling leaf on a motion path. |
| **The Net** | 10→11 | Cream threads in camera space, catenary sag, cut. | `net.glsl` `LineSegments`, `uCut`. |
| **The Open Hand** | 11, 14 | Gold tesserae — the only gold figure. Folk-art proportions (A11), fingers unfold from a fist. | `InstancedMesh` + `hand.glsl`; targets from `hand-open.svg`. |
| **The Raft** | 13 | Shadow. Five planks (the shatter's survivors by geometry), cream sail. | SVG (A10) → `ShapeGeometry`; bobs on the shared `seaHeight()` chunk. |
| **Calypso, Ulysses, Homer, Hermes** | — | **Never depicted.** The two people in this story are the Storyteller and the visitor. Hermes is a single diagonal hairline in Ch 11's opening (the command from Olympus). | Type. |

**Modern-art register (used as composition grammar, never reproduction):** Olafur Eliasson (the sun you stand under — Ch 01/14); Mark Rothko (the two-band sky/sea fields, especially Ch 09); Agnes Martin (the hairline weight of every rule and constellation); Ad Reinhardt (Ch 12's black); Bridget Riley (the veil's moiré fallback on mobile); the Domvs Romana floor at Rabat and the Ravenna gold vault (the tesserae doctrine). That is the whole list. Six references, one floor.

---

## 8. NAVIGATION, PERSISTENT UI, CURSOR, PRELOADER, OVERLAY, FOOTER

**Preloader — "NINE NIGHTS" (film's first frame, not a loader).** Press-black. One italic line, small, centred: *Sing to me, Muse…* A hairline horizon draws left → right (`ruleH`, 1.15 s). One gold tessera-star travels down and across on a slow arc; progress is nights, not percent: mono bottom-left `NIGHT 01` … `NIGHT 09` (weights: fonts 15 · code 25 · shader compile 40 · first frame 20), the rail's first nine ticks lighting one per night. At ready: mono flips to `THE TENTH NIGHT` (the film's dawn is the finale, so the loader must not spend "the tenth dawn" here); the star drops below the horizon rule, the rule ignites gold, and the **sun rises through it as the hero** — no hard cut between preloader and Chapter 01. Min 900 ms, max 6 s; warm loads skip to `NIGHT 08`. Scroll or click skips. Reduced motion: static star, fade.

**Chrome (fixed, z 60).**
- **Top-left mark:** the logo's sea brushstroke redrawn as a single 1 px path, `draw` 1.4 s on load, with `MTF` in mono. Click = top.
- **Top-right pill:** `REGISTER →` — mono caps 10–11 px, `--chip` translucent face with a 1 px rim; its face colour is the live sky (`--sky-now` written by the world loop) so it warms from dusk to dawn; from Ch 08 on wide screens `REGISTER · 25–27 NOV`; gold face + ink text + rim orbit in Ch 13–14; hidden in Ch 13 while the form is on stage. Magnetic ≤ 6 px, two-layer (button .35, label .15), `quickTo` .4 s `power4.out`, return with the press ease, never elastic. Off on coarse pointers.
- **Left rail** (`--v1` 2.65vw, top 24%): 1 px hairline, 14 ticks; active tick 9 → 22 px with its 9 px mono label; passed ticks at 40%; a gold strand braids around it as progress (guilloche). Three hollow glyphs **S · U · N** at ticks 02/05/09 fill gold as their chapters pass; tooltip = the pillar's question. Hamburger (two hairlines) at the top.
- **Bottom-left:** crosshair + the chapter label (`THE SUN`, `THE WARNING`, …).
- **Bottom-right:** `01 / 14` · `SCROLL` with a breathing 1 px rule (becomes `CANTO I` after the first scroll) · **the clock** `16:56 · SUNSET` (`tnum`). Optional `SOUND · OFF` (sea bed + one sustained tone; off by default; TBC).
- **Corner marks:** 9 px meanders on framed cards and the footer frame only.

**Cursor.** **None.** The native cursor, always. pear.no does not ship a custom cursor, and a lagging ring would be the first thing on this site that moved for no reason. The pointer's position still drives the tessera glint, the mouse parallax and the leaf flip — it *does* things; it just does not dress up.

**Nav overlay** (`--veil` + `backdrop-filter: blur(26px) saturate(1.15)`, z 80): six giant serif items in Fraunces 300 at `clamp(34px, 4.6vw, 86px)` lh .98, each with a 9 px mono index; rules between items draw at .3/.4/.5 s; siblings dim to 34% on hover; the sea-line hairline draws behind the list. `01 The Sun` (STEWARDSHIP · UNITY · NET POSITIVE → Ch 01) · `02 Three Days` (25 · 26 · 27 NOVEMBER → 06) · `03 Eleven for Eleven` (MTF BRAIN THINK TANKS → 07) · `04 The Four` (BEAUTIFUL DESTINATIONS · MED READY · AI · COFFEE → 08) · `05 Calypso's Odyssey` (THE GALA · 26 NOVEMBER → 11) · `06 Register` (THE APPLICATION → 13). Mono row: `VOICES · HOTELS · PARTNERS · THE FOUNDATION · CONTACT · WATCH MTF10 ↗`. Right column meta: `MEDITERRANEAN TOURISM FORUM · 11TH EDITION` / `25–27 NOV 2026 · MALTA` / socials. Navigating = `scrollToChapter(label)` through the long take (Lenis, 1.6 s, `--ease-tide`) so the camera is seen travelling — the overlay dissolves as the move starts. Keyboard: Esc closes, focus trapped, `inert` on the stage while open.

**Footer** = Chapter 14 (above). Also a `mode-page` footer for no-JS/print with the same columns.

**Satellite pages** (Programme, each Think Tank, each of the Four, Gala, Voices, Register): the same pinned stage holding one chapter's frame still — a plate of the film — with the content as a light limestone document below the fold (`--paper` ground, ink type, terra links). No new designs; the film's stills are the templates.

---

## 9. MOBILE STRATEGY

- **Same film, same shot.** The sticky pin works on iOS ≥ 16.4 (`100dvh`, `ScrollTrigger.config({ ignoreMobileResize: true })`). Stage length ≈ 26 k px (chapters use `mobileLength`, ~60% of desktop); Lenis `syncTouch: false` (native touch), `touch-action: pan-y`.
- **Portrait recomposition per chapter** (`@media (max-aspect-ratio: 4/5)` in each `chapter.css`): the horizon rises to 50% of the frame; type stacks — eyebrow, headline, storyteller, forum — in one left-aligned column at `--gx`; the three day-columns (06) and four programme columns (10) become a vertical opus-sectile stack with wave-crest rules between; the eleven tiles (07) become a two-column brickwork; the four bearings (08) keep the 360° yaw (it reads even better in portrait — the horizon swings across the narrow frame) with the panels as full-width sheets; the speakers (12) as a vertical orb column; the form (13) full-width with the raft above it.
- **The word SUN** scales to `26vw` and remains a knockout; the sunset-inside-the-letters still plays.
- **Rendering tier `mid/low`:** DPR ≤ 1.25, sky at 0.5× (it is meant to be blurred), sea 96², stars 5k, no ChromaticAberration/SMAA, Bloom `resolutionScale .25`, `uMouse` = 0 (device tilt optional, off by default), tesserae 1,500 for the hand and the sun path.
- **The Shatter on mobile:** post `amount` 0→1→0 with the per-cell stagger (still the whole frame tiling) but the falling instanced field is 1,500 tiles at pitch ×1.6 — the beat survives; the DOM twin mask does the type.
- **No hover affordances:** the eleven tiles expand in place on tap; magnet off; the tessera glint follows the last touch point; the olive leaves flip on scroll velocity instead of pointer.
- **The pill** sits bottom-centre above the safe area; the rail collapses to the three S·U·N glyphs + a 2 px progress strand at the left edge; the clock and chapter counter share one bottom-right label.
- **Battery:** static-scene 30 fps mode when `|velocity| < .05` for 500 ms; the black chapter renders nothing.
- **Reduced motion / `mode-page`:** same DOM, stacked full-bleed frames with a static render of each chapter's sky (CSS gradients), all copy intact; wipes become 200 ms dissolves; the Shatter and the Hand appear as still frames. A visible `MOTION: FULL / REDUCED` toggle lives in the footer mono row and the rail.

---

## 10. BUILD RISKS & MITIGATIONS

| # | Risk | Mitigation |
|---|---|---|
| 1 | **The camera spline pops** when chapters are built by different agents with different ideas of "where the camera is". | The integrator owns `src/world/CameraPath.ts` with **all 14 keyframes from this document** committed on day-one morning; chapters may tween `ctx.camera` only within ±0.3 units of their keyframes. `?chapter=ID&p=` harness must show no discontinuity scrubbing across boundaries; a `camera.assertContinuity()` dev check logs any jump > 0.5 units/frame. |
| 2 | **The SUN knockout** is hard to do crisply with CSS masks over a WebGL canvas (mask edge shimmer, DPR mismatch). | Two implementations, decide by 11:00: (a) CSS: black `<h1>` plate with `mix-blend-mode: multiply` over the canvas (crisp, cheap, but the plate must be press-black and the canvas must render the sun brighter than cream); (b) GL: `Text.ts` CanvasTexture of the word as an alpha mask on a black quad in front of the sun — pixel-exact, the recommended path. Fallback: solid cream `SUN` with the sun behind it (still good). |
| 3 | **The Shatter** (framebuffer sample → 6,000 instances) costs a readback or a texture fetch per instance and can hitch. | No readback: instances sample the *previous frame's* render target as a texture in the vertex shader (`texture(uPrev, aCellUV)`), spawn at cell centres with colour from that fetch. The post `amount` 0→1 hides the swap. Budget: one extra render target for one beat. If it hitches on mid tier, tiles take their colour from the palette LUT instead (still reads as the frame breaking). |
| 4 | **Sticky pin + Lenis + 40 k px** on Safari iOS: address-bar resizes trigger refresh storms; `100vh` jumps. | `100dvh`, `ignoreMobileResize: true`, `overflow: clip` on the pin, and the stage height written once from `--stage-len`. pear.no ships this exact architecture in production. |
| 5 | **Six chapters of dense Forum copy on a dark stage** risk reading as "story site with a brochure stapled on". | The Forum voice never appears without a rule-then-label enter, a 52ch measure, and a mono chip; day-columns and tiles are the only "components", and both are tesserae grammar (grout, brickwork, corner marks). The clock, the horizon and the camera are always visible behind the copy — the film never pauses for the brochure. |
| 6 | **Fraunces 300 at 24 rem** blooms over bloom (the letter hairlines vanish against the sun). | Hero weight floor 320; `text-rendering: geometricPrecision`; the knockout word is a *mask*, so the letterform is defined by the black plate, not by cream on light. Test at DPR 1 and 2 on the first afternoon. |
| 7 | **The hold (Ch 12)** — 1.2 viewports of nothing — will be read by some stakeholders as "broken". | Keep the clock ticking and the rail's active tick lit; the hold is exactly 1.2 vh (≈ 1,100 px), then the star appears. A/B the length with the client on the staging link; the mechanism is one number in `12-homer/index.ts`. |
| 8 | **Time budget: one day, many agents.** | The world (sky/sea/sun/stars/camera/post) + chrome + preloader are built by the core agent first (morning). Chapters are pure DOM + timeline + ≤ 1 shadow shape each; only three chapters have real GL work (02 shatter, 08 veil tear + yaw, 11 hand). Everything else is hairlines, mono and type. Definition of done per tech-spec §11.3. |
| 9 | **TBC facts** (venue, fees, gala access, MTF11 speakers, partners, Lavazza rights, MTF10 photo rights). | All placeholders come from `src/data/event.json` and render as `TO BE ANNOUNCED` chips in mono — the design accommodates them as content, not gaps (Ch 12's `TBA` orbs are designed to look finished at 0 confirmed speakers). |
| 10 | **Disk space** (~136 MB free; `npm install` needs ≈ 300 MB). | Free ≥ 2 GB before the install command in tech-spec §12. Blocking; do this before anything else. |
| 11 | **Accessibility** (judges dock immersive sites 6–7/10 here). | Real DOM copy in order; `aria-label` sections; SplitText `aria: 'auto'`; `inert` on inactive chapters; keyboard-reachable CTAs; `prefers-reduced-motion` parity; a "Read as a page" skip link to `mode-page`; contrast pairs from the research table (cream/press 18.18, paper-75/press 9.58, ink/paper 15.04, terra/paper 6.59). |
| 12 | **Sound** (opt-in bed) tempts autoplay. | Off by default, `SOUND · OFF` toggle, unlocked on first gesture only, TBC with client; ship v1 silent. |

---

## 11. ASCII WIREFRAMES

### 11.1 Hero — Chapter 01 · THE SUN (desktop 1440×900, p ≈ 0.15)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ ~ MTF                                                              ┌──────────────┐          │
│ ══                                                                 │ REGISTER  →  │ (chip,   │
│ ║                                                                  └──────────────┘ sky-tint)│
│ ║  [01 — MEDITERRANEAN TOURISM FORUM · 11TH EDITION · MALTA · 25–27 NOVEMBER 2026]           │
│ ║                                                                                            │
│ ║          . . . . . . . . . . . . abyss . . . . . . . . . . . . . . . . . . . . . . . .      │
│ ║                                                                                            │
│ ║   Mediterranean                                   (italic, cream, --t-hero, left 7%)       │
│ ║                                                                                            │
│ ║   ██████████████████████████████████████████████████████████████████████████████████████   │
│ ║   ████   ██████████  ███████     ████████   ██████████████   ███     ████████████████   │
│ ║   ███  ▓▓▓  ███████  ██████  ▓▓  ████████  ▓▓▓  ██████████  ▓▓▓▓    ██████ S U N =  ███   │
│ ║   ████   ▓▓▓▓ ██████  █████  ▓▓▓  ███████  ▓▓▓▓  █████████  ▓▓ ▓▓   █████  holes in ███   │
│ ║   ██████   ▓▓▓ █████  █████  ▓▓▓▓  ██████  ▓▓▓▓  █████████  ▓▓  ▓▓  █████  the black ███   │
│ ║   ██▓▓▓   ▓▓▓▓ █████   ▓▓▓▓▓▓▓▓▓  ███████  ▓▓▓▓▓▓▓▓▓▓▓▓  ███  ▓▓   ▓▓▓  ████  plate;   ███  │
│ ║   ████ ▓▓▓▓▓  ██████     ▓▓▓▓▓    ████████    ▓▓▓▓▓▓▓    ████  ▓▓    ▓▓  ████  the sun  ███ │
│ ║ ─S──────────────────────────────────────────────────────────────────────────── pours through│
│ ║ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ horizon · blurred sun disc sits ON this line ~~~~~~~~~~~~~~~│
│ ║ ~~~~~~~~ sea, glitter ~~~~~~~~~~~~~~~~~ ▓▓▓▓ gold path ▓▓▓▓ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~│
│ ║   Stewardship · Unity · Net Positive              ┌ S ─────────────────────────────┐        │
│ ║   (serif, cream, --t-sub)                         │ WHAT MUST WE PROTECT?          │        │
│ ║                                                   └────────────────────────────────┘        │
│ ║   For thousands of years, the Sun has shaped      ┌ U ─────────────────────────────┐        │
│ ║   Mediterranean civilisation… (sans, 52ch)        │ WHAT CAN WE ACHIEVE TOGETHER?  │        │
│ ║   WATCH MTF10 ↗                                   └────────────────────────────────┘        │
│ ║                                                   ┌ N ─────────────────────────────┐        │
│ ║                                                   │ WHAT SHOULD TOURISM LEAVE BEHIND? │     │
│ ║                                                   └────────────────────────────────┘        │
│ +  THE SUN                                                  01 / 14 · SCROLL ¦   16:56 · SUNSET│
└──────────────────────────────────────────────────────────────────────────────────────────────┘
  ║ = left rail (ticks; hollow S at tick 02)   ▓ = light of the sun visible through the letters
  ~ = sea    + = crosshair    ¦ = breathing 1px rule
```

### 11.2 Chapter 07 · SEVEN YEARS, ELEVEN EDITIONS (p ≈ 0.6 — tiles assembled, sky time-lapsing)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ ~ MTF                                                              [ REGISTER  → ]           │
│ ║  [07 — 11 FOR 11 · MTF BRAIN THINK TANKS · 26 NOVEMBER]                                    │
│ ║                                                                                            │
│ ║   11th edition. 11 think tanks.            ◐  (sun/moon crossing — sky cycling day/night)  │
│ ║   One Mediterranean.                                                                       │
│ ║   (serif --t-display)                                     At first they counted the days.  │
│ ║                                                           Then the months.                 │
│ ║   11 Challenges • 11 Expert Groups • 11 Actions           Then… they stopped counting.     │
│ ║   THINK → CHALLENGE → DESIGN → ACT                        (italic, right column)           │
│ ║ ~~~~~~~~~~~~~~~~~~~~~ horizon · island silhouette ▄▄▀▀▀▄▄ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~│
│ ║ ─ PEOPLE & INNOVATION ──────── REGIONAL ACTION ──────── RESPONSIBILITY & VALUE ── CULTURE ─ │
│ ║ ┌───────────┐┌───────────┐┌───────────┐┌───────────┐┌───────────┐┌───────────┐              │
│ ║ │01         ││02         ││03         ││04         ││05         ││06         │  brickwork,  │
│ ║ │Attracting ││The AI-    ││Hospitality││MED READY  ││Link Up    ││Mediterr.  │  1px grout,  │
│ ║ │& Retaining││Powered    ││for All    ││Safe &     ││Mediterr.  ││Observer   │  sand @8%    │
│ ║ │Talent     ││Hotel      ││           ││Resilient… ││           ││           │              │
│ ║ │[PEOPLE]   ││[PEOPLE]   ││[PEOPLE]   ││[REGIONAL] ││[REGIONAL] ││[REGIONAL] │              │
│ ║ └───────────┘└───────────┘└───────────┘└───────────┘└───────────┘└───────────┘              │
│ ║       ┌───────────┐┌───────────┐┌───────────┐┌───────────┐┌───────────┐                    │
│ ║       │07         ││08         ││09   ▲     ││10         ││11         │   (09 lifted 6°,   │
│ ║       │Enjoy &    ││Mediterr.  ││Malta —    ││Mediterr.  ││Service    │    its card slides │
│ ║       │Respect    ││Blue Prot. ││Luxury     ││Olive Oil  ││Excellence │    in from right → │
│ ║       │           ││Centre     ││Yachting   ││Consortium ││           │    "ATTRACT THE    │
│ ║       │[RESPONS.] ││[RESPONS.] ││[RESPONS.] ││[CULTURE]  ││[CULTURE]  │     YACHT…")       │
│ ║       └───────────┘└───────────┘└───────────┘└───────────┘└───────────┘                    │
│ ║   JOIN A THINK TANK →                                                                      │
│ +  11 FOR 11                                                 07 / 14 · CANTO VI ¦  02:37 ↻   │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
  ↻ = the clock is spinning (steps), decelerating toward 04:00
```

### 11.3 Chapter 11 · THE OPEN HAND (p ≈ 0.8 — hand open, gold sweep, title stroking on)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ ~ MTF                                                              [ REGISTER · 25–27 NOV ]  │
│ ║  [11 — 26 NOVEMBER · CALYPSO'S ODYSSEY · THE GALA]                                         │
│ ║                                    ·   ·   (loose net strands drifting away)   ·           │
│ ║                             ░░        ░░░░       ░░░░░                                     │
│ ║                            ░░░░      ░░░░░░     ░░░░░░░    ░░░░                            │
│ ║   Love is not the         ░░▒▒░░    ░░▒▒▒░░    ░░▒▒▒▒░░   ░░▒▒░░       ┐                   │
│ ║   hand that closes.       ░░▒▒▒░░  ░░▒▒▒▒░░   ░░▒▒▒▒▒░░  ░░▒▒▒░░       │ fingers = tesserae│
│ ║                            ░▒▒▒▒░░░░▒▒▒▒▒░░░░░▒▒▒▒▒▒░░░░░▒▒▒▒░░        │ (sea → terra)     │
│ ║   Love is the              ░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░  ░░░░  ┘                   │
│ ║   hand that opens.     ░░░░░▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒░░░░░▒▒▒░░  ← thumb              │
│ ║   (italic, --t-sub,   ░░▒▒▒▒▒▒▒▓▓▓▓▓▓▓████████▓▓▓▓▓▓▓▒▒▒▒▒▒▒░░▒▒▒▒░░                       │
│ ║    left 7%)           ░░▒▒▒▒▒▒▓▓▓▓▓███ C A L Y P S O ' S ███▓▓▓▓▒▒▒▒▒▒▒░░  palm = gold-leaf │
│ ║                        ░░▒▒▒▒▒▓▓▓▓███   O D Y S S E Y     ███▓▓▓▒▒▒▒▒▒░░   (title strokes  │
│ ║                         ░░▒▒▒▒▓▓▓▓▓█ The Greatest Journeys █▓▓▓▓▒▒▒▒░░     on across it)  │
│ ║                          ░░▒▒▒▒▓▓▓▓▓█ Are Not Always Across █▓▓▓▒▒▒▒░░                     │
│ ║                           ░░▒▒▒▒▓▓▓▓▓█     the Sea       █▓▓▓▒▒▒░░                        │
│ ║                            ░░▒▒▒▒▓▓▓▓▓▓ ┌──────────────────┐ ▓▒▒░░                         │
│ ║                             ░░▒▒▒▒▓▓▓▓▓ │ REQUEST AN       │ ▓░░   ← pill in the palm      │
│ ║                              ░░▒▒▒▒▓▓▓▓ │ INVITATION →     │ ░░                            │
│ ║   One Storyteller. No dialogue.  ░░▒▒▒▒ └──────────────────┘░                              │
│ ║   Nine songs. One night.           ░░░░▒▒▒▒▒▒▒▒░░░░  (wrist)                               │
│ ║   THE LAST SHIP · THE STRANGER · THE AWAKENING · PARADISE · SEVEN YEARS · FOREVER ·  ─────▶ │
│ ║   [26 NOVEMBER 2026 · MALTA · APPROX. 70 MINUTES · BY INVITATION (TBC)]                    │
│ +  THE GALA                                                 11 / 14 · CANTO X ¦   05:55      │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
  ░ ▒ ▓ █ = tessera ramp sea → terra → gold → gold-leaf, each tile with 3px ink grout;
  a specular band (not drawable here) sweeps −30° across the palm as the pointer moves.
```

---

## 12. WHAT THIS DIRECTION REFUSES (the restraint manifest)

No custom cursor. No island model, no compass model, no tree model, no ship. No hexagons, no glass, no chrome blobs, no neon. No bounce, no elastic, no `steps()` except the frieze's stop-motion and the clock. No letter-by-letter reveals; lines only, once per beat. No parallax layer moves more than 12 vh. No marquee (the canto strip in Ch 11 scrolls only with the user). No stat tiles, no bento, no stacking cards. No autoplay sound. No percent counter. No photograph at launch; if generated plates arrive they go behind the sky as blurred light, never in front of it. Gold above 30% of any field, never. Colour eases, never — colour is `linear`. Nothing moves that the user is reading.

What it spends everything on: one shot, two materials, four shadows, four mosaics, one clock, one black, one hand.

---

## 13. OPEN QUESTIONS FOR THE CLIENT (shaping this concept specifically)

1. Real solar times: confirm we may display Malta's actual sunset/sunrise for 25 Nov 2026 as the clock (≈ 16:56 / 06:51; we will compute exactly).
2. Gala lines verbatim on the site (assumed yes — they are the best copy we have).
3. Gala access (invitation / delegate-inclusive / ticketed) — decides the Ch 11 pill's label.
4. Venue(s), registration paths and fees, hotel partner, partners/airline, Lavazza single-colour mark permission.
5. Which MTF10 voices may be shown with portraits while MTF11 speakers are pending.
6. Sound bed: allow an opt-in sea bed in v1.1?
7. If generation credits arrive: first plates are the sun (Ch 01/14) and the hand (Ch 11) as blurred backlight — nothing figurative.

End of Concept C.
