# MTF11 — NARRATIVE SPINE
## Mediterranean Tourism Forum 2026 · 11th edition · 25–27 November 2026 · Malta
### Theme: MEDITERRANEAN SUN — Stewardship · Unity · Net Positive

Document status: v1 — narrative architecture for the scroll-driven film (home page).
Author role: Narrative Architect. Ground truth: `/brief/01…06`. Date: 2026-09-05.

---

## 0. THE IDEA IN ONE BREATH

The site is not a conference website with a story on top. It is the gala's story, told by the same
Storyteller, in which the conference is what the story has been about all along.

`Calypso's Odyssey` ends with Homer saying "I was telling you your story." The website makes the same
move: the visitor thinks they are reading a myth about a star, a sun, a shipwreck, an island and an
open hand — and discovers that the star is the Forum, the island is Malta, the sun is the theme, and
the open hand is the invitation to register.

**The three myth-to-pillar equivalences (the spine's load-bearing beams):**

| Myth beat (script) | Pillar (deck) | The line that fuses them |
|---|---|---|
| Helios' cattle — "Do not touch what belongs to the Sun." | **S — Stewardship** | "Enjoy the destination. Respect the place." |
| The sea that connects; "a hand when we needed one"; Brothers in Arms | **U — Unity** | "Achieve together what we cannot achieve alone." |
| "Life matters because it ends." / "what remains because we lived" | **N — Net Positive** | "Leave more than we take." |
| "Love is the hand that opens." | **The invitation** | Register. |

**Structural conceit:** the gala has a Preamble, nine Cantos and a Conclusion. The site has an
Overture, **eleven Cantos** (for the eleventh edition), a Coda and a Finale = **14 chapters**, in the
myth's own chronological order, so the page plays as one continuous film (pear.no model: one pinned
stage, scroll = timeline, ~40k px), never a stack of sections.

**The pillar letters accumulate.** The left rail carries three hollow glyphs — S, U, N. Each fills
with gold when its Canto is passed (S at Canto I, U at Canto IV, N at Canto VIII). The word SUN is only
complete once the visitor has scrolled the whole story. In the Finale the three letters rise as the sun.

**One material for the whole 3D world: the tessera.** Everything on the WebGL stage is built from a
single instanced-mesh system of small flat tiles in the folk-art palette (sand, teal, terracotta,
gold, flame, ink). The tiles *are* the sun, break into the shipwreck, rise as stars, settle into the
island, thread into routes, lock into the 11-piece mosaic, spin into the compass, count as digits,
grow as olive leaves, knot into the net, unfold as the open hand, plank into the raft and finally lie
down as the horizon. This is what "super mosaic, artistic, futuristic, very experientially 3D" means in
practice: one continuous transformation, never a new asset per section.

**The Veil is the transition language.** Calypso = *kalyptein*, "to draw a veil". Chapter-to-chapter
transitions are a translucent cloth shader that crosses the stage (pear.no's `canvas.trans` +
`#fqTear`). It is drawn in Canto III ("the veil appears"), it *tears* at the end of Canto VII ("the veil
tears"), and it is absent thereafter — the last chapters transition on cuts and light only.

---

## 1. GLOBAL ELEMENTS

### 1.1 Preloader — "NINE NIGHTS"
Script source: "Aerial constellations. Nine nights. One star follows Ulysses and gradually descends.
… On the tenth dawn… the star touched the earth."

- Stage: press-black (#07090f). One serif-italic line fades up, small, centred:
  `Sing to me, Muse…`
- Below it, a hairline horizon rule draws left→right (pear `ruleH`).
- A single star (one gold tessera) travels down-and-across the black on a slow arc. Loading progress
  is expressed as nights, not percent: mono caps bottom-left `NIGHT 01` … `NIGHT 09`, the left-rail
  ticks filling one per night.
- At 100%: mono flips to `ON THE TENTH DAWN`, the star drops *below* the horizon rule, the rule ignites
  gold, and the sun rises through it — that rising sun **is** the hero. There is no hard cut between
  preloader and Chapter 01.
- Budget: ≤ 2.4 s cold, ≤ 0.8 s warm (skip straight to `NIGHT 08–09`). Scroll or click skips.
  `prefers-reduced-motion`: static star, fade.

### 1.2 Persistent CTA — "REGISTER →"
- Fixed top-right pill (pear `.cta`/`.apply`): mono caps 10–11px, letterspaced, translucent chip
  (rgba(255,250,234,.14)) with hairline rim. Label `REGISTER →`.
- The pill's fill warms with scroll progress: cream at the top of the film, gold by the Coda (the sun
  rising inside the button). Hover: hairline rim rotates (pear `cfRim`).
- From Chapter 08 onward the label gains the date on wide screens: `REGISTER · 25–27 NOV`.
- During Chapter 13 (the form is on stage) the pill fades to 0 to avoid duplication; returns in Finale.
- Mobile: same pill, bottom-centre, above the safe area.

### 1.3 Left rail
- Thin vertical hairline, full height, 14 ticks (one per chapter). Active tick draws (pear `ruleV`),
  passed ticks stay lit at 40%.
- Three hollow glyphs S · U · N sit at ticks 02, 05, 09. Each fills gold as its chapter is passed.
  Tooltip on hover: the pillar's question.
- Hamburger (two hairlines) at the top of the rail opens the nav overlay.

### 1.4 Corner marks
- Top-left: MTF mark — the logo's sea brushstroke redrawn as a single hairline path (draws in on load,
  `draw` keyframe), with "MTF" in mono beside it. Click = scroll to top.
- Bottom-left: crosshair (pear `cross`) + mono label that rewrites per chapter (`THE SUN`, `THE
  WARNING`, …) — pear's "AT YOUR SERVICE" slot.
- Bottom-right: `01 / 14` counter + `SCROLL` with a 1px vertical rule that breathes. After the first
  scroll, `SCROLL` becomes the current canto label (`CANTO I`).
- Optional bottom-right `SOUND · OFF` toggle (sea/wind bed + single sustained tone; off by default; TBC
  with client).

### 1.5 Nav overlay (pear `.nvm`)
Full-screen press-black, giant serif items (Flecha-scale, ~58–96px), each with a 9px mono index. The
sea-line hairline draws behind the list. Items and their targets:

| Index | Item (serif) | Mono sub-label | Target |
|---|---|---|---|
| 01 | The Sun | STEWARDSHIP · UNITY · NET POSITIVE | Ch 01 |
| 02 | Three Days | 25 · 26 · 27 NOVEMBER | Ch 06 |
| 03 | Eleven for Eleven | MTF BRAIN THINK TANKS | Ch 07 |
| 04 | The Four | BEAUTIFUL DESTINATIONS · MED READY · AI · COFFEE | Ch 08 |
| 05 | Calypso's Odyssey | THE GALA · 26 NOVEMBER | Ch 11 |
| 06 | Register | THE APPLICATION | Ch 13 |

Small mono row beneath: `VOICES` · `HOTELS` · `PARTNERS` · `THE FOUNDATION` · `CONTACT` ·
`WATCH MTF10 ↗`. Right column meta: `MEDITERRANEAN TOURISM FORUM · 11TH EDITION` /
`25–27 NOV 2026 · MALTA` / socials (Mediterranean Observer: Facebook · Instagram · LinkedIn).

### 1.6 Footer
Is Chapter 14 (the Finale). Described there.

### 1.7 Voice & type registers (for the design-system agent)
Two voices, always visually distinct:
- **The Storyteller** (script lines): display serif, *italic*, light weight, short lines, generous
  leading. Free analogue of Flecha: Fraunces (opsz 144, wght 300, italic) or Instrument Serif Italic.
- **The Forum** (deck lines): grotesk sans, 400/500, declarative caps for the slogans. Instrument Sans /
  Geist / Inter Tight.
- **Eyebrows / meta**: mono caps 9–12px letterspaced in translucent chips. Geist Mono / JetBrains Mono.
- One custom lettering moment: the gala title `CALYPSO'S ODYSSEY` (Chapter 11) — Greek-inflected
  display, drawn as SVG paths so it can be stroke-animated.
- Scale (from pear's real CSS): hero `clamp(30px, 8.11vw, 177px)`, chapter heads `clamp(30px, 5.36vw,
  96px)`, sub `clamp(26px, 3.32vw, 60px)`, lead `clamp(14px, 1.68vw, 30px)`, body 13–16px, mono
  `clamp(8px, .53vw, 10px)`–12px.
- Ease: `cubic-bezier(.22,1,.36,1)`. Nothing bounces. Opacity + ≤ 24px translate + rules drawing.

### 1.8 Palette arc (temperature curve across the film)
Base: press #07090f (stage), paper #f3e3c3 / cream #fffaea (type), sky-navy #012036, teal #1d4a5c →
#2b5f73, terracotta #8c3a2b, gold #d9a441 / #ffd682 / #ffc86e, flame #ff7a1a → #ffd166, ink #0b1a2a.

`01 gold ▸ 02 gold→thunder-navy ▸ 03 navy/stars ▸ 04 sand+terracotta+teal ▸ 05 teal+gold threads ▸
06 full Fauvist colour ▸ 07 sand mosaic ▸ 08 brass on navy ▸ 09 cold blue→warm gold ▸ 10 silver-green
on sand ▸ 11 ink + cream (net) ▸ 12 pure black ▸ 13 teal + wood-terracotta ▸ 14 sunrise gradient`

### 1.9 Modern-art register (client: "modern art included as part of how the story goes")
Each chapter borrows one visual grammar from a Mediterranean or relevant modern/contemporary artist,
used as *composition language*, never as reproduction:

| Ch | Art grammar | Why |
|---|---|---|
| 01 | Olafur Eliasson, *The Weather Project* (the indoor sun); Sonia Delaunay concentric discs | The sun as an object you stand under |
| 02 | Indian mythic folk-art frames (client X ref) transposed to Greek myth; long diagonal spear-lines | Cattle of Helios, the sailors' hands |
| 03 | Joan Miró, *Constellations* (1940–41) | Catalan, Mediterranean; stars as lines and dots |
| 04 | Henri Matisse cut-outs (*Polynesia, the Sea*; *The Snail*) | Flat coloured planes = Gozo's red earth / honey limestone / teal |
| 05 | Alexander Calder mobiles; Maltese *luzzu* eye motif | Hands and threads in balance; the eye upon the sea |
| 06 | Fauvist colour (Matisse/Derain at Collioure); Bonnard light | "Gozo explodes into colour" |
| 07 | Roman mosaics of Malta (Domus Romana, Rabat); On Kawara *Today* date stamps | Tesserae + the counting of days |
| 08 | Portolan charts & astrolabes; Bridget Riley wave-lines | Navigation, the rudder, the sea's current |
| 09 | Roman Opałka, *1965 / 1 – ∞* (counting to infinity) | "Forever" as a number that never stops |
| 10 | Giuseppe Penone (Arte Povera trees) | The olive tree; what remains |
| 11 | Chiharu Shiota thread installations; Maltese lace (*bizzilla*) | The net; the veil |
| 12 | Ad Reinhardt black paintings; a single point of light | "All three screens go completely black" |
| 13 | El Anatsui assembled panels; Arte Povera assemblage | The raft built from wreckage |
| 14 | Mark Rothko colour field → dawn | "Then sunrise." |

---

## 2. SCROLL MAP (pear.no ≈ 38,500 px; ours ≈ 44,000 px)

| # | Chapter | Canto | Pillar/Content | Length (px) | Timeline |
|---|---|---|---|---|---|
| 01 | The Sun | Overture | Theme, dates, three questions | 2,400 | 0–5% |
| 02 | The Warning | Canto I | S — Stewardship | 3,200 | 5–13% |
| 03 | A Sky Full of Stars | Canto II | Why now | 3,200 | 13–20% |
| 04 | The Tenth Dawn | Canto III | Malta / Gozo / Who is MTF / stats | 3,000 | 20–27% |
| 05 | The Hand That Lifts | Canto IV | U — Unity | 2,800 | 27–33% |
| 06 | Paradise | Canto V | Three Days. One Ecosystem. | 4,000 | 33–42% |
| 07 | Seven Years, Eleven Editions | Canto VI | 11 for 11 Think Tanks | 4,200 | 42–52% |
| 08 | The Hand Upon the Rudder | Canto VII | Four specialist events (27 Nov) | 4,400 | 52–62% |
| 09 | Forever | Canto VIII | N — Net Positive | 2,800 | 62–68% |
| 10 | What Remains | Canto IX | Skills · Careers · B2B · Knowledge & Policy Forum | 3,600 | 68–76% |
| 11 | The Open Hand | Canto X | Calypso's Odyssey Gala · Awards | 3,200 | 76–84% |
| 12 | I Am Homer | Canto XI | Voices / Speakers (TBA) | 2,800 | 84–90% |
| 13 | The Raft | Coda | Register · Hotels · Partners | 2,600 | 90–96% |
| 14 | Sunrise | Finale | Footer · Foundation · Contact | 1,800 | 96–100% |

Emotional curve (gala's own beats, remapped): AWE → GRAVITY → LOST/HOPE → ARRIVAL → TENDERNESS →
JOY → TIME → RESOLVE → FEAR→CLARITY → LEGACY → LETTING GO → REVELATION → COURAGE → CATHARSIS.

---

## 3. THE CHAPTERS

Copy conventions below:
- `[S]` = Storyteller voice (serif italic) — verbatim from the gala script unless marked (adapted).
- `[F]` = Forum voice (sans) — verbatim from the MTF11 deck unless marked (adapted / current site).
- `EYEBROW` = mono caps chip.
- Facts marked **CONFIRMED** (in deck / brief) or **TBC** (not stated for 2026).

---

### CHAPTER 01 — THE SUN
**Canto:** Overture · **Emotion:** AWE · **Rail label:** `THE SUN` · **Pillar glyphs:** all hollow

**Purpose.** Announce the Forum and its theme in one image: the sun, and the three questions it asks.
Set the film's rules (dark stage, serif + mono, restraint) in the first five seconds.

**Eyebrow.**
`MEDITERRANEAN TOURISM FORUM · 11TH EDITION · MALTA · 25–27 NOVEMBER 2026`

**Headline (hero, 177px scale).**
> Mediterranean **SUN**

"Mediterranean" small, serif italic, cream; "SUN" enormous, serif, the S/U/N letterforms cut out of the
sun disc so light pours *through* the type (knockout mask on the WebGL sun).

**Sub-headline (reveals on first scroll tick).**
> Stewardship · Unity · Net Positive

**Supporting copy.**
`[F]` For thousands of years, the Sun has shaped Mediterranean civilisation, architecture, agriculture,
food, culture and way of life.
`[F]` Today, SUN represents the tourism model we want to build.
`[F]` It asks three questions:

Three-question triptych (three hairline-framed cards, pear `.fq` style, appearing in sequence as you
scroll, each with its glyph):
- `S` — **WHAT MUST WE PROTECT?**
- `U` — **WHAT CAN WE ACHIEVE TOGETHER?**
- `N` — **WHAT SHOULD TOURISM LEAVE BEHIND?**

Tiny storyteller stitch beneath, almost hidden (the first hint of the myth):
`[S]` *The Sun fills the screens.*

**3D / visual world.**
The sun rising out of the preloader's horizon fills 70% of the viewport: a disc of ~12,000 gold
tesserae, slowly breathing (scale ±1.5%), heat-haze refraction shader on the rim, grain overlay
(pear's blurred-photo-with-grain look, but procedural). Concentric Delaunay rings rotate at 7.5 s
(pear `cfRim`). Cream type sits in front; the sea brushstroke from the logo lies as a gold hairline
across the lower third like a horizon. Mouse parallax ±6px on type, ±14px on the sun. On scroll the
sun sinks toward the horizon line and reddens (gold → flame → ember).

**CTA.** Primary pill `REGISTER →` (also the persistent CTA). Secondary mono link `WATCH MTF10 ↗`
(video of the 10th edition, link TBC).

**Transition → 02.** The sun settles to an ember rim on the horizon. Against that rim, flat black
silhouettes step in from the right edge: horned cattle. Mono label rewrites: `THE WARNING`.
Storyteller: *The cattle of Helios.*

**Facts.** Edition, dates, theme, pillars: **CONFIRMED** (deck slides 1, 4, 9–11). "Malta" as host:
**CONFIRMED by client brief**, not spelled out in the deck. Venue: **TBC**.

---

### CHAPTER 02 — THE WARNING
**Canto:** I · **Emotion:** GRAVITY (the gala's "DESTINY") · **Rail label:** `THE WARNING` ·
**Pillar glyph:** S fills gold on exit

**Purpose.** Deliver Stewardship not as a policy word but as the oldest Mediterranean warning there is.
Establish the wreck that the rest of the film will rebuild from.

**Eyebrow.**
`S · STEWARDSHIP — WHAT MUST WE PROTECT?`

**Headline.**
> Do not touch what belongs to the Sun.

**Storyteller.**
`[S]` His companions had been warned.
`[S]` They knew.
`[S]` And still they did.
`[S]` Perhaps that too is human:
`[S]` to know the road…
`[S]` and still lose our way.

**Forum (lands as the thunder clears).**
`[F]` Tourism brings opportunity — but also responsibility.
`[F]` Visitors, businesses, authorities and communities all have a role in protecting the places we share.
`[F]` Growth must improve the places people visit — not consume what makes them special.
Chip row: `HERITAGE · ENVIRONMENT · COMMUNITIES · CULTURE · DESTINATIONS · SEA`
Verb row (mono, spaced): `PROTECT → RESPECT → PRESERVE → ENHANCE`
Closing slogan (serif, large):
> Enjoy the destination. Respect the place.
Sign-off (mono caps): `PROTECT WHAT MAKES THE MEDITERRANEAN SPECIAL.`

**3D / visual world.**
The sun's ember disc becomes a pasture: the tesserae flatten into a gold field, and seven flat
folk-art cattle (black + terracotta cut-out silhouettes, long horns, the X-ref's storybook geometry)
graze across it with a slow, weighted walk cycle (2D rigs on a 3D plane). Sailors' hands enter as long
diagonal shapes (the X-ref's spear-lines). On the headline beat: thunder — the stage flashes navy, the
whole mosaic **fractures** (Voronoi shatter of the tessera field), tiles fall as rain into a dark sea
that rises from the bottom edge. `[S]` *Zeus answered for Helios. / The ship breaks apart. / The
sailors disappear.* The Forum copy lands over the settling debris — responsibility written on the
wreck.

**CTA.** None. (Only the rail's S glyph filling gold as the chapter exits.)

**Transition → 03.** The last tiles sink. Black. One figure-height column of light remains.
`[S]` *Ulysses alone. / No ship. / No companions. / No one left to call him king. / Only a man… /
between sea and sky.* The sunken tiles begin, one by one, to rise as points of light.

**Facts.** All Stewardship copy: **CONFIRMED** (deck slide 5).

---

### CHAPTER 03 — A SKY FULL OF STARS
**Canto:** II · **Emotion:** LOST → HOPE · **Rail label:** `WHY NOW`

**Purpose.** The "Why now?" slide, staged as the moment a sailor loses sight of land. The eleven forces
reshaping tourism are the stars he has to read. One of them grows brighter: the Forum.

**Eyebrow.**
`WHY NOW — TOURISM IS BEING RESHAPED BY FORCES FAR BEYOND TOURISM`

**Headline.**
> Where do I go from here?

**Storyteller.**
`[S]` For thousands of years,
`[S]` sailors of this sea looked to the stars.
`[S]` For direction.
`[S]` For destiny.
`[S]` Perhaps for the gods.
`[S]` When they lost sight of earth…
`[S]` they read the heavens.

**Forum — the eleven forces, each a named star (mono labels on the starfield).**
`AI & AUTOMATION` · `CLIMATE CHANGE` · `SEA-LEVEL RISE` · `OVERTOURISM` · `GEOPOLITICAL TENSIONS &
CONFLICT` · `SECURITY & MIGRATION PRESSURES` · `TALENT SHORTAGES` · `HOUSING & REAL-ESTATE PRESSURES` ·
`CONNECTIVITY` · `CHANGING VISITOR EXPECTATIONS` · `SUSTAINABILITY & INVESTMENT`
`[F]` Events in one part of the Mediterranean can rapidly affect connectivity, visitor confidence,
investment, supply chains and destination perception across the region.
`[F]` The question is no longer:
> **HOW MANY TOURISTS CAN WE ATTRACT?**
`[F]` It is:
> **WHAT KIND OF TOURISM CREATES THE GREATEST VALUE AND RESILIENCE FOR PEOPLE, PLACES AND BUSINESSES?**

**Storyteller (as one star brightens).**
`[S]` One star grows brighter.
`[S]` Was it Athena?
`[S]` Destiny?
`[S]` Hope?
`[S]` He did not know.
`[S]` He knew only that above him stretched…
`[S]` **A SKY FULL OF STARS.**

**3D / visual world.**
Full 3D starfield: the sunken tesserae rise and become ~4,000 stars with depth (camera dolly gives true
parallax). Eleven are brighter and labelled; as the visitor scrolls, hairlines draw between them
(Miró's constellation lines) and the constellation they form is **the outline of the Mediterranean** —
the logo's brushstroke, in stars. (The eleven forces = eleven stars = the eleventh edition; nobody
needs to be told.) The two questions render as opposing typographic weights: the old question small,
struck through by a drawing hairline; the new question at chapter-head scale. Then one star at the
centre of the constellation (Malta's position) swells, gold, and begins to descend along the rail's
nine ticks.

**CTA.** None. Mono hint bottom-right: `NINE NIGHTS ↓`

**Transition → 04.** The bright star descends through nine tick-marks (the rail ticks pulse in
sequence), the other stars fade, a horizon rule draws. `[S]` *On the tenth dawn… / the star touched
the earth.* The Veil is not yet used; this transition is pure light.

**Facts.** Forces list and both questions: **CONFIRMED** (deck slide 8).

---

### CHAPTER 04 — THE TENTH DAWN
**Canto:** III · **Emotion:** ARRIVAL / WONDER · **Rail label:** `OGYGIA · MALTA`

**Purpose.** The "where" and the "who": Gozo/Malta as Ogygia, MTF as host, the Forum's scale. Land the
dates a second time, now attached to a place.

**Eyebrow.**
`OGYGIA · GOZO · MALTA — THE HEART OF THE MEDITERRANEAN`

**Headline.**
> A diamond set in blue.

**Storyteller.**
`[S]` A nymph.
`[S]` Calypso.
`[S]` And her island was called…
`[S]` Ogygia.
`[S]` An ancient name.
`[S]` Primeval.
`[S]` Through the centuries, Ogygia became rooted in the identity of an island at the heart of this sea:
`[S]` **Gozo.**
`[S]` Red earth at Ramla.
`[S]` Honey-coloured limestone.
`[S]` Caves watching the horizon.
`[S]` Ancient stone carrying memories older than kingdoms.
`[S]` The heart of the Mediterranean.
`[S]` Its eye upon the sea.
`[S]` Its soul carved in stone.

**Forum — the host (second movement of the chapter).**
`WHO IS MTF?` (mono)
`[F]` Mediterranean Tourism Foundation.
`[F]` MTF brings together the public sector, private sector, academia and the next generation around
one purpose:
> Advancing peace, prosperity and a better quality of life through tourism.
`[F]` Tourism is more than an industry. It shapes our economies, communities, cities, environment,
employment, culture and quality of life.
Mono: `THINK TOGETHER · LEARN TOGETHER · ACT TOGETHER`

Stat trio (mono digits count up, serif captions):
- **1,600+** PARTICIPANTS
- **60 % / 40 %** MALTA / INTERNATIONAL
- **31+** COUNTRIES — ACROSS ALL CONTINENTS

`[F]` Different sectors. Different generations. Different countries.
> **ONE MEDITERRANEAN CONVERSATION.**

Date block (mono chip, large): `25 — 27 NOVEMBER 2026 · MALTA · VENUE TO BE ANNOUNCED`

**3D / visual world.**
The star lands on the horizon and the island **rises out of the sea as stacked cut-out planes**
(Matisse): teal sea plane, honey-limestone cliffs, the red-earth crescent of Ramla, a cave arch as a
black cut-out watching the horizon, a scatter of thyme-silver dots. Planes sit at different Z so a
slow 12° camera orbit gives real depth; the sea plane carries a low-frequency wave displacement.
The logo's sea-line lies across the top of the sky as a gold thread with one pulsing point at Malta.
For the stats, the tesserae swarm into three columns and become the digits. Palette: sand, terracotta,
teal, gold — the folk-art X-reference at full strength for the first time.

**CTA.** Mono link `BOOK A HOTEL IN MALTA ↗` (anchor to Ch 13's hotel block).

**Transition → 05.** The Veil's first appearance. A translucent cream cloth crosses the stage
right→left, carrying the words: `[S]` *Kalyptein. / To cover. To conceal. To draw a veil.* As it passes
the island dims to two figures' worth of light.

**Facts.** Who-is-MTF copy, 1,600+/60-40/31+: **CONFIRMED** (deck slides 2–3). Note the 2025 site
claimed 1,500+ / 35+ countries / 60+ speakers — use the deck's 2026 numbers, flag to client that
"31+ countries" is lower than last year's "35+". Gozo/Ramla/Calypso's Cave: script + real geography
(**CONFIRMED**). Venue: **TBC** (MTF10 was Hilton Malta; Forbes training 2025 at Sea View Hotel, St
Paul's Bay; Awards 2025 at the Palace of the President).

---

### CHAPTER 05 — THE HAND THAT LIFTS
**Canto:** IV · **Emotion:** TENDERNESS / SOLIDARITY (the gala's "HEALING") · **Rail label:** `UNITY` ·
**Pillar glyph:** U fills gold on exit

**Purpose.** Unity as the hand that helped a stranger stand. Then the concrete version: Air, Sea,
Digital, People.

**Eyebrow.**
`U · UNITY — WHAT CAN WE ACHIEVE TOGETHER?`

**Headline.**
> Achieve together what we cannot achieve alone.

**Storyteller.**
`[S]` When she asked the stranger his name…
`[S]` he answered:
`[S]` Nobody.
`[S]` Before Calypso loved Ulysses…
`[S]` she saved him.
`[S]` Made him stand.
`[S]` Made him walk.
`[S]` A stranger.
`[S]` A friend.
`[S]` A hand when we needed one.
`[S]` They remain beside us long enough
`[S]` for us to stand again.
`[S]` And only later do we understand:
`[S]` **I was different because you were there.**

**Forum.**
`[F]` The Mediterranean becomes stronger when it is better connected.
Four strengthen-lines (each drawn as a route on the map as it appears):
- **AIR** — destinations and markets
- **SEA** — islands, ports and communities
- **DIGITAL** — knowledge, business and opportunity
- **PEOPLE** — Mediterranean talent and careers
`[F]` Collaborate across borders on:
`KNOWLEDGE · SKILLS · RECRUITMENT · ETHICAL MOBILITY · TRAINING · REGIONAL CONNECTIVITY · SHARED CHALLENGES`
Mono: `CONNECT PEOPLE · CONNECT DESTINATIONS · CONNECT OPPORTUNITY`
Sign-off (serif, large): **Connect the Mediterranean.**

**3D / visual world.**
Two hands as flat cut-out silhouettes on the dark sea: one reaching down from the top-right (gold,
Calypso's), one reaching up from the bottom-left (terracotta, the stranger's). Scroll closes the gap;
when they touch, the sea-line brushstroke ignites and **routes bloom across the whole Mediterranean
outline**: gold air-arcs rising off the plane, teal sea-lines hugging the coast, dotted digital lines,
and people as pulsing tesserae at ports (Malta brightest; the "31+ countries" as points). Calder-like
balance: the hands and routes hang from invisible threads, gently swaying with the mouse. The *luzzu*
eye appears once, small, at the bow of a sea-line.

**CTA.** Mono link `B2B BUSINESS MEETINGS ↓` (anchor to Ch 10).

**Transition → 06.** The routes thicken into colour; the sea plane warms; `[S]` *And then… / they were
happy.* Cut to Fauvist Gozo.

**Facts.** Unity copy: **CONFIRMED** (deck slide 6).

---

### CHAPTER 06 — PARADISE
**Canto:** V · **Emotion:** JOY · **Rail label:** `THREE DAYS`

**Purpose.** The programme at a glance — three days, one ecosystem — staged as three sunrises. The
gala's "Stay today. / Again. / And again." *is* the structure of a three-day forum.

**Eyebrow.**
`THREE DAYS · ONE ECOSYSTEM — 25 · 26 · 27 NOVEMBER 2026`

**Headline.**
> Stay today.

**Storyteller (opening).**
`[S]` And then… they were happy.
`[S]` Do not rush past that.
`[S]` Morning over Ramla.
`[S]` Red earth.
`[S]` Thyme upon the wind.
`[S]` Olive leaves turning silver.
`[S]` Salt.
`[S]` Wine.
`[S]` Music.
`[S]` The Mediterranean.

**Forum — three day-strips, each entering as a sunrise.**

**DAY 01 — 25 NOVEMBER** (mono) — `[S]` *Stay today.*
- Knowledge & Policy Forum
- Forbes Travel Guide Plus Training
- B2B Business Meetings
- Networking Events
- Mediterranean Tourism Awards
Mono: `KNOWLEDGE · BUSINESS · CONNECTION · RECOGNITION`

**DAY 02 — 26 NOVEMBER** — `[S]` *Tomorrow came. / Stay today.*
- Mediterranean Knowledge & Policy Forum
- Hospitality Skills Competitions
- Hospitality Careers Programme
- 11 FOR 11 — MTF Brain Think Tanks
- B2B Business Meetings
- Networking Events
- Forbes Travel Guide Plus Sessions
- Calypso's Odyssey Gala
Mono: `PEOPLE · SKILLS · IDEAS · BUSINESS · EXPERIENCE`

**DAY 03 — 27 NOVEMBER** — `[S]` *Again. / And again.*
- International Morning Plenary
- Followed by four specialist events:
  - BEAUTIFUL DESTINATIONS — Architecture, Design & the Economics of Place
  - MED READY — Safe & Resilient Tourism Destinations
  - AI-POWERED HOSPITALITY — Re-Engineering the Tourism Economy
  - THE COFFEE EXPERIENCE — Powered by Lavazza
Mono: `MEDITERRANEAN SUN`

**Storyteller (closing).**
`[S]` Calypso was happy.
`[S]` The island that had always been paradise…
`[S]` was no longer lonely.

**3D / visual world.**
"Gozo explodes into colour": the cut-out island from Ch 04 re-lights in Fauvist saturation (flame,
teal, gold, terracotta) and the sun from the hero returns, small, as a **scrubber on the horizon**.
Scroll drives the sun across the sky three times — sunrise → noon → sunset — once per day; each
sunrise slides in that day's strip from the right as a hairline-ruled column (pear `.fq` cards). The
sea plane sparkles with instanced glints. Thyme, olive, salt, wine, music appear as tiny cut-out
icons blowing across on the wind. This is the warmest, most saturated chapter in the film.

**CTA.** Pill `FULL PROGRAMME →` (satellite page, TBC) beside the persistent `REGISTER →`.

**Transition → 07.** The third sunset does not stop: sunrise/sunset cycle accelerates, seasons flicker
(the island's colours cycle green → gold → grey → green), the cut-out planes slowly bleach to sand.
`[S]` *And time passed.*

**Facts.** All three day lists: **CONFIRMED** (deck slides 9–11). Session timings, venues, ticketing
per event: **TBC**. Awards/Gala by invitation: **TBC** (2025 precedent: Awards and concert were "By
Invitation").

---

### CHAPTER 07 — SEVEN YEARS, ELEVEN EDITIONS
**Canto:** VI · **Emotion:** TIME · **Rail label:** `11 FOR 11`

**Purpose.** The eleven think tanks, as the mosaic the film has been promising. The gala's chapter on
time ("they stopped counting") becomes the eleventh edition's reason to act now.

**Eyebrow.**
`11 FOR 11 · MTF BRAIN THINK TANKS · 26 NOVEMBER`

**Headline.**
> 11th edition. 11 think tanks. One Mediterranean.

**Storyteller.**
`[S]` At first they counted the days.
`[S]` Then the months.
`[S]` Then…
`[S]` they stopped counting.
`[S]` Life never announces:
`[S]` Remember this moment.
`[S]` It simply happens.
`[S]` And only later do we understand:
`[S]` **THAT WAS OUR LIFE.**

**Forum.**
`[F]` 11 Challenges • 11 Expert Groups • 11 Actions
`[F]` Industry leaders, policymakers, academics, experts, entrepreneurs and young professionals work
towards:
`RECOMMENDATIONS · PILOT PROJECTS · PARTNERSHIPS · PERMANENT MTF INITIATIVES`
Mono, spaced: `THINK → CHALLENGE → DESIGN → ACT`

**The eleven tesserae (each a tile; hover/tap expands to a card with the deck's body copy).**

*PEOPLE & INNOVATION*
- **01 — Attracting & Retaining Hospitality Talent** — Making Hospitality a Career of Choice.
  Card: Recruitment • housing • working conditions • career progression • training • recognition •
  technology • employee experience. *Moving from continuously replacing workers to building and
  retaining talent.*
- **02 — The AI-Powered Hotel** — Re-Engineering Hospitality Around People & the Guest.
  Card: AI across sales, marketing, revenue, guest experience, F&B, operations, finance and HR.
  `AI IN THE BACK OFFICE. HUMANS AT THE FRONT.`
- **03 — Hospitality for All** — Accessibility by Design. `DESIGNED FOR EVERYONE.`

*REGIONAL ACTION*
- **04 — MED READY** — Safe & Resilient Tourism Destinations. Card: Developing the MED READY Centre of
  Excellence, standards and certification for Mediterranean destinations and tourism properties.
- **05 — Link Up Mediterranean** — Mediterranean Talent. Mediterranean Opportunity.
- **06 — Mediterranean Observer** — Turning Data into Better Decisions.
  `DATA → KNOWLEDGE → FORESIGHT → ACTION`

*RESPONSIBILITY & VALUE*
- **07 — Enjoy & Respect** — Better Visitors. Better Destinations.
  `ENJOY THE DESTINATION. RESPECT THE PLACE.`
- **08 — Mediterranean Blue Protection Centre** — Protecting the Sea that Connects Us.
- **09 — Malta — Mediterranean Luxury Yachting Hub** — Building the Economy Around the Yacht.
  `ATTRACT THE YACHT. SERVE THE YACHT. RETAIN THE VALUE.`

*CULTURE & SERVICE*
- **10 — Mediterranean Olive Oil Consortium** — From Product to Mediterranean Experience.
  `PRODUCT → STORY → EXPERIENCE → VALUE`
- **11 — Service Excellence** — Hospitality Across Every Economic Sector.
  `THE WHOLE DESTINATION DELIVERS THE EXPERIENCE.` / `FROM A HOSPITALITY INDUSTRY → TO A HOSPITALITY
  CULTURE.`

**3D / visual world.**
The bleached island planes tilt to horizontal and become a floor. On it, an **eleven-piece Roman
mosaic** (Domus Romana geometry — guilloche border, sand/terracotta/ink tesserae) assembles tile by
tile as you scroll, forming a monumental numeral **11** seen in perspective; each of the eleven
pieces is one think tank, its number set in the tesserae. Behind, faint and fast, the day/season cycle
from Ch 06 continues — mono date-stamps ticking in the corner (On Kawara) — so the whole chapter is
"time passing while a thing is built". Hovering a piece lifts it 40px off the floor (true 3D, shadow
on the mosaic) and slides its card in from the right. Group headers appear as four hairline sectors.

**CTA.** Mono link `JOIN A THINK TANK →` (mechanism TBC — deck slide 26 mentions "26th BRAIN Session"
in the Associate package).

**Transition → 08.** The Veil crosses; behind it the floor drops away and the stars come back.
`[S]` *Then one night… / the heavens reminded him.*

**Facts.** Think-tank names, taglines, groupings and body copy: **CONFIRMED** (deck slides 14–18).
Participation route: **TBC**. "11th edition": **CONFIRMED**. Founding year of the *forum* not stated —
do not invent; the Foundation itself was founded 2013 (brief 04).

---

### CHAPTER 08 — THE HAND UPON THE RUDDER
**Canto:** VII · **Emotion:** RESOLVE / AGENCY · **Rail label:** `THE FOUR`

**Purpose.** The four specialist events of 27 November as four points of a compass. The myth beat is
navigation and identity: the stars point beyond; the man remembers his name; the hand on the rudder is
ours. Readiness (MED READY), redesign (AI), beauty and the coffee welcome are each a bearing.

**Eyebrow.**
`27 NOVEMBER · INTERNATIONAL MORNING PLENARY · FOUR SPECIALIST EVENTS`

**Headline.**
> The wind may belong to destiny. The hand upon the rudder remains ours.

**Storyteller.**
`[S]` Orion.
`[S]` The Bear.
`[S]` East.
`[S]` West.
`[S]` The same stars that guided him toward Ogygia…
`[S]` now pointed beyond it.
`[S]` Navigation awakened memory.
`[S]` Memory awakened identity.
`[S]` And the man who arrived calling himself Nobody remembered:
`[S]` **I AM ULYSSES.**

**Forum — four bearings (the compass rotates to lock each one; each expands to a panel).**

**N · BEAUTIFUL DESTINATIONS** — Architecture, Design & the Economics of Place
`[F]` BEAUTY CREATES VALUE.
`[F]` How can we create destinations that are: BEAUTIFUL • GREEN • ACCESSIBLE • LIVEABLE • INVESTABLE?
`[F]` Green can be beautiful. Accessible can be beautiful. Functional can be beautiful.
Mono: `BEAUTY → QUALITY → INVESTMENT → VALUE`
Panel body: Covering cities, towns, villages, waterfronts, ports, harbours, marinas, beaches, public
spaces, hotels, restaurants, heritage. Better-designed destinations can generate higher-value tourism,
stronger investment, better real-estate value, regeneration and greater resident pride.

**E · MED READY** — Safe & Resilient Tourism Destinations
`[F]` HOW MED READY IS YOUR DESTINATION?
Acronym ladder (mono, one letter per line, drawing in): M Mediterranean · E Emergency · D Destination ·
R Resilience · E Early Warning · A Action · D Disruption Readiness · Y Year-Round
`[F]` FROM CRISIS REACTION → TO DESTINATION READINESS.
Panel body: MED READY Centre of Excellence — a regional platform bringing together Tourism • Police •
Civil Protection • Armed Forces • Medical Emergency • Fire & Rescue • Migration Authorities • Airports &
Ports • Hospitality • Technology • Academia. Mission: `SHARE → PREPARE → STANDARDISE → CERTIFY →
IMPROVE`. Developing **MED READY CERTIFIED DESTINATION** and **MED READY CERTIFIED PROPERTY**.
`ANTICIPATE → PREPARE → PROTECT → RESPOND → ADAPT → RECOVER`

**S · AI-POWERED HOSPITALITY** — Re-Engineering the Tourism Economy
`[F]` AI should not simply automate today's hospitality business.
`[F]` IT SHOULD HELP US REDESIGN TOMORROW'S.
Mono: `SIMPLIFY · AUTOMATE · PREDICT · OPTIMISE · ELIMINATE WASTE`
Panel body: the Blueprint's six Ps — PEOPLE (better jobs & talent retention) · PRODUCTIVITY
(automation & process redesign) · PERFORMANCE (sales, marketing, revenue & costs) · PERSONALISATION
(better guest experiences) · PLANET (energy, water & food waste) · PROFITABILITY (turning AI into
business value). Including AI-powered STR management.
`[F]` SMARTER BEHIND THE SCENES. MORE HUMAN IN FRONT OF THE GUEST.

**W · THE COFFEE EXPERIENCE** — Powered by Lavazza
`[F]` Coffee is more than a product.
`[F]` In Mediterranean hospitality, it is part of the welcome, culture and guest experience.
Chips: `COFFEE CULTURE · CONSUMER TRENDS · PRODUCT INNOVATION · BARISTA SKILLS · SERVICE EXCELLENCE ·
SUSTAINABILITY · TECHNOLOGY · F&B PROFITABILITY · GUEST EXPERIENCE`
`[F]` FROM COFFEE AS A PRODUCT → TO COFFEE AS AN EXPERIENCE

**3D / visual world.**
The returning stars re-form into a **brass astrolabe / compass rose** — a wire-and-tessera instrument
floating at centre, rim rotating (pear `cfRim`), needle trembling with the mouse. Scroll rotates the
rose 90° per event and locks it with a soft click of light; the locked bearing's panel slides in.
The sea beneath is Bridget Riley wave-lines in navy on ink, flowing in the direction of the needle.
A folk-art plate — a hand on a tiller, terracotta and gold — is stamped into the lower corner and
stays for the whole chapter (upgrade layer: generated). The AI bearing renders the six Ps as six
tesserae orbiting the rose; the MED READY bearing turns the rose into a radar sweep for one beat.

**CTA.** Per bearing: mono `EXPLORE →` (satellite page, TBC). Chapter-level: `THE FOUR — FULL
DETAILS →`.

**Transition → 09.** The needle swings and points off-screen. `[S]` *The veil tears.* — the Veil enters
one last time and rips down the centre (pear `#fqTear`), revealing a cold blue field.

**Facts.** All four events and MED READY/AI Blueprint/Coffee copy: **CONFIRMED** (deck slides 19–25).
Lavazza as partner: **CONFIRMED in deck**; confirm logo rights with client. Timings/venues: **TBC**.

---

### CHAPTER 09 — FOREVER
**Canto:** VIII · **Emotion:** FEAR → CLARITY · **Rail label:** `NET POSITIVE` ·
**Pillar glyph:** N fills gold on exit — the word SUN is complete

**Purpose.** Net Positive, argued the way the gala argues against immortality: the measure of tourism
is not endless arrivals; it is whether the people who host it live better.

**Eyebrow.**
`N · NET POSITIVE — WHAT SHOULD TOURISM LEAVE BEHIND?`

**Headline.**
> Leave more than we take.

**Storyteller.**
`[S]` She offered Ulysses immortality.
`[S]` No ageing.
`[S]` No sickness.
`[S]` No grave.
`[S]` Forever young.
`[S]` Forever together.
`[S]` But Ulysses understood what eternity had hidden from Calypso:
`[S]` **Life matters because it ends.**
`[S]` If tomorrow were infinite…
`[S]` why would today be sacred?

**Forum.**
`[F]` Tourism's success should not be measured only by arrivals, nights and expenditure.
`[F]` The ultimate measure:
> **DOES TOURISM IMPROVE THE STANDARD OF LIVING OF THE COMMUNITIES THAT HOST IT?**
`[F]` Net Positive means:
`BETTER JOBS · BETTER CAREERS · BETTER PUBLIC SPACES · BETTER SERVICES · STRONGER LOCAL BUSINESSES ·
HEALTHIER ENVIRONMENTS · BETTER EXPERIENCES · GREATER OPPORTUNITY`
`[F]` SERVICE EXCELLENCE — Extend hospitality beyond hotels and restaurants to the whole destination.
`[F]` FROM A HOSPITALITY INDUSTRY → TO A HOSPITALITY CULTURE.
`[F]` AI AS AN ENABLER — Better tourism • Better businesses • Better experiences • Better lives.
`[F]` Create more value with fewer resources — and share that value with the community.

**3D / visual world.**
A cold blue field (immortality). Across it, a **counter of arrivals rolls upward forever** — mono
digits made of tesserae, Opałka-style, climbing without end. The storyteller's lines sit over the
climbing number. On "Life matters because it ends." the scroll *stops* the counter: the digits freeze,
then dissolve. In their place a single human figure (flat cut-out) ages across three silhouettes —
child, adult, elder — while behind them a place *flourishes*: an olive sapling grows into a tree, a
harbour lights up, a street fills. The field warms from cold blue to living gold (Rothko bands
sliding). The Forum's list of "Better…" lands as leaves on the tree. The rail's N fills; S·U·N reads
whole for the first time and glows for one beat.

**CTA.** None.

**Transition → 10.** The colour field is gold. The tree remains. `[S]` *A leaf falls.* One silver leaf
detaches and drifts down through the entire transition.

**Facts.** Net Positive copy: **CONFIRMED** (deck slide 7). Note deck typo on slide 7 ("BETTER
LIVESREATE") = "BETTER LIVES" + "CREATE MORE VALUE…" — rendered corrected above.

---

### CHAPTER 10 — WHAT REMAINS
**Canto:** IX · **Emotion:** LEGACY / PRIDE · **Rail label:** `PEOPLE`

**Purpose.** The people programme: skills competitions, careers, B2B, the Knowledge & Policy Forum.
The myth beat is the Poet's answer to immortality — what remains because we lived: a child, a
kindness, a courage, a story. The next generation and the knowledge that leaves the university.

**Eyebrow.**
`PEOPLE · SKILLS · IDEAS · BUSINESS — 25–27 NOVEMBER`

**Headline.**
> Perhaps immortality is what remains because we lived.

**Storyteller.**
`[S]` Perhaps immortality was never about refusing to die.
`[S]` Perhaps it is what remains because we lived.
`[S]` A child.
`[S]` A kindness.
`[S]` A courage.
`[S]` A love.
`[S]` A story.
`[S]` Did we help someone stand?

**Forum — four branches of the tree.**

**HOSPITALITY SKILLS COMPETITIONS** — 26 November
`[F]` Celebrating excellence in:
`FRONT OFFICE · HOUSEKEEPING · RESTAURANT SERVICE · CHEFS · FOOD & BEVERAGE`

**HOSPITALITY CAREERS PROGRAMME** — 26 November
`[F]` Introducing young people to opportunities across:
`HOSPITALITY · TECHNOLOGY · AI · FINANCE · CULINARY · SUSTAINABILITY · DESIGN · MARKETING · EVENTS ·
ENTREPRENEURSHIP`

**B2B BUSINESS MEETINGS & NETWORKING** — 25–26 November
`[F]` Connecting: Hotels • Tourism Operators • Buyers • Suppliers • Technology Companies • Investors •
Destinations • Service Providers
Mono: `CONTACTS → RELATIONSHIPS → OPPORTUNITIES → PARTNERSHIPS → BUSINESS`

**MEDITERRANEAN KNOWLEDGE & POLICY FORUM** — 25–27 November
`[F]` Knowledge should not remain inside universities.
`[F]` Bringing together: Academics • Policymakers • Industry • Researchers • Students
Mono: `RESEARCH → POLICY → BUSINESS → IMPLEMENTATION`
Themes: `COMPETITIVENESS · DESTINATION MANAGEMENT · AI · SUSTAINABILITY · VISITOR BEHAVIOUR ·
CONNECTIVITY · MOBILITY · SKILLS · CLIMATE · INVESTMENT · COMMUNITY WELLBEING`
`[F]` TURN KNOWLEDGE INTO POLICY — AND POLICY INTO ACTION.

**3D / visual world.**
The olive tree from Ch 09 is now the whole stage: a **Penone-like tree** of wire and silver-green
tesserae, seen from below at first (the camera rises through the canopy as you scroll). Four main
branches = four programmes; each branch's leaves are tesserae that, on approach, turn to show they are
tiny cut-out people (the gala's "images of ordinary people begin appearing very slowly" — an upgrade
layer for real photography of past competitions and careers days). Leaves "turning silver" flip
with the mouse. Falling leaves become the mono arrows (`RESEARCH → POLICY → …`). The ground is
sand; the light is late afternoon.

**CTA.** Per branch, mono: `ENTER THE COMPETITIONS →` · `CAREERS PROGRAMME →` · `REQUEST B2B
MEETINGS →` · `SUBMIT RESEARCH →` (all TBC links).

**Transition → 11.** Night falls on the tree. The leaves' silver turns to thread; thread pulls taut
across the stage; a knot; another. The net is being woven. `[S]` *Then came the net.*

**Facts.** Programme content: **CONFIRMED** (deck slides 12–13). Competition categories for 2026 as
listed in deck (5 areas): **CONFIRMED**; named awards (2025: Receptionist of the Year, Housekeeping
Attendants, Culinary Arts, Waiter of the Year): **TBC** for 2026. K&P Forum chair (2025: Prof.
Dimitrios Buhalis), call for papers, dates within 25–27: **TBC**. B2B days inferred from day lists.

---

### CHAPTER 11 — THE OPEN HAND
**Canto:** X · **Emotion:** LETTING GO · **Rail label:** `THE GALA`

**Purpose.** Calypso's Odyssey — the gala — and the Mediterranean Tourism Awards. The film's title
line and its thesis: love is the hand that opens.

**Eyebrow.**
`26 NOVEMBER · CALYPSO'S ODYSSEY · THE GALA`

**Headline (custom lettering, SVG stroke-drawn).**
> CALYPSO'S ODYSSEY
> *The Greatest Journeys Are Not Always Across the Sea*

**Storyteller.**
`[S]` For seven years Calypso had tried to keep what she loved.
`[S]` Make paradise beautiful enough.
`[S]` Stop time.
`[S]` Offer forever.
`[S]` Hold tighter.
`[S]` But holding tighter does not stop departure.
`[S]` Sometimes… it turns love into a chain.
`[S]` *Calypso cuts the net.*
`[S]` **Love is not the hand that closes.**
`[S]` **Love is the hand that opens.**

**Forum (adapted from the script's production notes).**
`[F, adapted]` One Storyteller. No dialogue. Nine songs. One night.
`[F, adapted]` A Mediterranean production of aerial constellations, ribbons, sea and fire — the story
of the star that became Calypso, the island that became Gozo, and the hand that learned to open.
Canto strip (mono, scrolls horizontally, nine ticks): `THE LAST SHIP · THE STRANGER · THE AWAKENING ·
PARADISE · SEVEN YEARS · FOREVER · THE OTHER WOMAN · THE OPEN HAND · THE POET`
Meta chip: `26 NOVEMBER 2026 · MALTA · APPROX. 70 MINUTES · BY INVITATION (TBC)`

**Second movement — recognition.**
`MEDITERRANEAN TOURISM AWARDS · 25 NOVEMBER` (mono)
`[S]` And yet… three thousand years later… you know his name.
`[F, adapted]` The Mediterranean Tourism Awards recognise the people, places and projects whose work
will still be known when the season is over.
(Categories, nominations, venue: TBC.)

**3D / visual world.**
The stage is wrapped in a **net**: a wireframe mesh of ink threads (Shiota; Maltese *bizzilla* lace
geometry at the knots) that tightens as you scroll — the camera is inside it, the type reads through
it. On "Calypso cuts the net." the mesh **snaps**: strands recoil and drift as loose lines, and behind
them a giant flat cut-out **hand** — gold on ink, folk-art proportions — is closed. Over the next
400px of scroll the fingers **unfold**, one per line of the couplet, until the hand is fully open and
fills the frame. The gala title lettering draws on across the open palm. Aerial performers hang
above as suspended star-points. The Awards movement is the same hand holding a single gold tessera
that becomes a star.

**CTA.** Pill `REQUEST AN INVITATION →` (TBC) · Mono `AWARDS — NOMINATE →` (TBC).

**Transition → 12.** `[S]` *Everything disappears. / No acrobats. / No projections. / No music. / Only
the Storyteller.* Every layer fades to pure black — the only true black cut in the film.

**Facts.** Gala title, subtitle, structure, one-storyteller/no-dialogue, ~70 min: **CONFIRMED** (script;
runtime is the script's own target, production may land 65–69). Gala on 26 Nov: **CONFIRMED** (deck
slide 10). Gala venue, ticketing, cast: **TBC** — the script names nine Maltese singers ([cast TBA], Kurt
Calleja, [cast TBA], [cast TBA], [cast TBA], [cast TBA], [cast TBA], [cast TBA],
[cast TBA]) but the script is a working draft; do not publish names without client sign-off. Awards
on 25 Nov: **CONFIRMED** (deck slide 9); venue/categories/by-invitation: **TBC**.

---

### CHAPTER 12 — I AM HOMER
**Canto:** XI · **Emotion:** REVELATION · **Rail label:** `VOICES`

**Purpose.** The speakers. The gala's reveal — the Storyteller gives his name — becomes the moment the
site gives *its* names. MTF11's speakers are not yet announced, so the chapter is built to be honest
about that and still feel complete.

**Eyebrow.**
`VOICES OF MTF · MTF11 SPEAKERS TO BE ANNOUNCED`

**Headline.**
> There remains only one thing I have kept from you. My name.

**Storyteller (with a real hold — 3 s of black after the line, no scroll response).**
`[S]` I am Homer.
`[S]` You thought I was telling you an ancient story.
`[S]` I was telling you your story.

**Forum.**
`[F, adapted]` MTF11 speakers will be announced through the autumn. The Forum has always been a
gathering of voices — heads of state, ministers, mayors, hoteliers, scientists, freedivers,
broadcasters, chefs, students.
Sub-block A (mono header): `MTF11 · 2026 — SPEAKERS TO BE ANNOUNCED` → a row of empty orb rims (pear
`cfRim`), each labelled `TBA`, one filling with a star when a speaker is confirmed (CMS-driven).
Sub-block B (mono header): `VOICES OF THE 10TH EDITION` → curated portraits (orbs with rotating rims)
from brief 04, e.g. H.E. Myriam Spiteri Debono (President of Malta) · Hon. Dr Ian Borg · Tony Zahra
(President, MTF) · Andrew Agius Muscat (Secretary General, MTF) · Rajan Datar (BBC) · Alex Connock
(Oxford) · Manfredi Lefebvre d'Ovidio (WTTC) · Taleb Rifai (former UNWTO Secretary General) · Sara
Roversi · Anna Pollock · Dimitrios Buhalis · Glenn Mandziuk · Vitomir Maričić … with a `THE MTF
SENATE` strip for the Senators.

**3D / visual world.**
Total black (#000, not the stage's near-black). Only the mono eyebrow and the serif line. On "I am
Homer." — hold. Then one star appears above the type (the star from the preloader). As you scroll, the
star's light falls on the speaker orbs one at a time, each rim drawing in (`draw`), the name in serif,
the title in mono. The "ordinary people appearing very slowly" beat is used here for the real faces.
No other geometry — after eleven cantos of a moving world, stillness is the effect.

**CTA.** Mono `SPEAK AT MTF11 →` (mailto forum@medtourismfoundation.com — TBC) · `ALL VOICES →`
(satellite page).

**Transition → 13.** `[S]` *Not every star is our destination. / Some enter our darkness only long
enough to show us the way.* The star drifts down to the horizon line; on the sea, dark shapes float
up: the wreckage from Ch 02.

**Facts.** MTF11 speakers: **TBA/TBC**. MTF10 speaker list: **CONFIRMED** (brief 04, mtf.global 2025);
confirm image rights and which names to feature.

---

### CHAPTER 13 — THE RAFT
**Canto:** Coda · **Emotion:** COURAGE / ACTION · **Rail label:** `REGISTER` ·
**Persistent CTA:** hidden (the form is on stage)

**Purpose.** Registration, hotels, partners. The myth beat is the wreckage turned raft: build from it.
The registration form is the raft.

**Eyebrow.**
`THE APPLICATION — REGISTER FOR MTF11 · 25–27 NOVEMBER 2026 · MALTA`

**Headline.**
> Build from it.

**Storyteller.**
`[S]` Seven years earlier, the sea had thrown Ulysses onto Ogygia beside the wreckage of his ship.
`[S]` Broken… but not destroyed.
`[S]` Now Calypso used those same pieces to help build his raft.
`[S]` The wood that carried him toward death…
`[S]` would carry him toward life.
`[S]` Perhaps that is what we must do with our own wreckage.
`[S]` **Build from it.**

**Forum — three movements on the raft.**

**REGISTER** (mono)
`[F, current-site pattern]` Malta-based delegates → `REGISTER →`
`[F, current-site pattern]` International delegates → `REGISTER →`
`[F, adapted]` Become an MTF11 Associate → `ENQUIRE →` (deck slide 26: Knowledge & Policy Forum
speaker slot · 26th BRAIN session · 27th conference · hosting of clients)
Pill fields (pear's contact form grammar): Name · Organisation · Country · Email · I am a: Delegate /
Speaker / Partner / Student / Media.

**STAY** (mono)
`[F, current site]` Book your hotel in Malta with us — enjoy special rates. → `BOOK NOW →`

**THE FLEET** (mono) — partners & associates
`OUR ASSOCIATES` · `OFFICIAL AIRLINE OF THE MEDITERRANEAN TOURISM FORUM 2026` · `POWERED BY LAVAZZA
(THE COFFEE EXPERIENCE)` — logos as tesserae in the sail (2026 list TBC).

**3D / visual world.**
The shattered tiles from the shipwreck (Ch 02) surface, drift together and **lock into planks**: a
raft assembles in 3D on the wave-plane, lashed with the last strands of the net. The form sits on the
raft's deck; its sail is a cream cut-out that fills with partner tesserae. Two orbiting hairline
ellipses (pear's contact-form orbs) circle the submit button. The star from Ch 12 sits low on the
horizon, ahead of the raft, as the bearing. On submit: the raft's sail fills gold and the raft moves
toward the star (success state), with mono `RAFT LAUNCHED — SEE YOU IN MALTA`.

**CTA.** The form itself; `BOOK NOW →`; `BECOME AN ASSOCIATE →`.

**Transition → 14.** `[S]` *The raft reaches the sea.* Camera pulls back and up; the raft is a point
on a wide sea; the star leads it toward the horizon, where a hand-shaped silhouette lies.

**Facts.** Registration mechanics, fees, URLs, Malta/International split: **TBC** (split is the 2025
site's pattern). Hotel partner and rates: **TBC**. Partners/associates 2026, official airline 2026:
**TBC**. Lavazza: **CONFIRMED in deck** for the Coffee Experience.

---

### CHAPTER 14 — SUNRISE
**Canto:** Finale · **Emotion:** CATHARSIS · **Rail label:** `I LIVED`

**Purpose.** The footer as the film's last shot. The open hand becomes the horizon; one star remains;
the sun rises — the same sun as the hero. Contact, foundation, socials, legal, without breaking the
spell.

**Eyebrow.**
`MEDITERRANEAN TOURISM FOUNDATION · MALTA · SINCE 2013`

**Headline (serif, the largest type since the hero).**
> I lived.

**Storyteller.**
`[S]` So when your own Odyssey reaches its final shore…
`[S]` do not count the years.
`[S]` Remember the people.
`[S]` The laughter. The mistakes. The storms.
`[S]` The hands that lifted you.
`[S]` The people who stayed. The people who left.
`[S]` And the people you loved enough… to let go.
`[S]` And may you look back upon all of it — and say…
`[S]` **I LIVED.**
Final couplet, held under the sunrise (mono caps, wide tracking):
`LOVE IS NOT THE HAND THAT CLOSES.` — pause — `LOVE IS THE HAND THAT OPENS.`

**Forum — footer content (four hairline rules frame it, pear `.fin-*`).**
`[F, current site]` The Mediterranean Tourism Foundation — We connect Mediterranean tourism
stakeholders to promote dialogue, peace, and stability. Through education networks and sustainable
projects, we support training, intercultural initiatives, and hospitality professionals, driving
growth and resilience across the region's tourism and development sectors.
Columns (mono heads, sans links):
- `THE FORUM` — The Sun · Three Days · Eleven for Eleven · The Four · Calypso's Odyssey · Voices ·
  Register · Hotels · Partners · Full Programme
- `THE FOUNDATION` — Who is MTF · The Mediterranean Observer · Past editions (Watch MTF10) · Press
- `CONTACT` — forum@medtourismfoundation.com · info@medtourismfoundation.com
- `FOLLOW` — Facebook · Instagram · LinkedIn (Mediterranean Observer)
Bottom rule: `THINK TOGETHER · LEARN TOGETHER · ACT TOGETHER` · `© 2026 MEDITERRANEAN TOURISM
FOUNDATION` · Privacy · Cookies · Back to the beginning ↑

**3D / visual world.**
The open hand silhouette from Ch 11 lies flat and **becomes the horizon line** ("The image of an open
hand becomes the Mediterranean horizon"). Above it, the sky is a Rothko field of navy. One star
remains. Then, as the visitor reaches the true bottom, the three gold glyphs S · U · N from the rail
detach, travel to the horizon and rise as the sun — the hero sun — with the sunrise gradient spreading
up the whole page (flame → gold → cream). The footer text sits on the lit sea. "Back to the
beginning ↑" scrolls to the top where the same sun is waiting: the film loops.

**CTA.** `REGISTER →` returns as a large pill on the sea; `BACK TO THE BEGINNING ↑`.

**Facts.** Foundation blurb, contacts, socials: **CONFIRMED as of 2025 site**; reconfirm for 2026.
"Since 2013": **CONFIRMED** (brief 04).

---

## 4. CONFIRMED vs TBC — MASTER TABLE

| Item | Status | Source / note |
|---|---|---|
| 11th edition, "Mediterranean Tourism Forum 2026" | CONFIRMED | Deck slide 1, 14 |
| Dates 25 · 26 · 27 November 2026 | CONFIRMED | Deck slides 9–11 |
| Host country Malta | CONFIRMED (client brief) | Deck does not name the city; MTF is Malta-based |
| Venue(s) 2026 | **TBC** | MTF10: Hilton Malta; 2025 Forbes at Sea View Hotel; Awards at Palace of the President |
| Theme Mediterranean SUN; S/U/N definitions; three questions | CONFIRMED | Deck slides 4–7 |
| 1,600+ participants · 60/40 · 31+ countries | CONFIRMED (deck claim) | Slide 3 — flag vs 2025 site's 1,500+/35+/60+ speakers |
| Why-now forces (11) and the two questions | CONFIRMED | Slide 8 |
| Day-by-day programme items | CONFIRMED | Slides 9–11; timings/venues TBC |
| Knowledge & Policy Forum content | CONFIRMED | Slide 12; chair/CFP TBC |
| Skills competitions (5 areas), Careers, B2B | CONFIRMED | Slide 13; named awards TBC |
| 11 for 11 — all 11 think tanks | CONFIRMED | Slides 14–18; participation route TBC |
| Four specialist events + MED READY + AI Blueprint + Coffee/Lavazza | CONFIRMED | Slides 19–25 |
| Calypso's Odyssey Gala, 26 Nov, one storyteller, nine songs, ~70 min | CONFIRMED | Slide 10 + script; venue/cast/ticketing TBC |
| Mediterranean Tourism Awards, 25 Nov | CONFIRMED | Slide 9; categories/venue/invitation TBC |
| Associate package elements | CONFIRMED | Slide 26; pricing/terms TBC |
| MTF11 speakers | **TBA** | Show "to be announced" + MTF10 voices |
| Registration URLs/fees; Malta vs International split | **TBC** | Split is 2025 pattern |
| Hotel booking partner and rates | **TBC** | 2025 site: "special rates" |
| Partners / associates / official airline 2026 | **TBC** | 2025: KM Malta Airlines CEO spoke; airline partner not named in brief |
| Contacts & socials | CONFIRMED (2025) | forum@ / info@medtourismfoundation.com; Mediterranean Observer FB/IG/LI |
| Foundation founded 2013, Malta | CONFIRMED | Brief 04 |
| "Watch MTF10" video link | **TBC** | 2025 site had "Last Year's Forum — WATCH" |
| Deck typos | Note | Slide 7 "LIVESREATE"; slide 18 trailing "SLIDE 16 —" export artefact |

---

## 5. OPEN QUESTIONS FOR THE CLIENT (blocking or shaping)

1. Venue(s) for 25/26/27 — one venue or several? (Determines whether Ch 04 shows a place.)
2. May the site use the gala script's lines verbatim? (The spine assumes yes; it is the best copy we have.)
3. Gala: public tickets, invitation-only, or delegate-inclusive? Publish the cast?
4. Registration: single form, external platform, or two paths (Malta / International) as in 2025? Fees?
5. Which MTF10 voices may be shown with photos while MTF11 speakers are pending?
6. Partners/associates/airline for 2026, and Lavazza logo usage.
7. Sound: allow an opt-in ambient sea bed?
8. Image/video generation credits: which chapters get generated "plates" first (see §6)?
9. Confirm "1,600+ / 31+ countries" as the public 2026 figures.
10. Is the Forum's own edition history (1st edition year) available for Ch 07's date-stamps?

---

## 6. UPGRADE LAYER — GENERATED IMAGERY (optional, when credits arrive)

The base build must stand on procedural WebGL, SVG cut-outs and typography alone. When generation
credits are provided, add **"plates"**: still frames in the client's X-reference style — flat geometric
figures, limited palette (sand #f3e3c3, teal #1d4a5c/#2b5f73, terracotta #8c3a2b, gold #d9a441, flame
#ff7a1a→#ffd166, ink navy), paper grain, big negative space, long diagonal lines, storybook
composition — transposed from Indian to Greek/Mediterranean myth. Priority order:

1. Ch 02 — the cattle of Helios on a gold field; sailors' hands with long spear-lines.
2. Ch 04 — Calypso as the star touching Ramla; Gozo cliffs and cave.
3. Ch 08 — a hand on a tiller under Orion and the Bear.
4. Ch 11 — Calypso cutting the net; the open hand.
5. Ch 13 — the raft built from wreckage, sail catching the wind.
6. Ch 01/14 — the sun as a mythic disc with rays (Delaunay/Eliasson hybrid).
7. Ch 05 — two hands (gold/terracotta) meeting over the sea.
8. Short looping video: the Veil (cloth) for the transition canvas; the sea plane's surface.

Plates are placed *behind* the tessera system (blurred, pear's hero-photo treatment) and never
replace the 3D — the film must not become a slideshow.

---

## 7. IMPLEMENTATION NOTES FOR THE BUILD AGENT

- Architecture: one `section.stage` > `div.pin` (sticky, 100vh, press-black). Page height ≈ 44,000px.
  Scroll progress (lerped, custom wheel/touch handlers, rAF) is the film's timeline. All chapter
  content absolutely positioned inside the pin; states `.on` / `.out` / `.live` / `.go`.
- Layers: `canvas.gl` (WebGL — one instanced tessera system + sun/sea/star shaders + grain),
  `div.tint` (navy tint), SVG filters (`#ink`, `#tear`), `canvas.veil` (transition cloth),
  `canvas.trans`, HTML type layer, fixed rail/corners/CTA.
- The tessera system is the single source of truth for continuity: define per-chapter target
  formations (sun disc, pasture+cattle, shatter, starfield, island planes, route network, 11-mosaic,
  compass rose, digit counter, tree, net, hand, raft, horizon) and morph between them on scroll with
  the press ease. Never swap to a new mesh; move the same instances.
- Copy lives in the HTML (SEO, accessibility, screen readers read the film in order). Each chapter is
  a landmark `<section aria-label>`; storyteller lines are `<p class="s">`, Forum lines `<p class="f">`.
- `prefers-reduced-motion`: pin off; chapters become stacked full-bleed frames with static tessera
  renders; all copy intact.
- Mobile: same timeline, 2D canvas fallback for the tessera system (≤ 3,000 instances), Veil as a CSS
  gradient wipe, day-strips stack vertically, mosaic becomes a vertical 11.
- Satellite pages (Programme, each Think Tank, each of the Four, Gala, Voices, Register) reuse the
  pinned stage with a single chapter's formation held still — "plates" of the film, not new designs.
- Performance targets: first sun visible < 1.5 s on 4G; 60 fps on M1/Apple-silicon and recent
  mid-range Android for the tessera system; total JS < 350 KB gz; fonts subset (Latin + Maltese ġ ħ ż).

---

## 8. COPY-SOURCE INDEX (where each headline comes from)

| Ch | Headline | Source |
|---|---|---|
| 01 | Mediterranean SUN / Stewardship · Unity · Net Positive | Deck 1, 4 |
| 02 | Do not touch what belongs to the Sun. | Script, Preamble |
| 03 | Where do I go from here? | Script, Preamble |
| 04 | A diamond set in blue. | Script, Canto I |
| 05 | Achieve together what we cannot achieve alone. | Deck 6 |
| 06 | Stay today. | Script, Canto III |
| 07 | 11th edition. 11 think tanks. One Mediterranean. | Deck 14 |
| 08 | The wind may belong to destiny. The hand upon the rudder remains ours. | Script, Canto VI |
| 09 | Leave more than we take. | Deck 7 |
| 10 | Perhaps immortality is what remains because we lived. | Script, Conclusion (compressed) |
| 11 | Calypso's Odyssey — The Greatest Journeys Are Not Always Across the Sea | Script, title |
| 12 | There remains only one thing I have kept from you. My name. | Script, Conclusion |
| 13 | Build from it. | Script, Canto VII |
| 14 | I lived. | Script, Conclusion |

End of spine.
