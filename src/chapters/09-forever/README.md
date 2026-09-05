# 09 · forever — Forever

Canto VIII · Net Positive · 04:50 · FEAR → CLARITY. Declared film length: 3 vh desktop / 2 vh mobile
(× 1.6 from `src/engine/pacing.ts` → ≈ 4.8 vh of travel). `inNav: false`.
Spec: DESIGN-BIBLE §6.9, placement §4.2, reveals §5.3–5.4, QA §11. Owner files: `index.ts`, `style.css`, this README.

## What it is
Rothko's cold field — sky, sea and horizon all `--sky` — with Opałka's counter of arrivals lying on the sea band.
The count climbs only while you scroll; it freezes on *Life matters because it ends.*, then dissolves tile-wise
(`.tess-out`, 600 ms) — the only DOM tesserae dissolve in the film. The field warms to gold in three sliding bands
(sea first, then the lower sky, then the upper sky), the Forum lands, and at p .88 the **N** fills so S·U·N reads
whole for the first time. The chapter ends on *A leaf falls.* for Ch 10's olive branch.

## Composition — no overlap at any p (§4.2)
The head (eyebrow + headline) and the storyteller stack are **one flowing left column** `.col`
(left 7 %, top 15 %, width min(46 %, 32rem)), so a storyteller line can never land on the headline however the
headline wraps at any viewport. Verified block-by-block at 1440 × 900, 1280 × 800 and 390 × 844 across p 0 → 1:
nothing collides, nothing runs under the header (> 72 px), the rail, the bottom corners (< vh − 60) or, on mobile,
the REGISTER pill (< vh − 120), and nothing leaves the frame.

| block | desktop | mobile (≤ 820) |
|---|---|---|
| `.col` (head + stack) | left 7 %, top 15 %, min(46 %, 32rem); stack min(100 %, 25em) | top 11 %, 86 %; exits at .54 so the Forum owns the screen |
| `.count` | left/right 7 %, `clamp(64%, horizon + 18%, 77%)`, centred, `clamp(3rem,7vw,6.25rem)` | top 58 %, `clamp(1.75rem,8.4vw,2.75rem)` |
| `.forum` | right 7 %, top 21 %, min(38 %, 34rem) | left/right 7 %, top 11 %, question at `--fs-h3` |
| `.subs` | left 7 %, bottom 12 %, two 15rem columns | top 58 %, one column |
| `.leaf` | left 7 %, top 66 % — a band no other block ever occupies | top 82 %, clear of the REGISTER pill |

## Legibility over the world (§5.4)
The field ends gold (`#D9A441`), where cream type alone fails. A `.pin__layer.plate` behind the frame carries two
heavily feathered ink washes whose opacity is `calc(var(--warmth-now) * .82)` — invisible over the cold blue,
present exactly when the gold arrives — plus: chips on a 38 % `--press` ground, `.f--pre` at 92 % paper, the
sub-blocks' mono caps in `--paper` (never gold on gold), and the storyteller's older lines held at .62, not .55.
The plate fades with the film (in at .06, out at .828) so it never survives the seam.

## Beats (p → what happens; all on the scrubbed `tl`, ease none)
18 substantive beats spaced ≈ 4.3 % of p apart (≈ 190 px of scroll each at a 900 px viewport); no gap over 12 %.

| p | beat |
|---|---|
| < .06 | seam: every frame element at opacity 0 |
| .060 / .078 | eyebrow rule draws → eyebrow `09 — N · NET POSITIVE — WHAT SHOULD TOURISM LEAVE BEHIND?`; counter + plate surface |
| .105 | headline lines (SplitText masked) *Leave more than we take.* |
| .150 · .190 · .230 · .270 · .310 · .350 | storyteller stack A, one line per beat, older lines fall to .62 |
| .395 | stack A collapses (height 0) · *But Ulysses understood what eternity had hidden from Calypso:* |
| .440 | **Life matters because it ends.** · `onProgress` freezes the counter |
| .480 / .485 | `dissolve()` (`.tess-out`, `--go` 0 → 1 over .6 s, reversible) · *If tomorrow were infinite…* |
| .525 / .530 | *why would today be sacred?* · counter layer fades out (.53 → .565) |
| .540 | mobile only: the left column exits so the one-column Forum can land |
| .565 / .586 | Forum rule draws → label `N · NET POSITIVE` |
| .610 | *Tourism's success should not be measured only by arrivals, nights and expenditure.* |
| .650 / .668 | *The ultimate measure:* → the big serif question (`--fs-h2`, caps as in the deck) |
| .700 / .716 | *Net Positive means:* → the chip row (8 `means[]`) |
| .745 / .783 | sub-blocks SERVICE EXCELLENCE, AI AS AN ENABLER (rule → label → line → mono caps) |
| .828 | exit: head, stack, Forum, subs, rules, plate (opacity 0, y −8) — frame empty by .86, before the leaf rises |
| .864 → .884 | *A leaf falls.* rises alone (nothing else is above 0) and is gone by .898 (§5.3 seam rule holds) |
| .880 | `mtf:glyph { letter: 'N' }` dispatched (re-armed below .84); the rail fills N and shines all three |

The counter climbs in `onProgress`, not `onFrame`: `counterVal += |Δp| × 8 437 000`, so it moves only while the
scroll moves (Opałka), never on its own, never backwards, and a direct `?p=` jump seeds it (`p × rate`) so a
headless still shows a number rather than nine zeros. No per-frame work at all — the chapter has no `onFrame`.

## Mood anchors (piecewise-linear, §6.9 table; monotonic params declared explicitly)
Constants: `camX 2 · camY 1.6 · camTilt .04 · camYaw 2π · fov 34 · sunVisible 0 · veil 3 · tessForm 1 · tess 0 · tessSpread 2 · seaSpeed .25 · p1–p3 0 · mosaic 0 · aberration 0`.

| key | anchors |
|---|---|
| camZ | 0 → 2 · .5 → −1 · .85 → −4 (slow push-in) |
| p4 (veil tear) | .1 → 1 · .2 → 0 |
| seaColor | ≤ .50 `#0F5A80` · .72 `#A67C2E` · .85 `#A67C2E` · 1 `#6E4A1E` |
| skyBottom | ≤ .56 `#0F5A80` · .80 `#D9A441` · .85 `#D9A441` · 1 `#A67C2E` |
| skyTop | ≤ .62 `#0F5A80` · .85 `#6E4A1E` · 1 `#3A2A14` |
| haze / seaAmp | .05 / .06 → .15 / .08 over .5–.85 |
| grain · vignette · bloom · warmth | .02 · .2 · .4 · .1 (≤ .5) → .05 · .3 · .6 · .9 (.85) → .06 · .35 · .5 · .7 (1) |
| stars | 0 → .1 over .85–1 |

p 1 equals Ch 10's documented p 0; p 0 equals Ch 08's p 1 (cold `--sky` field, yaw 2π, veil 3 with the tear at 1).
Reduced motion: `mood` is the p 1 still, `.chapter--static` flowing stack, everything visible, no film, no counter.
`html.no-gl`: `--sky-top-static` (gold-deep 35 % on press) / `--sky-bottom-static` (gold-deep).

## Budgets
CSS 4.2 KB (over the 3 KB guide — see issues) · SplitText: the headline only (≤ 3 line nodes) · no `onFrame`,
no per-frame allocations · no `backdrop-filter` · 2 extra DOM nodes for the legibility plate.
