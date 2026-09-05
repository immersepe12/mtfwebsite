# 05 · unity — The Hand That Lifts

Canto IV · Unity · TENDERNESS · clock 00:15 · DESIGN-BIBLE §6.5.
Declared film length **3 vh desktop / 2 vh mobile** (the pacing table multiplies it ×2.1 → ≈ 6.3 screens)
· `inNav: false` · rail glyph **U** fills at p ≥ .95.

Unity as the hand that helped a stranger stand, then its concrete Forum form: AIR · SEA · DIGITAL · PEOPLE.
The hand itself is not shown (reserved for Ch 11). The camera holds where Ch 04 left it; the look drifts left.

## Files
- `index.ts` — `export const unity: Chapter` (mount / onProgress / onFrame / mood)
- `style.css` — scoped under `#ch-unity` only, tokens only, 4.9 KB raw / 1.7 KB gzipped
- Glyph: `art/routes.ts` (`routes()`, the luzzu `eye()` rides the first sea line inside it)

## Composition — the no-overlap contract
Every block owns a slot that no other block can enter, at any p:

| slot | block | why it cannot collide |
|---|---|---|
| left 7 %, top 17.5 % | `.col` — eyebrow · headline · storyteller stack | a CSS grid, so head and stack can never intersect; the stack is capped at **four visible lines** (a stack collapses to `height 0` one notch before the next begins) and at `max-width 32rem`, so it stays left of x ≈ 610 and never reaches the mosaic field |
| right 7 %, top 17.5 % | `.forum` — rule · `U · UNITY` · `.forum__body` | `.forum__body` is a **fixed 15 rem slot** holding two absolutely-positioned panes that cross-fade: `.fp--rows` (lead + the four strengthen rows) hands over to `.fp--collab` (collaborate-on chips, mono line, CTA) at p .705. The Forum therefore has a constant height and always ends at ≈ 50 % of the frame — above the mosaic island's upper edge (≈ 54 %) and clear of the header |
| left 7 %, bottom 14 % | `.signoff` | lands at p .84, by which point the stack has collapsed to two lines (bottom ≈ y 530 at 900 px); ≈ 190 px of clear ground between them |
| `.pin__layer.fx` | `.plate` — the portolan chart | registered to the mosaic island's projected rect, i.e. below both columns by construction |

Fixed chrome: the rail label (x 0–60), the header (top 72), the corner labels (bottom 60) and, under 600 px,
the REGISTER pill (bottom 120) are all outside every slot — portrait reserves them with
`padding-top: calc(72px + .5rem)` / `padding-bottom: 8.5rem` on `.pin__frame`.

**Legibility.** One `.pin__layer.plate.scrim` (z2, under the frame, over the world) carries a raking wash from
the left for the storyteller column and a shallow pool under the Forum — no box, no border, no `backdrop-filter`.
It fades in with the first rule (p .04) and out with the exit. On portrait it becomes a top-down wash and the
route chart drops to `z-index: 1` so it sits *under* the type, per the §6.5 Mobile note.

## Layers inside the pin
| Layer | Content |
|---|---|
| `.pin__layer.plate.scrim` | the two-gradient scrim that seats the type on the water |
| `.pin__frame` | `.col` · `.forum` · `.signoff` |
| `.pin__layer.fx` | `.plate` — `routes()` at a nominal 1000 × 700, translated + scaled every frame to the island's projected rect |

## Beats (p → what happens) — ~3–4 % of p apart, ≈ 145–190 px of scroll each
| p | beat |
|---|---|
| 0–.06 | frame empty (seam rule); the veil finishes crossing (`veil` .5 → 1 by .15); the scrim lands at .04 |
| .06 / .075 / .095 | eyebrow rule draws → eyebrow → headline lines (SplitText masked lines, on `tl`) |
| .15 / .19 / .235 | stack A: *When she asked the stranger his name…* / *he answered:* / *Nobody.* |
| .29 / .305 / .315 | Forum rule → `U · UNITY` → lead; the routes plate fades in at .30 (empty) |
| .34 / .43 / .51 / .59 | stack B (*Before Calypso loved Ulysses…* … *Made him walk.*) — stack A collapses at .325 |
| .38 / .47 / .55 / .63 | rows AIR / SEA / DIGITAL / PEOPLE: rule → key → text, and the matching line family draws on the water |
| .665 / .678 | stack B collapses at .652; the couplet *A stranger. / A friend.* |
| .705 → .743 | Forum movement 2: the rows pane leaves the slot, *Collaborate across borders on:* → the seven chips arrive in it |
| .74 | *A hand when we needed one.* |
| .775 / .787 | `CONNECT PEOPLE · CONNECT DESTINATIONS · CONNECT OPPORTUNITY` → `B2B BUSINESS MEETINGS ↓` (`#ch-remains`) |
| .78–.87 | the lines on the water thicken (stroke 1.35 → 2.1) and the air arcs warm to `stroke-opacity .95` |
| .81 | *And only later do we understand:* |
| .84 / .846 | the close: **Connect the Mediterranean.** (bottom-left) and **I was different because you were there.** (cream) — the earlier three lines of stack C collapse under them; the pair holds to .888 |
| .888–.900 | exit: everything → opacity 0, y −8; the fx plate and the scrim fade with it |
| ≥ .95 | `mtf:glyph { letter: 'U' }` (re-armed below p .5) |

## Mood anchors (§6.5 table, piecewise-linear; everything else held)
| p | camTilt | camYaw | sunGlow | skyBottom | tessGlint | tessGold | veil | stars | warmth |
|---|---|---|---|---|---|---|---|---|---|
| 0 | −.08 | −.32 | .6 | #0E3D57 | .3 | .55 | .5 | .4 | .3 |
| .15 | −.08 | −.2 | .5 | #0E3D57 | .3 | .55 | 1 | .4 | .3 |
| .85 | −.06 | .1 | .5 | #0E3D57 | .6 | .6 | 1 | .4 | .35 |
| 1 | −.06 | .1 | .6 | #124A66 | .7 | .6 | 1 | .3 | .45 |

Held: cam (2, 1.4, 2) fov 34 · star in the cave (2.6, −.55, −9) r .1 heat .2 · skyTop press · haze .2 · seaAmp .1 · tess 1 · **tessForm 1** · tessSpread 1 · **p4 0** · p1/p2/p3 0 · mosaic 0 · bloom .5 · grain .06.
Reduced motion: the p 1 state as a still. `html.no-gl`: `--sky-top-static` press, `--sky-bottom-static` ≈ #124A66.

## Island registration
The tesserae layer places formation 1 at `anchors.island`; the chapter reads that anchor from `world.layers` at
mount (duck-typed, no gl import) and falls back to the bible's `(0.8, −1.15, −9)`. Each frame it projects the
footprint's left/right/near/far edges (± 3.3 × ± 2.3 world units) and writes one `transform` on `.plate` only when
it changes. Seen from a 1.4-unit eye height the island projects to a ~6:1 letterbox, which mashed the portolan
lines into a single pixel band — the plate's depth is now clamped to **0.22–0.36 of its own width**, so the chart
keeps a readable aspect while its width stays true to the island. A `drop-shadow` separates the gold hairlines
from the gold tesserae.

## Budgets / QA
- CSS 4.9 KB raw (1.7 KB gzipped; §11's 3 KB line is a raw-byte budget — see Status) · SplitText: 3 line nodes · `onFrame`: 4 projections, one transform string written only on change.
- Seam rule verified at p .03 / .05 / .93 / .97: every frame element at opacity 0. Mood at p 1 = Ch 06's p 0.
- Copy: eyebrow, headline, lead, rows, chips, mono line, closing line from `content.json → theme.pillars[1]`
  (headline and closing line sentence-cased); storyteller lines and *Collaborate across borders on:* from the bible.
- Checked at 1440 × 900 (p .5 / .68 / .78 / .87) and 390 × 844 (p .55 / .8): no collision, no chrome collision,
  no horizontal overflow, no console errors. `npm run typecheck` and `npm run build` pass.

## Status / known gaps
- The final couplet holds for ≈ 2.6 % of p (≈ 125 px) before the exit. With 21 beats in .06–.89 this chapter is
  the tightest in the film; a pacing multiplier of ~2.4 would buy every beat a full 4 % and a longer close.
- The Gozo silhouette that used to sit on the horizon here was removed: §6.5's Visual section does not call for it,
  and it landed as a dark blob inside the Forum column (see `shots/qa/desktop-unity-05.png`).
- `style.css` is 4.9 KB raw against §11's 3 KB budget (1.7 KB gzipped). The overrun is the two-pane Forum slot,
  the scrim and the portrait block; the `#ch-unity ` prefix alone is ~0.5 KB of it.
