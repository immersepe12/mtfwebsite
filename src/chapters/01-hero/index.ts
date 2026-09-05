import type { Chapter, ChapterCtx, Shared } from '../../engine/chapter'
import { createFilm } from '../../engine/film'
import { gsap } from '../../engine/scroll'
import { reveal } from '../../engine/text'
import { hex, DEFAULT_MOOD, type Mood, type MoodPatch, type RGB } from '../../engine/mood'
import { clamp } from '../../engine/utils'
import './style.css'

/**
 * Chapter 01 — THE SUN · Overture · 16:56 · SUNSET · DESIGN-BIBLE §6.1
 *
 * The sun sets inside the word SUN. The word is an SVG knockout plate (--press with three holes) whose
 * baseline is glued to the world's sea horizon; the fixed WebGL sun sits on that line, so sinking the sun
 * through `mood` drains the light out of the letters from the top down. Everything else is type on the plate.
 *
 * Beats (desktop p, one substantive beat every ~6 %, no gap over 8 %): head reveals on `mtf:ready`
 * (time-based, the only wght tween) · .10 Forum rule · .16 sub-line · .22/.34/.46 the question cards
 * INTERLEAVED with .28/.40/.52 the Forum lines · .58 WATCH MTF10 · .64 ember glint · .72 ember opens to the
 * full rim · .79 storyteller stitch · .85→.90 exit · the plate stays until p 1 (black on black).
 * Portrait runs the same beats as a sequence in one band (Forum out .43 → cards .47/.54/.61 → the mono link
 * out .77 → stitch .81 in the slot it vacates) so nothing is ever stacked. Mood: .45→.64 the tiles scatter,
 * .6→.75 the sun sinks.
 *
 * Placement invariants (QA round 2 — "no overlap, anywhere"): the head is hung off the word's cap top but
 * clamped so it can never cross the fixed header (`--head-min`, and the plate is sized against the HIGHEST
 * baseline the chapter reaches so the clamp never has to bite); every block of copy sits on the opaque plate,
 * never inside a letter aperture; the two lower columns are equal width with a clear alley between them; the
 * stitch is a bottom-left sign-off (§4.2) well clear of the letters and of the corner marks.
 */

type Key = [number, number][]
const kf = (p: number, k: Key): number => {
  if (p <= k[0][0]) return k[0][1]
  for (let i = 1; i < k.length; i++) {
    const [p1, v1] = k[i]
    if (p <= p1) { const [p0, v0] = k[i - 1]; return v0 + (v1 - v0) * ((p - p0) / (p1 - p0)) }
  }
  return k[k.length - 1][1]
}
const kfRGB = (p: number, k: [number, RGB][], out: RGB): RGB => {
  const r = kf(p, k.map(([q, c]) => [q, c[0]])), g = kf(p, k.map(([q, c]) => [q, c[1]])), b = kf(p, k.map(([q, c]) => [q, c[2]]))
  out[0] = r; out[1] = g; out[2] = b
  return out
}

// ── mood keyframes (§6.1 table, re-solved so the disc actually sits on the sea line; see README) ──
const SKY: [number, RGB][] = [[0, hex('#B44A2D')], [.45, hex('#8C3A2B')], [1, hex('#3A1A14')]]
const skyTmp: RGB = [0, 0, 0]
let mobile = false, reduced = false
type HeroEl = HTMLElement & { __heroTick?: (s: Shared) => void }
const moodAt = (p: number): MoodPatch => ({
  camX: 0, camYaw: 0, fov: 34,
  camY: kf(p, [[0, -1.0], [.45, -.95], [.6, -.9], [1, .6]]),
  camZ: kf(p, [[0, 8], [.45, 7.6], [1, 7]]),
  camTilt: kf(p, mobile ? [[0, .025], [.45, .025], [1, .05]] : [[0, .07], [.45, .07], [1, .05]]),
  skyTop: DEFAULT_MOOD.skyTop, skyBottom: kfRGB(p, SKY, skyTmp),
  haze: kf(p, [[0, .3], [.45, .3], [1, .25]]),
  sunX: 0, sunZ: -6, sunVisible: 1, sunHeat: 1,
  sunY: kf(p, [[0, -.35], [.45, -.42], [.6, -.5], [1, -1.9]]),
  sunRadius: kf(p, mobile ? [[0, .55], [.45, .55], [1, 1]] : [[0, 1.2], [.45, 1.2], [1, 1]]),
  sunGlow: kf(p, [[0, 1], [.6, 1], [1, .55]]),
  seaY: -1.2, seaSpeed: .35, seaOpacity: 1,
  seaAmp: kf(p, [[0, .12], [.45, .12], [1, .14]]),
  tess: kf(p, [[0, 1], [.45, 1], [.64, .3], [1, .2]]), tessForm: 0, tessSpread: 1,
  tessGold: kf(p, [[0, .9], [.45, .9], [1, .6]]),
  tessGlint: kf(p, [[0, .8], [.45, .8], [1, .3]]),
  stars: kf(p, [[0, .15], [.45, .2], [1, .35]]),
  veil: 0, p1: 0, p2: 0, p3: 0, p4: 0,
  bloom: kf(p, [[0, .9], [.45, .9], [1, .7]]),
  warmth: kf(p, [[0, .85], [.6, .8], [1, .55]]),
  mosaic: 0, aberration: 0,
})

/** Screen % (from the top) of the sea horizon for a mood, without the mouse offsets — the stable line the type hangs from. */
const horizonPct = (m: Mood) => {
  const a = m.camTilt + Math.atan((m.camY - m.seaY) / 400)
  return clamp((1 + Math.tan(a) / Math.tan((m.fov / 2) * Math.PI / 180)) * 50, 30, 80)
}

const val = (x: unknown): string => (x && typeof x === 'object' && 'value' in (x as object)) ? String((x as { value: unknown }).value) : String(x ?? '')
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const CARD_FRAME = ['t', 'r', 'b', 'l'].map(s => `<span class="card__rule card__rule--${s}"></span>`).join('') +
  ['tl', 'tr', 'bl', 'br'].map(s => `<span class="card__corner card__corner--${s}"></span>`).join('')

function copy(content: any) {
  const ev = content?.event ?? {}, th = content?.theme ?? {}
  const name = val(ev.name).replace(/\s*\d{4}$/, '')
  const questions: { letter: string; text: string }[] = (th.questions ?? []).map((q: any) => ({ letter: val(q.letter), text: val(q.text) }))
  return {
    eyebrowA: `${name} · ${val(ev.edition?.ordinal)} edition`,
    eyebrowB: `${val(ev.city)} · ${val(ev.dates?.display)}`,
    sub: val(ev.theme?.expansion),
    lines: ((th.lines ?? []) as unknown[]).slice(0, 3).map(val),
    questions,
    watch: val(content?.registration?.watchLastYear?.currentUrl) || '#',
    stitch: 'The Sun fills the screens.',
  }
}

function typeHTML(c: ReturnType<typeof copy>, staticMode: boolean) {
  const h1 = staticMode
    ? `<h1 class="hero__h1"><span class="hero__medi display">Mediterranean</span> <span class="hero__sun display">SUN</span></h1>`
    : `<h1 class="hero__h1"><span class="hero__medi display">Mediterranean</span> <span class="sr-only">SUN</span></h1>`
  return `
  <div class="hero__head">
    <span class="hero__rule rule rule--label"></span>
    <p class="hero__eyebrow eyebrow"><span class="index">01 —</span><span class="chip-row"><span class="chip">${esc(c.eyebrowA)}</span><span class="chip">${esc(c.eyebrowB)}</span></span></p>
    ${h1}
  </div>
  <div class="hero__forum">
    <span class="hero__rule2 rule rule--label"></span>
    <p class="hero__sub h3">${esc(c.sub)}</p>
    <div class="hero__lines">${c.lines.map(l => `<p class="f hero__line">${esc(l)}</p>`).join('')}</div>
  </div>
  <div class="hero__q">
    <ol class="hero__cards">${c.questions.map(q => `<li class="card card--frame hero__card">${CARD_FRAME}<span class="hero__glyph">${esc(q.letter)}</span><span class="hero__qtext caps">${esc(q.text)}</span></li>`).join('')}</ol>
    <a class="link link--mono hero__watch" href="${esc(c.watch)}" target="_blank" rel="noopener noreferrer">Watch MTF10 <span class="btn__arrow">↗</span></a>
  </div>
  <p class="s hero__stitch">${esc(c.stitch)}</p>`
}

const PLATE = `<svg class="sun-plate" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 1440 900">
  <defs><mask id="hero-sunmask"><rect class="sun-plate__bg" width="1440" height="900" fill="#fff"/>
    <text class="sun-plate__word" x="720" y="560" text-anchor="middle" font-family="Fraunces" font-weight="320" font-style="normal" font-size="520"
      style="font-variation-settings:'opsz' 144,'SOFT' 0,'WONK' 0;text-rendering:geometricPrecision" fill="#000" letter-spacing="-.04em">SUN</text></mask></defs>
  <rect class="sun-plate__ink" width="1440" height="900" fill="var(--press)" mask="url(#hero-sunmask)"/>
</svg>`

/** Cap-height and advance ratios of Fraunces 320 (measured once the font is in; sane fallbacks before). */
let capRatio = .7, wRatio = 1.98
function measureFont() {
  try {
    const cv = document.createElement('canvas').getContext('2d')
    if (!cv || !document.fonts.check('320 100px Fraunces')) return false
    cv.font = '320 100px Fraunces'
    const h = cv.measureText('H').actualBoundingBoxAscent / 100
    const w = cv.measureText('SUN').width / 100 - .08
    if (h > .5 && h < .9) capRatio = h
    if (w > 1.4 && w < 2.6) wRatio = w
    return true
  } catch { return false }
}

export const hero: Chapter = {
  id: 'hero', label: 'The Sun', navIndex: '01', inNav: true,

  mount(ctx: ChapterCtx) {
    const { el, shared, world } = ctx
    mobile = shared.mobile; reduced = shared.reduced
    const c = copy(ctx.content)

    if (shared.reduced) {
      el.classList.add('chapter--static')
      el.innerHTML = `<div class="pin__frame"><div class="hero__type">${typeHTML(c, true)}</div></div>`
      return
    }

    const { pin, tl } = createFilm(ctx, { length: mobile ? 2 : 3 })
    pin.innerHTML = `<div class="pin__layer plate">${PLATE}</div>
      <div class="pin__frame"><span class="hero__probe" aria-hidden="true"></span><div class="hero__type">${typeHTML(c, false)}</div></div>
      <div class="pin__layer fx"><span class="hero__ember"></span></div>`

    const q = <T extends Element = HTMLElement>(s: string) => pin.querySelector(s) as T
    const qa = <T extends Element = HTMLElement>(s: string) => Array.from(pin.querySelectorAll(s)) as T[]
    const svg = q<SVGSVGElement>('.sun-plate'), word = q<SVGTextElement>('.sun-plate__word')
    const rects = qa<SVGRectElement>('.sun-plate rect')
    const probe = q('.hero__probe'), type = q('.hero__type')
    const head = q('.hero__head'), rule1 = q('.hero__rule'), eyebrow = q('.hero__eyebrow'), medi = q('.hero__medi')
    const rule2 = q('.hero__rule2'), sub = q('.hero__sub'), lines = qa('.hero__line')
    const cards = qa('.hero__card'), watch = q('.hero__watch'), stitch = q('.hero__stitch'), ember = q('.hero__ember')

    // ── the plate: size the word so its cap height = --fs-sun (bounded by the room above the horizon) ──
    const mood0: Mood = { ...DEFAULT_MOOD, ...moodAt(0) }
    const mood1: Mood = { ...DEFAULT_MOOD, ...moodAt(1) }
    const HEAD_MIN = mobile ? 84 : 92   // the fixed header ends at 75 px; this is the floor the head may never cross
    let capPx = 0, baseStable = 0, lastY = -1
    const fit = (useWorld = false) => {
      const w = shared.vw || pin.clientWidth, h = shared.vh || pin.clientHeight
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      for (const r of rects) { r.setAttribute('width', String(w)); r.setAttribute('height', String(h)) }
      baseStable = (horizonPct(useWorld && world ? world.mood : mood0) / 100) * h
      // The word rides the horizon, so size it against the HIGHEST baseline the chapter ever reaches and
      // reserve the head's measured height above it — the head can then never slide under the header.
      const headH = Math.round(head.offsetHeight) || h * .16
      pin.style.setProperty('--head-h', `${headH}px`)
      const baseMin = Math.min(baseStable, (horizonPct(mood1) / 100) * h)
      const capTopMin = Math.max(h * .2, HEAD_MIN + headH + 10)
      const fsSun = probe.offsetHeight || h * .3
      const cap = Math.min(fsSun, Math.max(h * .16, baseMin - capTopMin))
      const fs = Math.min(cap / capRatio, (w * .9) / wRatio)
      capPx = fs * capRatio
      word.setAttribute('font-size', fs.toFixed(1))
      word.setAttribute('x', (w / 2).toFixed(1))
      word.setAttribute('y', baseStable.toFixed(1)); lastY = baseStable
      pin.style.setProperty('--sun-top', `${(baseStable - capPx).toFixed(1)}px`)
      pin.style.setProperty('--sun-base', `${baseStable.toFixed(1)}px`)
      pin.style.setProperty('--sun-w', `${(fs * wRatio).toFixed(1)}px`)
    }
    fit()
    const refit = () => { measureFont(); fit(true) }
    document.fonts?.ready.then(refit)
    document.addEventListener('mtf:ready', refit, { once: true })
    window.addEventListener('resize', () => fit(true), { passive: true })

    // ── the head: revealed once, in time, when the curtain opens (the film's only wght tween) ──
    gsap.set(rule1, { scaleX: 0, transformOrigin: 'left center' })
    gsap.set(eyebrow, { opacity: 0 })
    reveal(medi, { type: 'lines', immediate: true, duration: 1.2 })
    document.addEventListener('mtf:ready', () => {
      gsap.to(rule1, { scaleX: 1, duration: 1.15, ease: 'power4.inOut' })
      gsap.to(eyebrow, { opacity: 1, duration: .32, ease: 'none', delay: .5 })
      gsap.fromTo(medi, { fontWeight: 200 }, { fontWeight: 300, duration: 1.2, ease: 'power2.out', delay: .15 })
    }, { once: true })

    // ── initial states (the scrubbed timeline owns them from here) ──
    gsap.set([rule2, ...qa('.card__rule--t'), ...qa('.card__rule--b')], { scaleX: 0 })
    gsap.set([...qa('.card__rule--l'), ...qa('.card__rule--r')], { scaleY: 0 })
    gsap.set([sub, ...lines, ...qa('.hero__glyph'), ...qa('.hero__qtext'), ...qa('.card__corner'), watch, stitch, ember], { opacity: 0 })

    // ── the scrubbed film ──────────────────────────────────────────────────────────────────────
    // One substantive beat every ~6 % of p (≈ 180 px of scroll at the film's pacing), no gap over 8 %:
    // the Forum column and the question cards INTERLEAVE rather than running as two clumped stacks.
    const D = .05
    const cardAt = (i: number) => (mobile ? [.47, .54, .61] : [.22, .34, .46])[i]
    const lineAt = (i: number) => (mobile ? [.22, .29, .36] : [.28, .40, .52])[i]
    const T = mobile
      ? { rule: .09, sub: .15, forumOut: .43, watch: .67, ember: .73, emberWide: .77, watchOut: .77, stitch: .81, exit: .86 }
      : { rule: .10, sub: .16, forumOut: -1, watch: .58, ember: .64, emberWide: .72, watchOut: -1, stitch: .79, exit: .85 }

    tl.fromTo(rule2, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: .05 }, T.rule)
      .fromTo(sub, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: D }, T.sub)
    cards.forEach((card, i) => {
      const at = cardAt(i)
      const rules = Array.from(card.querySelectorAll<HTMLElement>('.card__rule'))
      const corners = Array.from(card.querySelectorAll<HTMLElement>('.card__corner'))
      const glyph = card.querySelector<HTMLElement>('.hero__glyph')!, text = card.querySelector<HTMLElement>('.hero__qtext')!
      // rule → glyph → label (§5.4-3) but compressed into ~3 % of p: a card is never left standing as an
      // empty box while the scrub rests on it (QA round 2 — the "ghost tile" fault).
      tl.fromTo(corners, { opacity: 0 }, { opacity: 1, duration: .008 }, at)
        .fromTo(rules[0], { scaleX: 0 }, { scaleX: 1, duration: .022 }, at)
        .fromTo(rules[2], { scaleX: 0 }, { scaleX: 1, duration: .022 }, at + .004)
        .fromTo(rules[3], { scaleY: 0 }, { scaleY: 1, duration: .018 }, at + .008)
        .fromTo(rules[1], { scaleY: 0 }, { scaleY: 1, duration: .018 }, at + .011)
        .fromTo(glyph, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .018 }, at + .008)
        .fromTo(text, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .018 }, at + .014)
    })
    lines.forEach((line, i) => tl.fromTo(line, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: D }, lineAt(i)))
    tl.fromTo(watch, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: D }, T.watch)
    // portrait is a sequence in one band: the Forum column leaves before the cards arrive, and the mono link
    // leaves before the stitch takes the slot below the cards. Nothing is ever stacked on anything else.
    if (mobile) {
      tl.to([rule2, sub, ...lines], { opacity: 0, y: -8, duration: .04 }, T.forumOut)
        .to(watch, { opacity: 0, y: -8, duration: .04 }, T.watchOut)
    }
    // the ember on the baseline: a glint first, then the full rim as the last light goes
    gsap.set(ember, { xPercent: -50, y: -1, scaleX: .18, transformOrigin: '50% 50%' })
    tl.fromTo(ember, { opacity: 0 }, { opacity: .85, duration: .06 }, T.ember)
      .to(ember, { scaleX: 1, duration: .06 }, T.emberWide)
    tl.fromTo(stitch, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .04 }, T.stitch)
    // exit: the frame is empty by .90; the plate stays (black on black hands over to Ch 02)
    tl.to([head, rule2, sub, ...lines, ...cards, watch, stitch], { opacity: 0, y: -8, duration: .05 }, T.exit)
      .to(ember, { opacity: 0, duration: .05 }, T.exit)

    // ── card glint (one delegated listener; the card carries --mx/--my) ──
    const list = q('.hero__cards')
    list.addEventListener('pointermove', e => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('.hero__card')
      if (!card) return
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`)
      card.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`)
    }, { passive: true })

    // ── per-frame: keep the baseline on the true sea line; ±6 px type parallax (desktop pointer only) ──
    let mx = 0, my = 0
    const parallax = !shared.touch && !mobile
    const tick = (s: Shared) => {
      if (!world) return
      const m = world.mood
      const pr = world.project(m.camX - Math.sin(m.camYaw) * 400, m.seaY, m.camZ - Math.cos(m.camYaw) * 400)
      const y = clamp(pr.y, s.vh * .3, s.vh * .8)
      if (Math.abs(y - lastY) > .25) { lastY = y; word.setAttribute('y', y.toFixed(1)) }
      const st = (horizonPct(m) / 100) * s.vh
      if (Math.abs(st - baseStable) > .5) {
        baseStable = st
        pin.style.setProperty('--sun-base', `${st.toFixed(1)}px`)
        pin.style.setProperty('--sun-top', `${(st - capPx).toFixed(1)}px`)
      }
      if (parallax && (Math.abs(s.mouse.x - mx) > .004 || Math.abs(s.mouse.y - my) > .004)) {
        mx = s.mouse.x; my = s.mouse.y
        type.style.setProperty('--mx', mx.toFixed(3)); type.style.setProperty('--my', my.toFixed(3))
      }
    }
    ;(el as HeroEl).__heroTick = tick
  },

  onFrame(shared, ctx) { (ctx.el as HeroEl).__heroTick?.(shared) },

  // reduced motion: the still is the sunset in the word (p ≤ .45), not the black plate
  mood: p => moodAt(reduced ? Math.min(p, .45) : p),
}
