# CONCEPT A — "NINE NIGHTS"
### MTF11 · Mediterranean Tourism Forum 2026 · 11th edition · 25–27 November 2026 · Malta
### Lens: MYTH-FIRST. The site *is* Calypso's Odyssey. The 3D world is a sea under a sun. The Forum's facts are islands you discover, one per night.

Creative Director A · 2026-09-05 · v1
Ground truth: `/brief/01…06`, `/brief/refs/*`. Research digested: `narrative-spine.md`, `design-language.md`, `tech-spec.md`, `content-model.json`, `illustration-and-3d-art-plan.md`, `inspiration-scan.md`. Where this concept departs from the narrative spine it says so and why.

---

## 1. THE BIG IDEA

**Concept name: NINE NIGHTS.**

The gala script gives us the site's own clock in one stage direction: *"Aerial constellations. Nine nights. One star follows Ulysses and gradually descends. On the tenth dawn… the star touched the earth."* This concept takes that literally and makes it the entire architecture. The visitor is Ulysses. The page is a single continuous voyage across a WebGL Mediterranean at night, under one sun that sets in the hero and one star that descends a rung on the left rail with every night. Each night the sea gives up an island — a Roman mosaic floor rising out of dark water, seen from above the way a sailor first sees land — and carved into that floor is one fact of the Forum: Stewardship, the eleven forces, Malta and its 1,600 people, Unity's routes, three days, eleven think tanks, Net Positive and the people programme, the four bearings of 27 November, the gala's open hand. On the Tenth Dawn the star touches the earth, the wreckage becomes a raft, and the raft is the registration form. The sun that set in the first frame rises in the last, through the letters S·U·N that the visitor has been collecting on the rail. Eleven chapters — a hero, nine nights, a dawn — for the eleventh edition. The whole thing is one film ~80 viewports long, pinned, scrubbed, no sections, no stack. Myth leads; the Forum is what the myth turns out to have been about ("*I was telling you your story*").

**The one sentence a visitor should feel:**
> *I have been following a star for nine nights, and I want to be on that island when it touches the earth.*

**What is different from the narrative spine (and why).** The spine proposes 14 chapters with a tessera system that morphs into every object. This concept keeps its copy, facts and most of its beats but (a) re-keys to **11 chapters** (hero + nine nights + the Tenth Dawn) because eleven is the edition, nine nights is the script's own count, and eleven pinned beats is what a coding-agent team can genuinely finish in a day; (b) makes the **sea and the sky the permanent set** — every night is the same camera on the same water, so continuity is free and the world reads as a place, not a sequence of effects; (c) turns the conference facts into **islands** (tessera formations rising from the water), so "super mosaic" is the *ground* of the world rather than a transition trick; (d) merges Forever + What Remains into one long Night VII, and The Open Hand + I Am Homer into one Night IX, and the Raft + Sunrise into the Tenth Dawn.

---

## 2. TYPOGRAPHY + PALETTE (decided)

### 2.1 Type system — "CALYPSO" (System A from the design-language study, adopted as specified)

| Role | Face | Settings | Size token |
|---|---|---|---|
| Hero word `SUN` | **Fraunces** | wght 300 · opsz 144 · SOFT 0 · WONK 0 · `text-rendering: geometricPrecision` | `--t-hero: clamp(3rem, 8.5vw, 7.5rem)` lh .96 ls −.028em; the knockout word runs at `clamp(9rem, 26vw, 24rem)` (it is a mask, not text-on-a-line) |
| Night headline | Fraunces | wght 300–350 · opsz auto · SOFT 0 | `--t-display: clamp(2.25rem, 5vw, 4.5rem)` lh 1.02 ls −.022em |
| Island headline (Forum facts) | Fraunces | wght 350 | `--t-chapter: clamp(1.75rem, 3.2vw, 3rem)` lh 1.08 |
| Storyteller lines `[S]` | **Fraunces Italic** | wght 300 · **WONK 1** · SOFT 10–20 — the only place WONK is on | `--t-sub: clamp(1.25rem, 1.9vw, 1.75rem)` lh 1.18, max-measure 24em, one line per beat |
| Forum leads `[F]` | **Instrument Sans** | wght 400 · wdth 100 | `--t-lead: clamp(1.125rem, 1.4vw, 1.375rem)` lh 1.4 |
| Body | Instrument Sans | 400 (500 for emphasis, never 600+) | `--t-body: clamp(.9375rem, 1.05vw, 1.0625rem)` lh 1.55, measure 56ch (44–52ch on the stage) |
| UI / nav rows | Instrument Sans | 500 · wdth 92 | `--t-small: clamp(.8125rem, .95vw, .875rem)` |
| Eyebrows, chips, rail, coordinates, dates | **Geist Mono** | 400 (500 on dark ≤ 10 px) · uppercase · tabular-nums | `--t-label: clamp(.5625rem, .66vw, .6875rem)` ls .2em; `--t-index: .5625rem` ls .24em |
| Big stats (1,600+ / 31+ / 11) | Fraunces 300 opsz 144 for the numeral, Geist Mono for the unit | | `--t-display` |
| Gala title `CALYPSO'S ODYSSEY` | SVG paths (custom lettering drawn from Fraunces 300 caps, letter-spaced .06em, with the apostrophe as a gold tessera) | stroke-drawn then filled | ~`--t-hero` |

Load string (verified in the study): Fraunces `ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1;1,…` + Instrument Sans `ital,wdth,wght@0,75..100,400..700;1,…` + Geist Mono `wght@100..900`. Self-host woff2 in `/public/fonts` (latin + latin-ext for Ċ Ġ Ħ Ż), preload the hero serif with `font-display: optional`, `size-adjust` fallbacks so CLS ≈ 0. Rules: no uppercase serif; no Fraunces below 18 px; no per-letter reveals — lines only (SplitText `mask:'lines'`), and only one line per beat.

**Type enacts the story (three moments, each ≤ 1.2 s, `font-variation-settings` on a single element):** the hero word arrives `wght 200→300` (ink arriving); the Storyteller's lines in Night III and VIII go `SOFT 60→10` with `blur 6px→0` as the veil is drawn / torn; in Night VI the numeral **11** drifts `opsz 144→60` as "they stopped counting".

### 2.2 Palette — "OGYGIA" as system, "HELIOS" as story-scene mode (from the study; tokens verbatim, contrast computed there)

```css
:root{
  /* stage & sea */
  --press:#090D16; --abyss:#06192B; --sea:#0E3D57; --sky:#0F5A80; --lagoon:#2B8FA3;
  /* stone & paper */
  --paper:#F3EEE3; --cream:#FFF7E1; --star:#FFF9EA; --sand:#E8DCC2; --stone:#D6C39C;
  --ink:#1B1A17; --ink-soft:#3B3934;
  /* earth */
  --ramla:#B44A2D; --terra:#8C3A2B;
  /* gold — a range, never a flat */
  --gold-leaf:#F1C86A; --gold:#D9A441; --gold-deep:#A67C2E;
  /* olive & flame */
  --olive:#6F7A5C; --olive-silver:#A9B39C; --flame:#FF7A1A; --flame-hot:#FFD166;
  /* derived */
  --rule:color-mix(in oklab,var(--ink) 14%,transparent);
  --rule-dark:color-mix(in oklab,var(--star) 22%,transparent);
  --cross:color-mix(in oklab,var(--star) 53%,transparent);
  --chip:color-mix(in oklab,var(--star) 14%,transparent);
  --veil:color-mix(in oklab,var(--sea) 58%,transparent);
  --grain:.06;
}
:root[data-scene="story"]{           /* Palette B — the folk-art frames, used inside island plates */
  --press:#0F2F3B; --paper:#F3E3C3; --cream:#FBF1DC; --ink:#1D4A5C; --ink-soft:#2B5F73;
  --ramla:#C25A33; --gold-deep:#A6782B; --olive:#7A8A5A;
}
```

Hard rules that fall out of the contrast table: gold is never text on paper (1.94:1) — on light the warm word colour is `--terra`; `--ramla` is a surface, not a type colour; `--lagoon` only ever glints; `--flame` belongs to Helios' cattle and the wreck, never to UI. There is no grey anywhere: every neutral is stone or water.

**Temperature arc of the film** (the sky-dome stops and the DOM Rothko fields agree):
`00 gold on press ▸ I gold→thunder navy ▸ II abyss + starlight ▸ III sand/terracotta/teal (story mode, first light) ▸ IV teal + gold threads ▸ V full Fauvist (flame/teal/gold/ramla) ▸ VI stone floor, honey light ▸ VII cold sky-blue → living gold → olive-silver ▸ VIII brass on abyss, cold ▸ IX ink + cream (net) → pure #000 ▸ X teal + wood → sunrise gradient flame→gold→cream`

---

## 3. THE STORYBOARD — ELEVEN CHAPTERS, ONE SEA

**Global set.** One `WebGLRenderer`, one scene: a Gerstner sea plane (y = −1.5), a sky dome, a sun/star shader that has three modes (sun · star · eclipse), a 2,500-point starfield with nine drawable constellations, and **one instanced tessera field (12,000 tiles desktop / 4,000 mobile)** whose targets are rasterised from SVG. Every island is a formation of that same field, lying flat on the water like a Roman floor and lit by the star. The camera is a rig on a rail: low over the water (y .4–1.2), always looking at the horizon or down at an island. Post: one merged `EffectPass` (SMAA · Bloom · Tesserae · CA · Noise · Vignette). Film grain `--grain .06` over everything.

**Stage map** (1 unit = one viewport of scroll; total 80 vh + 1 for the sticky release; ≈ 72,000 px at 900 px viewports).

| # | Chapter | Night | Island (Forum fact) | Pillar glyph | vh | Master % |
|---|---|---|---|---|---|---|
| 00 | THE SUN | — (the last day) | Theme · dates · the three questions | all hollow | 5 | 0–6 |
| 01 | THE WARNING | Night I | **Stewardship** (the pasture of Helios) | **S fills** | 7 | 6–15 |
| 02 | A SKY FULL OF STARS | Night II | **Why now** — eleven forces | | 6 | 15–22 |
| 03 | OGYGIA | Night III | **Malta · Who is MTF · 1,600+ / 60-40 / 31+ · dates** | | 8 | 22–32 |
| 04 | THE HAND THAT LIFTS | Night IV | **Unity** — Air · Sea · Digital · People | **U fills** | 6 | 32–40 |
| 05 | PARADISE | Night V | **Three Days. One Ecosystem.** | | 8 | 40–50 |
| 06 | SEVEN YEARS | Night VI | **11 for 11** — MTF Brain Think Tanks | | 8 | 50–60 |
| 07 | FOREVER · WHAT REMAINS | Night VII | **Net Positive** + Skills · Careers · B2B · Knowledge & Policy Forum | **N fills → S·U·N complete** | 8 | 60–70 |
| 08 | THE HAND UPON THE RUDDER | Night VIII | **The Four** (27 Nov): Beautiful Destinations · MED READY · AI-Powered Hospitality · The Coffee Experience | | 8 | 70–80 |
| 09 | THE OPEN HAND · I AM HOMER | Night IX | **Calypso's Odyssey Gala · Awards · Voices** | | 8 | 80–90 |
| 10 | THE TENTH DAWN | Dawn | **Register · Stay · The Fleet · Foundation · footer** | S·U·N rise as the sun | 8 | 90–100 |

Emotional curve: AWE → GRAVITY → LOST/HOPE → ARRIVAL → TENDERNESS → JOY → TIME → FEAR→CLARITY→LEGACY → RESOLVE → LETTING GO→REVELATION → COURAGE→CATHARSIS.

Conventions: `[S]` Storyteller (Fraunces italic, verbatim from the gala script). `[F]` Forum (Instrument Sans, verbatim from the MTF11 deck unless marked *adapted*). `EYEBROW` = Geist Mono chip. Every night follows the same grammar — **entrance (0–.15) · the island rises (.15–.45) · hold on the fact (.45–.85) · exit (.85–1)** — so every scrub position lands on a composed still (the Bauhaus poster rule: one giant primitive, one hairline, one mono label). The Storyteller's line always appears *before* the Forum's; the Forum's copy sits on the island, never floating.

---

### 00 · THE SUN  (hero — the last day before the voyage)

**Frame.** *Background:* the sky dome at dusk-gold over a calm sea, horizon at 62% of the viewport. *Midground:* the sun — a disc of 12,000 gold tesserae (the field in its first formation), 70% of viewport height, its lower fifth already below the horizon; a wide, soft sun-path glitters on the water toward the camera. *Foreground:* the word **SUN** at 26vw, cut out of the disc as a knockout mask so the sun's light and grain pour *through* the letterforms; above it, small serif italic cream: *Mediterranean*. Left of the hero, one mono chip: `MEDITERRANEAN TOURISM FORUM · 11TH EDITION · MALTA · 25–27 NOVEMBER 2026`. Bottom-left crosshair + `THE SUN`. Bottom-right `01 / 11 · SCROLL`. Top-right pill `REGISTER →`. The logo's brushstroke Mediterranean lies as a single gold hairline along the horizon (it *is* the horizon). Colour temperature: warm gold on press-black; cream type. Mouse parallax ±6 px on type, ±14 px on the sun (inverse).

**Scroll 0→1.**
- 0–.12: the preloader's rising sun completes its rise (no cut). `Mediterranean` fades up; `SUN` mask reveals `wght 200→300`.
- .12–.30: sub-line `Stewardship · Unity · Net Positive` draws in under a hairline rule (`ruleH` 1.15 s); the three letters of the word glow one at a time, S then U then N, and the rail's three hollow glyphs blink in sympathy — the visitor learns the collection mechanic without being told.
- .30–.75: **the three questions** enter as three hairline-framed cards, right column, in sequence, each with its glyph: `S — WHAT MUST WE PROTECT?` · `U — WHAT CAN WE ACHIEVE TOGETHER?` · `N — WHAT SHOULD TOURISM LEAVE BEHIND?`. `[F]` *For thousands of years, the Sun has shaped Mediterranean civilisation…* / *Today, SUN represents the tourism model we want to build.* / *It asks three questions.*
- .75–1: the sun sinks. The disc drops below the horizon, reddens gold→flame→ember (`uWrath` 0→.4), the sky cools to navy from the top down, the sun-path narrows to a single ember line. Almost hidden, tiny, the first Storyteller stitch: `[S]` *The Sun fills the screens.* → *Darkness. The Mediterranean.*
- Camera: (0,.6,9) → (0,.4,7), fov 38, looking at the sun.

**CTA.** `REGISTER →` (persistent pill) · mono `WATCH MTF10 ↗` (link TBC).

**Transition → I.** No wipe. Against the ember rim, seven horned cattle step in from the right as flat black silhouettes, one every 80 px of scroll. Rail label rewrites `THE WARNING`. The star is not yet in the sky.

---

### 01 · THE WARNING  (Night I — Stewardship)

**Frame.** *Background:* the ember-rimmed horizon, sky navy, the sea black. *Midground:* the tessera field has re-formed as **the pasture of Helios** — a low gold island, flat, lying across the water from left to right, edges ragged (Thrinacia); on it seven folk-art cattle (terracotta and navy cut-outs, the small gold sun-brand on each flank) graze right-to-left. *Foreground, left third:* `EYEBROW S · STEWARDSHIP — WHAT MUST WE PROTECT?`; headline `Do not touch what belongs to the Sun.` (Fraunces 300, `--t-display`); beneath, six Storyteller lines in italic, one per beat. Sailors' hands enter from the bottom edge as long diagonal spear-lines (cream hairlines, the X-reference's grammar). Colour: gold pasture, flame rim, navy sky — the folk-art palette at night.

**Scroll 0→1.**
- 0–.15: pasture rises out of the water (tiles lift from y −1.5 to y −1.2, stagger by x, `--ease-set`); cattle walk on a 4-step `steps()` cadence keyed to scroll (the storybook stop-motion feel).
- .15–.45: `[S]` *His companions had been warned. / They knew. / And still they did.* One cow fills gold in a single step (the taking). Rays lengthen; the rim goes flame. `[S]` *Perhaps that too is human: / to know the road… / and still lose our way.*
- .45–.55: **thunder.** The stage flashes navy in three `steps()`, the camera drops to y .3 and rolls ±2°, and the pasture **shatters** — the Voronoi shatter, the one time it is used: tiles fly outward from the strike point and fall as rain into a sea that rises (`uStorm` 0→1). A ship silhouette (SVG, nine pre-split planks) breaks along lines radiating from the bolt; six sailors drop one by one. `[S]` *Zeus answered for Helios. / The ship breaks apart. / The sailors disappear.*
- .55–.85: **the fact lands on the wreck.** As the debris settles, the Forum's copy settles with it, in cream on the black water: `[F]` *Tourism brings opportunity — but also responsibility.* / *Visitors, businesses, authorities and communities all have a role in protecting the places we share.* / *Growth must improve the places people visit — not consume what makes them special.* Chip row `HERITAGE · ENVIRONMENT · COMMUNITIES · CULTURE · DESTINATIONS · SEA`; verb row `PROTECT → RESPECT → PRESERVE → ENHANCE`. Closing serif: **Enjoy the destination. Respect the place.** Sign-off mono `PROTECT WHAT MAKES THE MEDITERRANEAN SPECIAL.`
- .85–1: the last tiles sink. Black. One figure-height column of light on the water. `[S]` *Ulysses alone. / No ship. / No companions. / Only a man… / between sea and sky.* The rail's **S** fills gold with a soft glint; the star ticks down one rung.
- Camera: (0,.4,6) → (.8,.3,4), fov 42.

**CTA.** None — the S filling is the reward.

**Transition → II.** The sunken tiles begin, one by one, to rise as points of light. The camera tilts up 25°.

---

### 02 · A SKY FULL OF STARS  (Night II — Why now)

**Frame.** *Background:* the abyss. *Midground:* the risen tiles are now a starfield with real depth (the 2,500-point shell plus the tessera field as the brightest ~400 stars); the camera tilted up, the sea a black band at the bottom with star reflections. Eleven stars are brighter and labelled in 9 px mono. *Foreground, bottom-left:* `EYEBROW WHY NOW — TOURISM IS BEING RESHAPED BY FORCES FAR BEYOND TOURISM`; headline `Where do I go from here?` Colour: abyss navy, starlight cream, one gold star.

**Scroll 0→1.**
- 0–.20: `[S]` *For thousands of years, / sailors of this sea looked to the stars. / For direction. / For destiny. / Perhaps for the gods.* Nine constellations draw in sequence (Orion, the Bear, Cassiopeia, Pleiades, Boötes, Cygnus, Lyra, Aquila, Scorpius) — nine nights, drawn as hairlines.
- .20–.55: **the eleven forces**. Each labelled star pulses as its mono label appears: `AI & AUTOMATION` · `CLIMATE CHANGE` · `SEA-LEVEL RISE` · `OVERTOURISM` · `GEOPOLITICAL TENSIONS & CONFLICT` · `SECURITY & MIGRATION PRESSURES` · `TALENT SHORTAGES` · `HOUSING & REAL-ESTATE PRESSURES` · `CONNECTIVITY` · `CHANGING VISITOR EXPECTATIONS` · `SUSTAINABILITY & INVESTMENT`. Hairlines draw between the eleven — and the constellation they form is **the outline of the Mediterranean**, the logo's brushstroke, in stars. Nobody is told that eleven forces = eleven stars = eleventh edition.
- .55–.75: the two questions, opposed. The old one small, struck through by a hairline that draws across it: `HOW MANY TOURISTS CAN WE ATTRACT?` The new one at chapter scale: **WHAT KIND OF TOURISM CREATES THE GREATEST VALUE AND RESILIENCE FOR PEOPLE, PLACES AND BUSINESSES?** `[F]` *Events in one part of the Mediterranean can rapidly affect connectivity, visitor confidence, investment, supply chains and destination perception across the region.*
- .75–1: **collapse.** Every star lerps toward the one at Malta's position; it swells, gold, halo 40→140 px. `[S]` *One star grows brighter. / Was it Athena? / Destiny? / Hope? / He did not know. / He knew only that above him stretched… / **A SKY FULL OF STARS.*** The One Star locks to the rail as its permanent guide and begins its descent.
- Camera: (0,1,4) → (0,2.4,3), tilt up.

**CTA.** Mono hint bottom-right `NINE NIGHTS ↓`.

**Transition → III.** The One Star descends along a CatmullRom path from the sky to the horizon (2, −1.4, −8) over the lead/tail overlap, a 24-sample trail behind it, the other stars fading, a horizon rule drawing. `[S]` *On the tenth dawn… / the star touched the earth.* (The Storyteller is telling it in advance; the site will make it true in chapter 10.) Pure light — no veil yet.

---

### 03 · OGYGIA  (Night III — Malta · Who is MTF · the numbers)

**Frame.** *Background:* the first light in the film — dawn sand → teal sky (story mode `data-scene="story"`). *Midground:* **the island rises out of the sea as stacked cut-out planes** (Matisse): teal sea plane; honey-limestone stepped mesas with hairline bedding; the red crescent of Ramla; a cave as a black almond — an eye — with a gold iris (the star lives in the cave); a Ġgantija trilithon on the back plateau; five lollipop olives. Planes sit at different Z so a 12° orbit gives true depth; the sea plane carries the Gerstner displacement. *Foreground, left:* `EYEBROW OGYGIA · GOZO · MALTA — THE HEART OF THE MEDITERRANEAN`; headline `A diamond set in blue.`; an instrument frame with mono coordinates `36.0451° N · 14.2470° E` (Ramla). Colour: sand, terracotta, teal, gold — the folk-art reference at full strength for the first time.

**Scroll 0→1.**
- 0–.30: the star lands; ripples; the planes slide up back→front. `[S]` *A nymph. / Calypso. / And her island was called… / Ogygia. / An ancient name. / Primeval.* Calypso as a faceless teal cut-out figure (hair as a black flag blowing right, gold necklace) stands at the cave mouth.
- .30–.50: `[S]` *Through the centuries, Ogygia became rooted in the identity of an island at the heart of this sea: / **Gozo.** / Red earth at Ramla. / Honey-coloured limestone. / Caves watching the horizon. / The heart of the Mediterranean. / Its eye upon the sea. / Its soul carved in stone.* Each line lights its plane: Ramla fills red via a widening clip; the strata draw; the cave-eye opens (path morph flat→almond).
- .50–.85: **the host.** The camera orbits to reveal the island's flank as a mosaic floor: the tessera field forms a second island beside Gozo — the **Mediterranean outline** in stone and gold, with one pulsing tile at Malta. Mono `WHO IS MTF?` `[F]` *Mediterranean Tourism Foundation.* / *MTF brings together the public sector, private sector, academia and the next generation around one purpose:* **Advancing peace, prosperity and a better quality of life through tourism.** Stat trio, the tesserae swarming into three columns of digits: **1,600+** PARTICIPANTS · **60 % / 40 %** MALTA / INTERNATIONAL · **31+** COUNTRIES — ACROSS ALL CONTINENTS. `[F]` *Different sectors. Different generations. Different countries.* **ONE MEDITERRANEAN CONVERSATION.** Mono `THINK TOGETHER · LEARN TOGETHER · ACT TOGETHER`. Date chip, large: `25 — 27 NOVEMBER 2026 · MALTA · VENUE TO BE ANNOUNCED`.
- .85–1: **the veil appears** — the first of the film's two veil moments. A translucent sand cloth (3D plane, fbm sag, hairline grid, gold fresnel rim) drapes across the stage from the right carrying `[S]` *Kalyptein. / To cover. To conceal. To draw a veil.* Behind it the island dims. The Storyteller's type goes `SOFT 10→60`, blur 6 px.
- Camera: (0,.2,10) → through the trilithon → (0,.2,3), fov 36. Long dawn shadows.

**CTA.** Mono `BOOK A HOTEL IN MALTA ↗` (anchor to chapter 10's STAY block).

**Transition → IV.** The veil is the wipe: as it crosses, the mosaic post effect's grout widens (`uGrout .12→.30`) and colour desaturates toward sand; on the far side the grout snaps back and the sea is teal night again with two lights on it.

---

### 04 · THE HAND THAT LIFTS  (Night IV — Unity)

**Frame.** *Background:* deep teal night sea, the Mediterranean-outline island from III now lying in the middle distance as a dark stone floor. *Midground:* two flat cut-out hands — Calypso's reaching down from top-right (gold), the stranger's reaching up from bottom-left (terracotta) — hanging like Calder mobiles on invisible threads, swaying with the mouse. *Foreground, left:* `EYEBROW U · UNITY — WHAT CAN WE ACHIEVE TOGETHER?`; headline `Achieve together what we cannot achieve alone.` A single *luzzu* eye, tiny, at the bow of one sea-line. Colour: teal and gold threads.

**Scroll 0→1.**
- 0–.35: `[S]` *When she asked the stranger his name… / he answered: / Nobody.* / *Before Calypso loved Ulysses… / she saved him. / Made him stand. / Made him walk.* The hands close the gap with scroll.
- .35–.45: **they touch.** The sea-line brushstroke ignites, and **routes bloom across the whole Mediterranean island**: gold air-arcs lifting off the plane, teal sea-lines hugging the coasts, dotted digital lines, and people as pulsing tesserae at the ports (Malta brightest; 31 points for 31+ countries). Sol LeWitt rule behind it: *"lines from the star to 60 points on a grid."*
- .45–.85: `[F]` *The Mediterranean becomes stronger when it is better connected.* Four strengthen-lines, each drawing its route as it appears: **AIR** — destinations and markets · **SEA** — islands, ports and communities · **DIGITAL** — knowledge, business and opportunity · **PEOPLE** — Mediterranean talent and careers. Chip row `KNOWLEDGE · SKILLS · RECRUITMENT · ETHICAL MOBILITY · TRAINING · REGIONAL CONNECTIVITY · SHARED CHALLENGES`. Mono `CONNECT PEOPLE · CONNECT DESTINATIONS · CONNECT OPPORTUNITY`. Serif sign-off **Connect the Mediterranean.** `[S]` *A stranger. / A friend. / A hand when we needed one.* / ***I was different because you were there.***
- .85–1: the routes thicken into colour; the sea plane warms; the rail's **U** fills gold; the star ticks down. `[S]` *And then… / they were happy.*
- Camera: (3,1,8) → (−1,.5,3.5), azimuth sweep −20°→+15°.

**CTA.** Mono `B2B BUSINESS MEETINGS ↓` (anchor to Night VII).

**Transition → V.** A hard warm cut in light only: exposure rises 1.0→1.15, the sky flips to dawn, and the Gozo planes from III re-light in Fauvist saturation.

---

### 05 · PARADISE  (Night V — Three Days. One Ecosystem.)

**Frame.** *Background:* dawn over Gozo, the most saturated frame in the film: flame sky, teal sea, gold cliffs, ramla crescent. *Midground:* the hero's sun, small, sits on the horizon as a **scrubber**; instanced glints on the water; thyme, olive leaves (instanced, flipping green/silver), salt, a wine cup and a lyre as tiny cut-out icons blowing across on the wind. *Foreground:* `EYEBROW THREE DAYS · ONE ECOSYSTEM — 25 · 26 · 27 NOVEMBER 2026`; headline `Stay today.` Three tall hairline-ruled columns (the gala's three screens; opus sectile panels in stone / sea / abyss) slide in from the right, one per day. Colour: Fauvist — Matisse at Collioure.

**Scroll 0→1.**
- 0–.15: `[S]` *And then… they were happy. / Do not rush past that. / Morning over Ramla. / Red earth. / Thyme upon the wind. / Olive leaves turning silver. / Salt. / Wine. / Music. / The Mediterranean.* Each noun blows its icon across.
- .15–.85: **the sun crosses the sky three times** — sunrise → noon → sunset, once per day; each sunrise slides in that day's column. Day panels are real DOM lists (SEO), the sun position tweens between panels:
  - **DAY 01 — 25 NOVEMBER** — `[S]` *Stay today.* — Knowledge & Policy Forum · Forbes Travel Guide Plus Training · B2B Business Meetings · Networking Events · Mediterranean Tourism Awards. Mono `KNOWLEDGE · BUSINESS · CONNECTION · RECOGNITION`.
  - **DAY 02 — 26 NOVEMBER** — `[S]` *Tomorrow came. / Stay today.* — Mediterranean Knowledge & Policy Forum · Hospitality Skills Competitions · Hospitality Careers Programme · 11 FOR 11 — MTF Brain Think Tanks · B2B Business Meetings · Networking Events · Forbes Travel Guide Plus Sessions · **Calypso's Odyssey Gala**. Mono `PEOPLE · SKILLS · IDEAS · BUSINESS · EXPERIENCE`.
  - **DAY 03 — 27 NOVEMBER** — `[S]` *Again. / And again.* — International Morning Plenary · Followed by four specialist events: BEAUTIFUL DESTINATIONS — Architecture, Design & the Economics of Place · MED READY — Safe & Resilient Tourism Destinations · AI-POWERED HOSPITALITY — Re-Engineering the Tourism Economy · THE COFFEE EXPERIENCE — Powered by Lavazza. Mono `MEDITERRANEAN SUN`.
- .85–1: `[S]` *Calypso was happy. / The island that had always been paradise… / was no longer lonely.* The third sunset does not stop.
- Camera: (0,.8,7), slow dolly; horizon target.

**CTA.** Pill `FULL PROGRAMME →` (satellite page, TBC) beside the persistent `REGISTER →`.

**Transition → VI.** The sun's cycle accelerates; seasons flicker (island tint green → gold → grey → green); the planes bleach to sand; the tessera post effect coarsens `uCells 90→40`. `[S]` *And time passed.*

---

### 06 · SEVEN YEARS  (Night VI — 11 for 11)

**Frame.** *Background:* bleached sand sky, honey light. *Midground:* the bleached island planes have tilted flat and become **a floor** — the film's great mosaic: an eleven-piece Roman pavement (Domus Romana geometry, guilloche border, sand/terracotta/ink/gold tesserae) seen in perspective from a low bird's height, forming a monumental numeral **11**. Each piece is one think tank, its number set in the tesserae. Behind and above, fast and faint, the day/season cycle keeps running with mono date-stamps ticking in the corner (On Kawara) — time passing while a thing is built. *Foreground, top-left:* `EYEBROW 11 FOR 11 · MTF BRAIN THINK TANKS · 26 NOVEMBER`; headline `11th edition. 11 think tanks. One Mediterranean.` Colour: stone, honey, terracotta; ink grout.

**Scroll 0→1.**
- 0–.20: `[S]` *At first they counted the days. / Then the months. / Then… / they stopped counting.* The floor's guilloche border draws (`draw` 1.4 s); the numeral 11 in Fraunces drifts `opsz 144→60`.
- .20–.60: **the eleven pieces assemble** tile by tile along an andamento (flow field from the border inward, `--stagger-cell 8ms`), grouped by four hairline sectors: *PEOPLE & INNOVATION* 01 Attracting & Retaining Hospitality Talent · 02 The AI-Powered Hotel · 03 Hospitality for All; *REGIONAL ACTION* 04 MED READY · 05 Link Up Mediterranean · 06 Mediterranean Observer; *RESPONSIBILITY & VALUE* 07 Enjoy & Respect · 08 Mediterranean Blue Protection Centre · 09 Malta — Mediterranean Luxury Yachting Hub; *CULTURE & SERVICE* 10 Mediterranean Olive Oil Consortium · 11 Service Excellence.
- .60–.85: hold. `[F]` *11 Challenges • 11 Expert Groups • 11 Actions* / *Industry leaders, policymakers, academics, experts, entrepreneurs and young professionals work towards:* `RECOMMENDATIONS · PILOT PROJECTS · PARTNERSHIPS · PERMANENT MTF INITIATIVES`. Mono `THINK → CHALLENGE → DESIGN → ACT`. **Hover / tap a piece:** it lifts 40 px off the floor in true 3D with a shadow on the mosaic, and its card slides in from the right — title, tagline, the deck's body copy and closing line (e.g. `AI IN THE BACK OFFICE. HUMANS AT THE FRONT.` / `ATTRACT THE YACHT. SERVE THE YACHT. RETAIN THE VALUE.` / `PRODUCT → STORY → EXPERIENCE → VALUE`). Keyboard: arrow keys move the lifted piece.
- .85–1: `[S]` *Life never announces: / Remember this moment. / It simply happens. / And only later do we understand: / **THAT WAS OUR LIFE.*** The seasons stop. The floor holds.
- Camera: static (0,1.4,6) looking down 30° at the floor; hover parallax only.

**CTA.** Mono `JOIN A THINK TANK →` (mechanism TBC; the deck's Associate package includes the 26th BRAIN session).

**Transition → VII.** The floor darkens as if a cloud passed; the sky goes cold blue; the star (still descending) casts one long shadow across the pavement. `[S]` *Then one night…*

---

### 07 · FOREVER · WHAT REMAINS  (Night VII — Net Positive, and the people)

**Frame (first movement).** *Background:* a cold, flat sky-blue field (immortality) — the coldest colour in the film. *Midground:* across the sea, an Opałka **counter of arrivals** made of tesserae, mono digits climbing without end. *Foreground, left:* `EYEBROW N · NET POSITIVE — WHAT SHOULD TOURISM LEAVE BEHIND?`; headline `Leave more than we take.` Colour: cold blue, cream; then living gold.

**Frame (second movement).** The same sea, warm now: **an olive tree** (Penone-like — low-poly trunk, 600 instanced leaves that flip olive/silver in the wind) stands on a sand island; the camera rises through the canopy; four main branches. Late-afternoon gold. `EYEBROW PEOPLE · SKILLS · IDEAS · BUSINESS — 25–27 NOVEMBER`; headline `Perhaps immortality is what remains because we lived.`

**Scroll 0→1.**
- 0–.25: `[S]` *She offered Ulysses immortality. / No ageing. / No sickness. / No grave. / Forever young. / Forever together.* The counter climbs faster the more you scroll.
- .25–.35: `[S]` *But Ulysses understood what eternity had hidden from Calypso:* — on **Life matters because it ends.** the scroll *stops the counter*: digits freeze, then dissolve tile by tile. `[S]` *If tomorrow were infinite… / why would today be sacred?*
- .35–.55: a flat cut-out figure ages across three silhouettes — child, adult, elder — while behind them a place *flourishes*: a sapling grows into the olive tree, a harbour lights up, a street fills. Rothko bands slide the field from cold blue to living gold. `[F]` *Tourism's success should not be measured only by arrivals, nights and expenditure.* / *The ultimate measure:* **DOES TOURISM IMPROVE THE STANDARD OF LIVING OF THE COMMUNITIES THAT HOST IT?** The "Better…" list lands as leaves on the tree: `BETTER JOBS · BETTER CAREERS · BETTER PUBLIC SPACES · BETTER SERVICES · STRONGER LOCAL BUSINESSES · HEALTHIER ENVIRONMENTS · BETTER EXPERIENCES · GREATER OPPORTUNITY`. `[F]` *FROM A HOSPITALITY INDUSTRY → TO A HOSPITALITY CULTURE.* / *AI AS AN ENABLER — Better tourism • Better businesses • Better experiences • Better lives.* / *Create more value with fewer resources — and share that value with the community.*
- .55–.60: **the rail's N fills.** S·U·N reads whole for the first time and glows for one beat; the three glyphs pulse together. The star ticks down.
- .60–.90: **what remains** — the camera rises through the canopy; each of the four branches carries a programme, its leaves turning on approach to show they are tiny cut-out people: **HOSPITALITY SKILLS COMPETITIONS** — 26 Nov — `FRONT OFFICE · HOUSEKEEPING · RESTAURANT SERVICE · CHEFS · FOOD & BEVERAGE` · **HOSPITALITY CAREERS PROGRAMME** — 26 Nov — `HOSPITALITY · TECHNOLOGY · AI · FINANCE · CULINARY · SUSTAINABILITY · DESIGN · MARKETING · EVENTS · ENTREPRENEURSHIP` · **B2B BUSINESS MEETINGS & NETWORKING** — 25–26 Nov — Hotels • Tourism Operators • Buyers • Suppliers • Technology Companies • Investors • Destinations • Service Providers; `CONTACTS → RELATIONSHIPS → OPPORTUNITIES → PARTNERSHIPS → BUSINESS` · **MEDITERRANEAN KNOWLEDGE & POLICY FORUM** — 25–27 Nov — *Knowledge should not remain inside universities.* Academics • Policymakers • Industry • Researchers • Students; `RESEARCH → POLICY → BUSINESS → IMPLEMENTATION`; *TURN KNOWLEDGE INTO POLICY — AND POLICY INTO ACTION.* `[S]` *A child. / A kindness. / A courage. / A love. / A story. / Did we help someone stand?* Falling leaves become the mono arrows.
- .90–1: `[S]` *A leaf falls.* One silver leaf detaches and drifts down through the whole transition, turning black. Night falls on the tree.
- Camera: (0,.9,6) → rising to (0,2.6,4) looking down into the canopy.

**CTA.** Per branch, mono: `ENTER THE COMPETITIONS →` · `CAREERS PROGRAMME →` · `REQUEST B2B MEETINGS →` · `SUBMIT RESEARCH →` (links TBC).

**Transition → VIII.** The leaves' silver turns to starlight; the stars come back; the camera tilts up. `[S]` *…the heavens reminded him.*

---

### 08 · THE HAND UPON THE RUDDER  (Night VIII — The Four)

**Frame.** *Background:* cold night, the abyss, stars returned; only Orion and the Bear drawn, their lines *extended beyond their stars* off the right edge (the folk-art spear diagonal). *Midground:* a **brass astrolabe / compass rose** floating at centre — a wire-and-tessera instrument, outer rim rotating 7.5 s (`cfRim`), needle trembling with the mouse; beneath it the sea is Bridget Riley wave-lines, navy on ink, flowing in the needle's direction; mono `EAST` and `WEST` at the horizon's ends. *Foreground, top-left:* `EYEBROW 27 NOVEMBER · INTERNATIONAL MORNING PLENARY · FOUR SPECIALIST EVENTS`; headline `The wind may belong to destiny. The hand upon the rudder remains ours.` Lower corner: a folk-art plate, hand on a tiller, terracotta and gold (SVG; generated plate is the upgrade). Colour: brass on abyss.

**Scroll 0→1.**
- 0–.15: `[S]` *Orion. / The Bear. / East. / West. / The same stars that guided him toward Ogygia… / now pointed beyond it.* The rose assembles from the returning stars.
- .15–.85: **four bearings.** Scroll rotates the rose 90° per event and locks it with a soft click of light; the locked bearing's panel slides in from the right (real DOM, one at a time):
  - **N · BEAUTIFUL DESTINATIONS** — Architecture, Design & the Economics of Place. `[F]` *BEAUTY CREATES VALUE.* / *How can we create destinations that are: BEAUTIFUL • GREEN • ACCESSIBLE • LIVEABLE • INVESTABLE?* / *Green can be beautiful. Accessible can be beautiful. Functional can be beautiful.* Mono `BEAUTY → QUALITY → INVESTMENT → VALUE`. Glyph: a Matisse cut-out arch + palm frond.
  - **E · MED READY** — Safe & Resilient Tourism Destinations. `[F]` *HOW MED READY IS YOUR DESTINATION?* The acronym ladder draws one letter per line: M Mediterranean · E Emergency · D Destination · R Resilience · E Early Warning · A Action · D Disruption Readiness · Y Year-Round. *FROM CRISIS REACTION → TO DESTINATION READINESS.* Centre of Excellence partners (Tourism • Police • Civil Protection • Armed Forces • Medical Emergency • Fire & Rescue • Migration Authorities • Airports & Ports • Hospitality • Technology • Academia); `SHARE → PREPARE → STANDARDISE → CERTIFY → IMPROVE`; **MED READY CERTIFIED DESTINATION** / **CERTIFIED PROPERTY**; `ANTICIPATE → PREPARE → PROTECT → RESPOND → ADAPT → RECOVER`. For this bearing the rose becomes a **radar sweep** for one beat.
  - **S · AI-POWERED HOSPITALITY** — Re-Engineering the Tourism Economy. `[F]` *AI should not simply automate today's hospitality business.* / *IT SHOULD HELP US REDESIGN TOMORROW'S.* Mono `SIMPLIFY · AUTOMATE · PREDICT · OPTIMISE · ELIMINATE WASTE`. The six Ps orbit the rose as six tesserae: PEOPLE · PRODUCTIVITY · PERFORMANCE · PERSONALISATION · PLANET · PROFITABILITY (incl. AI-powered STR management). *SMARTER BEHIND THE SCENES. MORE HUMAN IN FRONT OF THE GUEST.* Glyph: a LeWitt 6×6 grid with one gold cell.
  - **W · THE COFFEE EXPERIENCE** — Powered by Lavazza. `[F]` *Coffee is more than a product.* / *In Mediterranean hospitality, it is part of the welcome, culture and guest experience.* Chips `COFFEE CULTURE · CONSUMER TRENDS · PRODUCT INNOVATION · BARISTA SKILLS · SERVICE EXCELLENCE · SUSTAINABILITY · TECHNOLOGY · F&B PROFITABILITY · GUEST EXPERIENCE`. *FROM COFFEE AS A PRODUCT → TO COFFEE AS AN EXPERIENCE.* Glyph: two concentric semicircles + three steam hairlines.
- .85–.95: `[S]` *Navigation awakened memory. / Memory awakened identity. / And the man who arrived calling himself Nobody remembered:* — **I AM ULYSSES.** The Storyteller's type snaps `SOFT 60→0` in one step; the Ulysses figure turns (`scaleX 1→−1`, `steps(1)`).
- .95–1: **the veil tears** — the second and last veil moment: the cloth enters and rips down the centre (`uTear` 0→1, halves parting), revealing an ink field strung with thread.
- Camera: (0,.6,5) → (0,2,4), tilt up to Orion, fov 46.

**CTA.** Per bearing mono `EXPLORE →` (satellite pages, TBC); chapter-level `THE FOUR — FULL DETAILS →`.

**Transition → IX.** Behind the torn veil, thread pulls taut across the stage; a knot; another. The net is being woven. `[S]` *Then came the net.* The star ticks down to its last rung above the horizon.

---

### 09 · THE OPEN HAND · I AM HOMER  (Night IX — the Gala, the Awards, the Voices)

**Frame (first movement).** *Background:* ink. *Midground:* the stage wrapped in a **net** — a wireframe of ink threads with Maltese *bizzilla* lace geometry at the knots, the camera inside it, the type reading *through* it; the net tightens with scroll. Behind the net, a giant flat cut-out **hand**, gold on ink, folk-art proportions — closed. *Foreground:* `EYEBROW 26 NOVEMBER · CALYPSO'S ODYSSEY · THE GALA`; the custom lettering **CALYPSO'S ODYSSEY** drawn as stroked SVG paths; sub *The Greatest Journeys Are Not Always Across the Sea*. Aerial performers hang above as suspended star-points. Colour: ink and cream, gold hand.

**Frame (second movement).** Pure `#000` — the only true black in the film — nothing but a mono eyebrow, one serif line, and, later, the star.

**Scroll 0→1.**
- 0–.25: `[S]` *For seven years Calypso had tried to keep what she loved. / Make paradise beautiful enough. / Stop time. / Offer forever. / Hold tighter. / But holding tighter does not stop departure. / Sometimes… it turns love into a chain.* Net `scale 1→.96` — holding tighter.
- .25–.35: `[S]` ***Calypso cuts the net.*** A cut line draws top→bottom; strands recoil and drift as loose lines; knots fall.
- .35–.55: **the hand opens** — one finger per line of the couplet — and as it opens its solid fill dissolves and ~420 tesserae fly in from a ring 600 px out to assemble it *as a mosaic* (gold-leaf palm → gold → terracotta → teal fingertips, 8% pure gold glints), a −30° specular band sweeping across at the end. `[S]` **Love is not the hand that closes.** / **Love is the hand that opens.** The gala lettering draws across the open palm.
- .55–.70: the Forum's facts sit in the palm. `[F, adapted]` *One Storyteller. No dialogue. Nine songs. One night.* / *A Mediterranean production of aerial constellations, ribbons, sea and fire — the story of the star that became Calypso, the island that became Gozo, and the hand that learned to open.* Nine-tick canto strip (mono, horizontal on desktop): `THE LAST SHIP · THE STRANGER · THE AWAKENING · PARADISE · SEVEN YEARS · FOREVER · THE OTHER WOMAN · THE OPEN HAND · THE POET`. Meta chip `26 NOVEMBER 2026 · MALTA · APPROX. 70 MINUTES · BY INVITATION (TBC)`. Second beat: `MEDITERRANEAN TOURISM AWARDS · 25 NOVEMBER` — the same hand holding a single gold tessera that becomes a star. `[S]` *And yet… three thousand years later… you know his name.* `[F, adapted]` *The Mediterranean Tourism Awards recognise the people, places and projects whose work will still be known when the season is over.*
- .70–.76: **everything disappears.** `[S]` *No acrobats. / No projections. / No music. / Only the Storyteller.* Every layer fades to `#000`. Then, at chapter scale: `There remains only one thing I have kept from you. My name.` — and a **hold**: 3 vh of scroll in which nothing responds. Then: **I am Homer.** / *You thought I was telling you an ancient story.* / ***I was telling you your story.***
- .76–1: **the voices.** The star appears above the type; as you scroll, its light falls on speaker orbs one at a time (rim draws in, name in serif, title in mono). Sub-block A `MTF11 · 2026 — SPEAKERS TO BE ANNOUNCED` → a row of empty orb rims labelled `TBA`, each filling with a star as a speaker is confirmed (data-driven from `speakers.json`). Sub-block B `VOICES OF THE 10TH EDITION` → curated MTF10 portraits (H.E. Myriam Spiteri Debono · Hon. Dr Ian Borg · Tony Zahra · Andrew Agius Muscat · Rajan Datar · Alex Connock · Manfredi Lefebvre d'Ovidio · Taleb Rifai · Sara Roversi · Anna Pollock · Dimitrios Buhalis · Glenn Mandziuk · Vitomir Maričić …) + a `THE MTF SENATE` strip. `[F, adapted]` *MTF11 speakers will be announced through the autumn. The Forum has always been a gathering of voices — heads of state, ministers, mayors, hoteliers, scientists, freedivers, broadcasters, chefs, students.* No other geometry: after eight nights of a moving world, stillness is the effect.
- Camera: inside the net (0,.5,7) → (2,.8,5) facing the hand; then no camera at all (black).

**CTA.** Pill `REQUEST AN INVITATION →` (TBC) · mono `AWARDS — NOMINATE →` (TBC) · mono `SPEAK AT MTF11 →` (mailto forum@medtourismfoundation.com, TBC) · `ALL VOICES →`.

**Transition → X.** `[S]` *Not every star is our destination. / Some enter our darkness only long enough to show us the way.* The star drifts down to the horizon line — the last rung — and on the black sea dark shapes float up: the wreckage from Night I.

---

### 10 · THE TENTH DAWN  (Register · Stay · The Fleet · the Foundation · the footer)

**Frame.** *Background:* pre-dawn navy over the sea, the sky a Rothko field of navy with one star sitting exactly on the horizon. *Midground:* the shattered tiles from Night I surface, drift together and **lock into planks**; a raft assembles in 3D on the wave-plane (five Box planks riding `oceanHeightAt()`, two battens, mast, a cream sail), lashed with the last strands of the net. *Foreground:* the registration form **on the raft's deck** — pill fields in pear's contact-form grammar with two hairline ellipse rims orbiting the submit button; the sail is a cream cut-out that fills with partner logos as tesserae. `EYEBROW THE APPLICATION — REGISTER FOR MTF11 · 25–27 NOVEMBER 2026 · MALTA`; headline `Build from it.` Colour: teal water, wood-terracotta, cream sail; then the sunrise gradient.

**Scroll 0→1.**
- 0–.20: `[S]` *Seven years earlier, the sea had thrown Ulysses onto Ogygia beside the wreckage of his ship. / Broken… but not destroyed. / Now Calypso used those same pieces to help build his raft. / The wood that carried him toward death… / would carry him toward life. / Perhaps that is what we must do with our own wreckage. / **Build from it.*** Planks arc into place, stagger .08; battens drop; the mast scales up; the sail unfurls.
- .20–.55: **REGISTER.** Two paths as a segmented control (2025 pattern; mechanics TBC): *Malta-based delegates* → `REGISTER →` · *International delegates* → `REGISTER →`; a third `Become an MTF11 Associate → ENQUIRE →` (Knowledge & Policy Forum speaker slot · 26th BRAIN session · 27th conference · hosting of clients). Fields: Name · Organisation · Country · Email · I am a: Delegate / Speaker / Partner / Student / Media. The persistent pill hides while the form is on stage. The name field's placeholder reads **Nobody.** — and the field's label becomes `I AM ___` as the visitor types.
- .55–.70: **STAY.** `[F, current site]` *Book your hotel in Malta with us — enjoy special rates.* → `BOOK NOW →` (partner and rates TBC). **THE FLEET.** `OUR ASSOCIATES` · `OFFICIAL AIRLINE OF THE MEDITERRANEAN TOURISM FORUM 2026` · `POWERED BY LAVAZZA (THE COFFEE EXPERIENCE)` — monochrome logos as tesserae in the sail (2026 list TBC; Lavazza confirmed in deck).
- On submit: the sail fills gold and the raft moves toward the star; mono `RAFT LAUNCHED — SEE YOU IN MALTA`.
- .70–.85: **the star touches the earth.** The camera pulls back and up; the raft is a point on a wide sea; the open hand from Night IX lies flat and **becomes the horizon line**. `[S]` *So when your own Odyssey reaches its final shore… / do not count the years. / Remember the people. / The laughter. The mistakes. The storms. / The hands that lifted you. / The people who stayed. The people who left. / And the people you loved enough… to let go. / And may you look back upon all of it — and say…* **I lived.** (the largest type since the hero).
- .85–1: **sunrise.** The three gold glyphs S · U · N detach from the rail, travel to the horizon, and rise *as the sun* — the hero's disc of tesserae — with the sunrise gradient (flame → gold → cream) spreading up the entire page. The final frame **freezes into mosaic** (post `uAmount` → 1): the site's last image is a mosaic sunrise. Under the sun, on the lit sea, the footer: four hairlines draw a frame; `EYEBROW MEDITERRANEAN TOURISM FOUNDATION · MALTA · SINCE 2013`; `[F, current site]` *The Mediterranean Tourism Foundation — We connect Mediterranean tourism stakeholders to promote dialogue, peace, and stability. Through education networks and sustainable projects, we support training, intercultural initiatives, and hospitality professionals, driving growth and resilience across the region's tourism and development sectors.* Columns: `THE FORUM` (The Sun · Three Days · Eleven for Eleven · The Four · Calypso's Odyssey · Voices · Register · Hotels · Partners · Full Programme) · `THE FOUNDATION` (Who is MTF · The Mediterranean Observer · Watch MTF10 · Press) · `CONTACT` (forum@medtourismfoundation.com · info@medtourismfoundation.com) · `FOLLOW` (Facebook · Instagram · LinkedIn — The Mediterranean Observer). Bottom rule: `THINK TOGETHER · LEARN TOGETHER · ACT TOGETHER` · `© 2026 MEDITERRANEAN TOURISM FOUNDATION` · Privacy · Cookies · `MOTION: FULL / REDUCED` · **BACK TO THE BEGINNING ↑**. Final couplet, mono caps, wide tracking, held under the sun: `LOVE IS NOT THE HAND THAT CLOSES.` — pause — `LOVE IS THE HAND THAT OPENS.`
- Camera: (0,.6,8) → (0,1.4,10), pull back; target the sun.

**CTA.** The form; `BOOK NOW →`; `BECOME AN ASSOCIATE →`; `REGISTER →` returns as a large gold pill on the sea; `BACK TO THE BEGINNING ↑` scrolls to the top where the same sun is waiting — the film loops, the rail resets, the nights begin again.

---

## 4. SIGNATURE MOMENTS — five things no conference website has done

1. **The Nine-Night Star.** One gold star is the preloader, the guide, the progress indicator and a character. It is born in the loader, brightens out of the eleven-star Mediterranean in Night II, then lives on the left rail and *descends one rung per night* — a real 3D sprite whose screen position is projected onto the rail so it is simultaneously a UI element and an object in the world. On the Tenth Dawn it touches the horizon and becomes the sun. The visitor's scroll position is literally "which night are we on".

2. **Islands that rise from the sea.** Every Forum fact is discovered as land: a Roman mosaic floor (12,000 instanced tesserae, targets rasterised from SVG, grout showing, gold tiles tilted like Ravenna's) surfaces from the water and the camera comes over it like a sailor sighting a coast. Stewardship's pasture, the Mediterranean-outline island of Who-is-MTF, the eleven-piece pavement of 11-for-11, the olive-tree island of Net Positive. The same tiles every time — the mosaic is the *ground* of the world, not a wipe.

3. **The word you have to earn.** The hero cuts S·U·N out of the sun; the rail carries three hollow glyphs; each fills with gold as its pillar's night is passed (S at I, U at IV, N at VII). The word completes only when the visitor has scrolled the whole story — and in the final frame the three letters leave the rail and rise as the sun. The theme is enacted, not announced.

4. **The net cut → the open hand → the horizon.** A lace-knotted net the camera sits inside; a cut that draws down the centre; a closed hand that opens one finger per line of the couplet *while* assembling itself from 420 flying tesserae; a specular sweep across the gold palm; and then that same hand lying down to become the horizon under which the sun rises. The gala's thesis becomes the site's last image and its footer.

5. **The raft is the form.** Registration is not a section; it is the wreckage of Night I resurfacing and locking into planks on live water. The form sits on the deck, the sail fills with partners, the name field's placeholder is *Nobody.* — and on submit the sail turns gold and the raft sails toward the star. The most-dreaded page on a conference site is the film's act of courage.

Small ones that make it feel engineered: the arrivals counter that *stops* on "Life matters because it ends"; the 3-vh scroll hold on "I am Homer" (the only moment the page refuses to respond); the veil that blurs the Storyteller's type through the font's SOFT axis rather than a filter; mono coordinates on every island (`36.0451° N · 14.2470° E`); the eleven forces that are eleven stars that are the eleventh edition, never explained.

---

## 5. THE MOSAIC SYSTEM

One material for the whole 3D world and one grammar for the DOM: the tessera — a quad with ±35% vertex jitter (never a hexagon, never an organic Voronoi blob), 1 px dark grout, per-tile tonal variance ±7%, gold ≤ 30% of any field and never adjacent in more than pairs, gold as an *angle* (a specular that moves with the pointer or scroll) rather than a colour.

| Where | What happens | Built with |
|---|---|---|
| **Preloader** | The sun is born as mosaic: the disc renders at `uAmount 1` (fully tessellated), and dissolves *radially from the sun outward* into the live render as the site becomes ready. The site *enters* as mosaic. | `TesseraeEffect` reveal mask (`uReveal 0→2`, `uCenter` = sun) |
| **Islands** (I, III, IV, VI, VII) | The instanced field morphs between SVG-rasterised targets (sun disc → pasture → Mediterranean outline → 11-pavement → hand → sun). Tiles lie on a shallow concave sheet; billboarded; per-tile tilt ±7°; gold tiles get a 60-power specular; a diagonal sweep glint crosses the field as scroll advances. | `InstancedMesh(PlaneGeometry(.08,.08), ShaderMaterial, 12000)` with `aTargetA/B/C`, `aStart`, `aRand`; `uMorph` tweened by the master timeline |
| **Night transitions** ("tessellate") | The outgoing frame becomes tesserae along an *andamento* — a flow field from one edge — and the incoming frame is revealed cell by cell. 0.9 s, `--ease-veil`. Used between II→III, V→VI, VI→VII. | Post `uAmount` + `uFlow`; DOM twin: SVG-mask grid of 16–20 px cells with an ordered threshold |
| **Shatter** (once, Night I) | The pasture fractures from the strike point; tiles fall as rain and sink; the *same* tiles rise as stars. | Field morph to a scattered target with `easeInCubic` on y; then to the starfield target |
| **Veil** (III→IV cover; VIII tear) | Tiles keep position; grout widens `uGrout .12→.30` and colour desaturates to sand; type SOFT 0→60. Reverse = the tear. | Post uniforms + 3D cloth plane (`veil.vert/frag`, `uTear`) + `font-variation-settings` |
| **Net → open hand** (IX) | Grid lines thicken into a net (grout 1→3 px, `--gold-deep`), the cut dissolves them from the centre outward, cells drift apart, then ~420 tiles fly in to assemble the hand as the fingers unfold; −30° specular band at the end. | SVG hand as clipPath + JS-generated `<rect>` tiles (A11) on desktop; the 3D field target on high tier |
| **Hover** | Chips (labels) are tesserae with 1 px grout and a flood fill; cards carry a radial-gradient glint at `--mx --my` (max opacity .22); think-tank pieces lift 40 px with a shadow on the floor; the cursor ring squares into a 12 px tessera over a chip. | CSS custom properties + one `pointermove` lerp |
| **Type** | Big numerals (1,600+ / 31+ / 11) swarm into place from tiles; the gala title's apostrophe is a gold tessera. | Field targets rasterised from canvas text |
| **Speakers / partners** | Orbs and logos sit in brickwork grids (odd rows offset ½ cell), 1 px grout, ≤ 6° tilt on hover (the Domus Romana perspective-cube border, not a card flip). | CSS grid |
| **Footer** | The final frame freezes into mosaic (`uAmount → 1`) under the risen sun. The site *exits* as mosaic. | Post |
| **Never** | Body copy, the programme lists, the form, the nav. Tessellation is for image, ground and transition — never for information. | — |

Rules from the study: dark grout always; no mosaic *photographs* — procedural only (generated imagery, if it arrives, goes into figure plates, not textures); `uCells` runs 90 (fine, vermiculatum) → 24 (coarse, tessellatum) between scenes; on mobile the post drops Voronoi for rotated-square tiles, and the DOM/SVG mask carries transitions.

---

## 6. THE MYTHOLOGICAL ART

**Style, in one line:** Matisse-cut folk art inside an instrument. Every figure is a faceless silhouette built from primitives (circle head, capsule torso, trapezoid, no outlines, slightly rough scissor edges via `feTurbulence` .04 + `feDisplacementMap` 3), in five colours (sand, teal ink, terracotta, gold, flame) plus press black; 70%+ negative space; one dominant diagonal per composition; and every plate sits inside a hairline **instrument frame** — 1 px rule inset 4%, corner crosshairs, mono caps label top-left (`NIGHT 03 · OGYGIA`), coordinates bottom-right, a 72-tick ruler that draws in. Folk art inside an observatory is what keeps it 2026 rather than 1926.

| Figure / glyph | Where | Built how |
|---|---|---|
| **Helios' sun** — disc with seven broken ray-rings, limb darkening, granulation, `uWrath` | 00, I, X | GLSL sphere + additive corona billboard + 48 ray quads (B1); the 12k-tile disc in front of it is the field's first formation |
| **The cattle of Helios** — seven cut-out cows, gold sun-brand on the flank, 4-step walk | I | SVG `#cow` symbol ×7 (A1) → `SVGLoader → ShapeGeometry` flat meshes on the island plane; `steps()` cadence keyed to scroll |
| **Zeus' bolt** — one cream polyline with a gold blur twin | I | SVG (A1/A2) + three scroll-triggered `PointLight` flashes (B10) |
| **The ship and its planks** — nine planks pre-split along lines radiating from the bolt; five survivors are reused as the raft | I → X | SVG clipPaths (A2), survivors exported as `#plank1..5`; 3D raft planks are `Box(2.4,.12,.36)` riding `oceanHeightAt()` (B9) |
| **Nine constellations + the One Star** — Orion, the Bear, Cassiopeia, Pleiades, Boötes, Cygnus, Lyra, Aquila, Scorpius; the star with four diffraction spikes and a halo | II, VIII, IX, X | `Points` shell (2,500) + `LineSegments` with a per-segment `aOrder` draw attribute; `Sprite` star on a `CatmullRomCurve3` with a 24-sample trail (B4); the same star projected to the rail |
| **Calypso** — teal cut-out, hair as a black flag blowing right, gold necklace and armlets, no face | III, IV, IX | SVG `#figure` variant (A4) as a flat mesh on the cave plane |
| **The veil** (*kalyptein*) — sand cloth, hairline gold grid, fresnel rim, scalloped hem; tears down the centre | III→IV, VIII | 3D `PlaneGeometry(6,4,120,80)` cloth shader with `uTear` (B8); DOM twin with `feDisplacementMap`; mobile = Riley moiré (D5) |
| **Ogygia / Gozo** — stepped honey mesas with bedding, Ramla crescent, cave-eye with a gold iris, Ġgantija trilithon, five olives | III, V | Stacked SVG planes via `SVGLoader` at different Z (A5); trilithon as `RoundedBox` limestone with triplanar fbm (B6, high tier only) |
| **Two hands / the luzzu eye** — gold hand from above, terracotta hand from below, meeting; one Maltese boat-eye at a sea-line's bow | IV | SVG cut-outs hung on Calder threads (rotation lerped to pointer) |
| **The wind icons** — thyme sprig, olive leaf, salt crystal, wine cup, lyre | V | Tiny SVG symbols on `offset-path`, blown right→left |
| **The eleven-piece pavement** — guilloche border, four hairline sectors, numerals set in tesserae | VI | Field formation from a rasterised SVG + DOM cards; the guilloche is an SVG path with `pathLength=1` |
| **The arrivals counter, the three ages, the flourishing place** — Opałka digits; child/adult/elder silhouettes; sapling → tree, harbour, street | VII | Field digits; SVG figures; the tree is low-poly (`Cylinder` trunk + 600 instanced double-sided leaves, `gl_FrontFacing ? olive : silver`, B5) |
| **The astrolabe / compass rose** — brass rim, tessera dial, trembling needle; Orion and the Bear with lines extended beyond | VIII | SVG hairline instrument + 72 instanced tick boxes; the needle lerps to the pointer; A8 extended-line device |
| **The hand on the tiller** plate | VIII | SVG folk-art plate; generated plate is the upgrade |
| **The net** — ±45° hairline families clipped to a circle, knots as lace | IX | `LineSegments` (cream α .55) in 3D so the camera sits inside it; SVG twin on mobile |
| **The open hand** — closed fist → open palm, 420 tesserae | IX, X | SVG fist/open states with finger capsules rotating about knuckles (A11); tiles generated in JS or the 3D field |
| **Homer** — cloak as a tall black triangle that splits and falls, staff in gold | IX | SVG (A12); appears only as the black holds |
| **The raft** — five survivor planks, battens, mast, cloth sail with a vertex sine | X | 3D (B9) on the Gerstner sea; SVG twin (A10) for `mode-page` |
| **The SUN sigil** — three hairline rings, S·U·N on a textPath, 72-tick outer ring | rail, loader, favicon | SVG (U1); the tick ring rotates `P·360` as the page-progress instrument |
| **Modern-art register** (composition, never reproduction) | per chapter | Eliasson sun (00) · folk-art frieze (I) · Miró constellations (II) · Matisse cut-outs (III) · Calder mobiles + LeWitt lines (IV) · Fauvist Collioure (V) · Domus Romana + On Kawara (VI) · Opałka + Rothko + Penone (VII) · portolan charts + Riley waves (VIII) · Shiota threads + Reinhardt black (IX) · El Anatsui assemblage → Rothko dawn (X) |

**Upgrade layer (when generation credits arrive).** Plates in priority order, all placed *behind* the tessera system inside the same instrument frames, never replacing the 3D: Night I cattle frieze; Night III Gozo + Calypso cut-out; Night VIII hand on the tiller; Night IX Calypso cutting the net / the open hand; Night X raft; hero sun plate; Night IV two hands; a 10 s veil loop. Style-lock and negatives are in the art plan §E.

---

## 7. NAVIGATION, PERSISTENT UI, CURSOR, PRELOADER, OVERLAY, FOOTER

**Preloader — "DARKNESS · THE MEDITERRANEAN."** Press-black. A hairline horizon rule draws left→right (`ruleH` 1.15 s). Below it, nothing; above it, one small mono line: `DARKNESS · THE MEDITERRANEAN`. Loading is shown *in world*: the sun disc, fully tessellated, fills from the bottom behind the horizon as fonts resolve, shaders compile and chapters mount (`fonts.ready → compileAsync → first frame`); no percentage anywhere. At ready: the mono flips to `THE SUN FILLS THE SCREENS`, the rule ignites gold, and the sun rises through it — the mosaic dissolving radially into the live render — and that rise *is* chapter 00. Minimum 900 ms, maximum 6 s; warm visits skip straight to the rise. Scroll or click skips. Reduced motion: fade.

**Left rail (fixed, `--v1` = max(1.25rem, 2.65vw), top 24%).** A 1 px vertical grout line with eleven ticks (00, I–IX, X). Active tick widens 9→22 px with its 9 px mono label (`NIGHT III · OGYGIA`); passed ticks stay lit at 40%. A second gold strand braids around the line as progress — the guilloche. **The star** sits on the rail at the current night's rung (projected from the 3D sprite so it is the same object); it descends between nights with `--ease-tide`. Three hollow glyphs **S · U · N** at ticks I, IV, VII fill gold as passed; hover shows the pillar's question. Hamburger (two hairlines) at the top opens the overlay. Hidden while the footer is on stage.

**Persistent CTA.** Top-right pill `REGISTER →`, Geist Mono 10–11 px caps, `--chip` with a hairline rim, flood on hover, magnetic ≤ 8 px (off on touch). Its fill warms with scroll — cream at 00, gold with the cartellina inner highlight and rotating rim by Night VIII. From Night VIII on wide screens: `REGISTER · 25–27 NOV`. Hidden during chapter 10's form; returns as the large gold pill on the sea.

**Corner marks.** Top-left: the logo's Mediterranean brushstroke redrawn as a single 1 px path, drawn in on load (`draw` 1.4 s), `MTF` in mono beside it; click = top. Bottom-left: crosshair + the chapter label (`THE SUN`, `THE WARNING`, …). Bottom-right: `03 / 11` + `SCROLL` with a 1 px breathing rule; after the first scroll, `NIGHT III`. Optional `SOUND · OFF` (sea + wind bed only; no song stings — the nine songs are licensed works; TBC with client).

**Nav overlay.** Press-black with `--veil` + `backdrop-filter: blur(26px) saturate(1.15)`; six giant serif items (Fraunces 300, `clamp(34px, 4.6vw, 86px)`, lh .98) each with a 9 px mono index, rules drawing between them at .3/.4/.5 s delays, siblings dimming to 34% on hover; the sea-line hairline draws behind the list. Items: `01 The Sun` (STEWARDSHIP · UNITY · NET POSITIVE → 00) · `02 Three Days` (25 · 26 · 27 NOVEMBER → V) · `03 Eleven for Eleven` (MTF BRAIN THINK TANKS → VI) · `04 The Four` (BEAUTIFUL DESTINATIONS · MED READY · AI · COFFEE → VIII) · `05 Calypso's Odyssey` (THE GALA · 26 NOVEMBER → IX) · `06 Register` (THE APPLICATION → X). Mono row beneath: `VOICES · HOTELS · PARTNERS · THE FOUNDATION · CONTACT · WATCH MTF10 ↗`. Right column meta: `MEDITERRANEAN TOURISM FORUM · 11TH EDITION` / `25–27 NOV 2026 · MALTA` / socials. Choosing an item scrolls the film to that label (`scrollToChapter`) with the star visibly jumping rungs — the nav is a time machine, and it says so.

**Cursor (desktop only).** 6 px dot (instant) + 28 px ring (lerp .15). On dark the ring is a four-point star at 60% `--star`; over a chip it squares into a 12 px tessera with 1 px grout; over a think-tank piece or speaker orb it grows to 56 px with a 9 px mono word (`LIFT`, `OPEN`); over any CTA it becomes the tiny open-hand glyph; over inputs it hides. Off under reduced motion and on `pointer: coarse`.

**Footer.** Is chapter 10's last movement (§3). Four hairlines frame it; the reduced-motion toggle lives in its mono row; `BACK TO THE BEGINNING ↑` loops the film. In `mode-page` (no JS / no GL / reader / print) a plain footer with the same content renders below the stacked chapters.

**Satellite pages** (Programme, each Think Tank, each of the Four, Gala, Voices, Register — all TBC): the same pinned stage holding one island still, with the content below on limestone paper (Palette A light: `--paper` ground, `--ink` type, `--terra` accents, faint 24 px pencil grid). Plates of the film, not new designs. Page transitions: the tessellate wipe with a persistent canvas.

---

## 8. MOBILE STRATEGY

Same film, same eleven chapters, same copy — re-composed for portrait, cheaper under the hood.

- **Architecture unchanged:** sticky pin with `100dvh`, `overflow: clip`, `ScrollTrigger.config({ ignoreMobileResize: true })`; Lenis `syncTouch: false` (native touch momentum); `touch-action: pan-y`. `mobileLength` shortens holds by ~25% (total ≈ 60 vh).
- **Composition:** every chapter's `chapter.css` has a `@media (max-aspect-ratio: 4/5)` layout — the island sits in the lower 55% of the viewport, type in the upper 45%; day columns, bearings and branches stack vertically and are revealed one per scroll beat instead of side by side; the eleven-piece pavement becomes a vertical 11; the nine-tick canto strip becomes a vertical list; the form's two paths stack.
- **World:** tier `mid/low` — tessera field 4,000 (or a 2D `<canvas>` fallback ≤ 3,000 sprites on `low`), sea 96², stars 5k, no ChromaticAberration/SMAA, Bloom `resolutionScale .25`, DPR ≤ 1.25, `uMouse` = 0; the post drops Voronoi for rotated-square tiles; the 3D veil and net are replaced by their SVG/CSS twins (Riley moiré veil, SVG net).
- **Chrome:** pill CTA bottom-centre above the safe area; the rail collapses to the star + the three S·U·N glyphs + a thin progress strand at the left edge; corner marks reduce to the MTF mark and `NIGHT III · 03/11`; the overlay is the same six serif items at `clamp(34px,…)`.
- **Touch:** no hover affordances — think-tank pieces lift on tap and show a `↑` glyph; speaker orbs expand on tap; no magnetic, no cursor.
- **Type:** the SUN knockout runs at 26vw so it still fills the width; Storyteller lines stay one per beat; measures 38–44ch.
- **Weight:** fonts ≤ 220 KB subset; JS ≤ 330 KB gz total; the preloader hides the cost, the star keeps the visitor.
- **Reduced motion / `mode-page`:** first-class — chapters stack as static full-bleed posters (Rothko fields + SVG islands + the copy); crossfades ≤ .3 s; the site must be beautiful with the canvas off.

---

## 9. BUILD RISKS AND MITIGATIONS

| # | Risk | Mitigation |
|---|---|---|
| 1 | **Disk is full (~136 MB free)** — `npm install` fails | Free ≥ 2 GB before anyone runs the install; blocking, owner: integrator, first hour |
| 2 | **One day for eleven 3D chapters** | Build ladder with cut lines. **Tier 0 (must ship):** stage + Lenis/ScrollTrigger + sea + sky + sun/star shader + starfield + the tessera field with six targets (sun · pasture · Mediterranean · 11 · hand · scatter) + `TesseraeEffect` + rail/star/glyphs + all copy + form + footer. **Tier 1:** Gozo planes, veil (3D), cattle/ship SVG, compass, olive tree, net. **Tier 2:** raft physics, Ġgantija megaliths, shatter as physics, cursor states, satellite pages. Anything below the cut ships as its SVG twin |
| 3 | 12k instanced tiles + bloom + Voronoi post on Apple GPUs at DPR 2 | DPR cap 1.75, bloom `resolutionScale .5`, the governor steps down automatically, mobile tiers per §8; profile the hero first |
| 4 | Mosaic post effect tessellating *text* and killing legibility | Text is DOM above the canvas, never in GL; `uAmount` is ≤ .5 while any copy is on stage and 1 only in the loader/finale |
| 5 | iOS Safari sticky + `overflow: clip` + address-bar resize | `100dvh`, `ignoreMobileResize`, no overflow on `body`/`.stage`; test on a real iPhone in the first two hours |
| 6 | Double smoothing / DOM-vs-GL lag | Lenis lerp .09 only; ScrollTrigger `scrub: true`; one ticker |
| 7 | The "hold" on *I am Homer* and the stopped counter fighting the scrubbed timeline | Holds are scroll *length* (3 vh of no-op), never timers; nothing ever blocks scroll |
| 8 | SplitText DOM count | Lines/words only; chars never; ≤ 250 nodes per chapter |
| 9 | Parallel agents editing shared files | One folder per chapter with `chapter.html/css/timeline.ts/scene.ts`; the field's target formations are data (`targets.ts`) owned by the integrator; `npm run build` on every merge |
| 10 | Fraunces 300 hairlines blooming on the dark stage | Weight floor 300, `geometricPrecision`, no blur under titles; Geist Mono 500 at ≤ 10 px on dark |
| 11 | Gold on paper fails contrast; ramla as text | Tokens enforced — warm word colour on light is `--terra`; a lint script greps for `--gold` in `color:` on light sections |
| 12 | Copy rights: the gala script verbatim; the nine songs | Script lines assumed cleared (spine assumption; confirm); song titles only, never lyrics, no stings; cast names not published without sign-off |
| 13 | TBC content (venue, registration URLs/fees, speakers, partners, airline, gala ticketing, awards categories) | `event.json` placeholders flagged `TBC`, rendered as `VENUE TO BE ANNOUNCED` / `TBA` orbs — the design is built to look complete with them empty |
| 14 | "31+ countries" vs 2025's "35+" | Use the deck's 2026 numbers; flag to client |
| 15 | The 3D veil's transparency sorting and the net's line density on low tier | Veil `depthWrite: false`, rendered after opaque; net capped at 2,000 segments; both have SVG twins |
| 16 | Vite 8 + `vite-plugin-glsl` under Rolldown | `?raw` + `resolveIncludes()` fallback wired on day one |
| 17 | Judges/users on accessibility | Real DOM, landmarks per chapter, `aria:'auto'` on splits, keyboard for pieces and orbs, `mode-page`, visible motion toggle, focus rings in gold |
| 18 | The film reads as effects, not a place | The camera never leaves the sea; islands rise from the same water; one star; one sun — reviewed by scrubbing at 2% steps: every still must be a poster |

---

## 10. ASCII WIREFRAMES

### 10.1 Chapter 00 — THE SUN (hero, desktop 16:10, at scroll .25)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ ~ MTF                                                            [ REGISTER → ]  │
│ ≡                                                                                │
│ │                                                                                │
│ ●00        MEDITERRANEAN TOURISM FORUM · 11TH EDITION · MALTA · 25–27 NOVEMBER 2026
│ ○I  S                                                                            │
│ ○II                                  Mediterranean                               │
│ ○III                      ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄                            │
│ ○IV U                 ▄▄▀▀ ░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒░ ▀▀▄▄                        │
│ ○V                  ▄▀ ░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░ ▀▄                       │
│ ○VI                ▐ ▒▓▓▓▓█  ▄▄▄▄  ▓▓▓▓ ▄▄  ▄▄ ▓▓▓ ▄▄   ▄▄ ▓▓▓▒ ▌                 │
│ ○VII N             ▐ ▒▓▓▓▓█ ▐    ▀ ▓▓▓▓ ▌▌  ▐▐ ▓▓▓ ▌▐▀▄ ▌▐ ▓▓▓▒ ▌   ← S U N cut   │
│ ○VIII              ▐ ▒▓▓▓▓█  ▀▀▀▄  ▓▓▓▓ ▌▌  ▐▐ ▓▓▓ ▌▐ ▀▄▐ ▓▓▓▒ ▌     out of the  │
│ ○IX                ▐ ▒▓▓▓▓█ ▄    ▌ ▓▓▓▓ ▀▀▄▄▀▀ ▓▓▓ ▌▐  ▀▐ ▓▓▓▒ ▌     tessera sun │
│ ○X                  ▀▄ ░▒▓▓▓ ▀▀▀▀  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░ ▄▀                    │
│ │        ───────────────▀▀▄▄▄░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒░▄▄▄▀▀──────── horizon =   │
│ │        ~~~~~~~~~~~~~~~~~~~~~~~~ · · ▒ · · ~~~~~~~~~~~~~~~~~~~~~~~~ the logo's   │
│ │        ~~~~~~~~~~~~~~~~~~~~~~~ · ▒▒▒ · ~~~~~~~~~~~~~~~~~~~~~~~~~~ brushstroke   │
│ │   ─── Stewardship · Unity · Net Positive                                       │
│ │                                          ┌ S ─────────────────┐                │
│ │   For thousands of years, the Sun has    │ WHAT MUST WE       │  (cards enter  │
│ │   shaped Mediterranean civilisation…     │ PROTECT?           │   .30 → .75)   │
│ │   Today, SUN represents the tourism      └────────────────────┘                │
│ │   model we want to build.                ┌ U ─────────────────┐                │
│ │   It asks three questions:               │ WHAT CAN WE ACHIEVE│                │
│ │                                          │ TOGETHER?          │                │
│ + THE SUN                                                          01 / 11 SCROLL│
└──────────────────────────────────────────────────────────────────────────────────┘
  rail: star ● at 00; S U N glyphs hollow      canvas: sea + sun disc of 12k tesserae
```

### 10.2 Chapter 06 — SEVEN YEARS · 11 for 11 (desktop, at scroll .70, piece 04 lifted on hover)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ ~ MTF                                                     [ REGISTER · 25–27 NOV ]│
│ ≡    11 FOR 11 · MTF BRAIN THINK TANKS · 26 NOVEMBER              2026·11·26 ▮   │
│ │                                                                  (date stamps  │
│ ●●●  11th edition. 11 think tanks.                                  ticking)     │
│ ●I S One Mediterranean.                                                          │
│ ●II                                                                              │
│ ●III  At first they counted the days.      ╔══════════════════════════════════╗  │
│ ●IV U Then the months.                     ║ 04 · REGIONAL ACTION              ║  │
│ ●V    Then… they stopped counting.         ║ MED READY                         ║  │
│ ●VI ★                                      ║ Safe & Resilient Tourism          ║  │
│ ○VII N                                     ║ Destinations                      ║  │
│ ○VIII        PEOPLE & INNOVATION    ·   REG║ Developing the MED READY Centre   ║  │
│ ○IX      ╱‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾║ of Excellence, standards and      ║  │
│ ○X      ╱ ▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚║ certification for Mediterranean   ║  │
│ │      ╱ ▚ ░░░ ┌──┐░░░░░░░░░░ ┌──┐ ░░░░░░ ▞║ destinations and tourism          ║  │
│ │     ╱  ▞ ░░░ │01│░░ ┌──┐ ░░ │  │ ░ ┌──┐░ ▚║ properties.                       ║  │
│ │    ╱   ▚ ░░░ │  │░░ │02│ ░░ │  │ ░ │05│░ ▞║                                   ║  │
│ │   ╱    ▞ ░░ ┌┴──┴┐░ │  │ ░ ┌┴──┴┐░ │  │░ ▚║ [ EXPLORE → ]                     ║  │
│ │  ╱     ▚ ░░ │ 03 │░ └──┘ ░ │ ▲▲ │░ └──┘░ ▞╚══════════════════════════════════╝  │
│ │ ╱      ▞ ░ ┌┴────┴┐░░░░░░ │ 04 │ lifted 40px, shadow on floor                  │
│ │╱       ▚ ░ │  07  │░ ┌──┐ └────┘ ┌──┐ ░ ┌──┐ ░░ ▞     (the numeral 11 in       │
│ │        ▞ ░ └──────┘░ │08│ ░ ┌──┐ │10│ ░ │11│ ░░ ▚      perspective on the floor;│
│ │        ▚ ░░░░░░░░░░░ └──┘ ░ │09│ └──┘ ░ └──┘ ░░ ▞      guilloche border ▞▚)     │
│ │        ▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚▞▚                            │
│ │   THINK → CHALLENGE → DESIGN → ACT       RECOMMENDATIONS · PILOT PROJECTS ·     │
│ │   [ JOIN A THINK TANK → ]                PARTNERSHIPS · PERMANENT MTF INITIATIVES│
│ + 11 FOR 11                                                        06 / 11 NIGHT VI│
└──────────────────────────────────────────────────────────────────────────────────┘
  rail: star at VI; S and U filled, N hollow     canvas: mosaic floor of tesserae, honey light
```

### 10.3 Chapter 10 — THE TENTH DAWN (desktop, at scroll .40 — the raft carries the form)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ ~ MTF                                                            (pill hidden)   │
│ ≡    THE APPLICATION — REGISTER FOR MTF11 · 25–27 NOVEMBER 2026 · MALTA          │
│ │                                                                                │
│ ●●●   Build from it.                              ·      ·                       │
│ ●I S                                          ·        ★  ← the star on the      │
│ ●II   The wood that carried him toward death…    ·       horizon, last rung     │
│ ●III  would carry him toward life.                                               │
│ ●IV U ─────────────────────────────────────────────────────────────── horizon ── │
│ ●V   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ │
│ ●VI  ~~~~~~~~~~~~~~~~~~~~~   ╱╲                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ │
│ ●VII N ~~~~~~~~~~~~~~~~~~~  ╱  ╲  THE FLEET      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ │
│ ●VIII ~~~~~~~~~~~~~~~~~~~  ╱ ▦▦ ╲  [logo tiles   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ │
│ ●IX  ~~~~~~~~~~~~~~~~~~~  ╱ ▦▦▦▦ ╲  in the sail]  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ │
│ ●X ★ ~~~~~~~~~~~~~~~~~~  ╱________╲               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ │
│ │   ~~~~~~~~~~~~~~ ┃                                                              │
│ │  ═══════════════╋═══════════════════════════════════════════════╗  ← plank 1   │
│ │  ║  REGISTER      ( MALTA-BASED )  ( INTERNATIONAL )  ( ASSOCIATE )        ║     │
│ │  ═══════════════════════════════════════════════════════════════╣  ← plank 2   │
│ │  ║  ( Name — Nobody.       )   ( Organisation           )                 ║     │
│ │  ═══════════════════════════════════════════════════════════════╣  ← plank 3   │
│ │  ║  ( Country              )   ( Email                  )                 ║     │
│ │  ═══════════════════════════════════════════════════════════════╣  ← plank 4   │
│ │  ║  I AM A:  DELEGATE · SPEAKER · PARTNER · STUDENT · MEDIA                ║     │
│ │  ═══════════════════════════════════════════════════════════════╣  ← plank 5   │
│ │  ║   ◜ ◝                                                                   ║     │
│ │  ║  ◟ [ REGISTER → ] ◞   ← two hairline ellipses orbit the gold submit     ║     │
│ │  ═══════════════════════════════════════════════════════════════╝ lashings ✕   │
│ │  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ │
│ │   STAY — Book your hotel in Malta with us — enjoy special rates. [ BOOK NOW → ] │
│ + THE TENTH DAWN                                                   10 / 11 DAWN  │
└──────────────────────────────────────────────────────────────────────────────────┘
  rail: S U N all gold, star at the last rung     canvas: raft of five Box planks riding the Gerstner sea
  then (.70→1): camera pulls back, the hand becomes the horizon, S·U·N rise as the sun, footer on lit sea
```

---

## 11. WHAT THE BUILD TEAM DOES FIRST (the day, in order)

1. Free disk; install the pinned stack (`three@0.185.1`, `postprocessing@6.39.4`, `gsap@3.15.0`, `lenis@1.3.26`, `vite@8.2.2`); fonts to `/public/fonts`.
2. `tokens.css` (§2.2) + `palette.ts`; `Stage.ts`, `Scroll.ts`, `Renderer.ts` with the sticky pin and one master timeline; the eleven chapter folders with `chapter.html` holding every word of copy from §3 (SEO/a11y complete before any pixel).
3. The world: sea + sky + sun/star + starfield; the **tessera field** with six SVG-rasterised targets; the **`TesseraeEffect`** post — test at `uAmount 1` on the hero.
4. The chrome: rail + star projection + S·U·N glyphs + pill + corner marks + overlay + preloader.
5. Chapters in parallel, one agent each, Tier 0 first, each scrubbed at 2% steps for composed stills; the integrator owns `targets.ts`, `index.ts`, and the transitions between nights.
6. Mobile + reduced-motion + `mode-page` pass; real-iPhone test; budgets in the `?debug` panel; Lighthouse; ship to Vercel.

**Open questions for the client (blocking or shaping):** venue(s); verbatim use of the gala script; gala access and whether to publish the cast; registration mechanics and fees; which MTF10 voices may be shown with photos; 2026 partners, airline and Lavazza logo usage; opt-in sound; which plates to generate first if credits arrive; confirm 1,600+ / 31+ as the public figures; the Forum's first-edition year for Night VI's date-stamps.

*End of Concept A — NINE NIGHTS.*
