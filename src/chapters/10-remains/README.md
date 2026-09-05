# 10 · remains — What Remains

Canto IX · People · 05:20 · Emotion: LEGACY. Film 4 vh desktop / 2.5 vh mobile. `inNav: false`.
Spec: DESIGN-BIBLE §6.10. Status: **built** (ch/10-remains agent).

## What is on the stage
- **Shadow layer** — Penone's olive branch (`olive()` §9.11) across the top-left; its thirteen leaves turn silver
  with the pointer (`flip()` driven by `shared.mouse.x`; scroll velocity on touch), quantised to 12° so `flip()` only
  runs on change. Two leaves detach (branch leaves #7 and #10 hide; DOM twins fall along a CSS `offset-path` whose
  end is *measured* to the start of the B2B and Knowledge `→` rows — remeasured on `fonts.ready` and resize). A third,
  fallen leaf lies flat on the water at `--horizon-now`.
- **Frame** — eyebrow (rule → text), the compressed headline (h2), the seven Storyteller lines as a right-aligned
  stack (top 23 %, max six rendered rows), the four hairline-framed programme columns (`.card--frame`, lower band,
  4-up, Knowledge column 1.62 fr) and the last line *Then came the net.* Each column carries a soft top-down scrim
  and a long, low drop shadow so the copy holds its contrast over the sea and the frames read as glass rather than
  flat stickers; a gold pointer glint (`--mx/--my`) is decorative only.
- **fx layer** — three of Ch 11's net lines (same ±45° families, same 44 px pitch — 60 on mobile — same phase
  formula as `net()`), a knot at their crossing.

## Beats (p) — re-spaced for the longer film (`pacing.ts` remains ×1.7 → 6.8 screens, ≈ 5,200 px of travel)
No substantive beat closer than 3.4 % of p (≈ 190 px of scroll); no gap wider than 6.5 % with nothing happening.

| p | beat |
|---|---|
| 0 | branch already in frame (it slid up under Ch 09's *A leaf falls.*); leaf A at its top |
| .06 / .10 / .135 | eyebrow rule draws → eyebrow → headline lines (masked) |
| .05–.60 | leaf A detaches and drifts down to where the B2B `→` row will begin |
| .18 + i × .036 | Storyteller lines land one per beat (→ .396); older lines fall to faint; the long opening line collapses as the fifth lands (max six rendered rows) |
| .345 | mobile only: head **and** stack exit — the columns then own the whole lower band |
| .43 / .52 / .61 / .70 | columns 01–04: card fades in → corner marks → rules draw outward → label → list settles (8 % each; mobile .38 + i × .115, one at a time with a 2 % cut) |
| .40–.72 | leaf B detaches and drifts to the Knowledge `→` row |
| .68 / .77 | the fallen leaves fade as their `→` rows land (leaf becomes arrow) |
| .80–.88 | `--thread` 0 → 1: the leaves thin to lines and warm to cream; the branch stroke only half-warms and dims (a thread, never a white bar) |
| .845–.895 | exit: columns, then head + stack (opacity 0, y −8) — frame empty by .90 |
| .875–.955 | *Then came the net.* |
| .88 / .91 / .935 / .95 | net line, net line, knot, third line draw (`stroke-dashoffset`) |

## Placement contract (the no-overlap rules this chapter is built to)
Desktop 1440 × 900:
- **head** `left 7%`, `top 23%` — the headline is capped at `--measure-title` (11 em ≈ 792 px), so its right edge never passes ≈ 62 % of the frame.
- **storyteller** `right 7%`, `top 23%`, `width min(26%, 24rem)` — its left edge sits at ≈ 66 %, a 60 px gutter clear of the headline. Never more than six rendered rows, so it ends by ≈ 46 % — clear of the column band.
- **columns** `left 14% → right 7%`, band `top 48%`, top-aligned and each the height of its own copy (no stretched cards, no dead space above the link). The tallest (Knowledge) bottoms out ≈ 53 px above the corner labels.
- **branch** `left 3.5vw, top −11vh, width 23vw` — it enters from off-frame top-left and stops ≈ 30 px above the eyebrow; its lower tip is well right of the rail (0–62 px) and its upper leaves sit in the empty middle of the header band, clear of the brand and the REGISTER pill.
- **net hairlines** keep Ch 11's exact geometry but carry a vertical mask so they fade out before the header band and before the corner labels.

Mobile 390 × 844: head `left 11%, top 22%` (clear of the rail glyphs), stack `top 44%`, both exiting at .345; the column band is `top 24% → bottom 16%` so the tallest card ends ≈ 130 px above the corner labels and ≈ 180 px above the bottom-centre REGISTER pill.

## Mood anchors (piecewise-linear; constants `camYaw 2π · veil 3 · p4 0 · tess 0 · tessForm 1 · fov 34 · sunVisible 0`)
| p | cam (x,y,z,tilt) | skyTop | skyBottom | seaColor | haze | seaAmp | stars | warmth |
|---|---|---|---|---|---|---|---|---|
| 0 | 2, 1.6, −4, .04 | #3A2A14 | #A67C2E | #6E4A1E | .15 | .08 | .1 | .7 |
| .3 | 1.6, 1.9, −6, .03 | #090D16 | #0E3D57 | #0E3D57 | .2 | .1 | .3 | .3 |
| .8 | — | #090D16 | #0E3D57 (held) | #0E3D57 (held) | — | — | — | .28 |
| 1 | 1, 2.4, −8, .02 | #090D16 | #123044 | #0B2A3D | .2 | .08 | .2 | .25 |

grain .06, bloom .5, vignette .35, seaSpeed .25, tessSpread 2 throughout. p 1 = Ch 11's documented p 0.
Reduced motion: `mood` returns the p 1 still; DOM is the same markup as a flowing `.chapter--static` stack.

## Data
`skillsCareersBusiness.{heading,date,competitions,careers,b2b}`, `knowledgeForum.{deckTitle,days,lines,bringingTogether,
chainSteps,themes,closingLine,precedent2025.url}`, `event.dates`, `contact.emails[forum]`. TBC: Knowledge days → `25–26 NOVEMBER`
+ *Days to be confirmed.*; competition/careers/B2B links → designed mailtos (subjects per bible). Headline and Storyteller
lines are bible-final (§6.10). B2B date `25–26 NOVEMBER` is the bible's copy (content.json carries only the 26th).

## Budgets
CSS 4.9 KB (nested under `#ch-remains`, flattened by the build). SplitText: 2 lines. onFrame: no allocations, no
queries except `flip()` on a quantised change. DOM: 4 cards, 41 chips.

## QA
`?chapter=remains&p=0 / .2 / .25 / .5 / .78 / .95` at 1440×900 and `.25 / .5 / .78` at 390×844 plus `&reduced`
— see `shots/pp-remains-*.png`. Scrubbed forward and back: no block ever touches another, the header, the rail,
the corner labels or the REGISTER pill.
Seam: frame empty for p < .06 and p > .90 (only the fx threads and *Then came the net.* live past .90, as §6.10 asks).

## Known gaps / notes
- The rail's chapter label (`10 · WHAT REMAINS`) sits at ≈ 60 % height, so the column band starts at `left: 14 %`
  rather than 7 % to clear it; the head keeps 7 %.
- The branch's ink stroke is nearly invisible on the navy sky until the thread phase (by design — a silhouette);
  the leaves carry the shape.
- Mobile shows the four columns one at a time in the lower slot rather than as four scrolling rows (a pinned frame
  cannot scroll a stack); reduced motion stacks all four.
- The four cards are top-aligned with natural heights, so the band is deliberately ragged at the bottom — that is the
  composition, not an unfinished row.
- Mobile is the tight one: at the declared 2.5 vh (× 1.7 = 4.25 screens ≈ 2,740 px) the storyteller runs at .030 of p
  per line (≈ 82 px). If the lead wants the mobile litany to breathe like the desktop one, the mobile length wants 3 vh.
