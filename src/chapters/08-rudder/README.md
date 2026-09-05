# 08 · rudder — The Hand Upon the Rudder

Canto VII · The Four · 04:10 · Emotion: RESOLVE · Film 5 vh desktop / 3 vh mobile (× `PACING.rudder` 1.5) · nav `04`.
Spec: `design/DESIGN-BIBLE.md` §6.8. Status: **BUILT** (desktop + portrait + reduced motion + no-gl sky vars).

## What it is
The camera is the compass. It yaws a full circle on the spot with a long rest at each quarter, and each cardinal
bearing holds one of the four specialist events of 27 November (`content.specialistEvents[0..3]`). A 72-tick rose
(`art/compass.ts`) sits in the corridor between the two type lanes and counter-rotates with the camera; its cardinal
letters are kept upright by a chapter CSS override; the needle trembles with `shared.mouse.x`; the ticks flash gold
at each lock. `EAST` / `WEST` mono labels glide along the free band *under* the rose at their true screen bearings,
computed from `camYaw` in `onFrame`. The mosaic Mediterranean sinks (tess 1 → 0, spread 1 → 2) over p 0–.15.
The chapter ends on **I AM ULYSSES.** and the veil tear (`p4` 0 → 1) over an empty frame.

**The instrument (quality pass).** The rose is no longer a dashed circle. Three concentric surfaces are drawn in CSS
straight off the glyph's 1000-unit box — a glass dial at r 150 (30 % of the box: a two-stop radial with a lit upper
rim, an inner sea-light bounce and a cast shadow), a hairline dial ring at r 180 where the ticks begin, and a
machined bezel at r 204 where they end — and every sixth tick (the 30° stations) is struck in `--gold-leaf`.
It reads as an object with depth rather than a flat sticker over the sea.

## Placement — three disjoint lanes (this is what guarantees no overlap)
All four numbers live at the top of `style.css`; every block is derived from them, so no two blocks can meet:

| lane | span | holds |
|---|---|---|
| left | `--x` (`max(6.5%, 4.5rem)`) → `+ --colw` (`min(30%, 25rem)`) | eyebrow, storyteller stack (`top 54%`), sign-off CTA (`bottom 10%`) |
| head band | `--x` → `+ --headw` (`min(52%, 46rem)`), `top 10%` | the headline only — it lives **above** the rose and leaves at p .295 |
| corridor | whatever the two lanes leave (`--corr`) | the rose: `--ringd = min(--corr − 2rem, 34vh)`, centred at `--ringcy 68%` |
| right | `--panw` (`min(34%, 31rem)`) flush `--x` from the right, `top 19%`, `max-height 68vh` | one bearing panel at a time |

The two sign-off lines (`.s--c`, `.ulysses`) are absolutely placed at `top 34% / 45%` in their own wide boxes — by
p .80 the frame is otherwise empty, so **I AM ULYSSES.** gets `--fs-h1` on one line instead of wrapping in the lane.
The `EAST`/`WEST` labels are positioned entirely from `onFrame` (x = true bearing, y = the rose's drawn bottom + 22 px,
clamped above the corner labels) and fade out below 30 % of the width so they never reach the CTA or the rail.
Portrait: one flowing column at `top 10%`; `--x` is `max(9%, 2.25rem)` so the column clears the rail's glyph
strip (which runs to ≈ 24 px in portrait) by a full gutter; the rose is 56 vw at `--ringcy 47%` and dimmed to .6
behind the column; the panel is a bottom sheet `top 40% → bottom 18%` with a 2.4 rem dissolve at its foot and
`overscroll-behavior: contain`; CTA `bottom 12%` (clear of the corner labels at ≈ 768 px and the REGISTER pill).

## Beats (p → what happens; all on the scrubbed `tl`, ease none)
Re-spaced for the longer film (`pacing.ts` × 1.5 → ≈ 5 850 px of travel at 900 px; 1 % of p ≈ 59 px). **Every
storyteller line is now ≥ 4 % of p (≈ 235 px) from its neighbour**, the longest stretch with nothing happening is
7 % of p, and the frame is empty for p < .05 and p > .90.

| p | beat |
|---|---|
| < .05 | seam: frame empty; veil 1.6 → 2 finishes crossing; the island sinks |
| .05 / .085 / .125 | eyebrow rule draws → eyebrow → headline lines (SplitText masked) |
| .16 / .185 / .21 | the rose rises in the corridor (halo + scale) · the needle strokes in · the sweeping labels |
| .175 | **N lock** — Beautiful Destinations: rules → mono → corners → title → body (complete .215) |
| .19 / .23 / .27 / .31 | Storyteller A *Orion. / The Bear. / East. / West.* (SOFT 60 → 12, blur 6 → 0) |
| .245 / .265 | chapter CTA in · N panel out |
| .295 / .33 | the headline exits and its band collapses; `sA` collapses at .345 |
| .335 | **E lock** — MED READY (acronym ladder); radar sweep on the rose .33–.425 |
| .365 / .42 / .48 / .535 | Storyteller B lands (older lines fade to 50 %) |
| .415 | E panel out |
| .455 | **S lock** — AI-Powered Hospitality panel, complete by .495 |
| .495–.545 | the six Ps **light one by one** at their six stations inside the ticks, under `blueprint.sixPsLead` |
| .555 | they draw into the pivot (scale → .12) |
| .565 / .573 | they **dock**: `.ps-dock` opens from `height 0` (no reserved empty slot) and the six rows stagger in |
| .635 | S panel out |
| .675 | **W lock** — The Coffee Experience (`POWERED BY LAVAZZA` as a mono word, no logo) |
| .745 / .765 | CTA out; W panel out |
| .772 / .775–.79 | farewell click; eyebrow, rose, halo and labels leave; stack B collapses |
| .805 | *And the man who arrived calling himself Nobody remembered:* |
| .845 / .855 | **I AM ULYSSES.** (`--fs-h1`, Fraunces roman 300); SOFT 60 → 0 in one step — no tween |
| .878–.898 | both lines breathe out (SOFT → 60, blur → 6) — **frame empty by .90** |
| .92–.96 | the tear runs (`p4` 0 → 1, veil 2.5) over an empty frame — a pure world event |

**Nothing spins.** The six Ps used to make a full revolution of the ring in .06 of p — a small, fast circle fighting
the one thing that is meant to be turning in this chapter (the camera). They now light in sequence at their six
stations, hold, and contract into the pivot as the docked list opens.

## Mood anchors (§6.8 table, piecewise-linear; monotonic keys declared explicitly)
- hold: cam (2, 1.6, 2) tilt .06 fov 36 · sunVisible 0 · stars 1 · constellation 2 · tessForm 1 · seaAmp .08 seaSpeed .3 · haze .1 · warmth .15
- `camYaw`: 0 → 2π, `yawAt(p)` = quarter-turn count + smoothstep between locks at **.20 / .36 / .52 / .70 / .86**
  (rest ±.045 → the rose *holds* for ~9 % of p at each bearing and each 90° swing takes ~7 % ≈ 400 px of scroll)
- `tess` 1 → 0 and `tessSpread` 1 → 2 over p 0–.15
- `veil` 1.6 → 2 (0–.15) · 2 → 2.5 (.85–.92) · 2.5 → 3 (.96–1, Ch 09 declares 3)
- `p4` 0 → 1 over .92–.96 · `stars` 1 → .8 (.92) → .3 (.96) → 0 · `constellation` 2 → 0 (.92–.96)
- sky/sea: press/abyss/sea → `#0F5A80` cold field over .92–.96
- p 1 = Ch 09 p 0 exactly (camTilt .04, fov 34, bloom .4, vignette .2, grain .02, warmth .1, seaAmp .06, seaSpeed .25)
- `mood(p)` returns the §6.8 table **as-is**; the Stage owns the seam blend (no compensation in the chapter).
- reduced motion: `mood` = END as a still.

## Legibility
Panels carry a two-stop scrim (`--press` 90 % → `--abyss` 84 %) plus a deep soft shadow, so Forum copy holds against
stars, constellation lines and the sea. Every Storyteller line (`.stack .s`, `.s--c`, `.ulysses`) carries a soft
`--press` halo so it holds over the bright sea band and the constellation lines. The rose gets a `--sea-light` halo
and a `--press` drop-shadow; in portrait it is dimmed to .6 so it can never fight the column it sits behind. The
sweeping labels carry a `--press` text-shadow. No `backdrop-filter` inside the pin.

## Interaction
`EXPLORE →` (button, `aria-expanded`/`aria-controls`) expands the panel's full deck body in place (satellite pages TBC);
Esc closes and returns focus. In portrait the AI deck's six Ps are moved into that panel's disclosure at mount, so the
sheet holds its whole visible body without truncation and no copy is lost. The Coffee panel has no `EXPLORE` — its deck
holds nothing beyond the body, and an empty disclosure would be a lie. Tessera glint `--mx/--my` via one delegated
`pointermove`. Chapter CTA → `#ch-paradise`.

## Budgets
- SplitText: 2 lines (headline only). `onFrame`: no allocations; one cached measure per viewport change; writes only on change.
- CSS 12.4 KB source / ≈ 7.6 KB minified (over the 3 KB guide — four distinct panel bodies, the dial's
  three surfaces and a full portrait recomposition). Worth hoisting if another chapter needs the card decks.
- No hex in CSS; art SVG strings carry their own fallbacks.

## QA (§11)
- A geometry probe scrubs p in ~3 % steps at 1440×900 and 390×844 and asserts no box-to-box overlap and no collision
  with the header (75 px), the rail strip, the corner labels, the mobile REGISTER pill, or the viewport edges. Clean.
- `?chapter=rudder&p=0` empty frame over the crossing veil + sinking island ✓ · `p=.25` N panel + headline + rose ✓ ·
  `p=.53` S panel + the six Ps lit ✓ · `p=.75` W panel composed ✓ · `p=.85` **I AM ULYSSES.** alone ✓ · 390×844 ✓.
- Copy verbatim from content.json / §6.8; TBCs: satellite pages → in-place expansion; Lavazza as a mono word.

## Known gaps / notes for the lead
- `gl.ts` applies `camYaw` as a Three.js Y rotation (positive = turn **left**), while the bible, the rose and this
  chapter treat yaw as a compass heading (positive = N → E → S → W). The world's stars/sea therefore pan the opposite
  way to the rose. Fix in `gl.ts`: `rotation.set(tilt, -m.camYaw …)` and mirror the sign in the horizon sample.
- The veil component still shows Ch 04's `data-veil-line` (*Kalyptein…*) while the cloth is across in this chapter.
- Two deliberate deviations from §6.8, both taken to kill overlap: (a) the six Ps light at stations inside the ticks
  rather than orbiting as six mono chips — six 15-character chips cannot circle inside the corridor without printing
  on the storyteller lane; the words all arrive intact in the docked list (portrait: behind `EXPLORE →`).
  (b) `EAST` / `WEST` sweep the band **under** the rose rather than exactly on `--horizon-now`, which runs straight
  through the panel and the storyteller stack.
- The bible's §6.8 choreography puts **I AM ULYSSES.** at p .85–.92 and the exit at .92–.96, which breaks the §5.3 /
  §11.2 seam rule (frame empty for p > .90). This build follows the seam rule and lands the line at .845–.898.
- The yaw locks are .20/.36/.52/.70/.86 (not .15/.33/.50/.68/.85) so each panel is fully composed at the lock's
  centre and the headline never shares the frame with a panel. `camYaw` at p 1 is still exactly 2π (§11.2 holds).
- `--fs-h1` on `.ulysses` needs ≈ 560 px at 1440; below ≈ 1180 px wide the line wraps to two lines inside its
  `min(64%, 50rem)` box, which is still clean but loses the single-breath snap.
