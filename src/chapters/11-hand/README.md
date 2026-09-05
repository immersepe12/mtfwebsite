# 11 · hand — The Open Hand

Canto X · The Gala · Awards · 05:55 · Emotion: LETTING GO. Film 4.5 vh desktop / 3 vh mobile (the lead's
`PACING.hand = 1.55` multiplies it → ≈ 6,300 px desktop). `navIndex 05`, in nav.
Spec: DESIGN-BIBLE §6.11 (+ §4.2 placement, §5.3–5.4, §11). Glyphs: `net()` / `tighten()` / `cut()` (§9.13),
`galaTitle()` / `draw()` (§9.12).

## Composition — the no-overlap contract

**Two zones and one emblema. No block of type ever sits on the mosaic.**

- **Type zone** — everything the reader reads lives in `left 7%` → ≈ 37 % of the width, on one soft
  `.scrim` (a 96° `--press` gradient that dies at 50 % of the width; no edge, no blur, no `backdrop-filter`).
  - *Column* `top 17%`, `min(30%, 27rem)`: eyebrow → Storyteller stack, then (headline + Gala Forum), then
    the Awards. **One occupant of the column's body at a time**: the Gala and the drawn headline both leave
    (.726 / .734) before the Awards rule draws (.740).
  - *Headline slot* `left 7%, top 16%`, `min(27%, 24rem)`: the drawn **CALYPSO'S ODYSSEY** + its italic
    subtitle. The Gala Forum sits beneath it at `top 26vh`; the Awards takes the whole column at `top 7vh`.
  - *Sign-off slot* `left 7%, bottom 15%`, `min(29%, 25rem)`: the couplet (.400–.528), then the closing
    lines (.818–.878). Never simultaneous.
- **The hand** is the emblema in the right two thirds. `camX .05` (not the bible's `.8`) puts the camera left
  of the palm; the mosaic starts at ≈ x 700 at 1440, so the column never meets a tile.
- **The invitation pill in the palm is the only thing on the figure** — the bible's deliberate emblema, on
  its own radial `--press` ground so cream-on-gold never happens. It leaves at .830, before the star arrives.
- Chrome clearances: header ≤ 72 px (column starts 17 % ≈ 153 px) · rail label 0–60 px (column starts
  100 px) · corner labels last 60 px (the Gala block ends ≈ 660 px, the sign-off slot ≈ 765 px).

**Portrait (< 820 px).** ONE column, same order, no third band and no projection (`onFrame` is a no-op on
mobile): headline `top 12%` → Gala `top 19vh` (ends ≈ 495 px) → the hand in the lower band (`camY 3.2`,
`camZ 4.4`) → the pill at `bottom 13%`, clear of the corner counter (≈ 70 px) and the docked REGISTER pill
(≈ 120 px). The Awards takes `top 3vh` after the Gala and the headline have left; the closing lines take
`top 14%` after the Awards has left. Canto strip is a two-column list; the lettering's subtitle is hidden
(it would push the Forum onto the hand) — the real `<h2>` and reduced motion carry it.

### Deviations from §6.11, and why
1. **The drawn lettering is in the column, not "across the open palm."** On the palm it printed cream serif
   over gold tesserae *and over the fingers* — unreadable, and exactly the "type on the picture" fault in the
   client review. Moved to §4.2's headline slot; it now also fills the column, which was empty p .5–.75.
2. **`camX .05`** (bible `.8`) — what keeps the type zone clear of the figure.
3. **Camera settles at .56** (`camY 1.52`, `camZ −3.4`, fov 34) and then holds, so the hand is fully in
   frame with air above the fingertips instead of being cropped by both the header and the bottom edge.
4. **The canto strip keeps its `overflow-x` track but is laid out as a 3-column grid** (2 at ≤ 1180 px,
   2 in portrait) so all nine cantos are complete. Masked to 56 % it showed three of nine, cut mid-word.
5. The pill sits at the hand's base in portrait (there is no room below it before the corner counter).

## Beats (p → what happens) — re-spaced for the longer film
Substantive beats sit ≈ .020–.024 of p apart (≈ 130–150 px of scroll at 1.55×); the stack, the couplet and
the closing lines step tighter because each is ONE accumulating gesture. Seam: frame empty for p < .06
(exception below), everything at 0 by **p .892**.

| p | beat |
|---|---|
| 0–.20 | net strands draw; the net tightens 1 → .96 over 0–.26 (Ch 10 hands the same ±45°/44 px geometry over) |
| .030 | the type-zone scrim fades up with the frame |
| .038–.068 | eyebrow rule draws → `11 — 26 NOVEMBER · CALYPSO'S ODYSSEY · THE GALA` |
| .095–.239 | seven Storyteller lines, one per .024; older lines to 55 %; max 6 visible |
| .262 | eyebrow + stack exit |
| .268–.368 | **the cut** — strands retreat by side, knots fall; the net fades out .358 |
| .300–.390 | *Calypso cuts the net.* alone in its own slot |
| .30–.52 | mood: fist (2) → open hand (3), `tess` 0 → 1, `tessSpread` 4 → 1 — **assembled by .52** |
| .400 / .462 | the couplet, one line per finger group (`--fs-h2`); exits .528 |
| .500–.606 | **CALYPSO'S ODYSSEY** strokes on in the headline slot (`draw`); glint .8 → 1.4 |
| .538–.684 | Gala Forum: rule → THE GALA → two lines → nine cantos → meta chips (BY INVITATION (TBC)) |
| .634 | *The Greatest Journeys Are Not Always Across the Sea* settles under the lettering (landscape) |
| .706 | REQUEST AN INVITATION → pill in the palm (mailto, TBC) |
| .726 / .734 | the Gala, then the headline, leave — the column is empty for the Awards |
| .740–.838 | Awards: rule → `MEDITERRANEAN TOURISM AWARDS · 25 NOVEMBER` → Storyteller → Forum → *Categories and venue to be announced.* → AWARDS — NOMINATE → |
| .818–.862 | closing lines (`--fg-faint`) accumulate in the sign-off slot, 118 px below the Awards |
| .830 | the pill leaves the palm, clearing it for the star |
| .862–.905 | the star appears at the palm centre (`sunVisible`/`sunGlow` ramp, `sunHeat 0`, r .16) |
| .878 | Awards, closing and the scrim exit — **the frame is empty by p .892** (§5.3) |
| .892–1 | the only cut: sky/sea to black, world only; `html.is-black` from .96 (Ch 12 removes it) |

Portrait uses the same shape ≈ .03 earlier (the `AT` table in `mount`), so the Awards has left the column
before the closing lines arrive in it.

**Seam note.** The net's opacity ramps from p 0, not p .06. This is the bible's own §6.11 transition: Ch 10
ends with three cream hairlines at the same ±45° / 44 px geometry, so the two frames match *by geometry* and
the handover is invisible. Everything else obeys the rule.

## Mood anchors (piecewise-linear; constants camYaw 2π · veil 3 · p1–p4 0 · sunHeat 0)
p 0: cam (1, 2.4, −8) fov 34 · sky #090D16/#123044 · sea op 1 amp .08 · stars .2 · tess 0 form 2 spread 4 gold .8 glint .5 · bloom .5 warmth .25 vig .35
p .3: fov 30 · skyBottom #090D16 · sea op .8 amp .05 · stars .1 · vig .4
p .42: cam (.25 desktop / .8 portrait, 2.05, −5.4) fov 32 · bloom .6
p .56: cam (.05, 1.52, −3.4) fov 34 — **the framing settles here and holds** (portrait: .8, 3.2, 4.4 by .72)
p .72: skyBottom #0B1A2A · sea op .5 · tess 1 form 3 spread 1 gold .9 glint .8 → 1.4 at .70 · bloom .8 warmth .35
p .862–.905: the star in the palm (glow 1.6) · p .88: bloom .9
p 1: sky #000/#000 · sea op 0 amp 0 · stars 0 · tess .6 · glint .6 · bloom .7 warmth .1 vig .6
The palm centre is read from the tesserae layer's `anchors.palm` at mount (falls back to §6.11's (.8, .4, −8)); the star and the pill both use it.

## Budgets
CSS ≈ 4.6 KB (over the 3 KB guide; the portrait recomposition, the scrim and the static stack are the cost) ·
no SplitText (whole-line rises; DOM ≈ 63 nodes + net ≤ 400 knots) · `onFrame` does ONE `project()` call and
writes one transform only when a rounded px changes, and nothing at all in portrait.

## Status / known gaps
- **Beat density vs the pacing guide.** This chapter fires ~30 timeline beats; at `PACING.hand = 1.55`
  (≈ 6,300 px) that is ≈ 130–150 px of scroll per beat, not the ~4 %-of-p / ~250 px the QA note asks for.
  Meeting it would need ≈ 2.0. The `length` (4.5) is the right *shape*; the multiplier is the lead's call.
- The final stretch p .878 → 1 (12.2 %) has nothing in the DOM: that is §6.11's "only cut" to black, the
  deliberate hold, not a dead beat.
- Stage blends my mood into Ch 12's p 0 over my last 38 %, so the exact camera at p > .8 is not mine alone.
- Reduced motion: static stack, everything visible (the real `<h2>` and its subtitle included), mood = the
  p .86 still (hand open, star arriving).
