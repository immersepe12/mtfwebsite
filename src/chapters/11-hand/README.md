# 11 · hand — The Open Hand

Canto X · The Gala · Awards · 05:55 · Emotion: LETTING GO. Film 4.5 vh desktop / 3 vh mobile. `navIndex 05`, in nav.
Spec: DESIGN-BIBLE §6.11. Glyphs: `net()` / `tighten()` / `cut()` (§9.13), `galaTitle()` / `draw()` (§9.12).

## Layers
`.pin__layer.fx` — the net SVG (44 px spacing, 60 on mobile; rebuilt on a real resize).
`.pin__frame` — one left column (eyebrow, sr-only `<h2>` with the real title + subtitle, Storyteller stack, Forum block, Awards block), the couplet in the sign-off slot, the gala lettering and the invitation pill pinned to the palm each frame via `world.project()`, the closing lines.
The hand is the *emblema*, right of centre (desktop camX .35 → the hand spans ≈ 42–86 % of the width, the type column 7–41 % is clear of it). Mobile: hand centred at ≈ 70 % width, pill below the palm.

## Beats (p → what happens)
| p | beat |
|---|---|
| 0–.18 | net strands draw (`--net-draw`), net tightens 1 → .96 over 0–.3 |
| .06–.12 | eyebrow rule draws → `11 — 26 NOVEMBER · CALYPSO'S ODYSSEY · THE GALA` |
| .11–.29 | seven Storyteller lines, one per .03, 4 px rise; older lines to 55 %; max 6 visible |
| .31 | stack + eyebrow exit |
| .30–.40 | **the cut** — `cut()` 0 → 1; strands retreat by side, knots fall; net fades .40 |
| .35–.47 | *Calypso cuts the net.* alone |
| .40–.75 | mood: fist (2) → open hand (3), tess .1 → 1, spread 4 → 1 |
| .47 / .62 | couplet lands one line per finger group (`--fs-h2`), exits .74 |
| .75–.85 | gala lettering strokes on across the palm (`draw`), glint sweep .8 → 1.4 → 1 |
| .78–.86 | Forum: rule → THE GALA → two lines → canto strip (user-scrolled `overflow-x`) → meta chips (BY INVITATION (TBC)) |
| .82 | REQUEST AN INVITATION → pill in the palm (mailto, TBC) |
| .885 | Forum exits |
| .86–.92 | the star appears at the palm centre (sunVisible/sunGlow ramp, sunHeat 0, r .16) |
| .905–.935 | Awards: rule → `MEDITERRANEAN TOURISM AWARDS · 25 NOVEMBER` → Storyteller → Forum → *Categories and venue to be announced.* → AWARDS — NOMINATE → |
| .942–.978 | closing lines (`--fg-faint`) fading with the frame; everything out by .98 |
| ≥ .96 | `html.is-black` toggled in `onProgress` (Ch 12 removes it) |

## Mood anchors (piecewise-linear; constants camYaw 2π · veil 3 · p4 0 · p1–p3 0 · sunHeat 0)
p 0: cam (1, 2.4, −8) fov 34 · sky #090D16/#123044 · sea op 1 amp .08 · stars .2 · tess 0 form 2 spread 6 gold .8 glint .5 · bloom .5 warmth .25 vig .35
p .3: fov 30 · skyBottom #090D16 · sea op .8 amp .05 · stars .1 · vig .4
p .4: cam (.35 desktop / .8 mobile, 2.0, −6) fov 32 · tess .1 spread 4 · bloom .6
p .75: cam (.35, 1.55, −4) fov 34 (mobile .8, 2.4, 1.8) · skyBottom #0B1A2A · sea op .5 · tess 1 form 3 spread 1 gold .9 glint .8 · bloom .8 warmth .35
p .82: glint 1.4 · p .9: glint 1.0, bloom .9, star in the palm (glow 1.6)
p 1: sky #000/#000 · sea op 0 amp 0 · stars 0 · tess .6 · glint .6 · bloom .7 warmth .1 vig .6
The palm centre is read from the tesserae layer's `anchors.palm` at mount (falls back to the bible's (.8, .4, −8)); the star and the pill use it.

## Budgets
CSS ≈ 3.2 KB (slightly over the 3 KB budget; the static + mobile recompositions are the cost) · no SplitText (whole-line rises; DOM ≈ 60 nodes + net ≤ 400 knots) · `onFrame` does two `project()` calls and writes two transforms only when a rounded px changes · no allocations beyond the transform strings.

## Status / known gaps
- Stage blends my mood into Ch 12's p 0 over my last 38 %: from ≈ p .8 the world is mostly Ch 12's state, so the hand partly scatters and the sky goes black earlier than the bible's .96 (see the lead issue list).
- The bible's camX .8 centres the hand; I use .35 on desktop so the type column stays clear of the mosaic (documented deviation).
- The gala subtitle inside the SVG lettering is small on mobile; the real `<h2>` carries it for AT.
- Reduced motion: static stack, everything visible, mood = the p .9 still (hand open, star in the palm).
