# 03 · stars — A Sky Full of Stars

Canto II · LOST → HOPE · Why now · clock 21:10. Film length 4 vh desktop / 2.5 vh mobile. `inNav: false`.
Spec: `design/DESIGN-BIBLE.md` §6.3. Owner files: `index.ts`, `style.css`, this README.

## What it is
The "Why now?" slide staged as a sailor losing sight of land. The eleven forces (`whyNow.forces`) are eleven stars on the
logo's Mediterranean outline (`src/art/constellations.ts → constellation()`, injected into `.pin__layer.fx`), their labels a real
`<ol class="stars__forces">` positioned in % over the SVG (so the list is accessible DOM text, not `<text>` in an aria-hidden SVG).
Hairlines draw between the stars with `stroke-dashoffset`; the old question is struck through by a drawing hairline; the Malta star
(anchor 10) swells gold and the world's star billboard takes over at the same screen position.

Layout (desktop) — the constellation fills the frame's centre 70 %, so the type lives in the free corners and in time:
- head (eyebrow rule → chip, `h2` at left 7 % / top 24 %) + storyteller stack A at left 7 % / top 42 % while the sky is still dark;
- statement `[F]` top-right (right 7 %, top 8 %, `min(38%, 34rem)`) — clear of edge 3→4 by ~60 px at 1440 × 900;
- the two questions bottom-left (left 7 %, bottom 12 %) — clear of Gibraltar/Cap Bon and the 10→0 hairline;
- storyteller stack B returns to the left column once the sky has dimmed to 40 %;
- `NINE NIGHTS ↓` mono hint bottom-right; the last two beats (*On the tenth dawn… / the star touched the earth.*) in the stack position.

## Beats (p = film progress; all tweens on the scrubbed `tl`, ease none)
| p | beat |
|---|---|
| .06–.09 | eyebrow rule draws (scaleX) |
| .09–.11 | eyebrow chip `03 — WHY NOW — TOURISM IS BEING RESHAPED BY FORCES FAR BEYOND TOURISM` |
| .11–.15 | `h2` *Where do I go from here?* — SplitText masked lines (split after `document.fonts.ready`) |
| .16–.28 | stack A, one line per .02 (4 px rise; previous line → 55 %; max 6 visible) |
| .30–.33 | `h2` + stack A exit (the sailor looks up) |
| .30–.56 | star *i* lights at .30 + .026 *i*; its label follows at +.01; edge *i* draws over the next .026 (the hairline reaches the next star before its label) |
| .34–.42 | statement block, top-right: rule → label `WHY NOW?` → `[F]` |
| .44–.61 | questions block, bottom-left: rule → *The question is no longer:* → old question → strike draws (.51–.545) → old dims → *It is:* → new question (masked lines) |
| .58 | spear beyond Malta draws |
| .58–.64 | Malta DOM star scales ×2.6 and fades out while `sunVisible` 0→1 (`sunRadius .18`, `sunGlow 1.4`) at the anchor; other stars, labels and edges dim to 40 / 40 / 50 % |
| .63–.78 | stack B (.65–.77 on mobile), one line per .025; *A SKY FULL OF STARS.* set roman, cream |
| .70 (.61 mobile) | questions exit |
| .805 | stack B exits |
| .82 | `NINE NIGHTS ↓` |
| .83 / .855 | *On the tenth dawn…* / *the star touched the earth.* |
| .85–.94 | `mtf:night { night: 1…9 }` dispatched from `onProgress` (one per .01); reset to 0 at p ≥ .96, on leave, or scrolling back |
| .86–.90 | fx layer, statement, eyebrow, hint, stack C exit — the frame is empty by .90 (seam rule) |

## Mood anchors (`mood(p)`, piecewise-linear; colours linear)
| p | camX | camY | camTilt | fov | sun (x, y, z) | r | glow | visible | skyTop | stars | constellation | bloom | warmth |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 0 | .5 | .04 | 34 | 0, −2.4, −6 | 1 | 0 | 0 | #06192B | .8 | 0 | .5 | .2 |
| .25 | 0 | .9 | **.43** (ref) | **42** (ref) | 0, 2, −8 | .1 | 0 | 0 | #090D16 | 1 | 0 (from .28) | .5 | .15 |
| .5–.85 | 0 | 1.1 (from .6) | .43 | 42 | Malta anchor (≈ 2.35, 7.0, −8 at 16:10) | .1→.18 (.58–.64) | 0→1.4 | 0→1 (.58–.64) | #090D16 | 1 | 1 (at .6) | .7 | .15 |
| 1 | 1.2 | 1.1 | .30 | 40 | 1.2, .9, −8 | .2 | 1.6 | 1 | #090D16 | .7 | 1 | .7 | .15 |

Always declared: `veil 0 · camYaw 0 · p4 0 · tessForm 0 · tess 0 · tessSpread 12 · p1–p3 0 · mosaic 0 · camZ 7 · skyBottom #06192B · haze .15→.1 · starDrift .2→.1 · sunHeat 0`.
The tilt/fov from p .25 are `STARS_REF` from `src/gl/layers/stars.ts` (bible: .42/.44 and 40/42) so the GL set-1 constellation coincides with the DOM anchors. Mobile tilt = `STARS_REF.tiltMobile` (.34).
The Malta anchor's NDC is recomputed from the same fit as `constellation()` at mount and on resize; the sun's world position is the point on z = −8 along that NDC ray for the reference camera (`anchorWorld()`), so the GL star appears exactly where the DOM star faded.
Reduced motion: `mood` returns the p .62 still (constellation lit, Malta star burning).

## Reduced motion
`chapter--static`: the same DOM as a flowing stack (eyebrow, h2, stack A, statement, the 2:1 sky plate with all edges drawn and labels visible, questions, stack B, stack C, hint). No film, no timeline, no listeners.

## Budgets
CSS 2.9 KB (≤ 3 KB). SplitText: 2 elements (h2 + new question) ≈ 6 line nodes. No `onFrame`; `onProgress` does one comparison and dispatches only on change. No per-frame allocations (mood reuses one RGB triple and one sun-position object). No `backdrop-filter`.

## QA (`scripts/shot.mjs`)
Note: the dev harness's `p` is `top + height × p` (a fraction of the whole section), so film p = harness × 4/3 on desktop and × 5/3 on mobile.
Stills: `shots/stars-02.png` (film .2), `stars-05.png` (film .5), `stars-09.png` (film .9, frame empty — seam), `stars-05-m.png` (390 × 844, film .5).
`npm run typecheck` clean, `npm run build` passes, no console errors.

## Known gaps / deviations
- The new question is Fraunces 300 at `clamp(1.5rem, 2.2vw, 2rem)` (between `--fs-h3` and `--fs-h2`), not `--fs-h2`: at `--fs-h2` the caps line runs 5–6 lines and cannot sit in any corner without crossing the constellation (it would sit on the Gibraltar star).
- The GL stars layer's set 1 currently fits the outline into the full centre-70 % box without keeping `MED_ASPECT`, so at 16:10 its gold lines are taller than the DOM constellation (top vertex at 15 % vs 22 %) and on mobile they are far larger — the DOM follows `constellation()` (aspect kept), as the bible specifies. Reported to the lead / stars agent.
- The rail's `mtf:night` handler lights ticks 01–09 (`k < night`), not 02–10; the pulse uses the rail's own mapping.
- No shadow layer: §6.3 has no silhouette (*Ulysses alone. No ship.*).
