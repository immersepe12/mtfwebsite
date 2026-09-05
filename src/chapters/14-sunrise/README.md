# 14 · sunrise — Sunrise · Finale · 06:51 · SUNRISE

Emotion: CATHARSIS. Film 2 vh desktop / 1.5 vh mobile, then the footer in normal flow. Spec: DESIGN-BIBLE §6.14.
Status: BUILT (ch/14-sunrise agent). Typecheck clean, build passes.

## Structure (the one chapter whose section is taller than its film)

```
section#ch-sunrise.chapter.chapter--film   height: auto  (= film + footer)
├ div.film                                 film-len × 100vh
│ └ div.pin (sticky 100dvh)                .pin__layer.fx (the last star) + .pin__frame (all copy)
└ footer.footer                            min-height 100vh, transparent over the fixed canvas (paper wash 55% on the frame)
```

`createFilm()` is called for the class/`--film-len`/timeline, but its ScrollTrigger is killed and re-created on `.film`
so timeline positions are **film** fractions. The Stage computes `p` over the whole section (film + footer), so
`mood(p)` remaps it: `filmP = clamp(p × travelScale)`, `travelScale = (sectionH − vh) / (filmH − vh)` measured on every
`ScrollTrigger` refresh. At 1440 × 900 travelScale = 2 (footer 900 px): **`?chapter=sunrise&p=.25` = film p .5,
`p=.45` = film p .9, `p ≥ .5` = the frozen last image behind the footer.** On 390 × 844 travelScale ≈ 3.7.

## Beats (film p)

| p | what happens |
|---|---|
| < .06 | frame empty (seam rule) |
| .06–.11 | eyebrow rule draws (11em) |
| .09–.13 | eyebrow `14 — MEDITERRANEAN TOURISM FOUNDATION · MALTA · SINCE 2013` |
| .10–.35 | `mtf:sunrise { p }` dispatched — the rail's S · U · N fly to `world.sunNdc` |
| .12–.20 | **I lived.** (`--fs-display`, masked line, yPercent 110 → 0) settles |
| .22 / .26 / .30 / .33 | storyteller L1–L4 accumulate (4 px rise); older lines to 55 % |
| .25–.40 | the last DOM star (top right) goes out as the sky warms |
| .37 / .45 | couplet `LOVE IS NOT THE HAND THAT CLOSES.` — pause — `LOVE IS THE HAND THAT OPENS.` (mono 500, .28em, ink, centred on the water at `--horizon-now + 9%`) |
| .50 / .54 / .58 / .63 | L5–L8; max 6 visible (L1 leaves at L7, L2 at L8) |
| .56–.66 | `--dawn` 0 → 1: frame type cream → ink as the stage goes light |
| .62–.70 | the large gold `REGISTER →` pill on the water (left 7 %, bottom 14 %; hairline ink rim so it separates from the gold sea) |
| .80–.94 | the storyteller stack leaves; headline, couplet and pill stay for the frozen image |
| 1 | pin unsticks; the footer scrolls in over the mosaic still. Frame rules draw (`drawRule` + scaleY twins), head / columns / bottom row `rise()` |

The stack's last line is *And may you look back upon all of it — and say…*; the answer is the headline already on
screen (the bible lists **I LIVED.** both as the last storyteller line and as the h2 — rendered once, as the h2).

## Mood anchors (constants: camYaw 2π · veil 3 · p4 0 · sunVisible 1 · p2 1 · fov 34 · camZ −12 · seaY −1.2)

| p | camY | camTilt | sun (y, z, r) | glow | heat | skyTop | skyBottom | sea | amp | tess | form | gold | glint | p1 | stars | bloom | warmth | mosaic |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | .7 | .05 | .1, −22, .16 | 1.2 | .15 | #071E30 | #2B5468 | #124A66 | .12 | 0 | 3 | .9 | .8 | 0 | .15 | .7 | .35 | 0 |
| .35 | 2 | .07 | −1, −18, 1.1 | 1.4 | .8 | #0F5A80 | #FF7A1A | #A67C2E | .1 | 1 | 4 | .9 | 1 | 0 | 0 | 1.1 | .8 | 0 |
| .45 | | | | | | | | | | 1 | 4 (hold) | | | 0 | | | | |
| .5 → .56 → .62 → .7 | | | | | | | | | | | 4 → 5 (by .6) | | | 0 → 1 → 1 → 0 (XI) | | | | |
| .6 | 3.2 | .07 | −.3, −18, 1.2 | 1.4 | 1 | #2B8FA3 | #FFD166 | #D9A441 | .1 | 1 | 5 | .95 | 1 | | 0 | 1.1 | 1 | 0 |
| .72 | 3.2 | | | 1.3 | 1 | #7FA9C2 | #FFD166 | #D9A441 | .1 | 1 | 5 | 1 | .9 | 0 | 0 | 1 | 1 | 0 |
| 1 | 3.2 | | | 1.2 | 1 | #A9CBDD | #F1C86A | #D9A441 | .08 | 1 | 5 | 1 | .7 | 0 | 0 | .9 | 1 | .7 |

p 0 equals Ch 13's documented p 1. Reduced motion returns the p 1 state as a still (bright dawn, mosaic .7), and the
static frame renders with `--dawn: 1` (ink) to match.

## Footer (all from content.json)

`foundation.descriptionCurrentSite` · logo `/brand/mtf-logo.png` 120 px with alt · THE FORUM (10 links: 7 in-page
anchors through Lenis, Hotels → `hotels.currentUrl`, Watch MTF10 → `registration.watchLastYear.currentUrl`, new tab) ·
THE FOUNDATION (Who is MTF → `#ch-ogygia`, The Mediterranean Observer → `contact.socials.items[1].url`, Press →
`mailto:info@…`) · CONTACT (`contact.emails[]`) · FOLLOW (`contact.socials.items[]`, Facebook URL kept with its real
misspelling) · bottom rule: `foundation.tagline.value` (rendered verbatim with •), `contact.copyright.value` upper-cased,
Privacy / Cookies (`href="#"`, `title="To be announced"`), `MOTION: FULL / REDUCED` (localStorage `mtf-motion`,
toggles `html.reduced-motion`, reloads — same contract as the nav overlay), `BACK TO THE BEGINNING ↑` → `scroll.scrollTo(0)`.

## Budgets / QA

- One `h2`; storyteller as `p.s`; lists `ul`; links `a`; buttons `button`; decorative SVG `aria-hidden`.
- No SplitText (the headline is one masked line); no per-frame work (`onFrame` unused; the rail's flight is event-driven).
- CSS ≈ 6.5 KB total: the film part is ≈ 2.4 KB (within the 3 KB budget); the footer + its mobile block is ≈ 4.1 KB and is a candidate for a shared `footer.css` (hoist request).
- Stills: `shots/sunrise-p0.png` (p 0), `sunrise-film05.png` (film .5), `sunrise-film09.png` (film .9), `sunrise-film05-m.png` (390 × 844), `sunrise-footer.png` (section end).

## Known gaps

- The mosaic post-effect at .7 is strong; the footer frame carries a 55 % paper wash for legibility (the bible says
  "transparent" — the mosaic still shows through and around it). Drop the wash if the post agent softens the effect.
- `?chapter=sunrise&p=` is section-wide (see travelScale above) — the QA harness's p .5 is already the frozen frame.
- The couplet is always ink (it sits on gold water from p .37); if the sea shader renders darker than `#A67C2E` at .37, switch it to `--fg-d`.
