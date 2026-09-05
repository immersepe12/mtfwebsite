import type { Chapter, ChapterCtx } from '../../engine/chapter'
import { createFilm } from '../../engine/film'
import { gsap, ScrollTrigger } from '../../engine/scroll'
import { drawRule, rise } from '../../engine/text'
import { kf, kfRGB, type Mood } from '../../engine/mood'
import { clamp } from '../../engine/utils'
import { star } from '../../art/star'
import './style.css'

/**
 * Chapter 14 — SUNRISE · Finale · 06:51 · SUNRISE · DESIGN-BIBLE §6.14
 * The footer as the film's last shot: the sun rises through the same word, the hand lies down into the
 * sunrise path, the Disc writes XI, and the footer flows in over the frozen mosaic frame.
 *
 * Structure:  section#ch-sunrise (height auto)
 *             └ div.film (film-len × 100vh) └ div.pin (sticky) — the last shot
 *             └ footer.footer — normal flow, transparent over the fixed canvas
 * Because the section is taller than the film, the Stage's p (0..1 across the WHOLE section) is remapped to
 * film progress inside mood()/onProgress via `travelScale` (measured on every ScrollTrigger refresh).
 *
 * Beats (film p): eyebrow rule .06 · eyebrow .09 · "I lived." .12–.20 · stack L1–L4 .22/.26/.30/.33 ·
 * last star fades .25–.40 · couplet .37 / .45 (ink, on the water) · dawn ink .56–.66 · L5–L8 .50/.54/.58/.63 (L1/L2 leave) ·
 * REGISTER → pill on the water .62–.70 · the stack leaves .80–.94; headline, couplet and pill stay for the
 * frozen last image (the pin then scrolls away into the footer).
 * mtf:sunrise { p } is dispatched for the rail's S·U·N flight (p .1–.35).
 */

/* ─── mood: piecewise-linear between the §6.14 anchors (constants: camYaw 2π · veil 3 · p4 0 · sunVisible 1) ─── */
type KF = [number, number][]
const K = {
  camY: [[0, .7], [.35, 2], [.6, 3.2]] as KF,
  camTilt: [[0, .05], [.35, .07]] as KF,
  // the star hands over from Ch 13 at (0, 1.05, −22); as it warms into the sun it recedes to z −60 and climbs
  // above the eye-level horizon of the risen camera (camY 2 → 3.2) — sunY is absolute world y, camY + Δ
  sunY: [[0, 1.05], [.2, 1.4], [.35, 2.6], [.6, 5.6], [1, 5.6]] as KF,
  sunZ: [[0, -22], [.2, -34], [.35, -60], [1, -60]] as KF,
  sunRadius: [[0, .16], [.2, .6], [.35, 2.6], [.6, 3.6], [1, 3.6]] as KF,
  sunGlow: [[0, 1.2], [.35, 1.4], [.6, 1.4], [.72, 1.3], [1, 1.2]] as KF,
  sunHeat: [[0, .15], [.35, .8], [.6, 1]] as KF,
  seaAmp: [[0, .12], [.35, .1], [.72, .1], [1, .08]] as KF,
  tess: [[0, 0], [.35, 1]] as KF,
  tessForm: [[0, 3], [.35, 4], [.45, 4], [.6, 5]] as KF,
  tessGold: [[0, .9], [.35, .9], [.6, .95], [.72, 1]] as KF,
  tessGlint: [[0, .8], [.35, 1], [.6, 1], [.72, .9], [1, .7]] as KF,
  p1: [[.5, 0], [.56, 1], [.62, 1], [.7, 0]] as KF,           // the Disc writes XI for one beat, then pure gold
  stars: [[0, .15], [.35, 0]] as KF,
  bloom: [[0, .7], [.35, 1.1], [.6, 1.1], [.72, 1], [1, .9]] as KF,
  warmth: [[0, .35], [.35, .8], [.6, 1]] as KF,
  mosaic: [[.72, 0], [.92, .48], [1, .3]] as KF,   // the frame tessellates, then settles: enough to read as laid stone, not enough to bury the type
}
const SKY_T: [number, string][] = [[0, '#071E30'], [.35, '#0F5A80'], [.6, '#2B8FA3'], [.72, '#7FA9C2'], [1, '#A9CBDD']]
const SKY_B: [number, string][] = [[0, '#2B5468'], [.35, '#FF7A1A'], [.6, '#FFD166'], [.72, '#FFD166'], [1, '#F1C86A']]
const SEA_C: [number, string][] = [[0, '#124A66'], [.35, '#A67C2E'], [.6, '#D9A441']]

const moodAt = (p: number): Partial<Mood> => ({
  camX: 0, camY: kf(p, K.camY), camZ: -12, camTilt: kf(p, K.camTilt), camYaw: Math.PI * 2, fov: 34,
  skyTop: kfRGB(p, SKY_T), skyBottom: kfRGB(p, SKY_B),
  sunX: 0, sunY: kf(p, K.sunY), sunZ: kf(p, K.sunZ), sunRadius: kf(p, K.sunRadius), sunGlow: kf(p, K.sunGlow), sunHeat: kf(p, K.sunHeat), sunVisible: 1,
  seaY: -1.2, seaAmp: kf(p, K.seaAmp), seaOpacity: 1, seaColor: kfRGB(p, SEA_C),
  stars: kf(p, K.stars), constellation: 0,
  tess: kf(p, K.tess), tessForm: kf(p, K.tessForm), tessSpread: 1, tessGold: kf(p, K.tessGold), tessGlint: kf(p, K.tessGlint),
  veil: 3, p1: kf(p, K.p1), p2: 1, p3: 0, p4: 0,
  bloom: kf(p, K.bloom), grain: .06, mosaic: kf(p, K.mosaic), aberration: 0,
  warmth: kf(p, K.warmth),
})

/* ─── copy (Storyteller lines are bible-final §6.14; every fact comes from content.json) ─── */
const STACK = [
  'So when your own Odyssey reaches its final shore…',
  'do not count the years.',
  'Remember the people.',
  'The laughter. The mistakes. The storms.',
  'The hands that lifted you.',
  'The people who stayed. The people who left.',
  'And the people you loved enough… to let go.',
  'And may you look back upon all of it — and say…',
]
const HEADLINE = 'I lived.'
const MOTION_KEY = 'mtf-motion'
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

/* section-wide state (module scope so mood(p) — which has no ctx — can read it).
   The Stage derives film p from --film-len, so its p IS this film's p even though the footer follows inside the section. */
let reduced = false

function frameHTML(c: any): string {
  const f = c.foundation ?? {}
  const eyebrow = `14 — ${String(f.name?.value ?? 'Mediterranean Tourism Foundation')} · ${String(f.basedIn?.value ?? 'Malta')} · Since ${String(f.founded?.value ?? 2013)}`.toUpperCase()
  const lines = (c.gala?.keyLines ?? []) as { text?: string }[]
  const cp1 = String(lines[0]?.text ?? 'LOVE IS NOT THE HAND THAT CLOSES.')
  const cp2 = String(lines[1]?.text ?? 'LOVE IS THE HAND THAT OPENS.')
  const stack = STACK.map(l => `<p class="s st">${esc(l)}</p>`).join('')
  return `
    <div class="col">
      <p class="eyebrow eye"><span class="eye__rule" aria-hidden="true"></span><span class="eye__t">${esc(eyebrow)}</span></p>
      <h2 class="display hl"><span class="hl__m">${esc(HEADLINE)}</span></h2>
      <div class="stack" aria-label="The Storyteller">${stack}</div>
    </div>
    <p class="couplet"><span class="cp cp1">${esc(cp1)}</span><span class="cp cp2">${esc(cp2)}</span></p>
    <p class="pill"><a class="btn btn--primary" href="#ch-register"><span>Register</span><span class="btn__arrow" aria-hidden="true">→</span><span class="flood" aria-hidden="true"></span></a></p>`
}

function footerHTML(c: any): string {
  const f = c.foundation ?? {}, ct = c.contact ?? {}
  const name = String(f.name?.value ?? 'Mediterranean Tourism Foundation')
  const desc = String(f.descriptionCurrentSite?.value ?? '')
  const socials = (ct.socials?.items ?? []) as { network: string; url: string }[]
  const emails = (ct.emails ?? []) as { address: string }[]
  const infoMail = emails.find(e => e.address.startsWith('info'))?.address ?? 'info@medtourismfoundation.com'
  const observer = socials[1]?.url ?? 'https://www.instagram.com/mediterranean.observer/'
  const hotels = String(c.hotels?.currentUrl ?? '#ch-register')
  const watch = String(c.registration?.watchLastYear?.currentUrl ?? '#ch-homer')
  const tagline = String(f.tagline?.value ?? 'THINK TOGETHER • LEARN TOGETHER • ACT TOGETHER')
  const copyright = String(ct.copyright?.value ?? '© 2026 Mediterranean Tourism Foundation').toUpperCase()
  const ext = (href: string, label: string) => `<li><a class="link" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)}</a></li>`
  const int = (href: string, label: string) => `<li><a class="link" href="${esc(href)}">${esc(label)}</a></li>`
  const col = (h: string, items: string) => `<nav class="footer__col" aria-label="${esc(h)}"><h3 class="footer__h">${esc(h)}</h3><ul class="footer__list">${items}</ul></nav>`
  return `
    <div class="footer__frame">
      <span class="footer__rule footer__rule--t" aria-hidden="true"></span><span class="footer__rule footer__rule--b" aria-hidden="true"></span>
      <span class="footer__rule footer__rule--l" aria-hidden="true"></span><span class="footer__rule footer__rule--r" aria-hidden="true"></span>
      <span class="footer__corner footer__corner--tl" aria-hidden="true"></span><span class="footer__corner footer__corner--tr" aria-hidden="true"></span>
      <span class="footer__corner footer__corner--bl" aria-hidden="true"></span><span class="footer__corner footer__corner--br" aria-hidden="true"></span>
      <div class="footer__head">
        <img class="footer__logo" src="/brand/mtf-logo.png" width="120" height="120" alt="${esc(name)} — the Mediterranean outline" loading="lazy" decoding="async">
        <p class="f footer__desc"><strong class="footer__name">The ${esc(name)}</strong> — ${esc(desc)}</p>
      </div>
      <div class="footer__cols">
        ${col('The Forum', int('#ch-hero', 'The Sun') + int('#ch-paradise', 'Three Days') + int('#ch-eleven', 'Eleven for Eleven') + int('#ch-rudder', 'The Four') + int('#ch-hand', 'Calypso’s Odyssey') + int('#ch-homer', 'Voices') + int('#ch-register', 'Register') + ext(hotels, 'Hotels') + int('#ch-register', 'Partners') + ext(watch, 'Watch MTF10'))}
        ${col('The Foundation', int('#ch-ogygia', 'Who is MTF') + ext(observer, 'The Mediterranean Observer') + int(`mailto:${infoMail}`, 'Press'))}
        ${col('Contact', emails.map(e => int(`mailto:${e.address}`, e.address)).join(''))}
        ${col('Follow', socials.map(s => ext(s.url, s.network)).join(''))}
      </div>
      <div class="footer__bottom">
        <p class="footer__tag index">${esc(tagline)}</p>
        <p class="footer__legal index">${esc(copyright)}</p>
        <ul class="footer__meta">
          <li><a class="footer__m" href="#" title="To be announced">Privacy</a></li>
          <li><a class="footer__m" href="#" title="To be announced">Cookies</a></li>
          <li><button class="footer__m footer__motion" type="button">Motion: <span class="footer__mv" data-v="full">Full</span><span class="footer__sep" aria-hidden="true">/</span><span class="footer__mv" data-v="reduced">Reduced</span></button></li>
          <li><button class="footer__m footer__top" type="button">Back to the beginning <span class="btn__arrow" aria-hidden="true">↑</span></button></li>
        </ul>
      </div>
    </div>`
}

/* ─── footer behaviour: frame draws, columns rise, anchors go through Lenis, motion toggle, back to the top ─── */
function wireFooter(footer: HTMLElement, ctx: ChapterCtx) {
  const html = document.documentElement
  // the frame rules draw from the corner marks outward (horizontals via drawRule; verticals the same way on Y)
  drawRule(footer.querySelector('.footer__rule--t') as Element, { origin: 'left center' })
  drawRule(footer.querySelector('.footer__rule--b') as Element, { origin: 'right center' })
  if (!ctx.shared.reduced) {
    const vs = Array.from(footer.querySelectorAll<HTMLElement>('.footer__rule--l, .footer__rule--r'))
    vs.forEach((v, i) => {
      gsap.set(v, { scaleY: 0, transformOrigin: i === 0 ? 'center top' : 'center bottom' })
      ScrollTrigger.create({ trigger: v, start: 'top 92%', once: true, onEnter: () => gsap.to(v, { scaleY: 1, duration: 1.4, ease: 'power4.inOut' }) })
    })
  }
  rise(footer.querySelector('.footer__head') as Element, { y: 24 })
  rise(Array.from(footer.querySelectorAll('.footer__col')), { y: 24, stagger: .1 })
  rise(footer.querySelector('.footer__bottom') as Element, { y: 12 })

  // in-page anchors ride Lenis (1.6 s tide) instead of jumping
  footer.addEventListener('click', e => {
    const a = (e.target as HTMLElement).closest('a[href^="#ch-"]') as HTMLAnchorElement | null
    if (!a) return
    const target = document.querySelector(a.getAttribute('href') as string)
    if (target) { e.preventDefault(); ctx.scroll.scrollTo(target as HTMLElement) }
  })
  ;(footer.querySelector('.footer__top') as HTMLButtonElement).addEventListener('click', () => ctx.scroll.scrollTo(0))

  // MOTION: FULL / REDUCED — persisted, toggles html.reduced-motion, reloads (the engine reads it at boot)
  const motion = footer.querySelector('.footer__motion') as HTMLButtonElement
  const paint = () => {
    const isReduced = html.classList.contains('reduced-motion')
    motion.querySelectorAll<HTMLElement>('.footer__mv').forEach(v => v.classList.toggle('is-on', (v.dataset.v === 'reduced') === isReduced))
    motion.setAttribute('aria-label', `Motion preference: ${isReduced ? 'reduced' : 'full'}. Switch to ${isReduced ? 'full' : 'reduced'} motion`)
  }
  paint()
  motion.addEventListener('click', () => {
    const next = html.classList.contains('reduced-motion') ? 'full' : 'reduced'
    try { localStorage.setItem(MOTION_KEY, next) } catch { /* private mode: the toggle still applies for this load */ }
    html.classList.toggle('reduced-motion', next === 'reduced')
    paint()
    location.reload()
  })
}

/* ─── the film ─── */
function buildFilm(ctx: ChapterCtx) {
  const { el, shared, content } = ctx
  const length = shared.mobile ? 1.5 : 2
  const { pin, tl, st } = createFilm(ctx, { length })
  // the section is film + footer: move the pin into a film-length wrapper and drive the timeline from that wrapper
  st.kill()
  const film = document.createElement('div')
  film.className = 'film'
  el.appendChild(film)
  film.appendChild(pin)
  pin.innerHTML = `<div class="pin__layer fx" aria-hidden="true"><span class="last-star">${star(22)}</span></div><div class="pin__frame">${frameHTML(content)}</div>`

  const q = (s: string) => pin.querySelector(s) as HTMLElement
  const frame = q('.pin__frame'), eyeRule = q('.eye__rule'), eyeT = q('.eye__t'), hl = q('.hl__m')
  const lines = Array.from(pin.querySelectorAll<HTMLElement>('.st'))
  const cp1 = q('.cp1'), cp2 = q('.cp2'), pill = q('.pill'), lastStar = q('.last-star')

  // head sequence: rule → eyebrow → headline (masked line, yPercent 110 → 0)
  tl.fromTo(eyeRule, { scaleX: 0 }, { scaleX: 1, duration: .05 }, .06)
  tl.fromTo(eyeT, { opacity: 0 }, { opacity: 1, duration: .04 }, .09)
  tl.fromTo(hl, { yPercent: 110 }, { yPercent: 0, duration: .08 }, .12)
  // the last star goes out as the sky warms
  tl.fromTo(lastStar, { opacity: 1 }, { opacity: 0, duration: .15 }, .25)
  // the storyteller stack accumulates (4 px rise), older lines fade to the faint level; max 6 visible
  const at = [.22, .26, .30, .33, .50, .54, .58, .63]
  lines.forEach((l, i) => {
    tl.fromTo(l, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .04 }, at[i])
    if (i > 0) tl.to(lines[i - 1], { opacity: .55, duration: .03 }, at[i])
    if (i >= 6) tl.to(lines[i - 6], { opacity: 0, duration: .03 }, at[i])
  })
  // the couplet, held under the sunrise — pause between the two lines
  tl.fromTo(cp1, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .05 }, .37)
  tl.fromTo(cp2, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .05 }, .45)
  // dawn: the stage goes light, so the type goes to ink (linear, scrubbed)
  tl.fromTo(frame, { '--dawn': 0 }, { '--dawn': 1, duration: .1 }, .56)
  // the storyteller leaves before the frame freezes into mosaic; headline, couplet and pill stay for the last image
  tl.to(lines, { opacity: 0, duration: .1, stagger: .006 }, .8)
  // the large gold REGISTER → pill on the water
  tl.fromTo(pill, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .08 }, .62)

  // the film's own scrub (positions are fractions of the film, not of the section)
  let lastP = -1
  const onFilm = (p: number) => {
    // the rail's S · U · N glyphs fly to the sun on p .1–.35; keep sending while near that window so it can reset
    if (p < .42 || lastP < .42) document.dispatchEvent(new CustomEvent('mtf:sunrise', { detail: { p } }))
    lastP = p
  }
  ScrollTrigger.create({ trigger: film, start: 'top top', end: 'bottom bottom', scrub: .6, animation: tl, onUpdate: s => onFilm(s.progress) })

}

export const sunrise: Chapter = {
  id: 'sunrise',
  label: 'Sunrise',
  inNav: false,
  mount(ctx) {
    const { el, shared, content } = ctx
    reduced = shared.reduced
    if (reduced) {
      // reduced motion: the same DOM as a flowing stack, every element visible, no film
      el.classList.add('chapter--static')
      el.innerHTML = `<div class="pin__frame">${frameHTML(content)}</div>`
    } else {
      buildFilm(ctx)
    }
    const footer = document.createElement('footer')
    footer.className = 'footer'
    footer.setAttribute('aria-label', 'Site footer')
    footer.innerHTML = footerHTML(content)
    el.appendChild(footer)
    wireFooter(footer, ctx)
  },
  // mtf:sunrise is dispatched from the film's own ScrollTrigger (film-local p), so no onProgress is needed
  mood: p => moodAt(reduced ? 1 : clamp(p)),
}
