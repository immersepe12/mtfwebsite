# 14 · sunrise — Sunrise · Finale · 06:51 · SUNRISE

Emotion: CATHARSIS. Film 2 vh desktop / 1.5 vh mobile, then the footer in normal flow. Spec: DESIGN-BIBLE §6.14.
Status: BUILT (ch/14-sunrise agent). Typecheck clean, build passes.

## Structure (the one chapter whose section is taller than its film)

```
section#ch-sunrise.chapter.chapter--film   height: auto  (= film + footer)
├ div.film                                 film-len × 100vh
│ └ div.pin (sticky 100dvh)                .pin__layer.shadow.grade (the graded shade) +
│                                          .pin__layer.fx (the last star) + .pin__frame (all copy)
└ footer.footer                            min-height 100vh, transparent over the fixed canvas (paper wash 55% on the frame)
```

`createFilm()` is called for the class/`--film-len`/timeline, but its ScrollTrigger is killed and re-created on `.film`
so timeline positions are **film** fractions. ENGINE-API §10.2 makes the Stage derive a film chapter's `p` from
`--film-len` (the pinned travel), so `mood(p)`, `onProgress(p)` and `?chapter=sunrise&p=` all agree with this
timeline even though the footer flows inside the same section — **URL `p` == film `p`**, no remap needed.

## Beats (film p) — re-spaced for the longer film (`PACING.sunrise` 1.75 → 3.5 vh of pin travel)

One substantive beat every ~5 % of p, no gap over 8 %, nothing ever sharing a rectangle.

| p | what happens |
|---|---|
| < .06 | frame empty (seam rule) |
| .06 | eyebrow rule draws (11em) |
| .11 | eyebrow `14 — MEDITERRANEAN TOURISM FOUNDATION · MALTA · SINCE 2013` |
| .10–.35 | `mtf:sunrise { p }` dispatched — the rail's S · U · N fly to `world.sunNdc` |
| .15 | **I lived.** (`--fs-display`, masked line, yPercent 110 → 0) — settles at .22 |
| .26 / .31 / .36 / .41 | **ACT I** — storyteller L1–L4 accumulate in the band (older lines to 58 %) |
| .26–.40 | the last DOM star (top right) goes out as the sky warms |
| .28–.50 | `--dawn` 0 → 1: the graded shade and the halo behind the type deepen (the letters never change colour) |
| .46 | ACT I clears (opacity 0, −8 px) — the band empties for the couplet |
| .44 / .47 / .55 | the couplet: its centred hairline draws, then `LOVE IS NOT THE HAND THAT CLOSES.` — pause — `LOVE IS THE HAND THAT OPENS.` |
| .60 | the large gold `REGISTER →` pill on the water (left 7 %, bottom 13 %) |
| .64 / .69 / .74 / .79 | **ACT II** — L5–L8 in the same band |
| .86 | the eyebrow and ACT II leave; headline, couplet and pill hold the frozen last image |
| 1 | pin unsticks; the footer scrolls in over the mosaic still. Frame rules draw (`drawRule` + scaleY twins), head / columns / bottom row `rise()` |

The stack's last line is *And may you look back upon all of it — and say…*; the answer is the headline already on
screen (the bible lists **I LIVED.** both as the last storyteller line and as the h2 — rendered once, as the h2).

## Placement contract (no overlap at ANY p, at 1440×900 / 1920×1080 / 390×844)

```
header chrome 0–72px · rail label left 0–60px · corner labels bottom 0–60px (mobile: bottom 0–120px)
.col      left 7%   top 15%   width min(41%,36rem)   eyebrow + headline + the band
.stack    a FIXED box under the headline: ACT I and ACT II are two absolutely-positioned four-line
          blocks sharing the same rectangle, so the storyteller can never grow into anything below it
.couplet  centred on the water, top min(horizon-now + 10%, 74%) — below the band, clear of the pill in x
.pill     left 7%   bottom 13%  (mobile bottom 22%, above the fixed REGISTER pill's 120 px)
```
The band was the fault: eight accumulating lines grew ~360 px down the frame and printed the last storyteller
line straight over the couplet (the Ch 07 fault class). Two acts of four in one box makes the footprint constant.

## Contrast

The type is **cream for the whole shot**. A cream → ink cross-fade passes through a mid-grey that vanishes
against *both* the teal sky and the gold water (verified at p .41), so instead `--dawn` drives only:
`--aura` (a wide, warm-dark halo behind every line) and `.grade` — a `.pin__layer.shadow` carrying a
cinematographer's graduated shade in the top-left and bottom-left of the frame. Both rise monotonically with the
light, so the contrast curve never dips. The couplet adds a soft blurred pool of shade on the water — no plaque,
no box. `mosaic` peaks at .30 (not .48): the last image reads as laid stone, never a rug of tiles over the type.

## Mood anchors (constants: camYaw 2π · veil 3 · p4 0 · sunVisible 1 · p2 1 · fov 34 · camZ −12 · seaY −1.2)

| p | camY | camTilt | sun (y, z, r) | glow | heat | skyTop | skyBottom | sea | amp | tess | form | gold | glint | p1 | stars | bloom | warmth | mosaic |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | .7 | .05 | .1, −22, .16 | 1.2 | .15 | #071E30 | #2B5468 | #124A66 | .12 | 0 | 3 | .9 | .8 | 0 | .15 | .7 | .35 | 0 |
| .35 | 2 | .07 | −1, −18, 1.1 | 1.4 | .8 | #0F5A80 | #FF7A1A | #A67C2E | .1 | 1 | 4 | .9 | 1 | 0 | 0 | 1.1 | .8 | 0 |
| .45 | | | | | | | | | | 1 | 4 (hold) | | | 0 | | | | |
| .5 → .56 → .62 → .7 | | | | | | | | | | | 4 → 5 (by .6) | | | 0 → 1 → 1 → 0 (XI) | | | | |
| .6 | 3.2 | .07 | −.3, −18, 1.2 | 1.4 | 1 | #2B8FA3 | #FFD166 | #D9A441 | .1 | 1 | 5 | .95 | 1 | | 0 | 1.1 | 1 | 0 |
| .72 | 3.2 | | | 1.3 | 1 | #7FA9C2 | #FFD166 | #D9A441 | .1 | 1 | 5 | 1 | .9 | 0 | 0 | 1 | 1 | 0 |
| 1 | 3.2 | | | 1.2 | 1 | #A9CBDD | #F1C86A | #D9A441 | .08 | 1 | 5 | 1 | .7 | 0 | 0 | .9 | 1 | .22 |

p 0 equals Ch 13's documented p 1. Reduced motion returns the p 1 state as a still (bright dawn, mosaic .22), and
the static frame renders with `--dawn: 1` so the halo matches the light.

## Footer (all from content.json)

`foundation.descriptionCurrentSite` · logo `/brand/mtf-logo.png` 120 px with alt · THE FORUM (10 links: 7 in-page
anchors through Lenis, Hotels → `hotels.currentUrl`, Watch MTF10 → `registration.watchLastYear.currentUrl`, new tab) ·
THE FOUNDATION (Who is MTF → `#ch-ogygia`, The Mediterranean Observer → `contact.socials.items[1].url`, Press →
`mailto:info@…`) · CONTACT (`contact.emails[]`) · FOLLOW (`contact.socials.items[]`, Facebook URL kept with its real
misspelling) · bottom rule: `foundation.tagline.value` (rendered verbatim with •), `contact.copyright.value` upper-cased,
Privacy / Cookies (`href="#"`, `title="To be announced"`), `MOTION: FULL / REDUCED` (localStorage `mtf-motion`,
toggles `html.reduced-motion`, reloads — same contract as the nav overlay), `BACK TO THE BEGINNING ↑` → `scroll.scrollTo(0)`.

## Budgets / QA

- One `h2`; storyteller as `p.s`; lists `ul`; links `a`; buttons `button`; decorative SVG `aria-hidden`.
- No SplitText (the headline is one masked line); no per-frame work (`onFrame` unused; the rail's flight is event-driven).
- CSS ≈ 9.8 KB total: the film part is ≈ 3.4 KB (the graded shade and the halo tokens are the overage); the footer
  + its mobile block is ≈ 5.4 KB and is a candidate for a shared `footer.css` (hoist request).
- 16 timeline beats over p .06–.86 · 4 `.act` blocks + 1 `.grade` layer added to the DOM · no per-frame work.

## Known gaps

- The tesserae field reads as loose tiles scattered across the whole sky from p ≈ .6 (`tess` 1, `tessForm` 5,
  `tessSpread` 1) rather than as the sunrise path + disc the bible describes — that is the GL layer, not this
  chapter; the mood keyframes follow §6.14 exactly. Flagged for the tesserae agent.
- `mosaic` is held at .30 / .22 rather than the bible's .7: at .48+ the post-effect turned the last frame into a
  field of flat coloured stickers over the copy (the client's "pixelated" note). Raise it if the post agent
  softens the effect.
- The footer's 72 % paper wash stays (the bible says "transparent"; the mosaic still shows through and around it).
- The footer block (~4.1 KB) is a candidate for a shared `footer.css` — hoist request stands.

## Stills

`shots/pp-sunrise-c0.41.png` (ACT I, night type) · `pp-sunrise-e55.png` (the couplet's first line) ·
`pp-sunrise-d0.79.png` (ACT II + couplet + pill) · `pp-sunrise-d0.95.png` (the frozen last image) ·
`pp-sunrise-gm79.png` (390 × 844) · `pp-sunrise-a0.png` (p 0, empty frame — the seam).
