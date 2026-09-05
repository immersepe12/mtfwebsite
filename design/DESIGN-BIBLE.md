# MTF11 — DESIGN BIBLE
## mtf.global · Mediterranean Tourism Forum 2026 · 11th edition · 25–27 November 2026 · Malta · "Mediterranean SUN"

**Status:** FINAL · v1.0 · 2026-09-05 · Design Director synthesis of `design/directions/concept-C.md` (winner, 100 pts) with the grafts the three judges ordered from `concept-A.md` (92) and `concept-B.md` (79.5).
**Audience:** every coding agent. You cannot ask questions; everything you need is in this file, `design/ENGINE-API.md` (the code that exists), `src/content/content.json` (every word of copy) and `src/content/speakers.json`.
**Ground truth for facts:** `brief/01…06`. Where this bible and the brief disagree on a fact, the brief wins. Where this bible and any research/concept document disagree on a design decision, **this bible wins**.
**Precedence of documents:** DESIGN-BIBLE.md → ENGINE-API.md → tech-spec.md → everything else.

---

## 0. HOW TO READ THIS FILE

- §1–§5 are the system (concept, type, colour, layout, motion). They are law for every file.
- §6 is the chapter list — one entry per chapter agent. Copy in §6 is **final**; render it verbatim from `content.json` where a path is given, and from this file where it is marked `(bible)`.
- §7 global components, §8 3D/shaders, §9 art glyphs — one entry per owning agent.
- §10 build partitioning: who owns which file. **No two agents share a file.** §10.2 lists the engine amendments the lead makes *before* any agent starts.
- §11 definition of done. §12 optional generated-media upgrade layer.
- Vocabulary: `[S]` = Storyteller voice (Fraunces Italic, from the gala script). `[F]` = Forum voice (Instrument Sans, from the deck). `EYEBROW` = Geist Mono chip. `p` = a chapter's local scroll progress 0→1 (see §5.3). `vh` = viewport heights of scroll. Mood keys are those of `src/engine/mood.ts` (§8.1).
- Facts marked **TBC** are not in any 2026 source. They ship with a designed, complete placeholder (never a blank, never "lorem", never an invented fact).

---

## 1. THE CONCEPT

### 1.1 Name
**THE LONG TAKE** — nine nights on the water, one uncut shot, four precious mosaics, and a hand that opens.

### 1.2 The feeling (the sentence a visitor should be able to say without knowing why)
> *"I have been on the water all night, someone I trust was talking to me the whole time, and when the sun came up I wanted to be on that island."*

### 1.3 The idea in one paragraph
The site is the gala's own story, *Calypso's Odyssey*, told by the same Storyteller, in which the Forum turns out to be what the story was about all along. The camera is on the Mediterranean at the moment the sun touches the horizon and, over ~46,000 px of scroll, it never cuts: it sinks toward the water, tilts up to a sky full of stars, follows one star down to an island that rises out of the sea as a Roman mosaic floor, turns a full circle to read the four horizons, threads through a net, goes black once, and rises again as the tenth dawn breaks and the sun comes back up through the same word — **SUN** — the visitor saw in the first frame. A mono clock in the corner runs from **16:56 · SUNSET** to **06:51 · SUNRISE**; it stops in Paradise and spins through Seven Years. One gold star is born in the preloader, lives on the left rail as the progress marker and descends one rung per chapter. Three hollow letters on the rail — S · U · N — fill with gold as their pillars pass; the word is only complete when the visitor has scrolled the whole story, and in the final frame the three letters leave the rail and rise as the sun. The mosaic is the world's precious material: it appears as the hero sun's tesserae, the Shatter, the island of the Mediterranean rising from the water, the Open Hand, and the sunrise path — the *same* six thousand tiles every time, never a new asset. Everything else is shadow (flat ink silhouettes backlit by the sky), hairline, mono label and type.

### 1.4 The five rules everything follows from
1. **One shot.** One fixed WebGL world behind every chapter; the camera never cuts except the single true black at "I am Homer" (a post-tint, not a camera jump). Scroll backwards from the footer and the sun sets again.
2. **Two materials.** Everything physical in the world is either **shadow** (flat ink silhouettes) or **gold tesserae**. Nothing is textured, lit or photoreal. No glass, no chrome, no blobs.
3. **Six mosaics, one field.** The instanced tessera field has exactly six formations in story order (§8.5): hero sun disc → shatter → Mediterranean island → fist → open hand → sunrise path. Tesserae never appear behind body copy and never on the programme.
4. **Monastic system, audacious surface.** pear.no's discipline in type, spacing and motion (one ease family, colour never eases, nothing bounces, lines not letters, one reveal per beat) is what makes the audacious moments land.
5. **The Forum is never a brochure stapled on.** Every Forum block enters rule-then-label, sits at ≤ 52ch, and the horizon, the clock and the sea remain visible behind it. The film never pauses for the content.

### 1.5 What this design refuses (do not build these)
No custom cursor. No marquee/ticker on the home film. No countdown widget (the clock is the time device). No stat tiles, bento, stacking cards, glassmorphism, neon, gradient blobs. No percentage preloader. No autoplay sound. No letter-by-letter reveals, no typewriter, no scramble. No hover scale above 1.03; no rotation on hover; no 3D card flips beyond 6°. No parallax layer moving more than 12 vh across its range. No horizontal scroll-jacking. No gold text on paper. No grey anywhere (every neutral is stone or water). No drawn faces — ever. No photographs at launch except the MTF10 speaker portraits (duotone, §7.13).

---

## 2. TYPOGRAPHY — FINAL

### 2.1 The three families (System A "CALYPSO" from `design-language.md`, adopted)

| Role | Family | File (self-hosted, `/public/fonts/`) | Axes required |
|---|---|---|---|
| Display serif + Storyteller italic | **Fraunces** (SIL OFL 1.1, Undercase Type) | `fraunces-var.woff2` (roman), `fraunces-italic-var.woff2` | **opsz 9–144, wght 100–900, SOFT 0–100, WONK 0–1** — all four axes are mandatory; the wght-only file currently in `/public/fonts/` must be replaced |
| Body / Forum voice / UI | **Instrument Sans** (SIL OFL 1.1, Rodrigo Fuenzalida for Instrument) | `instrument-sans-var.woff2`, `instrument-sans-italic-var.woff2` | wght 400–700 (wdth 75–100 welcome but not required) |
| Labels, chips, clock, rail, indices, form | **Geist Mono** (SIL OFL 1.1, Vercel × Basement) | `geist-mono-var.woff2` | wght 100–900 |

**Where to get the woff2 files (lead, before anyone else starts):**
- Google Fonts CSS2 (verified HTTP 200 for these exact axis ranges on 2026-09-05; fetch with a modern Chrome UA so the API returns variable woff2 with per-script `unicode-range` slices — keep the `latin` and `latin-ext` slices, the latter is mandatory for Maltese Ċ Ġ Ħ Ż and the Turkish/Croatian/Slovenian speaker names):
  - `https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1;1,9..144,100..900,0..100,0..1&display=swap`
  - `https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wdth,wght@0,75..100,400..700;1,75..100,400..700&display=swap`
  - `https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap`
- GitHub OFL releases (fallback if the API subsets lack an axis): Fraunces `https://github.com/undercasetype/Fraunces/releases` (variable TTFs `Fraunces[SOFT,WONK,opsz,wght].ttf` and the Italic; convert with `woff2_compress`); Instrument Sans `https://github.com/Instrument/instrument-sans` (`fonts/variable/`); Geist Mono `https://github.com/vercel/geist-font/releases` (zip contains `GeistMono[wght].woff2`).
- Delete from `/public/fonts/`: cormorant-*, newsreader-*, playfair-*, dm-mono-*, inter-tight-*, geist-normal-*, instrument-serif-*. They are not in the system. Keep the licence texts in `/public/fonts/LICENSE-*.txt`.

**`@font-face` (lead writes `src/styles/fonts.css`):**
```css
@font-face{font-family:"Fraunces";font-style:normal;font-weight:100 900;font-display:block;src:url(/fonts/fraunces-var.woff2) format("woff2")}
@font-face{font-family:"Fraunces";font-style:italic;font-weight:100 900;font-display:block;src:url(/fonts/fraunces-italic-var.woff2) format("woff2")}
@font-face{font-family:"Instrument Sans";font-style:normal;font-weight:400 700;font-display:swap;src:url(/fonts/instrument-sans-var.woff2) format("woff2")}
@font-face{font-family:"Instrument Sans";font-style:italic;font-weight:400 700;font-display:swap;src:url(/fonts/instrument-sans-italic-var.woff2) format("woff2")}
@font-face{font-family:"Geist Mono";font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/geist-mono-var.woff2) format("woff2")}
/* CLS ≈ 0 fallbacks */
@font-face{font-family:"Fraunces Fallback";src:local("Iowan Old Style"),local("Georgia");size-adjust:104%;ascent-override:92%;descent-override:26%;line-gap-override:0%}
@font-face{font-family:"Instrument Sans Fallback";src:local("Helvetica Neue"),local("Arial");size-adjust:99%;ascent-override:94%;descent-override:24%;line-gap-override:0%}
```
Preload in `index.html` (lead): `fraunces-var.woff2`, `fraunces-italic-var.woff2`, `instrument-sans-var.woff2` (three `<link rel="preload" as="font" type="font/woff2" crossorigin>`). Geist Mono loads with `swap`.

### 2.2 Font stacks (tokens — these names are what `base.css` and `components.css` already consume)
```css
--font-display: "Fraunces","Fraunces Fallback","Source Serif 4","Iowan Old Style",Georgia,serif;
--font-serif:   var(--font-display);
--font-sans:    "Instrument Sans","Instrument Sans Fallback","Helvetica Neue",Arial,sans-serif;
--font-mono:    "Geist Mono",ui-monospace,"SF Mono",Menlo,monospace;
```

### 2.3 Roles, weights, axes (the whole allowance)

| Role | Family · settings | Notes |
|---|---|---|
| The word **SUN** (Ch 01 knockout, Ch 14 rise) | Fraunces · wght 320 · `"opsz" 144` pinned · SOFT 0 · WONK 0 | It is an SVG `<text>` mask, not a text line (§6, Ch 01). `text-rendering: geometricPrecision`. |
| Hero words (*Mediterranean*, *I lived.*, *Stay today.*) | Fraunces · wght 300 · opsz 144 · SOFT 0 | `--fs-display` |
| Chapter headline (h2) | Fraunces · wght 300 · `font-optical-sizing:auto` · SOFT 0 | `--fs-h1` |
| Second-movement heads (h3) | Fraunces · wght 350 | `--fs-h2` |
| Card / tile titles | Fraunces · wght 400 | `--fs-h3` |
| **Storyteller lines** `[S]` | **Fraunces Italic · wght 300 · WONK 1 · SOFT 12** | The only place WONK is on. `--fs-story`. One line per `<p class="s">`. |
| Forum lead `[F]` | Instrument Sans · 400 | `--fs-lead` |
| Body | Instrument Sans · 400 (500 for emphasis; never 600/700 in running text) | `--fs-body`, measure ≤ 52ch on the stage, 56ch on paper |
| UI / nav rows / form | Instrument Sans · 500 · `letter-spacing: .01em` | `--fs-small` |
| Eyebrows, chips, rail, clock, indices, dates, form labels | Geist Mono · 400 (**500 when ≤ 10 px on dark**) · uppercase · `tnum` | `--fs-label` / `--fs-index`, tracking `--ls-label` .2em / `--ls-index` .24em |
| Big stats (1,600+ · 60/40 · 31+ · 11) | Fraunces 300 opsz 144 numeral + Geist Mono unit | `.stat__n` uses `--fs-stat` |
| Gala title `CALYPSO'S ODYSSEY` | SVG paths traced from Fraunces 300 caps, tracked .06em, stroke-drawn then filled (§9.12) | the one custom lettering moment |

**Absolute rules.** No `text-transform: uppercase` on Fraunces (its caps are wide; the gala title is hand-set SVG). No Fraunces below 18 px. Roman Fraunces never exceeds wght 400 or SOFT 20. WONK only in the Storyteller italic. Instrument Sans has no 300: for lighter text lower the colour (`--fg-muted`), never the weight. Geist Mono 400 at 9 px on the stage is too thin against grain — use 500. `font-variant-numeric: tabular-nums` on every number, date, clock and stat; old-style figures off. `text-wrap: balance` on all headings; `text-wrap: pretty` on body. `hanging-punctuation: first last` on pull quotes where supported. `font-optical-sizing: auto` globally.

**Variable-axis animation — the entire allowance (3 moments, each ≤ 1.2 s, on a single element, disabled under reduced motion):**
1. Ch 01: *Mediterranean* arrives `wght 200 → 300` (ink arriving).
2. Ch 04→05 and Ch 07→08 (the veil crossing) and Ch 08 (the tear): the Storyteller line under the veil goes `SOFT 12 → 60 → 12` with `filter: blur(6px) → 0`.
3. Ch 07: the numeral **11** drifts `"opsz" 144 → 60` over the chapter's hold ("they stopped counting").

### 2.4 Scale — CSS tokens (rem = 16 px). These are the final values of `src/styles/tokens.css`.
```css
/* display serif */
--fs-sun:     clamp(6.5rem, 26vw, 24rem);        /* the word SUN only · lh .82 · ls -.04em */
--fs-display: clamp(3rem, 8.5vw, 7.5rem);        /* 48→120 px · lh .96 · ls -.028em */
--fs-h1:      clamp(2.25rem, 5vw, 4.5rem);       /* 36→72 px  · lh 1.02 · ls -.022em */
--fs-h2:      clamp(1.75rem, 3.2vw, 3rem);       /* 28→48 px  · lh 1.08 · ls -.018em */
--fs-h3:      clamp(1.25rem, 1.9vw, 1.75rem);    /* 20→28 px  · lh 1.18 · ls -.012em */
--fs-story:   clamp(1.25rem, 1.9vw, 1.75rem);    /* storyteller italic · lh 1.22 · ls -.006em */
--fs-stat:    clamp(3.5rem, 8vw, 8rem);          /* 56→128 px · lh 1 · ls -.03em */
/* sans */
--fs-lead:    clamp(1.125rem, 1.4vw, 1.375rem);  /* 18→22 px · lh 1.4 */
--fs-body:    clamp(.9375rem, 1.05vw, 1.0625rem);/* 15→17 px · lh 1.55 */
--fs-small:   clamp(.8125rem, .95vw, .875rem);   /* 13→14 px · lh 1.5 */
--fs-fine:    .75rem;                            /* 12 px captions — the floor; nothing smaller in sans */
/* mono */
--fs-label:   clamp(.5625rem, .66vw, .6875rem);  /* 9→11 px · lh 1 · ls .2em */
--fs-index:   .5625rem;                          /* 9 px · ls .24em — rail, nav indices, clock */
/* leading / tracking */
--lh-display: .96; --lh-tight: 1.02; --lh-h2: 1.08; --lh-h3: 1.18; --lh-story: 1.22; --lh-lead: 1.4; --lh-body: 1.55;
--ls-display: -.028em; --ls-h1: -.022em; --ls-h2: -.018em; --ls-label: .2em; --ls-index: .24em;
/* measures */
--measure: 52ch; --measure-paper: 56ch; --measure-lead: 30em; --measure-title: 11em; --measure-hero: 8em; --measure-story: 24em;
```

### 2.5 Voice (from `content.json → voice.rules`, binding)
One idea per line. Declare, do not describe. Every Forum block ends on one capitalised line. Arrows (→) mean sequence, bullets (•) mean a set — never mixed. Numbers exact and unadorned. British English and the deck's casing (MED READY, 11 FOR 11, Türkiye, programme, organisation). "We" is the region; "you" appears only at the call to action and at Homer's revelation. No exclamation marks, no superlatives, no urgency except the date. Never write a schedule in metaphor. Song titles may be shown; **never lyrics**; the script's singer names are **never** published (draft cast).

---

## 3. COLOUR — FINAL TOKENS

Palette A "OGYGIA" (night sea as stage, limestone as the one daylight chapter). Every hex below is final. Contrast ratios were computed with the WCAG 2.x relative-luminance formula in `design-language.md`.

### 3.1 Tokens (these are the final values in `src/styles/tokens.css`; names kept compatible with `base.css`/`components.css`)
```css
:root{
  /* ── stage & sea (dark surfaces) ── */
  --press:        #090D16;   /* THE stage. Night-sea black. Renderer clearColor + <meta theme-color> */
  --abyss:        #06192B;   /* below the horizon; nav overlay base */
  --sea:          #0E3D57;   /* chapter grounds, card fields on dark */
  --sea-light:    #2B8FA3;   /* alias of --lagoon */
  --lagoon:       #2B8FA3;   /* Comino accent — glints, rims. NEVER text */
  --sky:          #0F5A80;   /* dusk/dawn sky edge; the "cold field" of Ch 09 */
  --black:        #000000;   /* used ONCE: Ch 12 */
  /* ── stone & paper (light surfaces) ── */
  --paper:        #F3EEE3;   /* weathered limestone — Ch 06 ground, satellite pages, print */
  --paper-soft:   #E8DCC2;   /* alias of --sand */
  --sand:         #E8DCC2;   /* cards, chips on paper; the day-columns */
  --stone:        #D6C39C;   /* fresh-cut Globigerina honey; sectile panels */
  --cream:        #FFF7E1;   /* primary type on dark (18.18:1 on press) */
  --star:         #FFF9EA;   /* hairlines, points, crosshairs on dark */
  --ink:          #1B1A17;   /* type on paper (15.04:1) */
  --ink-soft:     #3B3934;   /* secondary type on paper (9.97:1) */
  /* ── earth (story colours; never UI) ── */
  --ramla:        #B44A2D;   /* Ramla red earth — surfaces only; text only ≥ 24 px on paper */
  --terra:        #8C3A2B;   /* the ONLY red allowed as text on paper (6.59:1) */
  /* ── gold: a range, never a flat ── */
  --gold-leaf:    #F1C86A;   /* tessera highlight; gold labels on dark (12.22:1) */
  --gold:         #D9A441;   /* tessera face; CTA face; rims (8.64:1 on press — labels OK on dark) */
  --gold-bright:  #F1C86A;   /* alias of --gold-leaf (components.css uses it) */
  --gold-deep:    #A67C2E;   /* tessera in shadow; gold ≥ 24 px on paper only (3.27:1) */
  /* ── olive & flame (story only) ── */
  --olive:        #6F7A5C;
  --olive-silver: #A9B39C;   /* Stewardship labels on dark (8.90:1) */
  --flame:        #FF7A1A;   /* Helios' wrath, the ember, the dawn — never UI */
  --flame-hot:    #FFD166;
  /* ── semantic (dark stage defaults) ── */
  --bg:           var(--press);
  --fg:           var(--cream);
  --fg-muted:     color-mix(in oklab, var(--paper) 75%, transparent);  /* 9.58:1 on press */
  --fg-faint:     color-mix(in oklab, var(--paper) 55%, transparent);  /* 5.56:1 on press — the floor for text */
  --accent:       var(--gold);
  /* ── derived ── */
  --rule:         color-mix(in oklab, var(--star) 22%, transparent);   /* hairlines on dark (pear #ffffff39) */
  --rule-strong:  color-mix(in oklab, var(--star) 40%, transparent);
  --rule-paper:   color-mix(in oklab, var(--ink) 14%, transparent);    /* hairlines on paper (pear #1d1c1924) */
  --cross:        color-mix(in oklab, var(--star) 53%, transparent);
  --chip:         color-mix(in oklab, var(--star) 14%, transparent);   /* pear rgba(255,255,255,.14) */
  --chip-paper:   color-mix(in oklab, var(--ink) 10%, transparent);
  --veil:         color-mix(in oklab, var(--sea) 58%, transparent);    /* nav overlay tint (pear rgba(6,46,92,.58)) */
  --grain:        .06;
  /* ── live values written by the world every 3rd frame (src/engine/gl.ts) ── */
  --sky-now:      #0b2a45;   /* current sky-bottom colour */
  --warmth-now:   .35;
  --horizon-now:  62%;       /* screen y of the sea horizon, from top (lead amendment §10.2) */
  --veil-now:     0;         /* mood.veil */
  --tear-now:     0;         /* mood.p4 */
}
/* the one daylight chapter and satellite/print pages */
.theme-paper, [data-theme="paper"]{
  --bg: var(--paper); --fg: var(--ink);
  --fg-muted: color-mix(in oklab, var(--ink) 80%, transparent);   /* 8.40:1 */
  --fg-faint: var(--ink-soft);
  --rule: var(--rule-paper); --rule-strong: color-mix(in oklab, var(--ink) 30%, transparent);
  --chip: var(--chip-paper); --cross: color-mix(in oklab, var(--ink) 53%, transparent);
  --accent: var(--terra); --grain: .03;
}
```
Lead: set `renderer.setClearColor(0x090d16)` in `gl.ts`, `<meta name="theme-color" content="#090D16">` in `index.html`, and `DEFAULT_MOOD.skyTop = hex('#090D16')`, `skyBottom = hex('#0E3D57')`.

### 3.2 Usage rules (binding)
1. Gold is an **object or a highlight**, never a word on paper (1.94:1 fails). On paper the warm word colour is `--terra`. On the stage gold labels are allowed (`--gold`, `--gold-leaf`).
2. `--ramla`, `--flame`, `--flame-hot`, `--olive`, `--olive-silver`, `--lagoon` are colours of things in the story (the ember, the earth, the leaves, glints). They never colour UI, buttons, links or chips.
3. Text on dark is `--cream` (primary), `--fg-muted` (secondary), `--fg-faint` (tertiary — never below this). Text on paper is `--ink`, `--fg-muted` (ink 80%), `--ink-soft`.
4. There is no grey. Any neutral you need is stone (paper/sand/stone) or water (press/abyss/sea/sky).
5. Gold tesserae are ≤ 30% of any field and never adjacent in more than pairs; grout is always visible and always darker than the tiles (never white grout).
6. Colour transitions are always `linear` in CSS (`transition: color .38s linear`, `background-color .42s linear`, `opacity .32s linear`). Hue never eases.
7. `::selection { background: var(--gold); color: var(--press) }`. Focus ring: `1.5px solid var(--gold)`, `outline-offset: 4px` (gold on press 8.64:1; on paper the ring is `--terra`).

### 3.3 WCAG table (computed)
| Pair | Ratio | Grade | Use |
|---|---|---|---|
| cream / press | 18.18 | AAA | body on stage |
| paper 75% / press | 9.58 | AAA | secondary on stage |
| paper 55% / press | 5.56 | AA | tertiary on stage (floor) |
| cream / sea | 10.77 | AAA | text on `--sea` grounds/cards |
| cream / sky | 7.03 | AAA | Ch 09 storyteller over the cold field |
| gold-leaf / press · gold / press · gold-deep / press | 12.22 · 8.64 · 5.13 | AAA · AAA · AA | gold labels/chips on stage |
| gold / sea | 5.12 | AA | gold labels on sea cards |
| olive-silver / press | 8.90 | AAA | Stewardship chip text |
| ink / paper · ink-soft / paper | 15.04 · 9.97 | AAA | Ch 06 + satellites |
| ink 80% / paper | 8.40 | AAA | secondary on paper |
| terra / paper | 6.59 | AA | links/accents on paper |
| sea / paper | 9.95 | AAA | titles on paper |
| ink / gold · press / gold-leaf | 7.74 · 12.22 | AAA | ink text on the gold CTA |
| gold / paper | **1.94** | FAIL | decorative only |
| ramla / press | 3.66 | AA-large | never small text |
| lagoon / press | 5.15 | AA | glints, ≥ 24 px only |

### 3.4 Temperature arc of the film (the sky's own timeline; each chapter's Mood in §6 encodes it)
`01 flame→gold horizon on abyss ▸ 02 ember, thunder-navy flash ▸ 03 abyss + starlight ▸ 04 abyss, one gold lamp on the island, honey light on the mosaic floor ▸ 05 sea-navy + gold hairlines ▸ 06 PAPER — the single daylight chapter ▸ 07 sky cycling day/night, desaturating ▸ 08 abyss, brass hairlines ▸ 09 cold --sky field → gold ▸ 10 sea-navy, olive-silver, first grey ▸ 11 ink + cream threads, then gold ▸ 12 #000 ▸ 13 abyss → dawn grey ▸ 14 flame → gold → cream sunrise`

---

## 4. LAYOUT SYSTEM

### 4.1 Page architecture (decided — see §5.3 for the scroll model)
```
html.js.is-ready[.reduced-motion][.is-touch][.nav-open][.theme-paper on Ch 06 only]
└ body (background --press)
   ├ #preloader           fixed · z 100 · removed after reveal                     (ui/preloader)
   ├ canvas#gl            fixed inset 0 · z 0 · pointer-events none · aria-hidden  (engine)
   ├ header#site-header   fixed · z 50 · mark + REGISTER pill + menu               (ui/header)
   ├ nav#site-nav         fixed · z 60 · overlay                                   (ui/header)
   ├ aside.rail           fixed left · z 50 · 14 ticks + star + S·U·N glyphs      (ui/rail)
   ├ div#veil             fixed · z 40 · the cloth, driven by --veil-now/--tear-now (ui/veil)
   ├ div#corners          fixed · z 50 · bottom-left crosshair+label · bottom-right counter+clock (ui/rail)
   ├ main#app             relative · z 2
   │   └ section.chapter#ch-<id> × 14  (each either .chapter--film with a sticky .pin, or a flowing section)
   └ (no #cursor — removed)
```
z tokens: `--z-gl: 0; --z-app: 2; --z-veil: 40; --z-header: 50; --z-nav: 60; --z-preloader: 100;` (`--z-cursor` deleted).

### 4.2 Grid & spacing tokens
```css
--gutter:    clamp(1.5rem, 5vw, 5rem);          /* outer gutter (pear: px-[clamp(1.5rem,5vw,5rem)]) */
--gx-2:      calc(6% + clamp(1.25rem, 2.4vw, 2.75rem)); /* inner content inset */
--rail-x:    max(1.25rem, 2.65vw);              /* left rail x (pear .menu left 2.65%) */
--rail-top:  24%;                               /* rail vertical anchor (pear .rail top 24%) */
--gap:       clamp(1.5rem, 2.6vw, 3rem);        /* column gap */
--gap-y:     clamp(2.25rem, 6vh, 4rem);         /* block gap */
--container: 92rem;
--radius:    4px;  --radius-pill: 999px;
--space-1: .25rem; --space-2: .5rem; --space-3: .75rem; --space-4: 1rem; --space-6: 1.5rem; --space-8: 2rem; --space-12: 3rem; --space-16: 4rem;
```
- `.grid` = 12 columns desktop / 4 mobile (exists in `base.css`). Content widths are typographic, not column-based (`--measure*`).
- **Stage placement vocabulary** (inside a `.pin__frame`): blocks are positioned with pear.no's percentages — headline block `left: 7%`, `top: 18–24%`; storyteller stack under it at `top: 38%`; Forum/right column `right: 7%`, `top: 24%`, width `min(38%, 34rem)`; sign-off line `left: 7%`, `bottom: 14%`. Nothing is centred unless it is an *emblema* (the sun, the hand, the star, the word SUN, "I am Homer").
- **The horizon** is at `var(--horizon-now)` from the top (world-driven, ≈ 62% in the hero, 50% on portrait). Shadow silhouettes sit on it; the SUN baseline sits on it.

### 4.3 Rails, hairlines, chips, marks
- **Hairlines** are 1 px, `--rule` on dark / `--rule-paper` on paper. Frames are four separate rules drawn from a corner mark outward (never a bordered box). Rules under labels are `max-width: 11em`, never full-bleed. Every hairline *draws* (`scaleX/scaleY 0→1`, `--dur-6`, `--ease-press`).
- **Crosshairs** (`.cross`, 11 px) at rule intersections; one mark at a time glints (`shine`, 7 s loop).
- **Meander corner marks** (9 px Greek key, 1 px) only on framed cards and the footer frame.
- **Label chip** anatomy: `font: 500 var(--fs-label)/1 var(--font-mono); letter-spacing: .2em; text-transform: uppercase; padding: .45em .8em .4em; border-radius: var(--radius-pill); background: var(--chip)`. Index precedes label (`04 —`) in `--ls-index`. Labels sit 10–18 px above their title. Adjacent chips are separated by 1 px of ground, never margins (they are tesserae).
- **Eyebrow** = index + chip. Every chapter eyebrow begins with its two-digit index.

### 4.4 Layer discipline inside a film chapter
```
section.chapter--film            height: calc(var(--film-len) * 100vh)
└ div.pin                        sticky · 100dvh · overflow clip
   ├ div.pin__layer.shadow       absolute inset 0 · SVG silhouettes on the horizon · pointer-events none · z 1
   ├ div.pin__layer.plate        (Ch 01 only) the SUN knockout plate · z 2
   ├ div.pin__frame              absolute inset 0 · the type · z 3
   └ div.pin__layer.fx           optional chapter-local SVG (net, constellation labels, counter) · z 4
```
The WebGL world is *behind* all of this (fixed canvas). Chapters never add meshes; they drive the world through `mood` (§8.1).

---

## 5. MOTION

### 5.1 Tokens (final `tokens.css` values)
```css
--ease:         cubic-bezier(.22, 1, .36, 1);   /* "press" — the workhorse (pear.no). Alias --ease-press */
--ease-press:   var(--ease);
--ease-out:     cubic-bezier(.16, 1, .30, 1);   /* "tide" — long tail: camera, large moves. Alias --ease-tide */
--ease-tide:    var(--ease-out);
--ease-in-out:  cubic-bezier(.65, 0, .35, 1);   /* "veil" — crossfades, wipes */
--ease-veil:    var(--ease-in-out);
--ease-set:     cubic-bezier(.33, 0, .20, 1);   /* tesserae settling */
--dur-1: .12s;  /* state feedback */    --dur-2: .26s;  /* hover fills */
--dur-3: .42s;  /* chips, labels */     --dur-4: .64s;  /* blocks in */
--dur-5: .82s;  /* blocks move */       --dur-6: 1.15s; /* rule draw */
--dur-7: 1.4s;  /* stroke draw */       --dur-8: 2.2s;  /* tesserae settle */
--dur-fast: var(--dur-2); --dur: var(--dur-4); --dur-slow: var(--dur-6);   /* engine aliases */
--loop-rim: 7.5s; --loop-rim2: 11s; --loop-shine: 7s; --loop-glow: 4.6s; --loop-twinkle: 9s;
--stagger: 60ms; --stagger-cell: 8ms;
--lerp: .085;   /* Lenis lerp — already set in scroll.ts */
```
GSAP equivalents: `--ease` = `"power4.out"` (close) or `CustomEase.create("press", ".22,1,.36,1")`; `--ease-tide` = `"expo.out"`; scrubbed tweens use `ease: "none"` (the scrub is the easing).

### 5.2 What never happens
No bounce/elastic/back/spring, no `steps()` except the cattle's 4-step walk, the thunder flash and the clock's spin. No hover scale > 1.03 on UI, none on type. No blur-in text except the veil beats. No letter-by-letter. No parallax > 12 vh. Colour never eases. Nothing moves that the user is reading — motion happens before or beside reading, never under it. Motion pauses when a chapter is inactive (`.is-active` gates idle loops; `animation-play-state: paused` otherwise).

### 5.3 Scroll model — DECIDED: *a sequence of pinned films on one continuous world*
The engine already implements this and it is what we ship:
- `#app` holds 14 `<section class="chapter">` in order. Every chapter with choreography calls `createFilm(ctx, { length })` → its section is `length × 100vh` tall, holds a sticky `.pin` (100dvh, `overflow: clip`) and gets a paused GSAP timeline `tl` (duration 1) scrubbed 0→1 across the section's travel (`scrub: 0.6`).
- The WebGL canvas is `position: fixed` behind everything, so the world is one continuous shot; `Stage.computeMood` blends each chapter's `mood(p)` into the next over the last 38% of the section. Chapter moods must therefore be designed to **hand over**: your end state is the next chapter's start state (§6 gives both).
- **The seam rule.** Because pins hand over by sliding, every film's DOM frame must be *empty* at its seams: all frame content is at `opacity 0` for `p < .06` and for `p > .90` (exit by `.90`). The world does not slide (it is fixed), so the join is invisible. Exception: Ch 14 (the last section; it flows into the footer).
- **Lengths** (desktop → mobile). Total ≈ 51.5 vh desktop (≈ 46,000 px at 900 px) / ≈ 31 vh mobile. `const len = shared.mobile ? mobileLen : len`.
- **Reduced motion:** `if (ctx.shared.reduced)` the chapter does **not** call `createFilm`; it renders the same DOM as a flowing `.ch-inner` stack (class `chapter--static`), every element visible (`is-revealed`), no scrubbed timeline, no idle loops; `mood` still declares the chapter's *end* state as a static object so the world shows a still per chapter. Lenis is `lerp: 1` (native) in reduced motion (already wired).
- **Local progress `p`** is the film ScrollTrigger's progress (`top top → bottom bottom`). The lead's amendment §10.2-A makes `Stage.computeMood` use the same `p` for film chapters so mood and timeline agree.
- **Scroll holds** are scroll *distance*, never timers, never locks (Ch 12's hold is 1.2 vh of no-op inside the section).

### 5.4 Reveal rules
1. **Lines, not letters.** Headlines and storyteller lines: `reveal(el, { type: 'lines' })` (SplitText masked lines, `yPercent 110 → 0`, `--dur-5`, stagger `--stagger`). Chars never. Words only for ≤ 3-word slogans.
2. **One reveal per beat.** Inside a film, each beat reveals one block: the headline *or* the storyteller line *or* the Forum block. Never all three at once.
3. **Rule → label → content.** A Forum block enters in that order: its hairline draws (`--dur-6`), then its mono label fades (`linear .32s`), then the block settles (`opacity 0→1` + `translateY 10px → 0`, `--dur-4`). Labels never precede their rule.
4. **Storyteller lines** arrive whole, one per beat, 4 px rise, and **stay** until the chapter exits (they accumulate as a stack, max 6 visible; older lines fade to `--fg-faint`).
5. **Exit** is `opacity → 0` + `translateY(0 → −8px)`, `--dur-4`. Always inside the pin.
6. **Chapter head sequence** (every film, at p 0–.15): eyebrow rule draws → eyebrow → headline lines → first storyteller line. At p .85–.90 everything exits.
7. In a scrubbed film, put reveals on `tl` with `ease: 'none'` (`tl.fromTo(el, {...}, {..., duration: .06}, .10)`), or call `reveal()` with `{ scrub: true, trigger: ctx.el }` for the non-pinned chapters (06 paper section, 14 footer).

### 5.5 Reduced-motion rules (binding, tested)
`html.reduced-motion`: no pins (§5.3), no SplitText, no rims/shine/glow loops, no parallax, no magnet, no idle `onFrame` work; opacity crossfades ≤ .3 s; the world renders a still per chapter (mood snaps: World `damping` unchanged but tesserae `uTime` frozen, sea `seaSpeed × .15`, stars `twinkle 0`, grain static); the preloader is a 0-duration fade; the Shatter and the Hand are shown assembled (tess = 1). A visible `MOTION: FULL / REDUCED` toggle lives in the footer mono row and the nav overlay (persisted to `localStorage`, toggles `html.reduced-motion` and reloads).

---

## 6. THE CHAPTER LIST — FINAL (14 chapters, one agent each)

### 6.0 Map

| # | id (`chapter.id`) | Folder | Title (nav/rail label) | Canto | Emotion | Film len desktop / mobile (vh) | Clock | Rail glyph |
|---|---|---|---|---|---|---|---|---|
| 01 | `hero` | `src/chapters/01-hero/` | The Sun | Overture | AWE | 3 / 2 | 16:56 · SUNSET | all hollow |
| 02 | `warning` | `02-warning/` | The Warning | I | GRAVITY | 4 / 2.5 | 17:40 | **S fills** at p .92 |
| 03 | `stars` | `03-stars/` | A Sky Full of Stars | II | LOST → HOPE | 4 / 2.5 | 21:10 | — |
| 04 | `ogygia` | `04-ogygia/` | The Tenth Dawn | III | ARRIVAL | 4.5 / 3 | 23:00 | — |
| 05 | `unity` | `05-unity/` | The Hand That Lifts | IV | TENDERNESS | 3 / 2 | 00:15 | **U fills** at p .95 |
| 06 | `paradise` | `06-paradise/` | Paradise | V | JOY | 4.5 / 3 | — · STAY TODAY (stopped) | — |
| 07 | `eleven` | `07-eleven/` | Seven Years, Eleven Editions | VI | TIME | 5 / 3 | spins 01:00 → 04:00 | — |
| 08 | `rudder` | `08-rudder/` | The Hand Upon the Rudder | VII | RESOLVE | 5 / 3 | 04:10 | — |
| 09 | `forever` | `09-forever/` | Forever | VIII | FEAR → CLARITY | 3 / 2 | 04:50 | **N fills** at p .9 — S·U·N complete |
| 10 | `remains` | `10-remains/` | What Remains | IX | LEGACY | 4 / 2.5 | 05:20 | — |
| 11 | `hand` | `11-hand/` | The Open Hand | X | LETTING GO | 4.5 / 3 | 05:55 | — |
| 12 | `homer` | `12-homer/` | I Am Homer | XI | REVELATION | 3.5 / 2.5 | 06:20 | — |
| 13 | `register` | `13-register/` | The Raft | Coda | COURAGE | 3.5 / 2.5 | 06:40 | — |
| 14 | `sunrise` | `14-sunrise/` | Sunrise | Finale | CATHARSIS | 2 / 1.5 (+ flowing footer) | 06:51 · SUNRISE | S·U·N rise as the sun |

Registry order (lead writes `src/chapters/registry.ts`): `hero, warning, stars, ogygia, unity, paradise, eleven, rudder, forever, remains, hand, homer, register, sunrise`. `inNav: true` + `navIndex` for hero (01), paradise (02), eleven (03), rudder (04), hand (05), register (06). `label` = the title above.

**Every chapter agent implements the same skeleton** (see ENGINE-API for the contract):
```ts
import type { Chapter } from '../../engine/chapter'
import { createFilm } from '../../engine/film'
import { reveal, drawRule } from '../../engine/text'
import { hex } from '../../engine/mood'
import './style.css'
export const hero: Chapter = {
  id: 'hero', label: 'The Sun', navIndex: '01', inNav: true,
  mount(ctx) { /* reduced → static stack; else createFilm + build .pin__frame + tl tweens at p positions */ },
  mood: p => ({ /* keyframes from §6.x interpolated with gsap.utils.interpolate or piecewise */ }),
}
```
`mood(p)` is a *function of p* built from the keyframe tables below (piecewise-linear between the listed anchors; use `gsap.utils.mapRange`/`interpolate`). Values not listed keep `DEFAULT_MOOD`. RGB values via `hex('#…')`. All copy below is rendered into real DOM (`h2`, `p.s`, `p.f`, `ul`, `a`) inside `.pin__frame`.

**World coordinates reminder (engine):** camera looks down −Z from `(camX, camY, camZ)`, `camTilt` = pitch in radians (positive = look up), `camYaw` = heading in radians (§10.2-B); sea plane at `y = seaY`; sun billboard at `(sunX, sunY, sunZ)` with `sunRadius`; `sunHeat` 0 = white star → 1 = gold sun; tesserae field at `z ≈ −4` in front of the sun.

---

### 6.1 · `hero` — THE SUN · Overture · 16:56 · SUNSET
**Purpose.** Announce the Forum and its theme in one image — the sun setting inside the word SUN — and set the film's rules (dark stage, serif + mono, restraint) in five seconds.

**Eyebrow.** `01 — MEDITERRANEAN TOURISM FORUM · 11TH EDITION · MALTA · 25–27 NOVEMBER 2026` (`event.name`, `event.edition.ordinal`, `event.city.value`, `event.dates.display`).

**Headline (h1).** *Mediterranean* (Fraunces 300 italic, `--fs-display`, cream, `left: 7%`, above the word) + **SUN** as the knockout plate (below). The `<h1>` is `<h1 class="hero__h1"><span class="hero__medi">Mediterranean</span> <span class="sr-only">SUN</span></h1>`; the visible SUN is the SVG plate (aria-hidden).

**Sub-line (p .15).** `Stewardship · Unity · Net Positive` (`event.theme.expansion`), Fraunces 300 `--fs-h3`, under the word at `left: 7%`.

**Forum copy `[F]`** (`theme.lines[0..2]`): *For thousands of years, the Sun has shaped Mediterranean civilisation, architecture, agriculture, food, culture and way of life.* / *Today, SUN represents the tourism model we want to build.* / *It asks three questions:*

**The three questions** (`theme.questions[i].letter`, `.text`) as three hairline-framed cards, right column (`right: 7%`, `top: 24%`, width `min(38%, 34rem)`), each: glyph letter in Fraunces 300 `--fs-h2` gold, question in Instrument Sans 500 `--fs-small` uppercase `.06em`:
`S — WHAT MUST WE PROTECT?` · `U — WHAT CAN WE ACHIEVE TOGETHER?` · `N — WHAT SHOULD TOURISM LEAVE BEHIND?`

**Storyteller stitch `[S]`** (tiny, p .85, `--fg-faint`): *The Sun fills the screens.* (bible; script stage direction)

**CTA.** Persistent `REGISTER →` pill (header). Secondary mono link `WATCH MTF10 ↗` → `registration.watchLastYear.currentUrl` (TBC; opens new tab).

**Visual / 3D.** Background: the sky at dusk — the sun billboard sitting on the horizon (its lower fifth below the sea line), bloom at max, sky flame → gold at the horizon, sea-navy → abyss at the zenith. The tessera field in **formation 0 (sun disc)**, `tess 1`, `tessGold .9`, in front of the billboard at z −4 so that what pours through the letters is *gold tesserae glinting*, not a flat glow. Sea: calm, glitter pointing at the camera, a gold path from the horizon to the bottom edge. Foreground: **the SUN plate** — an inline SVG filling the pin:
```html
<svg class="sun-plate" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 1000 1000">
  <defs><mask id="sunmask"><rect width="1000" height="1000" fill="#fff"/>
    <text x="500" y="0" text-anchor="middle" font-family="Fraunces" font-weight="320" font-style="normal"
          style="font-variation-settings:'opsz' 144" fill="#000" letter-spacing="-.04em">SUN</text></mask></defs>
  <rect width="1000" height="1000" fill="var(--press)" mask="url(#sunmask)"/>
</svg>
```
The plate is `--press`; the letters are holes; the fixed canvas shows through them. Size the `<text>` in JS (`font-size` attribute) so its cap height = `var(--fs-sun)` and set its `y` so the baseline = `var(--horizon-now)` (re-run on resize and on `--horizon-now` change). Because the sun disc is *behind* the plate, sinking the sun drains the light out of each letter from the top down — the sunset happens *inside the letters*. Mouse parallax ±6 px on the type, ±14 px inverse on the sun (`camX` via `shared.mouse` is already in the engine; the type parallax is chapter CSS `transform` from `--mx`).

**Mood keyframes.**
| p | camY | camZ | camTilt | fov | sunX,Y,Z | sunRadius | sunGlow | sunHeat | skyTop | skyBottom | haze | seaY | seaAmp | seaSpeed | tess | tessForm | tessGold | tessGlint | stars | bloom | warmth | mosaic |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 1.1 | 8 | .07 | 34 | 0, −.35, −6 | 1.2 | 1.0 | 1 | #090D16 | #B44A2D | .3 | −1.2 | .12 | .35 | 1 | 0 | .9 | .8 | .15 | .9 | .85 | 0 |
| .45 | .9 | 7.6 | .07 | 34 | 0, −.5, −6 | 1.2 | 1.0 | 1 | #090D16 | #8C3A2B | .3 | −1.2 | .12 | .35 | 1 | 0 | .9 | .8 | .2 | .9 | .8 | 0 |
| 1 | .6 | 7 | .05 | 34 | 0, −1.9, −6 | 1.0 | .55 | 1 | #090D16 | #3A1A14 | .25 | −1.2 | .14 | .35 | .2 | 0 | .6 | .3 | .35 | .7 | .55 | 0 |
(preloader reveal: at page ready the world snaps to p 0 with `sunY` starting at −1.6 and rising to −.35 over 1.4 s — the rise *is* the hero; owner ui/preloader tweens `world.target.sunY` before handing over).

**Choreography 0→1.** p 0–.12: `Mediterranean` line-masks up with `wght 200→300`; the SUN plate is already there (the sun is the reveal). p .12–.22: sub-line settles under a hairline (`ruleH` 1.15 s). p .22–.55: the three question cards draw in sequence (rule → glyph → label, 60 ms stagger, each 8% of p). p .30–.60: Forum lines settle at left under the word. p .45–1: the sun sinks (mood) — light drains from the letters top-down; the sky reddens gold → flame → ember; `SUN` ends black on black with an ember rim on its baseline (the plate's baseline is the horizon). p .85: the storyteller stitch. p .90: all type at opacity 0; the plate stays until p 1 (it hands over as pure black on black).

**Transition → 02.** No cut. The ember is now a thin line. Rail label rewrites `THE WARNING`. Ch 02 starts with the frieze already walking in from the right at the horizon.

**Mobile.** `--fs-sun` 26vw keeps the knockout full-width; question cards stack under the word (full width); parallax off. Film 2 vh.

**Data.** `event.*`, `theme.lines`, `theme.questions`, `registration.watchLastYear`.

---

### 6.2 · `warning` — THE WARNING · Canto I · Stewardship · 17:40
**Purpose.** Stewardship as the oldest Mediterranean warning: the cattle of Helios. Establish the wreck the rest of the film rebuilds from. **The Shatter — mosaic moment.**

**Eyebrow.** `02 — S · STEWARDSHIP — WHAT MUST WE PROTECT?` (`theme.pillars[0].deckTitle`, `.question`).

**Headline (h2).** *Do not touch what belongs to the Sun.* (script; bible-final).

**Storyteller `[S]`** (one per beat): *His companions had been warned.* / *They knew.* / *And still they did.* / *Perhaps that too is human:* / *to know the road…* / *and still lose our way.* — then at the shatter: *Zeus answered for Helios.* / *The ship breaks apart.* / *The sailors disappear.*

**Forum `[F]`** (`theme.pillars[0].lines[0,1,3]`): *Tourism brings opportunity — but also responsibility.* / *Visitors, businesses, authorities and communities all have a role in protecting the places we share.* / *Growth must improve the places people visit — not consume what makes them special.* Chip row (`pillars[0].domains`): `HERITAGE · ENVIRONMENT · COMMUNITIES · CULTURE · DESTINATIONS · SEA`. Verb row mono (`pillars[0].verbs`): `PROTECT → RESPECT → PRESERVE → ENHANCE`. Closing serif `--fs-h2` (`lines[2]`): **Enjoy the destination. Respect the place.** Sign-off mono (`closingLine`): `PROTECT WHAT MAKES THE MEDITERRANEAN SPECIAL.`

**CTA.** None. The S filling gold is the reward.

**Visual / 3D.** Background: the last ember — a horizontal blur of flame on abyss; the sky already navy. Shadow layer: **the frieze** — seven flat ink cattle (§9.2 `cattle()`), ~5% of frame height, walking left along `--horizon-now`, each with the sun's mark as a hole in its flank through which the ember shows. The sea reflects them as broken glitter. **The Shatter at p .35–.42:** the stage flashes navy twice (`steps(2)`, 120 ms — a `.pin__layer.flash` div), a 1 px cream bolt draws top → horizon in 60 ms (§9.3), `aberration` spikes, the camera shakes (`camX ±.04` via `onFrame` for 400 ms), and then **the entire frame becomes tesserae**: `mood.mosaic` 0 → 1 in 6% of p (post-process — sky, sea, cattle, type and chrome are all tiled with dark grout), holds one beat, then the instanced field takes over: `tess` 1 → 0 with `tessSpread` 1 → 6 and `p3` (shatter gravity, §8.5) 0 → 1 so 6,000 gold-and-ink tiles fall out of the image into the sea along the sea's flow, while `mosaic` returns to 0 underneath — the "real" frame is revealed with the cattle gone. The DOM type dissolves in sympathy with the `.tess-out` mask (§8.6) for the same 6% and returns. This is the shipwreck; nobody sees a ship.

**Mood keyframes.**
| p | camX | camY | camZ | camTilt | fov | sunY | sunGlow | sunHeat | skyBottom | seaAmp | seaSpeed | tess | tessForm | tessSpread | p3 | mosaic | aberration | stars | bloom | warmth |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 0 | .6 | 7 | .05 | 34 | −1.9 | .55 | 1 | #3A1A14 | .14 | .35 | .2 | 0 | 1 | 0 | 0 | 0 | .35 | .7 | .55 |
| .34 | .3 | .6 | 7 | .05 | 34 | −2.0 | .4 | 1 | #2A1410 | .18 | .4 | .2 | 0 | 1 | 0 | 0 | 0 | .4 | .7 | .5 |
| .38 | .3 | .55 | 7 | .05 | 34 | −2.0 | .2 | 1 | #0E3D57 | .6 | 1.2 | 1 | 1 | 1 | 0 | **1** | .9 | .2 | .9 | .3 |
| .46 | .4 | .5 | 7 | .04 | 34 | −2.2 | 0 | 1 | #06192B | .45 | .9 | .1 | 1 | 5 | 1 | 0 | .1 | .3 | .6 | .25 |
| 1 | .6 | .5 | 7 | .04 | 34 | −2.4 | 0 | 0 | #06192B | .2 | .5 | 0 | 1 | 8 | 1 | 0 | 0 | .55 | .5 | .2 |

**Choreography 0→1.** p 0–.35: frieze walks (stop-motion `steps(4)` leg cycle keyed to p, §9.2); eyebrow, headline, then storyteller lines one per 6%. p .35–.42: the Shatter (above); storyteller *Zeus answered…* lands during the flash. p .42–.80: Forum lands over the settling water: rule → label → lines; chip row; verb row; closing serif; sign-off. p .80–.90: exit. p .92: rail glyph **S fills gold** (rail listens to `stage` progress; §7.4). Sky fully abyss.

**Transition → 03.** The sunk tiles glow faintly under the surface, then one by one rise out of the water as points of light (`stars` .55 → .8, `tessSpread` 8 → 12 and `tess` 0 — they are scattered upward). `[S]` *Ulysses alone. / No ship. / No companions. / Only a man… / between sea and sky.* (these five lines are the last four beats of this chapter, p .80–.90, in `--fg-faint`, then exit). Camera begins to tilt up.

**Mobile.** Frieze at 4% frame height (still legible); the Shatter keeps the post-process pass (whole frame tiles) but the falling field is 1,500 tiles. Film 2.5 vh.

**Data.** `theme.pillars[0].*`.

---

### 6.3 · `stars` — A SKY FULL OF STARS · Canto II · Why now · 21:10
**Purpose.** The "Why now?" slide staged as a sailor losing sight of land: the eleven forces reshaping tourism are the stars he must read; one grows brighter — the Forum. Eleven forces = eleven stars = the eleventh edition, never explained.

**Eyebrow.** `03 — WHY NOW — TOURISM IS BEING RESHAPED BY FORCES FAR BEYOND TOURISM` (`whyNow.heading`, `whyNow.lead`).

**Headline.** *Where do I go from here?*

**Storyteller.** *For thousands of years,* / *sailors of this sea looked to the stars.* / *For direction.* / *For destiny.* / *Perhaps for the gods.* / *When they lost sight of earth…* / *they read the heavens.* — later: *One star grows brighter.* / *Was it Athena?* / *Destiny?* / *Hope?* / *He did not know.* / *He knew only that above him stretched…* / **A SKY FULL OF STARS.**

**Forum.** The eleven forces as mono labels on eleven stars (`whyNow.forces[0..10]`): `AI & AUTOMATION` · `CLIMATE CHANGE` · `SEA-LEVEL RISE` · `OVERTOURISM` · `GEOPOLITICAL TENSIONS & CONFLICT` · `SECURITY & MIGRATION PRESSURES` · `TALENT SHORTAGES` · `HOUSING & REAL-ESTATE PRESSURES` · `CONNECTIVITY` · `CHANGING VISITOR EXPECTATIONS` · `SUSTAINABILITY & INVESTMENT`. `[F]` (`whyNow.statement`): *Events in one part of the Mediterranean can rapidly affect connectivity, visitor confidence, investment, supply chains and destination perception across the region.* The two questions (`whyNow.questions`): `The question is no longer:` **HOW MANY TOURISTS CAN WE ATTRACT?** (Instrument Sans 500 `--fs-small`, struck through by a drawing hairline) / `It is:` **WHAT KIND OF TOURISM CREATES THE GREATEST VALUE AND RESILIENCE FOR PEOPLE, PLACES AND BUSINESSES?** (Fraunces 300 `--fs-h2`, cream).

**CTA.** Mono hint bottom-right of the frame: `NINE NIGHTS ↓` (bible).

**Visual / 3D.** Camera tilts up 25°; the sky opens (fov 34 → 42); the stars layer at full (`stars 1`, `constellation 1`). The eleven forces are **DOM labels** positioned on eleven fixed screen anchors (a `.pin__layer.fx` SVG, §9.4 `constellation()`), with hairlines drawing between them — the constellation they form is **the logo's Mediterranean outline in stars**. The horizon is at the bottom 8% of the frame. At p .6 the star at Malta's position (anchor 8 of 11 — the centre-bottom of the outline) swells gold: the world's sun billboard goes to star mode (`sunHeat 0`, `sunRadius .18`, `sunGlow 1.4`) at the *same screen position* (the chapter computes the anchor's NDC and sets `sunX/sunY` accordingly for camZ 7 — the DOM star fades as the GL star takes over). The other DOM stars dim to 40%.

**Mood keyframes.**
| p | camY | camZ | camTilt | fov | sunX,Y,Z | sunRadius | sunGlow | sunHeat | sunVisible | skyTop | skyBottom | haze | stars | starDrift | constellation | tess | tessSpread | bloom | warmth |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | .5 | 7 | .04 | 34 | 0, −2.4, −6 | 1 | 0 | 0 | 0 | #06192B | #06192B | .15 | .8 | .2 | 0 | 0 | 12 | .5 | .2 |
| .25 | .9 | 7 | .42 | 40 | 0, 2, −8 | .1 | 0 | 0 | 0 | #090D16 | #06192B | .1 | 1 | .15 | 0 | 0 | 12 | .5 | .15 |
| .6 | 1.1 | 7 | .44 | 42 | anchor | .18 | 1.4 | 0 | 1 | #090D16 | #06192B | .1 | 1 | .1 | 1 | 0 | 12 | .7 | .15 |
| 1 | 1.1 | 7 | .30 | 40 | anchor→(1.2, .9, −8) | .2 | 1.6 | 0 | 1 | #090D16 | #06192B | .1 | .7 | .1 | 1 | 0 | 12 | .7 | .15 |

**Choreography.** p 0–.25: tilt up; the risen tiles are now stars (stars layer fades in as `tess` cloud fades); storyteller first stack. p .25–.60: eleven stars brighten one by one (each label follows its rule, never precedes it), 3% apart; constellation hairlines draw between them (`constellation` 0→1 drives the GL lines; the DOM lines draw with `stroke-dashoffset`); the old question strikes through; the new question settles. p .60–.85: *One star grows brighter…*; the Malta star swells (GL star takes over). p .85–.95: the star begins to descend (`sunY` down); the rail's ticks 02–10 pulse in sequence (nine ticks = nine nights); `NINE NIGHTS ↓`. p .90: exit.

**Transition → 04.** Pure light: the star descends through the frame while the camera pans right (`camX` → 1.2); a horizon rule draws (`ruleH`) and a black shape rises on it. `[S]` *On the tenth dawn… / the star touched the earth.* (last two beats, p .86–.90).

**Mobile.** Eleven labels at `--fs-index`, the outline scaled to the narrow frame (labels may overlap the outline's interior — allowed); tilt reduced to .34. Film 2.5 vh.

**Data.** `whyNow.*`.

---

### 6.4 · `ogygia` — THE TENTH DAWN · Canto III · Ogygia · Malta · Who is MTF · 23:00
**Purpose.** The "where" and the "who": Gozo/Malta as Ogygia, MTF as host, the Forum's scale. **The island — mosaic moment:** the Mediterranean rises out of the sea as a Roman mosaic floor.

**Eyebrow.** `04 — OGYGIA · GOZO · MALTA — THE HEART OF THE MEDITERRANEAN`; under it the instrument line in `--fs-index`: `36.0451° N · 14.2470° E · RAMLA` (bible; real Ramla coordinates).

**Headline.** *A diamond set in blue.*

**Storyteller** (`gala.gozoLines` + script): *A nymph.* / *Calypso.* / *And her island was called…* / *Ogygia.* / *An ancient name.* / *Primeval.* / *Through the centuries, Ogygia became rooted in the identity of an island at the heart of this sea:* / **Gozo.** / *Red earth at Ramla.* / *Honey-coloured limestone.* / *Caves watching the horizon.* / *The heart of the Mediterranean.* / *Its eye upon the sea.* / *Its soul carved in stone.*

**Forum — second movement, the host.** Mono `WHO IS MTF?` (`foundation.whoIsMtf.heading`). `[F]` *Mediterranean Tourism Foundation.* (`foundation.name.value`) / `whoIsMtf.lines[0]`: *MTF brings together the public sector, private sector, academia and the next generation around one purpose:* / serif `--fs-h2` (`lines[1]`): **Advancing peace, prosperity and a better quality of life through tourism.** / `lines[2]`: *Tourism is more than an industry. It shapes our economies, communities, cities, environment, employment, culture and quality of life.* Mono (`foundation.tagline.value`): `THINK TOGETHER · LEARN TOGETHER · ACT TOGETHER`. **Stat trio** (`stats[0..2]`, `.stat` component, counts up once): **1,600+** PARTICIPANTS · **60 / 40** MALTA / INTERNATIONAL · **31+** COUNTRIES — ACROSS ALL CONTINENTS. `[F]` (`audiences.closing`): *Different sectors. Different generations. Different countries.* / serif **ONE MEDITERRANEAN CONVERSATION.** Date chip, large (`event.dates.display`, `event.venue.display`): `25–27 NOVEMBER 2026 · MALTA · VENUE TO BE ANNOUNCED`.

**CTA.** Mono link `BOOK A HOTEL IN MALTA ↗` → `#ch-register` (the STAY block).

**Visual / 3D.** Camera pans 38° right and dollies in over the water toward the island. Shadow layer: **Gozo** as one flat ink silhouette on the horizon (§9.5 `island()`), flat-topped mesas, the Ramla notch, a cave arch as a hole; the star lands *in the cave* — the world's star billboard (`sunHeat 0`, small) positioned at the cave hole: one warm gold point shining out of it ("Its eye upon the sea"). A thin gold path on the sea from the cave to the camera. **Then the island rises (p .50–.72):** the tessera field morphs to **formation 1 — the Mediterranean outline** (§8.5), lying flat on the water in the middle distance like a Roman pavement, `tess` 0 → 1 with tiles surfacing from below the sea plane (`tessSpread` 3 → 1, tiles start under water and rise), lit honey by the star; one tile at Malta's position pulses gold (`tessGlint 1`). The stat digits are DOM (`.stat`), not tiles. The tessera post is off (`mosaic 0`) — this beat is the *instanced* field, the ground of the world.

**Mood keyframes.**
| p | camX | camY | camZ | camTilt | camYaw | fov | sunX,Y,Z | sunRadius | sunGlow | sunHeat | skyTop | skyBottom | haze | seaAmp | tess | tessForm | tessSpread | tessGold | tessGlint | stars | warmth | bloom |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 1.2 | 1.1 | 7 | .30 | 0 | 40 | 1.2, .9, −8 | .2 | 1.6 | 0 | #090D16 | #06192B | .1 | .12 | 0 | 1 | 3 | .7 | .5 | .7 | .15 | .7 |
| .3 | 1.6 | .8 | 5 | .08 | −.22 | 36 | cave (≈ 2.6, −.55, −9) | .12 | 1.2 | .15 | #090D16 | #0E3D57 | .2 | .1 | 0 | 1 | 3 | .7 | .5 | .5 | .2 | .6 |
| .72 | 2 | 1.4 | 2 | −.12 | −.32 | 34 | cave | .12 | 1.0 | .2 | #090D16 | #0E3D57 | .2 | .1 | 1 | 1 | 1 | .55 | 1 | .4 | .35 | .6 |
| 1 | 2 | 1.4 | 2 | −.08 | −.32 | 34 | cave | .1 | .6 | .2 | #090D16 | #0E3D57 | .2 | .1 | 1 | 1 | 1 | .55 | .7 | .4 | .3 | .5 |

**Choreography.** p 0–.30: the silhouette rises out of the water (`translateY` on the SVG, `--ease-tide`) as the star drops into it; ripple rings on the sea at the touch point (SVG ellipses, §9.5); eyebrow + coordinates draw; headline. p .30–.50: storyteller stack (14 lines → shown as three stacks of ≤ 5, each replacing the last). p .50–.72: **the island rises** (mood) — the camera looks down 7° at the mosaic surfacing; `WHO IS MTF?` label follows its rule as the last tiles lock. p .55–.88: Forum second movement: lines, tagline, the stat trio (count-up on enter), the closing serif, the date chip; `BOOK A HOTEL` link. p .90: exit. p .88–1: **the veil enters** (`veil` 0 → .5 by p 1 — the cloth is half across at the seam; Ch 05 finishes the crossing).

**Transition → 05 — THE VEIL (first appearance).** The cloth (§7.6) crosses right→left carrying `[S]` *Kalyptein. / To cover. To conceal. To draw a veil.* (rendered inside `#veil` by the veil component from `--veil-now`; the Storyteller line's SOFT axis rises 12 → 60 and back). The island dims behind it (`tessGlint` .7 → .3, handed to Ch 05).

**Mobile.** The island silhouette at 40% width; the mosaic outline scaled to 1,500 tiles; stats stack. Film 3 vh.

**Data.** `gala.gozoLines`, `foundation.*`, `stats[0..2]`, `audiences.closing`, `event.dates`, `event.venue`, `hotels`.

---

### 6.5 · `unity` — THE HAND THAT LIFTS · Canto IV · Unity · 00:15
**Purpose.** Unity as the hand that helped a stranger stand; then the concrete version: Air · Sea · Digital · People. (The hand itself is *not* shown here — it is reserved for Ch 11.)

**Eyebrow.** `05 — U · UNITY — WHAT CAN WE ACHIEVE TOGETHER?` (`theme.pillars[1]`).

**Headline.** *Achieve together what we cannot achieve alone.* (`pillars[1].lines[1]`, sentence case).

**Storyteller.** *When she asked the stranger his name…* / *he answered:* / *Nobody.* / *Before Calypso loved Ulysses…* / *she saved him.* / *Made him stand.* / *Made him walk.* / *A stranger.* / *A friend.* / *A hand when we needed one.* / *And only later do we understand:* / **I was different because you were there.**

**Forum.** `[F]` (`pillars[1].lead`): *The Mediterranean becomes stronger when it is better connected.* Four strengthen-rows (`pillars[1].strengthen[i].key`, `.text`), each a mono key + sans text with its own rule: **AIR** — destinations and markets · **SEA** — islands, ports and communities · **DIGITAL** — knowledge, business and opportunity · **PEOPLE** — Mediterranean talent and careers. `[F]` *Collaborate across borders on:* chip row (`collaborateOn`): `KNOWLEDGE · SKILLS · RECRUITMENT · ETHICAL MOBILITY · TRAINING · REGIONAL CONNECTIVITY · SHARED CHALLENGES`. Mono (`lines[0]`): `CONNECT PEOPLE · CONNECT DESTINATIONS · CONNECT OPPORTUNITY`. Serif sign-off `--fs-h2` (`closingLine` sentence case): **Connect the Mediterranean.**

**CTA.** Mono link `B2B BUSINESS MEETINGS ↓` → `#ch-remains`.

**Visual / 3D.** The mosaic Mediterranean (formation 1) stays on the water in the middle distance, dimmer. Over it, **portolan lines** — gold hairlines drawing across the sea from port to port, rhumb lines meeting at Malta: an SVG `.pin__layer.fx` (§9.6 `routes()`) registered to the island's screen position (`world.sunNdc` is not the island; the chapter projects the island's world centre `(0.8, −1.15, −9)` with `world.camera` each frame in `onFrame` and positions the SVG). Each strengthen-row's rule draws a corresponding line family on the water: AIR = arcs lifted above the plane, SEA = coast-hugging lines, DIGITAL = dotted, PEOPLE = pulsing points at 31 ports (Malta brightest). The *luzzu* eye once, at the bow of one sea-line. Camera holds; look drifts left.

**Mood keyframes.**
| p | camX | camY | camZ | camTilt | camYaw | fov | sunGlow | skyBottom | tess | tessForm | tessGlint | tessGold | veil | stars | warmth |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 2 | 1.4 | 2 | −.08 | −.32 | 34 | .6 | #0E3D57 | 1 | 1 | .3 | .55 | .5 | .4 | .3 |
| .15 | 2 | 1.4 | 2 | −.08 | −.2 | 34 | .5 | #0E3D57 | 1 | 1 | .3 | .55 | 1 (cloth gone left) | .4 | .3 |
| .85 | 2 | 1.4 | 2 | −.06 | .1 | 34 | .5 | #0E3D57 | 1 | 1 | .6 | .6 | 1 | .4 | .35 |
| 1 | 2 | 1.4 | 2 | −.06 | .1 | 34 | .6 | #124A66 | 1 | 1 | .7 | .6 | 1 | .3 | .45 |

**Choreography.** p 0–.15: the veil finishes crossing (`veil` .5 → 1); storyteller starts under it. p .15–.35: storyteller stack to *Nobody.* p .35–.75: the four rows (rule → key → text → line-on-water, 60 ms stagger, each 8% of p); chip row. p .75–.88: `CONNECT PEOPLE…` then the serif sign-off; *I was different because you were there.* p .90: exit. p .95: rail glyph **U fills gold**.

**Transition → 06.** The lines on the water thicken and warm; the sky begins, impossibly, to lighten (`skyBottom` → #124A66, `warmth` .45). `[S]` *And then… / they were happy.* (last beat). The clock label fades and is replaced by `— · STAY TODAY`.

**Mobile.** Rows full-width; the route SVG sits in the lower 45% under the type. Film 2 vh.

**Data.** `theme.pillars[1].*`.

---

### 6.6 · `paradise` — PARADISE · Canto V · Three Days · the clock stops
**Purpose.** The programme at a glance — three days, one ecosystem — staged as three sunrises in the film's **single daylight chapter**. "Stay today. Again. And again." is the structure of a three-day forum.

**Eyebrow.** `06 — THREE DAYS · ONE ECOSYSTEM — 25 · 26 · 27 NOVEMBER 2026` (`programme.heading`).

**Headline (`--fs-display`, ink).** *Stay today.*

**Storyteller (ink-soft italic).** *And then… they were happy.* / *Do not rush past that.* / *Morning over Ramla.* / *Red earth.* / *Thyme upon the wind.* / *Olive leaves turning silver.* / *Salt.* / *Wine.* / *Music.* / *The Mediterranean.* — between columns: *Stay today.* / *Tomorrow came.* / *Stay today.* / *Again.* / *And again.* — closing: *Calypso was happy.* / *The island that had always been paradise…* / *was no longer lonely.*

**Forum — three day-columns** (`programme.days[i]`), each an opus-sectile panel (`--sand` face, `--rule-paper` frame, 1 px grout between columns), mono head `DAY 01 — 25 NOVEMBER` (`label`, `display`), items as a sans list (`items[].title`) with `tnum` indices, mono summary line (`keywordsLine`) under the rule:
- **DAY 01 — 25 NOVEMBER**: Knowledge & Policy Forum · Forbes Travel Guide Plus Training · B2B Business Meetings · Networking Events · Mediterranean Tourism Awards. `KNOWLEDGE • BUSINESS • CONNECTION • RECOGNITION`
- **DAY 02 — 26 NOVEMBER**: Mediterranean Knowledge & Policy Forum · Hospitality Skills Competitions · Hospitality Careers Programme · 11 FOR 11 — MTF Brain Think Tanks · B2B Business Meetings · Networking Events · Forbes Travel Guide Plus Sessions · Calypso's Odyssey Gala. `PEOPLE • SKILLS • IDEAS • BUSINESS • EXPERIENCE`
- **DAY 03 — 27 NOVEMBER**: International Morning Plenary · *Followed by four specialist events:* (`followedBy`) Beautiful Destinations — Architecture, Design & the Economics of Place · MED READY — Safe & Resilient Tourism Destinations · AI-Powered Hospitality — Re-Engineering the Tourism Economy · The Coffee Experience — Powered by Lavazza (indented sub-list, with a mono link `→ THE FOUR` to `#ch-rudder`). `MEDITERRANEAN SUN`
Above each column a **mini Disc** (§9.9 `disc()`, 64 px SVG, gold tiles on 5 rings) that *flips its tiles to spell the day number* `25` / `26` / `27` as its column arrives (B's "the Disc writes", as a moment) and then flips back to gold. Note (sans `--fs-fine`, `--fg-faint`): *Times and venues to be announced.* (TBC honesty line).

**CTA.** Pill `FULL PROGRAMME →` (satellite `/programme`, TBC — until it exists, links to `#ch-eleven`) beside the persistent `REGISTER →` (which on paper turns `--ink` face / `--paper` text via `.theme-paper`).

**Visual / 3D.** Everything inverts: the chapter adds `theme-paper` to `<html>` while active (`onEnter`/`onLeave`) — the *only* chapter that does. The sky goes to paper-cream with the faintest `--sky` at the zenith, the sea to a flat, glittering `--stone` gold; the island silhouette becomes `--sand` on cream (the island SVG reads `currentColor`); the mosaic Mediterranean stays as pale stone tiles (`tessGold .2`, warmth 1). The sun billboard crosses the sky **three times** — sunrise → noon → sunset per day — driven by mood (`sunX` −4 → 4, `sunY` arc −.6 → 3.4 → −.6, once per 20% of p from .2 to .8). Grain drops to .03. The chapter declares `veil: 1` throughout (the cloth is parked off-left).

**Mood keyframes.**
| p | camY | camZ | camTilt | fov | sun (X,Y) | sunRadius | sunGlow | sunHeat | skyTop | skyBottom | haze | seaColor | seaAmp | tess | tessForm | tessGold | tessGlint | stars | grain | warmth | bloom |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 1.4 | 2 | −.06 | 34 | (−4, −.6) | .5 | .6 | 1 | #124A66 | #2B8FA3 | .3 | #0E3D57 | .12 | 1 | 1 | .6 | .7 | .3 | .06 | .45 | .5 |
| .2 | 1.8 | 2 | −.04 | 34 | (−4, −.6) | .5 | 1 | 1 | #A9CBDD | #F3EEE3 | .4 | #D6C39C | .08 | 1 | 1 | .2 | .4 | 0 | .03 | 1 | .4 |
| .2→.8 | 2.4 | 2 | −.04 | 34 | 3 arcs (see above) | .5 | 1 | 1 | #A9CBDD | #F3EEE3 | .4 | #D6C39C | .08 | 1 | 1 | .2 | .4 | 0 | .03 | 1 | .4 |
| 1 | 2.4 | 2 | −.04 | 34 | (4, −.6) | .5 | .8 | 1 | #7FA9C2 | #E8DCC2 | .35 | #B9A77E | .1 | 1 | 1 | .3 | .4 | 0 | .04 | .85 | .45 |

**Choreography.** p 0–.2: the inversion (sky to paper over 12% of scroll, colour `linear`); headline settles; storyteller first stack. p .2–.8: three sunrises — each sunrise slides that day's column up from below (`settle`, `--dur-5`) and its mini Disc writes the day number; the day's mono summary follows its rule; storyteller *Stay today. / Tomorrow came. / Stay today. / Again. / And again.* lands between columns. p .8–.9: closing storyteller stack; `FULL PROGRAMME →`. p .9: exit; the third sunset **does not stop**.

**Transition → 07.** The sun keeps going; the sky cycles day → night → day, faster (handled by Ch 07's mood from its p 0); the clock label restarts and begins to spin. `[S]` *And time passed.* (last beat, p .88).

**Mobile.** Columns stack vertically, each arriving with its sunrise; the mini Discs sit at the column head. Film 3 vh.

**Data.** `programme.*`.

---

### 6.7 · `eleven` — SEVEN YEARS, ELEVEN EDITIONS · Canto VI · 11 for 11 · 01:00 → 04:00
**Purpose.** The eleven think tanks. The gala's chapter on time ("they stopped counting") becomes the eleventh edition's reason to act now. The stillest chapter: time moves, the camera does not.

**Eyebrow.** `07 — 11 FOR 11 · MTF BRAIN THINK TANKS · 26 NOVEMBER` (`thinkTanks.heading`, `.name`, `.date`).

**Headline.** *11th edition. 11 think tanks. One Mediterranean.* (`thinkTanks.closingLine`, sentence case; the numeral **11** is a separate `<span class="opsz">` whose `"opsz"` drifts 144 → 60 over the hold).

**Storyteller.** *At first they counted the days.* / *Then the months.* / *Then…* / *they stopped counting.* / *Life never announces:* / *Remember this moment.* / *It simply happens.* / *And only later do we understand:* / **THAT WAS OUR LIFE.**

**Forum.** `[F]` (`thinkTanks.formula`): *11 Challenges • 11 Expert Groups • 11 Actions* / (`who`): *Industry leaders, policymakers, academics, experts, entrepreneurs and young professionals work towards:* chip row (`outputs`): `RECOMMENDATIONS · PILOT PROJECTS · PARTNERSHIPS · PERMANENT MTF INITIATIVES`. Mono (`process`): `THINK → CHALLENGE → DESIGN → ACT`. **The eleven tiles** (`thinkTanks.items[0..10]`, `.tile` component §7.12) in a brickwork grid across the lower 60% (6 + 5, odd row offset ½ cell), group headers as four hairline sectors above (`thinkTanks.groups[i].name`): PEOPLE & INNOVATION (01–03) · REGIONAL ACTION (04–06) · RESPONSIBILITY & VALUE (07–09) · CULTURE & SERVICE (10–11). Each tile: numeral (Fraunces 300), title (Fraunces 400 `--fs-h3`), subtitle (sans `--fs-small`), group chip. Hover/focus lifts the tile ≤ 6° and slides its card in from the right with `description`, `keywords` chips and `closingLine` (e.g. `AI IN THE BACK OFFICE. HUMANS AT THE FRONT.` · `ATTRACT THE YACHT. SERVE THE YACHT. RETAIN THE VALUE.` · `PRODUCT → STORY → EXPERIENCE → VALUE`; for 04 use `closingLineFromSpecialistEvent`). Keyboard: tiles are `<button aria-expanded>`; arrow keys move focus; Esc closes the card. Tap on mobile expands in place.

**CTA.** Mono `JOIN A THINK TANK →` → `mailto:forum@medtourismfoundation.com?subject=11%20for%2011%20—%20MTF11` (route TBC; deck slide 26 mentions the 26th BRAIN session in the Associate package).

**Visual / 3D.** The horizon held absolutely still while the sky **time-lapses** (day/night cycle every ~6% of p, decelerating: 6 cycles over p 0–.7, then settling on deep night), the island silhouette flickering between paper and ink with it, the sea's glitter swinging with the sun (`sunX` sweeps −5 → 5 per cycle, `sunY` arcs). The mosaic Mediterranean remains on the water, its grout darkening slightly toward the end ("the world ages around them"). Corner instrument in the frame: an On Kawara date stamp ticking backwards through editions in mono — `EDITION XI · X · IX … I` (edition years are TBC — never print years). The clock spins (`steps()`), decelerating toward 04:00. Camera locked.

**Mood keyframes** (cycle = f(p) computed in code): `camX 2, camY 2.0, camZ 2, camTilt −.06, fov 34` fixed. `theme-paper` is **off** (the chapter removes it at p 0 — the flicker is in the world only). Per cycle c(p) = decelerating phase in [0, 2π]: `sunX = 5·cos(c)`, `sunY = −.6 + 3.6·max(0, sin(c))`, `sunVisible = sin(c) > 0 ? 1 : 0`, `warmth = .35 + .65·max(0, sin(c))`, `skyBottom = mix(#06192B, #E8DCC2, max(0, sin(c)))`, `skyTop = mix(#090D16, #A9CBDD, max(0, sin(c)))`, `stars = 1 − max(0, sin(c))`, `seaColor = mix(#0E3D57, #D6C39C, max(0, sin(c)))`, `grain .05`, `tess 1`, `tessForm 1`, `tessGold` .4 → .3, `tessGlint` .5 → .2. p .7–1: settle on night (c → 3π/2 held), `veil` 1 → 1.6 from p .86 (the second crossing begins; hold 1 before that).

**Choreography.** p 0–.25: eyebrow, headline (with the opsz drift starting), storyteller first stack; the sky accelerates. p .25–.70: tiles assemble one at a time (`settle` + 14 px rise, 60 ms stagger — the only "mosaic assembling" the Forum gets, and it is DOM); process row; formula; chips. p .70–.85: the sky cycle slows and settles on deep night; *THAT WAS OUR LIFE.*; tile grain darkens. p .85–.90: `JOIN A THINK TANK →`; exit. p .86–1: the veil crosses again, faster, carrying nothing.

**Transition → 08.** Behind the veil the sky goes to full abyss and the stars come back. `[S]` *Then one night… / the heavens reminded him.* (last beats).

**Mobile.** Two-column brickwork (6 rows); the card expands in place under the tile; the date stamp hidden. Film 3 vh.

**Data.** `thinkTanks.*`.

---

### 6.8 · `rudder` — THE HAND UPON THE RUDDER · Canto VII · The Four · 04:10
**Purpose.** The four specialist events of 27 November as four points of the compass. The myth beat is navigation and identity: the stars point beyond; the man remembers his name; the hand on the rudder is ours. **The camera is the compass** — it yaws a full 360° on the spot and each cardinal bearing holds one event.

**Eyebrow.** `08 — 27 NOVEMBER · INTERNATIONAL MORNING PLENARY · FOUR SPECIALIST EVENTS` (`programme.days[2]`, `plenary.title`).

**Headline (two lines).** *The wind may belong to destiny.* / *The hand upon the rudder remains ours.*

**Storyteller.** *Orion.* / *The Bear.* / *East.* / *West.* / *The same stars that guided him toward Ogygia…* / *now pointed beyond it.* / *Navigation awakened memory.* / *Memory awakened identity.* / *And the man who arrived calling himself Nobody remembered:* / **I AM ULYSSES.** (this last line at `--fs-h1`, Fraunces roman 300 — the one uppercase line in the Storyteller voice, because the script sets it in capitals).

**Forum — four bearings, each a panel** (`specialistEvents[0..3]`), panel = hairline-framed card `right: 7%`, width `min(42%, 36rem)`, mono head `N · BEAUTIFUL DESTINATIONS` etc., title Fraunces 400 `--fs-h3`, subtitle sans, body from the deck, mono chain, mono link `EXPLORE →` (satellite pages TBC; until they exist, `EXPLORE →` opens the panel's full body in place):
- **N · BEAUTIFUL DESTINATIONS** — *Architecture, Design & the Economics of Place*. `[F]` **BEAUTY CREATES VALUE.** / *How can we create destinations that are:* chips `BEAUTIFUL · GREEN · ACCESSIBLE · LIVEABLE · INVESTABLE` / mantras (`mantras[]`, sans 500): *Green can be beautiful. Accessible can be beautiful. Functional can be beautiful.* / mono `BEAUTY → QUALITY → INVESTMENT → VALUE` / closing (`closingLine`). Glyph §9.10-a.
- **E · MED READY** — *Safe & Resilient Tourism Destinations*. `[F]` **HOW MED READY IS YOUR DESTINATION?** / the acronym ladder (`acronym[]`, mono, one letter per line, drawing in): `M Mediterranean · E Emergency · D Destination · R Resilience · E Early Warning · A Action · D Disruption Readiness · Y Year-Round` / `FROM CRISIS REACTION → TO DESTINATION READINESS.` / Centre of Excellence: `centreOfExcellence.lead` + `brings[]` chips + mission `SHARE → PREPARE → STANDARDISE → CERTIFY → IMPROVE` / certification: *Developing* **MED READY CERTIFIED DESTINATION** *and* **MED READY CERTIFIED PROPERTY** / `ANTICIPATE → PREPARE → PROTECT → RESPOND → ADAPT → RECOVER`. Glyph §9.10-b. For this bearing the tick ring becomes a radar sweep for one rotation.
- **S · AI-POWERED HOSPITALITY** — *Re-Engineering the Tourism Economy*. `[F]` (`lead[0,1]`): *AI should not simply automate today's hospitality business.* / **IT SHOULD HELP US REDESIGN TOMORROW'S.** / mono `SIMPLIFY · AUTOMATE · PREDICT · OPTIMISE · ELIMINATE WASTE` / the six Ps (`blueprint.sixPs[]`) as six mono chips orbiting the ring once, then docking as a list: `PEOPLE — Better jobs & talent retention` … `PROFITABILITY — Turning AI into business value` / `Including AI-powered STR management` + `str[]` chips / closing (`blueprint.closingLines`): **SMARTER BEHIND THE SCENES. MORE HUMAN IN FRONT OF THE GUEST.** Glyph §9.10-c.
- **W · THE COFFEE EXPERIENCE** — *Powered by Lavazza*. `[F]` (`lead[0,1]`): *Coffee is more than a product.* / *In Mediterranean hospitality, it is part of the welcome, culture and guest experience.* / chips (`exploring[]`): `COFFEE CULTURE · CONSUMER TRENDS · PRODUCT INNOVATION · BARISTA SKILLS · SERVICE EXCELLENCE · SUSTAINABILITY · TECHNOLOGY · F&B PROFITABILITY · GUEST EXPERIENCE` / `FROM COFFEE AS A PRODUCT → TO COFFEE AS AN EXPERIENCE`. Partner as a mono word `POWERED BY LAVAZZA` (logo rights TBC — no logo file exists; never fake one). Glyph §9.10-d.

**CTA.** Per bearing `EXPLORE →`; chapter-level mono `THE FOUR — FULL DETAILS →` (satellite TBC → `#ch-paradise` Day 03 until then).

**Visual / 3D.** Night sky, stars at full, the sea black glass, no sun (`sunVisible 0`). **The yaw:** `camYaw` 0 → 2π over p .15–.85 with a soft lock at each quarter (ease into each 90° so the yaw *rests* for ~6% of p at each bearing — `camYaw = 2π · smoothstep-stepped(p)`), the sea centred on the camera (§10.2-C). No compass object: a hairline ring at the frame's centre (§9.7 `compassRing()`, 72 ticks) counter-rotates with the yaw; mono `EAST` / `WEST` labels are pinned at their true screen bearings (the chapter computes screen x from `camYaw` each frame in `onFrame`); the needle is a 1 px vertical rule at centre that trembles with `shared.mouse.x`. At each lock the ring's ticks flash once (a "click of light"). Orion (east) and the Bear (north) are drawn by the stars layer's constellations (`constellation` 2 = Orion+Bear) with their lines *extended beyond their stars* off-frame (§8.4). The mosaic Mediterranean fades under the water (`tess` 1 → 0, `tessSpread` 1 → 2, sinking) during p 0–.15 — the island is behind us now.

**Mood keyframes.**
| p | camX | camY | camZ | camTilt | camYaw | fov | sunVisible | skyTop | skyBottom | haze | seaAmp | seaSpeed | stars | constellation | tess | tessSpread | veil | p4 (tear) | bloom | warmth |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 2 | 1.6 | 2 | .06 | 0 | 36 | 0 | #090D16 | #06192B | .1 | .08 | .3 | 1 | 2 | 1 | 1 | 1.6 | 0 | .5 | .15 |
| .15 | 2 | 1.6 | 2 | .06 | 0 | 36 | 0 | #090D16 | #06192B | .1 | .08 | .3 | 1 | 2 | 0 | 2 | 2 | 0 | .5 | .15 |
| .33 | 2 | 1.6 | 2 | .06 | π/2 | 36 | 0 | — | — | .1 | .08 | .3 | 1 | 2 | 0 | 2 | 2 | 0 | .5 | .15 |
| .50 | 2 | 1.6 | 2 | .06 | π | 36 | 0 | — | — | .1 | .08 | .3 | 1 | 2 | 0 | 2 | 2 | 0 | .5 | .15 |
| .68 | 2 | 1.6 | 2 | .06 | 3π/2 | 36 | 0 | — | — | .1 | .08 | .3 | 1 | 2 | 0 | 2 | 2 | 0 | .5 | .15 |
| .85 | 2 | 1.6 | 2 | .06 | 2π | 36 | 0 | #090D16 | #06192B | .1 | .08 | .3 | 1 | 2 | 0 | 2 | 2 | 0 | .5 | .15 |
| .92 | 2 | 1.6 | 2 | .06 | 2π | 36 | 0 | #090D16 | #06192B | .1 | .08 | .3 | .8 | 2 | 0 | 2 | 2.5 | 0 | .5 | .15 |
| .96 | 2 | 1.6 | 2 | .06 | 2π | 36 | 0 | #0F5A80 | #0F5A80 | .05 | .06 | .25 | .3 | 0 | 0 | 2 | 2.5 | **1** | .5 | .1 |
| 1 | 2 | 1.6 | 2 | .06 | 2π | 36 | 0 | #0F5A80 | #0F5A80 | .05 | .06 | .25 | 0 | 0 | 0 | 2 | 2.5 | 1 | .5 | .1 |
(A full turn equals no turn on screen but **never in the lerp**: every chapter from 09 to 14 declares `camYaw: Math.PI * 2` so the blend never unwinds. Likewise every chapter from 09 to 14 declares `veil: 3` and `p4: 0` — see §7.6.)

**Choreography.** p 0–.15: the veil finishes crossing; storyteller *Orion. / The Bear. / East. / West.*; the ring draws; headline. p .15–.85: **four bearings, 90° each** — at each lock the bearing's panel slides in from the right (rule → head → body), and slides out at the next unlock; the storyteller middle stack lands across the second and third bearings. p .85–.92: *And the man who arrived calling himself Nobody remembered:* → **I AM ULYSSES.** (the type snaps `SOFT 60 → 0` in one step — no tween). p .92–.96: exit. p .92–1: **THE VEIL TEARS — Fontana's cut.** The cloth enters half-way (`veil` 2 → 2.5 over p .85–.92) and a single 2 px cream slash draws top → bottom down the centre of the viewport; the two halves of the cloth part ±140 px and curl 4° (`--tear-now` = `p4` 0 → 1, §7.6); behind it a cold blue field floods the sky from the horizon up (mood). The DOM Storyteller line under the tear gets the SOFT-axis breath.

**Transition → 09.** The camera has completed its circle facing the open sea; the sky and sea are one cold `--sky` blue.

**Mobile.** The yaw reads even better in portrait (the horizon swings across the narrow frame); panels are full-width sheets over the lower 60%; the ring at 40 vw. Film 3 vh.

**Data.** `specialistEvents[0..3].*`, `plenary.title`.

---

### 6.9 · `forever` — FOREVER · Canto VIII · Net Positive · 04:50
**Purpose.** Net Positive argued the way the gala argues against immortality: the measure of tourism is not endless arrivals; it is whether the people who host it live better. **S·U·N completes.**

**Eyebrow.** `09 — N · NET POSITIVE — WHAT SHOULD TOURISM LEAVE BEHIND?` (`theme.pillars[2]`).

**Headline.** *Leave more than we take.* (`pillars[2].closingLine`, sentence case).

**Storyteller.** *She offered Ulysses immortality.* / *No ageing.* / *No sickness.* / *No grave.* / *Forever young.* / *Forever together.* / *But Ulysses understood what eternity had hidden from Calypso:* / **Life matters because it ends.** / *If tomorrow were infinite…* / *why would today be sacred?*

**Forum.** `[F]` (`pillars[2].lines[0]`): *Tourism's success should not be measured only by arrivals, nights and expenditure.* / (`lines[1]`) *The ultimate measure:* / serif `--fs-h2` (`lines[2]`): **DOES TOURISM IMPROVE THE STANDARD OF LIVING OF THE COMMUNITIES THAT HOST IT?** / (`lines[3]`) *Net Positive means:* chip row (`means[]`): `BETTER JOBS · BETTER CAREERS · BETTER PUBLIC SPACES · BETTER SERVICES · STRONGER LOCAL BUSINESSES · HEALTHIER ENVIRONMENTS · BETTER EXPERIENCES · GREATER OPPORTUNITY`. Two sub-blocks (`subSections[]`): **SERVICE EXCELLENCE** — *Extend hospitality beyond hotels and restaurants to the whole destination.* / `FROM A HOSPITALITY INDUSTRY → TO A HOSPITALITY CULTURE.`; **AI AS AN ENABLER** — `BETTER TOURISM • BETTER BUSINESSES • BETTER EXPERIENCES • BETTER LIVES` / *Create more value with fewer resources — and share that value with the community.* (deck typo corrected in content.json).

**CTA.** None.

**Visual / 3D.** A cold, even `--sky` field: sky and sea the same blue — Rothko's two bands meeting at the horizon, no sun, no stars, no grain (`grain .02`). Across the full width, a **counter of arrivals rolling upward forever** (`.pin__layer.fx`, §9.8 `counter()`): nine mono digits at `--fs-h1` scale, `tnum`, `--fg-faint` on blue, climbing at a rate tied to `shared.velocity` (it only moves while you move — Opałka). On *Life matters because it ends.* the counter **freezes** on whatever number it reached, then dissolves tile-wise with the `.tess-out` mask (600 ms) — the only DOM tesserae dissolve in the film. Then the blue warms to gold in three sliding Rothko bands (mood `skyTop/skyBottom/seaColor`, `linear`). Camera: a slow push-in.

**Mood keyframes.**
| p | camX | camY | camZ | camTilt | camYaw | fov | sunVisible | skyTop | skyBottom | seaColor | haze | seaAmp | stars | grain | vignette | tess | bloom | warmth |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 2 | 1.6 | 2 | .04 | 2π | 34 | 0 | #0F5A80 | #0F5A80 | #0F5A80 | .05 | .06 | 0 | .02 | .2 | 0 | .4 | .1 |
| .5 | 2 | 1.6 | −1 | .04 | 2π | 34 | 0 | #0F5A80 | #0F5A80 | #0F5A80 | .05 | .06 | 0 | .02 | .2 | 0 | .4 | .1 |
| .85 | 2 | 1.6 | −4 | .04 | 2π | 34 | 0 | #6E4A1E | #D9A441 | #A67C2E | .15 | .08 | 0 | .05 | .3 | 0 | .6 | .9 |
| 1 | 2 | 1.6 | −4 | .04 | 2π | 34 | 0 | #3A2A14 | #A67C2E | #6E4A1E | .15 | .08 | .1 | .06 | .35 | 0 | .5 | .7 |

(Constants for the whole chapter: `veil 3` — the torn halves slide off during p 0–.1 — `p4` 1 → 0 over p .1–.2, `sunVisible 0`.)

**Choreography.** p 0–.4: eyebrow, headline; the counter climbs; storyteller stack. p .4–.5: **Life matters because it ends.** — the counter freezes, then dissolves. p .5–.85: the field warms (mood); the Forum lands (rule → label → lines; the big question in serif; chips; the two sub-blocks). p .85–.90: rail glyph **N fills gold — S·U·N reads whole for the first time**; the three glyphs `shine` together for one beat (rail component listens for `stage` progress). p .90: exit.

**Transition → 10.** The gold field holds. In the top-left of the frame a single **olive branch** silhouette enters (§9.11) and `[S]` *A leaf falls.* — one leaf detaches and drifts down through the whole transition (the branch and the falling leaf are Ch 10's SVG, positioned so that at Ch 10 p 0 the leaf is at the top; Ch 09 shows only the storyteller line at p .88).

**Mobile.** Counter at `--fs-h2`; chips wrap. Film 2 vh.

**Data.** `theme.pillars[2].*`.

---

### 6.10 · `remains` — WHAT REMAINS · Canto IX · People · 05:20
**Purpose.** The people programme: skills competitions, careers, B2B, the Knowledge & Policy Forum — the Poet's answer to immortality: what remains because we lived.

**Eyebrow.** `10 — PEOPLE · SKILLS · IDEAS · BUSINESS — 25–27 NOVEMBER` (`skillsCareersBusiness.heading`).

**Headline.** *Perhaps immortality is what remains because we lived.* (`gala.keyLines`, compressed as in the spine).

**Storyteller.** *Perhaps immortality was never about refusing to die.* / *A child.* / *A kindness.* / *A courage.* / *A love.* / *A story.* / *Did we help someone stand?*

**Forum — four hairline-framed columns** in the lower half (desktop 4-up; each: mono head, rule, sans list, chips, mono chain, mono link):
- **HOSPITALITY SKILLS COMPETITIONS — 26 NOVEMBER** (`skillsCareersBusiness.competitions`): `CELEBRATING EXCELLENCE IN:` chips `FRONT OFFICE · HOUSEKEEPING · RESTAURANT SERVICE · CHEFS · FOOD & BEVERAGE`. Link `ENTER THE COMPETITIONS →` (TBC → `mailto:forum@medtourismfoundation.com?subject=Hospitality%20Skills%20Competitions%20—%20MTF11`).
- **HOSPITALITY CAREERS PROGRAMME — 26 NOVEMBER** (`.careers`): *Introducing young people to opportunities across:* chips `HOSPITALITY · TECHNOLOGY · AI · FINANCE · CULINARY · SUSTAINABILITY · DESIGN · MARKETING · EVENTS · ENTREPRENEURSHIP`. Link `CAREERS PROGRAMME →` (TBC mailto).
- **B2B BUSINESS MEETINGS & NETWORKING — 25–26 NOVEMBER** (`.b2b`): *Connecting:* chips `HOTELS · TOURISM OPERATORS · BUYERS · SUPPLIERS · TECHNOLOGY COMPANIES · INVESTORS · DESTINATIONS · SERVICE PROVIDERS`; mono `CONTACTS → RELATIONSHIPS → OPPORTUNITIES → PARTNERSHIPS → BUSINESS`. Link `REQUEST B2B MEETINGS →` (TBC mailto).
- **MEDITERRANEAN KNOWLEDGE & POLICY FORUM — 25–26 NOVEMBER** (`knowledgeForum`; days TBC per `days.note` — print `25–26 NOVEMBER` and the honesty note `Days to be confirmed.`): *Knowledge should not remain inside universities.* / *Bringing together:* chips `ACADEMICS · POLICYMAKERS · INDUSTRY · RESEARCHERS · STUDENTS`; mono `RESEARCH → POLICY → BUSINESS → IMPLEMENTATION`; themes chips (`themes[]`); closing **TURN KNOWLEDGE INTO POLICY — AND POLICY INTO ACTION.** Link `SUBMIT RESEARCH →` → `knowledgeForum.precedent2025.url` (mediterraneantourismresearch.com, carried from 2025, opens new tab).

**CTA.** The four column links.

**Visual / 3D.** Sea-navy sky with the first pre-dawn grey at the horizon; sea calm. Shadow layer: **the olive branch** across the top-left third (§9.11 `olive()`), flat ink, its leaves two-tone (olive / olive-silver quads that flip with `shared.mouse` — "olive leaves turning silver"; on touch they flip with scroll velocity); the fallen leaf lies on the water. Falling leaves become the mono arrows: a leaf's fall path ends where each `→` row begins (a small deliberate rhyme). Camera rises slowly.

**Mood keyframes** (constants: `camYaw 2π`, `veil 3`, `p4 0`, `tess 0`, `tessForm 1`).
| p | camX | camY | camZ | camTilt | fov | sunVisible | skyTop | skyBottom | seaColor | haze | seaAmp | stars | grain | warmth | bloom |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 2 | 1.6 | −4 | .04 | 34 | 0 | #3A2A14 | #A67C2E | #6E4A1E | .15 | .08 | .1 | .06 | .7 | .5 |
| .3 | 1.6 | 1.9 | −6 | .03 | 34 | 0 | #090D16 | #0E3D57 | #0E3D57 | .2 | .1 | .3 | .06 | .3 | .5 |
| 1 | 1 | 2.4 | −8 | .02 | 34 | 0 | #090D16 | #123044 | #0B2A3D | .2 | .08 | .2 | .06 | .25 | .5 |

**Choreography.** p 0–.3: the field cools from gold to navy (`linear`); the leaf falls (SVG motion path); eyebrow, headline, storyteller under the branch. p .3–.8: the four columns draw (frame rules from the corner marks outward, then labels, then lists; 8% of p each); the leaves' fall-paths land on the arrows. p .8–.9: night deepens one last time; the branch's silver goes to thread (leaf colour → `--cream`, leaf shapes thin to lines). p .9: exit.

**Transition → 11.** The silver threads pull taut across the lens: a line, a knot, another line — the net is being woven in the frame (Ch 11's SVG net draws its first three lines during Ch 10 p .88–1 via a shared CSS var? **No** — chapters never share; Ch 10 simply ends with three cream diagonal hairlines drawn in its own `.fx` layer at the same angles/spacing as Ch 11's net (±45°, 44 px), so the seam matches by geometry). `[S]` *Then came the net.* (last beat).

**Mobile.** Columns stack (4 rows); branch at the top 25%. Film 2.5 vh.

**Data.** `skillsCareersBusiness.*`, `knowledgeForum.*`.

---

### 6.11 · `hand` — THE OPEN HAND · Canto X · The Gala · Awards · 05:55
**Purpose.** Calypso's Odyssey — the gala — and the Mediterranean Tourism Awards. The film's title line and thesis: love is the hand that opens. **The Open Hand — the only full mosaic figure in the site.**

**Eyebrow.** `11 — 26 NOVEMBER · CALYPSO'S ODYSSEY · THE GALA` (`gala.date`, `gala.titleCaps`).

**Headline (custom lettering, §9.12).** **CALYPSO'S ODYSSEY** / *The Greatest Journeys Are Not Always Across the Sea* (`gala.title`, `gala.subtitle`). The `<h2>` holds the real text (visually hidden while the SVG lettering draws; visible in reduced motion).

**Storyteller.** *For seven years Calypso had tried to keep what she loved.* / *Make paradise beautiful enough.* / *Stop time.* / *Offer forever.* / *Hold tighter.* / *But holding tighter does not stop departure.* / *Sometimes… it turns love into a chain.* / (the cut) *Calypso cuts the net.* / **Love is not the hand that closes.** / **Love is the hand that opens.** (the couplet at `--fs-h2`).

**Forum (adapted, bible-final).** *One Storyteller. No dialogue. Nine songs. One night.* / *A Mediterranean production of aerial constellations, ribbons, sea and fire — the story of the star that became Calypso, the island that became Gozo, and the hand that learned to open.* Canto strip (mono, nine ticks, user-scrolled horizontally on desktop inside its own `overflow-x: auto` track — not a marquee; `gala.chapters[i].title`): `THE LAST SHIP · THE STRANGER · THE AWAKENING · PARADISE · SEVEN YEARS · FOREVER · THE OTHER WOMAN · THE OPEN HAND · THE POET`. Meta chip: `26 NOVEMBER 2026 · MALTA · APPROX. 70 MINUTES · BY INVITATION (TBC)` (`gala.format.runningTime` → "approx. 70 minutes"; access TBC). **Second movement — recognition:** mono `MEDITERRANEAN TOURISM AWARDS · 25 NOVEMBER` (`awards.title`, `.date`). `[S]` *And yet… three thousand years later… you know his name.* `[F, adapted]` *The Mediterranean Tourism Awards recognise the people, places and projects whose work will still be known when the season is over.* (`awards.note`: categories, venue, access TBC → sans `--fs-fine`: *Categories and venue to be announced.*)

**CTA.** Pill `REQUEST AN INVITATION →` sitting **in the palm** → `mailto:forum@medtourismfoundation.com?subject=Calypso%27s%20Odyssey%20—%20invitation%20request` (TBC). Mono `AWARDS — NOMINATE →` (TBC mailto).

**Visual / 3D.** Background: ink (`--press`), sea black glass, no sun. **The net** (§9.13 `net()`): a `.pin__layer.fx` SVG — two families of cream hairlines at ±45°, 44 px apart, knots at the intersections, covering the pin; `scale 1 → .96` over p 0–.3 ("holding tighter"); the type reads *through* it. **The cut (p .3–.4):** a 2 px cream line draws top → bottom down the centre; the net's strands recoil from it (each line's `stroke-dashoffset` retreats away from the cut, direction by side, `rotate ±3°`); knots fall (`translateY +200`, `ease-in`, stagger by y) and fade. **The hand (p .4–.75) — mosaic formation 2 → 3:** the tessera field morphs from the **fist** (formation 2) to the **open hand** (formation 3), one finger group at a time (`aGroup` stagger, §8.5), while `tess` 0 → 1 flies the tiles in from a polar shell so the hand *assembles as it opens*; gold-leaf at the palm centre → gold → terra → sea at the fingertips (per-instance `aTint` from the formation), 8% pure gold glints, per-tile tilt so a specular sweep (`tessGlint`) crosses the palm as the pointer moves. The hand fills ~80% of the viewport height, centred (`camZ` pulls back to frame it). The couplet lands one line per finger group. **Gold sweep (p .75–.9):** `tessGlint` .5 → 1.4 → .8 and the gala lettering strokes on across the open palm (`draw`, 1.4 s). **Awards (p .9–.96):** the hand holds one gold tile at its centre that becomes the star — the world's star billboard appears at the palm centre (`sunVisible` 0 → 1, `sunHeat 0`, `sunRadius .16`).

**Mood keyframes** (constants: `camYaw 2π`, `veil 3`, `p4 0`).
| p | camX | camY | camZ | camTilt | fov | sunX,Y,Z | sunRadius | sunGlow | sunHeat | sunVisible | skyTop | skyBottom | seaOpacity | seaAmp | stars | tess | tessForm | tessSpread | tessGold | tessGlint | bloom | warmth | vignette |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 1 | 2.4 | −8 | .02 | 34 | — | — | 0 | 0 | 0 | #090D16 | #123044 | 1 | .08 | .2 | 0 | 2 | 6 | .8 | .5 | .5 | .25 | .35 |
| .3 | 1 | 2.4 | −8 | .02 | 30 | — | — | 0 | 0 | 0 | #090D16 | #090D16 | .8 | .05 | .1 | 0 | 2 | 6 | .8 | .5 | .5 | .2 | .4 |
| .4 | .8 | 2.0 | −6 | 0 | 32 | — | — | 0 | 0 | 0 | #090D16 | #090D16 | .6 | .04 | .1 | .1 | 2 | 4 | .8 | .5 | .6 | .2 | .4 |
| .75 | .8 | 1.6 | −4 | 0 | 34 | — | — | 0 | 0 | 0 | #090D16 | #0B1A2A | .5 | .04 | .1 | 1 | 3 | 1 | .9 | .8 | .8 | .35 | .4 |
| .9 | .8 | 1.6 | −4 | 0 | 34 | palm centre (.8, .4, −8) | .16 | 1.6 | 0 | 1 | #090D16 | #0B1A2A | .5 | .04 | .1 | 1 | 3 | 1 | .9 | 1.0 | .9 | .35 | .4 |
| 1 | .8 | 1.6 | −4 | 0 | 34 | palm centre | .16 | 1.6 | 0 | 1 | #000000 | #000000 | 0 | 0 | 0 | .6 | 3 | 1 | .9 | .6 | .7 | .1 | .6 |

**Choreography.** p 0–.3: the net draws and tightens; eyebrow; the Storyteller stack; the fov tightens 34 → 30. p .3–.4: **the cut**; *Calypso cuts the net.* p .4–.75: opening + assembling; the couplet lands. p .75–.9: gold sweep; gala lettering strokes on; Forum lines, canto strip, meta chip; the invitation pill in the palm. p .9–.96: Awards movement; the star in the palm. p .96–1: **the only cut** — everything (sky, sea, hand, chrome rules) fades to `#000` (mood → black; the rail and header fade to 20% via `html.is-black` toggled by the chapter's `onProgress` at p ≥ .96 and removed by Ch 12 at its p ≥ .55). The clock keeps ticking; it is the only thing left.

**Transition → 12.** `[S]` *Everything disappears. / No acrobats. / No projections. / No music. / Only the Storyteller.* (p .94–.98, `--fg-faint`, fading with the frame).

**Mobile.** Net at 60 px spacing; the hand at 1,500 tiles, pitch ×1.6, fills 70% of the width; the pill below the palm, not in it; canto strip becomes a vertical list. Film 3 vh.

**Data.** `gala.*`, `awards.*`.

---

### 6.12 · `homer` — I AM HOMER · Canto XI · Voices · 06:20
**Purpose.** The speakers. The gala's reveal — the Storyteller gives his name — becomes the moment the site gives *its* names. MTF11 speakers are not yet announced; the chapter is built to be honest about that and still feel complete. **The hold.**

**Eyebrow.** `12 — VOICES OF MTF · MTF11 SPEAKERS TO BE ANNOUNCED` (`pastSpeakers.heading`, `.mtf11Speakers.status`).

**Headline (centred — an emblema — the only centred headline).** *There remains only one thing I have kept from you. My name.* (Fraunces italic 300 `--fs-h2`, cream on black).

**Storyteller.** **I am Homer.** (`--fs-h1`, roman 300) — then the hold — then *You thought I was telling you an ancient story.* / **I was telling you your story.**

**Forum.** `[F, adapted]` *MTF11 speakers will be announced through the autumn. The Forum has always been a gathering of voices — heads of state, ministers, mayors, hoteliers, scientists, freedivers, broadcasters, chefs, students.* **Sub-block A** — mono head `MTF11 · 2026 — SPEAKERS TO BE ANNOUNCED`: a row of eight hairline orb rims (§7.13, rotating `--loop-rim`), each labelled `TBA` in `--fs-index`; when `pastSpeakers.mtf11Speakers.value` has entries they fill in order with portrait + name (data-driven). **Sub-block B** — mono head `VOICES OF THE 10TH EDITION` (`pastSpeakers.subheading`): a brickwork frieze of speaker cards (§7.13) from `speakers.json` (36 with portraits) in this curated order first: H.E. Myriam Spiteri Debono · Hon. Dr Ian Borg · Tony Zahra · Andrew Agius Muscat · Rajan Datar · Alex Connock · Manfredi Lefebvre d'Ovidio · Taleb Rifai · Sara Roversi · Anna Pollock · Dimitrios Buhalis · Glenn Mandziuk · Vitomir Maričić, then the rest alphabetically; a mono strip `THE MTF SENATE` (`senators.items[]` names · country) beneath. Image rights are TBC — the card degrades to an ink arch with initials if `image` is missing.

**CTA.** Mono `SPEAK AT MTF11 →` → `mailto:forum@medtourismfoundation.com?subject=Speaking%20at%20MTF11` (TBC) · `ALL VOICES →` (satellite TBC → expands the frieze in place).

**Visual / 3D.** `#000`. Nothing. Not the stage's near-black: black (`skyTop/skyBottom #000`, `seaOpacity 0`, `stars 0`, `tess 0`, `vignette 0`, `grain .04`). The camera keeps moving underneath (so scrolling back is seamless) but nothing is visible. **The hold:** after *I am Homer.* there are **1.2 vh of scroll in which nothing happens** — no new line, no motion, no tick (the section is 3.5 vh; the hold is p .28–.62 of the timeline). It is scroll distance, never a lock. Then one star appears above the type (the world's billboard in star mode, centred). Then, as you scroll, the star's light falls on the orb rims one at a time (a CSS radial highlight at each card driven by p), each rim drawing in. No other geometry — after eleven cantos of a moving world, stillness is the effect.

**Mood keyframes** (constants: `camYaw 2π`, `veil 3`, `p4 0`, `tessForm 3`).
| p | camX | camY | camZ | camTilt | fov | sunX,Y,Z | sunRadius | sunGlow | sunHeat | sunVisible | skyTop | skyBottom | seaOpacity | stars | tess | grain | vignette | bloom |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | .8 | 1.6 | −4 | 0 | 34 | — | — | 0 | 0 | 0 | #000 | #000 | 0 | 0 | .6→0 | .04 | 0 | .7 |
| .62 | .4 | 1.4 | −6 | .02 | 34 | (.4, 2.6, −14) | .14 | 1.8 | 0 | 1 | #000 | #000 | 0 | 0 | 0 | .04 | 0 | 1.0 |
| .9 | 0 | 1.2 | −8 | .02 | 34 | (0, 2.4, −14) | .14 | 1.8 | 0 | 1 | #000 | #000 | 0 | 0 | 0 | .04 | 0 | 1.0 |
| 1 | 0 | .9 | −10 | .02 | 34 | (0, .2, −20) | .14 | 1.6 | 0 | 1 | #06192B | #0B2A3D | .6 | .3 | 0 | .06 | .3 | .8 |

**Choreography.** p 0–.2: black; eyebrow (dim); the headline settles, centred. p .2–.28: **I am Homer.** p .28–.62: **the hold** (nothing). p .62–.7: one star; *You thought I was telling you an ancient story. / I was telling you your story.* p .7–.92: Forum line; sub-block A; sub-block B (rims draw in one at a time as the star's light reaches them, 3% apart); Senate strip; links. p .92: exit; `html.is-black` removed at p .62 (the chrome returns with the star).

**Transition → 13.** `[S]` *Not every star is our destination. / Some enter our darkness only long enough to show us the way.* (p .88–.92). The black lifts from the bottom up like water draining (mood `skyBottom` → abyss, `seaOpacity` → .6); the star sits low on the horizon; the pre-dawn sea returns, and on it, dark shapes: planks.

**Mobile.** Cards as a vertical brickwork (2 per row); the hold shortened to .8 vh. Film 2.5 vh.

**Data.** `pastSpeakers.*`, `senators.*`, `speakers.json`.

---

### 6.13 · `register` — THE RAFT · Coda · Register · Hotels · Partners · 06:40
**Purpose.** Registration, hotels, partners. The wreckage turned raft: build from it. The registration form is the raft's deck. **The persistent CTA is hidden while this chapter is active.**

**Eyebrow.** `13 — THE APPLICATION — REGISTER FOR MTF11 · 25–27 NOVEMBER 2026 · MALTA` (`registration.heading`, `event.dates.display`).

**Headline.** *Build from it.*

**Storyteller.** *Seven years earlier, the sea had thrown Ulysses onto Ogygia beside the wreckage of his ship.* / *Broken… but not destroyed.* / *Now Calypso used those same pieces to help build his raft.* / *The wood that carried him toward death…* / *would carry him toward life.* / *Perhaps that is what we must do with our own wreckage.* / **Build from it.**

**Forum — three movements on the deck.**
- **REGISTER** (mono head). Segmented control (two `<a>` styled as one pill with a hairline divider; `registration.tracks[i].label` / `.currentUrl`, opening in a new tab until 2026 forms exist — TBC): `MALTA-BASED DELEGATES` · `INTERNATIONAL DELEGATES`, each `REGISTER →`. Below it the **interest form** (`<form>` — fields are the planks): Name · Organisation · Country · Email · `I am a:` radio chips `DELEGATE · SPEAKER · PARTNER · STUDENT · MEDIA`. **The Name field's placeholder is `Nobody.` and its floating label reads `I AM ___`; as the visitor types, the label becomes `I AM` + the typed name.** Submit = gold pill `REGISTER →` with two orbiting hairline ellipses (§7.9). Submission (no backend exists — TBC): `onsubmit` composes `mailto:forum@medtourismfoundation.com?subject=MTF11%20registration%20interest&body=…` with the fields and opens it; then the success state plays: the sail fills gold, the raft moves toward the star, mono `RAFT LAUNCHED — SEE YOU IN MALTA`, and the form is replaced by *Thank you. We will write to you at {email}.* Honesty line under the form (`--fs-fine`): *Fees and the 2026 registration platform will be announced. This form registers your interest.*
- **BECOME AN MTF11 ASSOCIATE** (`participation.packages[0]`): includes (`includes[].text`): *Mediterranean Knowledge & Policy Forum – Speaker* · *26th BRAIN Session* · *27th Conference* · *Hosting of Clients*. Link `ENQUIRE →` (`cta.href` mailto). Price TBC — not shown.
- **STAY** (mono head) (`hotels`): *Book your hotel in Malta with us — enjoy special rates.* → `BOOK NOW →` (`hotels.currentUrl`, new tab; 2026 partner/rates TBC — honesty line *2026 rates to be announced.*).
- **THE FLEET** (mono head) — partners (`partners.items[]` where `name` is not null): `FORBES TRAVEL GUIDE` · `LAVAZZA — POWERED BY LAVAZZA, THE COFFEE EXPERIENCE` as **mono wordmarks inside tessera chips in the sail** (no logo files exist — never fabricate one); headings `OUR ASSOCIATES` and `OFFICIAL AIRLINE OF THE MEDITERRANEAN TOURISM FORUM 2026` render with an empty-state chip `TO BE ANNOUNCED` (TBC).

**CTA.** The form; the two register links; `ENQUIRE →`; `BOOK NOW →`.

**Visual / 3D.** The first grey-blue of dawn along the horizon, abyss above; the star (from Ch 12) low ahead as a bearing. Shadow layer: **the raft** (§9.14 `raft()`) — five flat ink planks (the survivors of the Shatter, by geometry) drifting together on the water and locking into a raft with a cream sail, small, at horizon scale, moving slowly toward the star. The form is DOM on the frame's lower two-thirds: the field rows are separated by 6 px of "grout" so they read as planks. Camera drops to the water — the lowest, most human camera in the film.

**Mood keyframes** (constants: `camYaw 2π`, `veil 3`, `p4 0`, `tessForm 3`).
| p | camX | camY | camZ | camTilt | fov | sunX,Y,Z | sunRadius | sunGlow | sunHeat | sunVisible | skyTop | skyBottom | seaColor | seaOpacity | seaAmp | stars | tess | grain | warmth | bloom |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 0 | .9 | −10 | .02 | 34 | (0, .2, −20) | .14 | 1.6 | 0 | 1 | #06192B | #0B2A3D | #0B2A3D | .6 | .1 | .3 | 0 | .06 | .2 | .8 |
| .3 | 0 | .7 | −12 | .04 | 34 | (0, .15, −22) | .14 | 1.4 | .05 | 1 | #06192B | #163A50 | #0E3D57 | 1 | .12 | .25 | 0 | .06 | .25 | .7 |
| 1 | 0 | .7 | −12 | .05 | 34 | (0, .1, −22) | .16 | 1.2 | .15 | 1 | #071E30 | #2B5468 | #124A66 | 1 | .12 | .15 | 0 | .06 | .35 | .7 |

**Choreography.** p 0–.25: storyteller stack while the planks assemble (SVG, quadratic arcs, stagger 80 ms). p .25–.85: the deck draws — frames first, the segmented control, the fields (one per beat), the submit pill's rims last; then the Associate, STAY and FLEET blocks in the right column. p .85–.9: the sail catches the first light (`fill` → `--gold-leaf`); exit of the storyteller only — **the form stays live** until p 1 (this is the one chapter whose DOM is not empty at its bottom seam; Ch 14 begins with the same form position fading over its first 6%). The header's `REGISTER` pill is hidden (`html.is-register` toggled by `onEnter`/`onLeave`).

**Transition → 14.** `[S]` *The raft reaches the sea.* (p .9). The camera begins to rise and the horizon begins to burn.

**Mobile.** Fields stack full-width; the raft glyph sits above the form; segmented control stacks into two pills. Film 2.5 vh.

**Data.** `registration.*`, `participation.*`, `hotels.*`, `partners.*`, `contact.emails[0]`.

---

### 6.14 · `sunrise` — SUNRISE · Finale · Footer · 06:51 · SUNRISE
**Purpose.** The footer as the film's last shot. The open hand becomes the horizon; one star remains; the sun rises — the same sun as the hero — through the same word. Contact, foundation, socials, legal, without breaking the spell. **Mosaic moment: the sunrise path, and the Disc writes XI.**

**Eyebrow.** `14 — MEDITERRANEAN TOURISM FOUNDATION · MALTA · SINCE 2013` (`foundation.name`, `.founded`).

**Headline (`--fs-display`, the largest type since the hero).** *I lived.*

**Storyteller.** *So when your own Odyssey reaches its final shore…* / *do not count the years.* / *Remember the people.* / *The laughter. The mistakes. The storms.* / *The hands that lifted you.* / *The people who stayed. The people who left.* / *And the people you loved enough… to let go.* / *And may you look back upon all of it — and say…* / **I LIVED.** Final couplet, mono caps, `letter-spacing .28em`, held under the sunrise: `LOVE IS NOT THE HAND THAT CLOSES.` — pause — `LOVE IS THE HAND THAT OPENS.` (`gala.keyLines[0,1]`).

**Forum — the footer** (flows *after* the film's pin as normal document flow; four hairlines draw a frame from meander corner marks): `[F]` (`foundation.descriptionCurrentSite.value`): *The Mediterranean Tourism Foundation — We connect Mediterranean tourism stakeholders to promote dialogue, peace, and stability. Through education networks and sustainable projects, we support training, intercultural initiatives, and hospitality professionals, driving growth and resilience across the region's tourism and development sectors.* Columns (mono heads, sans 500 links): **THE FORUM** — The Sun `#ch-hero` · Three Days `#ch-paradise` · Eleven for Eleven `#ch-eleven` · The Four `#ch-rudder` · Calypso's Odyssey `#ch-hand` · Voices `#ch-homer` · Register `#ch-register` · Hotels (`hotels.currentUrl`) · Partners `#ch-register` · Watch MTF10 (`registration.watchLastYear.currentUrl`). **THE FOUNDATION** — Who is MTF `#ch-ogygia` · The Mediterranean Observer (`contact.socials.items[1].url`) · Press (`mailto:info@medtourismfoundation.com`). **CONTACT** — `forum@medtourismfoundation.com` · `info@medtourismfoundation.com` (`contact.emails[]`). **FOLLOW** — Facebook · Instagram · LinkedIn (`contact.socials.items[]`, real URLs; the Facebook misspelling is real — keep it). Bottom rule: `THINK TOGETHER · LEARN TOGETHER · ACT TOGETHER` (`foundation.tagline.value`) · `© 2026 MEDITERRANEAN TOURISM FOUNDATION` · Privacy · Cookies (`href="#"` placeholders labelled TBC in a `title`) · `MOTION: FULL / REDUCED` toggle · **BACK TO THE BEGINNING ↑** (`scroll.scrollTo(0)`).

**CTA.** `REGISTER →` returns as a large gold pill on the water (in the pin, p .6+, linking to `#ch-register`); `BACK TO THE BEGINNING ↑`.

**Visual / 3D.** The sky shader at dawn — flame at the horizon, gold above, cream at the zenith by the end. The sun rising through the horizon, bloom at maximum, `sunHeat` 0 → 1 as it warms. **Mosaic formation 4 — the sunrise path:** the hand from Ch 11 lies down flat and becomes the horizon: the field morphs formation 3 → 4 (the palm's top edge flattens into a line, the finger tiles fall away, the remaining tiles stream into a lane of gold tesserae on the water from the horizon to the camera — the sun's reflection laid as mosaic). **The Disc writes, once:** the risen sun disc (formation 5 — the hero's disc, `tessForm` 4 → 5 at p .45–.6, the path's tiles rising into the disc) flips its tiles to spell **XI** for one beat (`p1` 0 → 1 → 0, mask index `p2` = 1) then goes pure gold. The rail's three gold glyphs S · U · N detach, travel to the horizon and are absorbed into the disc as it breaks the line (the rail component animates its glyphs to the sun's NDC — `world.sunNdc` — on the chapter's `onProgress` p .1–.35). Camera rises to **the hero's framing again, from the far side of the night**. At the very end (p 1, held for the footer) the frame **freezes into mosaic** — `mosaic` → .7: the site's last image is a mosaic sunrise behind the footer.

**Mood keyframes** (constants: `camYaw 2π`, `veil 3`, `p4 0`, `sunVisible 1`).
| p | camX | camY | camZ | camTilt | fov | sunX,Y,Z | sunRadius | sunGlow | sunHeat | skyTop | skyBottom | seaColor | seaAmp | tess | tessForm | tessGold | tessGlint | p1 | p2 | stars | bloom | warmth | mosaic |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 0 | .7 | −12 | .05 | 34 | (0, .1, −22) | .16 | 1.2 | .15 | #071E30 | #2B5468 | #124A66 | .12 | 0 | 3 | .9 | .8 | 0 | 1 | .15 | .7 | .35 | 0 |
| .35 | 0 | 2 | −12 | .07 | 34 | (0, −1.0, −18) | 1.1 | 1.4 | .8 | #0F5A80 | #FF7A1A | #A67C2E | .1 | 1 | 4 | .9 | 1.0 | 0 | 1 | 0 | 1.1 | .8 | 0 |
| .6 | 0 | 3.2 | −12 | .07 | 34 | (0, −.3, −18) | 1.2 | 1.4 | 1 | #2B8FA3 | #FFD166 | #D9A441 | .1 | 1 | 5 | .95 | 1.0 | 1 | 1 | 0 | 1.1 | 1 | 0 |
| .72 | 0 | 3.2 | −12 | .07 | 34 | (0, −.3, −18) | 1.2 | 1.3 | 1 | #7FA9C2 | #FFD166 | #D9A441 | .1 | 1 | 5 | 1 | .9 | 0 | 1 | 0 | 1.0 | 1 | 0 |
| 1 | 0 | 3.2 | −12 | .07 | 34 | (0, −.3, −18) | 1.2 | 1.2 | 1 | #A9CBDD | #F1C86A | #D9A441 | .08 | 1 | 5 | 1 | .7 | 0 | 1 | 0 | .9 | 1 | .7 |

**Choreography.** p 0–.35: the sun rises; the rail glyphs travel to it; the hand lies down into the path; *I lived.* settles at p .2. p .35–.6: the couplet; the path rises into the disc; the Disc writes XI (p .5–.6). p .6–1: the large gold `REGISTER →` pill on the water; the storyteller stack completes; at p 1 the frame freezes into mosaic and stays as the footer scrolls into view below the pin. **Footer** (flowing section after the pin, `min-height: 100vh`, background transparent over the frozen mosaic frame — the canvas is fixed): the frame rules draw on enter (`drawRule`), columns `rise()`.

**Transition.** `BACK TO THE BEGINNING ↑` scrolls to the top (Lenis 1.6 s), where the same sun is waiting at sunset: the long take loops.

**Mobile.** Footer columns 2-up; the couplet at `--fs-index` with `.2em`. Film 1.5 vh.

**Data.** `foundation.*`, `contact.*`, `registration.watchLastYear`, `hotels`, `gala.keyLines`.

---

## 7. GLOBAL COMPONENTS

### 7.1 Preloader — "NINE NIGHTS" (owner: ui/preloader · `src/ui/preloader.ts` + `src/ui/preloader.css`)
The film's first frame, not a loader. Contract (unchanged): `initPreloader().done()` resolves when the curtain has opened; never blocks > 3.5 s cold / .8 s warm (`sessionStorage.mtfWarm`).
- Press-black. One italic line, small, centred: *Sing to me, Muse…* (Fraunces italic 300 `--fs-h3`, `--fg-muted`). A hairline horizon draws left → right at `62%` from top (`ruleH`, 1.15 s). One gold **star** (§9.1 `star()`, 14 px) travels down and across on a slow arc above the rule. Progress is nights, not percent: mono bottom-left `NIGHT 01` … `NIGHT 09` (`--fs-index`, 500), stepping with real progress (weights: fonts 15 · chapters mounted 25 · first world frame 40 · `document.fonts.ready` 20 — the preloader receives these via `document.addEventListener('mtf:progress', …)` events emitted by `main.ts` (lead amendment §10.2-E); if none arrive it steps on a 1.4 s timer). The rail's first nine ticks light one per night (the preloader dispatches `mtf:night` events; the rail listens).
- At ready: mono flips to `THE TENTH NIGHT`; the star drops *below* the horizon rule; the rule ignites gold (`background` → `--gold-leaf`, `linear .32s`); then the preloader's black lifts as a **top-to-bottom wipe** (`clip-path: inset(0 0 100% 0)` from the bottom edge upward, 1.1 s, `--ease-veil`) while the world's sun rises (`world.target.sunY` −1.6 → −.35 over 1.4 s, then the Stage takes over) — the sun rising *is* the hero; no hard cut. Simultaneously the preloader's star element flies (FLIP, 1.4 s, `--ease-tide`) to the rail's tick 01 and hands over to the rail star (the rail shows its star only after `mtf:ready`).
- Scroll or click skips to ready. Reduced motion: no arc, static star, 0-duration reveal. `role="progressbar" aria-valuenow` (nights ×11), `aria-live="polite"` announces "Loaded".
- The preloader must inline its own critical CSS-independent styles (its CSS file loads with main.ts — acceptable because `#preloader` in `index.html` has an inline `style` background `--press` so the first paint is black; the lead adds that inline style).

### 7.2 Header (owner: ui/header · `src/ui/header.ts` + `src/ui/header.css`)
Fixed, z 50, `padding: 1.1rem var(--gutter)`, `pointer-events: none` with children `auto`. Contents (ids kept): `.header__brand` = the MTF mark (§9.15 `mark()` — the logo's Mediterranean brushstroke as a single 1 px `--star` path, 26 × 14 px, `draw` 1.4 s on `mtf:ready`) + `MTF` in `--fs-index` 500 + `2026` in gold; click = `scroll.scrollTo(0)`. `.header__right` = the **REGISTER pill** (§7.3) + `.header__menu` (two hairlines, 40 px ring with `--rule-strong` rim; `aria-expanded`). On `html.is-black` the header fades to 20% (Ch 11→12). On `html.theme-paper` (Ch 06) the mark, text and menu turn `--ink`.

### 7.3 Persistent CTA — the REGISTER pill (owner: ui/header)
`<a class="btn btn--sm header__cta" href="#ch-register">REGISTER <span class="btn__arrow">→</span></a>`, Geist Mono 500 `--fs-label` `.2em`. **Its face is the live sky:** `background: var(--sky-now)`; text `--cream`; 1 px rim `inset 0 0 0 1px var(--rule-strong)`; so the button warms from dusk to dawn as you scroll. From Ch 08 on wide screens (≥ 1100 px) the label gains the date: `REGISTER · 25–27 NOV` (the header listens to `stage` active chapter). In Ch 13–14 it becomes gold-faced (`--gold` face, `--press` text, cartellina inner highlight `inset 0 1px rgba(255,250,232,.7)`, conic rim orbit `--loop-rim` / `--loop-rim2` reverse via `@property --ra`). Hidden while `html.is-register` (Ch 13). Hover: `.flood` layer `clip-path: inset(100% 0 0)` → `inset(0)` `--dur-2`, arrow `translateX(4px)`. **Magnetic ≤ 6 px** (two-layer: button .35, label .15; `gsap.quickTo` .4 s `power4.out`; return with `--ease`), off on coarse pointers. Mobile (< 600 px): the pill moves to `position: fixed; bottom: calc(env(safe-area-inset-bottom) + 1rem); left: 50%` (the header's `@media` hides it and the header script mounts a bottom clone).

### 7.4 Left rail + corner marks + clock (owner: ui/rail · `src/ui/rail.ts` + `src/ui/rail.css`; the lead replaces `.rail` in `index.html` with `<aside class="rail" aria-hidden="true"></aside>` and adds `<div id="corners" aria-hidden="true"></div>`)
- **Rail:** `left: var(--rail-x)`, `top: var(--rail-top)`, `height: 52vh`, `translateY(-50%)`; a 1 px `--rule` vertical line; **14 ticks** (one per chapter, evenly spaced) 9 px wide, `--rule-strong`; the active tick widens to 22 px (`width .5s --ease`) with its 9 px mono label (`--fs-index`, e.g. `04 · THE TENTH DAWN`) fading in and sliding 4 px (`opacity .35s linear, transform .5s --ease`); passed ticks stay at 40%. A second **gold strand** braids around the line as progress (an SVG path whose `stroke-dashoffset` follows `scroll.progress` — the guilloche). **The star** (§9.1, 12 px, gold) sits on the rail at the active chapter's tick and descends one rung per chapter with `--ease-tide` (.9 s). **Three hollow glyphs S · U · N** (Fraunces 300, 14 px, `stroke 1px --rule-strong`, `fill transparent`) sit beside ticks 02, 05, 09; each fills gold (`fill: var(--gold)`, `linear .42s`, then one `shine`) when its chapter's `onProgress` passes the threshold (the rail listens for `mtf:glyph` events `{ letter: 'S'|'U'|'N' }` dispatched by chapters 02/05/09 — chapters own the trigger, the rail owns the drawing). Hover on a glyph shows a tooltip with the pillar's question. In Ch 14 the rail animates its three glyphs to `world.sunNdc` (FLIP to fixed coordinates) on `mtf:sunrise` `{p}` events from the chapter, then hides them. Hamburger lives in the header (not the rail). Rail hidden while `html.is-black`, `html.nav-open`, and on < 820 px it collapses to: the star + the three glyphs + a 2 px progress strand at the left edge (no ticks, no labels).
- **Bottom-left corner:** `.cross` + the chapter label rewriting per chapter (`THE SUN`, `THE WARNING`, …) — from `chapter.label`.
- **Bottom-right corner:** `01 / 14` · `SCROLL` with a breathing 1 px vertical rule (`scaleY` .3 ↔ 1, 2.4 s; becomes `CANTO I` etc. after the first scroll) · **the clock** `16:56 · SUNSET` (`tnum`).
- **The clock** (`src/ui/clock.ts`, same owner): a table keyed by chapter id → minutes-since-16:56 at that chapter's p 0 and p 1: hero 0→44 · warning 44→254 · stars 254→364 · ogygia 364→439 · unity 439→**stop** (label `— · STAY TODAY` while paradise is active) · paradise (stopped) · eleven **spin** 484→724 with `steps(1)` every 4 minutes decelerating (a `gsap` tween of the displayed minutes, `ease: 'power2.out'`, driven by p) · rudder 724→764 · forever 764→794 · remains 794→834 · hand 834→839 · homer 839→854 · register 854→865 · sunrise 865→**835 = 06:51 · SUNRISE** (i.e. sunrise label at p ≥ .9). Interpolate linearly between anchors from `stage.mounted` positions and `scroll.y`. Format `HH:MM`; add `· SUNSET` for hero p < .3 and `· SUNRISE` for sunrise p ≥ .9. **Verify the two anchor times with a solar calculator for Valletta, 25→26 Nov 2026 before launch (expected 16:56 / 06:51).** Under reduced motion the clock still updates on scroll (it is user-driven).

### 7.5 Nav overlay (owner: ui/header)
`#site-nav`, fixed inset 0, z 60, `background: var(--veil)` + `backdrop-filter: blur(26px) saturate(1.15)`; `<dialog>` semantics via `inert` on `#app` while open, focus trapped, `Esc` closes. **Six giant serif items** (Fraunces 300, `clamp(34px, 4.6vw, 86px)`, `lh .98`) each with a 9 px mono index; hairline rules between items draw at .3/.4/.5 s delays; siblings dim to 34% on hover; the MTF sea-line hairline (§9.15 at 60% width) draws behind the list. Items and sub-labels:

| Index | Item | Mono sub-label | Target |
|---|---|---|---|
| 01 | The Sun | STEWARDSHIP · UNITY · NET POSITIVE | `#ch-hero` |
| 02 | Three Days | 25 · 26 · 27 NOVEMBER | `#ch-paradise` |
| 03 | Eleven for Eleven | MTF BRAIN THINK TANKS | `#ch-eleven` |
| 04 | The Four | BEAUTIFUL DESTINATIONS · MED READY · AI · COFFEE | `#ch-rudder` |
| 05 | Calypso's Odyssey | THE GALA · 26 NOVEMBER | `#ch-hand` |
| 06 | Register | THE APPLICATION | `#ch-register` |

Mono row beneath: `VOICES` (`#ch-homer`) · `HOTELS` · `PARTNERS` (`#ch-register`) · `THE FOUNDATION` (`#ch-ogygia`) · `CONTACT` (`#ch-sunrise`) · `WATCH MTF10 ↗` · `MOTION: FULL / REDUCED`. Right column meta (mono): `MEDITERRANEAN TOURISM FORUM · 11TH EDITION` / `25–27 NOV 2026 · MALTA` / `81 DAYS` (computed: days until 2026-11-25, `tnum`) / socials (three links). Navigating = close overlay then `scroll.scrollTo(target)` (Lenis 1.6 s) so the camera is *seen* travelling — the nav is a time machine. Items are built from `chapters.filter(c => c.inNav)` (already wired) plus the sub-labels from a table in `header.ts`.

### 7.6 The veil (owner: ui/veil · `src/ui/veil.ts` + `src/ui/veil.css`; lead adds `<div id="veil" aria-hidden="true"></div>` to `index.html`)
A fixed, full-viewport, `pointer-events: none` layer, z 40, containing an inline SVG: a scalloped-hem cloth (art plan A4 geometry: a `path` whose bottom edge is six quadratic scallops of 116 units; `fill: var(--sand)` at `.22`, a hairline gold grid `pattern` 40 × 40 at `.18`; a second copy offset (−30, +20) at `.14`, `mix-blend-mode: screen`), warped by `feTurbulence baseFrequency .008 .02` + `feDisplacementMap scale 40` with the `baseFrequency` animated 9 s (30 fps `setAttribute`). Driven purely by CSS vars written by the world. **`--veil-now` (mood.veil) is a monotonic phase, never reset:** the cloth position is `fract(veil)` (0 = off-right, .5 = fully covering, 1 = off-left), so crossing 1 is veil 0 → 1, crossing 2 is 1 → 2, the tear happens at 2 → 2.5 (cloth half across), and 2.5 → 3 slides the torn halves off left. `veil.ts` reads `--veil-now` each frame (`getComputedStyle`, one read), computes `f = veil % 1` and sets `transform: translateX(calc((.5 - f) * 200vw))`; the layer is `visibility: hidden` when `f < .02 || f > .98`. Chapters 01–03 declare `veil 0`, 04 goes 0 → .5, 05 .5 → 1, 06 holds 1, 07 1 → 1.6, 08 1.6 → 2 then 2 → 2.5 (+ `p4` 0 → 1), 09 holds 3 (`p4` back to 0 while hidden), **10–14 declare `veil 3`** (a chapter that omits `veil` falls back to `DEFAULT_MOOD` 0 and would sweep the cloth backwards — forbidden); `--tear-now` (mood.p4): when > 0 the cloth is split by a `clipPath` into two halves along a jagged centre polyline (9 vertices jittered ±14), a 2 px `--cream` slash draws top→bottom over the first 30% of tear, then the halves `translateX(±140px) rotate(∓4deg)` (origin top) — **Fontana's cut**. The layer also renders the storyteller line the cloth carries (from a `data-veil-line` attribute the active chapter sets on `#veil` at its p ≥ .86 — Ch 04: *Kalyptein. / To cover. To conceal. / To draw a veil.*; Ch 07 & 08: none) in Fraunces italic with the SOFT-axis breath. Mobile (< 820 px) and `no-gl`: the cloth is a Riley moiré (two `repeating-linear-gradient` line layers at 2° offset, `background-position` animated) — no SVG filters. Reduced motion: opacity crossfade only.

### 7.7 Custom cursor — NONE (owner: ui/cursor · `src/ui/cursor.ts`)
Decision: no custom cursor. `initCursor()` becomes: `document.getElementById('cursor')?.remove(); document.documentElement.classList.remove('has-cursor')`. The lead deletes `#cursor` from `index.html` and the `.cursor` rules from `ui.css`. The pointer still *does* things (the tessera glint, the parallax, the leaf flip, the compass needle) — it does not dress up.

### 7.8 Buttons (lead: `components.css` — keep the existing classes, restyle)
- `.btn` (mono 500 `--fs-label` `.2em` uppercase, pill, `padding: 1em 1.35em .95em 1.5em`, `overflow: hidden`, 1 px inner rim). Variants: `.btn--primary` gold face (`--gold` / `--press` text, cartellina highlight, rim orbit on hover/focus); `.btn--ghost` transparent + `--rule-strong` rim, hover `--chip`; `.btn--paper` `--paper` face / `--press` text; `.btn--sky` (new) face `var(--sky-now)` / `--cream` text — the header pill. `.btn--sm` compact. Hover: `.flood` fill wipe + arrow `translateX(4px)`; `translateY(-1px)` allowed; no scale.
- `.link` (sans 500, underline draws left→right on hover; mono variant `.link--mono` for the `EXPLORE →` links: mono `--fs-label`, arrow, underline draw).
- Focus: `outline: 1.5px solid var(--gold); outline-offset: 4px` (`--terra` on paper).

### 7.9 Form fields — the raft's planks (Ch 13 owns the DOM; lead adds base rules to `components.css` as `.field`)
Pill field: `height: 3.25rem`, `border-radius: var(--radius-pill)`, `background: var(--chip)`, 1 px `--rule` rim, sans 500 `--fs-small` text `--cream`, placeholder `--fg-faint`; floating mono label (`--fs-index`) above-left; focus rim `--gold`; error text `--flame-hot` (the one UI use of flame, because it is a warning). Radio chips = `.chip` with `input[type=radio]` visually hidden, checked = gold face. Submit = `.btn--primary` with two orbiting hairline ellipses (`.orbit` spans: 1 px `--rule-strong` ellipses 140% × 60%, `rotate` `--loop-rim` and `--loop-rim2` reverse). Fields separated by 6 px (the grout).

### 7.10 Chips (`.chip`, exists) — tesserae
Mono 500 `--fs-label`, `.2em`, uppercase, `--chip` face (`--chip-paper` on paper), pill radius; adjacent chips separated by 1 px gaps, never margins (`display: flex; gap: 1px`). `.chip--gold` (gold 18% face, `--gold-leaf` text) for sign-off rows; `.chip--outline`. Hover on interactive chips: `.flood`. Chip rows wrap; `.chip-row` = `display: flex; flex-wrap: wrap; gap: 1px 1px`.

### 7.11 Cards (`.card`, exists) and the question card
`.card`: `background: color-mix(in oklab, var(--paper) 4%, transparent)`, `inset 0 0 0 1px var(--rule)`, `border-radius: var(--radius)`, no `backdrop-filter` inside films (perf) — the lead removes it. `.card--paper` on Ch 06. `.card--frame` = four separate rules drawn from meander corner marks (`.card__rule--t/r/b/l` spans with `scaleX/scaleY`), for the question cards (Ch 01), the four bearings (Ch 08) and the four programme columns (Ch 10). **Tessera glint:** cards carry `--mx --my` (set from `pointermove` by a single delegated listener in each chapter) and a `::after` `radial-gradient(circle at var(--mx) var(--my), rgba(241,200,106,.22), transparent 40%)`, `linear .26s`.

### 7.12 Schedule row (`.row`, exists) and the think-tank tile (`.tile`, new — Ch 07 owns; lead adds base rules)
- `.row`: grid `7rem 1fr auto`, baseline-aligned, `--rule` top border; mono index/time in `--fs-label`, title Fraunces 400 `--fs-h3`, tag chips right. Used in the day-columns (Ch 06) and the programme satellite.
- `.tile`: `background: color-mix(in oklab, var(--sand) 8%, transparent)`, 1 px `--rule` rim, `padding: 1.25rem`, aspect ~ 1.15:1, grid child; brickwork = odd rows `transform: translateX(50%)` of half a cell. Contents: numeral (Fraunces 300 `--fs-h2`, `--fg-muted`), title (Fraunces 400 `--fs-h3`), subtitle (sans `--fs-small` `--fg-muted`), group chip. Hover/focus: `perspective(900px) rotateX(4deg) rotateY(-4deg)` (≤ 6°), rim → `--rule-strong`, glint; the card (`.tile__card`, `position: absolute; right: 7%; width: min(36%, 32rem)`) slides in from the right (`translateX(24px) → 0`, `--dur-4`). `button[aria-expanded]`.

### 7.13 Speaker card (`.voice`, Ch 12 owns; lead adds base rules)
Brickwork frieze (`grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr))`, odd rows offset ½ cell on ≥ 820 px). Card: portrait in a **Matisse arch** — `clip-path: inset(0 round 50% 50% 0 0 / 40% 40% 0 0)` over a `--sea` field, the `<img>` `filter: grayscale(1) contrast(1.05)` + `mix-blend-mode: luminosity` (duotone: sea/sand — photographs of very different quality read as one series), rounded arch top, 1 px `--rule` rim, an orb rim (`::before` 1 px `--rule-strong` ellipse, `rotate --loop-rim`); name Fraunces 400 `--fs-h3`; title sans `--fs-small` `--fg-muted` (2-line clamp); country chip. Missing image → `--sea` arch with initials in Fraunces 300. `TBA` variant: empty arch, dashed rim, `TBA` label. Images: `/speakers/<slug>.jpg` 480², `loading="lazy"`, `width/height` set.

### 7.14 Countdown — none as a widget
The clock is the film's time device. The only count is `81 DAYS` (computed) in the nav overlay's meta column, mono `tnum`. No flip digits anywhere.

### 7.15 Ticker — none on the home film
`.ticker` stays in `components.css` for satellite pages only. The Ch 11 canto strip is a user-scrolled `overflow-x: auto` track (`scroll-snap-type: x proximity`), not an animation.

### 7.16 Footer (Ch 14 owns the DOM; §6.14)
Four hairlines from meander marks, mono heads, sans 500 links, the motion toggle, `BACK TO THE BEGINNING ↑`. In `no-gl`/`boot-failed` the same footer renders at the end of the static page.

### 7.17 Stat (`.stat`, exists)
`.stat__n` Fraunces 300 `--fs-stat`, `tnum`, counts up once (`countUp`, .9 s); `.stat__l` mono. A hairline above each stat draws first (rule → label → number).

### 7.18 Satellite pages (not in this build's Tier 0; design for later)
Programme, each Think Tank, each of the Four, Gala, Voices, Register: the same fixed world holding one chapter's mood still (a plate of the film) with the content as a limestone document below (`theme-paper`, `--measure-paper`, `.row` lists, a faint 24 px pencil grid `--rule-paper` at 6%). No new designs.

---

## 8. 3D & SHADER INVENTORY

### 8.1 The Mood contract (engine — `src/engine/mood.ts`; every chapter drives the world only through this)
`camX camY camZ camTilt camYaw(new) fov · skyTop skyBottom haze · sunX sunY sunZ sunRadius sunGlow sunHeat sunVisible · seaY seaAmp seaSpeed seaOpacity seaColor · stars starDrift constellation · tess tessForm tessSpread tessGlint tessGold · veil · p1 p2 p3 p4 · bloom grain vignette mosaic aberration · warmth`.
**Reserved meanings of the generic params (binding for all layers and chapters):** `p1` = tessera **write** amount (0 gold → 1 tiles under the current mask flip to ink); `p2` = write **mask index** (0 = "SUN", 1 = "XI"); `p3` = tessera **shatter gravity** (0 none → 1 tiles fall and sink below `seaY`); `p4` = **veil tear** (0 → 1). `constellation`: 0 none · 1 the Mediterranean outline of eleven stars · 2 Orion + the Bear (lines extended). `DEFAULT_MOOD` updates (lead): `skyTop hex('#090D16')`, `skyBottom hex('#0E3D57')`, `seaColor hex('#0E3D57')`, `camYaw 0`, `grain .06`.
**Monotonic params — every chapter must declare them explicitly (an omitted key falls back to `DEFAULT_MOOD` and the damped blend would visibly unwind):** `veil` (01–03: 0 · 04: 0→.5 · 05: .5→1 · 06: 1 · 07: 1→1.6 · 08: 1.6→2.5 · 09–14: 3), `camYaw` (01–07: 0 · 08: 0→2π · 09–14: 2π), `p4` (0 except 08: 0→1 at the end and 09: 1→0), `tessForm` (01–03: 0 · 04–07: 1 · 08–10: 1 (with `tess 0`) · 11: 2→3 · 12–13: 3 (with `tess` 0) · 14: 3→4→5).

### 8.2 Sky (`src/gl/layers/sky.ts` — owner gl/sky)
NDC backdrop quad, `renderOrder −100`. Keep: gradient `skyBottom → skyTop`, fbm haze, sun halo at `world.sunNdc`, horizon band. Add: (a) **render at 0.5× resolution** into a small render target and upscale (the blur is real — pear.no's blurred-photo look; the sky is never sharp); (b) a `uWarmth`-driven sun-side scatter `pow(max(dot(dir,sunDir),0),8)` in `--flame`/`--gold-leaf`; (c) a night **nebula** term (2-octave fbm, ±.03, only when `warmth < .3`); (d) the halo must be able to bloom (values > 1 near the sun so `BloomEffect` catches it). Cost: trivial. Mobile: same.

### 8.3 Sun / star (`src/gl/layers/sun.ts` — owner gl/sun)
One additive billboard; it is **the same object** as sun and star, never duplicated. Keep `uHeat/uGlow/uVisible`. Add: limb darkening (exists), **granulation** `fbm(uv·4 + t·.05)·.25` when `uHeat > .5`, corona streaks `fbm(vec2(angle·3, r·2 − t·.15))` in gold-leaf when `uHeat > .5`; **star mode** (`uHeat < .35`): a small hard core + 4 diffraction spikes (anisotropic gaussians at 0°/90°, 60% length; 45° at 30%) + twinkle `.96 + .04·sin(t·7 + seed)`; morph is continuous in `uHeat`. HDR core ≥ 1.6 so bloom takes it. `sunRadius` scales the billboard (`× 3.2`). Cost: trivial.

### 8.4 Sea (`src/gl/layers/sea.ts` — owner gl/sea) and Stars (`src/gl/layers/stars.ts` — owner gl/stars)
- **Sea:** plane **centred on the camera every frame** (`mesh.position.set(m.camX, m.seaY, m.camZ)`, size ≥ 240 × 240 desktop / 140 × 140 mobile, 160² / 96² segments) so the 360° yaw never sees an edge; 4 Gerstner waves (calm table `(1,.3,.12,9) (−.6,1,.08,5.5) (.3,−.8,.06,3.2) (1,1,.04,1.6)`, `seaAmp` scales steepness, `seaSpeed` time) + 2-octave simplex detail; fragment: depth colour from `seaColor` (mix toward `--lagoon` on crests at `warmth`), Schlick fresnel toward the sky colour, **sun glitter** = Blinn-Phong exponent 400 toward `world.sunWorld` × jittered micro-normals (`hash` per texel) — the gold path — plus a wide lobe (exp 24, .15); horizon fade to `skyBottom`; `seaOpacity` fades the whole plane (Ch 11–12). Never foam, never white water. Cost: vertex-bound. Mobile: 96², 3 waves, no micro-normals.
- **Stars:** `Points` 12k desktop / 5k mobile on a dome r 60 around the camera (follow `camX/camZ`), upper hemisphere weighted; `aSize .5–3`, `aPhase`, `aTemp`; soft disc + tiny cross for the brightest 2%; twinkle `.85 + .15·sin(t·1.7 + phase)` (0 in reduced motion); `stars` = opacity, `starDrift` = slow dome rotation. **Constellations** (`LineSegments`, additive, gold 40% alpha): set 1 = the **Mediterranean outline** — 11 vertices (normalised from the MTF logo's brushstroke; the art agent exports `MED_OUTLINE_11` from `src/art/constellations.ts` as `[x,y][]` in 0..1; the stars layer maps them onto the dome facing the camera at yaw 0, elevation 20–55°); set 2 = **Orion + Ursa Major** (art plan A3 vertex lists), each edge with an extra segment extended ×6 beyond its end vertex at 20% alpha (the "spear diagonal"). `aProgress` per vertex; `constellation` (fractional) selects the set and draws it 0 → 1 (`discard` beyond `uDraw`). Cost: low.

### 8.5 Tesserae — the instanced field (`src/gl/layers/tesserae.ts` — owner gl/tesserae) — THE signature system
`InstancedMesh(PlaneGeometry(.11,.11))`, **6,000 desktop / 1,500 mobile** (`shared.mobile`). Per-instance attributes: `aSeed`, `aScatter` (a shell r 6–9 around z −4), `aGroup` (0–5: finger index for the hand; 0 otherwise), and **six formation targets** `aT0…aT5` (vec3) + **six tints** `aC0…aC5` (vec3, quantised to the palette: gold-leaf, gold, gold-deep, stone, terra, sea, press-ink) generated at init by rasterising SVG silhouettes on an offscreen 160 × 90 canvas (`getImageData`, cells with α > .5 emit a target; cell pitch = tile size / .85 so grout shows; when a formation has fewer cells than N, surplus instances get the formation's centroid and `aC = 0` → invisible via alpha). Formations, **in story order** (`tessForm` index; fractional morphs between neighbours):

| idx | Formation | Source | Placement (world) | Tint rule |
|---|---|---|---|---|
| 0 | **Hero sun disc** | procedural: 30 rings, r 2.2 (exists) | centre (0, .9, −4), facing camera | 70% gold-leaf/gold by luminance ramp, 30% gold-deep/stone; `p1` write mask "SUN"/"XI" flips selected tiles to press-ink |
| 1 | **The Mediterranean** | `src/art/formations/mediterranean.svg` (logo brushstroke silhouette) | lying flat on the sea, centre (.8, `seaY + .02`, −9), width 7, rotated −90° X | stone/gold-deep body, gold at Malta (one tile at the outline's centre-bottom pulses `tessGlint`), press-ink grout by jitter |
| 2 | **The fist** | `src/art/formations/hand-fist.svg` (§9.16) | centred (.8, .4, −8), facing camera, height 4.2 | 5-stop radial ramp from palm centre: gold-leaf → gold → terra → sea → sea-deep; 8% pure gold-leaf glints (`hash > .92`) |
| 3 | **The open hand** | `src/art/formations/hand-open.svg` | same centre, height 4.8 | same ramp; **`aGroup` = finger index** so the 2→3 morph staggers pinky → index → thumb (`delay = aGroup · .12` in the morph blend) |
| 4 | **The sunrise path** | procedural: a lane on the sea from z −18 to z −13, width 1.6 → 3.2, centred x 0 | flat on the sea | gold-leaf/gold, glint toward the sun |
| 5 | **The dawn disc** | = formation 0 geometry placed at (0, −.3, −17) r 1.2 (behind the sun billboard's position) | facing camera | gold; `p1` write "XI" |

Vertex: `centre = mix(mix(aT[i], aT[i+1], fract(tessForm)), scatter, 1 − tess)` with the per-instance `smoothstep(0,1, tess·1.15 − seed·.15)` assembly stagger (exists), the `aGroup` delay applied when `floor(tessForm) == 2`; billboard toward the camera for 0/2/3/5, lie flat for 1/4 (a per-formation `aUp` flag); per-tile tilt ±7° (Ravenna setters); `p3` shatter: `centre.y −= p3 · (2.5 + seed·3)` with `centre.xz` drifting along the sea flow, alpha → 0 below `seaY`. Fragment: base tint `aC`, diffuse from `uSun`, specular exponent 60 (`tessGlint` scales; gold ×1.6), **sweep glint** `smoothstep(.03, 0, abs(dot(worldPos.xy, sweepDir) − uSweep))·1.5` with `uSweep` driven by `shared.mouse.x` (pointer = the lamp) and by scroll on touch; bevel darkening `.15` at the quad edge; `p1` write: tiles whose mask value (a 64 × 64 `DataTexture` per word, sampled by the tile's disc UV) > .5 flip to press-ink with a hinge rotation (`rotateX(π·p1)` about the tile's tangent) — so the Disc *writes*. Draw calls: 1. Visible when `tess > .001 || tessSpread < 4`. Cost: ≤ 2 ms desktop.

### 8.6 Mosaic post-process (`src/gl/post/mosaic.ts` — owner gl/post) and its DOM twin
`MosaicEffect` (exists) — upgrade the cells from a sine-warped grid to **jittered-grid Voronoi** (3 × 3 neighbour search, `uJitter .45`; F2 − F1 edge function → grout where `e < uGrout`, bevel `smoothstep(0,.22,e)`), keep the andamento flow warp (`uFlow` 1.2 rad from `vnoise(uv·2)`), one texture fetch per tile at the site (`siteUV` via the inverse rotation), poster quantise 12 levels at 60%, per-tile luminance ±7%, gold tiles `hash > .93` with a specular that sweeps with `uSweep` (= scroll progress × 2π), grout colour `#0B0A09`. `uCells` 56 desktop / 34 mobile (tile ≈ 16 px at 1440 × 900), `uGrout .12`. **Per-cell stagger:** `amount_cell = step(hash(site), uAmount)` so the frame dissolves tile by tile, never fades. `amount` from `mood.mosaic` (exists). Mobile: drop Voronoi for rotated-square tiles (`p = R(hash·.4)·fract(uv·N)`). Post chain stays one `EffectPass`: Bloom → Mosaic → ChromaticAberration → Noise → Vignette. **Grain** must be animated at 24 fps (`floor(t·24)` in the noise seed) — the lead sets `NoiseEffect` opacity from `mood.grain` (exists).
**DOM twin `.tess-out`** (lead adds to `base.css`): an SVG `<pattern>` of the same jittered cells (16 px, 3° rotated) as a `mask-image` on the element, with `--go` 0 → 1 animating `mask-size`/threshold so DOM text dissolves in sympathy with the GL (used in Ch 02 at the Shatter and Ch 09's counter). Implementation: `mask-image: url("data:image/svg+xml,…cells…")`, `mask-mode: luminance`, `mask-size: calc(16px + var(--go) * 40px)`; fallback under reduced motion: opacity.

### 8.7 Post & performance budgets (binding)
Draw calls ≤ 12 total (sky 1, stars 2, sun 1, sea 1, tesserae 1, + post). Fullscreen passes ≤ 3 (render, effect pass, the sky's half-res RT). DPR cap 1.75 desktop / 1.5 mobile with the existing governor (steps −.25 when avg frame > 24 ms). Targets: 60 fps M1 @1440×900; ≥ 30 fps iPhone 13 @ DPR 1.25; ≥ 24 fps mid Android. No per-frame allocations in `update()` (the `sunWorld.clone()` in `gl.ts` must become a reused vector — lead). Static-scene 30 fps mode when `|velocity| < .05` for 500 ms (lead, `gl.ts`). `html.no-gl`: canvas hidden; chapters must look composed with CSS gradients alone (`body` background `--press`; each film sets `background: linear-gradient(var(--sky-top-static), var(--sky-bottom-static))` on its pin from its p-1 mood — every chapter declares these two hex values in its CSS).

### 8.8 The mosaic system — where tesserae appear (the whole list)
| Where | What | Built with |
|---|---|---|
| Preloader | the single gold star (one tessera, tilted) above a grout-coloured horizon rule | DOM SVG (§9.1) |
| Ch 01 hero | the sun disc behind the SUN plate (formation 0) — mosaic light through the letters | field |
| Ch 02 the Shatter | the whole frame tiles (post, per-cell stagger) → the field falls into the sea (`p3`) | post + field + `.tess-out` |
| Ch 04 the island | the Mediterranean rises out of the sea as a mosaic floor (formation 1) | field |
| Ch 06 day discs | three 64 px SVG mini-Discs that write 25 / 26 / 27 | DOM SVG (§9.9) |
| Ch 07 tiles | eleven DOM tiles, brickwork, grout — the grammar, not the shader | CSS |
| Ch 09 counter | the frozen number dissolves tile-wise | `.tess-out` |
| Ch 11 the Open Hand | fist → open hand (formations 2 → 3), gold sweep | field |
| Ch 14 sunrise | hand → sunrise path → dawn disc that writes XI (formations 3 → 4 → 5); the final frame freezes into mosaic | field + post |
| Chrome | guilloche rail strand, meander corners, chips as tesserae, tessera glint on cards and gold surfaces | CSS |
| Never | behind body copy; on the programme; hexagons; organic Voronoi; white grout; gold > 30% of a field; photographic mosaic textures | — |

---

## 9. MYTHIC ART INVENTORY — the SVG glyph set (owner: art · `src/art/*.ts`, one file per glyph; each exports a function returning an SVG string with `aria-hidden="true"`, plus any `setProgress(p)`/`tick(t)` helpers as documented)

**Shared rules (art plan A.0, binding).** Primitives only (`circle`, `rect rx`, `path` ≤ 3 curves, `polygon`); **no faces, ever**; no outlines on fills; figures are flat silhouettes in a single fill (`currentColor` so the chapter sets `--press` for shadow, `--sand` on paper, `--cream` for thread); hairlines `.75–1.25` at `--star` 25–60% for instrument parts; rough scissor edges via `feTurbulence baseFrequency .04` + `feDisplacementMap scale 3` on the *clipPath source* only on ≥ 820 px (fallback: none). `pathLength="1"` on every drawn path. ViewBox `0 0 1000 1000` unless noted; landscapes `0 0 1600 900`. Every chapter-scale plate sits in an **instrument frame** (§9.17). Grain filter only on paper grounds. Every function is pure (no DOM queries); chapters inject the string and animate.

| § | Glyph | File | Construction | Used in |
|---|---|---|---|---|
| 9.1 | **The star** `star(size)` | `star.ts` | `#theStar`: gold disc r 6 + four diffraction spikes (60 units at 0°/90°, 30 at 45°, `--gold-leaf`, tapered polygons) + radial-gradient halo r 40 gold → transparent. Options: `{ spikes: 4, halo: true }`. | preloader, rail, footer, Ch 03 DOM stars (11 small instances, `spikes 0`) |
| 9.2 | **Helios' cattle — the frieze** `cattle()` | `cattle.ts` | viewBox `0 0 1600 220`. `#cow` symbol: body `rect 0 40 120 56 rx 24`; neck `polygon 108,48 150,30 150,70 118,86`; head `rect 140 22 44 34 rx 12`; horns two crescents `path M150,22 a14,14 0 0 1 22,-12` mirrored; legs 4 × `rect 10×54 rx 4` at x 14/34/82/102 (front pair `rotate(∓4)` about top); tail `path M0,52 q-16,10 -10,40` stroke 4; **the brand** = a hole `circle 60 62 r 6` cut by `mask` (the ember shows through). Seven `<use>` at x 140/250/380/470/600/720/840, scales 1/.8/1/.75/.9/1/.8, all `currentColor`, facing left. Exposes `setProgress(p)`: walk `translateX −40·p`; legs alternate `rotate(±6°)` on a `steps(4)` cadence (`Math.floor(p·40) % 4`). | Ch 02 |
| 9.3 | **Zeus' bolt** `bolt()` | `bolt.ts` | `polyline 680,60 630,300 690,360 560,560 600,600 520,700` stroke `--cream` 2, `pathLength 1`, plus a blurred twin (`feGaussianBlur 6`, `--gold-leaf`). Draw with `stroke-dashoffset` 1 → 0 in 60 ms. | Ch 02 |
| 9.4 | **The constellation of the eleven** `constellation()` + `MED_OUTLINE_11` | `constellations.ts` | Exports `MED_OUTLINE_11: [x,y][]` (11 points in 0..1 tracing the logo's Mediterranean brushstroke clockwise from Gibraltar: [.04,.52] [.16,.36] [.31,.30] [.47,.24] [.62,.20] [.80,.26] [.95,.40] [.84,.62] [.66,.72] [.46,.66] [.52,.54]; point 11 (index 10) = Malta, the centre-bottom) and `ORION`, `URSA_MAJOR` vertex lists (art plan A3). `constellation({w,h})` returns an SVG with 11 `<use href="#theStar">` at the outline points scaled to the frame's centre 70%, `<text>` label anchors (chapters fill labels), and 11 hairline edges (`pathLength 1`) plus the extended "spear" segment beyond Malta. | Ch 03 (DOM), stars layer (data) |
| 9.5 | **Ogygia — the island** `island()` | `island.ts` | viewBox `0 0 1600 400`, one `path`: stepped flat-topped mesas (back plateau `300,400 380,240 900,220 1180,260 1320,400`; mid plateau `420,400 520,300 780,280 1000,310 1120,400`; front cliffs `560,400 640,350 900,335 1060,400`, merged into one silhouette), the **Ramla notch** (a shallow crescent bite at x 520–800 on the shore line) and the **cave** as a hole (almond `M640,350 q60,-34 120,0 q-60,34 -120,0`, cut via `mask`) — the star shines through it. `currentColor`. Also exports `ripples()` (three concentric ellipses at the touch point, `pathLength 1`). | Ch 04–07 (shadow; `--sand` on paper) |
| 9.6 | **Portolan routes** `routes({w,h,ports})` | `routes.ts` | Given the island's projected screen rect: 31 port points on the outline (from `MED_OUTLINE_11` interpolated), rhumb lines meeting at Malta; four families as groups: `.air` (quadratic arcs lifted 12% above the plane, `--gold` .6), `.sea` (coast-hugging polylines, `--lagoon` .5), `.digital` (dotted `stroke-dasharray 2 6`, `--star` .5), `.people` (31 pulsing `circle r 2`, Malta r 4 `--gold-leaf`). One **luzzu eye** (`eye()` — almond `--cream` + iris `--sea` + pupil `--press`, 18 px) at the bow of the first sea-line. All `pathLength 1`. | Ch 05 |
| 9.7 | **Compass ring** `compassRing()` | `compass.ts` | A 72-tick ring (`#tick72`: ticks every 5°, 12 units; every 6th 24 units; `--star` .5) r 180 at (500,500), inner hairline ring r 150, cardinal letters slots N/E/S/W (Geist Mono `<text>`), a 1 px vertical needle 500,300 → 500,700 (`--gold-leaf`). Exposes `setYaw(rad)` (ring counter-rotates) and `radar(on)` (a 30° `--gold` .3 sector rotating 8 s). | Ch 08 |
| 9.8 | **The counter** `counter()` | `counter.ts` | nine `<text>` digit slots in Geist Mono `tnum`, each a 10-glyph vertical strip in an `overflow: hidden` box (DOM, not SVG — return an HTML string); `setValue(n)` rolls strips (`translateY`), `freeze()` stops, `dissolve()` applies `.tess-out`. | Ch 09 |
| 9.9 | **The mini Disc** `disc({size, word})` | `disc.ts` | 5 concentric rings of small `rect` tiles (r 12/20/28/36/44 units, tile 5 × 5, 1 px gaps, `--gold` with per-tile `opacity .8–1`), plus a 3 × 5 bitmap font for digits; `write(text)` flips the tiles under the glyph mask to `--press` (each tile `rotateX 0→180` via CSS `transform` on `<g>` with a 8 ms per-tile stagger radiating from the centre) and `clear()` flips back. | Ch 06 (25/26/27), nav overlay (hovered index, optional) |
| 9.10 | **Four event glyphs** `eventGlyph('destinations'|'medready'|'ai'|'coffee')` | `events.ts` | 120 × 120: (a) Matisse arch — `--sand` semicircle over a `--sea` rect + a palm frond of 5 lens leaves; (b) MED READY shield — 5 concentric hairline arcs + a pulsing dot (`--gold`); (c) AI — a LeWitt 6 × 6 hairline grid where exactly one cell is a `--gold` circle; (d) Coffee — a cup from two concentric semicircles (`--terra`) + three rising wavy hairlines (steam). | Ch 08 panels |
| 9.11 | **The olive branch** `olive()` + `leaf()` | `olive.ts` | Branch `path M200,760 C380,620 560,420 820,240` stroke 3 `currentColor`, `pathLength 1`; 13 `#leaf` lenses (`M0,0 q35,-9 70,0 q-35,9 -70,0`, 70 × 18) at t .08…1 alternating sides, rotated to the tangent ±35°, scale .7 → 1; each leaf has `.front` (`--olive`) and `.back` (`--olive-silver`) fills — `flip(i, deg)` sets `rotateY` (CSS 3D on the `<g>`; fallback `scaleX ±1` + crossfade). `fallPath` for leaf #7: `M0,0 c40,60 -60,120 -10,200 s60,120 20,220` (offset-path). | Ch 09 (transition), Ch 10 |
| 9.12 | **Gala lettering** `galaTitle()` | `gala-title.ts` | `CALYPSO'S ODYSSEY` as SVG `<path>`s traced from Fraunces 300 caps (letter-spaced .06em, the apostrophe replaced by a gold tessera `rect 14×14 rotate 12`), two lines, `pathLength 1` each, `stroke --cream 1` for the draw then `fill --cream`; the subtitle as a `<text>` in Fraunces italic. Exposes `draw(p)`. Generated once with opentype.js *at build time* (`scripts/trace-title.mjs`) and committed as static path data — never at runtime. | Ch 11 |
| 9.13 | **The net** `net({w,h})` | `net.ts` | two families of hairlines at ±45°, spacing 44 (60 on mobile), covering the frame, `--cream` .55 `.75`, knots `circle r 1.5` at intersections (≤ 400); `pathLength 1` per line; the cut line `line 50%,0 → 50%,100%` `--cream` 2. Exposes `tighten(s)` (`scale`), `cut(p)` (cut draws 0–.3, lines retreat by side .3–1, knots fall). | Ch 11 (Ch 10 draws three matching lines at its end for the seam) |
| 9.14 | **The raft** `raft()` | `raft.ts` | five planks = the shatter's survivor shapes (`#plank1..5`: quads 520 × 38 with irregular ends), two battens `rect 520×14`, mast `rect 8×260`, sail `polygon 504,310 700,420 504,530` (`--sand`, `fill` animatable to `--gold-leaf`), four lashings (two crossed 1.5 px `--gold` lines). Exposes `assemble(p)` (planks arc from scattered starts — bottom-left third — to rows, stagger .08; battens drop; mast `scaleY`; sail `clipPath` unfurls) and `bob(t)` (`rotate ±1.5°`, `translateY ±4`). | Ch 13 |
| 9.15 | **The MTF mark** `mark()` | `mark.ts` | the logo's Mediterranean brushstroke (`brief/refs/mtf-logo.png`, `public/brand/mtf-logo.png`) redrawn as **one** 1 px `--star` path (trace the outer contour; 11 anchor points = `MED_OUTLINE_11` smoothed with Catmull-Rom), `pathLength 1`, 26 × 14 px in the header, 60% width in the nav overlay. Never use the raster logo in the film chrome; the raster logo appears only in the footer's foundation block (`<img>` 120 px, on its own, with alt text). | header, nav, footer |
| 9.16 | **Hand formations** (data, not on screen) | `formations/hand-fist.svg`, `hand-open.svg`, `mediterranean.svg` | Fist: palm `rect 390 420 220 200 rx 60`; four folded fingers `rect 56×90 rx 28` at x 396/458/520/582 y 360 with knuckle `circle r 28`; thumb `rect 150×52 rx 26` rotated −20° about (400,520). Open hand: palm `rect 380 420 240 260 rx 80`; five finger capsules width 54, lengths 150/200/220/200/150 at x 396/452/500/548/604 rotated −38/−18/0/16/34° about their base; thumb `170×54` from (392,600) rotated −70°. Each finger is its own `<g data-group="1..5">` (thumb = 5) so the tesserae rasteriser assigns `aGroup`. Mediterranean: the filled silhouette of the logo outline. All `fill #000` on transparent, 1000² viewBox. | tesserae layer (rasterised at init) |
| 9.17 | **Instrument frame** `frame({label, coords})` | `frame.ts` | 1 px `--rule` frame inset 4%, four 12 px corner crosshairs, a mono label slot top-left, a coordinates slot bottom-right, an optional 72-tick ruler along the bottom that draws in. Wraps any plate. | Ch 04 (once), satellite plates |

**Modern-art register (composition grammar — never reproduction; the whole list):** Olafur Eliasson — the sun you stand under (Ch 01/14); Emvin Cremona and the Domvs Romana floor at Rabat — the Maltese mosaic modernism the client owns (Ch 04 island, Ch 07 tiles, the Ravenna gold-as-angle doctrine); Joan Miró / Agnes Martin — the hairline weight of every rule and constellation (Ch 03, all frames); Alexander Calder — the balance of the swaying routes (Ch 05); Henri Matisse — the cut-out arches of the speakers and the scissor edges of silhouettes (Ch 12, all glyphs); Mark Rothko — the two-band fields (Ch 09, Ch 14); Lucio Fontana — the single slash (the veil tear, Ch 08); Roman Opałka — the counter to infinity (Ch 09); Giuseppe Penone — the olive branch (Ch 10); Chiharu Shiota and Maltese *bizzilla* — the net (Ch 11); Ad Reinhardt — the black (Ch 12); Bridget Riley — the veil's moiré on mobile. Twelve names; one floor.

---

## 10. BUILD PARTITIONING

### 10.1 Ownership table — one owner per file; no two agents ever touch the same file

| Agent | Owns (create/edit ONLY these) | Reads |
|---|---|---|
| **lead / integrator** | `index.html` · `src/main.ts` · `src/engine/*.ts` · `src/chapters/registry.ts` · `src/chapters/_placeholder.ts` (delete) · `src/styles/tokens.css` · `src/styles/fonts.css` · `src/styles/base.css` · `src/styles/components.css` · `src/styles/ui.css` (baseline only) · `src/content/content.json` · `src/content/speakers.json` · `public/fonts/*` · `public/og/*` · `public/favicon.svg` · `public/robots.txt` · `public/sitemap.xml` · `scripts/*` · `vite.config.ts` · `vercel.json` · `package.json` | everything |
| **gl/sky** | `src/gl/layers/sky.ts` | mood.ts, gl.ts |
| **gl/sun** | `src/gl/layers/sun.ts` | mood.ts, gl.ts |
| **gl/sea** | `src/gl/layers/sea.ts` | mood.ts, gl.ts |
| **gl/stars** | `src/gl/layers/stars.ts` | mood.ts, gl.ts, `src/art/constellations.ts` (data export) |
| **gl/tesserae** | `src/gl/layers/tesserae.ts` · `src/gl/layers/tesserae-formations.ts` (rasteriser) | mood.ts, gl.ts, `src/art/formations/*.svg` |
| **gl/post** | `src/gl/post/mosaic.ts` | gl.ts |
| **ui/preloader** | `src/ui/preloader.ts` · `src/ui/preloader.css` | §7.1, `src/art/star.ts` |
| **ui/header** | `src/ui/header.ts` · `src/ui/header.css` (header + REGISTER pill + nav overlay) | §7.2/7.3/7.5, `src/art/mark.ts`, `src/art/disc.ts` |
| **ui/rail** | `src/ui/rail.ts` · `src/ui/rail.css` · `src/ui/clock.ts` (rail, corner marks, clock, S·U·N glyphs) | §7.4, `src/art/star.ts` |
| **ui/veil** | `src/ui/veil.ts` · `src/ui/veil.css` | §7.6 |
| **ui/cursor** | `src/ui/cursor.ts` (make it a no-op that removes `#cursor`) | §7.7 |
| **art** | `src/art/star.ts` · `cattle.ts` · `bolt.ts` · `constellations.ts` · `island.ts` · `routes.ts` · `compass.ts` · `counter.ts` · `disc.ts` · `events.ts` · `olive.ts` · `gala-title.ts` · `net.ts` · `raft.ts` · `mark.ts` · `frame.ts` · `src/art/formations/{mediterranean,hand-fist,hand-open}.svg` · `scripts/trace-title.mjs` | §9 |
| **ch/01-hero** … **ch/14-sunrise** (14 agents) | `src/chapters/<NN>-<id>/index.ts` · `src/chapters/<NN>-<id>/style.css` · `src/chapters/<NN>-<id>/README.md` (beats table, budgets, status) | §5, §6.x, `src/art/*` (import), `content.json` via `ctx.content` |

Rules: chapters never import other chapters; chapter CSS is scoped under `#ch-<id>` only; nobody edits `registry.ts` but the lead (each chapter agent's final report names its export; the lead wires it). If an agent needs a shared component or token, it writes it in its own file and names it in its final report for the lead to hoist. `npm run typecheck` and `npm run build` must pass for every agent before finishing.

### 10.2 Engine amendments — the lead does these FIRST (before any other agent starts)
- **A. Unified progress.** `Stage.computeMood`: for sections with class `chapter--film`, `p = clamp((scrollY − top) / (height − vh))` (identical to `createFilm`'s ScrollTrigger); for flowing sections keep the centre-based p. Also pass this same `p` to `chapter.onProgress` for film chapters (create the film's ST with `onUpdate` in Stage, or let `createFilm` accept the chapter's `onProgress`).
- **B. `camYaw`.** Add `camYaw: number` to `Mood` (`DEFAULT_MOOD.camYaw = 0`), lerped like any number; in `World.update`: `camera.rotation.set(m.camTilt + my·.012, m.camYaw − mx·.02, 0)`.
- **C. Sea follows the camera.** Document for gl/sea that `LayerCtx.camera` position is authoritative; no engine change beyond A/B.
- **D. CSS live values.** In `World.update`'s 3-frame CSS write, also set `--veil-now` (m.veil), `--tear-now` (m.p4) and `--horizon-now` (project `(m.camX, m.seaY, m.camZ − 400)` → NDC y → `${(1 − y) · 50}%`, clamped 30–80%). Reuse a single `Vector3` (remove the `clone()`).
- **E. Preloader progress events.** `main.ts` dispatches `document.dispatchEvent(new CustomEvent('mtf:progress', { detail: { phase: 'fonts'|'chapters'|'frame'|'ready', value: 0..1 } }))` at each boot phase; the preloader listens.
- **F. Global state classes.** Chapters may toggle on `<html>`: `theme-paper` (Ch 06), `is-black` (Ch 11 end → Ch 12), `is-register` (Ch 13). Document in ENGINE-API. Header/rail react in CSS.
- **G. `index.html`:** replace `.rail` with `<aside class="rail" aria-hidden="true"></aside>`; add `<div id="veil" aria-hidden="true"></div>` and `<div id="corners" aria-hidden="true"></div>`; delete `#cursor`; header CTA `href="#ch-register"`, brand `href="#ch-hero"`; preloader markup per §7.1 (`.preloader__line`, `.preloader__rule`, `.preloader__star`, `.preloader__night`); inline `style="background:#090D16"` on `#preloader`; `<meta name="theme-color" content="#090D16">`; font preloads per §2.1; OG image path `/og/mtf11-og.jpg` (lead renders a 1200 × 630 still of Ch 01 at p .1 with `scripts/shot.mjs`); JSON-LD from `content.json → seo.jsonLd` (venue "Venue to be announced").
- **H. `tokens.css`** = Appendix A verbatim. `base.css`: add `.tess-out`, `.chapter--static`, `.pin__layer`, `.pin__frame` (exists), `html.reduced-motion` rules from §5.5, `html.is-black .header, html.is-black .rail { opacity:.2 }`, `html.is-register .header__cta { opacity:0; pointer-events:none }`, `html.theme-paper` colour swaps (§3.1). `components.css`: `.btn--sky`, `.flood`, `.field`, `.tile`, `.voice`, `.card--frame`, `.chip-row`, `.orbit` per §7.
- **I. `gl.ts`:** `setClearColor(0x090d16)`; tesserae count from `shared.mobile`; static-scene 30 fps mode; expose `world.project(v3) → {x,y}` helper for chapters (screen-space of a world point) so Ch 05/08/14 can position DOM to world objects without touching layers.
- **J. `registry.ts`:** the 14 chapters in order; delete `_placeholder.ts`.
- **K. `content.json`:** already the research model; add `event.editionLabel = "11th edition"`, `event.datesLabel = "25–27 November 2026 · Malta"` (convenience keys used by the header).
- **L. Fonts:** §2.1 files; prune the rest; update `fonts.css`.

### 10.3 Build order (one day, parallel)
1. **08:00 lead:** amendments A–L; `npm run dev` shows the empty stage with fonts, the rail, the veil div, the preloader shell. Publish this bible's §6 slugs as empty chapter folders with README stubs.
2. **08:30 parallel — wave 1 (world + chrome):** gl/sky, gl/sun, gl/sea, gl/stars, gl/tesserae, gl/post, ui/preloader, ui/header, ui/rail, ui/veil, ui/cursor, art (formations + star + mark + constellations first — others agents depend on them).
3. **09:30 parallel — wave 2 (chapters):** all 14 chapter agents. Priority if time is short (Tier 0 must ship): 01 hero → 02 warning → 04 ogygia → 11 hand → 14 sunrise → 13 register → 06 paradise → 07 eleven → 08 rudder → 03 stars → 09 forever → 05 unity → 10 remains → 12 homer. A chapter that cannot finish its choreography ships its DOM composed as a still (poster rule) with a flat mood.
4. **Integration (lead):** wire registry; scrub the whole page at 2% steps (`scripts/qa.mjs`) — every still must be a composed poster; check seams (§5.3), mood hand-overs, the rail/clock tables, budgets in `?debug`; real iPhone test; reduced-motion and `no-gl` passes; Lighthouse; Vercel.

---

## 11. DEFINITION OF DONE / QA CHECKLIST

**Per chapter (agent self-check, recorded in the chapter README):**
1. `?chapter=<id>&p=0 / .5 / .9` renders a *composed* still at each (one primary object, one hairline, one mono label; nothing mid-tween looks like a mess). Forward *and* backward scrub with no popping.
2. Seam rule: frame content is at opacity 0 for p < .06 and p > .90 (except 13/14 as specified). Mood at p 1 equals the next chapter's documented p 0 (§6 tables).
3. Copy is verbatim from `content.json` / §6 (spot-check every headline, eyebrow, chip row and closing line). British spelling. No invented facts; every TBC renders its designed placeholder (`VENUE TO BE ANNOUNCED`, `TBA`, `BY INVITATION (TBC)`, honesty lines).
4. Real DOM: `h2` per chapter (one `h1` on the hero), lists are `ul/ol`, links are `a`, buttons are `button`, decorative SVG `aria-hidden`, meaningful art has `<title>`. Keyboard: every link/button reachable when active; Esc closes cards; focus ring visible (gold).
5. Works with `html.reduced-motion` (static stack, all copy), `html.no-gl` (CSS gradient sky per §8.7), `shared.mobile` (portrait recomposition per §6.x "Mobile"), and at 1440 × 900, 1920 × 1080, 390 × 844.
6. No hover-only content; no horizontal overflow (`scripts/qa.mjs` reports it); no `console` errors; `npm run typecheck` + `npm run build` pass.
7. Budgets: ≤ 250 DOM nodes added by SplitText (lines/words only), ≤ 3 KB CSS, no per-frame allocations in `onFrame`, no `backdrop-filter` inside pins.

**Global (lead):**
- Visual: the temperature arc §3.4 reads across the whole scrub; the clock table matches; S/U/N fill at the right chapters; the star descends a rung per chapter; the veil crosses at 04→05 and 07→08 and tears at 08→09; the Shatter, the island, the hand, the sunrise path and the XI write all fire; the final frame freezes into mosaic; `BACK TO THE BEGINNING` loops.
- Perf: 60 fps on M1 Chrome + Safari at DPR ≤ 1.75 while scrolling; ≥ 30 fps iPhone 13; JS ≤ 350 KB gz; fonts ≤ 260 KB (five variable files); total transfer ≤ 700 KB gz excluding speaker portraits (lazy); LCP ≤ 2.5 s on 4G (the preloader's first paint is inline CSS black + the hairline).
- A11y: Lighthouse a11y ≥ 95; contrast pairs per §3.3; `prefers-reduced-motion` parity; skip link "Skip to registration" (`#ch-register`) first in tab order; nav overlay traps focus; `aria-live` on the preloader and on the form's success state; `lang="en"`.
- Copy accuracy: dates `25–27 November 2026`; `11th edition`; `1,600+ · 60/40 · 31+`; eleven forces; eleven think tanks with the deck's titles/subtitles/closing lines; four events with subtitles; MED READY ladder complete; gala title + subtitle; `forum@` / `info@medtourismfoundation.com`; socials (Facebook URL misspelling preserved); no singer names; no lyrics; no venue name; no "Hilton".
- SEO: `<title>`, description, canonical, OG image, JSON-LD Event (venue TBA), robots allow, sitemap `/`.
- Mobile: sticky pins on iOS ≥ 16.4 (`100dvh`, `ScrollTrigger.config({ ignoreMobileResize: true })`), pill bottom-centre, rail collapsed, no hover traps, touch scroll native.

---

## 12. OPTIONAL UPGRADE LAYER — generated imagery / video (only when the client provides credits)

Rules: the procedural build is the fallback and the loading state; generated assets are dropped *behind* the sky as blurred light (pear.no's hero-photo treatment) or *inside* the same instrument frames — never as a slideshow, never replacing the tesserae or the type. Style lock to append to every image prompt: `flat geometric folk-art illustration, faceless silhouetted figures, limited palette: cream #F3EEE3, deep sea teal #0E3D57, terracotta #8C3A2B, gold #D9A441, flame orange #FF7A1A, night-sea navy #090D16; vintage editorial print texture, paper grain, storybook composition, vast negative space, long diagonal lines, no outlines, Mediterranean myth, modern-art poster`. Universal negative: `text, letters, watermark, signature, realistic faces, photoreal, 3D render, plastic, glossy, anime, extra limbs, clutter, busy background, banding, frame, border`. Deliver WebP/AVIF ≤ 350 KB per still; video H.265/WebM VP9 ≤ 8 MB, loopable, muted. Loaded lazily only when the chapter is within ±1 section (`IntersectionObserver` on `#ch-<id>` with `rootMargin: 100%`).

| # | Placement | Ratio / size | Model | Prompt (add the style lock) | Negative (add universal) |
|---|---|---|---|---|---|
| U1 | **Ch 01/14 sun plate** — behind the sky at 40% opacity, `filter: blur(18px)`; the knockout stays | 16:9 3840×2160 + 9:16 1080×1920 | Flux 1.1 Pro / Midjourney v7 `--style raw` | Vast Mediterranean at night from a low shore, one enormous flat gold sun disc half-risen on the horizon with seven thin concentric rings, calm sea as a few thin cream lines, everything else empty night-navy paper | clouds, boats, realistic water |
| U2 | **Ch 02 cattle frieze** — a wide band on the horizon replacing the SVG frieze on desktop (SVG stays on mobile) | 5:1 5000×1000, alpha | Flux / MJ `--ar 5:1` | A frieze of seven identical flat ink cattle silhouettes walking left along a thin cream line, each with a small round hole on its flank, under a flame-orange ember line, transparent background | perspective, shading, grass, realism |
| U3 | **Ch 04 Gozo plate** — behind the island silhouette at 35%, blurred | 21:9 4200×1800 | Flux / MJ `--ar 21:9` | Gozo as stepped flat-topped honey-limestone mesas with thin horizontal bedding lines, a red-sand crescent bay at the left, a dark almond-shaped cave above it, five lollipop olive trees, calm teal sea as three thin lines, night sky | tourists, buildings, roads, photographic |
| U4 | **Ch 04→05 veil loop** — inside `#veil` replacing the SVG cloth on ≥ 1100 px | 16:9 1920×1080, 10 s loop | Kling 2.x / Runway Gen-4 | Slow-motion sheer cream silk with a faint gold grid drifting right to left across a night-navy void, backlit, nothing else, seamless loop | body, hands, skin realism |
| U5 | **Ch 08 hand on the tiller** — folk-art plate in the lower-left instrument frame | 3:2 3000×2000 | MJ v7 | A single flat terracotta faceless arm and hand gripping a wooden tiller, seen from behind, a gold star low on the horizon at the right edge, night-navy sea drawn as two thin lines, vast empty sky | face, body, boat detail, realism |
| U6 | **Ch 11 the open hand** — behind the tessera hand as a blurred gold emblema at 30% | 1:1 3000 | MJ v7 / Flux | An open human hand, palm forward, fingers gently splayed, made entirely of small gold, terracotta and teal mosaic tesserae with dark grout, glowing gold at the palm centre, on a black void, modern-art poster | finger realism, skin, rings, wrist detail |
| U7 | **Ch 13 the raft** — side plate in the right column's instrument frame | 3:2 | MJ v7 | A small flat terracotta faceless man standing on a raft of five planks with a cream triangular sail, tiny against a vast dawn-grey sea drawn as a few lines, a gold star above the horizon at the right edge | sea monsters, waves, realism |
| U8 | **Ch 14 sunrise video** — behind the sky at 45%, blurred, muted loop | 32:9 3840×1080, 12 s | Kling / Veo | A flat gold sun rising slowly over a calm Mediterranean drawn as thin cream lines, night-navy sky turning cream, stars fading, no clouds, seamless, flat folk-art illustration | lens flare, clouds, birds, boats, realism |
| U9 | **Speaker portrait treatment** (img2img instruction, no new subjects) | 1:1 800 | Flux Kontext | Convert the supplied portrait into a flat two-tone cut-out: cream face-shape silhouette on a teal field, no facial features, keep the hairline and shoulder shape, paper grain | facial features, gradients, photo |
| U10 | **OG image** (replaces the rendered still) | 1200×630 | as U1 | as U1 cropped, with the word SUN set by us in Fraunces over it (never generated text) | text |

Priority if credits are limited: U1 → U6 → U3 → U2 → U8.

---

## APPENDIX A — `src/styles/tokens.css` (final; lead copies verbatim)
```css
/* MTF11 — Design tokens. SOURCE OF TRUTH: design/DESIGN-BIBLE.md §2–§5. Do not add hex literals elsewhere. */
:root{
  /* colour — stage & sea */
  --press:#090D16; --abyss:#06192B; --sea:#0E3D57; --sea-light:#2B8FA3; --lagoon:#2B8FA3; --sky:#0F5A80; --black:#000000;
  /* colour — stone & paper */
  --paper:#F3EEE3; --paper-soft:#E8DCC2; --sand:#E8DCC2; --stone:#D6C39C; --cream:#FFF7E1; --star:#FFF9EA; --ink:#1B1A17; --ink-soft:#3B3934;
  /* colour — earth, gold, olive, flame */
  --ramla:#B44A2D; --terra:#8C3A2B;
  --gold-leaf:#F1C86A; --gold:#D9A441; --gold-bright:#F1C86A; --gold-deep:#A67C2E;
  --olive:#6F7A5C; --olive-silver:#A9B39C; --flame:#FF7A1A; --flame-hot:#FFD166;
  /* semantic */
  --bg:var(--press); --fg:var(--cream);
  --fg-muted:color-mix(in oklab, var(--paper) 75%, transparent);
  --fg-faint:color-mix(in oklab, var(--paper) 55%, transparent);
  --accent:var(--gold);
  --rule:color-mix(in oklab, var(--star) 22%, transparent);
  --rule-strong:color-mix(in oklab, var(--star) 40%, transparent);
  --rule-paper:color-mix(in oklab, var(--ink) 14%, transparent);
  --cross:color-mix(in oklab, var(--star) 53%, transparent);
  --chip:color-mix(in oklab, var(--star) 14%, transparent);
  --chip-paper:color-mix(in oklab, var(--ink) 10%, transparent);
  --veil:color-mix(in oklab, var(--sea) 58%, transparent);
  --grain:.06;
  /* live (written by the world) */
  --sky-now:#0E3D57; --warmth-now:.35; --horizon-now:62%; --veil-now:0; --tear-now:0;
  /* type families */
  --font-display:"Fraunces","Fraunces Fallback","Source Serif 4","Iowan Old Style",Georgia,serif;
  --font-serif:var(--font-display);
  --font-sans:"Instrument Sans","Instrument Sans Fallback","Helvetica Neue",Arial,sans-serif;
  --font-mono:"Geist Mono",ui-monospace,"SF Mono",Menlo,monospace;
  /* type scale */
  --fs-sun:clamp(6.5rem,26vw,24rem); --fs-display:clamp(3rem,8.5vw,7.5rem); --fs-h1:clamp(2.25rem,5vw,4.5rem);
  --fs-h2:clamp(1.75rem,3.2vw,3rem); --fs-h3:clamp(1.25rem,1.9vw,1.75rem); --fs-story:clamp(1.25rem,1.9vw,1.75rem);
  --fs-stat:clamp(3.5rem,8vw,8rem); --fs-lead:clamp(1.125rem,1.4vw,1.375rem); --fs-body:clamp(.9375rem,1.05vw,1.0625rem);
  --fs-small:clamp(.8125rem,.95vw,.875rem); --fs-fine:.75rem; --fs-label:clamp(.5625rem,.66vw,.6875rem); --fs-index:.5625rem;
  --lh-display:.96; --lh-tight:1.02; --lh-h2:1.08; --lh-h3:1.18; --lh-story:1.22; --lh-lead:1.4; --lh-body:1.55;
  --ls-display:-.028em; --ls-h1:-.022em; --ls-h2:-.018em; --ls-label:.2em; --ls-index:.24em;
  --measure:52ch; --measure-paper:56ch; --measure-lead:30em; --measure-title:11em; --measure-hero:8em; --measure-story:24em;
  /* layout */
  --gutter:clamp(1.5rem,5vw,5rem); --gx-2:calc(6% + clamp(1.25rem,2.4vw,2.75rem)); --rail-x:max(1.25rem,2.65vw); --rail-top:24%;
  --gap:clamp(1.5rem,2.6vw,3rem); --gap-y:clamp(2.25rem,6vh,4rem); --container:92rem; --radius:4px; --radius-pill:999px;
  --space-1:.25rem; --space-2:.5rem; --space-3:.75rem; --space-4:1rem; --space-6:1.5rem; --space-8:2rem; --space-12:3rem; --space-16:4rem;
  /* motion */
  --ease:cubic-bezier(.22,1,.36,1); --ease-press:var(--ease); --ease-out:cubic-bezier(.16,1,.30,1); --ease-tide:var(--ease-out);
  --ease-in-out:cubic-bezier(.65,0,.35,1); --ease-veil:var(--ease-in-out); --ease-set:cubic-bezier(.33,0,.20,1);
  --dur-1:.12s; --dur-2:.26s; --dur-3:.42s; --dur-4:.64s; --dur-5:.82s; --dur-6:1.15s; --dur-7:1.4s; --dur-8:2.2s;
  --dur-fast:var(--dur-2); --dur:var(--dur-4); --dur-slow:var(--dur-6);
  --loop-rim:7.5s; --loop-rim2:11s; --loop-shine:7s; --loop-glow:4.6s; --loop-twinkle:9s; --stagger:60ms; --stagger-cell:8ms; --lerp:.085;
  /* z */
  --z-gl:0; --z-app:2; --z-veil:40; --z-header:50; --z-nav:60; --z-preloader:100;
}
.theme-paper,[data-theme="paper"]{
  --bg:var(--paper); --fg:var(--ink);
  --fg-muted:color-mix(in oklab, var(--ink) 80%, transparent); --fg-faint:var(--ink-soft);
  --rule:var(--rule-paper); --rule-strong:color-mix(in oklab, var(--ink) 30%, transparent);
  --chip:var(--chip-paper); --cross:color-mix(in oklab, var(--ink) 53%, transparent);
  --accent:var(--terra); --grain:.03;
}
@property --ra{syntax:"<angle>";inherits:false;initial-value:0deg}
```

## APPENDIX B — Copy source index (where every headline comes from)
| Ch | Headline | Source |
|---|---|---|
| 01 | Mediterranean SUN · Stewardship · Unity · Net Positive | deck 1, 4 |
| 02 | Do not touch what belongs to the Sun. | script, Preamble |
| 03 | Where do I go from here? | script, Preamble |
| 04 | A diamond set in blue. | script, Canto I |
| 05 | Achieve together what we cannot achieve alone. | deck 6 |
| 06 | Stay today. | script, Canto III |
| 07 | 11th edition. 11 think tanks. One Mediterranean. | deck 14 |
| 08 | The wind may belong to destiny. The hand upon the rudder remains ours. | script, Canto VI |
| 09 | Leave more than we take. | deck 7 |
| 10 | Perhaps immortality is what remains because we lived. | script, Conclusion (compressed) |
| 11 | Calypso's Odyssey — The Greatest Journeys Are Not Always Across the Sea | script, title |
| 12 | There remains only one thing I have kept from you. My name. / I am Homer. | script, Conclusion |
| 13 | Build from it. | script, Canto VII |
| 14 | I lived. | script, Conclusion |

## APPENDIX C — TBC facts and their designed placeholders (never invent; never leave blank)
| Fact | Placeholder shipped |
|---|---|
| Venue(s) 2026 | `VENUE TO BE ANNOUNCED` chip (Ch 04), JSON-LD "Venue to be announced" |
| Programme times | *Times and venues to be announced.* (Ch 06 fine print) |
| Knowledge & Policy Forum days | `25–26 NOVEMBER` + *Days to be confirmed.* (Ch 10) |
| Registration platform, fees, Malta/International mechanics | 2025 links (new tab) + interest form via mailto + honesty line (Ch 13) |
| Hotel partner / rates | `BOOK NOW →` to the 2025 page + *2026 rates to be announced.* |
| Partners, official airline, associates 2026; logo files | mono wordmarks (Forbes Travel Guide, Lavazza) + `TO BE ANNOUNCED` chips; no fabricated logos |
| Gala access, venue, cast | `BY INVITATION (TBC)` meta; no singer names; *Categories and venue to be announced.* for the Awards |
| MTF11 speakers | eight `TBA` orb rims; MTF10 voices labelled "10th edition" |
| MTF10 portrait rights | cards degrade to initials if an image is removed |
| Think-tank participation route, satellite pages, `EXPLORE →` targets | mailto / in-place expansion until pages exist |
| Watch MTF10 link | 2025 "what happened last year" URL, new tab |
| Edition years for Ch 07's date stamp | Roman numerals only (`EDITION XI · X · …`), never years |
| Sound | none (v1 silent; no toggle) |
| Exact sunset/sunrise minutes | 16:56 / 06:51 — verify with a solar calculator before launch |

## APPENDIX D — Open questions for the client (do not block the build)
1. Confirm verbatim use of the gala script's lines on the site (assumed yes). 2. Venue(s). 3. Gala access and whether the cast may be named. 4. Registration mechanics and fees for 2026; whether the Malta/International split stays. 5. Which MTF10 voices may be shown with portraits. 6. 2026 partners, airline, Lavazza and Forbes logo usage. 7. Confirm `1,600+ / 31+ countries` as the public 2026 figures (2025 said 1,500+ / 35+). 8. Generated-media credits: U1 → U6 → U3 first.

*End of the Design Bible.*
