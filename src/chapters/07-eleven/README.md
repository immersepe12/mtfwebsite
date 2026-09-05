# 07 · eleven — Seven Years, Eleven Editions

Canto VI · TIME · 11 for 11 · clock 01:00 → 04:00 · DESIGN-BIBLE §6.7. Film 5 vh desktop / 3 vh mobile.
The stillest chapter: the camera is locked (`camX 2, camY 2, camZ 2, camTilt −.06, camYaw 0, fov 34`) while the sky
time-lapses; the eleven think tanks assemble as DOM tesserae; the numeral 11 drifts `"opsz" 144 → 60`.
Nav: `03` · label `Seven Years, Eleven Editions`. `html.theme-paper` is removed at mount, onEnter and onProgress.

## Beats (p → what happens; every beat is a tween on the scrubbed `tl`, ease none)

| p | beat |
|---|---|
| < .06 | frame empty (seam rule) |
| .06–.14 | eyebrow rule draws → eyebrow text (.09) → date stamp (.09); the island fades up on the horizon |
| .11–.17 | headline lines rise (SplitText masked lines, 3 lines at 1440) |
| .12–.72 | the numeral **11** (both `.opsz` spans) drifts `"opsz" 144 → 60` — "they stopped counting" |
| .15 / .18 / .21 / .24 | storyteller I: *At first they counted the days.* / *Then the months.* / *Then…* / *they stopped counting.* (4 px rise; older lines go `--fg-faint`; 3 visible, older ones collapse) |
| .26–.38 | Forum: rule → `11 FOR 11` label → formula → who → outputs chips (stagger) → `THINK → CHALLENGE → DESIGN → ACT` |
| .27–.33 | the four group sectors: hairlines draw, then `01–03 PEOPLE & INNOVATION` … labels |
| .31–.645 | the eleven tiles assemble one at a time (autoAlpha + 14 px rise via `translate`, .03 apart) |
| .70–.85 | the tile grain darkens (`--age` 0 → 1: sand 8% → 3%) — "the world ages around them" |
| .70 / .73 / .76 / .79 / .82 | storyteller II: *Life never announces:* / *Remember this moment.* / *It simply happens.* / *And only later do we understand:* / **THAT WAS OUR LIFE.** |
| .83 | `JOIN A THINK TANK →` (mailto, route TBC) |
| .87–.90 | everything exits (opacity 0, −8 px); the island fades |
| .86–1 | the veil crosses again behind (mood `veil` 1 → 1.6), carrying nothing |

The date stamp `EDITION XI · X · … I` (Roman numerals only — edition years are TBC, Appendix C) ticks backwards on the same
decelerating curve as the sky, resting on `I` at p .7. It is driven from `onProgress` and from a proxy tween on `tl`
(cached elements, no queries, no allocations). Hidden on mobile.

## Sky time-lapse (computed in `mood(p)`)

`c(p) = 2π · 5.75 · smoothstep(p / .7)` — accelerates, then decelerates to a stop at p .7 where `c ≡ 3π/2` (deep night, held to p 1).
`day = max(0, sin c)`. Per frame: `sunX = 2 + 4·cos c` (the camera sits at x 2, so the sun rises at the right frame edge
and sets at the left, its noon core between the two type columns), `sunY = −.6 + 3.6·day`, `sunVisible = sin c > 0`,
`warmth = .35 + .65·day`, `skyTop = mix(#090D16, #A9CBDD, day)`, `skyBottom = mix(#06192B, #E8DCC2, day)`,
`seaColor = mix(#0E3D57, #D6C39C, day)`, `stars = 1 − day`. The DOM island (`art/island`, `--day` on the pin) flickers
`--press` ↔ `--sand` with it.

## Mood anchors (declared explicitly every frame)

| key | value |
|---|---|
| camera | `camX 2, camY 2, camZ 2, camTilt −.06, camYaw 0, fov 34` fixed |
| tess / tessForm / tessSpread | 1 / 1 / 1 |
| tessGold · tessGlint | .4 → .3 · .5 → .2 (linear over p) |
| haze · seaAmp · seaSpeed | .3 → .12 · .1 → .08 · .5 → .35 (from p .7 to 1) |
| constellation | 0 → 2 over p .7–.86 (hands over to Ch 08's Orion + the Bear) |
| veil | 1 until p .86, then 1 → 1.6 at p 1 |
| p4 | 0 |
| grain · bloom · sunRadius · sunGlow · sunHeat | .05 · .5 · .5 · .8 · 1 |
| reduced motion | static `STILL` = the p 1 state (deep night, veil 1.6, stars 1, constellation 2) |

p 1 = Ch 08's documented p 0 (night sky, no sun, stars 1, constellation 2, tess 1, veil 1.6, camYaw 0).
`--sky-top-static: var(--press)` / `--sky-bottom-static: var(--abyss)` on the pin for `html.no-gl`.

## Layout

Desktop (1440 × 900): head `left 7% top 8%` (max-width 46%), date stamp `right 7% top 8%`, storyteller stack `top 36%`
(3 visible lines — the rail's fixed chapter label sits at ≈ 48%), Forum column `right 7% top 22%` width `min(38%, 34rem)`,
group sectors at `50.5%`, tiles `54% → 95%`: a 12-track grid, each tile spans 2, the 7th starts on track 2 (6 + 5
brickwork, odd row offset ½ cell). Tile: numeral (Fraunces 300 `--fs-h3`), title (Fraunces 400 ≥ 18 px, 3-line clamp),
subtitle (sans `--fs-fine`, 2-line clamp), group chip (mono `--fs-index`) at the foot. The card (`.tile__card`) slides in
at `right 7% top 20%` over the Forum column (which fades to .12) with description, keyword chips and the closing line
(04 uses `closingLineFromSpecialistEvent`; 11 shows both closing lines). The island is small (17.5% wide, centred at
46%) and sits on `--horizon-now` between the two columns so type never crosses it.

Mobile (< 820 px): head 10%, stack 29.5%, Forum 40% (formula + process + CTA only), tiles 55% → 95% as a
two-column, six-row grid that scrolls inside the pin (`data-lenis-prevent`); tiles show numeral + title (4-line clamp);
tap expands the card in place after the tile's row. Island and stamp hidden.

Interaction: tiles are `<button aria-expanded aria-controls>`; hover (mouse) / focus open the card, click pins it,
arrow keys move focus in the grid (Home/End too), Esc closes and returns focus, `focusout` closes an unpinned card.
Tessera glint from a per-tile `pointermove` (`--mx --my`).

Reduced motion: `chapter--static`, the same DOM flowing (`.pin__frame > *` static, `--gap-y` apart), all copy visible,
tiles as an auto-fill grid, the card in place.

## Budgets

- SplitText: 3 line nodes (the headline only); storyteller lines are whole `<p>`s.
- CSS ≈ 4.5 KB raw / ≈ 4.1 KB minified — **over the 3 KB budget** (eleven tiles + card + mobile + static recomposition); see below.
- No per-frame allocations; `onProgress` touches two cached elements and only when a value changes.
- No `backdrop-filter`; the tile and card faces are `color-mix` tints.

## Status / known gaps

- Composed at p 0 / .5 / .85 / .9 (1440 × 900) and p .5 (390 × 844); typecheck + build clean.
- CSS is ~1.1 KB (minified) over the §11 budget; the largest remaining items are the tile (glint, clamps, chip) and the mobile block.
- The tile numeral uses `--fs-h3` (bible §7.12 says `--fs-h2`) so two rows of tiles fit the lower 41% at 900 px tall.
- Mobile "two-column brickwork": a half-cell offset in two columns cannot be drawn without clipping, so mobile rows are
  not offset; the tiles grid scrolls inside the pin because eleven Fraunces titles do not fit 45% of an 844 px frame.
- By day the cream type sits on a paper-coloured sky for a few hundred px of scroll per cycle (as specified: the flicker
  lives in the world; the tiles and card carry an abyss tint for legibility).
- `JOIN A THINK TANK →` route is TBC (mailto placeholder, Appendix C).
