# 13 · register — The Raft

Coda · Register · Hotels · Partners · 06:40 · emotion COURAGE. Film 3.5 vh desktop / 2.5 vh mobile. `navIndex 06`, in nav.
Spec: `design/DESIGN-BIBLE.md` §6.13 (+ §7.9 fields, §9.14 raft, §8.1 monotonic params). Status: **built** (see gaps below).

## Beats (desktop; p = local film progress)
| p | what happens |
|---|---|
| 0–.06 | frame empty (seam rule). The star from Ch 12 low ahead; the five planks scattered off the bottom-left (`assemble(svg, 0)`). |
| .06 | eyebrow `13 — THE APPLICATION — REGISTER FOR MTF11 · 25–27 NOVEMBER 2026 · MALTA`. |
| .08–.21 | six storyteller lines, one per beat (.026 apart), older lines fade to `--fg-faint`; meanwhile `onProgress` drives `assemble(svg, p/.25)` — planks arc in, battens drop, mast rises, sail unfurls. |
| .235 | the seventh line is the headline — **Build from it.** lands as the raft locks (the bible sets this line in bold; it is the title). |
| .27 → .60 | the deck draws rule → `REGISTER` label → segmented control (two 2025 links, new tab) → five planks (`I AM ___` / Organisation / Country / Email / `I am a:` chips), one per beat at .35 + .04·i → the gold pill (.55) → its two orbits (.58) → the honesty line (.60). |
| .64 / .71 / .78 | the manifest, each block rule → label → content: BECOME AN MTF11 ASSOCIATE (4 includes + `ENQUIRE →` mailto) · STAY (`BOOK NOW →` + *2026 rates to be announced.*) · THE FLEET (Forbes Travel Guide, Lavazza as mono wordmark chips; `OUR ASSOCIATES` / `OFFICIAL AIRLINE …` with `TO BE ANNOUNCED` chips). |
| .85–.90 | the sail catches the first light (`--sail-lit` 0→1 → `--sail-fill` sand → gold-leaf); the eyebrow + storyteller stack exit. |
| .90 | sign-off *The raft reaches the sea.* in the storyteller's position. **The headline, the deck and the manifest stay live until p 1** (the documented exception to the seam rule; Ch 14 opens on the same form position). |
| any | Submit → validates name + email → composes `mailto:forum@medtourismfoundation.com?subject=MTF11 registration interest&body=…` → launch: sail gold, the raft shrinks and drifts onto the star (2.2 s), form replaced by `RAFT LAUNCHED — SEE YOU IN MALTA` + aria-live *Thank you. We will write to you at {email}.* |

Mobile (< 820 px): eyebrow (wrapping chip) → headline → storyteller stack (exits at .26 — there is no room for both on portrait) → the raft glyph small above the deck → the deck is a scrollable region of the pinned frame (26 % → 97 %, `data-lenis-prevent`) holding the stacked segmented pills, the planks, the pill, the honesty line and the manifest (moved into the deck at mount). Left offsets clear the fixed rail glyphs.

Reduced motion: `chapter--static` flowing stack — raft shown assembled, every element visible, the form works the same; mood is the p 1 still.

## Mood anchors (§6.13 table; constants camYaw 2π · veil 3 · p4 0 · tessForm 3 · tess 0 · tessSpread 4)
| p | cam (x,y,z,tilt) | sun (x,y,z) r · glow · heat | skyTop / skyBottom / sea | seaOp · amp | stars | bloom | warmth |
|---|---|---|---|---|---|---|---|
| 0 | 0, .9, −10, .02 | (0, .2, −20) .14 · 1.2 · 0 | #06192B / #0B2A3D / #0B2A3D | .6 · .1 | .3 | .8 | .2 |
| .3 | 0, .7, −12, .04 | (0, .15, −22) .14 · 1.3 · .05 | #06192B / #163A50 / #0E3D57 | 1 · .12 | .25 | .7 | .25 |
| 1 | 0, .7, −12, .05 | (0, .1, −22) .16 · 1.2 · .15 | #071E30 / #2B5468 / #124A66 | 1 · .12 | .15 | .7 | .35 |

p 0 = Ch 12's documented p 1; p 1 = Ch 14's documented p 0 (incl. tessGold .9, tessGlint .8, p2 1 with p1 0). Deviation: `sunGlow` 1.2/1.3/1.2 instead of 1.6/1.4/1.2 — Ch 12 hands over a star at 1.0 and the bible's own note says 1.6+ reads as a sun. `--sky-top-static` / `--sky-bottom-static` on `.pin` for `html.no-gl`.

## Budgets
- CSS 5.9 KB (over the 3 KB guide — the chapter carries a form, a segmented control, three manifest blocks, a static stack and a portrait recomposition; every rule is `#ch-register`-scoped, tokens only).
- No SplitText (reveals are whole-line tl tweens on cached elements). `onFrame`: one `bob()` transform per frame, no allocations. `onProgress`: `assemble()` only while p ≤ .27 and only when the quantised value (1/400) changes.
- DOM: ~110 nodes. No `backdrop-filter`. Shadow layer: one inline SVG.

## Self-check (§11)
1. `?chapter=register&p=0 / .5 / .9` composed (shots/register-0.png, register-05.png, register-09.png; launched state shots/register-launched.png; mobile shots/register-05-m.png). Forward/backward scrub: all beats are `tl.fromTo` with `ease:'none'`.
2. Seam rule: empty for p < .06; **not** empty at p > .90 by spec (form live).
3. Copy verbatim from §6.13 / `content.json` (`registration.tracks[]`, `participation.packages[0]`, `hotels`, `partners.items[]` filtered to `status:'confirmed'` with a name, `contact.emails[0]`, `event.dates.display`, `event.city`). TBC placeholders: honesty line, *2026 rates to be announced.*, `TO BE ANNOUNCED` chips, no price, no logos.
4. Real DOM: one `h2`, `p.s`, `form` with `label[for]`, `fieldset/legend` for the radio chips, `button[type=submit]`, `a[target=_blank rel=noopener]`, `ul` lists, `aria-live` error and thank-you, SVG `aria-hidden`.
5. `html.is-register` toggled in `onEnter`/`onLeave` (header pill hidden — verified in the stills).

## Known gaps / notes for the lead
- At p .9 the neighbouring Ch 14 **stub** declares `veil 0, camYaw 0, tessForm 0` so the blend unwinds (the cloth sweeps back, the sea turns, tesserae reappear). Verified my own composition with `&mood=veil:3,camYaw:6.2832,tessForm:3,tess:0`; resolves once Ch 14 declares its monotonic keys.
- With the camera at y .7 / z −12 the sea plane's far edge shows as a hard line ≈ 4 vh above the true horizon (the star at y .2 renders below it). Engine/sea-layer matter; the raft is placed on the water below `--horizon-now` so it reads correctly either way.
- The bible places the Fleet wordmarks "in the sail"; the sail is a 30 px triangle at horizon scale, so the chips live in THE FLEET block of the manifest instead.
- Headline order: the bible's head sequence (§5.4-6) puts the headline before the first storyteller line; here the headline is the seventh storyteller line by the bible's own copy, so it lands last (.235) as the raft locks.
