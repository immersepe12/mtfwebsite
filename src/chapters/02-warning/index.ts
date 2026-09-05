import type { Chapter, ChapterCtx } from '../../engine/chapter'
import { createFilm } from '../../engine/film'
import { gsap } from '../../engine/scroll'
import { SplitText } from 'gsap/SplitText'
import { hex, type Mood, type RGB } from '../../engine/mood'
import { cattle, setProgress as walk } from '../../art/cattle'
import { bolt, strike } from '../../art/bolt'
import './style.css'

/**
 * Chapter 02 — THE WARNING · Canto I · Stewardship · 17:40 · DESIGN-BIBLE §6.2
 * The cattle of Helios walk the horizon; Zeus answers; the whole frame becomes tesserae and falls into the sea.
 * Beats (p): head .06–.16 · storyteller ×6 .13–.33 · SHATTER .35–.47 · Forum .46–.77 · exit .78–.84 · Ulysses alone .80–.90 · S fills .92
 */

gsap.registerPlugin(SplitText)

/* ─── mood keyframes (§6.2 table, piecewise-linear) ─── */
type KF = [number, number][]
const kf = (p: number, k: KF): number => {
  if (p <= k[0][0]) return k[0][1]
  for (let i = 1; i < k.length; i++) {
    const p1 = k[i][0]
    if (p <= p1) { const p0 = k[i - 1][0], v0 = k[i - 1][1]; return v0 + (k[i][1] - v0) * ((p - p0) / (p1 - p0)) }
  }
  return k[k.length - 1][1]
}
const EMBER = hex('#3A1A14'), EMBER2 = hex('#2A1410'), SEA = hex('#0E3D57'), ABYSS = hex('#06192B')
const SKY: [number, RGB][] = [[0, EMBER], [.34, EMBER2], [.38, SEA], [.46, ABYSS], [1, ABYSS]]
const kfRGB = (p: number, k: [number, RGB][]): RGB => {
  if (p <= k[0][0]) return k[0][1]
  for (let i = 1; i < k.length; i++) {
    if (p <= k[i][0]) {
      const a = k[i - 1][1], b = k[i][1], t = (p - k[i - 1][0]) / (k[i][0] - k[i - 1][0])
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
    }
  }
  return k[k.length - 1][1]
}
const K = {
  camX: [[0, 0], [.34, .3], [.46, .4], [1, .6]] as KF,
  camY: [[.34, .6], [.38, .55], [.46, .5]] as KF,
  camTilt: [[.38, .05], [.46, .04]] as KF,
  sunY: [[0, -1.9], [.34, -2], [.38, -2], [.46, -2.2], [1, -2.4]] as KF,
  sunGlow: [[0, .55], [.34, .4], [.38, .2], [.46, 0]] as KF,
  sunHeat: [[.46, 1], [1, 0]] as KF,
  seaAmp: [[0, .14], [.34, .18], [.38, .6], [.46, .45], [1, .2]] as KF,
  seaSpeed: [[0, .35], [.34, .4], [.38, 1.2], [.46, .9], [1, .5]] as KF,
  tess: [[.34, .2], [.38, 1], [.40, 1], [.46, .1], [1, 0]] as KF,
  tessForm: [[.34, 0], [.38, 1]] as KF,
  tessSpread: [[.40, 1], [.46, 5], [1, 8]] as KF,
  p3: [[.40, 0], [.46, 1]] as KF,
  mosaic: [[.34, 0], [.39, 1], [.41, 1], [.46, 0]] as KF,
  aberration: [[.34, 0], [.36, .9], [.38, .9], [.46, .1], [1, 0]] as KF,
  stars: [[0, .35], [.34, .4], [.38, .2], [.46, .3], [1, .55]] as KF,
  bloom: [[.34, .7], [.38, .9], [.46, .6], [1, .5]] as KF,
  warmth: [[0, .55], [.34, .5], [.38, .3], [.46, .25], [1, .2]] as KF,
}
/** Reduced motion: the chapter's end state, the Shatter shown assembled (§5.5). */
const STILL: Partial<Mood> = {
  camX: .6, camY: .5, camZ: 7, camTilt: .04, camYaw: 0, fov: 34, sunY: -2.4, sunGlow: 0, sunHeat: 0,
  skyBottom: ABYSS, seaAmp: .2, seaSpeed: .5, tess: 1, tessForm: 1, tessSpread: 1, p3: 0, p4: 0, veil: 0,
  mosaic: 0, aberration: 0, stars: .55, bloom: .5, warmth: .2,
}

/* ─── copy (bible-final; Forum lines from content.json) ─── */
const STORY = ['His companions had been warned.', 'They knew.', 'And still they did.', 'Perhaps that too is human:', 'to know the road…', 'and still lose our way.']
const SHATTER = ['Zeus answered for Helios.', 'The ship breaks apart.', 'The sailors disappear.']
const ALONE = ['Ulysses alone.', 'No ship.', 'No companions.', 'Only a man…', 'between sea and sky.']
const HEADLINE = 'Do not touch what belongs to the Sun.'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

/* ─── chapter state (one instance on the page) ─── */
let reduced = false
let prevP = -1
let shakeEnd = 0
let glyphSent = false
let cattleSvgs: SVGElement[] = []
let boltSvg: SVGElement | null = null
let flashEl: HTMLElement | null = null

function frameHTML(c: any): string {
  const s = c.theme.pillars[0]
  const eyebrow = `02 — ${esc(String(s.deckTitle).replace(' | ', ' · '))} — ${esc(s.question)}`
  const story = (lines: string[], cls: string) => lines.map(l => `<p class="s ${cls}">${esc(l)}</p>`).join('')
  const f = [0, 1, 3].map(i => `<p class="f">${esc(s.lines[i])}</p>`).join('')
  const chips = (s.domains as string[]).map(d => `<li class="chip">${esc(d)}</li>`).join('')
  const verbs = (s.verbs as string[]).map(v => `<li>${esc(v)}</li>`).join('')
  return `
    <div class="head">
      <p class="eyebrow eye"><span class="eye__rule" aria-hidden="true"></span><span class="eye__t">${eyebrow}</span></p>
      <h2 class="h1 hl">${esc(HEADLINE)}</h2>
    </div>
    <div class="stack" aria-label="The Storyteller">${story(STORY, 's--w')}${story(SHATTER, 's--x')}${story(ALONE, 's--a')}</div>
    <div class="forum">
      <span class="forum__rule" aria-hidden="true"></span>
      <p class="label forum__label">${esc(s.letter)} · ${esc(String(s.name).toUpperCase())}</p>
      <div class="forum__lines">${f}</div>
      <ul class="chip-row domains" aria-label="Domains">${chips}</ul>
      <ol class="verbs" aria-label="In sequence">${verbs}</ol>
      <p class="h2 close">${esc(s.lines[2])}</p>
    </div>
    <p class="signoff"><span class="chip chip--gold">${esc(s.closingLine)}</span></p>`
}

export const warning: Chapter = {
  id: 'warning',
  label: 'The Warning',
  inNav: false,

  mount(ctx: ChapterCtx) {
    const { el, shared, content } = ctx
    reduced = shared.reduced
    if (reduced) {
      el.classList.add('chapter--static')
      el.innerHTML = `<div class="pin__frame">${frameHTML(content)}</div>`
      return
    }
    const { pin, tl } = createFilm(ctx, { length: shared.mobile ? 2.5 : 4 })
    pin.innerHTML = `
      <div class="pin__layer shadow tess-out">
        <div class="frieze">${cattle()}</div>
        <div class="frieze frieze--mirror" aria-hidden="true">${cattle()}</div>
      </div>
      <div class="pin__frame tess-out">${frameHTML(content)}</div>
      <div class="pin__layer fx">${bolt()}</div>
      <div class="pin__layer flash"></div>`

    const q = <T extends Element = HTMLElement>(sel: string) => pin.querySelector(sel) as T
    const qa = (sel: string) => Array.from(pin.querySelectorAll<HTMLElement>(sel))
    const shadow = q('.shadow'), frame = q('.pin__frame'), fx = q('.fx')
    const eyeRule = q('.eye__rule'), eyeT = q('.eye__t'), hl = q('.hl'), head = q('.head')
    const sW = qa('.s--w'), sX = qa('.s--x'), sA = qa('.s--a')
    const forum = q('.forum'), fRule = q('.forum__rule'), fLabel = q('.forum__label')
    const fBlocks = [...qa('.forum__lines > .f'), q('.domains'), q('.verbs'), q('.close')]
    const signoff = q('.signoff')
    cattleSvgs = Array.from(pin.querySelectorAll<SVGElement>('.glyph--cattle'))
    boltSvg = q<SVGElement>('.glyph--bolt')
    flashEl = q('.flash')

    /* initial states (the seam rule: nothing visible before p .06) */
    gsap.set([eyeT, ...sW, ...sX, ...sA, fLabel, ...fBlocks, signoff], { opacity: 0 })
    gsap.set([...sW, ...sX, ...sA], { y: 4 })
    gsap.set(fBlocks, { y: 10 })
    gsap.set(eyeRule, { scaleX: 0, transformOrigin: 'left center' })
    gsap.set(fRule, { scaleX: 0, transformOrigin: 'left center' })
    gsap.set([shadow, frame], { '--go': 0 })
    gsap.set(fx, { opacity: 0 })

    /* head sequence: rule → eyebrow → headline lines (masked, SplitText) */
    tl.to(eyeRule, { scaleX: 1, duration: .04 }, .06)
    tl.to(eyeT, { opacity: 1, duration: .02 }, .08)
    SplitText.create(hl, {
      type: 'lines', mask: 'lines', linesClass: 'line', autoSplit: true,
      onSplit: self => {
        const tw = gsap.fromTo(self.lines, { yPercent: 110 }, { yPercent: 0, duration: .05, stagger: .012, ease: 'none', immediateRender: true })
        tl.add(tw, .10)
        // a re-split (fonts loaded / resize) lands mid-scroll: render the new tween at the current playhead
        tw.render(Math.max(0, Math.min(tw.duration(), tl.time() - .10)), true, true)
        return tw
      },
    })
    hl.classList.add('is-split')

    /* storyteller: lines land whole (4 px rise) and stack; the previous line falls to faint */
    const land = (line: HTMLElement, at: number, prev?: HTMLElement) => {
      tl.to(line, { opacity: 1, y: 0, duration: .025 }, at)
      if (prev) tl.to(prev, { opacity: .55, duration: .02 }, at)
    }
    sW.forEach((l, i) => land(l, .13 + i * .04, sW[i - 1]))

    /* THE SHATTER · p .35–.47: type dissolves in sympathy with the mosaic pass, frieze never returns */
    land(sX[0], .35, sW[5])
    tl.call(() => { const on = tl.time() >= .35 && tl.time() < .47; shadow.classList.toggle('is-go', on); frame.classList.toggle('is-go', on) }, [], .35)
    tl.to([shadow, frame], { '--go': 1, duration: .06 }, .35)
    tl.set(fx, { opacity: 1 }, .35)
    tl.to(fx, { opacity: 0, duration: .05 }, .38)
    tl.to(sW, { opacity: 0, height: 0, marginBottom: 0, duration: .005 }, .41)
    tl.to(shadow, { opacity: 0, duration: .005 }, .41)
    tl.to(frame, { '--go': 0, duration: .06 }, .41)
    tl.call(() => { const on = tl.time() >= .35 && tl.time() < .47; frame.classList.toggle('is-go', on) }, [], .47)
    land(sX[1], .44, sX[0])
    land(sX[2], .48, sX[1])

    /* Forum lands over the settling water: rule → label → lines → chips → verbs → closing → sign-off */
    tl.to(fRule, { scaleX: 1, duration: .04 }, .46)
    tl.to(fLabel, { opacity: 1, duration: .02 }, .50)
    fBlocks.forEach((b, i) => tl.to(b, { opacity: 1, y: 0, duration: .03 }, .53 + i * .04))
    tl.to(signoff, { opacity: 1, duration: .03 }, .77)

    /* exit · .78–.84 */
    tl.to([forum, signoff], { opacity: 0, y: -8, duration: .04 }, .78)
    tl.to(sX, { opacity: 0, height: 0, marginBottom: 0, duration: .02 }, .78)
    tl.to(head, { opacity: 0, y: -8, duration: .04 }, .80)

    /* transition → 03 · Ulysses alone (faint), gone by .90 */
    ;[.80, .82, .84, .86, .87].forEach((at, i) => land(sA[i], at))
    tl.to(sA, { opacity: 0, y: -8, duration: .015 }, .885)
  },

  onProgress(p) {
    if (reduced) return
    /* the frieze walks p 0 → .35 (steps(4) leg cadence lives in the glyph) */
    const w = Math.min(1, p / .35)
    for (let i = 0; i < cattleSvgs.length; i++) walk(cattleSvgs[i], w)
    /* Zeus: flash ×2, bolt, shake — once per upward crossing of .35 */
    if (prevP >= 0 && prevP < .35 && p >= .35) {
      if (boltSvg) strike(boltSvg, true)
      if (prevP >= .30 && flashEl) { flashEl.classList.remove('is-flash'); void flashEl.offsetWidth; flashEl.classList.add('is-flash'); shakeEnd = performance.now() + 400 }
    } else if (prevP >= .34 && p < .34) {
      if (boltSvg) strike(boltSvg, false)
      flashEl?.classList.remove('is-flash')
    } else if (prevP < 0 && p >= .35 && boltSvg) strike(boltSvg, true)
    /* the S fills gold at .92 — idempotent per crossing */
    if (p >= .92 && !glyphSent) { glyphSent = true; document.dispatchEvent(new CustomEvent('mtf:glyph', { detail: { letter: 'S' } })) }
    else if (p < .88 && glyphSent) glyphSent = false
    prevP = p
  },

  onFrame(_shared, ctx) {
    if (reduced) return
    const now = performance.now()
    if (now < shakeEnd) {
      const k = (shakeEnd - now) / 400
      const w = ctx.world
      w.mood.camX = w.target.camX + Math.sin(now * .11) * .04 * k
      w.mood.camY = w.target.camY + Math.cos(now * .17) * .02 * k
    }
  },

  mood: p => reduced ? STILL : ({
    camX: kf(p, K.camX), camY: kf(p, K.camY), camZ: 7, camTilt: kf(p, K.camTilt), camYaw: 0, fov: 34,
    sunY: kf(p, K.sunY), sunGlow: kf(p, K.sunGlow), sunHeat: kf(p, K.sunHeat),
    skyBottom: kfRGB(p, SKY),
    seaAmp: kf(p, K.seaAmp), seaSpeed: kf(p, K.seaSpeed),
    tess: kf(p, K.tess), tessForm: kf(p, K.tessForm), tessSpread: kf(p, K.tessSpread), p3: kf(p, K.p3),
    mosaic: kf(p, K.mosaic), aberration: kf(p, K.aberration),
    stars: kf(p, K.stars), bloom: kf(p, K.bloom), warmth: kf(p, K.warmth),
    veil: 0, p4: 0,
  }),
}
