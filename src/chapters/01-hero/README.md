# 01 · hero — The Sun

Overture · AWE · 16:56 · SUNSET · film 3 vh desktop / 2 vh mobile · `id: 'hero'`, `navIndex '01'`, `inNav: true`.
Spec: `design/DESIGN-BIBLE.md` §6.1. Files: `index.ts`, `style.css` (3.5 KB, `#ch-hero` only, tokens only), this README.

## What it is
The sun sets inside the word **SUN**. The word is an inline-SVG knockout plate (`.pin__layer.plate`): a `--press` rect with three
holes cut by a `<text>` mask (Fraunces 320, `opsz 144`, `-.04em`). The fixed WebGL world shows through the holes; the plate's
baseline is glued to the world's sea horizon every frame (`world.project` of a point 400 units out on the sea plane), so the
sun billboard sits on the letters' feet and sinking it drains the light out of the letters top-down. Everything else is type
on the plate. `<h1>` = `Mediterranean` + sr-only `SUN`; the plate is `aria-hidden`.

Sizing (JS, on mount / fonts.ready / `mtf:ready` / resize): cap height = `--fs-sun` (read from a probe element),
**bounded by the head's own measured height**: the word rides the horizon, so it is sized against the *highest*
baseline the chapter ever reaches (`horizonPct(moodAt(1))`) minus `HEAD_MIN` (92 px desktop / 84 px mobile — the fixed
header ends at 75 px) minus the measured `head.offsetHeight` plus 10 px. The head can therefore never slide under the
header as the horizon rises, and the CSS `bottom: min(…)` clamp is a second belt on the same invariant. Cap and advance
ratios are measured once from the loaded font via canvas `measureText`. The pin carries `--sun-top`, `--sun-base`,
`--sun-w`, `--head-h` (px) and every type block hangs from them.

## No-overlap invariants (QA round 2 — measured at 1440×900, 1920×1080, 390×844 across p 0→.95)
| block | where | clears |
|---|---|---|
| head (rule · eyebrow · *Mediterranean*) | left 7 %, hung off `--sun-top`, floored at `--head-min` | header (0–75) by ≥ 23 px at every p; cap top by 10 px |
| Forum column | left 7 %, `--sun-base` + `--band`, width `--col` = `min(38%,32rem)` | starts below the baseline — never inside a letter aperture |
| question cards + `WATCH MTF10` | right 7 %, same top, same width | 214 px alley to the Forum column; ≥ 27 px above the corner marks |
| storyteller stitch | desktop bottom-left `bottom 10.5vh` (§4.2 sign-off); portrait `bottom 7.4rem`, in the slot the mono link vacates at .77 | ≥ 41 px under the Forum lines, ≥ 43 px over the corner marks, ≥ 14 px under the portrait cards, clear of the < 600 px REGISTER dock |
| everything | — | inside the viewport; the rail (x ≤ 76) is left of the 7 % gutter |

Legibility is structural, not cosmetic: the knockout plate is an opaque `--press` rect, so **every line of copy sits on
ink** and only the three letter apertures show the world. No scrim is needed anywhere in this chapter — the fix for the
one block that used to sit beside a letter (the stitch) was placement, per the brief's order of tools.

## Beats (p → what happens)
Re-spaced for the longer film (`src/engine/pacing.ts` × 1.2 → 2340 px of travel at 900 px): **13 beats, one every
5–8 % of p (~180 px of scroll each), no gap over 8 %, nothing clumped**. The Forum column and the question cards now
INTERLEAVE instead of running as two stacks that fired two beats at a time.

| p | beat |
|---|---|
| ready | (time-based, once) eyebrow rule draws 1.15 s → eyebrow fades .32 s → *Mediterranean* line-masks up with **wght 200 → 300** (the film's one axis tween). The plate and the sun are already there — the preloader's sun rise is the reveal. |
| .10 | Forum hairline draws under the word (left 7 %) |
| .16 | sub-line *Stewardship · Unity · Net Positive* (Fraunces 300 `--fs-h3`) settles |
| .22 | question card **S** — corner marks → four rules → gold glyph → label, the whole card composed inside ~3 % of p so the scrub never rests on an empty frame |
| .28 | Forum line 1 |
| .34 | question card **U** |
| .40 | Forum line 2 |
| .46 | question card **N** |
| .52 | Forum line 3 (in `--cream`) |
| .58 | `WATCH MTF10 ↗` mono link under the cards (new tab) |
| .45–.64 | **mood**: the tesserae scatter (`tess` 1 → .3); the sun barely moves |
| .64 | ember glint on the baseline (fx layer, `--flame`/`--gold-leaf`, `scaleX .18`) |
| .60–.78 | **mood**: the sun sinks through the sea line inside the U (`sunY` −.5 → −1.9, camera rising −.9 → .6); sky `#8C3A2B → #3A1A14`; glow 1 → .55; warmth .8 → .55 |
| .72 | the ember opens to the full width of the word — the last light along the horizon |
| .79 | storyteller stitch *The Sun fills the screens.* — tiny, `--fg-faint`, bottom-left sign-off |
| .85–.90 | everything exits (opacity 0, −8 px), ember included. The plate stays to p 1: black on black hands over to Ch 02 |

Portrait (< 820 px) runs the same beats as a strict **sequence in one band**, so two blocks are never stacked:
rule .09 · sub .15 · lines .22/.29/.36 · Forum out .43 · cards .47/.54/.61 · link .67 · ember .73 · ember opens +
link out .77 · stitch .81 (in the slot the link vacated) · exit .86. `--fs-sun` 26 vw keeps the knockout full width;
horizon nearer 54 % (`camTilt` .025); no parallax; sun radius .55.
Desktop: ±6 px pointer parallax on the type (`--mx/--my` on `.hero__type`, written only when the pointer moves); the
card glint `--mx/--my` comes from one delegated `pointermove` on the list.

## Mood anchors (declared explicitly; everything else = DEFAULT_MOOD)
| p | camY | camZ | camTilt | sunY | sunR | sunGlow | skyBottom | haze | seaAmp | tess | tessGold | tessGlint | stars | bloom | warmth |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | −1.0 | 8 | .07 | −.35 | 1.2 | 1 | #B44A2D | .3 | .12 | 1 | .9 | .8 | .15 | .9 | .85 |
| .45 | −.95 | 7.6 | .07 | −.42 | 1.2 | 1 | #8C3A2B | .3 | .12 | 1 | — | — | .2 | .9 | — |
| .6 | −.9 | — | — | −.5 | — | 1 | — | — | — | (.64 → .3) | — | — | — | — | .8 |
| 1 | .6 | 7 | .05 | −1.9 | 1 | .55 | #3A1A14 | .25 | .14 | .2 | .6 | .3 | .35 | .7 | .55 |

Constant: `fov 34 · camX 0 · camYaw 0 · sunX 0 · sunZ −6 · sunHeat 1 · seaY −1.2 · seaSpeed .35 · tessForm 0 · tessSpread 1 ·
veil 0 · p1–p4 0 · mosaic 0 · aberration 0 · skyTop #090D16`. p 1 equals Ch 02's documented p 0 row.

**Why camY differs from the bible's table (1.1 → .6):** with the camera at y 1.1 the sun at y −.35 projects ~17 % *below* the
sea line (the disc writes depth and is cut by the water), so nothing would be visible in the letters. The preloader's sun rise
ends at `sunY −.35` (its constant) and the tesserae hero disc is baked at world y .9, so the only free variable was the camera:
at y −1.0 (0.2 above the water, tilt .07) the disc sits on the line with its lower fifth below it and the horizon at 62 %,
exactly the still the section describes. Reduced motion holds the sunset (`p ≤ .45`) as the chapter's still.

## Budgets / status
- CSS 4.2 KB · DOM ≈ 60 nodes + 1–2 SplitText lines · `onFrame`: one `project()`, two threshold-guarded attribute/property writes, no allocations, no queries.
- Copy verbatim from `content.json` (`event.*`, `theme.lines`, `theme.questions`, `registration.watchLastYear.currentUrl` — carried from 2025, opens in a new tab); the stitch is the bible's stage direction.
- Stills checked at 1440×900 (p 0, .25, .5, .75, .95), 1920×1080 (p .75) and 390×844 (p .5): one primary object, one
  hairline, one mono label; frame empty for p > .90 (at .95 only the plate and its ember-lit letters remain).
- `html.no-gl`: `--sky-top-static: --press`, `--sky-bottom-static: color-mix(ramla 40 %, press)` on the pin.
- Known gaps: at 1440×900 the head clearance costs the word ~22 % of its ideal `--fs-sun` cap (291 px of a possible
  374) — the 900 px viewport genuinely cannot hold head + word + two columns at full scale; at 1920×1080 the word runs
  at the full `--fs-sun`. On portrait the rail's S·U·N glyphs sit at x 5–15, 9 px left of the 24 px gutter.
