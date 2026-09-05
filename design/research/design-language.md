# MTF11 — Design-Language Study
### Typography · Colour · Mosaic · Motion · Layout for mtf.global (Mediterranean Tourism Forum 2026, 11th edition, 25–27 Nov 2026, Malta — "Mediterranean SUN")

Status: research deliverable, 2026-09-05. Ground truth = `/brief/01…06` and `/brief/refs/pear-no.css`. Every font family below was verified live against the Google Fonts CSS API (HTTP 200 for the exact axis ranges quoted) on 2026-09-05; every contrast ratio was computed (WCAG 2.x relative-luminance formula), not estimated.

---

## 0. What the language has to carry

Three things must be true at once, and the design language is the reconciliation of them:

1. **The quality bar is pear.no** — one pinned stage, scroll as timeline, a light sharp serif in cream over a deep blue WebGL sky, a precise neutral sans at 12.8–16 px, mono-caps labels in translucent chips, hairlines that draw in, one easing curve, nothing bounces. Its authority comes from restraint, not from effects.
2. **The story is Calypso's Odyssey** — Helios' cattle, the ship breaking, a sky full of stars, one star descending, Ogygia = Gozo (red earth at Ramla, honey limestone, thyme, olive leaves turning silver), the veil (*kalyptein*), seven years, the net, the open hand, Homer unmasked. The website's spine is a mortal man between sea and sky, and a woman who learns to open her hand.
3. **The forum is real and dense** — 1,600+ participants, 31+ countries, three days, 11-for-11 think tanks, four specialist events, MED READY, the SUN pillars (Stewardship · Unity · Net Positive). It must remain legible, navigable and registrable for ministers, hoteliers and students.

The client's words — "super mosaic, artistic, futuristic, modern art as part of how the story goes", "very experientially 3D", "audacious, bottom up" — are the licence to be bolder than pear.no in *imagery* (mosaic, gold tesserae, procedural sea and stars) while being *exactly as disciplined* in type, spacing and motion. That is the thesis of this document: **audacious surface, monastic system.**

---

## 1. Typography

### 1.1 What we are imitating (honestly)

**Flecha** (Latinotype / R-Typography) is described by its designer as a "sharp and streamlined old-style typeface made for editorial design": serifs reduced to short, sharp, stubby triangular forms; square dots; terminals flat inside and curved outside; a broad-nib memory under a mechanised skeleton. It ships in three optical sizes — **S** (text, from ~10 pt), **M** (headlines, from ~24 pt), **L** (titles, from ~84 pt) — each in six weights with italics. pear.no uses Flecha **L/M/S at 300/400 only**: hero ≈104 px, nav 59 px (clamp(34px, 4.6vw, 86px), line-height .98, tracking −.015em), sub 26 px, lead 20 px, and a global display tracking of **−.018em** (`--tracking-press`).

**GT Standard** (Grilli Type, 2024) is a neo-grotesk whose "backbone is simple geometry — circles, squares, lines", built as twelve subfamilies (six proportional, six mono), each with seven weights, **three optical sizes** and obliques. pear.no uses **GT Standard L at 400/500 for body (12.8–16 px)** and **GT Standard Mono at 400 for labels (9–12 px, uppercase, .16–.24em tracking)**. The sans and mono are siblings from one drawing — that is why the chips and the body feel like one voice.

So the target is not "a serif plus a sans". It is: **(a)** a display serif with *optical sizes* and a *light weight* that stays sharp at 100 px and *bookish* at 20 px; **(b)** a geometric-neutral sans with real 400/500; **(c)** a mono that is drawn to the same logic as the sans so 9-px caps labels sit inside the system, not beside it.

Free fonts that satisfy this, verified on fonts.google.com (all SIL OFL 1.1, self-hostable):

| Role | Family | Verified axes / styles | Designer / origin |
|---|---|---|---|
| Display serif | **Fraunces** | `opsz 9..144, wght 100..900, SOFT 0..100, WONK 0..1`, italic | Undercase Type (Phaedra Charles, Flavia Zimbardi), commissioned by Google Fonts |
| Display serif | **Newsreader** | `opsz 6..72, wght 200..800`, italic | Production Type |
| Display serif | **Bodoni Moda** | `opsz 6..96, wght 400..900`, italic | Owen Earl / indestructible type |
| Display serif (alt) | **Source Serif 4** | `opsz 8..60, wght 200..900`, italic | Frank Grießhammer / Adobe — pear.no's own fallback for Flecha S |
| Text sans | **Instrument Sans** | `wdth 75..100, wght 400..700`, italic, 12 stylistic sets | Rodrigo Fuenzalida for Instrument |
| Text sans | **Geist** | `wght 100..900` | Vercel × Basement Studio |
| Text sans | **Archivo** | `wdth 62..125, wght 100..900`, italic | Omnibus-Type |
| Mono | **Geist Mono** | `wght 100..900` | Vercel × Basement Studio (sibling of Geist) |
| Mono | **DM Mono** | 300/400/500 + italics | Colophon Foundry for DeepMind |
| Mono | **Martian Mono** | `wdth 75..112.5, wght 100..800` | Roman Shamin / Evil Martians |

Also verified and available but *rejected or limited* (see 1.5): Instrument Serif (one weight), Cinzel (400–900, Roman inscriptional caps), Playfair Display, Cormorant Garamond, Cormorant, EB Garamond, Literata, Bricolage Grotesque, Schibsted Grotesk, Inter Tight, Hanken Grotesk, JetBrains Mono, IBM Plex Mono, Azeret Mono, Space Mono, Gloock, DM Serif Display, Young Serif, Libre Caslon Display.

### 1.2 System A — "CALYPSO" · Fraunces + Instrument Sans + Geist Mono  ← **recommended**

**Load string (verified 200):**
```
https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1;1,9..144,100..900,0..100,0..1&family=Instrument+Sans:ital,wdth,wght@0,75..100,400..700;1,75..100,400..700&family=Geist+Mono:wght@100..900&display=swap
```

**Why it reaches Flecha/GT-Standard editorial quality.** Fraunces is the one free serif whose *category* matches Flecha's self-description: an **old-style** with an **optical-size axis** (9–144, the widest on Google Fonts) where "as opsz decreases the x-height increases, spacing opens and characters widen" — exactly the S/M/L behaviour pear.no buys from Flecha. Its **SOFT axis at 0** gives crisp, wedge-like serifs and sharp terminals; at SOFT 100 it goes inky. Light weights (300–350) at opsz 144 have thin, high-contrast hairlines that read like Flecha L Light in cream on navy. Instrument Sans is a geometric-leaning grotesk "balancing precision with subtle playfulness", with a **width axis** (75–100) — that gives us a compressed cut for tight UI strings the way GT Standard's subfamilies would. Geist Mono is a contemporary, quiet mono with a full weight axis, drawn for legibility at small sizes (distinct 0/O, 1/l/I) — which is precisely what 9-px uppercase chips need.

**Why it is Mediterranean / mythic / futuristic.** Old-style serifs are the Renaissance/Venetian tradition — Aldus, Garamond — the typographic Mediterranean. Fraunces' softness axis is a **sea-worn** quality: the same letter can be a freshly cut tessera (SOFT 0) or a beach pebble (SOFT 100). The **WONK axis** substitutes leaning h/n/m and flagged ball terminals in the italic — a hand in the letter, the storyteller's voice, used *only* for Calypso's lines. And because the family has **four variable axes, the type itself can be animated** (opsz drift as "seven years" pass; SOFT 100→0 as the veil is lifted; wght 200→320 as ink "arrives") — a futuristic gesture no static webfont can make, and one that Flecha itself cannot.

**Roles, weights, optical sizes**

| Role | Family / settings | Notes |
|---|---|---|
| Hero title | Fraunces · wght 300 · opsz 144 · SOFT 0 · WONK 0 | `font-optical-sizing: auto` handles opsz up to 144 px; above that, pin `"opsz" 144` |
| Chapter title (h2) | Fraunces · wght 300–350 · opsz auto (≈48–72) · SOFT 0 | |
| Sub (h3) | Fraunces · wght 400 · opsz auto (≈28) · SOFT 0 | |
| Story voice (Calypso/Homer lines) | Fraunces Italic · wght 300 · **WONK 1** · SOFT 10–20 | the only place WONK is on |
| Lead / pull quote | Fraunces · wght 350 · opsz 24 | optional: Instrument Sans 400 for forum leads |
| Body | Instrument Sans · wght 400 · wdth 100 | 500 for emphasis, never 600/700 in running text |
| UI text / nav | Instrument Sans · wght 500 · wdth 92 | |
| Labels, chips, indexes, dates | Geist Mono · wght 400 (500 on dark, ≤10 px) · uppercase · tracking .2em | tabular figures on |
| Numbers (1,600+ / 31+ / 11) | Fraunces · wght 300 · opsz 144 for the big stat, Geist Mono for the unit | |

**Scale (rem = 16 px). All display sizes are `clamp()`; leading and tracking are per size, mirroring pear.no's per-size tuning.**

```css
:root{
  /* Display serif */
  --t-hero:    clamp(3rem,    8.5vw, 7.5rem);   /* 48 → 120 px */  --lh-hero: .96;  --ls-hero: -.028em;
  --t-display: clamp(2.25rem, 5vw,   4.5rem);   /* 36 →  72 px */  --lh-display: 1.02; --ls-display: -.022em;
  --t-chapter: clamp(1.75rem, 3.2vw, 3rem);     /* 28 →  48 px */  --lh-chapter: 1.08; --ls-chapter: -.018em;
  --t-sub:     clamp(1.25rem, 1.9vw, 1.75rem);  /* 20 →  28 px */  --lh-sub: 1.18;  --ls-sub: -.012em;
  --t-lead:    clamp(1.125rem,1.4vw, 1.375rem); /* 18 →  22 px */  --lh-lead: 1.4;  --ls-lead: -.006em;
  /* Text sans */
  --t-body:    clamp(.9375rem,1.05vw,1.0625rem);/* 15 →  17 px */  --lh-body: 1.55; --ls-body: 0;
  --t-small:   clamp(.8125rem,.95vw, .875rem);  /* 13 →  14 px */  --lh-small: 1.5;
  --t-fine:    .75rem;                          /* 12 px, captions */
  /* Mono labels */
  --t-label:   clamp(.5625rem,.66vw, .6875rem); /* 9 → 11 px */    --lh-label: 1;   --ls-label: .2em;
  --t-index:   .5625rem;                        /* 9 px, rail/nav indices */ --ls-index: .24em;
  /* Measure */
  --measure-body: 56ch; --measure-lead: 32em; --measure-title: 11em; --measure-hero: 9em;
}
```

pear.no reference values these are tuned against: display `clamp(1.875rem,3.4vw,3.25rem)` / lh 1.12; hero clamps `clamp(2.4rem,9.5vw,4.5rem)` and `clamp(2rem,4.6vw,4.25rem)`; nav `clamp(34px,4.6vw,86px)` lh .98; body 12.8–16 px; `.type-label` = mono, .6875rem, .2em, uppercase; measures `max-w-[44ch] … [56ch]`, `max-w-[24em] … [32em]`.

**Pitfalls (System A)**
- Fraunces at wght ≥ 500 or SOFT > 30 in roman turns "artisanal bakery". Lock roman to 300–400, SOFT 0 (allow ≤ 20 only in the story italic).
- WONK anywhere in the roman looks like a bug. Italic only, story voice only.
- Its small opsz (9–14) is generous and a little quaint; do not use Fraunces below 18 px except as a deliberate caption emblem.
- Ball terminals at 120 px in cream on the WebGL sea can bloom; keep hero weight ≤ 320 and add `text-rendering: geometricPrecision`.
- Instrument Sans has no 300; if a lighter grey-on-cream text is needed, lower the colour (ink/80), never the weight.
- Geist Mono 400 at 9 px on the dark stage is thin against grain; use 500 there (pear.no does the same with a 500 CTA face).

### 1.3 System B — "HOMER" · Newsreader + Geist + Geist Mono  (the faithful pear.no transposition)

**Load string (verified 200):**
```
https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap
```

**Why.** Newsreader is a transitional serif commissioned by Google for long on-screen reading, with a 6–72 optical axis and a **200 weight** — its Display cut at 200/300 is the closest free colour to Flecha L Light: hairline-thin, sharp, tight, quiet. Geist + Geist Mono are drawn together (same x-height, same weight curve), so body and chips are siblings the way GT Standard L and GT Standard Mono are. This is the least risky route to "pear.no quality".

**Mediterranean / mythic / futuristic.** Newsreader's register is *the book* — the Homeric voice, the poet who tells the story. Its italic is narrative and beautiful for the Cantos. Geist brings the technical, product-grade precision the "futuristic" reading needs. Where it is weaker: warmth. This system is cooler and more Nordic than the SUN theme; the palette must carry all the heat.

**Roles.** Hero: Newsreader 200 (≥ 64 px) or 300 (< 64 px), opsz pinned 72, tracking −.02em, lh .98. Chapter: 300, opsz auto. Sub: 400. Story voice: Newsreader Italic 300. Lead/pull quote: Newsreader 400 at opsz 24. Body: Geist 400/500. Labels: Geist Mono 400/500 uppercase .2em. Same clamp scale as 1.2.

**Pitfalls.** Weight 200 disappears under 48 px and against grain — enforce a floor. Newsreader has a faint "newsletter/Substack" familiarity; keep it light and large to stay editorial. Geist is strongly associated with Vercel among developers (invisible to this audience, but the design team will notice). No WONK/SOFT axes — type cannot "perform" the veil; that gesture moves to the shader.

### 1.4 System C — "HELIOS" · Bodoni Moda + Archivo + Martian Mono  (the audacious/fashion-futurist option)

**Load string (verified 200):**
```
https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Martian+Mono:wdth,wght@75..112.5,100..800&display=swap
```

**Why.** Bodoni Moda revives Giambattista Bodoni of Parma — vertical axis, hairline serifs, the most *Italian* letter in the free library — with an opsz axis (6–96) that lowers contrast at small sizes and unleashes it at display. Archivo's 62–125 width axis gives condensed UI and wide statements from one file. Martian Mono, with a width axis of its own (75–112.5), condensed to 80 for chips, is the most overtly "future/technical" mono available; it is the mono the cinematic-website references (dark stages, glass torus, "Web Design That Performs") would reach for.

**Mediterranean / mythic / futuristic.** Monumental, inscriptional, luxury-yachting (Think-Tank 09), fashion-editorial — the most "gala" of the three; the Roman capital filtered through Parma. Least "book", most "poster".

**Roles.** Hero: Bodoni Moda 400, opsz 96, tracking −.01em (Didones must not be tracked tight), lh 1.0. Chapter: 400 opsz 48–72. Story voice: Bodoni Moda Italic 400. Body: Archivo 400/500 wdth 100. UI: Archivo 500 wdth 88. Labels: Martian Mono 400/500 wdth 80, uppercase .16em (mono width already adds air).

**Pitfalls.** Hairlines vanish on the dark WebGL stage with grain and below ~56 px; requires opsz pinning, a weight floor of 450 on dark, and no blur/grain under the title. Reads "perfume/Vogue" fast if paired with gold; use gold sparingly. Archivo is wide-set — measure must drop to 52ch. Martian Mono's personality competes with the serif; keep it ≤ 11 px.

### 1.5 Rejected or restricted families — and why

- **Cinzel** (Roman inscriptional capitals, the free Trajan): the *literal* Mediterranean-myth letter — and therefore the cliché of every sword-and-sandal poster. Not in the system. If the client insists on a Roman capital, use it only as 9–11 px letterspaced numerals for "CANTO I–VII" on the rail, never for words.
- **Instrument Serif**: gorgeous condensed sharp serif, but one weight and no small optical size; it is also the most over-used display serif of 2023–2026 award sites, which makes "one of the most beautiful sites ever" harder, not easier.
- **Playfair Display**: 400–900 only; no light; wedding/Didone-lite associations.
- **Cormorant Garamond**: delicate and Renaissance, but tiny x-height and hairlines that fail on dark; needs ≥ 40 px; reads "invitation".
- **Source Serif 4**: excellent and it *is* pear.no's declared fallback for Flecha S — keep it as the **fallback face** in the stack for System A/B, not as the lead.
- **Bricolage Grotesque**: opsz + wdth + wght is tempting, but its character (French/British quirk) fights the serif.

### 1.6 Loading, fallbacks, and hygiene

- **Self-host** WOFF2 subsets (Latin + Latin-ext for Maltese ġ ħ ż, Turkish, Croatian, Slovenian names in the speaker list — that is the MTF constituency). Pull the files via the CSS API with a modern UA (it serves per-script `unicode-range` slices) or google-webfonts-helper; keep licences (OFL) in `/public/fonts/LICENSE-*.txt`.
- `font-display: swap` for body/mono; for the hero serif use `font-display: optional` + `<link rel="preload" as="font" type="font/woff2" crossorigin>` so the title never flashes a fallback (pear.no uses `swap` everywhere; we can do better).
- Fallback stacks with `size-adjust`/`ascent-override` so CLS ≈ 0:
  ```css
  @font-face{font-family:"Fraunces Fallback";src:local("Iowan Old Style"),local("Georgia");size-adjust:104%;ascent-override:92%;descent-override:26%;line-gap-override:0%}
  --font-serif: "Fraunces","Fraunces Fallback","Source Serif 4","Iowan Old Style",Georgia,serif;
  --font-sans:  "Instrument Sans","Helvetica Neue",Arial,sans-serif;
  --font-mono:  "Geist Mono",ui-monospace,"SF Mono",Menlo,monospace;
  ```
- Turn on `font-optical-sizing: auto` globally; pin `font-variation-settings: "opsz" 144` only on the hero (browsers cap auto opsz at the font's max, but pinning avoids per-engine drift).
- Figures: `font-variant-numeric: tabular-nums` on mono and stats; `oldstyle-nums` off (Fraunces old-style figures are lovely in prose but wrong in a programme grid).
- Never fake small caps; no `text-transform: uppercase` on the serif (Fraunces caps are wide — an uppercase serif line at 120 px will not fit 9em).
- Hanging punctuation on pull quotes (`hanging-punctuation: first last` where supported), `text-wrap: balance` on titles, `text-wrap: pretty` on body.
- Variable-axis animation only via `font-variation-settings` on a single element, never on running text; cap at 1.2 s; disable under `prefers-reduced-motion`.

### 1.7 Recommendation

**System A — CALYPSO (Fraunces + Instrument Sans + Geist Mono).** It is the only system where the display face is categorically what Flecha is (a sharp old-style with optical sizes and a light weight), where the sans has a width axis for dense forum UI, and where the *type itself* can enact the story (SOFT for the veil, WONK for the storyteller, opsz for time). System B is the safe fallback if the client wants a cooler, more anonymous editorial voice; System C is the direction to pull single elements from (Martian Mono for a MED READY "instrument" panel, for instance) without adopting wholesale.

---

## 2. Colour

### 2.1 Where the colours come from (so they are not "a Mediterranean palette", but *this* one)

- **Limestone.** Malta's Globigerina limestone is honey-coloured; golden when freshly quarried, whitening/creaming with weathering, and deepening cream→amber where surfaces oxidise. That gives two neutrals: the *paper* (weathered) and the *stone* (fresh-cut, honey).
- **Ramla l-Ħamra.** Gozo's red beach under Calypso's cave owes its colour to a thin hematite (iron-oxide) coating on silicate grains — copper when damp at dawn, burnt orange at noon. That is the script's "red earth at Ramla": two tokens, a morning copper and a deep terracotta.
- **Sea.** Comino's lagoon is a patchwork of turquoise, sapphire, cobalt and navy that turns to slate at sunset; deep water off Gozo is a dark marine teal. Tokens: a lagoon accent (never text), a deep sea, an abyss, and a night stage that is *blue-black* (pear.no's stage is warm black `#0b0a09`; ours must be the sea at night).
- **Gold.** Byzantine gold tesserae: gold leaf < 1 µm hot-sandwiched between a support glass and a paper-thin *cartellina* — set at slight, varying angles so each cube catches lamplight differently and the wall shimmers as you move. Gold in this system is therefore a *highlight range* (leaf/gold/deep), not a flat fill.
- **Olive.** "Olive leaves turning silver" — a grey-green with a silvered upper leaf; the only cool-green in the system, used for the Stewardship pillar and the final olive tree.
- **Flame.** The folk-art reference's fire — an orange→yellow gradient — is reserved for Helios' cattle and the wreck, never for UI.

pear.no's tokens, for parity: `--press #0b0a09`, `--ink #1d1c19`, `--ink-soft #33322d`, `--paper #f2f1ed`, `--rule #1d1c1924` (ink @14%), `--sky #015186`, cream `#fffaea/#fffae8`, golds `#ffd682 #ffc86e #d9be86`, navy `#012036/#080c1a`, tint `#e2eeff`; the nav veil is `rgba(6,46,92,.58)` + `backdrop-filter: blur(26px) saturate(1.15)`.

### 2.2 Palette A — "OGYGIA" (limestone day, sea night)  ← **recommended**

```css
:root{
  /* stage & sea */
  --press:        #090D16;  /* night-sea black — the stage (pear: #0b0a09) */
  --abyss:        #06192B;  /* deep navy, below the sea */
  --sea:          #0E3D57;  /* deep marine teal-navy — chapter grounds */
  --sky:          #0F5A80;  /* day-deep sea/sky — the hero tint (pear: #015186) */
  --lagoon:       #2B8FA3;  /* Comino accent — glints, rims, never body text */
  /* stone & paper */
  --paper:        #F3EEE3;  /* weathered limestone — light surfaces (pear: #f2f1ed) */
  --cream:        #FFF7E1;  /* text-on-dark cream (pear: #fffaea) */
  --star:         #FFF9EA;  /* starlight — points, hairlines on dark */
  --sand:         #E8DCC2;  /* sand — cards, chips on light */
  --stone:        #D6C39C;  /* fresh-cut globigerina honey */
  --ink:          #1B1A17;  /* warm ink (pear: #1d1c19) */
  --ink-soft:     #3B3934;  /* secondary text (pear: #33322d) */
  /* earth */
  --ramla:        #B44A2D;  /* Ramla at dawn — copper red earth */
  --terra:        #8C3A2B;  /* deep terracotta — text-safe red */
  /* gold (a range, never one flat) */
  --gold-leaf:    #F1C86A;  /* tessera highlight */
  --gold:         #D9A441;  /* tessera face */
  --gold-deep:    #A67C2E;  /* tessera in shadow / gold on paper */
  /* olive & flame */
  --olive:        #6F7A5C;
  --olive-silver: #A9B39C;
  --flame:        #FF7A1A;
  --flame-hot:    #FFD166;
  /* derived */
  --rule:         color-mix(in oklab, var(--ink) 14%, transparent);   /* pear: #1d1c1924 */
  --rule-dark:    color-mix(in oklab, var(--star) 22%, transparent);  /* pear: #ffffff39 */
  --cross:        color-mix(in oklab, var(--star) 53%, transparent);  /* pear: #ffffff86 */
  --chip:         color-mix(in oklab, var(--star) 14%, transparent);  /* pear: rgba(255,255,255,.14) */
  --chip-light:   color-mix(in oklab, var(--ink) 10%, transparent);   /* pear: #1d1c191a */
  --veil:         color-mix(in oklab, var(--sea) 58%, transparent);   /* pear: rgba(6,46,92,.58) */
  --grain:        .06;  /* film grain opacity over the stage */
}
```

**Contrast (computed).** Body text must be ≥ 4.5:1 (AA) and we target AAA for running text.

| Pair | Ratio | Grade | Use |
|---|---|---|---|
| ink / paper | 15.04 | AAA | body on light |
| ink-soft / paper | 9.97 | AAA | secondary on light |
| sea / paper | 9.95 | AAA | titles, links on light |
| sky / paper | 6.49 | AA | accents on light |
| terra / paper | 6.59 | AA | red text on light (the *only* red allowed as text) |
| ramla / paper | 4.59 | AA | large text ≥ 24 px only |
| gold-deep / paper | 3.27 | AA-large | ≥ 24 px labels only |
| gold / paper | **1.94** | **FAIL** | decorative only — rims, glints, rules |
| olive / paper | 3.93 | AA-large | ≥ 24 px or icons |
| ink / sand · ink / stone | 12.80 · 10.06 | AAA | text on cards |
| ink @80% / paper | 8.40 | AAA | de-emphasised body |
| ink @60% / paper | 4.34 | AA-large | captions ≥ 18.66 px, or use ink-soft |
| cream / press | 18.18 | AAA | body on stage |
| paper @75% / press | 9.58 | AAA | secondary on stage (pear's `text-paper/75`) |
| paper @55% / press | 5.56 | AA | tertiary on stage (pear's `/55` = 5.65) |
| cream / sea | 10.77 | AAA | body on chapter grounds |
| paper @60% / sea | 4.62 | AA | floor for tertiary on sea |
| cream / sky | 7.03 | AAA | hero title over sky tint |
| gold-leaf / press · gold / press · gold-deep / press | 12.22 · 8.64 · 5.13 | AAA · AAA · AA | gold labels on stage |
| gold / sea | 5.12 | AA | gold labels on sea |
| gold / sky | 3.34 | AA-large | gold ≥ 24 px only on sky |
| olive-silver / press | 8.90 | AAA | Stewardship labels |
| flame-hot / press · flame / press | 13.48 · 7.45 | AAA | narrative only |
| ramla / press | 3.66 | AA-large | never small text |
| ink / gold · press / gold-leaf | 7.74 · 12.22 | AAA | ink on gold pill CTA |
| lagoon / press | 5.15 | AA | fine as a 24 px+ accent; not body |

Rules that fall out of the table: **gold is never body text on paper**; on paper the warm accent for words is *terra*, on the stage it is *gold-leaf/gold*; *ramla* is a surface colour (cards, the Ramla scene ground) not a type colour; *lagoon* only ever glints.

### 2.3 Palette B — "HELIOS" (the folk-art storybook)

Transposed from the mythic folk-art frames, where figures are *teal ink* on *sand* with terracotta, ochre-gold and flame. This is not an alternative site palette so much as a **scene palette** — the Canto illustrations.

```css
:root[data-scene="story"]{
  --press:      #0F2F3B;  /* deep teal night */
  --navy:       #12232E;
  --paper:      #F3E3C3;  /* folk-art sand */
  --sand-deep:  #E2CFA4;
  --cream:      #FBF1DC;
  --ink:        #1D4A5C;  /* teal ink — the figures */
  --ink-soft:   #2B5F73;
  --terra:      #8C3A2B;
  --ramla:      #C25A33;
  --gold:       #D9A441;  --gold-deep: #A6782B;
  --flame:      #FF7A1A;  --flame-hot: #FFD166;
  --olive:      #7A8A5A;
}
```

| Pair | Ratio | Grade |
|---|---|---|
| ink(teal) / paper(sand) | 7.59 | AAA |
| ink-soft / paper | 5.55 | AA |
| terra / paper | 6.02 | AA |
| ramla / paper | 3.45 | AA-large |
| gold-deep / paper | 3.10 | AA-large |
| gold / paper | **1.78** | FAIL (decorative) |
| olive / paper | **2.96** | FAIL (illustration only) |
| cream / press(teal) | 12.56 | AAA |
| gold / press | 6.27 | AA |
| flame-hot / press · flame / press | 9.77 · 5.40 | AAA · AA |
| terra / press · terra / navy · terra / ink | 1.85 · 2.11 · 1.26 | FAIL — terracotta only ever on sand |
| gold / ink(teal) | 4.27 | AA-large — gold jewellery on teal figures, ≥ 24 px |

**Rules.** Palette B is applied by `data-scene` on the stage during Cantos I–VII and switches back to A for any forum content; body copy inside a story scene is set in `--ink` teal on `--paper` sand (7.59:1); flame is a gradient `linear-gradient(90deg, #FF7A1A, #FFD166)` used on strokes and glyph fills only.

### 2.4 Recommendation and use

Adopt **Palette A** as the system and **Palette B** as the story-scene mode. The two share `--gold`, `--terra`, `--flame*`, which is what lets a scene change feel like the same world under different light. Light-mode surfaces are limestone (paper/sand/stone), dark-mode surfaces are the sea (press/abyss/sea/sky); there is no "grey" anywhere in the system — every neutral is either stone or water. Add the film grain (`--grain: .06`) over every stage as pear.no does; it is the one thing that makes procedural colour look photographed.

---

## 3. Mosaic

### 3.1 The traditions the motif must be true to

**Greek pebble mosaics (5th–4th c. BC).** Before cut stone: smooth water-worn pebbles pressed into lime mortar, figures in white against a dark ground, volume modelled by grey pebbles in tonal gradation; **thin lead strips or fired-clay strips** set on edge to draw contour lines. Olynthus (early 4th c. BC, griffins on a stag), Pella (late 4th c. BC — the *Stag Hunt* signed by **Gnosis**, the earliest signed mosaic; the *Lion Hunt*), and — importantly for us — **Motya/Mozia** in Phoenician Sicily, a black-and-white pebble floor with a winged griffin chasing a deer. *Lesson:* the earliest Mediterranean mosaic is a **drawing in points with a wire for the line** — the origin of our "hairline + dot" language.

**Roman opus tessellatum / vermiculatum (Malta, Sicily, Tunisia).** Tesserae of marble, limestone, terracotta and later glass *smalto*, mostly ≈ 1 cm cubes (0.5–1.5 cm), laid in **brickwork rows so grout lines align in one direction but not both** (*opus tessellatum*, ≥ 4 mm); fine work in tesserae ≤ 4 mm following the contours of the figure (*opus vermiculatum*, "worm-like"); grids (*opus regulatum*); large cut shapes (*opus sectile*, "cut work", later the Byzantine *opus alexandrinum* and Roman Cosmatesque pavements).
- **Domvs Romana, Rabat (Malta)** — discovered 1881, a 1st-c. BC town house inside Roman Melite, in use to the 2nd c. AD; its peristyle *emblema* is the **two doves drinking from a bowl** — Sosus of Pergamon's motif, praised by Pliny — inside a border with an astonishing **3-D perspective effect** (tumbling cubes) and theatre masks; ranked with Pompeii and Sicily among the finest early western-Mediterranean floors. *This is the home mosaic. The doves' emblema is the natural centre of the site's "emblema" component.*
- **Villa Romana del Casale, Piazza Armerina (Sicily)** — early 4th c. AD; the *Great Hunt* corridor (~59–60 m of animals captured and shipped, with Carthage, the Italian coast, Egypt and the Nile identifiable), the *Room of the Ten Girls*; executed by **North-African (Carthage) workshops** who brought their own tesserae. *Lesson:* mosaic as long horizontal narrative — a scroll.
- **Bardo, Tunis** — the world's largest Roman mosaic collection; **Ulysses and the Sirens** from Dougga (3rd c. AD, 3.80 × 1.30 m) — one of the very few ancient images of *Odyssey* XII — and the *Virgil* mosaic from Sousse. *Lesson:* the Odyssey was already a mosaic subject in this sea; we are not inventing the association.

**Byzantine gold (Ravenna, Sicily).** Glass tesserae; gold ones are three hot-fused layers — support glass, gold leaf < 1 µm, and the thin protective **cartellina** on top that seals and brightens it. Setters at Ravenna deliberately **tilted each gold cube at a slightly different angle, often downward toward the viewer**, so that under oil-lamps the wall shimmered as one moved. Mausoleum of Galla Placidia (mid-5th c.): a vault of gold stars on Byzantine blue — counts in the literature vary from 570 to ~900 — one of the first starry skies in art. San Vitale (547), Sant'Apollinare Nuovo, Classe (549). Then Norman Sicily importing Constantinople workshops: **Cefalù** apse Pantocrator inscribed **1148**, the Cappella Palatina in Palermo (1140s), and **Monreale** (William II; mosaics mostly 1183–1189; ~6,400 m², 130+ scenes, hundreds of kilograms of gold). *Lesson:* gold is not a colour, it is an **angle**; and "a sky full of stars" (Song I) is literally a Ravenna vault.

**Andamento.** The rhythm and direction of the tessera rows. Straight brick (tessellatum), contour-following (vermiculatum), fan/scale (*circumactum*), crazy paving (*palladianum*). Borders: **guilloche** (2–5 strand braid), **wave-crest / running-dog**, **meander / Greek key**, **imbricated scales**, **perspective cubes**. *Lesson:* a mosaic is a **flow field**; that is what distinguishes it from a pixel grid or a Voronoi splatter.

### 3.2 Vocabulary → interface

| Mosaic term | UI translation | Where |
|---|---|---|
| Tessera (~1 cm cube) | The **chip**: 1 unit of label, one speaker/think-tank card; always with a 1 px "grout" gap, never a shadow | labels, cards, grids |
| Grout / interstice | The **hairline** (`--rule` 14% / `--rule-dark` 22%) — every rule on the site is a grout line | rails, frames, dividers |
| Lead contour strip (Pella) | The **drawn rule** that outlines a focal shape (crosshair, ellipse rim) | pear.no's `draw`/`ruleH`/`ruleV` |
| Andamento | The **scroll timeline**: sections flow along a curve, not a stack; card grids offset row-by-row (brickwork), never a dead square grid | stage layout, card grids |
| Opus vermiculatum | Type and rules **follow the contour of the 3-D object** (star, hand, raft) in a scene | hero, Canto scenes |
| Opus sectile | **Large geometric panels** (Day 1/2/3, four specialist events) as big cut shapes, colour-blocked in stone/sea | programme section |
| Emblema (central panel) | The **hero panel**: a centred framed object (the star / the doves) surrounded by a plain field | hero, chapter openers |
| Guilloche border | The **progress rail** braid: two strands (Ulysses/Calypso) that interlace along the vertical rail | left rail |
| Wave-crest border | The running divider between the three days | programme |
| Meander / Greek key | **Corner marks** of frames, 9 px, drawn in | footer frame, cards on hover |
| Perspective cubes (Domus border) | The **3-D card flip/tilt** at ≤ 6° — the only 3-D transform on UI | speaker cards |
| Gold tessera set at an angle | **Specular glint** on hover/scroll: a highlight that moves *across* a surface as the pointer or scroll changes the "viewing angle" | CTAs, gold rims, stat numerals |
| Cartellina | The 1 px inner highlight ring (`inset 0 1px rgba(255,250,232,.7)`) on gold pills — pear.no's `.cf-send` does exactly this | pill buttons |
| Galla Placidia vault | The **star field**: gold-leaf points on abyss with per-star tilt/twinkle; one star that descends | hero / Canto I |
| Doves emblema (Sosus) | The **Unity** pillar mark: two forms sharing one bowl | U · Unity |

### 3.3 Texture, transitions, shader

**Texture (CSS/SVG, no WebGL).** Two `mask`/`background` layers give a convincing tessellated surface for cards and section grounds:
1. A **tile pattern** drawn once as SVG: an 8-column brickwork of slightly irregular quads (jitter vertices ±6%), each cell filled with a 3-step tonal ramp of the surface colour (stone: `#D6C39C / #CDB88E / #E0CFAE`), separated by 1 px grout at `--rule`. Encoded as a data-URI `background-image`; sized `clamp(14px, 1.1vw, 20px)` so tesserae stay ≈ 1 cm at arm's length.
2. A **grain** layer (`feTurbulence` SVG, opacity `--grain`) — pear.no's `#inkf` idea — and, for gold surfaces, a **conic-gradient rim** rotating on `--ra` (pear's `cfRim`, 7.5 s linear, second rim 11 s reverse) reads as the tilted-tessera glint.
The mosaic texture is **never behind body copy**; it lives in section grounds, card faces at ≤ 12% opacity, and full-strength only in illustration panels.

**Transitions (the four narrative wipes).**
- **Tessellate** (default scene change): the outgoing scene is masked by a tessera grid whose cells switch off *along an andamento* — a sweep that follows a flow field from one edge, 0.9 s, `--ease-veil`. This is pear.no's `.faq.out` 5 px dot mask (`mask-image: radial-gradient(...)`, `mask-size: 5px 5px`) rebuilt with a 16–20 px mosaic cell and an ordered rather than uniform threshold.
- **Shatter** (Preamble: Zeus' thunder): the ship's silhouette breaks into tesserae that scatter along the sea flow field and settle as stars — the *same* cells are re-used, so the star field is literally the ship. 1.4 s outward, then 2.2 s settle; only once per session.
- **Veil** (Canto I / IV): tesserae keep position but their *grout* widens and colour desaturates toward sand; the type SOFT axis rises 0→60. The reverse (grout closing, SOFT→0) is "the veil tears" in Canto VI.
- **Net → Open hand** (Canto VII): the grid lines thicken into a net over the scene (grout 1→3 px, `--gold-deep`), then the lines dissolve from the centre outward, cells drifting apart with widening gaps — the release. 1.8 s, `--ease-tide`.

**Shader (WebGL / OGL or three.js fragment).** Voronoi-based tessellation with grout, per-cell tilt and gold specular; domain-warped by a flow field so cells follow contours (vermiculatum) instead of a mechanical grid.

```glsl
// uv in 0..1, uTime, uFlowStrength, uGrout (0.06..0.14), uGold (0..1), uLight (vec3), uPalette (sampler2D 1x8 LUT)
vec2 hash2(vec2 p){ p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))); return fract(sin(p)*43758.5453); }
vec2 flow(vec2 p){                       // curl-ish field: rows bend around the focal point uFocus
  vec2 d = p - uFocus; float r = length(d);
  return vec2(-d.y, d.x) / (r + .15) * uFlowStrength;    // tangential → contour-following andamento
}
void main(){
  vec2 p = vUv * uCells;                 // uCells ≈ 40..90 across
  p += flow(vUv) * 6.0;                  // domain warp: vermiculatum
  vec2 i = floor(p), f = fract(p);
  float F1 = 8., F2 = 8.; vec2 id;       // first and second nearest seeds (jittered grid → brick-ish cells)
  for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){
    vec2 g = vec2(x,y); vec2 o = .5 + .35*(hash2(i+g)-.5)*2.;   // jitter ±35% keeps cells quad-like, not organic
    float d = length(g + o - f);
    if(d<F1){ F2=F1; F1=d; id=i+g; } else if(d<F2){ F2=d; }
  }
  float grout = smoothstep(uGrout, uGrout+.02, F2-F1);          // F2−F1 < w → grout line
  vec2 h = hash2(id);
  vec3 base = texture2D(uPalette, vec2(h.x, .5)).rgb;           // pick a tessera tone from the scene LUT
  base *= .92 + .16*h.y;                                        // per-tessera tonal variance
  // tilted tessera: per-cell normal, ±7° (Ravenna setters); gold cells get a sharper lobe
  vec3 n = normalize(vec3((h-.5)*.25, 1.));
  vec3 L = normalize(uLight), V = vec3(0.,0.,1.);
  float spec = pow(max(dot(reflect(-L,n),V),0.), mix(16., 64., uGold));
  vec3 gold = mix(vec3(.85,.64,.25), vec3(.95,.78,.42), h.y);   // --gold → --gold-leaf
  vec3 col = mix(base, gold, uGold * step(.72, h.x));            // ~28% of cells are gold when uGold=1
  col += spec * mix(.12, .9, uGold);                            // the glint
  col += .05 * (hash2(vUv*vec2(1920.,1080.)+uTime).x - .5);     // grain
  col = mix(vec3(.09,.10,.11), col, grout);                     // grout = press-ish
  gl_FragColor = vec4(col, 1.);
}
```
Notes: `uLight` is driven by pointer position (desktop) or device tilt/scroll (mobile) so the glint *moves* like a lamp across a vault; `uFocus` is the projected screen position of the 3-D hero object so rows bend around it; `uGrout` animates the veil/net; `uCells` animates from 90 (fine, vermiculatum) to 24 (coarse, tessellatum) between scenes. Cost is one fragment pass — fine at full-screen on mobile if the canvas is rendered at 0.75× and upscaled.

**CSS-only fallback.** `mask-image` with the SVG tessera pattern + `mask-size` animated from 4 px → 24 px, and a `conic-gradient` glint — no cells tilt, but the language holds under `prefers-reduced-motion` or WebGL failure.

### 3.4 Rules and pitfalls
- Tesserae are **quads with jitter**, not hexagons and not organic Voronoi blobs; organic Voronoi reads "cells/biology", hexagons read "sci-fi honeycomb". Both break the Roman reference.
- Grout is always visible and always darker than the tesserae (Roman) or the setting bed (Byzantine); never white grout — white grout is a bathroom.
- Gold tesserae are ≤ 30% of a field and never adjacent in more than pairs, or the field turns into a gold fill.
- No mosaic *photographs* — the site is procedural; if AI/photographic upgrade credits arrive, they go into scene *plates* (figures), not into textures.
- Never tessellate body copy or the programme; tessellation is for image, ground and transition, not for information.

---

## 4. Motion

### 4.1 What pear.no actually does (measured from its CSS)
- One curve carries almost everything: `--ease: cubic-bezier(.22,1,.36,1)` ("press"); Tailwind's `cubic-bezier(.4,0,.2,1)` and `(0,0,.2,1)` remain only as defaults. **Colour changes are `linear`** (`color .38s linear`, `.42s linear`, `opacity .32s linear`) — hue never eases.
- Durations: defaults `.15s`; hover/background `.26s`; UI opacity `.32–.45s`; block opacity `.6–.8s` with `.4s` delays; transform `.46–.82s`; rules draw `1.15s` (`ruleH/ruleV`, `transform: scaleX/Y(0→1)`, origin 0); stroke draw `1.4s` (`stroke-dashoffset`), delay `.15s`; header in `.7s` at `.42s`, menu in `.7s` at `1.1s`; crosshair `cross .72s` (scale 2.6→.78→1.14→1 with an opacity dip); rims `7.5s`/`11s` linear infinite, glow `4.6s`, `shine` `7s` with a burst in the last 14% of the loop.
- Motion pauses when off-stage (`animation-play-state: paused` unless `.live`), and everything is opacity + small translate (10–22 px) + rules drawing. No bounce.

### 4.2 MTF motion tokens

```css
:root{
  --ease-press: cubic-bezier(.22, 1, .36, 1);   /* out — the workhorse (pear.no) */
  --ease-tide:  cubic-bezier(.16, 1, .30, 1);   /* out, longer tail — large 3-D moves, camera */
  --ease-veil:  cubic-bezier(.65, 0, .35, 1);   /* in-out — crossfades, scene wipes */
  --ease-set:   cubic-bezier(.33, 0, .20, 1);   /* soft in-out — tesserae settling */
  --d-1: .12s;  /* state feedback */            --d-2: .26s;  /* hover fills */
  --d-3: .42s;  /* chips, labels */             --d-4: .64s;  /* blocks in */
  --d-5: .82s;  /* blocks move */               --d-6: 1.15s; /* rule draw */
  --d-7: 1.4s;  /* stroke draw */               --d-8: 2.2s;  /* tesserae settle, shatter */
  --loop-rim: 7.5s; --loop-rim2: 11s; --loop-shine: 7s; --loop-glow: 4.6s; --loop-twinkle: 9s;
  --stagger: 60ms;   /* lines / list items */   --stagger-cell: 8ms; /* tesserae */
  --lerp: .085;      /* smooth scroll factor per frame */
}
```
Colour and opacity crossfades use `linear` (as pear.no); everything spatial uses `--ease-press` unless it is a camera/3-D move (`--ease-tide`) or a wipe (`--ease-veil`).

### 4.3 What never happens
- No bounce, elastic, back, spring overshoot or `steps()` — including on magnetic release.
- No hover scale above **1.03** on UI and none on type; no rotation on hover; no 3-D flips beyond **6°**.
- No blur-in text reveals except the veil scene; no letter-by-letter reveals; no typewriter.
- No parallax layer moves more than **12% of viewport height** across its scroll range; no horizontal scroll-jack; no scroll speed changes. Lerped scroll is allowed (`--lerp .085`) but native scroll, keyboard and anchors must keep working, and it is off on touch and under reduced motion.
- No autoplay carousels, no infinite marquees of logos, no skeleton shimmer, no loaders with percentages (a 1.4 s drawn rule is the preloader).
- No easing on colour; no motion on the programme tables beyond opacity.
- Nothing moves that the user is reading. Motion happens before or beside reading, never under it.

### 4.4 Signature micro-interactions (spec)

1. **Rules that draw.** Every hairline enters by `transform: scaleX(0→1)` (origin left) or `scaleY` (origin top), `--d-6 --ease-press`, staggered `--stagger`. Vertical rails draw top→down; horizontal frames draw from the corner mark outward. On light sections rules are `--rule`, on the stage `--rule-dark`.
2. **Crosshair marks.** 9 px `+` at rail intersections; enter with pear's `cross` (scale 2.6→.78→1.14→1, opacity dip at 62%), `.72s`; a `shine` burst (`scale 1.55 rotate 38deg` for 4% of a 7 s loop) makes one mark glint at a time — the gold tessera catching the lamp.
3. **Chip flood.** Mono-caps chip with a `.flood` layer `clip-path: inset(100% 0 0)` → `inset(0)` on hover, `--d-2 --ease-press`; arrow box border lightens `.26s`. (pear's `.ov .cta .flood`.)
4. **Gold rim orbit.** Gold pill CTA: outer conic-gradient rim rotating `--ra` 0→360° over `--loop-rim` linear, inner rim reverse over `--loop-rim2`, a `cfRimP` opacity pulse (`.55→1→.72`) at 4.3 s; `--rim .86` on focus. Uses `@property --ra { syntax: "<angle>"; }`.
5. **Magnetic pill.** Attraction radius = 1.6× the pill's height (≈ 80–120 px). Button translates toward the pointer at strength `.35`, its label at `.15` (two-layer magnet); driven by `gsap.quickTo(x/y, {duration: .4, ease: "power4.out"})` or a rAF lerp `.12`; on leave, return with the **same** press ease — never elastic. Off on `pointer: coarse`.
6. **Custom cursor.** 6 px dot (instant) + 28 px ring (lerp `.15`, `mix-blend-mode: difference` on light, `--star` at 60% on dark). States: over a chip the ring squares into a 12 px "tessera" with 1 px grout; over a card it expands to 56 px and shows a 9 px mono word (`OPEN`, `DRAG`, `PLAY`); over story scenes it becomes a 4-point star; over inputs/iframes it hides and the native cursor returns. Off on touch and under reduced motion.
7. **Tessera glint.** On cards and gold surfaces a specular highlight moves with pointer position (CSS: a `radial-gradient` at `--mx --my`; GL: `uLight`) — the tilted-tessera effect; max opacity `.22`, `--d-2` to follow, `linear`.
8. **Rail tick.** Active chapter tick widens 9→22 px (`width .5s --ease-press`), its 9 px mono label fades in and slides 4 px (`.35s linear, .5s --ease-press`) — pear's `.rail a.on`.
9. **Stat counters.** Tabular mono digits count up over `.9s --ease-press` once when on stage; the serif numeral fades in `--d-4`; no odometer spinning.
10. **Scene enter/exit.** Blocks enter at `opacity 0 → 1` + `translateY(10px → 0)` (`settle`, `--d-4`), exit at `opacity → 0` + `translateY(0 → −8px)`, always within the pinned stage; `will-change` only while `.live`.

### 4.5 Text reveals
- **Lines, not letters.** Titles split by line (`text-wrap: balance` first), each line in an `overflow: hidden` wrapper, `translateY(110%) → 0` at `--d-5 --ease-press`, `--stagger` 60–80 ms; leading must be ≥ 1.02 for descenders to clear the mask or use `clip-path` instead of overflow.
- **Serif hero:** additionally a 1.2 s `font-variation-settings` tween `"wght" 200 → 300` — ink arriving — never on running text.
- **Story voice (Fraunces italic):** words arrive as whole lines with a 4 px rise; the only per-word treatment is the *veil*: `filter: blur(6px) → 0` with `SOFT 60 → 10`, 1.4 s, Canto I and VI only.
- **Labels:** appear whole, `opacity` only, `linear .32s`, delayed after their rule has drawn (label follows rule, never precedes it).
- **Paragraphs:** never animated per line; the block settles (`settle`) as one.

### 4.6 Reduced motion and performance
- `@media (prefers-reduced-motion: reduce)`: kill lerped scroll, magnet, cursor, rims, shine, shatter and parallax; keep opacity crossfades ≤ `.3s`; scene wipes become dissolves; the GL sea/mosaic stays static (one frame) with grain only.
- JS mirrors the query (`matchMedia`) for the scroll timeline; provide an "Reduce motion" toggle in the footer mono row as well.
- Pinned stage with `position: sticky`, height ≈ 30–40 k px (pear.no ≈ 38.5 k) driven by scroll progress; all off-stage blocks `visibility: hidden` and animations `paused`; GL at 0.75× DPR on mobile; `content-visibility: auto` on the forum sections below the stage.

---

## 5. Layout: stage, rails, labels, hairlines, chips

### 5.1 Stage
One `section.stage` > `div.pin` (`position: sticky; height: 100svh; background: var(--press)`). Layers, bottom to top: `canvas.gl` (sea/mosaic/star shader) → `div.tint` (`--veil`, only in nav-open) → SVG filters (`#grain`, `#tear`) → 3-D layer (three.js/OGL objects: the star, the raft, the hand — or their procedural stand-ins) → content blocks (absolutely positioned, `.on/.out/.live/.go`) → `div.ov` overlay (rails, marks, CTA, cursor). Scroll progress = timeline; chapters are ranges of progress, not DOM sections.

### 5.2 Grid tokens

```css
:root{
  --gx:   clamp(1.5rem, 5vw, 5rem);      /* outer gutter (pear: px-[clamp(1.5rem,5vw,5rem)]) */
  --gx-2: calc(6% + clamp(1.25rem, 2.4vw, 2.75rem)); /* inner content inset (pear) */
  --v1:   max(1.25rem, 2.65vw);          /* left rail x (pear: .menu left 2.65%) */
  --v2:   calc(100% - var(--v1));        /* right rail x */
  --h1:   24%;                            /* rail vertical anchor (pear: .rail top 24%) */
  --gap:  clamp(1.5rem, 2.6vw, 3rem);    /* column gap */
  --gap-y:clamp(2.25rem, 6vh, 4rem);     /* block gap */
  --cols: 12;
  --row-h: clamp(3.5rem, 9vh, 6rem);     /* section header band */
  --r-1: 3px; --r-2: 4px; --r-pill: 999px;
}
.grid{ display:grid; grid-template-columns: repeat(var(--cols), minmax(0,1fr)); column-gap: var(--gap); padding-inline: var(--gx); }
```
Content widths are typographic, not column-based: body `max-width: 56ch` (44–52ch on the stage), leads `32em`, hero `9em`, titles `11em`. Blocks on the stage are placed with the same percentage vocabulary as pear.no (`left 6–8%`, `right 7%`, `top 18/24/34/38%`), and never centred unless they are an *emblema*.

### 5.3 Rails, hairlines, marks
- **Left rail** (`--v1`, top `--h1`, `translateY(-50%)`): a 1 px vertical grout line with one 9 px tick per chapter (Preamble, Cantos I–VII, Conclusion, then Forum: SUN, Days, 11 for 11, Events, Register). Active tick 22 px + mono label at 34 px offset. A second, gold strand braids around it as progress — the **guilloche**. Hidden while the footer is on.
- **Top-right pill CTA**: mono caps `REGISTER →`, `--chip` on dark / `--paper` on light, `--r-2`, flood on hover; becomes gold (`--gold` face, `--ink` text, cartellina inner highlight, rim orbit) in the final chapters.
- **Bottom-left mark**: the MTF sea-outline glyph (from the logo, redrawn as a single 1 px stroke path) drawn in with `draw` 1.4 s, plus a 9 px mono label (`MALTA · 25–27 NOV 2026`).
- **Hairlines**: 1 px, colour `--rule`/`--rule-dark`; frames are four separate rules drawn from a corner mark, never a bordered box; horizontal rules under labels are `max-width: 11em`, not full-bleed.
- **Crosshairs** at rule intersections, `--cross`; corner **meander marks** (9 px Greek key, 1 px) on framed cards and the footer.

### 5.4 Labels and chips (anatomy)
- **Label**: `font: 400 var(--t-label)/1 var(--font-mono); letter-spacing: .2em; text-transform: uppercase;` colour `--ink-soft` on light, `paper/75` on dark; an index precedes it (`01 —`) in `.24em`. Labels sit 10–18 px above their title (pear: `.nvm b` margin `clamp(10px,1vw,18px)`).
- **Chip**: label inside `padding: .35em .9em; border-radius: var(--r-2); background: var(--chip)` (dark) / `--chip-light` (light); optional 20–28 px arrow box with 1 px border at 30% white/ink. Chips are tesserae: when several sit together they are separated by 1 px of ground, not by margins.
- **Eyebrows** use forum vocabulary in pear.no's voice — short, declarative, contrarian: `FULL DISCLOSURE`, `THE APPLICATION` → `WHAT MUST WE PROTECT?`, `11 FOR 11`, `AT YOUR SERVICE` → `LEAVE MORE THAN WE TAKE`.

### 5.5 Components
- **Emblema (hero panel)**: centred framed object (the star over the sea; in the forum, the SUN mark) with a drawn guilloche frame; the title sits *below-left* of it in Fraunces 300, the label above-left; the plain field around it is the paper/sea.
- **Tessera cards** (speakers, think tanks, events): brickwork grid (odd rows offset ½ cell), 1 px grout gaps, `--sand` faces on light / `paper @6%` on dark, glint on pointer, ≤ 6° tilt; content = index label, name in Fraunces 400 at `--t-sub`, role in sans `--t-small`, country chip.
- **Question cards** (FAQ / think-tank challenges): pear's `.fq` — serif 26 px question, 12.8–13 px sans body, a tear-off SVG rule; absolute-positioned in the stage while in the story, static grid below it.
- **Nav overlay**: `--veil` + `backdrop-filter: blur(26px) saturate(1.15)`, four to six items in Fraunces 300 at `clamp(34px, 4.6vw, 86px)` lh .98, each with a 9 px mono index; rules between items draw with `.3/.4/.5s` delays; siblings dim to 34% on hover.
- **Programme (three days)**: opus sectile panels — three large cut shapes in `--stone / --sea / --abyss` with the day's events as a mono-labelled list; the wave-crest rule runs between days.
- **Footer**: serif tagline (`LOVE IS THE HAND THAT OPENS.`), mono meta row, four hairlines drawn into a frame, contact form with pill fields and orbiting ellipse rims (pear's `.cf`), the gold `cf-send` button with cartellina highlight.

---

## 6. Scene map (story spine ↔ language)

| Progress | Scene (script) | Ground / palette | Type | Mosaic op | Motion |
|---|---|---|---|---|---|
| 0–6% | Preamble · *The Last Ship* — darkness, Helios' cattle, thunder | `--press` → flame gradient flash → `--abyss` | Fraunces 300 hero `Mediterranean SUN`; label `MTF · 11TH EDITION` | ship silhouette in coarse tessellatum (uCells 24) | **Shatter** (once); rules draw; stars settle |
| 6–12% | *A Sky Full of Stars* | `--abyss`, gold-leaf points | italic story line | Galla Placidia vault; one star brightens | twinkle loop; one star descends `--ease-tide` |
| 12–20% | Canto I · *The Stranger* — Ogygia = Gozo, Ramla, limestone, the veil | Palette B storybook: sand ground, teal ink, `--ramla` | Fraunces italic WONK 1 | vermiculatum rows bend around the cave | **Veil**: grout widens, SOFT 0→60 |
| 20–28% | Canto II · *The Awakening* — "one wave, one breath" | `--sea` → `--sky` | chapter title + lead | fine cells, olive-silver tones enter | slow tide; rules draw one at a time |
| 28–36% | Canto III · *Paradise* — colour explodes | `--stone`, `--gold`, `--lagoon` glints | biggest serif of the story | gold ≤ 30%; guilloche frame | glint follows pointer; chips flood |
| 36–44% | Canto IV · *Seven Years* | day→night cycle of grounds | opsz drifts 144→60 as "time passes" | cells coarsen 90→40 | long crossfades, linear |
| 44–52% | Cantos V–VI · *Forever / The Other Woman* — stars return, the veil tears | `--abyss`, stars, then `--sea` | SOFT 60→0 (veil tears) | grout snaps to 1 px; contour rows straighten | **Veil reverse**, fast (`--d-5`) |
| 52–60% | Canto VII · *The Open Hand* — wreckage, raft, net, star | `--sea` → sunrise `--gold-leaf` on `--sky` | `LOVE IS THE HAND THAT OPENS.` | **Net → open hand** | grid thickens then dissolves outward |
| 60–100% | Forum: SUN pillars · three days · 11 for 11 · events · MED READY · AI hospitality · coffee · speakers · register | Palette A limestone (light) | Fraunces 300 chapter titles, Instrument Sans body, Geist Mono labels | opus sectile panels, tessera cards, wave-crest dividers | rails, chip floods, counters — nothing else |

The pivot at ~60% is the site's own "open hand": the story lets go and the forum begins, in daylight, on stone.

---

## 7. Decisions taken · open questions for the client

**Taken here (change if the client objects):**
1. Type System A (Fraunces / Instrument Sans / Geist Mono); Newsreader/Geist as the quiet alternate; Bodoni Moda/Archivo/Martian Mono as a raid-for-parts option.
2. Palette A "Ogygia" as system; Palette B "Helios" as story-scene mode; gold is a highlight range, never text on paper.
3. Mosaic = jittered-quad tessellation with visible dark grout and contour-following andamento; gold as *angle* (specular), ≤ 30% of any field.
4. One easing family (`press/tide/veil/set`), linear colour, no bounce, no per-letter reveals, reduced-motion parity.
5. Stage + rails + chips + hairlines as in pear.no, with a guilloche progress rail and meander corner marks as the only Mediterranean ornaments in the chrome.

**Open:**
- Does the client want the story (Cantos) *before* the forum (this document's assumption, matching "story spine") or a forum-first landing with the story as a chapter? The scene map assumes story-first with an always-available `REGISTER →` pill and a "skip to forum" tick on the rail.
- Speaker names for MTF11 are TBA; the tessera-card grid is designed to look complete at 8, 24 or 60 cards.
- Sponsor/partner logos (Lavazza, Forbes Travel Guide, airlines) need a monochrome-on-stone treatment; confirm permission to render them as single-colour marks.
- If image/video generation credits arrive: plates for the star, Calypso's hand, the raft, the doves emblema, in the folk-art style (flat figures, teal ink on sand, long diagonal lines, big negative space) — used as *emblemata*, with the procedural sea and mosaic remaining the base.

---

## Sources consulted

Type: [Fraunces — Google Fonts](https://fonts.google.com/specimen/Fraunces/about) · [Fraunces axes explained](https://fontaza.com/fraunces-font/) · [Newsreader — Production Type](https://productiontype.com/font/newsreader) · [Newsreader — Fontsource](https://fontsource.org/fonts/newsreader) · [Instrument Sans — GitHub](https://github.com/Instrument/instrument-sans) · [Instrument Serif — Google Fonts](https://fonts.google.com/specimen/Instrument%2BSerif) · [Geist Mono — Fontsource/npm](https://www.npmjs.com/package/@fontsource/geist-mono) · [Vercel Geist](https://vercel.com/font) · [Bodoni Moda — Google Fonts](https://fonts.google.com/specimen/Bodoni+Moda) · [Martian Mono — Evil Martians](https://evilmartians.com/products/martian-mono) · [DM Mono — GitHub](https://github.com/googlefonts/dm-mono) · [Cormorant — GitHub](https://github.com/CatharsisFonts/Cormorant) · [Cinzel — GitHub](https://github.com/NDISCOVER/Cinzel) · [Source Serif 4 — Google Fonts](https://fonts.google.com/specimen/Source%2BSerif%2B4) · [Bricolage Grotesque](https://ateliertriay.github.io/bricolage/) · [Flecha — Typographica review](https://typographica.org/typeface-reviews/flecha/) · [Flecha — Typewolf](https://www.typewolf.com/flecha) · [GT Standard](https://gt-standard.com/). Existence/axes for all families verified 2026-09-05 via `fonts.googleapis.com/css2` (HTTP 200 for the exact ranges quoted).

Mosaic: [Domvs Romana — Wikipedia](https://en.wikipedia.org/wiki/Domvs_Romana) · [Heritage Malta — Domvs Romana](https://heritagemalta.mt/news/triple-anniversary-for-the-domvs-romana-in-rabat/) · [Sosus of Pergamon](https://en.wikipedia.org/wiki/Sosus_of_Pergamon) · [Villa Romana del Casale — Wikipedia](https://en.wikipedia.org/wiki/Villa_Romana_del_Casale) · [Penn Museum — Villa del Casale](https://www.penn.museum/sites/expedition/the-villa-del-casale-of-piazza-armerina/) · [Bardo — Smithsonian](https://www.smithsonianmag.com/sponsored/national-bardo-museum-tunisia-worlds-largest-collection-roman-mosaics-180960204/) · [Ulysses and the Sirens mosaic](https://discoveralongwithme.com/ulysses-and-the-sirens-mosaic-bardo-museum-tunisia/) · [Virgil Mosaic](https://en.wikipedia.org/wiki/Virgil_Mosaic) · [Gold-leaf tesserae analyses — ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0305440313002677) · [Ravenna Gold — Storied Colors](https://storiedcolors.com/color/ravenna-gold/) · [Galla Placidia starry sky](https://ravennacityguide.it/en/the-starry-sky-of-galla-placidia/) · [Cefalù mosaics (WGA)](https://www.wga.hu/html_m/zgothic/mosaics/3cefalu/index.html) · [Cefalù Cathedral — Wikipedia](https://en.wikipedia.org/wiki/Cefal%C3%B9_Cathedral) · [Monreale mosaics — Wikipedia](https://en.wikipedia.org/wiki/Monreale_Cathedral_mosaics) · [Stag Hunt Mosaic (Pella)](https://en.wikipedia.org/wiki/Stag_Hunt_Mosaic) · [Lion Hunt, Pella — World History Encyclopedia](https://www.worldhistory.org/image/5017/lion-hunt-pebble-mosaic-from-pella/) · [Motya — Livius](https://www.livius.org/articles/place/motya/motya-excavation/) · [Opus tessellatum](https://en.wikipedia.org/wiki/Opus_tessellatum) · [Opus vermiculatum](https://en.wikipedia.org/wiki/Opus_vermiculatum) · [Opus sectile — Britannica](https://www.britannica.com/art/opus-sectile) · [Andamento — The Mosaic Store](https://www.themosaicstore.com.au/blogs/mosaic-tips-techniques/design-fundamentals-andamento) · [Roman border patterns](https://theancienthome.com/blogs/blog-and-news/roman-mosaic-patterns) · [Tessera — Britannica](https://www.britannica.com/art/tessera-mosaic) · [Voronoi/cellular noise techniques](https://sangillee.com/2025-04-18-cellular-noises/).

Place & colour: [Ramla Bay — Wikipedia](https://en.wikipedia.org/wiki/Ramla_Bay) · [Sands with hematitic pigment](https://sandatlas.org/sands-with-hematitic-pigment/) · [Globigerina limestone GHSR status](https://www.guidememalta.com/en/malta-s-iconic-globigerina-limestone-awarded-global-heritage-stone-status) · [Lower Globigerina Limestone — MDPI](https://www.mdpi.com/2075-163X/11/7/740) · [Blue Lagoon shades](https://kyoungtravels.com/2024/10/27/malta-shades-of-blue-lagoon/).

Motion: `/brief/refs/pear-no.css` (measured) · [Magnetic button — Olivier Larose](https://blog.olivierlarose.com/tutorials/magnetic-button) · [GSAP cursor follower](https://demos.gsap.com/demo/cursor-follower/) · [Cuberto cursor & magnetic](https://cuberto.com/tutorials/27/) · [prefers-reduced-motion — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) · [Inclusive motion for scroll-driven animation](https://www.css-scroll-driven.com/accessibility-inclusive-motion-standards/).
