# 01 · hero — The Sun

Overture · AWE · 16:56 · SUNSET · film 3 vh desktop / 2 vh mobile · `id: 'hero'`, `navIndex '01'`, `inNav: true`.
Spec: `design/DESIGN-BIBLE.md` §6.1. Files: `index.ts`, `style.css` (3.4 KB, `#ch-hero` only, tokens only), this README.

## What it is
The sun sets inside the word **SUN**. The word is an inline-SVG knockout plate (`.pin__layer.plate`): a `--press` rect with three
holes cut by a `<text>` mask (Fraunces 320, `opsz 144`, `-.04em`). The fixed WebGL world shows through the holes; the plate's
baseline is glued to the world's sea horizon every frame (`world.project` of a point 400 units out on the sea plane), so the
sun billboard sits on the letters' feet and sinking it drains the light out of the letters top-down. Everything else is type
on the plate. `<h1>` = `Mediterranean` + sr-only `SUN`; the plate is `aria-hidden`.

Sizing (JS, on mount / fonts.ready / `mtf:ready` / resize): cap height = `--fs-sun` (read from a probe element), bounded so
the cap top stays ≥ 26 % of the viewport below the top edge (room for the head) and the word ≤ 90 % wide; cap and advance
ratios are measured once from the loaded font via canvas `measureText`. The pin carries `--sun-top`, `--sun-base`, `--sun-w`
(px) and every type block hangs from them.

## Beats (p → what happens)
| p | beat |
|---|---|
| ready | (time-based, once) eyebrow rule draws 1.15 s → eyebrow fades .32 s → *Mediterranean* line-masks up with **wght 200 → 300** (the film's one axis tween). The plate and the sun are already there — the preloader's sun rise is the reveal. |
| .12–.17 | Forum hairline draws under the word (`--sun-base` + 3.2 vh, left 7 %) |
| .17–.22 | sub-line *Stewardship · Unity · Net Positive* (Fraunces 300 `--fs-h3`) settles |
| .20 / .29 / .38 | question cards S · U · N draw in sequence, each ~8 % of p: corner marks → top/bottom rules (scaleX) → left/right rules (scaleY) → gold glyph (4 px rise) → label (`.card--frame`, right 7 %, width min(38 %, 30 rem), 1 px grout between cards) |
| .30 / .40 / .50 | the three Forum lines (`theme.lines`) settle under the sub-line, 10 px rise; the last line in `--cream` |
| .45–.64 | **mood**: the tesserae scatter (`tess` 1 → .3); the sun barely moves |
| .56 | `WATCH MTF10 ↗` mono link under the cards (new tab) |
| .60–.78 | **mood**: the sun sinks through the sea line inside the U (`sunY` −.5 → −1.9 with the camera rising −.9 → .6); sky `#8C3A2B → #3A1A14`; glow 1 → .55; warmth .8 → .55 |
| .62–.74 | ember hairline on the baseline (fx layer, `--flame`/`--gold-leaf`), out .91–.96 |
| .82–.86 | storyteller stitch *The Sun fills the screens.* — tiny, `--fg-faint`, at the foot of the N |
| .86–.90 | everything exits (opacity 0, −8 px). The plate stays to p 1: black on black hands over to Ch 02 |

Mobile (< 820 px): `--fs-sun` 26 vw keeps the knockout full width; horizon nearer 55 % (`camTilt` .025); the lower band is a
**sequence** — Forum column .20→.56, then the cards .57/.66/.75 stacked full width, the link at .78; no parallax; sun radius .55.
Desktop: ±6 px pointer parallax on the type (`--mx/--my` on `.hero__type`, written only when the pointer moves); the card glint
`--mx/--my` comes from one delegated `pointermove` on the list.

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
- CSS 3.4 KB · DOM ≈ 60 nodes + 1–2 SplitText lines · `onFrame`: one `project()`, two threshold-guarded attribute/property writes, no allocations, no queries.
- Copy verbatim from `content.json` (`event.*`, `theme.lines`, `theme.questions`, `registration.watchLastYear.currentUrl` — carried from 2025, opens in a new tab); the stitch is the bible's stage direction.
- Stills checked at 1440×900 (p 0, .5, .65, .9) and 390×844 (p .5): one primary object, one hairline, one mono label; frame empty for p > .90.
- `html.no-gl`: `--sky-top-static: --press`, `--sky-bottom-static: color-mix(ramla 40 %, press)` on the pin.
- Known gaps: the dev harness's `?p=` is `top + height·p`, so for this 3 vh film pinned p = 1.5·q (use `q .333` for p .5); the
  rail's `01 · THE SUN` label sits 6 px under *Mediterranean*'s baseline at 1440×900 (rail agent's placement).
