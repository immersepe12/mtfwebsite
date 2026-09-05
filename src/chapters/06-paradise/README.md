# 06 · paradise — Paradise

Canto V · Three Days · the clock stops (`— · STAY TODAY`). Emotion: JOY. The film's **single daylight chapter**.
Film length: 4.5 vh desktop / 3 vh mobile (`src/engine/pacing.ts` × 1.1 → ≈ 3,555 px of travel at 900 px).
`navIndex 02`, in nav. Spec: DESIGN-BIBLE §6.6, placement §4.2, reveals §5.3–5.4.

## What it does
The programme at a glance, staged as three sunrises. The world inverts to paper over 12% of scroll, the sun crosses the
sky three times and each pass brings one opus-sectile day-column up out of the water; the mini Disc above each column
flips its tiles to write `25` / `26` / `27` and flips back to gold. `html.theme-paper` is toggled by this chapter only
(added once p ≥ .1 so the chrome follows the sky, removed in `onLeave` in both directions).

## Composition (1440 × 900 measured; verified with a geometry probe at 1440×900 and 390×844)
| block | box | clearance |
|---|---|---|
| head (eyebrow + *Stay today.*) | 101,113 → 533,235 | header ends 72 · rail ends 62 |
| storyteller stack | 101,297 → 468,≤ 580 | 14 px right of the slab, 65 px above the sign-off |
| programme slab (3 panels, 1 px grout) | 547,275 → 1354,720 | 120 px above the corner-label band |
| sign-off (note + `FULL PROGRAMME →`) | 101,717 → 298,779 | 61 px above the corner-label band |

Nothing overlaps at any p, nothing runs under the header, the rail label, the corner labels or (portrait) the bottom
`REGISTER` pill, and nothing leaves the viewport. Portrait: the three columns share one slot and replace each other
with their sunrise, the third steps aside at .782 so the closing stack and the sign-off own the frame.

**Legibility.** Every free-standing line (eyebrow, headline, storyteller, honesty note) carries a paper halo
(`text-shadow`, `--halo`) so ink holds over sun glare, sea glitter and the gold mosaic. The day panels are opaque
sunlit stone: a warm face gradient, a lit top edge, a hairline frame and a cast shadow that lifts the slab off the
water — the sun passes *behind* them. No block is ever left at a low opacity while it is the beat: a column's stone
face reaches full opacity in .018 of p and only the slide continues.

## Beats (p → what happens) — one substantive beat per ≈ 3.7% of p, no dead gap > 12%
| p | beat |
|---|---|
| .06–.18 | the inversion: sky, sea and island go to paper/stone (`linear`); island silhouette (`--sand`) fades in .09–.20 |
| .060 / .088 / .115 | eyebrow rule draws → eyebrow → *Stay today.* (line-mask rise) |
| .155 / .192 | *And then… they were happy.* / *Do not rush past that.* |
| .229 / .266 | *Morning over Ramla.* + *Red earth.* / *Thyme upon the wind.* + *Olive leaves turning silver.* |
| .303 / .340 | *Salt. Wine. Music.* / *The Mediterranean.* |
| .378 | **DAY 01** rises (Disc writes `25` at .406, clears .476; rule .433; summary .446) |
| .500 | *Stay today.* / *Tomorrow came.* |
| .538 | **DAY 02** (Disc `26` .566 → .636; rule .593; summary .606) |
| .660 | *Stay today.* / *Again.* |
| .698 | **DAY 03** — plenary + *Followed by four specialist events:* + `→ THE FOUR` (Disc `27` .726 → .796; rule .753; summary .766) |
| .800 / .833 / .862 | *And again.* + *Calypso was happy.* / *The island…* + *was no longer lonely.* / *And time passed.* |
| .818 | sign-off: *Times and venues to be announced.* + `FULL PROGRAMME →` (→ `#ch-eleven` until `/programme` exists) |
| .876–.900 | everything exits; the third sunset does not stop |

The storyteller is staged as **stanzas**, not one line per beat: 3 stanzas held on screen (2 on portrait), the previous
stanza goes `--fg-faint`, the WIN-th back fades and only then collapses (no squashed remnants under the new line).

## Mood anchors (§6.6 table, piecewise-linear)
- Held: `camX 2 · camZ 2 · camYaw .1 · fov 34 · veil 1 · p4 0 · tess 1 · tessForm 1 · sunRadius .5 · sunHeat 1`
- `camY` 1.4 → 1.8 (.2) → 2.4 (.34) · `camTilt` −.06 → −.04 (.2)
- Sky/sea: #124A66/#2B8FA3/#0E3D57 (.06) → #A9CBDD/#F3EEE3/#D6C39C (.18, held to .8) → #7FA9C2/#E8DCC2/#B9A77E (1)
- Sun: parked at (−1.4, −2.6 → −.6) to p .30, then three arcs over **[.30–.50] [.50–.66] [.66–.84]**,
  `x −1.4 → 5.6`, `y −.6 + 4.2·sin(πt)` (5.8 on portrait); (5.6, −.6) from .84 and it keeps going into Ch 07
- `sunGlow` .6 → 1 (.2–.8) → .8 · `haze` .3 → .4 → .35 · `seaAmp` .12 → .08 → .1 · `tessGold` .6 → .2 → .3 · `tessGlint` .7 → .4
- `stars` .3 → 0 (.18) · `grain` .06 → .03 → .04 · `warmth` .45 → 1 → .85 · `bloom` .5 → .4 → .45
- Reduced motion: high noon on paper as a still (`STILL`).

Decisions: the ±4 arc of §6.6 is re-centred and re-phased so (a) each day's column arrives on a **climbing** sun
(t ≈ .21–.39 of its arc) and (b) the low limbs rise *between* the storyteller and the slab and set past the slab's
right edge, so no line of copy is ever inside the glare. `camX 2` is declared for continuity with 05 → 07 (§6.6 has no
camX column). The three arcs sit at .30–.84 rather than .20–.80 because the longer film gives the first sunrise room.

## Budgets
- CSS ≈ 4.1 KB (over the 3 KB guide by the mobile + static + panel-depth rules; no hex, all `#ch-paradise`-scoped).
- One `@property --pd-old` registration (typed number so the storyteller's fade to faint interpolates).
- No SplitText (the headline uses a single hand-made line mask); no `onFrame` work; no per-frame DOM queries.
- DOM: 19 storyteller `<p>`, 3 `<article>` columns (17 list items), 3 Discs (≈ 290 `<g>` each — the art glyph's cost).

## Status / known gaps
- Copy verbatim from §6.6 and `content.json → programme.*`; TBC honesty line rendered; no invented facts.
- Seam rule holds: frame content is at opacity 0 for p < .06 and p > .90 (probed at .05, .90, .95).
- DAY 03's four specialist events are set at `--fs-fine` as an indented sub-list so the slab clears the corner-label
  band at 900 px height; at 1080 px there is 180 px of extra air.
- Ch 07 must declare `veil 1` at its p 0 or the .62–1 blend pulls the cloth across this chapter's tail.
