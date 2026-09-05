# 05 · unity — The Hand That Lifts

Canto IV · Unity · TENDERNESS · clock 00:15 · DESIGN-BIBLE §6.5.
Film length **3 vh desktop / 2 vh mobile** · `inNav: false` · rail glyph **U** fills at p ≥ .95.

Unity as the hand that helped a stranger stand, then its concrete Forum form: AIR · SEA · DIGITAL · PEOPLE.
The hand itself is not shown (reserved for Ch 11). The camera holds where Ch 04 left it; the look drifts left.

## Files
- `index.ts` — `export const unity: Chapter` (mount / onProgress / onFrame / mood)
- `style.css` — scoped under `#ch-unity` only, tokens only, 3.1 KB
- Glyphs: `art/routes.ts` (`routes()`, the luzzu `eye()` rides the first sea line inside it), `art/island.ts` (Gozo silhouette on the horizon)

## Layers inside the pin
| Layer | Content |
|---|---|
| `.pin__layer.shadow` | `.gozo` — the Ogygia silhouette on the far horizon, `left` set per frame along the island's bearing, `bottom` from `--horizon-now` |
| `.pin__frame` | `.col` (eyebrow, h2, storyteller stack) · `.forum` (rule, label, lead, four strengthen-rows, chip row, mono line, CTA) · `.signoff` |
| `.pin__layer.fx` | `.plate` — the portolan `routes()` SVG at a nominal 1000 × 700, translated + scaled every frame to the mosaic island's projected rect |

## Beats (p → what happens)
| p | beat |
|---|---|
| 0–.06 | frame empty (seam rule); the veil finishes crossing (`veil` .5 → 1 by .15) |
| .06 / .08 / .09 | eyebrow rule draws → eyebrow → headline lines (SplitText masked lines, on `tl`) |
| .14 / .19 / .25 | stack A: *When she asked the stranger his name…* / *he answered:* / *Nobody.* |
| .34 / .36 / .38 | Forum rule → `U · UNITY` → lead; the routes plate fades in (empty) |
| .37 / .43 / .50 / .57 | stack B (*Before Calypso loved Ulysses…* … *Made him walk.*) — stack A collapses at .36 |
| .40 / .47 / .54 / .61 | rows AIR / SEA / DIGITAL / PEOPLE: rule → key → text, and the matching line family draws on the water (`--draw` on `.air/.sea/.digital`, opacity on `.people`) |
| .64 / .67 / .70 / .74 | stack C (*A stranger.* … *And only later do we understand:*) — stack B collapses at .63 |
| .66 / .68 | *Collaborate across borders on:* → seven chips |
| .76 / .78 | `CONNECT PEOPLE · CONNECT DESTINATIONS · CONNECT OPPORTUNITY` → `B2B BUSINESS MEETINGS ↓` (`#ch-remains`) |
| .79 | serif sign-off **Connect the Mediterranean.** (left 7 %, bottom 14 %) |
| .82 | **I was different because you were there.** (cream, stays) |
| .80–.88 | the lines on the water thicken (stroke 1.25 → 1.9) and the air arcs warm |
| .87–.90 | exit: everything → opacity 0, y −8; the fx plate fades too (it lives in the pin and would slide at the seam) |
| ≥ .95 | `mtf:glyph { letter: 'U' }` (re-armed below p .5) |

Max 6 storyteller lines visible at any time (stacks of 3 / 4 / 4 + the last line); older lines fall to 55 %.

## Mood anchors (§6.5 table, piecewise-linear; everything else held)
| p | camTilt | camYaw | sunGlow | skyBottom | tessGlint | tessGold | veil | stars | warmth |
|---|---|---|---|---|---|---|---|---|---|
| 0 | −.08 | −.32 | .6 | #0E3D57 | .3 | .55 | .5 | .4 | .3 |
| .15 | −.08 | −.2 | .5 | #0E3D57 | .3 | .55 | 1 | .4 | .3 |
| .85 | −.06 | .1 | .5 | #0E3D57 | .6 | .6 | 1 | .4 | .35 |
| 1 | −.06 | .1 | .6 | #124A66 | .7 | .6 | 1 | .3 | .45 |

Held: cam (2, 1.4, 2) fov 34 · star in the cave (2.6, −.55, −9) r .1 heat .2 · skyTop press · haze .2 · seaAmp .1 · tess 1 · **tessForm 1** · tessSpread 1 · **p4 0** · p1/p2/p3 0 · mosaic 0 · bloom .5 · grain .06.
Reduced motion: the p 1 state as a still. `html.no-gl`: `--sky-top-static` press, `--sky-bottom-static` ≈ #124A66 via `color-mix(sea 55 %, sky)`.

## Island registration
The tesserae layer places formation 1 at `anchors.island` (`[5.2, seaY + .06, −9]`, on Ch 04's heading). The chapter reads that anchor from `world.layers` at mount (duck-typed, no gl import) and falls back to the bible's `(0.8, −1.15, −9)` if absent. Each frame it projects the footprint's left/right/near/far edges (± 3.3 × ± 2.3 world units) and writes one `transform` string on `.plate` only when it changes. On portrait the same projection applies (the island lands in the lower 45 % under the type, as the Mobile note asks).

## Budgets / QA
- CSS 3.1 KB · SplitText: 3 line nodes · onFrame: 5 projections, no allocations beyond the transform string (written only on change), no DOM queries.
- Seam rule: frame + fx at opacity 0 for p < .06 and p > .90. Mood at p 1 = Ch 06's p 0 camera/tess values (Ch 06 moves the sun itself).
- Copy: eyebrow, headline, lead, rows, chips, mono line, closing line from `content.json → theme.pillars[1]` (headline and closing line sentence-cased); storyteller lines and *Collaborate across borders on:* from the bible.
- Dev-harness note: `?p=` in `main.ts` scrolls to `top + height × p`, so film p = URL p × len / (len − 1): film .5 ↔ `p=0.3333` (desktop) / `p=0.25` (mobile); film .9 ↔ `p=0.6`.

## Status / known gaps
- Ch 04 and Ch 06 were stubs while this was built: at p > .62 the world blends toward Ch 06's stub mood (a default sun rises mid-frame). With Ch 06's real p 0 (sun at −4, −.6 — off-screen left) the last beats will sit on dark water as designed.
- The Gozo silhouette's exact horizon placement should match Ch 04's at the seam; both chapters derive it from the island's bearing, but the Ch 04 agent owns its own layer.
- Line families over the gold tiles read as hairlines (gold-leaf .85 / lagoon .8 / star .7 at 1.25 px); the people ports pulse only while `.is-active`.
