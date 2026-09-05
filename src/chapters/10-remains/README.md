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
  stack (top 26 %), the four hairline-framed programme columns (`.card--frame`, lower half, 4-up, Knowledge column
  1.5 fr), and the last line *Then came the net.*
- **fx layer** — three of Ch 11's net lines (same ±45° families, same 44 px pitch — 60 on mobile — same phase
  formula as `net()`), a knot at their crossing.

## Beats (p)
| p | beat |
|---|---|
| 0 | branch already in frame (it slid up under Ch 09's *A leaf falls.*); leaf A at its top |
| .03–.30 | leaf A detaches and drifts down to where the B2B `→` row will begin |
| .06–.14 | eyebrow rule → eyebrow → headline lines (masked) |
| .14–.28 | Storyteller lines land one per beat (4 px rise), older lines fall to faint; line 1 collapses when the 7th lands (max 6) |
| .30 | mobile only: the stack exits (the lower slot needs the room) |
| .32 / .42 / .52 / .62 | columns 01–04: corner marks → rules draw outward → label → list settles (8 % each; mobile .32 + i × .13, one at a time) |
| .36–.64 | leaf B detaches and drifts to the Knowledge `→` row |
| .58 / .68 | the fallen leaves fade as their `→` rows land (leaf becomes arrow) |
| .80–.88 | `--thread` 0 → 1: olive/silver → cream, leaves thin to lines (CSS `scaleY`) |
| .845–.895 | exit: columns, then head + stack (opacity 0, y −8) — frame empty by .90 |
| .88 / .91 / .935 / .95 | net line, net line, knot, third line draw (`stroke-dashoffset`) |
| .89–.99 | *Then came the net.* |

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
CSS 2.97 KB (nested under `#ch-remains`, flattened by the build). SplitText: 2 lines. onFrame: no allocations, no
queries except `flip()` on a quantised change. DOM: 4 cards, 41 chips.

## QA
`?chapter=remains&p=0 / .2 / .5 / .74 / .9 / .95` at 1440×900 and `.5 / .62` at 390×844 — see `shots/remains-*.png`.
Seam: frame empty for p < .06 and p > .90 (only the fx threads and *Then came the net.* live past .90, as §6.10 asks).

## Known gaps / notes
- The rail's chapter label (`10 · WHAT REMAINS`) sits at ≈ 60 % height, so the column band starts at `left: 14 %`
  rather than 7 % to clear it; the head keeps 7 %.
- The branch's ink stroke is nearly invisible on the navy sky until the thread phase (by design — a silhouette);
  the leaves carry the shape.
- Mobile shows the four columns one at a time in the lower slot rather than as four scrolling rows (a pinned frame
  cannot scroll a stack); reduced motion stacks all four.
