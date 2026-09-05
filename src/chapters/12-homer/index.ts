import type { Chapter } from '../../engine/chapter'
import type { RGB } from '../../engine/mood'
import { hex } from '../../engine/mood'
import { createFilm } from '../../engine/film'
import speakersJson from '../../content/speakers.json'
import './style.css'

/**
 * Chapter 12 — I AM HOMER · Canto XI · Voices · 06:20 · DESIGN-BIBLE §6.12
 *
 * Pure black (Ad Reinhardt). The Storyteller gives his name; the site gives its names.
 * p 0–.20 the emblema settles (the only centred headline) · .158 "I am Homer." · .21–.42 THE HOLD (1.2 vh of
 * scroll in which nothing happens; .8 vh on portrait) · .42 one white star (the world's billboard) and the
 * chrome returns (html.is-black removed) · .432/.488 the two revelation lines · .54–.81 the Forum stage, one
 * block per beat, each ~6 % of p apart: the lead + its links (left column), the eight TBA orb rims (right
 * column), the 10th-edition frieze (full width, ALL VOICES expands it in place), the Senate strip (bottom) ·
 * .818 the stage clears · .84–.90 the closing couplet at the sign-off position · p 1 the black lifts and the
 * pre-dawn sea returns (mood).
 *
 * Film length 5.7 vh desktop / 3.8 vh portrait (was 3.5/2.5): at 3.5 vh the bible's 1.2 vh hold ate 34 % of
 * the timeline and the eleven remaining beats clumped into the last 28 %. See README + the final report.
 */

type KF = [number, number][]
/** Piecewise-linear keyframe read, clamped at both ends. */
function kf(p: number, pts: KF): number {
  const first = pts[0], last = pts[pts.length - 1]
  if (!first || !last) return 0
  if (p <= first[0]) return first[1]
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i]
    if (!a || !b) continue
    if (p <= b[0]) { const t = b[0] === a[0] ? 1 : (p - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * t }
  }
  return last[1]
}
/** Colour keyframes — linear in p (hue never eases), written into a reused triple. */
function kfRGB(p: number, pts: [number, RGB][], out: RGB): RGB {
  for (let c = 0; c < 3; c++) out[c] = kf(p, pts.map(([q, v]) => [q, v[c] ?? 0] as [number, number]))
  return out
}

/* ── data shapes ── */
interface Voice { name: string; title?: string; role?: string; country?: string | null; image?: string | null }
interface Senator { name: string; role?: string; country?: string | null }

const BLACK = hex('#000000'), ABYSS = hex('#06192B'), PREDAWN = hex('#0B2A3D')
const TAU = Math.PI * 2
const skyTop: RGB = [0, 0, 0], skyBottom: RGB = [0, 0, 0]

/* copy — storyteller lines are the bible's (§6.12, verbatim); the Forum lead is the bible's adapted line */
const HEADLINE = 'There remains only one thing I have kept from you. My name.'
const NAME = 'I am Homer.'
const REVEAL = ['You thought I was telling you an ancient story.', 'I was telling you your story.']
const LEAD = 'MTF11 speakers will be announced through the autumn. The Forum has always been a gathering of voices — heads of state, ministers, mayors, hoteliers, scientists, freedivers, broadcasters, chefs, students.'
const CLOSE = ['Not every star is our destination.', 'Some enter our darkness only long enough to show us the way.']
const HEAD_A = 'MTF11 · 2026 — Speakers to be announced'
const HEAD_B = 'Voices of the 10th edition'
const HEAD_SENATE = 'The MTF Senate'
const CURATED = ['H.E. Myriam Spiteri Debono', 'Hon. Dr Ian Borg', 'Tony Zahra', 'Andrew Agius Muscat', 'Rajan Datar', 'Alex Connock', "Manfredi Lefebvre d'Ovidio", 'Taleb Rifai', 'Sara Roversi', 'Anna Pollock', 'Dimitrios Buhalis', 'Glenn Mandziuk', 'Vitomir Maričić']
const TBA_COUNT = 8

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const str = (v: unknown, fallback = ''): string => typeof v === 'string' ? v : (v && typeof v === 'object' && typeof (v as { value?: unknown }).value === 'string') ? (v as { value: string }).value : fallback
const HONORIFIC = /^(h\.e\.|hon\.|dr\.?|fr\.|mr\.?|mrs\.?|ms\.?|prof\.?)$/i
/** Initials for the ink arch: first + last non-honorific token. */
function initials(name: string): string {
  const parts = name.split(/\s+/).filter(t => t && !HONORIFIC.test(t))
  const a = parts[0]?.[0] ?? '', b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return (a + b).toUpperCase()
}
const surname = (n: string) => { const t = n.split(/\s+/).filter(x => !HONORIFIC.test(x)); return (t[t.length - 1] ?? n).toLocaleLowerCase() }
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, "'").toLowerCase().trim()

/** The frieze order: the bible's curated thirteen first, then the rest alphabetically by surname. */
function orderVoices(all: Voice[]): Voice[] {
  const byName = new Map(all.map(v => [norm(v.name), v]))
  const head: Voice[] = [], taken = new Set<Voice>()
  for (const n of CURATED) { const v = byName.get(norm(n)); if (v && !taken.has(v)) { head.push(v); taken.add(v) } }
  const rest = all.filter(v => !taken.has(v)).sort((a, b) => surname(a.name).localeCompare(surname(b.name)) || a.name.localeCompare(b.name))
  return head.concat(rest)
}

function voiceHTML(v: Voice, i: number): string {
  const role = v.title ?? v.role ?? ''
  const img = v.image
    ? `<img src="${esc(v.image)}" alt="" width="480" height="480" loading="lazy" decoding="async"><span class="voice__initials" aria-hidden="true">${esc(initials(v.name))}</span>`
    : `<span class="voice__initials" aria-hidden="true">${esc(initials(v.name))}</span>`
  return `<li class="voice${v.image ? '' : ' voice--ink'}" style="--i:${i}"><div class="voice__img">${img}</div><p class="voice__name">${esc(v.name)}</p>${role ? `<p class="voice__title">${esc(role)}</p>` : ''}${v.country ? `<span class="chip chip--outline voice__country">${esc(v.country)}</span>` : ''}</li>`
}
function tbaHTML(i: number, v?: Voice): string {
  if (v) return `<li class="voice homer__orb" style="--i:${i}"><div class="voice__img">${v.image ? `<img src="${esc(v.image)}" alt="" width="480" height="480" loading="lazy">` : ''}<span class="voice__initials" aria-hidden="true">${esc(initials(v.name))}</span></div><p class="voice__name">${esc(v.name)}</p></li>`
  return `<li class="voice voice--tba homer__orb" style="--i:${i}"><div class="voice__img"><span class="index homer__tba">TBA</span></div><span class="sr-only">Speaker to be announced</span></li>`
}

/* ── module state read by mood(p) (mood has no ctx) ── */
let reduced = false
let portrait = false
let blackOn: boolean | null = null

export const homer: Chapter = {
  id: 'homer',
  label: 'I Am Homer',
  inNav: false,

  mount(ctx) {
    const { el, shared, content } = ctx
    reduced = shared.reduced
    portrait = shared.mobile
    const ps = (content?.pastSpeakers ?? {}) as Record<string, unknown>
    const heading = str(ps.heading, 'Voices of MTF')
    const mtf11 = (ps.mtf11Speakers ?? {}) as { value?: unknown; status?: string }
    const announced: Voice[] = Array.isArray(mtf11.value) ? (mtf11.value as Voice[]).filter(v => v && typeof v.name === 'string') : []
    const eyebrowText = `${heading} · ${announced.length ? 'MTF11 speakers' : 'MTF11 speakers to be announced'}`
    const senators: Senator[] = Array.isArray((content?.senators as { items?: unknown })?.items) ? ((content.senators as { items: Senator[] }).items).filter(s => s && typeof s.name === 'string') : []
    const emails = ((content?.contact as { emails?: { id?: string; address?: string }[] })?.emails) ?? []
    const forumMail = emails.find(e => e.id === 'forum')?.address ?? 'forum@medtourismfoundation.com'
    const speakMail = `mailto:${forumMail}?subject=${encodeURIComponent('Speaking at MTF11')}`
    const voices = orderVoices((speakersJson as Voice[]).filter(v => v && typeof v.name === 'string'))
    const orbs = Array.from({ length: TBA_COUNT }, (_, i) => tbaHTML(i, announced[i]))

    const frame = `
      <div class="pin__frame">
        <div class="homer__emblema">
          <p class="eyebrow homer__eyebrow"><span class="index tnum">12 —</span><span class="chip">${esc(eyebrowText)}</span></p>
          <h2 class="homer__h2">${esc(HEADLINE)}</h2>
          <p class="s homer__name">${esc(NAME)}</p>
          <div class="homer__stack">${REVEAL.map(l => `<p class="s">${esc(l)}</p>`).join('')}</div>
        </div>
        <div class="homer__forum">
          <p class="f homer__lead">${esc(LEAD)}</p>
          <section class="homer__block homer__block--a" aria-label="${esc(HEAD_A)}">
            <span class="homer__rule"></span>
            <p class="label homer__head">${esc(HEAD_A)}</p>
            <ul class="homer__orbs">${orbs.join('')}</ul>
          </section>
          <nav class="homer__links" aria-label="Voices links">
            <a class="link link--mono" href="${speakMail}">Speak at MTF11<span class="btn__arrow">→</span></a>
            <button class="link link--mono homer__all" type="button" aria-expanded="false" aria-controls="homer-frieze">All voices<span class="btn__arrow">→</span></button>
          </nav>
          <section class="homer__block homer__block--b" id="homer-frieze" aria-label="${esc(HEAD_B)}">
            <span class="homer__rule"></span>
            <div class="homer__headrow"><p class="label homer__head">${esc(HEAD_B)}</p><button class="link link--mono homer__close" type="button" aria-label="Close all voices">Close<span class="btn__arrow">×</span></button></div>
            <ul class="voice-grid homer__frieze">${voices.map(voiceHTML).join('')}</ul>
          </section>
          <section class="homer__block homer__block--s" aria-label="${esc(HEAD_SENATE)}">
            <span class="homer__rule"></span>
            <p class="label homer__head">${esc(HEAD_SENATE)}</p>
            <ul class="homer__senate">${senators.map(s => `<li><span class="homer__sname">${esc(s.name)}</span>${s.country ? `<span class="homer__scountry"> · ${esc(s.country)}</span>` : ''}</li>`).join('')}</ul>
          </section>
        </div>
        <div class="homer__close-lines">${CLOSE.map(l => `<p class="s">${esc(l)}</p>`).join('')}</div>
      </div>`

    /* ── static (reduced motion): the same DOM as a flowing stack, everything visible ── */
    if (reduced) {
      el.classList.add('chapter--static')
      el.innerHTML = frame
      wireFrieze(el, true)
      return
    }

    const { pin, tl } = createFilm(ctx, { length: shared.mobile ? 3.8 : 5.7 })
    pin.innerHTML = `<div class="pin__layer shadow" aria-hidden="true"></div>${frame}<div class="pin__layer fx" aria-hidden="true"></div>`
    pin.style.setProperty('--sky-top-static', 'var(--abyss)')
    pin.style.setProperty('--sky-bottom-static', 'color-mix(in oklab, var(--abyss) 70%, var(--sea))')
    wireFrieze(pin, false)

    const q = <T extends HTMLElement = HTMLElement>(s: string) => pin.querySelector(s) as T
    const qa = <T extends HTMLElement = HTMLElement>(s: string) => Array.from(pin.querySelectorAll(s)) as T[]
    const eyebrow = q('.homer__eyebrow'), h2 = q('.homer__h2'), name = q('.homer__name')
    const stack = qa('.homer__stack .s'), emblema = q('.homer__emblema')
    const lead = q('.homer__lead'), blockA = q('.homer__block--a'), ruleA = q('.homer__block--a .homer__rule'), headA = q('.homer__block--a .homer__head')
    const orbEls = qa('.homer__orb'), links = q('.homer__links')
    const blockB = q('.homer__block--b'), ruleB = q('.homer__block--b .homer__rule'), headB = q('.homer__block--b .homer__head')
    const cards = qa('.homer__frieze .voice'), blockS = q('.homer__block--s'), ruleS = q('.homer__block--s .homer__rule'), headS = q('.homer__block--s .homer__head')
    const senate = q('.homer__senate'), closeLines = qa('.homer__close-lines .s')

    const D = 0.05
    const show = (t: HTMLElement | HTMLElement[], at: number, dur = D, y = 10) => tl.fromTo(t, { opacity: 0, y }, { opacity: 1, y: 0, duration: dur }, at)
    const hide = (t: HTMLElement | HTMLElement[], at: number, dur = D) => tl.to(t, { opacity: 0, y: -8, duration: dur }, at)
    const draw = (t: HTMLElement, at: number, dur = D) => tl.fromTo(t, { scaleX: 0 }, { scaleX: 1, duration: dur }, at)
    const light = (t: HTMLElement, at: number, dur = 0.03) => tl.fromTo(t, { '--lit': 0 }, { '--lit': 1, duration: dur }, at)

    /* THE BEAT MAP — one substantive beat per ~5–6 % of p (≈ 280 px of scroll at 900 px), the hold exempt.
       Sub-parts of one block (rule → label → content → the star's light) belong to that block's beat and are
       staged inside its window; no two blocks are ever mid-reveal together. Frame empty p < .048 and p > .90. */

    /* p 0–.20 · the emblema settles, centred — the only centred headline in the film */
    show(eyebrow, 0.048, 0.032, 0)
    show(h2, 0.100, 0.055, 6)
    /* .158 · I am Homer. — the headline recedes to the faint register */
    show(name, 0.158, 0.045, 4)
    tl.to(h2, { color: 'var(--fg-faint)', duration: 0.045 }, 0.158)

    /* .210–.420 · THE HOLD — 1.2 vh of scroll in which nothing happens (desktop; .8 vh on portrait) */

    /* .420–.460 · one star (mood); .432 / .488 the two revelation lines, older lines fading back */
    show(stack[0]!, 0.432, 0.040, 4)
    tl.to(name, { color: 'var(--fg-muted)', duration: 0.04 }, 0.432)
    show(stack[1]!, 0.488, 0.040, 4)
    tl.to(stack[0]!, { color: 'var(--fg-faint)', duration: 0.04 }, 0.488)

    /* .540 · the emblema gives way to the Forum stage (left column: the lead, then its links) */
    hide(emblema, 0.540, 0.036)
    show(lead, 0.580, 0.042)
    show(links, 0.612, 0.028)
    /* .640 · sub-block A, right column: rule → label → the eight orb rims, lit one at a time */
    draw(ruleA, 0.640, 0.026)
    show(headA, 0.663, 0.020, 0)
    show(orbEls, 0.678, 0.026, 6)
    orbEls.forEach((o, i) => light(o, 0.682 + i * 0.002))
    /* .700 · sub-block B, the frieze of the 10th edition: rule → label → cards → the star's light crosses them */
    draw(ruleB, 0.700, 0.026)
    show(headB, 0.723, 0.020, 0)
    show(cards, 0.738, 0.030, 8)
    cards.forEach((c, i) => light(c, 0.742 + Math.min(i, 9) * 0.002))
    /* .760 · the Senate strip */
    draw(ruleS, 0.760, 0.022)
    show(headS, 0.780, 0.018, 0)
    show(senate, 0.788, 0.020, 6)
    /* .818 · the stage clears · .840–.878 the closing couplet at the sign-off position · out by .90 (seam) */
    hide([lead, blockA, links, blockB, blockS], 0.818, 0.022)
    show(closeLines[0]!, 0.840, 0.022, 4)
    show(closeLines[1]!, 0.856, 0.022, 4)
    tl.to(closeLines[0]!, { color: 'var(--fg-faint)', duration: 0.02 }, 0.860)
    hide(closeLines, 0.884, 0.016)
  },

  /** html.is-black belongs to the chapter until the star: black below p .42, chrome back with the star. */
  onProgress(p) {
    if (reduced) return
    const on = p < 0.42
    if (on !== blackOn) { blackOn = on; document.documentElement.classList.toggle('is-black', on) }
  },
  onLeave() {
    if (blackOn) { blackOn = null; document.documentElement.classList.remove('is-black') }
  },

  mood: p => {
    const q = reduced ? 1 : p
    const lift = kf(q, [[0.9, 0], [1, 1]])
    return {
      camX: kf(q, [[0, 0.8], [0.42, 0.4], [0.9, 0], [1, 0]]),
      camY: kf(q, [[0, 1.6], [0.42, 1.4], [0.9, 1.2], [1, 0.9]]),
      camZ: kf(q, [[0, -4], [0.42, -6], [0.9, -8], [1, -10]]),
      camTilt: kf(q, [[0, 0], [0.42, 0.02], [1, 0.02]]),
      camYaw: TAU, fov: 34,
      skyTop: kfRGB(q, [[0.9, BLACK], [1, ABYSS]], skyTop),
      skyBottom: kfRGB(q, [[0.9, BLACK], [1, PREDAWN]], skyBottom),
      haze: 0.35 * lift,
      sunX: kf(q, [[0, 0.4], [0.42, 0.4], [0.9, 0], [1, 0]]),
      // p 1 hands the star to Ch 13 above the eye-level horizon (its camera sits at y .9): (0, 1.05, −22).
      // Portrait rides the star ~.45 higher through the film: at 390 × 844 the 2.6 arc puts it exactly on the
      // emblema's eyebrow and on the Forum lead — the type would be read through the glare.
      sunY: portrait
        ? kf(q, [[0, 3.0], [0.42, 3.0], [0.9, 2.85], [1, 1.05]])
        : kf(q, [[0, 2.6], [0.42, 2.6], [0.9, 2.4], [1, 1.05]]),
      sunZ: kf(q, [[0, -14], [0.9, -14], [1, -22]]),
      sunRadius: 0.14,
      sunGlow: kf(q, [[0, 0], [0.40, 0], [0.44, 0.45], [0.9, 0.45], [1, 1.0]]),   // the bible's 1.8 reads as a sun; a star lights the sky far less
      sunHeat: 0,
      sunVisible: kf(q, [[0, 0], [0.40, 0], [0.44, 1], [1, 1]]),
      seaOpacity: 0.6 * lift, seaColor: PREDAWN,
      stars: 0.3 * lift, constellation: 0,
      tess: kf(q, [[0, 0.6], [0.2, 0], [1, 0]]), tessForm: 3, tessSpread: kf(q, [[0, 1], [0.2, 4], [1, 4]]),   // spread ≥ 4 with tess 0 = the field is gone
      veil: 3, p1: 0, p3: 0, p4: 0,
      bloom: kf(q, [[0, 0.7], [0.42, 0.85], [0.9, 0.85], [1, 0.8]]),
      grain: kf(q, [[0.9, 0.04], [1, 0.06]]),
      vignette: 0.3 * lift,
      mosaic: 0, aberration: 0,
      warmth: 0.2 * lift,
    }
  },
}

/** ALL VOICES → expands the frieze in place (an overlay panel inside the frame; a flowing list in the static stack). */
function wireFrieze(root: HTMLElement, isStatic: boolean) {
  const block = root.querySelector('.homer__block--b') as HTMLElement | null
  const grid = root.querySelector('.homer__frieze') as HTMLElement | null
  const all = root.querySelector('.homer__all') as HTMLButtonElement | null
  const close = root.querySelector('.homer__close') as HTMLButtonElement | null
  if (!block || !grid || !all || !close) return
  const cards = Array.from(grid.children) as HTMLElement[]
  const cell = 7.5 * 16, gap = 16   /* must match .homer__frieze's minmax(7.5rem, 1fr) / 1rem column gap */
  /* collapsed: one complete row of the curated voices (2 on portrait) */
  const collapse = () => {
    const w = grid.clientWidth || root.clientWidth * 0.86
    const cols = window.innerWidth < 820 ? 3 : Math.max(2, Math.floor((w + gap) / (cell + gap)))
    cards.forEach((c, i) => { c.hidden = !isStatic && i >= cols })
  }
  const set = (open: boolean) => {
    block.classList.toggle('is-open', open)
    all.setAttribute('aria-expanded', String(open))
    if (open) {
      cards.forEach(c => { c.hidden = false })
      grid.setAttribute('data-lenis-prevent', '')
      close.focus()
    } else {
      grid.removeAttribute('data-lenis-prevent')
      collapse()
      all.focus()
    }
  }
  if (isStatic) {
    /* static stack: show the curated row; the button grows the list in place */
    cards.forEach((c, i) => { c.hidden = i >= 13 })
    all.addEventListener('click', () => { const open = all.getAttribute('aria-expanded') !== 'true'; all.setAttribute('aria-expanded', String(open)); cards.forEach((c, i) => { c.hidden = !open && i >= 13 }); block.classList.toggle('is-open', open) })
    close.hidden = true
  } else {
    collapse()
    let raf = 0
    window.addEventListener('resize', () => { if (block.classList.contains('is-open')) return; cancelAnimationFrame(raf); raf = requestAnimationFrame(collapse) })
    all.addEventListener('click', () => set(all.getAttribute('aria-expanded') !== 'true'))
    close.addEventListener('click', () => set(false))
    root.addEventListener('keydown', e => { if (e.key === 'Escape' && block.classList.contains('is-open')) set(false) })
  }
  /* a missing or broken portrait degrades to the ink arch with initials */
  grid.addEventListener('error', e => {
    const img = e.target as HTMLElement
    if (img.tagName !== 'IMG') return
    img.remove()
    img.closest('.voice')?.classList.add('voice--ink')
  }, true)
}
