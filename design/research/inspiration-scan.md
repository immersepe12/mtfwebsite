# Inspiration scan — cinematic / WebGL / scroll-driven web, 2024–2026

**For:** MTF11 — Mediterranean Tourism Forum 2026, 25–27 Nov, Malta. Theme "Mediterranean SUN" (Stewardship · Unity · Net Positive). Story spine: *Calypso's Odyssey — The Greatest Journeys Are Not Always Across the Sea*.
**Scan date:** 2026-09-05 (81 days to the Forum).
**Quality bar:** pear.no (see `brief/05-pear-no-deconstruction.md`) — one pinned stage, scroll = timeline, restrained motion, serif + mono, hairlines that draw.
**Sources scanned:** Awwwards SOTY/SOTM 2024–Jul 2026, FWA, Codrops 2025–26 tutorials, studio case studies (abeto, OFF+BRAND, Lusion, Immersive Garden, Resn, Unseen, Locomotive, darkroom.engineering, basement, Zajno, Obys, The First The Last), Utsubo/Hon Tran/Metabole 2026 round-ups, and live conference/festival sites (Config, Next.js Conf, WWDC, Sónar, OFFF, Web Summit, Cannes Lions, Awwwards Conf, Google I/O).

---

## 0. TL;DR — what the winners have in common

1. **One hard idea, executed cleanly.** Every 2025–26 SOTY/SOTM picks a single signature mechanic (Igloo: procedural ice crystals; Oryzo: one cork coaster with inertial physics; Lando Norris: a helmet that rotates like a wheel; Cartier: six 3D alcoves; David Whyte: watercolor fluid sim). Nobody stacks ten effects. Utsubo's 2026 review says it flatly: "the standout sites pick one hard idea and execute it cleanly."
2. **Scroll is the timeline, not a stack of sections.** pear.no, Igloo, Oryzo, Primland, Sleep Well, Cartier all stage each beat as *entrance → hold → exit* against a pinned canvas. Scroll-driven 3D narratives out-score static 3D showcases by ~1.8 points on the Awwwards scale (Digital Strategy Force, 2026).
3. **Restraint reads as premium.** Terminal Industries (SOTM Sep 2025), By-Kin, Unseen, Iventions: WebGL used "for atmosphere instead of spectacle". Motion is opacity + small translate + rules drawing; nothing bounces.
4. **Type carries the story.** Obys (custom neo-grotesque), Unseen (Bootzy Condensed + script), Siena (poster type + cinema signage), pear.no (Flecha serif + GT mono). Kinetic type is the cheap route to "cinematic".
5. **Performance is the invisible half of the award.** Igloo compresses VDB volume data smaller than a JPEG; DeepSee caps DPR and renders only when visible; Lando lazy-loads everything; IVRESS ships TSL shaders that compile to WebGPU *and* WebGL. Judges now dock accessibility hard (6.0–7.0 on most immersive winners) — a real gap to exploit.
6. **Sound is back, as a narrative layer, opt-in.** Cartier (Mooders score via Web Audio), Igloo (SFX synced to particles), Awwwards Conf (ambient city sound, hi/lo quality toggle).

---

## 1. Pattern catalogue (35 reusable patterns)

Legend — **Cost:** 🟢 cheap (CSS/GSAP, hours) · 🟡 medium (GSAP + light WebGL/SVG, days) · 🔴 expensive (custom shaders, 3D assets, sims; weeks). **Cliché:** how overused it is in 2026 and how to dodge it. **MTF:** where it fits the SUN / Calypso story.

### A. Opening & structure

**1. Preloader as the first frame of the film (not a % counter)**
- How: real-time rendered intro that *becomes* the hero (Igloo: in-engine crystal growth; Siena: "dynamic stripes inspired by neo-romanesque Tuscan design" that slide into content; Lando: Rive logo mark). Progress is shown by the intro itself completing, or by a hairline drawing across the viewport (pear.no `@keyframes draw/ruleH/ruleV`).
- Cost 🟡 · Cliché 🔴 for the bare "000→100" mono counter on black — it is now a template default. Keep a tiny mono progress label only if it is in-world (e.g., a star magnitude, a compass bearing).
- MTF: darkness → a single star brightens (Preamble "one star grows brighter") → it descends and becomes the site. The loader *is* Canto 0.

**2. Pinned WebGL stage — the "film, not a stack" architecture**
- How: one `position: sticky` full-viewport `div.pin` with `canvas.gl` behind; page height ≈ 30–40k px; every content block is absolutely positioned inside the pin and toggled by scroll-state classes (`.on/.out/.live/.go`); lerped scroll via Lenis or GSAP ScrollSmoother (`smooth: 2–4`); ScrollTrigger timelines with `scrub`. This is literally pear.no's architecture and the Codrops "Cinematic 3D Scroll" recipe (single timeline maps scene segments to scroll progress; camera position + lookAt refs animated per segment; CustomEase curves like "cinematicSilk").
- Cost 🟡 (DOM/CSS stage) → 🔴 (custom GLSL sky/sea). Cliché: low if the stage changes meaningfully per chapter; high if it's just parallax.
- MTF: the whole home page is a ~9-chapter film. The sea/sky shader is the stage; Gozo, the veil, the net are layers.

**3. Scroll-lock chapters with entrance → hold → exit**
- How: each chapter gets a ScrollTrigger with `pin: true` and a timeline of 3 phases; text uses SplitText char/line stagger tied to progress; `toggleActions: "play none none reverse"` for replays. Utsubo pattern #2 "scroll as narrative sequencing". Sleep Well Creatives does this as an "immersive tunnel" in Webflow + GSAP (no Three.js).
- Cost 🟢/🟡 · Cliché: medium — avoid scroll-*jacking* (wheel hijack); scrub only.
- MTF: nine cantos = nine locked beats; each with one line of Homer-voice copy and one visual change.

**4. Rooms / alcoves per item (Cartier Watches & Wonders 2025, SOTM Aug 2025)**
- How: six self-contained 3D scenes ("alcoves, intimate protective spaces"), one per timepiece; you scroll room to room; Three.js + Blender assets, GSAP + Lenis, Web Audio score, "hidden gestures that reward curiosity". Digital twin of the physical pavilion.
- Cost 🔴 · Cliché: low.
- MTF: **four specialist events** on 27 Nov (Beautiful Destinations / MED READY / AI-Powered Hospitality / Coffee Experience) as four alcoves; or the **11 think tanks** as an 11-tesserae mosaic that opens into rooms.

**5. Timed / ephemeral experience (100 Lost Species, Immersive Garden, SOTD Oct 2025)**
- How: the site unfolds over 100 seconds and then vanishes — time itself is the mechanic; cream (#f3eed7) + black; Contentful.
- Cost 🟡 · Cliché: low.
- MTF: Canto IV "Seven Years" — a sunrise→sunset→seasons loop that runs on real time while you hold; or a 7-second veil that thickens if you stop scrolling.

### B. Camera, objects, 3D

**6. Scroll-driven camera dolly over terrain (Explore Primland, SOTD Feb 2026)**
- How: real terrain (heightmap → displaced plane, or photogrammetry) in Three.js with atmospheric fog; camera path (CatmullRomCurve3) sampled by scroll progress; lookAt eased separately.
- Cost 🔴 (asset) / 🟡 (procedural heightmap + noise) · Cliché: low.
- MTF: Gozo/Ogygia rising from the sea — "Red earth at Ramla. Honey-coloured limestone. Caves watching the horizon." A stylised low-poly/folk-art island, not photoreal.

**7. Single hero object with weight (Oryzo AI, Lusion, SOTM Apr 2026; Lando's helmet; Igloo's crystal)**
- How: one 3D object with inertial physics (spring-damped rotation following pointer/scroll velocity), Z-axis depth camera move on scroll, studio lighting; Oryzo adds "3D-to-2D-to-3D transitions" (object flattens into an illustration and back).
- Cost 🟡 (glTF + drei-style env light) → 🔴 (custom materials). Cliché 🔴 for glass torus / chrome blob heroes (the X "cinematic website" tutorials are full of them). Make the object *mean* something.
- MTF: the **star** (Calypso) as the hero object — a faceted gold/terracotta tessera-star that later becomes the sun; or the **open hand**.

**8. Image-to-3D / DOM-synced WebGL planes (Codrops Feb 2026 gallery)**
- How: each `<img>` gets a PlaneGeometry that tracks its DOM rect; ShaderMaterial with `uProgress` reveal; scroll value from ScrollSmoother/Lenis fed into the same rAF as the renderer (`gsap.ticker`); Barba.js keeps the canvas persistent across pages; GSAP Flip morphs the clicked image into the detail view; dispose textures on leave.
- Cost 🔴 · Cliché: medium (every studio portfolio does it) — earn it with a story-specific shader (tesserae, salt, veil).
- MTF: speaker portraits and past-forum photos that lift out of the mosaic.

**9. 3D → wireframe / blueprint transitions (Terminal Industries, REJOUICE, SOTM Sep 2025)**
- How: same mesh rendered twice (solid + `wireframe: true` / edges geometry), cross-faded by scroll; "premium immersion is restrained" — micro-animations, no spectacle.
- Cost 🟡 · Cliché: low.
- MTF: MED READY (destination readiness) — a Mediterranean map that resolves from wire to solid; AI-Powered Hospitality "AI in the back office, humans at the front".

**10. Explorable / playable world (Bruno Simon 2025 portfolio SOTM Jan 2026; Messenger by abeto, SOTY 2025)**
- How: Three.js + TSL (WebGPU/WebGL), Rapier physics, procedurally generated world, multiplayer via websockets (Messenger).
- Cost 🔴🔴 · Cliché: low but *wrong* for a policy forum — note as reference only.
- MTF: no. (Maybe a tiny raft mini-moment at the end — not a game.)

### C. Transitions & reveals

**11. Tesserae / mosaic grid transitions (SVG mask, Codrops Mar 2026)** ⭐ core MTF motif
- How: fullscreen `<svg>` mask over the image; grid of `<rect>` cells (14 cols desktop / 6 mobile, rows = cols × aspect); `gsap.utils.shuffle` the cells then `stagger: { each: 0.02 }` opacity/scale with ScrollTrigger `scrub: 2–2.5`; `shape-rendering="crispEdges"` kills sub-pixel gaps; variants: horizontal/vertical blinds (paired rects expanding from centre line), column-random waves. Upgrade path: WebGL — a Voronoi/tile UV in the fragment shader with per-cell delay from a noise texture (Igloo's crystal look; Sudonull's "Voronoi mosaic, pixelation and geometric masks").
- Cost 🟢 (SVG) → 🟡 (shader) · Cliché: medium for pixel/blocks; **low if the tiles are irregular tesserae with grout and gold leaf**.
- MTF: *the* signature — every image, every chapter change, the speakers wall, the 11-for-11 grid is a mosaic that assembles/dissolves. Byzantine/Roman floor-mosaic geometry (guilloche borders, wave meander) — not square pixels.

**12. Shader image transitions with SDF + noise (Codrops Jan 2025)**
- How: fragment shader mixes two textures by a mask; mask = `step(radius(progress), length(uv - c) + noise)`; concentric circle rings, `softMin/softMax` for blending; progress = `pow(t, 1.5)`. Companion piece (Oct 2025): drive uniforms from GSAP timelines (ripples, reveals, dynamic blur).
- Cost 🟡 · Cliché: low-medium.
- MTF: sea-ripple reveals (Ulysses washed ashore), sun-bloom reveals (Canto III "Gozo explodes into colour").

**13. Watercolor / fluid-sim reveal + cursor brush (David Whyte Experience, Immersive Garden, SOTM Dec 2024)**
- How: per-artwork fluid simulation on the pointer, stencil buffer limits it to the painting; reveal = layered pre-baked noise "water droplets" progressively uncovering the artwork; long-press on a painting plays the location video; Three.js + Nuxt + GSAP + Lenis.
- Cost 🔴 · Cliché: low.
- MTF: the **veil** ("Kalyptein — to cover, to conceal") — a gauze that the cursor thins; Canto VI "the veil tears".

**14. Particles → image / text morph; text dissolving to dust (Codrops Gommage, Jan 2026; Igloo VDB particles)**
- How: MSDF text (Cinzel, notably — a Roman capital face) in TSL; Perlin noise texture decides which glyph regions fade first; InstancedMesh dust (100) + petals (400) spawned from the fading regions; selective bloom via MRT mask. WebGPU-only in the tutorial — needs a WebGL fallback (simple alpha-dissolve). Igloo: custom VDB→browser exporter, particles form shapes, colour by speed, SFX synced.
- Cost 🔴 · Cliché: medium (generic "particles form a logo" is tired) — tie it to the story object (a leaf falling, stars multiplying).
- MTF: Conclusion — "A leaf falls. Black." then "The stars begin multiplying." Text of the title dissolving into stars.

**15. Text mask / line reveals (SplitText + clip-path)**
- How: `SplitText` into lines → each line wrapped in `overflow:hidden` mask → `yPercent: 100 → 0` staggered on enter; or `clip-path: inset()` / `mask-image` wipes; pear.no keeps it to opacity + 8px translate with `cubic-bezier(.22,1,.36,1)`.
- Cost 🟢 · Cliché 🔴 if applied to every heading. Use once per chapter, on the *one* line that matters.
- MTF: Homer's voice — one italic line per beat rising from the sea line.

**16. Gooey / liquid (SVG goo filter, metaballs, ASCII-liquid)**
- How: SVG `feGaussianBlur` + `feColorMatrix` alpha threshold on grouped blobs (CSS, cheap); or a metaball fragment shader; Unseen 2025 Wrapped's "ASCII liquid sim" (fluid sim rendered as glyphs).
- Cost 🟢 (filter) → 🔴 (sim) · Cliché 🔴 for blob heroes — only as a *material* (sea foam, olive oil).
- MTF: Olive Oil Consortium tessera; the sea meeting the shore.

**17. Page transitions with a persistent canvas (Barba.js + Flip; View Transitions API)**
- How: Barba intercepts links, keeps `canvas.gl` alive, GSAP Flip records the clicked element's rect and animates it to the new page; Siena/pear.no use fixed `canvas.trans` overlays that wipe with a directional blur. Native `document.startViewTransition()` for cheap cross-fades where WebGL isn't involved.
- Cost 🟡 · Cliché: low if consistent.
- MTF: home → speaker / think-tank / ticket pages via a mosaic wipe (pattern 11 as the transition).

**18. Velocity-aware post-processing (Siena, Igloo)**
- How: post-process pass whose blur amount/saturation/chromatic aberration is a function of scroll or slider velocity (Siena: horizontal blur on work pages, vertical on home; Igloo: chromatic aberration + "tech displacement" + frost on scene changes).
- Cost 🟡 · Cliché: medium — keep amplitude tiny.
- MTF: heat-haze on the sun chapter; salt-spray displacement on the storm.

### D. Typography

**19. 3D typography in pure CSS (Codrops Nov 2025)**
- How: `transform-style: preserve-3d`, `perspective: 70vw`, items positioned trigonometrically around a cylinder (rotateX), dual orbiting circles, or a Z-axis "tube"; rotation scrubbed by ScrollTrigger (`scrub: 1–2`). No Three.js.
- Cost 🟢 · Cliché: medium.
- MTF: "SEVEN YEARS" as a rotating cylinder of seasons; the 11 think-tank titles as a tube you fall through.

**20. WebGL / SDF text with glitch & scramble (Igloo)**
- How: entire UI rendered in WebGL; letter scramble = swapping SDF texture offsets (no DOM relayout); glitches in-shader.
- Cost 🔴 · Cliché: 🔴 the scramble/decode effect is now a Webflow cliché — skip unless in-shader and rare.
- MTF: not needed; use DOM type (accessibility, SEO).

**21. Kinetic editorial type as the main character (Obys, Mat Voyce, Unseen)**
- How: custom face (Obys NG), letters scale/split/morph on scroll via SplitText + ScrollTrigger; static frames designed to work as posters; pairing of a high-contrast serif with a mono label (pear.no: Flecha L 104px + GT Standard Mono 9–12px caps in translucent chips).
- Cost 🟢/🟡 · Cliché: low if the type is distinctive.
- MTF: **type is the cheapest route to "glorified".** Candidate pairings seen in this scan and fitting the brief — display: Cinzel/Cormorant/Fraunces (Roman capitals ↔ mythic), Instrument Serif or Newsreader Display (pear.no analogue); body: Instrument Sans / Geist; labels: Geist Mono / DM Mono. Consider a Maltese/Greek-inflected display face for chapter numerals (Ⅰ–Ⅸ cantos).

### E. Interaction furniture

**22. Custom cursor (with a role)**
- How: fixed div lerped to pointer (`gsap.quickTo`), scales/blends on hover targets; better: cursor-as-lens or brush (David Whyte watercolor; Hubtown by Unseen: pointer *reveals* geometric detail on a monolith).
- Cost 🟢 · Cliché 🔴 for the lagging dot/ring. Only ship if the cursor *does* something (thins the veil, shows a star).
- MTF: a small star that leaves a faint trail on the sea; becomes an open hand on CTAs.

**23. Magnetic buttons**
- How: on pointermove within radius, translate the button toward the pointer by `(dx, dy) × 0.2–0.35` with `gsap.quickTo`, spring back on leave (`elastic.out`). Olivier Larose's GSAP/Framer recipes.
- Cost 🟢 · Cliché 🔴 — everywhere. Use only on the single ticket CTA, subtle (≤ 8px).

**24. Nav overlay — giant serif index (pear.no `.nvm`) or dual local/global menu (Siena)**
- How: full-screen overlay, 4–6 items in display serif (~58px) each with a 9px mono index; enter with hairline rules drawing and staggered line masks. Siena: left rail = page-local nav (chapters), right panel = global nav, styled as cinema tickets.
- Cost 🟢 · Cliché: medium.
- MTF: left rail = the nine cantos with tick marks (pear.no's vertical rule + ticks); overlay = Forum / Programme / 11 for 11 / Speakers / Tickets, each with a Roman numeral.

**25. Marquee tickers**
- How: duplicated track, CSS `translateX(-50%)` loop, pause on hover, speed tied to scroll velocity.
- Cost 🟢 · Cliché 🔴 — the single most overused 2024–26 device. If used: one, mono caps, tiny, e.g. the country list ("31+ COUNTRIES · MALTA · ITALY · GREECE …") or the day tags.

**26. Hidden gestures / long-press rewards (Cartier, David Whyte)**
- How: pointerdown held > 400ms triggers a scene (video, secret room); subtle affordance ring.
- Cost 🟢/🟡 · Cliché: low.
- MTF: hold on Gozo to see the real Ramla/Calypso cave footage; hold on a speaker to hear a line.

**27. Web Audio narrative layer (opt-in)**
- How: score/ambience via Web Audio, unlocked on first gesture, crossfaded per chapter, mute toggle in the fixed chrome; SFX tied to particle bursts (Igloo); quality/sound toggle (Awwwards Conf).
- Cost 🟡 (assets) · Cliché: medium; **never autoplay**.
- MTF: the gala's nine songs are the set list — 3-second stings per canto; sea + wind bed.

### F. Conference / content components

**28. Horizontal galleries for speakers (Unseen 2025 Wrapped; Siena filmstrip; Codrops infinite gallery Jul 2026)**
- How: wheel/touch-driven horizontal track with per-item parallax speeds; infinite by wrapping; items fade/scale on enter; click → GSAP Flip expands the card to a full detail view; Siena renders the strip in WebGL as a film reel with directional blur by velocity. Keep native vertical scroll on mobile (horizontal trap is a known usability sin).
- Cost 🟡 · Cliché: medium.
- MTF: "Voices of the Mediterranean" — 40+ MTF10 speakers as tesserae in a long mosaic frieze (portraits cut into tile shapes with grout), country flags as mono labels.

**29. Cards that stack / path-scroll (MindMarket, Louis Paquet, SOTM Dec 2025)**
- How: sticky cards with increasing `top` offsets and scale-down on overlap; a Rive animation follows an SVG path via scroll progress.
- Cost 🟢 · Cliché 🔴 stacking cards are a 2025 Framer default. Prefer the mosaic grid.

**30. Schedule timeline (three days, one ecosystem)**
- How (premium version): sticky day tabs (25/26/27) on a left rail; a vertical hairline that *draws* as you scroll (pear.no `ruleV`); sessions as rows with mono time, serif title, tag chips; Next.js Conf uses a plain two-column table (title | speaker avatars) — clean but flat. Avoid accordions.
- Cost 🟢 · Cliché: low.
- MTF: 25 Nov (Knowledge & Policy, Forbes, B2B, Awards) / 26 Nov (Skills, Careers, 11 for 11, Gala) / 27 Nov (Plenary + four specialist events). Render the day as a sun arc: morning → evening.

**31. Countdown**
- How: tabular-nums mono digits, flip or roll (GSAP `yPercent` on stacked digit columns), reduced to days+hours; never a flashing widget. Web Summit / OFFF / Config ship **no** countdown at all — premium sites tend to imply time via copy and "Book tickets" persistence.
- Cost 🟢 · Cliché: medium.
- MTF: "81 DAYS UNTIL THE TENTH DAWN" in mono caps next to the fixed CTA — tie it to the star descending (Canto I "on the tenth dawn the star touched the earth").

**32. Ticketing CTA & stats**
- How: fixed top-right pill in mono caps ("APPLY →" pear.no; "Book tickets" Web Summit; "Get Tickets" OFFF repeated in nav/hero/footer), magnetic ≤ 8px; two audiences (Malta-based / International) as a segmented control rather than two buttons; stats (1,600+ participants · 31+ countries · 60% Malta / 40% international) as count-ups on enter with hairline frames — **not a bento grid** (Creative Boom lists bento as "over" in 2026).
- Cost 🟢 · Cliché: high for stat tiles; low for hairline-framed mono figures.

### G. Finish & performance

**33. Grain / film overlay**
- How: `feTurbulence` SVG inlined as a data-URI `background-image` on a fixed pseudo-element (~380 bytes, static → negligible cost); animated grain = 3–4 pre-baked frames cycled, never a live filter on the whole page on mobile; or grain in the final shader pass (pear.no does it in GLSL).
- Cost 🟢 · Cliché 🔴 "grain on everything" — use 2–4% opacity, warm-tinted, only over the stage.

**34. Hairlines, crosshairs, orbiting ellipses that draw in (pear.no)**
- How: `stroke-dashoffset` or `scaleX/scaleY` from 0 with `cubic-bezier(.22,1,.36,1)`; ellipse rims rotate 7.5s linear; tiny crosshair marks at corners; radial-gradient `mask-image` dot-grids (pear.no uses `mask-size: 2–5px`).
- Cost 🟢 · Cliché: low-medium — this is what makes pear.no feel "engineered".
- MTF: constellation lines drawing between stars; the sun as an orbiting rim.

**35. Performance & compatibility budget (what the Developer Award actually rewards)**
- How: cap `devicePixelRatio` at 1.5–2; render only when the stage is visible; KTX2/basis texture compression, Draco/meshopt glTF; TSL node materials so one shader graph compiles to WebGPU *and* WebGL (IVRESS/Utsubo; Bruno Simon); instancing for particles; `prefers-reduced-motion` → static frames with crossfades; a real HTML DOM under the canvas for SEO/a11y (judges dock 6–7/10 on accessibility for most immersive winners — beat them here).
- Cost 🟡 (discipline, not features).

---

## 2. Cheap vs expensive — the build ladder

| Tier | Patterns | What it buys |
|---|---|---|
| **Free-ish (CSS/SVG/GSAP only)** | 1 (SVG version), 3, 11 (SVG), 15, 16 (filter), 19, 21, 22, 23, 24, 25, 29, 30, 31, 32, 33, 34 | 70% of the "pear.no feel": pinned stage, line reveals, mosaic wipes, type, hairlines, grain, nav, schedule. Achievable procedurally with zero generated imagery. |
| **Medium (light WebGL / Rive)** | 2 (stage shader), 7 (glTF hero), 9, 12, 17, 18, 27, 28, 35 | Sea/sky GLSL stage, a single hero object (star/hand), shader reveals, persistent-canvas transitions, sound. |
| **Expensive (custom shaders, sims, assets)** | 4, 6, 8, 13, 14, 20, 10 | Rooms per event, Gozo terrain flythrough, watercolor veil, particle morphs, WebGL UI. Do at most **two** of these; pick the ones the story needs (6 Gozo + 13/14 veil/stars). |

Timeline reality from the round-ups: focused immersive landing pages 8–12 weeks; full brand sites 5–7 months (Metabole). We have 11 weeks to launch and ~3 of those must be content/CMS.

---

## 3. Overused / cliché in 2026 — avoid or subvert

From Creative Boom's "10 trends creatives are over in 2026" + Bubble/Fireart trend reports + this scan of award pages:

| Cliché | Why it's dead | What to do instead for MTF |
|---|---|---|
| 000→100 % preloader on black | Template default since 2022 | The star brightening / a hairline drawing = the loader |
| Dark + neon-lime accent + glass torus hero | The "$50k cinematic site" tutorial look (see the X refs) | Warm Mediterranean palette: sand #f3e3c3, sea teal #1d4a5c, terracotta #8c3a2b, gold #d9a441, ink navy; light *and* dark chapters (dawn ↔ night) |
| Glassmorphism / liquid glass | Spread far beyond where it made sense | Grout, stone, gold leaf, paper grain — matte materials |
| Gradient blobs / "tech-bro gradient" | Absorbed into AI defaults | Flat folk-art shapes with hard edges (the mythic folk-art ref) |
| Grain over everything | Signals "I watched the tutorial" | 2–4% warm grain on the stage only |
| Lagging dot cursor | Decorative, no function | Cursor that thins the veil / leaves a star trail, or none |
| Magnetic everything | Everywhere | One CTA, ≤ 8px pull |
| Marquee tickers ×5 | Most overused device of the cycle | One tiny mono country ticker, or none |
| Bento grids / stat tiles | "Ubiquitous across product showcases" | Hairline-framed figures, count-ups |
| Stacking cards | Framer/Webflow default | Mosaic that assembles |
| Text scramble/decode | Webflow cliché | Line masks, once per chapter |
| Split-line reveal on every heading | Noise | One line per beat |
| Parallax for its own sake | Disorienting, a11y complaints | Scroll = timeline with pinned holds |
| Horizontal scroll that traps mobile | Usability failure | Horizontal on desktop only; vertical mosaic on mobile |
| Autoplay sound | Instant tab close | Opt-in toggle in fixed chrome |
| AI-yellow generated imagery | "Instantly recognizable" (2026 designer survey) | Procedural/SVG/typographic base; generated imagery only as an optional, art-directed folk-art layer |
| Lazy minimalism / lazy maximalism | Both read as absence of an idea | One hard idea: the tesserae mosaic that tells Calypso's story |

---

## 4. Closest to "mosaic / mythic / Mediterranean" — 5 sites (+ 4 runners-up)

1. **Persepolis Reimagined — Getty Villa × Monks** — https://persepolis.getty.edu/ · FWA of the Year + People's Choice; Awwwards SOTY 2022 (Developer). Historically accurate 3D reconstruction of an ancient capital, chaptered walk-through, inscriptions read aloud, LOD/instancing/frustum culling for a browser-safe monument. *Take:* antiquity rendered as a navigable place; audio as narration; a 9-month dev-with-historians rigor we can borrow in spirit for Gozo/Ogygia.
2. **The Renaissance Edition — Shopify Design (Winter '26)** — https://www.shopify.com/editions/winter2026 · SOTM Feb 2026, animations 9.4/10. Product changelog as a scroll-driven gallery of generative Renaissance paintings; particle-dispersing type; two-colour palette (#F7F7EE / #292919); Blender + WebGL. *Take:* "modern art as part of how the story goes" — exactly the client's phrase — and proof that a *corporate* deliverable can be an art piece.
3. **Siena Film Foundation — Niccolò Miranda / G-NS Studio** — https://siena.film/ · SOTM Mar 2025. Tuscan neo-romanesque stripes as preloader, WebGL filmstrip slider, cinema-ticket dual menu, cream/black, velocity-driven directional blur; Webflow + Three.js + GSAP + Lenis. *Take:* a Mediterranean institution site that is austere, typographic and cinematic at once — the closest tonal sibling to pear.no in this scan.
4. **David Whyte Experience — Immersive Garden** — https://davidwhyte.com/experience/ · SOTM Dec 2024. Poetry told through watercolor landscapes; fluid-sim brush on the cursor; noise-baked watercolor reveals; long-press to unveil the real place. *Take:* the **veil** mechanic and "poem as chapter" pacing for Homer's lines.
5. **Son Daven — The First The Last** — https://sondaven.com/ · SOTM Jun 2026 (+ SOTD Jun 5, 2026). A Carpathian design resort where "Hutsul folk culture meets contemporary architecture, art and hospitality". *Take:* the exact brief problem — folk-art motif + hospitality + investment credibility — solved by the most-awarded storytelling studio; study how they keep folk pattern from becoming kitsch.

Runners-up: **Jacquemus** (https://www.jacquemus.com — Mediterranean light, full-width video scroll, editorial restraint; SOTD 2018), **Ponpon Mania** (https://ponpon-mania.com — an entire comic read in WebGL, custom shaders per panel, GSAP unifying DOM + GL; Codrops breakdown Oct 2025), **My Little Storybook** (https://exp-my-little-storybook.lusion.co/ — hand-drawn art blended into Three.js; Webby Best Visual Design), **Explore Primland** (https://explore.ownprimland.com — scroll flythrough of real terrain; the Gozo reference).

---

## 5. Conference / event sites that feel premium — 5 (+ what to skip)

1. **Next.js Conf — basement.studio** — https://nextjs.org/conf · SOTD + Developer Award (Sep 2024), Webby nominee 2025 (Events). Brand → website → stage design as one system; sessions as a disciplined title | speakers table; tiered sponsors with light/dark logo sets; Geist type. *Take:* the schedule/speaker/sponsor information architecture, and the idea that the site's identity *is* the stage identity (MTF: the gala's visual language = the site's).
2. **Cartier Watches & Wonders 2025 — Immersive Garden** — https://www.cartier.com/watchesandwonders · SOTM Aug 2025 (Agency of the Year 2025). An *event pavilion as a digital twin*: six 3D alcoves, Web Audio score, hidden gestures. *Take:* the four specialist events / 11 think tanks as rooms; the model for "experientially 3D" done with taste.
3. **Config 2026 — Figma** — https://config.figma.com/san-francisco/ · Identity of expressive glyphs (sketchy→crisp), "prompted textures" (scribbly linework, blurred gradients, oval particles), "looser, collage-y" motion that breaks containers; agenda/speakers/FAQ/location nav; virtual free / in-person $899; a Figma Community poster kit so the audience remixes the identity. *Take:* a **generative identity system** the community can play with (MTF: a tessera generator — every delegate gets a tile).
4. **Awwwards Conference** — https://conference.awwwards.com · Red-tinted 3D neighbourhood of the host city that rotates with mouse and scroll, ambient city sound, **hi/lo quality toggle**, ticket CTA top-right. *Take:* the quality/sound toggle pattern and "the city is the hero" (MTF: Valletta/Gozo).
5. **OFFF Barcelona** — https://www.offf.barcelona/ · Numbered speaker carousel (01–08) pairing origin + image, ticket CTA in nav + hero + footer, AVIF imagery, masterclasses/workshops/keynotes by date. *Take:* the numbered-lineup device (MTF: 11 for 11 numbered 01–11; speakers numbered by country).

Also looked at — take one thing each, skip the rest: **Sónar** (https://sonar.es/en — Sónar+D framing: "talks, panels, exhibitions, performances converge"; newsletter-first when tickets aren't on sale); **Web Summit** (https://websummit.com/web-summit-2026/ — circular-portrait speaker grid + "They've attended" logo wall = social-proof template, *not* premium; useful as the anti-pattern); **Google I/O 2026** (https://io.google — community puzzle that *unlocks* the date; a delightful pre-launch teaser mechanic); **WWDC26** (https://developer.apple.com/wwdc26/ — hybrid format page; restraint, nothing to steal visually); **Cannes Lions** (https://www.canneslions.com — enterprise registration portal; cautionary); **FlowFest 2025** (Awwwards SOTD, https://www.awwwards.com/sites/flowfest-2025 — warm gold/coral palette #F3A20F/#F97028 and illustration for a community conf; a11y 6.4/10).

---

## 6. Transposition — mapping patterns to the MTF11 story spine

| Beat (gala script) | Visual mechanic | Patterns |
|---|---|---|
| **Preamble — The Last Ship** ("Darkness. The Mediterranean… The Sun fills the screens… Thunder. The ship breaks apart… A sky full of stars") | Black stage, sea shader; sun tessera flares; mosaic *shatters* (tiles fall); stars = particles; one star brightens and becomes the cursor/hero | 1, 2, 11, 14, 22 |
| **Canto I — The Stranger** ("On the tenth dawn the star touched the earth… Ogygia… Gozo… The veil appears") | Star descends into Gozo rising from the sea (terrain dolly); title reveal; veil layer appears | 6, 7, 13, 15 |
| **Canto II — The Awakening** ("One wave. One breath. One morning.") | Three line reveals timed to a slow wave ripple shader | 12, 15 |
| **Canto III — Paradise** ("Gozo explodes into colour… Red earth. Thyme. Olive leaves turning silver. Salt. Wine.") | Mosaic assembles in full folk-art colour; sun bloom; first light chapter (cream stage) | 11, 12, 21 |
| **Canto IV — Seven Years** ("Sunrise → sunset → seasons… the veil crosses the screens") | Real-time sun arc; seasons cylinder type; the veil thickens when you stop scrolling | 5, 19, 13 |
| **Canto V — Forever** | The world ages around two unchanged figures — background mosaic weathers (grout darkens) while the hero tessera stays gold | 11 (shader), 18 |
| **Canto VI — The Other Woman** ("Orion. The Bear… The veil tears… I AM ULYSSES") | Constellation hairlines draw; veil tears (mask) | 34, 13, 15 |
| **Canto VII — The Open Hand** ("The net appears… Calypso cuts the net… Love is the hand that opens") | Net = mosaic grid lines; they release; tiles become the open hand → the **SUN** mark (Stewardship · Unity · Net Positive) | 11, 14, 32 |
| **Conclusion — The Poet / Homer** ("Everything disappears… I am Homer… I LIVED") | Everything to black; one star; then the forum: dates, three days, tickets — the sunrise | 2, 30, 31, 32 |

Information-architecture mapping: **Three Days** → pattern 30 with a sun arc; **11 for 11** → an 11-tesserae mosaic (pattern 11) opening into rooms (pattern 4, lite); **Four specialist events** → four alcoves; **MED READY** → wire→solid Mediterranean map (9); **AI-Powered Hospitality** → "back office / front" split-screen; **Coffee Experience (Lavazza)** → a warm single hero object (7); **Stats** → hairline count-ups (32); **Speakers** → mosaic frieze (28); **Tickets** → fixed pill + segmented Malta/International (32).

---

## 7. Recommended stack (from what the winners actually ship)

- **Scroll:** Lenis (darkroom.engineering, updated Jul 2026) or GSAP ScrollSmoother; GSAP ScrollTrigger + SplitText + Flip + CustomEase (all free since GSAP 3.13). Hamo/Tempus if React.
- **3D:** Three.js with TSL node materials (compiles to WebGPU + WebGL fallback — IVRESS, Bruno Simon 2025); OGL if we stay pear.no-minimal; Blender for any assets; Draco/meshopt + KTX2.
- **Transitions:** Barba.js (persistent canvas) *or* Astro + View Transitions for non-GL pages.
- **Vector micro-motion:** Rive (Lando, MindMarket) — optional.
- **Audio:** Web Audio, opt-in; Howler if we need sprites.
- **Framework:** Astro/Vite static (pear.no is a Vite app) + a headless CMS for programme/speakers (Next.js Conf / Immersive Garden use Nuxt/Next + Contentful/Dato/WordPress).
- **Budget:** DPR ≤ 1.5 mobile / 2 desktop; ≤ 2.5 MB critical path; 60 fps on mid-range Android for the stage; `prefers-reduced-motion` = static poster frames; real DOM under the canvas.

---

## 8. Sources

- Awwwards Sites of the Year / Month listings — https://www.awwwards.com/websites/sites_of_the_year/ · https://www.awwwards.com/websites/sites_of_the_month/
- Igloo Inc case study — https://www.awwwards.com/igloo-inc-case-study.html ; three.js forum — https://discourse.threejs.org/t/landing-site-igloo-inc/67249
- Lando Norris (OFF+BRAND) — https://www.itsoffbrand.com/our-work/lando-norris · https://www.awwwards.com/sites/lando-norris
- Messenger (abeto) — https://www.awwwards.com/sites/messenger
- Lusion / Oryzo — https://www.awwwards.com/sites/oryzo-ai · https://tympanus.net/codrops/2026/04/13/lusion-where-digital-craft-meets-ambitious-experimentation/ · https://lusion.co/projects/my_little_story_book/
- Immersive Garden — Cartier W&W case study https://www.awwwards.com/watches-wonders-immersive-experience-for-cartier.html · David Whyte case study https://www.awwwards.com/case-study-david-whyte-experience-by-immersive-garden.html · GQ&AP https://www.awwwards.com/sites/gq-ap-the-extraordinary-lab · 100 Lost Species https://www.awwwards.com/sites/100-lost-species
- Siena Film Foundation case study — https://www.awwwards.com/siena-film-foundation-case-study.html · https://siena.film/
- The Renaissance Edition — https://www.awwwards.com/sites/the-renaissance-edition · https://www.shopify.com/editions/winter2026
- Son Daven (The First The Last) — https://www.awwwards.com/sites/son-daven · https://sondaven.com/
- Floema (Bürocratik) — https://www.awwwards.com/sites/floema ; MindMarket — https://www.awwwards.com/sites/mindmarket ; Tracing Art (Resn × Getty) — https://www.awwwards.com/sites/tracing-art ; Terminal Industries (REJOUICE) — https://www.rejouice.com/work/terminal-industries ; Ponpon Mania — https://tympanus.net/codrops/2025/10/07/ponpon-mania-how-webgl-and-gsap-bring-a-comic-sheeps-dream-to-life/
- Unseen 2025 Wrapped — https://www.awwwards.com/sites/unseen-studio-2025-wrapped · https://2025.unseen.co
- Persepolis Reimagined — https://media.monks.com/case-studies/persepolis-reimagined · https://www.awwwards.com/case-study-getty-persepolis-reimagined.html
- Bruno Simon 2025 — https://bruno-simon.com/ · https://www.awwwards.com/brunos-portfolio-case-study.html
- Round-ups: Hon Tran 2026 https://www.hontran.dev/blog/best-award-winning-websites-2026 · Utsubo Three.js 2026 https://www.utsubo.com/blog/best-threejs-websites-2026 · Metabole immersive 2026 https://metabole.studio/en/blog/immersive-website-examples · Digital Strategy Force https://digitalstrategyforce.com/journal/why-are-immersive-experiences-dominating-the-2026-awwwards/
- Codrops tutorials: cinematic 3D scroll (Nov 2025) https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/ · SVG mask transitions (Mar 2026) https://tympanus.net/codrops/2026/03/11/svg-mask-transitions-on-scroll-with-gsap-and-scrolltrigger/ · shader image transitions (Jan 2025) https://tympanus.net/codrops/2025/01/22/webgl-shader-techniques-for-dynamic-image-transitions/ · shaders + GSAP (Oct 2025) https://tympanus.net/codrops/2025/10/08/how-to-animate-webgl-shaders-with-gsap-ripples-reveals-and-dynamic-blur-effects/ · Gommage text dissolve (Jan 2026) https://tympanus.net/codrops/2026/01/28/webgpu-gommage-effect-dissolving-msdf-text-into-dust-and-petals-with-three-js-tsl/ · 3D CSS text (Nov 2025) https://tympanus.net/codrops/2025/11/04/creating-3d-scroll-driven-text-animations-with-css-and-gsap/ · WebGL gallery + Barba + Flip (Feb 2026) https://tympanus.net/codrops/2026/02/02/building-a-scroll-revealed-webgl-gallery-with-gsap-three-js-astro-and-barba-js/ · infinite gallery + Flip (Jul 2026) https://tympanus.net/codrops/2026/07/30/building-an-infinite-gsap-scroll-gallery-with-parallax-and-flip-transitions/ · dreamy GPGPU particles (Dec 2024) https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/
- Conference sites: https://nextjs.org/conf · https://basement.studio/showcase/nextjs-conf-raising-the-bar-again · https://config.figma.com/san-francisco/ · https://www.figma.com/blog/the-visual-identity-behind-config-2026/ · https://www.offf.barcelona/ · https://sonar.es/en · https://websummit.com/web-summit-2026/ · https://www.awwwards.com/sites/flowfest-2025 · https://9to5google.com/2026/02/17/google-io-2026-puzzle/ · https://developer.apple.com/wwdc26/special-event/
- Clichés: https://www.creativeboom.com/insight/10-trends-creatives-are-so-over-in-2026/ · https://bubble.io/blog/web-design-trends/ · https://www.wazile.com/blog/outdated-web-design-trends-to-avoid-in-2026/
- Technique refs: grain via feTurbulence data-URI https://css-tricks.com/grainy-gradients/ · magnetic buttons https://blog.olivierlarose.com/tutorials/magnetic-button · Lenis https://github.com/darkroomengineering/lenis
- Ground truth: `brief/01-mtf11-concept-deck.txt`, `brief/02-calypsos-odyssey-gala-script.txt`, `brief/05-pear-no-deconstruction.md`, `brief/refs/pear-no.css` (keyframes: draw, ruleH, ruleV, cross, cfRim, cfGlow, shine, settle; ease `cubic-bezier(.22,1,.36,1)`; `mask-image: radial-gradient` dot grids at 2–5px; `backdrop-filter: blur(26px) saturate(1.15)`), `brief/06-x-references.md`.

*Notes on verification:* Awwwards pages for Son Daven, Cartier W&W 2025 and Ponpon Mania returned 502s during this scan; their descriptions come from the Awwwards SOTM listing, Codrops, CSSDA and studio pages. persepolis.getty.edu returned only a shell (JS app) — the URL is the canonical one from Getty/Monks. Cartier's public URL is as listed by Utsubo; confirm the locale path before linking.
