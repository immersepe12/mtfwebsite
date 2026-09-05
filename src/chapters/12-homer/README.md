# 12 · homer — I Am Homer

Canto XI · REVELATION · Voices · clock 06:20 · film 3.5 vh desktop / 2.5 vh mobile · `inNav: false`.
Spec: DESIGN-BIBLE §6.12. Pure black (Ad Reinhardt). The Storyteller gives his name; the site gives its names.

## Beats (p → what happens; all on the scrubbed `tl`, ease none)
| p | beat |
|---|---|
| 0–.06 | black, frame empty (seam rule) |
| .06 | eyebrow `12 — VOICES OF MTF · MTF11 SPEAKERS TO BE ANNOUNCED` (dim, centred above the emblema) |
| .10–.18 | the headline settles, centred — the only centred headline: *There remains only one thing I have kept from you. My name.* |
| .20–.26 | **I am Homer.** (Fraunces roman 300 `--fs-h1`); the headline recedes to `--fg-faint` |
| .28–.62 | **THE HOLD** — nothing happens for 1.19 vh of scroll (scroll distance, never a lock) |
| .60–.64 | one white star above the type (mood `sunVisible` 0→1, `sunHeat` 0); `html.is-black` removed at p ≥ .62 |
| .64 / .68 | *You thought I was telling you an ancient story.* / **I was telling you your story.** (older lines fade to the faint register) |
| .71–.75 | the emblema exits; the Forum stage: lead `[F]` left 7% top 24% |
| .74–.79 | Sub-block A right column: rule draws → mono head `MTF11 · 2026 — SPEAKERS TO BE ANNOUNCED` → eight `.voice--tba` orbs; rims draw in one at a time (`--lit`, .015 apart) as the star's light reaches them |
| .78–.89 | Sub-block B full width at top 50%: rule → `VOICES OF THE 10TH EDITION` → one row of `.voice` cards (curated order; a per-card radial highlight + rim draw lit .006 apart) |
| .82 | links `SPEAK AT MTF11 →` (mailto) · `ALL VOICES →` (expands the frieze in place — a black scrollable panel inside the frame, `data-lenis-prevent`, Esc closes) |
| .835–.895 | `THE MTF SENATE` strip: rule → head → names · country |
| .875–.90 | the Forum stage exits |
| .885 / .90 | *Not every star is our destination.* / *Some enter our darkness only long enough to show us the way.* (sign-off position, left 7% bottom 14%) |
| .925–.94 | couplet exits (the one deliberate overrun of the .90 seam, per §6.12 "p .88–.92") |
| .90–1 | mood: the black lifts — sky → abyss/pre-dawn, `seaOpacity` → .6, stars .3, grain .06, vignette .3; the star sinks to the horizon (0, .2, −20) |

## Mood anchors (constants: `camYaw 2π` · `veil 3` · `p4 0` · `tessForm 3` · `sunHeat 0` · `sunRadius .14` · `fov 34`)
| p | cam | sun | sky | sea | stars | tess / spread | grain | vignette | bloom | glow |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | (.8, 1.6, −4) tilt 0 | hidden | #000 / #000 | 0 | 0 | .6 / 1 | .04 | 0 | .7 | 0 |
| .2 | | | | | | 0 / 4 (field gone) | | | | |
| .62 | (.4, 1.4, −6) tilt .02 | (.4, 2.6, −14) visible | #000 | 0 | 0 | 0 / 4 | .04 | 0 | .85 | .45 |
| .9 | (0, 1.2, −8) | (0, 2.4, −14) | #000 | 0 | 0 | 0 / 4 | .04 | 0 | .85 | .45 |
| 1 | (0, .9, −10) | (0, .2, −20) | #06192B / #0B2A3D | .6 (#0B2A3D) | .3 | 0 / 4 | .06 | .3 | .8 | 1.0 |

Deviations from the §6.12 table, on purpose: `sunGlow` .45 instead of 1.8 (1.8 with bloom 1 renders a sun-sized halo — the text asks for *one star*; ramps to 1.0 at p 1 for the handover); `bloom` .85 not 1.0 for the same reason; `haze` 0 → .35 and `warmth` 0 → .2 over .9–1 so the black is black; `tessSpread` 1 → 4 over 0–.2 because `tess 0` only scatters the field — `tessSpread ≥ 4` with `tess 0` is what hides the mesh. Reduced motion: `mood(1)` (the still is the pre-dawn sea with the star on the horizon).

## Data
- Copy: storyteller lines, headline, Forum lead, mono heads — bible §6.12 verbatim. Eyebrow from `pastSpeakers.heading` + `.mtf11Speakers.status`. Senate from `senators.items[]`. Mailto from `contact.emails[id=forum]`.
- Frieze: `src/content/speakers.json` (36) in the curated order (Spiteri Debono · Borg · Zahra · Agius Muscat · Datar · Connock · Lefebvre d'Ovidio · Rifai · Roversi · Pollock · Buhalis · Mandziuk · Maričić) then the rest alphabetically by surname. Missing/broken `image` → `.voice--ink` arch with initials (honorifics stripped).
- `pastSpeakers.mtf11Speakers.value` entries (when they exist) fill the eight orbs in order with portrait/initials + name.
- Collapsed frieze shows one complete row (columns computed from the grid width; 2 on portrait); `ALL VOICES →` shows all 36 in a brickwork panel.

## Budgets / status
- CSS 7.8 KB (over the 3 KB guide — the open-state panel, the orb variant, mobile and static rules; see hoist requests). No SplitText nodes. `onProgress` toggles one class; no `onFrame`.
- Verified 1440×900 at p .15 / .5 / .86 / .91 and 390×844 at .5 / .86. Typecheck and build clean for this folder.
- Known gaps: the rail's `12 · I AM HOMER` label (global chrome) sits over the first frieze card at 1440×900; the p .91 still shows the next chapter's veil/yaw blending in from the register stub (not this chapter's mood).
