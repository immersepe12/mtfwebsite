# 12 · homer — I Am Homer

Canto XI · REVELATION · Voices · clock 06:20 · film **5.7 vh desktop / 3.8 vh mobile** · `inNav: false`.
Spec: DESIGN-BIBLE §6.12. Pure black (Ad Reinhardt). The Storyteller gives his name; the site gives its names.

## Placement contract — nothing ever collides
The frame is divided into bands that never meet, and every band clears the fixed chrome (header ~72 px, the
rail's vertical label ~68 px at the left edge, the corner labels ~56 px at the foot, and under 600 px the
bottom-centre REGISTER pill ~120 px). The emblema and the Forum stage never coexist — the emblema is at
opacity 0 before the Forum lead arrives, and the Forum is at opacity 0 before the closing couplet arrives.

| band | desktop | portrait |
|---|---|---|
| emblema (the only centred block) | centred, top 34 % | top 32 % (30 % < 600 px) |
| Forum lead + its two links | left 7 %, top 16 % / 30 %, width min(36 %, 30rem) | flowing stack, `inset: 23% 0 17%` (20 % < 600 px) |
| sub-block A — eight orb rims | right 7 %, top 16 %, width min(36 %, 30rem) | ↑ same stack |
| sub-block B — the frieze | left/right 7 %, top 37 %, one row of 9 cards | one row of 3 cards |
| the Senate strip | left/right 7 %, bottom 11 %, capped at 3 rows | ↑ same stack |
| the closing couplet | left 7 %, bottom 16 %, width min(48 %, 38rem) | left/right 7 %, bottom 18 % (24 % < 600 px) |

The star never lands on type: it rides the centre gutter between the lead (ends x ≈ 580) and sub-block A
(starts x ≈ 860) on desktop; on portrait, where there is no gutter, `sunY` is lifted from 2.6 to 3.0 so the
star clears both the eyebrow and the Forum lead (at 2.6 it printed straight through them).

## Beats (p → what happens; all on the scrubbed `tl`, ease none)
One substantive beat per ~5–6 % of p (≈ 280 px of scroll at 900 px, above the pacing target of 180 px); the
hold is the one exempt gap. A block's rule → label → content → star-light are sub-parts of *its* beat, staged
inside its own window: no two blocks are ever mid-reveal at the same time.

| p | beat |
|---|---|
| 0–.048 | black, frame empty (seam rule) |
| .048 | eyebrow `12 — VOICES OF MTF · MTF11 SPEAKERS TO BE ANNOUNCED` (dim, centred) |
| .100 | the headline settles, centred — the only centred headline |
| .158 | **I am Homer.**; the headline recedes to `--fg-faint` |
| **.210–.420** | **THE HOLD** — 1.2 vh desktop / .76 vh portrait of scroll in which nothing happens |
| .420–.460 | one white star (mood `sunVisible` 0→1, `sunHeat` 0); `html.is-black` removed at p ≥ .42 — the chrome returns with the star |
| .432 / .488 | *You thought I was telling you an ancient story.* / **I was telling you your story.** |
| .540 | the emblema exits |
| .580 / .612 | the Forum lead (left column) and, as its tail, `SPEAK AT MTF11 →` · `ALL VOICES →` |
| .640 | sub-block A: rule → head → eight `.voice--tba` orbs; rims light one at a time (`--lit`, .002 apart) |
| .700 | sub-block B: rule → head → one row of cards (curated order), the star's light crossing them |
| .760 | `THE MTF SENATE`: rule → head → names · country |
| .818 | the Forum stage exits |
| .840 / .856 | *Not every star is our destination.* / *Some enter our darkness only long enough to show us the way.* |
| .884–.900 | the couplet exits — **the frame is empty by p .90** (seam rule; no overrun) |
| .90–1 | mood only: the black lifts — sky → abyss/pre-dawn, `seaOpacity` → .6, stars .3, grain .06, vignette .3; the star sinks toward the horizon |

## Mood anchors (constants: `camYaw 2π` · `veil 3` · `p4 0` · `tessForm 3` · `sunHeat 0` · `sunRadius .14` · `fov 34`)
| p | cam | sun | sky | sea | stars | tess / spread | grain | vignette | bloom | glow |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | (.8, 1.6, −4) tilt 0 | hidden | #000 / #000 | 0 | 0 | .6 / 1 | .04 | 0 | .7 | 0 |
| .2 | | | | | | 0 / 4 (field gone) | | | | |
| .42 | (.4, 1.4, −6) tilt .02 | (.4, 2.6, −14) visible · portrait (.4, 3.0, −14) | #000 | 0 | 0 | 0 / 4 | .04 | 0 | .85 | .45 |
| .9 | (0, 1.2, −8) | (0, 2.4, −14) · portrait (0, 2.85, −14) | #000 | 0 | 0 | 0 / 4 | .04 | 0 | .85 | .45 |
| 1 | (0, .9, −10) | (0, 1.05, −22) | #06192B / #0B2A3D | .6 (#0B2A3D) | .3 | 0 / 4 | .06 | .3 | .8 | 1.0 |

The star's moment moved from the bible's p .62 to **p .42** because the whole timeline was re-spaced; the mood
anchors and the `html.is-black` threshold moved with it, so mood and choreography still agree frame for frame.
Other deviations, on purpose: `sunGlow` .45 instead of 1.8 (1.8 with bloom 1 renders a sun-sized halo — the
text asks for *one star*; it ramps to 1.0 at p 1 for the handover); `bloom` .85 not 1.0 for the same reason;
`haze` 0 → .35 and `warmth` 0 → .2 over .9–1 so the black is black; `tessSpread` 1 → 4 over 0–.2 because
`tess 0` only scatters the field. `sunY` at p 1 is 1.05 (not the bible's .2) so Ch 13 receives the star above
its eye-level horizon. Reduced motion: `mood(1)`.

## Data
- Copy: storyteller lines, headline, Forum lead, mono heads — bible §6.12 verbatim. Eyebrow from `pastSpeakers.heading` + `.mtf11Speakers.status`. Senate from `senators.items[]`. Mailto from `contact.emails[id=forum]`.
- Frieze: `src/content/speakers.json` (36) in the curated order (Spiteri Debono · Borg · Zahra · Agius Muscat · Datar · Connock · Lefebvre d'Ovidio · Rifai · Roversi · Pollock · Buhalis · Mandziuk · Maričić) then the rest alphabetically by surname. Missing/broken `image` → `.voice--ink` arch with initials (honorifics stripped).
- `pastSpeakers.mtf11Speakers.value` entries (when they exist) fill the eight orbs in order with portrait/initials + name.
- The collapsed row shows exactly one full grid row (columns computed from the grid width — the JS `cell` must stay in step with `.homer__frieze`'s `minmax(7.5rem, 1fr)`; 3 on portrait). `ALL VOICES →` opens all 36 as the two-up brickwork panel.

## Portraits
The shared `.voice__img` puts a `luminosity`-blended photo over a flat `--sea` ground, which read as a flat blue
sticker cut out of the black. Scoped to this chapter the ground is a warm `--gold-deep → --black` gradient (the
blend then tints the photo sepia, not cyan) and the image carries a bottom mask so the arch dissolves into the
ground instead of ending on a hard edge. Card heights are equalised (`min-height` on name and title) so the
block's foot lands where the placement contract says it does.

## Budgets / status
- CSS ≈ 8.4 KB (over the 3 KB guide — the placement contract, the open-state panel, the orb variant, portrait and static rules; see hoist requests). No SplitText nodes. `onProgress` toggles one class; no `onFrame`.
- Verified at 1440 × 900 (p .50 / .70 / .78 / .86 / .93) and 390 × 844 (p .50 / .80): no collision at any beat, nothing under the header, the rail, the corner labels or the REGISTER pill, frame empty at both seams. Typecheck and build clean.
