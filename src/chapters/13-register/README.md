# 13 · register — The Raft

Coda · Register · Hotels · Partners · 06:40 · emotion COURAGE. Film 3.5 vh desktop / 2.5 vh mobile declared; `src/engine/pacing.ts` owns the multiplier (`register: 1.0`). `navIndex 06`, in nav.
Spec: `design/DESIGN-BIBLE.md` §6.13 (+ §4.2 placement, §5.3–5.4, §7.9 fields, §9.14 raft, §8.1 monotonic params, §11 QA). Status: **built**.

## The one composition rule of this chapter
The LEFT column carries one thing at a time. The storyteller stack owns it from .11 to .735, then clears; the manifest
(Associate · Stay · Fleet) takes the *same* ground from .812 — both start at `top 30%`, one ground, never two. They are
never both lit, so nothing is ever printed over anything else, and 30% puts that ground 39 px clear of the headline's
last descender (the headline stays live to p 1). The RIGHT column is the deck (the form) alone, `top 13%`. The sign-off
lands low left (bible §4.2, `bottom 13%`), clear of the fixed bottom-corner labels. Between the two columns runs a clear
centre band — the manifest is capped at `min(36%, 34rem)` and the deck at `min(38%, 34rem)` precisely so the raft and
its bearing star always have open water either side of them at every width from 821 px up.

## Beats (desktop; p = local film progress; no two substantive beats closer than .024 of p, no idle stretch over .07)
| p | what happens |
|---|---|
| 0–.04 | frame empty (seam rule). The star from Ch 12 low ahead; the five planks scattered off the bottom-left (`assemble(svg, 0)`). |
| .04 | the scrim lifts (a soft top-and-bottom gradient that holds every line's contrast against the sky and the lit sea). |
| .07 | eyebrow `13 — THE APPLICATION — REGISTER FOR MTF11 · 25–27 NOVEMBER 2026 · MALTA`. |
| .11–.335 | six storyteller lines, one per beat (.045 apart), older lines fade to `--fg-faint`; meanwhile `onProgress` drives `assemble(svg, p/.40)` — planks arc in, battens drop, mast rises, sail unfurls. |
| .375 | the seventh line is the headline — **Build from it.** lands as the raft locks. |
| .415 → .782 | the deck draws rule → `REGISTER` label (.443) → segmented control (.478, two 2025 links, new tab) → five planks (`I AM ___` / Organisation / Country / Email / `I am a:` chips) at .520 + .042·i → the gold pill (.722) → its two orbits (.746) → the honesty line (.782). |
| .700 | the storyteller stack exits (clear by .735) — the left column is cleared for the manifest. |
| .812 / .836 / .872 | the manifest, each block rule → label → content: BECOME AN MTF11 ASSOCIATE (4 includes + `ENQUIRE →` mailto) · STAY (`BOOK NOW →` + *2026 rates to be announced.*) — those two share a row and read as one gesture — then THE FLEET spanning below (Forbes Travel Guide, Lavazza as mono wordmark chips; `OUR ASSOCIATES` / `OFFICIAL AIRLINE …` with `TO BE ANNOUNCED` chips on one aligned baseline). |
| .898–.965 | the eyebrow exits; the sail catches the first light (`--sail-lit` 0→1 → `--sail-fill` sand → gold-leaf); the sign-off *The raft reaches the sea.* lands at bottom-left. |
| .90 → 1 | **the headline, the deck and the manifest stay live** (the documented exception to the seam rule; Ch 14 opens on the same form position). |
| any | Submit → validates name + email → composes `mailto:forum@medtourismfoundation.com?subject=MTF11 registration interest&body=…` → launch: sail gold, the raft shrinks and drifts up-and-right onto the star (2.2 s), form replaced by `RAFT LAUNCHED — SEE YOU IN MALTA` + aria-live *Thank you. We will write to you at {email}.* |

Measured boxes at 1440 × 900 (no pair overlaps at any p, nothing under the fixed chrome): eyebrow y114–139 · headline
y158–231 · storyteller stack y270–511 and manifest y270–674 on the same ground, never simultaneous (stack clear by .735,
first manifest rule .812) · deck y117–722, x795–1339 · manifest x101–619 · raft box x653–788 (ink ≈ x684–757) · sign-off
y757–785 · submit orbit sweep inside a reserved row y539–679, clear of the honesty line at y685. Header ends y75, rail
glyphs x ≤ 44 (hit area ≤ 76), bottom corner labels y ≥ 868. Re-measured at 1280 × 800.

821–1240 px: the segmented control stacks, the deck narrows to `min(36%, 30rem)` and the manifest to `min(34%, 28rem)`
(both were 40% — at 1000 px that put the Fleet chips straight through the raft), the Fleet spanning both columns.
Mobile (< 820 px): eyebrow (top 11%, clear of the 75 px header) → headline → the raft as a small emblem at the right of
the headline band (bible §6.13 Mobile: "the raft glyph sits above the form"; the deck fills the water on portrait, so
keeping the raft on the horizon would have printed a field row over it) → storyteller stack at 27%, gone by .408, before
the deck's first hairline draws at .415 → the deck is a scrollable region of the pinned frame (30 % → bottom 8.5 %, which
clears the fixed corner labels; `data-lenis-prevent`) holding the stacked segmented pills, the planks, the pill, the
honesty line and the manifest (moved into the deck at mount). Left offsets clear the fixed rail glyphs;
`html.is-register` hides the persistent REGISTER pill so nothing sits under it.

Reduced motion: `chapter--static` flowing stack — raft shown assembled, no scrim, every element visible, the form works
the same; mood is the p 1 still.

## Mood anchors (§6.13 table; constants camYaw 2π · veil 3 · p4 0 · tessForm 3 · tess 0 · tessSpread 4)
| p | cam (x,y,z,tilt) | sun (x,y,z) r · glow · heat | skyTop / skyBottom / sea | seaOp · amp | stars | bloom | warmth |
|---|---|---|---|---|---|---|---|
| 0 | 0, .9, −10, .02 | (0, 1.05, −22) .14 · 1.2 · 0 | #06192B / #0B2A3D / #0B2A3D | .6 · .1 | .3 | .8 | .2 |
| .3 | 0, .7, −12, .04 | (0, 1.05, −22) .14 · 1.3 · .05 | #06192B / #163A50 / #0E3D57 | 1 · .12 | .25 | .7 | .25 |
| 1 | 0, .7, −12, .05 | (0, 1.05, −22) .16 · 1.2 · .15 | #071E30 / #2B5468 / #124A66 | 1 · .12 | .15 | .7 | .35 |

p 0 = Ch 12's documented p 1; p 1 = Ch 14's documented p 0 (incl. tessGold .9, tessGlint .8, p2 1 with p1 0). Deviations,
both deliberate: `sunGlow` 1.2/1.3/1.2 instead of 1.6/1.4/1.2 (Ch 12 hands over a star at 1.0 and the bible's own note
says 1.6+ reads as a sun), and `sunY 1.05` rather than .2→.1 so the bearing star sits above eye level instead of on the
water. `--sky-top-static` / `--sky-bottom-static` on `.pin` for `html.no-gl`.

## Budgets
- CSS 7.1 KB (over the 3 KB guide — the chapter carries a form, a segmented control, three manifest blocks, a static
  stack and two responsive recompositions; every rule is `#ch-register`-scoped, tokens only).
- No SplitText (reveals are whole-line tl tweens on cached elements). `onFrame`: one `bob()` transform per frame, no
  allocations. `onProgress`: `assemble()` only while p ≤ .40 and only when the quantised value (1/400) changes.
- DOM: ~111 nodes (one added: the scrim). No `backdrop-filter`. Shadow layer: one inline SVG.

## Self-check (§11)
1. `?chapter=register&p=0 / .25 / .5 / .75 / .95` each render a composed still (`shots/pp-reg-c25.png`,
   `pp-reg-c75.png`, `pp-reg-c95.png`, mobile `pp-reg-c-m5.png`); p 0 verified empty by measurement.
   Forward/backward scrub: every beat is `tl.fromTo` with `ease:'none'`.
2. Seam rule: empty for p < .04; **not** empty at p > .90 by spec (form live).
3. Copy verbatim from §6.13 / `content.json` (`registration.tracks[]`, `participation.packages[0]`, `hotels`,
   `partners.items[]` filtered to `status:'confirmed'` with a name, `contact.emails[0]`, `event.dates.display`,
   `event.city`). TBC placeholders: honesty line, *2026 rates to be announced.*, `TO BE ANNOUNCED` chips, no price,
   no logos.
4. Real DOM: one `h2`, `p.s`, `form` with `label[for]`, `fieldset/legend` for the radio chips, `button[type=submit]`,
   `a[target=_blank rel=noopener]`, `ul` lists, `aria-live` error and thank-you, SVG + scrim `aria-hidden`.
5. `html.is-register` toggled in `onEnter`/`onLeave`.

## Known gaps / notes for the lead
- At p .9 the neighbouring Ch 14 stub must declare the monotonic keys (`veil 3`, `camYaw 2π`, `p4 0`, `tessForm 3`) or
  the blend unwinds. Verified my composition with `&mood=veil:3,camYaw:6.2832,tessForm:3,tess:0`.
- The raft glyph (`src/art/raft.ts`, art agent) is still a flat ink slab with a cream triangle. From this chapter I have
  given it what I can: the ink is mixed 12% toward `--sea` so it is not a die-cut black, a soft `--sail-base` rim reads
  as the star behind it, and a blurred reflection smears down the swell beneath the hull. Real plank shading and a keel
  highlight would have to come from the art file itself.
- PACING. `PACING.register` is 1.0 with the note "6 beats; the form is read, not scrubbed" — the chapter actually fires
  about 30 beats, so at `length 3.5` it gets ~75 px of scroll per beat, well under the table's own ~180 px target. The
  timeline positions are evenly spread across p (nothing closer than .024, no idle stretch over .07), so the *shape* is
  right; it is the multiplier that is short. Suggest `PACING.register ≈ 2.0`. `length` stays 3.5 / 2.5 as instructed.
- The portrait deck is an inner scroll region with `data-lenis-prevent`. `overscroll-behavior` is now `auto` rather than
  `contain`, so a swipe that bottoms the deck out chains on to the page instead of parking the reader inside the pin;
  a real-device check of that hand-off is worth the lead's time.
- Fixed this round: `.raft__track { flex: 1 }` collapsed the segmented control to ZERO height wherever the pill stacks
  into a column (portrait and 821–1240 px) — the two REGISTER links were invisible on every phone. The tracks are now
  `flex: 0 0 auto` and the portrait deck's rows are `flex: 0 0 auto` so an overflowing column cannot shrink them away.
- The bible places the Fleet wordmarks "in the sail"; the sail is a ~30 px triangle at horizon scale, so the chips live
  in THE FLEET block of the manifest instead.
- Headline order: the bible's head sequence (§5.4-6) puts the headline before the first storyteller line; here the
  headline is the seventh storyteller line by the bible's own copy, so it lands last (.37) as the raft locks.
