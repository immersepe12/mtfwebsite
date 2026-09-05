# 08 · rudder — The Hand Upon the Rudder

Canto VII · The Four · 04:10 · Emotion: RESOLVE · Film 5 vh desktop / 3 vh mobile · nav `04`.
Spec: `design/DESIGN-BIBLE.md` §6.8. Status: **BUILT** (desktop + portrait + reduced motion + no-gl sky vars).

## What it is
The camera is the compass. It yaws a full circle on the spot (soft lock at each quarter) and each cardinal bearing
holds one of the four specialist events of 27 November (`content.specialistEvents[0..3]`). A 72-tick hairline ring
(`art/compass.ts`) at the frame's centre counter-rotates with the camera; its cardinal letters are kept upright by a
chapter CSS override; the needle trembles with `shared.mouse.x`; the ticks flash gold at each lock. `EAST` / `WEST`
mono labels sit on the horizon (`--horizon-now`) at their true screen bearings, computed from `camYaw` in `onFrame`
(heading convention, N 0 → E π/2 → S π → W 3π/2 — the same one the ring turns by). The mosaic Mediterranean sinks
(tess 1 → 0, spread 1 → 2) over p 0–.15. The chapter ends on **I AM ULYSSES.** and the veil tear (`p4` 0 → 1).

## Beats (p → what happens; all on the scrubbed `tl`, ease none)
| p | beat |
|---|---|
| < .06 | seam: frame empty; veil 1.6 → 2 finishes crossing; island sinks |
| .06–.12 | eyebrow rule draws → eyebrow → headline lines (SplitText masked); ring fades/scales in, needle strokes .10–.14 |
| .11 / .125 / .14 / .155 | Storyteller A *Orion. / The Bear. / East. / West.* — each lands with the veil breath (SOFT 60 → 12, blur 6 → 0) |
| .15 | **N lock** — click of light; Beautiful Destinations panel: rules → corners → mono head → title → body (complete by .18); CTA `THE FOUR — FULL DETAILS →` at .19 |
| .27 | N panel out; headline exits (portrait also collapses its box) |
| .30 | stack A collapses; **E lock** — MED READY panel (acronym ladder); radar sweep on .29–.47 |
| .33 / .41 / .49 / .57 | Storyteller B lands (older lines fade to 55 %) |
| .44 | E panel out |
| .47 | **S lock** — AI-Powered Hospitality panel head; the six Ps orbit the ring once (.47–.54, desktop only) |
| .54–.58 | the Ps dock as the list; the S body lands (portrait: body + list at .49) |
| .62 | S panel out |
| .65 | **W lock** — The Coffee Experience panel (`POWERED BY LAVAZZA` as a mono word, no logo) |
| .80 / .81 | W panel out; CTA out |
| .82–.84 | last click (N again); eyebrow, ring, labels exit; stack B collapses |
| .85 | *And the man who arrived calling himself Nobody remembered:* |
| .87 / .885 | **I AM ULYSSES.** appears (`--fs-h1`, Fraunces roman 300); SOFT 60 → 0 in one step — no tween |
| .92–.96 | both lines breathe out (SOFT → 60, blur → 6) and leave; the tear runs (`p4` 0 → 1, veil 2.5) |

## Mood anchors (§6.8 table, piecewise-linear; monotonic keys declared explicitly)
- hold: cam (2, 1.6, 2) tilt .06 fov 36 · sunVisible 0 · stars 1 · constellation 2 · tessForm 1 · seaAmp .08 seaSpeed .3 · haze .1 · warmth .15
- `camYaw`: 0 → 2π, `yawAt(p)` = quarter-turn count + smoothstep between locks at .15 / .33 / .50 / .68 / .85 (rest ±.03 around each)
- `tess` 1 → 0 and `tessSpread` 1 → 2 over p 0–.15
- `veil` 1.6 → 2 (0–.15) · 2 → 2.5 (.85–.92) · 2.5 → 3 (.96–1, Ch 09 declares 3)
- `p4` 0 → 1 over .92–.96 · `stars` 1 → .8 (.92) → .3 (.96) → 0 · `constellation` 2 → 0 (.92–.96)
- sky/sea: press/abyss/sea → `#0F5A80` cold field over .92–.96
- p 1 = Ch 09 p 0 exactly (camTilt .04, fov 34, bloom .4, vignette .2, grain .02, warmth .1, seaAmp .06, seaSpeed .25)
- **Blend compensation:** the Stage lerps this chapter toward Ch 09's p 0 over p .62–1 (smoothstep). Left alone that
  would pull the yaw off the W lock, flood the sky cold and run the tear from p .62. `moodAt` therefore returns the value
  that *blends back* to the table (`d = w + s/(1−s)·(w − END)`, factor capped at 8); the world sees the table.
- reduced motion: `mood` = END as a still.

## Placement
Head + storyteller as one left column (`left 7%`, `top 18%`); panels `.card--frame` at `right 7%`, `top 24%`,
`min(42%, 36rem)`, `max-height 70vh` with internal scroll (`data-lenis-prevent`); CTA `left 7%`, `bottom 14%`;
ring 110 vh centred. Portrait: column `top 7%`, ring 84 vw at 33 %, panels full-width sheets `top 42%`, CTA `bottom 7.5%`,
no orbit, no EAST/WEST labels.

## Interaction
`EXPLORE →` (button, `aria-expanded`/`aria-controls`) expands the panel's full deck body in place (satellite pages TBC);
Esc closes and returns focus. Tessera glint `--mx/--my` via one delegated `pointermove`. Chapter CTA → `#ch-paradise`.

## Budgets
- SplitText: 2 lines (headline only). onFrame: no allocations, no DOM queries; writes only on change.
- CSS ≈ 5.7 KB (over the 3 KB guide — four distinct panel bodies: chips, ladder, six-Ps grid, mantras).
- No hex in CSS; art SVG strings carry their own fallbacks.

## QA (§11)
- `?chapter=rudder&p=0` empty frame over the crossing veil + sinking island ✓ · `p=.35` E panel + radar + Orion ✓ ·
  `p=.5` S head + orbiting Ps ✓ · `p=.58` six Ps docked ✓ · `p=.9` Nobody → I AM ULYSSES ✓ · 390×844 `p=.5` ✓.
- Copy verbatim from content.json / §6.8; TBCs: satellite pages → in-place expansion; Lavazza as a mono word.

## Known gaps / notes for the lead
- `gl.ts` applies `camYaw` as a Three.js Y rotation (positive = turn **left**), while the bible, the ring and this chapter
  treat yaw as a compass heading (positive = N → E → S → W, turn right). The world's stars/sea therefore pan the opposite
  way to the ring. Fix in `gl.ts`: `rotation.set(tilt, -m.camYaw …)` and mirror the sign in the horizon sample.
- The veil component still shows Ch 04's `data-veil-line` (*Kalyptein…*) while the cloth is across in this chapter.
- The Stage's fixed .62–1 blend window is what forces the compensation above; a per-chapter blend start (e.g. `.90` for
  films whose end state is a designed event) would let chapters return their raw tables.
