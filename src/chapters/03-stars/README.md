# 03 · stars — A Sky Full of Stars

Canto II · LOST → HOPE · Why now · clock 21:10. Film length 4 vh desktop / 2.5 vh mobile. `inNav: false`.
Spec: `design/DESIGN-BIBLE.md` §6.3. Owner files: `index.ts`, `style.css`, this README.

## What it is
The "Why now?" slide staged as a sailor losing sight of land. The eleven forces (`whyNow.forces`) are eleven stars on the
logo's Mediterranean outline (`src/art/constellations.ts → constellation()`, injected into `.pin__layer.fx`), their labels a real
`<ol class="stars__forces">` positioned in % over the SVG (so the list is accessible DOM text, not `<text>` in an aria-hidden SVG).
Hairlines draw between the stars with `stroke-dashoffset`; the old question is struck through by a drawing hairline; the Malta star
(anchor 10) swells gold and the world's star billboard takes over at the same screen position.

**Layout — three type zones, so nothing ever sits on the constellation, on a hairline, on another block or in the star's glare.**
The outline owns the frame's centre 70 %, so type goes only where the outline is not, and two blocks that share a zone are
separated in time rather than squeezed:
- **A · top-left wedge**, above the Gibraltar→Adriatic chain — eyebrow (`top 11.5%`), `h2` (`top 21%`), stack A (`top 42%`).
  Doubly safe: the constellation does not light until p .36, by which time this zone is empty.
- **B · lower-left**, under the Malta→Gibraltar hairline and left of Cap Bon — the two questions (p .46–.73), then, once
  they have gone, storyteller stacks B and C (p .73–.90). `--by` / `--qy` are written in **px** by `placeZones()` from the
  live outline fit and the *measured* label boxes, so the blocks clear Gibraltar's and Cap Bon's names at every viewport.
- **C · top-right wedge**, above the Adriatic→Levant chain — the Forum statement (p .39–.73), `width min(32%, 30rem)` so its
  foot stays above the 3→4 hairline down to 1360 px (narrower below, via a media query).
`NINE NIGHTS ↓` sits bottom-right, clear of the corner labels. Portrait has no right column: statement, questions and the
stacks all take the band below the outline in turn, above the bottom-centre REGISTER pill.

**Legibility.** The eleven names are `--fs-fine` mono in `var(--star)` with a soft `--press` halo (they were `--fs-label`
in `--fg-muted`, which read as grey ghosts over the star field). `placeLabels()` flips/clamps them into the frame and
`deCollide()` then pushes apart any pair that still touches — a no-op on the desktop table, and what keeps the four
crowded anchors readable at 390 px. The names fade **out** at p .59–.64, before the Malta star swells at .67 and the
world's glow arrives at .69, so no label is ever inside the sun.

## Beats (p = film progress; all tweens on the scrubbed `tl`, ease none)
Re-spaced for the longer film (`pacing.ts` × 1.2): substantive blocks are ~.03–.05 of p apart, the longest quiet stretch is
.10 (the eleven lighting), and storyteller lines are weighted — a three-word question takes less scroll than a sentence
(`WEIGHT_A` / `WEIGHT_B`), so a stack reads as speech rather than a metronome.

| p | beat |
|---|---|
| .060 | eyebrow rule draws (scaleX) |
| .098 | eyebrow chip `03 — WHY NOW — …` |
| .135 | `h2` *Where do I go from here?* — SplitText masked lines |
| .190–.297 | stack A, seven lines, weighted (4 px rise; previous line → 55 %; max 6 visible) |
| .318 / .334 | `h2` then stack A exit — the sailor looks up |
| .360–.556 | star *i* lights at .360 + .018 *i*; its label follows at +.008; edge *i* draws over the next .018 |
| .392–.480 | statement, top-right: rule → label `WHY NOW?` → `[F]` (portrait: .348–.436, in zone B) |
| .462–.663 | questions, lower-left: rule → *The question is no longer:* → old question → strike (.544) → old dims (.580) → *It is:* → new question, masked lines (.618) |
| .556 | spear beyond Malta draws |
| .590–.638 | the eleven names fade **out** — the sailor stops reading and simply sees the sky (and zone B is freed) |
| .604 | other stars → 55 %, the hairline group → 45 % |
| .668–.740 | Malta DOM star scales ×2.6 and fades while `sunVisible` 0→1 (`sunRadius .18`, `sunGlow 1.4`) at the anchor |
| .700 | statement and questions exit |
| .732–.826 | stack B, weighted; *A SKY FULL OF STARS.* set roman, cream |
| .812 | `NINE NIGHTS ↓` |
| .846 | stack B exits |
| .850 / .863 | *On the tenth dawn…* / *the star touched the earth.* |
| .85–.94 | `mtf:night { night: 1…9 }` from `onProgress`; reset at p ≥ .96, on leave, or scrolling back |
| .862–.900 | fx layer, eyebrow, hint and stack C exit — the frame is empty by .90 (seam rule) |

## Mood anchors (`mood(p)`, piecewise-linear; colours linear)
| p | camX | camY | camTilt | fov | sun (x, y, z) | r | glow | visible | skyTop | stars | constellation | bloom | warmth |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 0 | .5 | .04 | 34 | 0, −2.4, −6 | 1 | 0 | 0 | #06192B | .8 | 0 | .5 | .2 |
| .25 | 0 | .9 | **.43** (ref) | **42** (ref) | 0, 2, −8 | .1 | 0 | 0 | #090D16 | 1 | 0 (from .28) | .5 | .15 |
| .5–.85 | 0 | 1.1 (from .6) | .43 | 42 | Malta anchor (≈ 2.35, 7.0, −8 at 16:10) | .1→.18 (.68–.74) | 0→1.4 | 0→1 (.68–.735) | #090D16 | 1 | 1 (at .575) | .7 | .15 |
| 1 | 1.2 | 1.1 | .30 | 40 | 1.2, .9, −8 | .2 | 1.6 | 1 | #090D16 | .7 | 1 | .7 | .15 |

Always declared: `veil 0 · camYaw 0 · p4 0 · tessForm 0 · tess 0 · tessSpread 12 · p1–p3 0 · mosaic 0 · camZ 7 · skyBottom #06192B · haze .15→.1 · starDrift .2→.1 · sunHeat 0`.
The tilt/fov from p .25 are `STARS_REF` from `src/gl/layers/stars.ts` (bible: .42/.44 and 40/42) so the GL set-1 constellation coincides with the DOM anchors. Mobile tilt = `STARS_REF.tiltMobile` (.34).
The Malta anchor's NDC is recomputed from the same fit as `constellation()` at mount and on resize; the sun's world position is the point on z = −8 along that NDC ray for the reference camera (`anchorWorld()`), so the GL star appears exactly where the DOM star faded.
Reduced motion: `mood` returns the p .62 still (constellation lit; the star arrives at .68, so the still is the full sky).

## Reduced motion
`chapter--static`: the same DOM as a flowing stack (eyebrow, h2, stack A, statement, the 2:1 sky plate with all edges drawn and labels visible, questions, stack B, stack C, hint). No film, no timeline, no listeners.

## Budgets
CSS 3.8 KB (over the 3 KB target — see deviations). SplitText: 2 elements (h2 + new question) ≈ 6 line nodes. No `onFrame`; `onProgress` does one comparison and dispatches only on change. No per-frame allocations (mood reuses one RGB triple and one sun-position object). `placeLabels` / `deCollide` / `placeZones` measure ~13 boxes once on ready and on resize (rAF-coalesced), never per frame. No `backdrop-filter`.

## QA (`scripts/shot.mjs`)
`?chapter=stars&p=` is the film's own p (lead amendment §10.2-A), so the URL p and the table above agree.
Stills: `shots/pp-stars-b25.png` (.25 head), `pp-stars-b50.png` (.50 sweep), `pp-stars-e58.png` (.58 all eleven named), `pp-stars-c64.png` (.64 questions), `pp-stars-b78.png` (.78 the star + stack B), `pp-stars-e55m.png` / `pp-stars-d62m.png` (390 × 844).
`npm run typecheck` clean, `npm run build` passes, no console errors.

## Known gaps / deviations
- The new question is Fraunces 300 at `clamp(1.5rem, 2.2vw, 2rem)` (between `--fs-h3` and `--fs-h2`), not `--fs-h2`: at
  `--fs-h2` the block cannot fit in zone B without crossing the Malta→Gibraltar hairline. Portrait uses `--fs-h3`.
- **Pacing.** The chapter fires ~34 timeline events in 3,420 px of travel (`length 4` × `PACING.stars 1.2`) ≈ 100 px per
  event — below the lead's ~180 px target. The eleven-star sweep and the storyteller stacks are continuous movements
  rather than discrete beats, so it reads, but `PACING.stars` at **1.5–1.6** would give the tail (stack B, the title line
  *A SKY FULL OF STARS.*, stack C) the air it wants. The declared `length` is left at the bible's 4.
- CSS is ~3.5 KB, over the 3 KB budget (the zone system plus the portrait Forum split); no `backdrop-filter`, no
  per-frame allocations, `onProgress` still does one comparison.
- The rail's `mtf:night` handler lights ticks 01–09 (`k < night`), not 02–10; the pulse uses the rail's own mapping.
- No shadow layer: §6.3 has no silhouette (*Ulysses alone. No ship.*).
