# 06 · paradise — Paradise

Canto V · Three Days · the clock stops (`— · STAY TODAY`). Emotion: JOY. The film's **single daylight chapter**.
Film length: 4.5 vh desktop / 3 vh mobile. `navIndex 02`, in nav. Spec: DESIGN-BIBLE §6.6.

## What it does
The programme at a glance, staged as three sunrises. The world inverts to paper over 12% of scroll, the sun crosses the
sky three times (one arc per 20% of p from .2 to .8) and each sunrise brings one opus-sectile day-column up from the
water; the mini Disc above each column flips its tiles to write `25` / `26` / `27` and flips back to gold. `html.theme-paper`
is toggled by this chapter only (added once p ≥ .1 so the chrome follows the sky, removed in `onLeave` both directions).

## Beats (p → what happens)
| p | beat |
|---|---|
| .06–.18 | the inversion: sky, sea and island go to paper/stone (`linear`); island silhouette (`--sand`) fades in .08–.18 |
| .06–.16 | eyebrow rule draws → eyebrow (two deliberate lines) → *Stay today.* (line-mask rise) |
| .12–.27 | storyteller stack I, one line per beat: *And then… they were happy.* → *The Mediterranean.* (10 lines) |
| .24–.30 | **DAY 01** column settles up; Disc writes `25` at .27, clears at .34; rule draws .30, summary follows .325 |
| .37 / .40 | *Stay today.* / *Tomorrow came.* |
| .43–.49 | **DAY 02** column; Disc `26` at .46; rule .49; summary .515 |
| .56 / .59 | *Stay today.* / *Again.* |
| .63–.69 | **DAY 03** column (plenary + *Followed by four specialist events:* sub-list + `→ THE FOUR` to `#ch-rudder`); Disc `27` at .66 |
| .76 | *And again.* |
| .78 / .80 / .82 | *Calypso was happy.* / *The island that had always been paradise…* / *was no longer lonely.* |
| .80 | sign-off: *Times and venues to be announced.* + `FULL PROGRAMME →` pill (→ `#ch-eleven` until `/programme` exists) |
| .84 | *And time passed.* (last beat) |
| .865–.895 | everything exits (opacity → 0, y → −8); the third sunset does not stop |

Storyteller stack: at most 6 lines visible (3 on portrait); line *i* turns line *i−2* to `--fg-faint` and collapses line *i−6*.
Mobile: the three columns share one slot and replace each other with their sunrise; the Disc sits in the column head row.

## Mood anchors (§6.6 table, piecewise-linear)
- Held: `camX 2 · camZ 2 · camYaw .1 · fov 34 · veil 1 · p4 0 · tess 1 · tessForm 1 · sunRadius .5 · sunHeat 1`
- `camY` 1.4 → 1.8 (.2) → 2.4 (.32) · `camTilt` −.06 → −.04 (.2)
- Sky/sea: #124A66/#2B8FA3/#0E3D57 (.06) → #A9CBDD/#F3EEE3/#D6C39C (.18, held to .8) → #7FA9C2/#E8DCC2/#B9A77E (1)
- Sun: (−2.8, −1.6) at 0 → (−2.8, −.6) at .2; three arcs `x −2.8 → 5.2`, `y −.6 + 4·sin(πt)` (5.8 on portrait); (5.2, −.6) from .8
- `sunGlow` .6 → 1 (.2–.8) → .8 · `haze` .3 → .4 → .35 · `seaAmp` .12 → .08 → .1 · `tessGold` .6 → .2 → .3 · `tessGlint` .7 → .4
- `stars` .3 → 0 (.18) · `grain` .06 → .03 → .04 · `warmth` .45 → 1 → .85 · `bloom` .5 → .4 → .45
- Reduced motion: the p 1 state as a still (`STILL`).

Decision: the bible's ±4 arc is centred on the *view* centre (camX 2, camYaw .1 → x ≈ 1.2 at the sun's depth), i.e.
`sunX −2.8 → 5.2`, so each day rises at the left edge and sets at the right. `camX 2` is declared for continuity with 05 → 07
(the §6.6 table has no camX column).

## Budgets
- CSS ≈ 3.8 KB minified-by-hand (over the 3 KB guide by the mobile + static rules; no hex, all `#ch-paradise`-scoped).
- No SplitText (the headline uses a single hand-made line mask); no `onFrame` work; no per-frame DOM queries.
- DOM: 19 storyteller `<p>`, 3 `<article>` columns (17 list items), 3 Discs (≈ 290 `<g>` each — the art glyph's own cost).

## Status / known gaps
- Copy verbatim from §6.6 and `content.json → programme.*`; TBC honesty line rendered; no invented facts.
- Seam rule holds: frame empty for p < .06 and p > .90.
- Ch 07's stub declares `veil: 0` / default sky, so the .62–1 blend currently pulls the cloth across and the world dark at p .9;
  resolves when Ch 07 declares `veil 1` and its p 0 mood. Verified with `&mood=veil:1`.
- The dev harness (`?p=`) scrolls by section height, not pinned travel: film p = url p × 4.5 / 3.5 (× 3 / 2 on mobile).
