import type { Chapter } from '../../engine/chapter'
import { kf, kfRGB } from '../../engine/mood'
import { createFilm } from '../../engine/film'
import { gsap } from '../../engine/scroll'
import { raft, assemble, bob } from '../../art/raft'
import './style.css'

/**
 * Chapter 13 — THE RAFT · Coda · Register · Hotels · Partners · 06:40 · DESIGN-BIBLE §6.13
 *
 * The wreckage turned raft: build from it. The lowest, most human camera in the film sits on the water at
 * the first grey-blue of dawn; the star from Ch 12 is low ahead as a bearing. p 0–.25 the storyteller stack
 * while the five planks arc together on the horizon (§9.14 `assemble`) · .235 the headline lands as the raft
 * locks · .27–.60 the deck draws rule → label → segmented control → five planks (one per beat) → the gold
 * pill with its two orbits → the honesty line · .64–.82 the manifest (Associate, Stay, the Fleet) · .85–.90
 * the sail catches the first light; the storyteller exits; the sign-off · THE FORM STAYS LIVE UNTIL p 1
 * (the one exception to the seam rule — Ch 14 opens on the same form position). `html.is-register` hides
 * the header's REGISTER pill while the chapter is active.
 */

interface Track { id?: string; label?: string; cta?: string; currentUrl?: string }
interface Include { text?: string }
interface Pkg { name?: string; deckTitle?: string; includes?: Include[]; cta?: { text?: string; href?: string } }
interface PartnerItem { id?: string; name?: string | null; status?: string; url?: string | null }
interface Email { id?: string; address?: string }

const TAU = Math.PI * 2
const LINES = [
  'Seven years earlier, the sea had thrown Ulysses onto Ogygia beside the wreckage of his ship.',
  'Broken… but not destroyed.',
  'Now Calypso used those same pieces to help build his raft.',
  'The wood that carried him toward death…',
  'would carry him toward life.',
  'Perhaps that is what we must do with our own wreckage.',
]
const HEADLINE = 'Build from it.'
const SIGNOFF = 'The raft reaches the sea.'
const HONESTY = 'Fees and the 2026 registration platform will be announced. This form registers your interest.'
const RATES = '2026 rates to be announced.'
const LAUNCHED = 'Raft launched — See you in Malta'
const AIRLINE_HEAD = 'Official airline of the Mediterranean Tourism Forum 2026'
const ROLES = ['Delegate', 'Speaker', 'Partner', 'Student', 'Media']
/** Mono wordmarks (the bible's spellings, §6.13) — no logo files exist, never fabricate one. */
const WORDMARK: Record<string, string> = { lavazza: 'Lavazza — Powered by Lavazza, the coffee experience' }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const str = (v: unknown, fb = ''): string => typeof v === 'string' ? v : (v && typeof v === 'object' && typeof (v as { value?: unknown }).value === 'string') ? (v as { value: string }).value : fb

/* module state read by mood(p) and the hooks (mood has no ctx) */
let reduced = false
let glyph: SVGElement | null = null
let glyphWrap: HTMLElement | null = null
let lastQ = -1

export const register: Chapter = {
  id: 'register',
  label: 'The Raft',
  navIndex: '06', inNav: true,

  mount(ctx) {
    const { el, shared, content } = ctx
    reduced = shared.reduced
    const c = (content ?? {}) as Record<string, any>
    const reg = (c.registration ?? {}) as { heading?: string; tracks?: Track[] }
    const tracks: Track[] = Array.isArray(reg.tracks) ? reg.tracks.filter(t => t && t.label && t.currentUrl) : []
    const dates = str(c.event?.dates?.display, '25–27 November 2026'), city = str(c.event?.city, 'Malta')
    const pkg = ((c.participation?.packages ?? [])[0] ?? {}) as Pkg
    const includes: Include[] = Array.isArray(pkg.includes) ? pkg.includes.filter(i => i && i.text) : []
    const assocHead = str(c.participation?.precedent2025?.associatesHeading, 'Our associates')
    const hotels = (c.hotels ?? {}) as { heading?: string; benefit?: string; cta?: string; currentUrl?: string }
    const partners: PartnerItem[] = Array.isArray(c.partners?.items) ? (c.partners.items as PartnerItem[]).filter(p => p && p.name && p.status === 'confirmed') : []
    const emails = ((c.contact?.emails ?? []) as Email[])
    const forumMail = emails.find(e => e.id === 'forum')?.address ?? emails[0]?.address ?? 'forum@medtourismfoundation.com'
    const enquire = pkg.cta?.href ?? `mailto:${forumMail}`

    const seg = tracks.map(t => `<a class="raft__track" href="${esc(t.currentUrl!)}" target="_blank" rel="noopener"><span class="raft__track-l">${esc(t.label!)}</span><span class="raft__track-c">Register<span class="btn__arrow">→</span></span></a>`).join('')
    const plank = (id: string, label: string, ph: string, type = 'text', ac = 'off') =>
      `<div class="field raft__plank"><label class="field__label" for="reg-${id}">${label}</label><input class="field__input" id="reg-${id}" name="${id}" type="${type}" placeholder="${ph}" autocomplete="${ac}"></div>`
    const roles = ROLES.map(r => `<label class="raft__role"><input type="radio" name="role" value="${r}"><span class="chip">${r}</span></label>`).join('')
    const fleet = partners.map(p => {
      const w = esc(WORDMARK[p.id ?? ''] ?? p.name!)
      return p.url ? `<li><a class="chip raft__mark" href="${esc(p.url)}" target="_blank" rel="noopener">${w}</a></li>` : `<li><span class="chip raft__mark">${w}</span></li>`
    }).join('')

    const frame = `
      <div class="pin__frame">
        <p class="eyebrow raft__eyebrow"><span class="index tnum">13 —</span><span class="chip">The application — ${esc(str(reg.heading, 'Register'))} for MTF11 · ${esc(dates)} · ${esc(city)}</span></p>
        <h2 class="h1 raft__h2">${HEADLINE}</h2>
        <div class="raft__stack">${LINES.map(l => `<p class="s">${esc(l)}</p>`).join('')}</div>
        <p class="s raft__signoff">${SIGNOFF}</p>
        <div class="raft__deck">
          <span class="raft__rule"></span>
          <p class="label raft__head">${esc(str(reg.heading, 'Register'))}</p>
          <nav class="raft__seg" aria-label="Registration 2025 forms">${seg}</nav>
          <form class="raft__form" novalidate>
            <div class="field raft__plank raft__plank--name"><label class="field__label" for="reg-name">I am <span class="raft__typed">___</span></label><input class="field__input" id="reg-name" name="name" type="text" placeholder="Nobody." autocomplete="name" required></div>
            ${plank('organisation', 'Organisation', 'Organisation', 'text', 'organization')}
            ${plank('country', 'Country', 'Country', 'text', 'country-name')}
            ${plank('email', 'Email', 'name@organisation.com', 'email', 'email')}
            <fieldset class="field field--radio raft__plank raft__roles"><legend class="field__label">I am a:</legend><div class="chip-row">${roles}</div></fieldset>
            <div class="raft__submit"><button class="btn btn--primary raft__btn" type="submit"><span class="flood"></span><span>Register</span><span class="btn__arrow">→</span><span class="orbit"></span><span class="orbit orbit--2"></span></button><p class="field__error raft__err" aria-live="polite"></p></div>
          </form>
          <div class="raft__launched" hidden><p class="label raft__head">${LAUNCHED}</p><p class="f raft__thanks" aria-live="polite"></p></div>
          <p class="fine raft__honesty">${HONESTY}</p>
        </div>
        <div class="raft__manifest">
          <section class="raft__block" aria-label="Become an ${esc(str(pkg.name, 'MTF11 Associate'))}">
            <span class="raft__rule"></span><p class="label raft__head">Become an ${esc(str(pkg.name, 'MTF11 Associate'))}</p>
            <div class="raft__body"><ul class="raft__includes">${includes.map(i => `<li>${esc(i.text!)}</li>`).join('')}</ul><a class="link link--mono" href="${esc(enquire)}">Enquire<span class="btn__arrow">→</span></a></div>
          </section>
          <section class="raft__block" aria-label="Stay">
            <span class="raft__rule"></span><p class="label raft__head">Stay</p>
            <div class="raft__body"><p class="raft__line">${esc(str(hotels.heading, 'Book your hotel in Malta with us'))} — ${esc(str(hotels.benefit, 'enjoy special rates').toLowerCase())}.</p><a class="link link--mono" href="${esc(str(hotels.currentUrl, '#'))}" target="_blank" rel="noopener">${esc(str(hotels.cta, 'Book now'))}<span class="btn__arrow">→</span></a><p class="fine">${RATES}</p></div>
          </section>
          <section class="raft__block" aria-label="The fleet — partners">
            <span class="raft__rule"></span><p class="label raft__head">The fleet</p>
            <div class="raft__body"><ul class="chip-row raft__fleet">${fleet}</ul>
              <div class="raft__tba"><p class="index raft__sub">${esc(assocHead)}</p><span class="chip chip--tba">To be announced</span></div>
              <div class="raft__tba"><p class="index raft__sub">${AIRLINE_HEAD}</p><span class="chip chip--tba">To be announced</span></div></div>
          </section>
        </div>
      </div>`
    const shadow = `<div class="pin__layer shadow" aria-hidden="true"><div class="raft__glyph">${raft()}</div></div>`

    /* ── reduced motion: the same DOM as a flowing stack, the raft shown assembled, everything visible ── */
    if (reduced) {
      el.classList.add('chapter--static')
      el.innerHTML = shadow + frame
      glyph = el.querySelector('.glyph--raft'); glyphWrap = el.querySelector('.raft__glyph')
      if (glyph) assemble(glyph, 1)
      wireForm(el, forumMail)
      return
    }

    const { pin, tl } = createFilm(ctx, { length: shared.mobile ? 2.5 : 3.5 })
    pin.innerHTML = shadow + frame
    glyph = pin.querySelector('.glyph--raft'); glyphWrap = pin.querySelector('.raft__glyph')
    if (glyph) assemble(glyph, 0)
    lastQ = -1
    wireForm(pin, forumMail)
    /* portrait: the deck is a scrollable region of the pinned frame (26% → 97%) and the manifest flows inside it */
    if (shared.mobile) {
      const deck = pin.querySelector('.raft__deck') as HTMLElement, manifest = pin.querySelector('.raft__manifest') as HTMLElement
      deck.appendChild(manifest)
      deck.setAttribute('data-lenis-prevent', '')
    }

    const q = <T extends HTMLElement = HTMLElement>(s: string) => pin.querySelector(s) as T
    const qa = <T extends HTMLElement = HTMLElement>(s: string) => Array.from(pin.querySelectorAll(s)) as T[]
    const eyebrow = q('.raft__eyebrow'), h2 = q('.raft__h2'), stack = qa('.raft__stack .s'), signoff = q('.raft__signoff')
    const deckRule = q('.raft__deck > .raft__rule'), deckHead = q('.raft__deck > .raft__head'), segEl = q('.raft__seg')
    const planks = qa('.raft__plank'), submit = q('.raft__submit'), orbits = qa('.raft__btn .orbit'), honesty = q('.raft__honesty')
    const blocks = qa('.raft__block')

    const D = 0.05
    const show = (t: HTMLElement | HTMLElement[], at: number, dur = D, y = 10) => tl.fromTo(t, { opacity: 0, y }, { opacity: 1, y: 0, duration: dur }, at)
    const hide = (t: HTMLElement | HTMLElement[], at: number, dur = D) => tl.to(t, { opacity: 0, y: -8, duration: dur }, at)
    const draw = (t: HTMLElement, at: number, dur = D) => tl.fromTo(t, { scaleX: 0 }, { scaleX: 1, duration: dur }, at)
    const faint = (t: HTMLElement, at: number, dur = 0.03) => tl.to(t, { color: 'var(--fg-faint)', duration: dur }, at)

    /* p 0–.25: the storyteller stack while the planks arc together (assemble runs in onProgress) */
    show(eyebrow, 0.06, 0.04, 0)
    stack.forEach((l, i) => {
      const at = 0.08 + i * 0.026
      show(l, at, 0.03, 4)
      if (i > 0) faint(stack[i - 1]!, at)
    })
    /* .235: the seventh line is the headline — it lands as the raft locks */
    show(h2, 0.235, 0.05, 6)
    /* mobile: the stack gives the screen to the deck (there is no room for both on portrait) */
    if (shared.mobile) hide(stack, 0.26, 0.03)

    /* .27–.60: the deck draws — rule → label → the segmented control → five planks, one per beat → the pill → honesty */
    draw(deckRule, 0.27)
    show(deckHead, 0.30, 0.03, 0)
    show(segEl, 0.32, 0.04, 8)
    planks.forEach((p, i) => show(p, 0.35 + i * 0.04, 0.035, 10))
    show(submit, 0.55, 0.04, 8)
    tl.fromTo(orbits, { opacity: 0 }, { opacity: 1, duration: 0.03 }, 0.58)
    show(honesty, 0.60, 0.03, 0)

    /* .64–.82: the manifest — Associate, Stay, the Fleet — each rule → label → content */
    blocks.forEach((b, i) => {
      const at = 0.64 + i * 0.07
      const rule = b.querySelector('.raft__rule') as HTMLElement, head = b.querySelector('.raft__head') as HTMLElement, body = b.querySelector('.raft__body') as HTMLElement
      draw(rule, at, 0.04); show(head, at + 0.025, 0.025, 0); show(body, at + 0.04, 0.03, 8)
    })

    /* .85–.90: the sail catches the first light; the storyteller exits; the sign-off takes its place */
    if (glyphWrap) tl.fromTo(glyphWrap, { '--sail-lit': 0 }, { '--sail-lit': 1, duration: 0.05 }, 0.85)
    hide(eyebrow, 0.86, 0.03)
    if (!shared.mobile) hide(stack, 0.86, 0.03)
    show(signoff, 0.90, 0.04, 4)
  },

  onEnter() { document.documentElement.classList.add('is-register') },
  onLeave() { document.documentElement.classList.remove('is-register') },

  /** The planks assemble over p 0–.25 (quantised so the SVG is only rewritten when the value moves). */
  onProgress(p) {
    if (reduced || !glyph) return
    const q = Math.round(Math.min(1, Math.max(0, p / 0.25)) * 400) / 400
    if (q === lastQ) return
    lastQ = q
    assemble(glyph, q)
  },

  /** The sea under the raft (§9.14 `bob`) — one small transform per frame, nothing allocated. */
  onFrame(shared) {
    if (reduced || !glyph) return
    bob(glyph, shared.time)
  },

  /** §6.13 keyframes. Constants: camYaw 2π · veil 3 · p4 0 · tessForm 3 (tess 0). p 1 = Ch 14's p 0. */
  mood: p => {
    const q = reduced ? 1 : p
    return {
      camX: 0,
      camY: kf(q, [[0, 0.9], [0.3, 0.7], [1, 0.7]]),
      camZ: kf(q, [[0, -10], [0.3, -12], [1, -12]]),
      camTilt: kf(q, [[0, 0.02], [0.3, 0.04], [1, 0.05]]),
      camYaw: TAU, fov: 34,
      skyTop: kfRGB(q, [[0.3, '#06192B'], [1, '#071E30']]),
      skyBottom: kfRGB(q, [[0, '#0B2A3D'], [0.3, '#163A50'], [1, '#2B5468']]),
      haze: 0.35,
      sunX: 0,
      // the bearing star sits just above eye level (camY .9 → .7) so it never renders on the water — p 0 matches
      // Ch 12's p 1 anchor and p 1 hands over to Ch 14's dawn
      sunY: kf(q, [[0, 1.05], [1, 1.05]]),
      sunZ: kf(q, [[0, -22], [1, -22]]),
      sunRadius: kf(q, [[0.3, 0.14], [1, 0.16]]),
      sunGlow: kf(q, [[0, 1.2], [0.3, 1.3], [1, 1.2]]),   // the bible's 1.6 reads as a sun; Ch 12 hands over a star at 1.0
      sunHeat: kf(q, [[0, 0], [0.3, 0.05], [1, 0.15]]),
      sunVisible: 1,
      seaAmp: kf(q, [[0, 0.1], [0.3, 0.12], [1, 0.12]]),
      seaOpacity: kf(q, [[0, 0.6], [0.3, 1], [1, 1]]),
      seaColor: kfRGB(q, [[0, '#0B2A3D'], [0.3, '#0E3D57'], [1, '#124A66']]),
      stars: kf(q, [[0, 0.3], [0.3, 0.25], [1, 0.15]]),
      constellation: 0,
      tess: 0, tessForm: 3, tessSpread: 4, tessGold: 0.9, tessGlint: 0.8,   // spread 4 with tess 0: the field stays gone (Ch 12's hand-over)
      veil: 3, p1: 0, p2: 1, p3: 0, p4: 0,
      bloom: kf(q, [[0, 0.8], [0.3, 0.7], [1, 0.7]]),
      grain: 0.06, vignette: 0.3, mosaic: 0, aberration: 0,
      warmth: kf(q, [[0, 0.2], [0.3, 0.25], [1, 0.35]]),
    }
  },
}

/** The interest form: the floating name label, validation, the mailto (no backend exists — TBC), the launch. */
function wireForm(root: HTMLElement, forumMail: string) {
  const form = root.querySelector('.raft__form') as HTMLFormElement | null
  if (!form) return
  const name = form.querySelector('#reg-name') as HTMLInputElement, typed = form.querySelector('.raft__typed') as HTMLElement
  const err = root.querySelector('.raft__err') as HTMLElement, done = root.querySelector('.raft__launched') as HTMLElement
  const thanks = root.querySelector('.raft__thanks') as HTMLElement
  name.addEventListener('input', () => { typed.textContent = name.value.trim() || '___' })
  form.addEventListener('submit', e => {
    e.preventDefault()
    const v = (id: string) => ((form.querySelector(`#reg-${id}`) as HTMLInputElement | null)?.value ?? '').trim()
    const email = v('email'), who = v('name')
    const role = (form.querySelector('input[name=role]:checked') as HTMLInputElement | null)?.value ?? '—'
    if (!who || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Your name and a valid email, please.'; (who ? form.querySelector('#reg-email') as HTMLElement : name).focus(); return }
    err.textContent = ''
    const body = `Name: ${who}\nOrganisation: ${v('organisation') || '—'}\nCountry: ${v('country') || '—'}\nEmail: ${email}\nI am a: ${role}\n\nMTF11 · 25–27 November 2026 · Malta`
    window.location.href = `mailto:${forumMail}?subject=${encodeURIComponent('MTF11 registration interest')}&body=${encodeURIComponent(body)}`
    /* the launch: the sail fills gold, the raft moves toward the star, the form gives way to the thank-you */
    form.hidden = true
    thanks.textContent = `Thank you. We will write to you at ${email}.`
    done.hidden = false
    root.classList.add('is-launched')
    if (glyphWrap && !reduced) gsap.to(glyphWrap, { '--sail-launch': 1, '--launch': 1, duration: 2.2, ease: 'power2.inOut' })
    else if (glyphWrap) glyphWrap.style.setProperty('--sail-launch', '1')
  })
}
