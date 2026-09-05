# 02 · warning — The Warning

Canto I · Stewardship · 17:40 · Emotion: GRAVITY. Film 4 vh desktop / 2.5 vh mobile. `inNav: false`. Spec: DESIGN-BIBLE §6.2.

Helios' cattle walk the horizon backlit by the last ember; six storyteller lines stack under the headline; Zeus answers (flash ×2, bolt, shake) and the whole frame becomes tesserae and falls into the sea; the Forum lands over the settling water; Ulysses is left alone; the rail's **S** fills gold.

## Files
- `index.ts` — `export const warning: Chapter` (mount, onProgress, onFrame, mood)
- `style.css` — scoped under `#ch-warning`, tokens only, < 3 KB

## DOM (inside the `.pin`)
```
.pin__layer.shadow.tess-out   .frieze (cattle()) + .frieze--mirror (reflection, masked)
.pin__frame.tess-out          .head (eyebrow rule + eyebrow + h2) · .stack (14 × p.s) · .forum (rule → label → 3 × p.f → ul.chip-row → ol.verbs → p.h2.close) · p.signoff (.chip--gold)
.pin__layer.fx                bolt(), height = horizon / .7 so the polyline's last point lands on the horizon
.pin__layer.flash             steps(2) navy flash, 120 ms × 2
```
Reduced motion: `chapter--static`, the same frame as a flowing stack, no film, mood = the chapter's end state with the Shatter assembled (`tess 1, tessForm 1, p3 0`).

## Beats (p → what happens; all on the scrubbed `tl`, ease none)
| p | beat |
|---|---|
| .06–.10 | eyebrow rule draws (11em) |
| .08 | eyebrow `02 — S · STEWARDSHIP — WHAT MUST WE PROTECT?` |
| .10–.16 | headline lines rise (SplitText masked lines) *Do not touch what belongs to the Sun.* |
| .13 / .17 / .21 / .25 / .29 / .33 | storyteller ×6 land (4 px rise); each previous line falls to 55 % |
| 0–.35 | the frieze walks (`setProgress(svg, p/.35)`; steps(4) leg cadence in the glyph) |
| .35 | *Zeus answered for Helios.* · flash ×2 · bolt strikes (60 ms) · camera shake 400 ms (`onFrame`, camX ±.04) · `.is-go` on frame + shadow |
| .35–.41 | `--go` 0→1: frame and frieze dissolve through the `.tess-out` mask (in sympathy with `mood.mosaic` 0→1) |
| .41 | the six warning lines and the frieze are removed (invisible at that instant); frieze never returns |
| .41–.47 | `--go` 1→0: the type returns over the falling field; `.is-go` off at .47 |
| .44 / .48 | *The ship breaks apart.* / *The sailors disappear.* |
| .46–.50 | Forum rule draws → .50 label `S · STEWARDSHIP` |
| .53 / .57 / .61 | Forum lines `pillars[0].lines[0,1,3]` |
| .65 / .69 / .73 | chip row (domains) · verb row `PROTECT → RESPECT → PRESERVE → ENHANCE` · closing serif `lines[2]` |
| .77 | sign-off `closingLine` as a gold chip, left 7 % bottom 14 % |
| .78–.82 | Forum + sign-off exit (opacity 0, −8 px); shatter lines collapse |
| .80–.84 | head exits |
| .80 / .82 / .84 / .86 / .87 | *Ulysses alone. / No ship. / No companions. / Only a man… / between sea and sky.* in `--fg-faint` |
| .885–.90 | everything gone (seam rule) |
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

## Dev harness note
`?chapter=warning&p=X` scrolls to `top + height · X`, but a film's real p is `(scrollY − top)/(height − vh)`, so real p = X · 4/3 on desktop (× 2.5/1.5 on mobile). Real p .5 → `p=0.375`; real .9 → `p=0.675`; mobile real .5 → `p=0.3`.

## Budgets
CSS ≈ 3.0 KB. SplitText: 2 line nodes (the headline only). `onProgress`: two `setProgress` calls + comparisons, no queries. `onFrame`: one branch, two sin/cos while the 400 ms shake runs, nothing otherwise. No allocations per frame except the `mood(p)` patch object and one RGB triple (unavoidable with the Stage's `resolveMood` contract). No `backdrop-filter`.

## Status / known gaps
- Done: full choreography, mood keyframes, Shatter (flash, bolt, shake, DOM twin dissolve), Forum block rule → label → content, gold sign-off, transition lines, `mtf:glyph` S, reduced-motion stack, mobile recomposition, typecheck + build clean.
- The frieze reflection is a CSS mirror of the glyph (masked, 20 %) — the "broken glitter" proper is the sea layer's.
- At real p .9 the world is ~89 % blended into Ch 03's `mood(0)`; while the stars chapter is still a stub that shows the default full sun, not the abyss-and-points state of §6.3.
- The scattered field at `tess .2` (p 0–.34, per the table) currently renders as large tiles all over the sky in the tesserae layer; if that stays noisy the table value may want lowering by the lead (chapter follows the bible value).
