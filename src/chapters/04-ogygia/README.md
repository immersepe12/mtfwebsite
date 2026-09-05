# 04 · ogygia — The Tenth Dawn

Canto III · ARRIVAL · clock 23:00 · film 4.5 vh desktop / 3 vh mobile · `inNav: false`.
Spec: DESIGN-BIBLE §6.4. Engine: ENGINE-API.md. Owner files: `index.ts`, `style.css`, this README.

## What it does
The star from Ch 03 drops into the cave of an ink island (§9.5 `island()`), which rises out of its own water line
and is pinned to the cave's world point `(2.6, −.55, −9)` every frame (`world.project` → `--cx/--cy/--ppu` on `.pin`;
the silhouette's width is 3.6 world units, capped at 46 vw / 40 vw). Ripples draw at the shore; an empty instrument
frame (§9.17) surveys the plate while the star lands, then fades. The sea layer's own reflection carries the
"thin gold path" from the cave to the camera, so the chapter draws none of its own. Fourteen storyteller lines run
as three stacks of ≤ 5 on the left; the Foundation's second movement runs as three replacing sub-stacks in the right
column (the host → the stat trio → the close, date chip and hotel link). At p .86 the chapter sets
`data-veil-line` on `#veil` (*Kalyptein. / To cover. To conceal. / To draw a veil.*); the veil enters p .88 → 1.
The attribute lives only for this crossing: set while .86 ≤ p < 1, removed below .84, at the seam (p ≥ .999) and in
`onLeave` (both directions) — otherwise the line leaked into every later veil crossing (QA round 1, Ch 07→08).

## Beats (p → what happens; all on the scrubbed `tl`, ease none)
| p | beat |
|---|---|
| .06–.30 | island rises (`yPercent 100 → 0`); the star drops to the cave (mood); eyebrow rule .06, eyebrow .08, coordinates .10, headline lines .11–.16 |
| .12–.24 | instrument frame draws (`--draw`), fades .28–.34 |
| .20–.42 | three ripple rings draw at the shore (`strokeDashoffset`), fade .34–.42 |
| .30–.405 | storyteller stack 1 (A nymph … An ancient name), one line per .02, older lines to 55 % |
| .41–.515 | stack 2 (Primeval … Honey-coloured limestone) |
| .52–.62 | stack 3 (Caves watching the horizon … Its soul carved in stone) |
| .50–.72 | the Mediterranean rises out of the sea (mood: `tess` 0 → 1, `tessSpread` 3 → 1, `tessGlint` → 1) |
| .53 / .57 | Forum rule draws → `WHO IS MTF?` label |
| .58 (.50 mobile) | head exits |
| .59–.70 | movement A: name, line 0, mission (serif h2), line 2, tagline (gold mono) |
| .71–.785 | movement B: the stat trio (`.stat`), `countUp` fires once on the first upward crossing of .70 |
| .80–.88 | movement C: closing line, ONE MEDITERRANEAN CONVERSATION., date chip (VENUE TO BE ANNOUNCED), BOOK A HOTEL IN MALTA ↗ → `#ch-register` |
| .86–.999 | `data-veil-line` on `#veil` (removed below .84, at p ≥ .999 and in `onLeave`, both directions) |
| .88–.90 | everything exits (seam rule) |
| .88–1 | `veil` 0 → .5 (mood) |

## Mood anchors (§6.4 table, piecewise-linear; monotonic keys declared explicitly)
- cam: (1.2, 1.1, 7) tilt .30 yaw 0 fov 40 → p .3 (1.6, .8, 5) tilt .08 yaw −.22 fov 36 → p .72 (2, 1.4, 2) tilt −.12 yaw −.32 fov 34 → p 1 tilt −.08.
- star: (1.2, .9, −8) r .2 glow 1.6 heat 0 → p .3 cave (2.6, −.55, −9) r .12 glow 1.2 heat .15 → p .72 glow 1 heat .2 → p 1 r .1 glow .6.
- sky: top `#090D16` held; bottom `#06192B` → `#0E3D57` by p .3; haze .1 → .2; seaAmp .12 → .1; stars .7 → .5 → .4; warmth .15 → .2 → .35 → .3; bloom .7 → .6 → .5.
- tesserae: `tessForm 1` throughout, `tess` 0 → 1 and `tessSpread` 3 → 1 over p .50–.72, `tessGold` .7 → .55, `tessGlint` .5 → 1 → .7, `mosaic 0`.
- `veil` 0 → .5 from p .88 · `camYaw` 0 → −.32 · `p4 0`. p 1 equals Ch 05's p 0 row (the Stage blends `tessGlint` .7 → .3).
- Mobile: `camYaw` 0 → −.12 → −.10 (→ −.32 at p 1) so the cave stays inside the portrait frame; the Stage's blend to Ch 05 pans the island off-left from ≈ p .78 as the mosaic pans in.
- Reduced motion: `STILL` = the p 1 state with `veil 0` (the island visible; the seam blend carries the cloth across).

## Budgets
- CSS 3.0 KB (≤ 3 KB), tokens only, every selector under `#ch-ogygia`.
- DOM: 14 `p.s`, one `h2` (SplitText lines only), `ul.stats` with three `li.stat`, one `a`. No per-frame allocations; `onFrame` writes three CSS vars only when the projection moves ≥ .3 px.
- `npm run typecheck` and `npm run build` pass.

## QA (§11) — screenshots in `shots/ogygia-*.png`
`?p=` equals film p (lead amendment: the Stage's p is the pinned travel from `--film-len`).
- `ogygia-0.png` p 0: empty frame, star at the horizon under the starfield. ✓ seam rule.
- `ogygia-05.png` p .5: eyebrow + coordinates + headline, storyteller stack 2, the island with the star in its cave and its reflection path. ✓
- `ogygia-09.png` p .9: empty frame, the veil crossing with the Kalyptein line, the mosaic Mediterranean on the water. ✓
- `fix-ogygia-veil-line.png` / `fix-ogygia-eleven-09.png`: after the leak fix — the line is on the cloth at `?chapter=ogygia&p=.9` and absent at `?chapter=eleven&p=.9` on a fresh load. ✓
- `ogygia-05-m.png` 390 × 844 p .5: same composition stacked; the island at 40 vw with the star in the cave. ✓
- Forum movements A/B/C, the stat column (y 252–650 at 1440 × 900, clear of the island) and the reduced-motion flowing stack were verified by DOM measurement (no console errors).

## Known gaps / notes for the lead
- The cave's world point is a constant here (`CAVE`); it must match the `sunX/Y/Z` in the mood table (it does). If the sun layer moves the star, move `CAVE`.
- On portrait the world's geometry cannot hold both the star/island and the mosaic Mediterranean (anchored at x 5.2) in frame at once; the chapter favours the island until the seam blend pans on.
- `frame()` (art) injects a `<style>` block into the fx layer; it is unscoped by design of the art agent.
- The stat trio uses `countUp` from engine/text (a ScrollTrigger `once` per numeral), invoked on the first upward crossing of p .70.
