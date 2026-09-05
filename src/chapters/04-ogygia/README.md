# 04 · ogygia — The Tenth Dawn

Canto III · ARRIVAL · clock 23:00 · film 4.5 vh desktop / 3 vh mobile · `inNav: false`.
Spec: DESIGN-BIBLE §6.4. Engine: ENGINE-API.md. Owner files: `index.ts`, `style.css`, this README.

## What it does
The star from Ch 03 drops into the cave of an ink island (§9.5 `island()`), which rises out of its own water line
and is pinned to the cave's world point `(2.6, −.55, −9)` every frame (`world.project` → `--cx/--cy/--ppu` on `.pin`;
the silhouette's width is 3.6 world units, capped at 46 vw / 40 vw). Ripples draw at the shore; an empty instrument
frame (§9.17) surveys the plate while the star lands, then fades. The sea layer's own reflection carries the
"thin gold path" from the cave to the camera, so the chapter draws none of its own. Fourteen storyteller lines run
as three stacks of ≤ 5 on the left; the Foundation's second movement runs as four replacing beats (the host → the mission → the numbers → the close,
date chip and hotel link), the numbers opening into a full-width band across the sky. At p .86 the chapter sets
`data-veil-line` on `#veil` (*Kalyptein. / To cover. To conceal. / To draw a veil.*); the veil enters p .88 → 1.
The attribute lives only for this crossing: set while .86 ≤ p < 1, removed below .84, at the seam (p ≥ .999) and in
`onLeave` (both directions) — otherwise the line leaked into every later veil crossing (QA round 1, Ch 07→08).

## Beats (p → what happens; all on the scrubbed `tl`, ease none)
Re-spaced for the longer film (`src/engine/pacing.ts`, `ogygia: 1.2` on a declared 4.5 vh → ≈ 5.4 screens).
Substantive beats are ≥ 4 % of p apart and no stretch longer than 12 % of p is idle.

| p | beat |
|---|---|
| .06–.30 | island rises (`yPercent 100 → 0`); the star drops to the cave (mood); eyebrow rule .06, eyebrow .08, coordinates .10, headline lines .12–.17 |
| .12–.24 | instrument frame draws (`--draw`), fades .28–.34 |
| .18–.40 | three ripple rings draw at the shore (`strokeDashoffset`), fade .32–.40 |
| .21–.318 | storyteller stack 1 (A nymph … An ancient name), one line per .02, older lines to 55 % |
| .328–.436 | stack 2 (Primeval … Honey-coloured limestone) |
| .446–.534 | stack 3 (Caves watching the horizon … Its soul carved in stone) |
| .534 | the whole left column clears at once — headline **and** stack 3 — so the Forum never shares the frame with the story (§5.4.2) |
| .50–.72 | the Mediterranean rises out of the sea (mood: `tess` 0 → 1, `tessSpread` 3 → 1, `tessGlint` → 1) |
| .540 / .565 | Forum rule draws → `WHO IS MTF?` label (both hold to .868) |
| .578–.652 | movement A: name, lines[0], lines[2], tagline (gold mono) |
| .662–.720 | movement M: the mission serif `h2`, alone in the frame |
| .728–.796 | the numbers: three hairlines draw, then each stat lands whole (`countUp` once on the first upward crossing of .735) |
| .806–.876 | movement C: closing line, ONE MEDITERRANEAN CONVERSATION., date chip (VENUE TO BE ANNOUNCED), BOOK A HOTEL IN MALTA ↗ → `#ch-register` |
| .86–.999 | `data-veil-line` on `#veil` (removed below .84, at p ≥ .999 and in `onLeave`, both directions) |
| .868–.89 | rule, label and the Forum column exit (seam rule: frame empty by .90) |
| .88–1 | `veil` 0 → .5 (mood) |

## Placement — the no-overlap contract
The mosaic Mediterranean fills the middle band of the frame from p ≈ .72 (screen y ≈ 435–700 at 1440 × 900),
and the fixed chrome owns the top 72 px, the left 60 px (rail), the bottom 60 px (corner labels) and, under
600 px, the bottom 120 px (REGISTER pill). **Every block this chapter prints therefore lives in the upper band,
y ≈ 100 → 430** (`.head` top 12 %, `.stack` top 33 %, `.forum` top 13 %, `.statband` top 21 %; mobile 11 / 30 / 10 / 16 %),
and the two columns never run at the same time. Two consequences, both deliberate:
- The **stat trio breaks out of the Forum column** into a full-width three-column band (`.statband`, left 7 % → right 7 %,
  one drawn hairline per stat). Stacked at the bible's `--fs-stat` it is ~390 px tall — it cannot fit the 330 px band,
  and in the right column it printed straight over the mosaic (tiles behind the digits, labels illegible). Widening it
  keeps the bible's scale and puts all three numbers on clean sky. Everything else keeps the bible's right column.
- `.head` moved from top 15 % → 12 % and `.stack` from 38 % → 33 % so the storyteller's tallest group (6 visual lines)
  clears both the headline above it and the ink island below it at every p.

## Mood anchors (§6.4 table, piecewise-linear; monotonic keys declared explicitly)
- cam: (1.2, 1.1, 7) tilt .30 yaw 0 fov 40 → p .3 (1.6, .8, 5) tilt .08 yaw −.22 fov 36 → p .72 (2, 1.4, 2) tilt −.12 yaw −.32 fov 34 → p 1 tilt −.08.
- star: (1.2, .9, −8) r .2 glow 1.6 heat 0 → p .3 cave (2.6, −.55, −9) r .12 glow 1.2 heat .15 → p .72 glow 1 heat .2 → p 1 r .1 glow .6.
- sky: top `#090D16` held; bottom `#06192B` → `#0E3D57` by p .3; haze .1 → .2; seaAmp .12 → .1; stars .7 → .5 → .4; warmth .15 → .2 → .35 → .3; bloom .7 → .6 → .5.
- tesserae: `tessForm 1` throughout, `tess` 0 → 1 and `tessSpread` 3 → 1 over p .50–.72, `tessGold` .7 → .55, `tessGlint` .5 → 1 → .7, `mosaic 0`.
- `veil` 0 → .5 from p .88 · `camYaw` 0 → −.32 · `p4 0`. p 1 equals Ch 05's p 0 row (the Stage blends `tessGlint` .7 → .3).
- Mobile: `camYaw` 0 → −.12 → −.10 (→ −.32 at p 1) so the cave stays inside the portrait frame; the Stage's blend to Ch 05 pans the island off-left from ≈ p .78 as the mosaic pans in.
- Reduced motion: `STILL` = the p 1 state with `veil 0` (the island visible; the seam blend carries the cloth across).

## Budgets
- CSS 3.7 KB (slightly over the 3 KB budget — the full-width stat band), tokens only, every selector under `#ch-ogygia`.
- DOM: 14 `p.s`, one `h2` (SplitText lines only), `ul.statband` with three `li.stat`, one `a`. No per-frame allocations; `onFrame` writes three CSS vars only when the projection moves ≥ .3 px.
- `npm run typecheck` and `npm run build` pass.

## QA (§11) — screenshots in `shots/pp-ogy-*.png`
`?p=` equals film p (lead amendment: the Stage's p is the pinned travel from `--film-len`).
- `pp-ogy-c0.png` p 0: empty frame, the star at the horizon under the starfield. ✓ seam rule.
- `pp-ogy-c.3.png` p .3: eyebrow, coordinates, headline, storyteller stack 1, the instrument frame and the ripples on the ink island. ✓
- `pp-ogy-c.5.png` p .5: headline + stack 3, the island low and clear of the type. ✓
- `pp-ogy-c.62.png` / `pp-ogy-c.69.png`: the host, then the mission alone in the frame over the rising mosaic. ✓
- `pp-ogy-c.79.png` p .79: the three numbers whole across the sky, hairlines drawn, entirely clear of the mosaic. ✓
- `pp-ogy-c.86.png` p .86: the close, the date chip and BOOK A HOTEL over dark sea, above the mosaic. ✓
- `pp-ogy-m.5.png` / `pp-ogy-m8b.png` / `pp-ogy-m86b.png` 390 × 844: same composition stacked; nothing under the REGISTER pill. ✓
- Backward scrub verified by re-shooting descending p; no stranded lines (the stack-3 exit now sits after its last line lands).

## Known gaps / notes for the lead
- The cave's world point is a constant here (`CAVE`); it must match the `sunX/Y/Z` in the mood table (it does). If the sun layer moves the star, move `CAVE`.
- On portrait the world's geometry cannot hold both the star/island and the mosaic Mediterranean (anchored at x 5.2) in frame at once; the chapter favours the island until the seam blend pans on.
- `frame()` (art) injects a `<style>` block into the fx layer; it is unscoped by design of the art agent.
- `.statband` is a chapter-local component (a full-width `.stat` row with a drawn hairline per stat). If another chapter needs the same band, the lead may hoist it to `components.css`.
- The stat trio uses `countUp` from engine/text (a ScrollTrigger `once` per numeral), invoked on the first upward crossing of p .735.
