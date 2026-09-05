# 07 · eleven — Seven Years, Eleven Editions

Canto VI · TIME · 11 for 11 · clock 01:00 → 04:00 · DESIGN-BIBLE §6.7. Film 5 vh desktop / 3 vh mobile.
The stillest chapter: the camera is locked (`camX 2, camY 2, camZ 2, camTilt −.06, camYaw 0, fov 34`) while the sky
time-lapses (2.5 unhurried day/night passes); the eleven think tanks are set into a mosaic wall as DOM tesserae; the numeral 11 drifts `"opsz" 144 → 60`.
Nav: `03` · label `Seven Years, Eleven Editions`. `html.theme-paper` is removed at mount, onEnter and onProgress.

## Beats (p → what happens; every beat is a tween on the scrubbed `tl`, ease none)

| p | beat |
|---|---|
| < .06 | frame empty (seam rule) |
| .06–.115 | the graded wash fades up · eyebrow rule draws → eyebrow text (.085) → date stamp (.085); the island fades up |
| .11–.175 | headline lines rise (SplitText masked lines, 3 lines at 1440) |
| .12–.70 | the numeral **11** (both `.opsz` spans) drifts `"opsz" 144 → 60` — "they stopped counting" |
| .17 / .21 / .25 / .29 | storyteller I: *At first they counted the days.* / *Then the months.* / *Then…* / *they stopped counting.* (one line every 4% of p; older lines go faint, 3 visible) |
| .32 | portrait only: the first stack clears the single voice slot for the Forum |
| .34–.46 | Forum: rule → `11 FOR 11` label → formula → who → outputs chips (stagger) → `THINK → CHALLENGE → DESIGN → ACT` |
| .35–.40 | the four group sectors: hairlines draw, then `01–03 PEOPLE & INNOVATION` … labels |
| .38–.42 | the wall's plate arrives whole — eleven empty sockets in hairline grout |
| .41–.675 | the eleven are set into it one at a time (`--fill` + 14 px rise via `translate`, .023 apart ≈ 850 px of scroll each) |
| .60 | portrait only: the Forum body vacates the voice slot (the CTA stays) |
| .64–.73 | the world ages around them: `--age` 0 → 1 (the grain darkens) and the wall recedes (`--dim`) so the storyteller is heard over it |
| .67 / .70 / .73 / .76 / .79 | storyteller II: *Life never announces:* / *Remember this moment.* / *It simply happens.* / *And only later do we understand:* / **THAT WAS OUR LIFE.** |
| .795 | portrait only: the wall exits before the call to action (one column never holds both) |
| .83 | `JOIN A THINK TANK →` (mailto, route TBC) |
| .865–.895 | everything exits (opacity 0, −8 px); the island and the wash fade |
| .86–1 | the veil crosses again behind (mood `veil` 1 → 1.6), carrying nothing |

Spacing: no narrative beat is closer than ~3.5% of p to the next and no stretch of ≥ 12% of p is empty — at the pacing
table's `eleven: 1.5` (7.5 vh of film, ≈ 6,750 px at a 900 px viewport) that is ≥ 240 px of scroll per beat. The declared
`length` (5 / 3) is unchanged; the multiplier is the pacing table's.

The date stamp `EDITION XI · X · … I` (Roman numerals only — edition years are TBC, Appendix C) ticks backwards on the same
decelerating curve as the sky, resting on `I` at p .7. It is driven from `onProgress` and from a proxy tween on `tl`
(cached elements, no queries, no allocations). Hidden on mobile.

## Sky time-lapse (computed in `mood(p)`)

`c(p) = 2π · 2.5 · smoothstep(p / .7)` — accelerates, then decelerates to a stop at p .7 where `c ≡ 3π/2` (deep night, held to p 1).
`day = max(0, sin c)`. Per frame: `sunX = 2 − 26·cos c` at `sunZ −55` (a wide far arc: the sun rises at one horizon and sets at the other),
`sunY = −1.4 + 9·sin c`, `sunVisible` smoothsteps through the horizon,
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

## Layout — three regions that never touch

The chapter's one hard constraint is that the sun crosses the whole frame two and a half times, so **no fixed block can
be safe from the glare by placement alone**. The answer is three regions plus one graded wash:

Desktop (1440 × 900): **left column** = head `left 7% top 9%` (max-width `min(44%, 40rem)`, 3 headline lines ending
≈ 37%) and the storyteller stack `top 38.5%` (`min(42%, 38rem)`, 3 visible lines ending ≈ 52%). **Right column** =
the Forum `right 7% top 20%` width `min(33%, 29rem)` (ends ≈ 53%); the date stamp sits above it at `right 7% top 9%`,
clear of the header's REGISTER pill. **Lower band** = the four group sectors at `54.5%` and the wall of eleven
`58.5% → 93%`. The two columns are 10% of the frame apart; the band starts 2.5% below the deepest column.

The wall is **one plate with 1 px grout**, not eleven cards on the sea: a 12-track grid, each tile spans 2, the 7th
starts on track 2 (6 + 5 brickwork, odd row offset ½ cell, the two end half-cells left as plate). The plate arrives
whole at .38 and each tile's `--fill` raises its own ground and content from an empty socket — so the wall reads as
composed at every scroll position instead of as missing tiles. Tile: numeral + group mark on a hairline top row,
title (Fraunces 400, 3-line clamp), subtitle (`--fs-fine`, 2-line clamp, `--fg-muted`).

`.wash` is a full-frame ND filter (three feathered gradients: left column, right column, rising floor) whose depth is
tied to `--day` — the same value that flickers the island — so every block keeps its contrast through noon without a
visible box anywhere. A matching `--day`-weighted text halo backs the headline, storyteller, eyebrow and stamp.

The card (`.tile__card`) takes the Forum's column at `right 7% top 17%`, `max-height 66%`, on an opaque `--press`
ground; the Forum goes to opacity 0 (not .12) so nothing ghosts underneath.

Mobile (< 820 px): one column, and therefore **one voice slot** at `top 34%` shared in time, never in space — the
storyteller stack clears it at .32, the Forum body vacates it at .60, the second stack takes it back at .67. The wall
becomes the ledger it always was: eleven hairline-ruled rows (numeral + title on one line, ellipsis) from `47%` to
`bottom 16%`, which clears the bottom corner labels and the fixed REGISTER pill. The card is a sheet laid over the
wall's band rather than an extra grid row (an in-place row would push the last tiles below a pin that cannot scroll).
Island, stamp, `who`, outputs, sectors, subtitles and group marks are hidden.

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

- Composed and checked at p 0 / .25 / .45 / .5 / .75 / .95 (1440 × 900) and p .5 / .62 (390 × 844): no block touches
  another at any position, nothing sits in the sun's glare unbacked, nothing runs under the header, the rail label,
  the corner labels or the mobile REGISTER pill, nothing leaves the frame. Typecheck + build clean.
- CSS is ~1.3 KB (minified) over the §11 3 KB budget — the wall, the card, the portrait recomposition and the wash.
- The tile numeral uses `--fs-h3`-ish (bible §7.12 says `--fs-h2`) so two rows of eleven tiles fit the lower band at
  900 px tall without clipping a title.
- Portrait deviates from §6.7's "two-column brickwork / card expands in place": eleven Fraunces titles do not fit two
  columns of a 844 px frame, so the wall is a one-line ledger and the card is a sheet over it. Flagged for the lead.
- `JOIN A THINK TANK →` route is TBC (mailto placeholder, Appendix C).
