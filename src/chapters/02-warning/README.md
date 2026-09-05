# 02 · warning — The Warning

Canto I · Stewardship · 17:40 · Emotion: GRAVITY. Film 4 vh desktop / 2.5 vh mobile. `inNav: false`. Spec: DESIGN-BIBLE §6.2.

Helios' cattle walk the horizon backlit by the last ember; six storyteller lines stack under the headline; Zeus answers (flash ×2, bolt, shake) and the whole frame becomes tesserae and falls into the sea; the Forum lands over the settling water; Ulysses is left alone; the rail's **S** fills gold.

## Files
- `index.ts` — `export const warning: Chapter` (mount, onProgress, onFrame, mood)
- `style.css` — scoped under `#ch-warning`, tokens only, < 3 KB

## DOM (inside the `.pin`)
```
.pin__layer.shadow.tess-out   .frieze (cattle()) + .frieze--mirror (reflection, masked)
.pin__frame.tess-out          .col ( .head [eyebrow rule + eyebrow + h2] → .stack [14 × p.s] ) · .forum (rule → label → 3 × p.f → ul.chip-row → ol.verbs → p.h2.close) · p.signoff (.chip--gold)
.pin__layer.fx                bolt(), height = horizon / .7 so the polyline's last point lands on the horizon
.pin__layer.flash             steps(2) navy flash, 120 ms × 2
```
Reduced motion: `chapter--static`, the same frame as a flowing stack, no film, mood = the chapter's end state with the Shatter assembled (`tess 1, tessForm 1, p3 0`).

## Beats (p → what happens; all on the scrubbed `tl`, ease none)
Re-spaced for the lead's pacing table (`PACING.warning = 1.35` → film 5.4 vh ≈ 4,000 px of travel): ~3.3–3.5 % of p
between substantive beats (~135 px of scroll each), no gap longer than the Shatter's own 7 % of held spectacle.

| p | beat |
|---|---|
| .015–.065 | the frieze fades up out of the seam (`.shadow` 0 → 1) |
| .05–.12 | `.col` scrim fades in (soft radial of `--press`, the left column's legibility floor) |
| .06–.10 | eyebrow rule draws (11em, `--rule-strong`) |
| .10 | eyebrow `02 — S · STEWARDSHIP — WHAT MUST WE PROTECT?` |
| .13–.19 | headline lines rise (SplitText masked lines) *Do not touch what belongs to the Sun.* |
| .165 / .198 / .231 / .264 / .297 / .330 | storyteller ×6 land (4 px rise); each previous line falls to 55 % |
| 0–.35 | the frieze walks (`setProgress(svg, p/.35)`; steps(4) leg cadence in the glyph) |
| .35 | *Zeus answered for Helios.* · flash ×2 · bolt strikes (60 ms) · camera shake 400 ms (`onFrame`, camX ±.04) · `.is-go` on frame + shadow |
| .35–.41 | `--go` 0→1: frame and frieze dissolve through the `.tess-out` mask (in sympathy with `mood.mosaic` 0→1) |
| .41 | the six warning lines and the frieze are removed (invisible at that instant); frieze never returns |
| .41–.47 | `--go` 1→0: the type returns over the falling field; `.is-go` off at .47 |
| .425 / .462 | *The ship breaks apart.* / *The sailors disappear.* — both clear of the dissolve, never inside it |
| .498–.568 | `.forum` scrim fades in |
| .505–.54 | Forum rule draws → .538 label `S · STEWARDSHIP` (nothing is half-drawn at the QA still p = .5) |
| .568 / .602 / .636 | Forum lines `pillars[0].lines[0,1,3]` |
| .670 / .704 / .738 | chip row (domains) · verb row `PROTECT → RESPECT → PRESERVE → ENHANCE` · closing serif `lines[2]` |
| .765 | sign-off `closingLine` as a gold chip, left 7 % bottom 12 % — it now holds for 3.7 % of p before the exit |
| .762–.779 | shatter lines fade out, then their slots collapse (so the next line lands without a jump) |
| .786 / .814 / .844 / .872 (+.882 as one beat) | *Ulysses alone. / No ship. / No companions. / Only a man… between sea and sky.* in `--fg-faint` |
| .802–.847 | Forum + sign-off exit (opacity 0, −8 px) |
| .820–.865 | head exits |
| .888–.90 | the last lines and the column scrim are gone (seam rule) |
| .92 | `mtf:glyph { letter: 'S' }` dispatched on `document`; re-armed when p < .88 |

## Mood anchors (piecewise-linear; §6.2 table, with the shatter hold sharpened)
| p | camX | camY | camTilt | sunY | sunGlow | sunHeat | skyBottom | seaAmp | seaSpeed | tess | tessForm | tessSpread | p3 | mosaic | aberration | stars | bloom | warmth |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 0 | .6 | .05 | −1.9 | .55 | 1 | #3A1A14 | .14 | .35 | .2 | 0 | 1 | 0 | 0 | 0 | .35 | .7 | .55 |
| .34 | .3 | .6 | .05 | −2.0 | .4 | 1 | #2A1410 | .18 | .4 | .2 | 0 | 1 | 0 | 0 | 0 | .4 | .7 | .5 |
| .36 | | | | | | | | | | | | | | | .9 | | | |
| .38 | .3 | .55 | .05 | −2.0 | .2 | 1 | #0E3D57 | .6 | 1.2 | 1 | 1 | 1 | 0 | (.39: 1) | .9 | .2 | .9 | .3 |
| .40 | | | | | | | | | | 1 | | 1 | 0 | 1 (.41) | | | | |
| .46 | .4 | .5 | .04 | −2.2 | 0 | 1 | #06192B | .45 | .9 | .1 | 1 | 5 | 1 | 0 | .1 | .3 | .6 | .25 |
| 1 | .6 | .5 | .04 | −2.4 | 0 | 0 | #06192B | .2 | .5 | 0 | 1 | 8 | 1 | 0 | 0 | .55 | .5 | .2 |

Constant: `camZ 7 · fov 34 · veil 0 · camYaw 0 · p4 0` (declared explicitly every frame). `skyTop`, `seaColor`, `haze` etc. stay at `DEFAULT_MOOD`. `html.no-gl`: `--sky-top-static: var(--press)`, `--sky-bottom-static: var(--abyss)` on the pin.

## Layout contract (why nothing can overlap)
Two absolutely-positioned columns that never share horizontal space, each laying its own blocks out in **flow**:
- `.col` — `left 7% · top 20% · width 42%`, holding `.head` then `.stack`. Because the storyteller stack is a
  flow sibling of the head, a headline that wraps to three lines (≈ 1000–1300 px viewports) pushes the stack
  down instead of printing on top of it — the fault class in `shots/ch07-0.35.png`.
- `.forum` — `right 7% · width min(36%, 32rem)`, so its left edge is at 57 % and the columns are ~115 px apart
  at 1440. `.signoff` sits at `left 7% · bottom 12%`, clear of the bottom corner labels.
- `@media (max-height:840px)` pulls both columns up and tightens the storyteller leading so six lines can never
  reach the sign-off on a short desktop.
- Portrait: one column at `left 11%`, forum at `top 43%`, sign-off at `bottom 19%` — above the corner labels
  *and* the bottom-centre REGISTER pill (~120 px).
- Legibility: each column carries a feathered radial scrim of `--press` on a `::before` (`z-index:-1`, opacity
  driven by a `--scrim` custom property tweened on `tl`), so the copy holds over the ember, the mosaic pass and
  the sea without a box ever being visible. Forum body copy and the closing serif carry a soft `--press` halo.

## Dev harness note
`?chapter=warning&p=X` is the film's own p (lead amendment §10.2 — `stage.travelOf`), so URL p == timeline p.

## Budgets
CSS ≈ 3.0 KB. SplitText: 2 line nodes (the headline only). `onProgress`: two `setProgress` calls + comparisons, no queries. `onFrame`: one branch, two sin/cos while the 400 ms shake runs, nothing otherwise. No allocations per frame except the `mood(p)` patch object and one RGB triple (unavoidable with the Stage's `resolveMood` contract). No `backdrop-filter`.

## Status / known gaps
- Done: full choreography, mood keyframes, Shatter (flash, bolt, shake, DOM twin dissolve), Forum block rule → label → content, gold sign-off, transition lines, `mtf:glyph` S, reduced-motion stack, mobile recomposition, typecheck + build clean.
- Quality pass: no overlap at any p at 1440×900 / 390×844 (columns flow, short-viewport media query); the sign-off used to appear at .77 and be faded out at .78 — it now holds; both columns have scrims; beats re-spaced for the longer film.
- The five *Ulysses alone* lines are the one genuinely dense run: the bible gives them p .80–.90, which at the tuned length is ~80 px per line. They start at .786 and the last two ("Only a man… / between sea and sky.") land as one beat, giving ~120 px per beat.
- The frieze reflection is a CSS mirror of the glyph (masked, 20 %) — the "broken glitter" proper is the sea layer's.
- At real p .9 the world is ~89 % blended into Ch 03's `mood(0)`; while the stars chapter is still a stub that shows the default full sun, not the abyss-and-points state of §6.3.
- The scattered field at `tess .2` (p 0–.34, per the table) currently renders as large tiles all over the sky in the tesserae layer; if that stays noisy the table value may want lowering by the lead (chapter follows the bible value).
