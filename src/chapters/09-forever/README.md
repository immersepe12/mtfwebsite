# 09 · forever — Forever

Canto VIII · Net Positive · 04:50 · FEAR → CLARITY. Film length: 3 vh desktop / 2 vh mobile. `inNav: false`.
Spec: DESIGN-BIBLE §6.9. Owner files: `index.ts`, `style.css`, this README.

## What it is
Rothko's cold field — sky, sea and horizon all `--sky` — with Opałka's counter of arrivals rolling along the sea band.
The count climbs only while you scroll; it freezes on *Life matters because it ends.*, then dissolves tile-wise
(`.tess-out`, 600 ms) — the only DOM tesserae dissolve in the film. The field warms to gold in three sliding bands
(sea first, then the lower sky, then the upper sky), the Forum lands, and at p .88 the **N** fills so S·U·N reads
whole for the first time. The chapter ends on *A leaf falls.* for Ch 10's olive branch.

## Beats (p → what happens; all on the scrubbed `tl`, ease none)
| p | beat |
|---|---|
| < .06 | seam: every frame element at opacity 0; counter layer hidden |
| .06–.10 | eyebrow rule draws → eyebrow (`09 — N · NET POSITIVE — WHAT SHOULD TOURISM LEAVE BEHIND?`); counter layer surfaces |
| .10–.15 | headline lines (SplitText masked) *Leave more than we take.* |
| .14–.29 | storyteller stack A, one line per beat, previous line falls to faint: *She offered Ulysses immortality.* → *Forever together.* (6) |
| .02–.42 | `onFrame`: counter climbs at `|velocity| × 1800` per frame (velocity capped at 80 px) — it only moves while you move |
| .35 | stack A collapses (height 0) so stack B lands in its place (≤ 6 visible) |
| .36 | *But Ulysses understood what eternity had hidden from Calypso:* |
| .42 | **Life matters because it ends.** (wght 400, stays bright) · `onProgress`: counter `freeze()` |
| .46 | `dissolve()` — `.tess-out`, `--go` 0 → 1 over .6 s (reversible below .44) |
| .48 / .52 | *If tomorrow were infinite…* / *why would today be sacred?* · counter layer fades out .50–.53 |
| .53 | mobile only: head + stack exit so the one-column Forum can land at top 12 % |
| .54–.58 | Forum rule draws → label `N · NET POSITIVE` |
| .60–.71 | lead → *The ultimate measure:* → the big serif question (`--fs-h2`, caps as in the deck) → *Net Positive means:* |
| .73 | chip row (8 `means[]`, 1 px gaps) |
| .76–.85 | sub-blocks SERVICE EXCELLENCE, AI AS AN ENABLER (rule → label → line → mono caps line) |
| .85–.895 | exit: Forum + subs, then head + stack (opacity 0, y −8) — frame empty by .90 |
| .88 | `mtf:glyph { letter: 'N' }` dispatched (re-armed below .84); the rail fills N and shines all three |
| .88–.98 | *A leaf falls.* at left 7 % / top 38 % (the bible's stated seam exception for the Ch 10 hand-over) |

## Mood anchors (piecewise-linear, §6.9 table; monotonic params declared explicitly)
Constants: `camX 2 · camY 1.6 · camTilt .04 · camYaw 2π · fov 34 · sunVisible 0 · veil 3 · tessForm 1 · tess 0 · tessSpread 2 · seaSpeed .25 · p1–p3 0 · mosaic 0 · aberration 0`.
| key | anchors |
|---|---|
| camZ | 0 → 2 · .5 → −1 · .85 → −4 (slow push-in) |
| p4 (veil tear) | .1 → 1 · .2 → 0 |
| seaColor | ≤ .50 `#0F5A80` · .72 `#A67C2E` · .85 `#A67C2E` · 1 `#6E4A1E` |
| skyBottom | ≤ .56 `#0F5A80` · .80 `#D9A441` · .85 `#D9A441` · 1 `#A67C2E` |
| skyTop | ≤ .62 `#0F5A80` · .85 `#6E4A1E` · 1 `#3A2A14` |
| haze / seaAmp | .05 / .06 → .15 / .08 over .5–.85 |
| grain · vignette · bloom · warmth | .02 · .2 · .4 · .1 (≤ .5) → .05 · .3 · .6 · .9 (.85) → .06 · .35 · .5 · .7 (1) |
| stars | 0 → .1 over .85–1 |
p 1 equals Ch 10's documented p 0; p 0 equals Ch 08's p 1 (cold `--sky` field, yaw 2π, veil 3 with the tear at 1).
Reduced motion: `mood` is the p 1 still. `html.no-gl`: `--sky-top-static` (gold-deep 35 % on press) / `--sky-bottom-static` (gold-deep).

## Layout (pear.no vocabulary)
Head left 7 % / top 18 % (max 44 % so the headline breaks in two before the right column) · storyteller stack top 38 %,
width min(44 %, 26em) · counter left 7 % → right 7 % at `--horizon-now + 5 %`, `--fs-h1`, `--fg-faint`, digits spread
`space-between` · Forum right 7 % / top 24 % / width min(38 %, 34rem) · sub-blocks left 7 % / bottom 9 %, two 17rem columns.
Mobile (≤ 820): one column at 86 %; counter at `--fs-h2` / top 78 %; question at `--fs-h3`; subs stacked at bottom 4 %.
Reduced motion: `.chapter--static` flowing stack, everything visible, no film, no counter.

## Budgets
CSS 3.0 KB · SplitText: the headline only (≤ 3 line nodes) · `onFrame`: no allocations, no DOM queries (nine digit
elements cached; `roll()` writes `--d` and toggles `is-lead` only when the lead count changes) · no `backdrop-filter`.

## Status / known gaps
- Done: full choreography, mood keyframes, counter (climb · freeze · dissolve, all reversible), three-band warm-up,
  Forum rule → label → content, chips, sub-blocks, `mtf:glyph` N, transition line, mobile recomposition,
  reduced-motion stack, typecheck + build clean.
- Copy verbatim from `content.json → theme.pillars[2]` (eyebrow from `deckTitle` + `question`, headline
  `closingLine` in sentence case, Forum `lines[0..3]`, `means[]`, `subSections[]`); storyteller lines from §6.9.
- The counter starts at 0 on every mount and shows leading zeros at 30 % (art §9.8); a headless still shows zeros
  because the harness jump has no scroll velocity.
- The `.tess-out` duration is overridden to .6 s here (the art glyph's default is `--dur-8` 2.2 s).
