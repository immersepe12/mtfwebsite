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
 * Beats (p): head .06–.18 · storyteller ×6 .165–.34 · "Zeus answered" .355 (held) · SHATTER .40–.52 · Forum .528–.80 ·
 *            exit .83–.85 · Ulysses alone .816–.93 · S fills .935. Nothing lands inside the Shatter: the lines are read, then the sky answers.
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
const SKY: [number, RGB][] = [[0, EMBER], [.39, EMBER2], [.43, SEA], [.51, ABYSS], [1, ABYSS]]
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
  camX: [[0, 0], [.39, .3], [.51, .4], [1, .6]] as KF,
  camY: [[.39, .6], [.43, .55], [.51, .5]] as KF,
  camTilt: [[.43, .05], [.51, .04]] as KF,
  sunY: [[0, -1.9], [.39, -2], [.43, -2], [.51, -2.2], [1, -2.4]] as KF,
  sunGlow: [[0, .55], [.39, .4], [.43, .2], [.51, 0]] as KF,
  sunHeat: [[.51, 1], [1, 0]] as KF,
  seaAmp: [[0, .14], [.39, .18], [.43, .6], [.51, .45], [1, .2]] as KF,
  seaSpeed: [[0, .35], [.39, .4], [.43, 1.2], [.51, .9], [1, .5]] as KF,
  tess: [[.39, .2], [.43, 1], [.45, 1], [.51, .1], [1, 0]] as KF,
  tessForm: [[.39, 0], [.43, 1]] as KF,
  tessSpread: [[.45, 1], [.51, 5], [1, 8]] as KF,
  p3: [[.45, 0], [.51, 1]] as KF,
  mosaic: [[.39, 0], [.44, 1], [.46, 1], [.51, 0]] as KF,
  aberration: [[.39, 0], [.41, .9], [.43, .9], [.51, .1], [1, 0]] as KF,
  stars: [[0, .35], [.39, .4], [.43, .2], [.51, .3], [1, .55]] as KF,
  bloom: [[.39, .7], [.43, .9], [.51, .6], [1, .5]] as KF,
  warmth: [[0, .55], [.39, .5], [.43, .3], [.51, .25], [1, .2]] as KF,
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
    <div class="col">
      <div class="head">
        <p class="eyebrow eye"><span class="eye__rule" aria-hidden="true"></span><span class="eye__t">${eyebrow}</span></p>
        <h2 class="h1 hl">${esc(HEADLINE)}</h2>
      </div>
      <div class="stack" aria-label="The Storyteller">${story(STORY, 's--w')}${story(SHATTER, 's--x')}${story(ALONE, 's--a')}</div>
    </div>
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
    const col = q('.col'), eyeRule = q('.eye__rule'), eyeT = q('.eye__t'), hl = q('.hl'), head = q('.head')
    const sW = qa('.s--w'), sX = qa('.s--x'), sA = qa('.s--a')
    const forum = q('.forum'), fRule = q('.forum__rule'), fLabel = q('.forum__label')
    const fBlocks = [...qa('.forum__lines > .f'), q('.domains'), q('.verbs'), q('.close')]
    const signoff = q('.signoff')
    cattleSvgs = Array.from(pin.querySelectorAll<SVGElement>('.glyph--cattle'))
    boltSvg = q<SVGElement>('.glyph--bolt')
    flashEl = q('.flash')

    /* initial states — the seam rule: the frame is empty for p < .06 and again from p > .90 */
    gsap.set([eyeT, ...sW, ...sX, ...sA, fLabel, ...fBlocks, signoff], { opacity: 0 })
    gsap.set([...sW, ...sX, ...sA], { y: 4 })
    gsap.set(fBlocks, { y: 10 })
    gsap.set(eyeRule, { scaleX: 0, transformOrigin: 'left center' })
    gsap.set(fRule, { scaleX: 0, transformOrigin: 'left center' })
    gsap.set([shadow, frame], { '--go': 0 })
    gsap.set([col, forum], { '--scrim': 0 })
    gsap.set([shadow, fx], { opacity: 0 })

    /* the frieze rises out of the seam before any type does */
    tl.to(shadow, { opacity: 1, duration: .05 }, .015)

    /* head · rule → eyebrow → headline lines (masked, SplitText). The scrim comes with the rule. */
    tl.to(col, { '--scrim': 1, duration: .07 }, .05)
    tl.to(eyeRule, { scaleX: 1, duration: .04 }, .06)
    tl.to(eyeT, { opacity: 1, duration: .025 }, .10)
    SplitText.create(hl, {
      type: 'lines', mask: 'lines', linesClass: 'line', autoSplit: true,
      onSplit: self => {
        const tw = gsap.fromTo(self.lines, { yPercent: 110 }, { yPercent: 0, duration: .05, stagger: .014, ease: 'none', immediateRender: true })
        tl.add(tw, .13)
        // a re-split (fonts loaded / resize) lands mid-scroll: render the new tween at the current playhead
        tw.render(Math.max(0, Math.min(tw.duration(), tl.time() - .13)), true, true)
        return tw
      },
    })
    hl.classList.add('is-split')

    /* storyteller: lines land whole (4 px rise) and stack; the previous line falls to faint */
    const land = (line: HTMLElement, at: number, prev?: HTMLElement) => {
      tl.to(line, { opacity: 1, y: 0, duration: .025 }, at)
      if (prev) tl.to(prev, { opacity: .55, duration: .02 }, at)
    }
    /* six beats, one every 3% of p; the whole stanza is on screen and read before anything answers it */
    sW.forEach((l, i) => land(l, .165 + i * .03, sW[i - 1]))

    /* Zeus's line lands on the still frame and holds — THEN the sky answers. */
    land(sX[0], .355, sW[5])

    /* THE SHATTER · p .40–.52: type dissolves in sympathy with the mosaic pass, frieze never returns */
    const GO = .40, GO_END = .52
    tl.call(() => { const on = tl.time() >= GO && tl.time() < GO_END; shadow.classList.toggle('is-go', on); frame.classList.toggle('is-go', on) }, [], GO)
    tl.to([shadow, frame], { '--go': 1, duration: .06 }, GO)
    tl.set(fx, { opacity: 1 }, GO)
    tl.to(fx, { opacity: 0, duration: .05 }, GO + .03)
    tl.to(sW, { opacity: 0, height: 0, marginBottom: 0, duration: .005 }, GO + .06)
    tl.to(shadow, { opacity: 0, duration: .005 }, GO + .06)
    tl.to(frame, { '--go': 0, duration: .06 }, GO + .06)
    tl.call(() => { const on = tl.time() >= GO && tl.time() < GO_END; frame.classList.toggle('is-go', on) }, [], GO_END)
    /* the two lines after the wreck land clear of the dissolve, not inside it */
    land(sX[1], .475, sX[0])
    land(sX[2], .512, sX[1])

    /* Forum lands over the settling water: scrim → rule → label → lines → chips → verbs → closing → sign-off.
       ~3.5% of p per block so the right column reads one thought at a time. */
    tl.to(forum, { '--scrim': 1, duration: .07 }, .528)
    tl.to(fRule, { scaleX: 1, duration: .035 }, .535)
    tl.to(fLabel, { opacity: 1, duration: .025 }, .568)
    fBlocks.forEach((b, i) => tl.to(b, { opacity: 1, y: 0, duration: .03 }, .598 + i * .034))
    tl.to(signoff, { opacity: 1, duration: .03 }, .795)

    /* transition → 03 · Ulysses alone (faint) begins as the Forum lets go, in the left column the
       shatter lines have just vacated. The last two lines are one sentence and land as one beat. */
    tl.to(sX, { opacity: 0, y: -8, duration: .016 }, .792)
    tl.set(sX, { height: 0, marginBottom: 0 }, .809)
    land(sA[0], .816)
    tl.to([forum, signoff], { opacity: 0, y: -8, duration: .045 }, .832)
    land(sA[1], .844)
    tl.to(head, { opacity: 0, y: -8, duration: .045 }, .850)
    land(sA[2], .874)
    land(sA[3], .900)
    land(sA[4], .912)
    /* the last line is on screen whole (its landing ends at .937) before the column lets go */
    tl.to(sA, { opacity: 0, y: -8, duration: .012 }, .945)
    tl.to(col, { '--scrim': 0, duration: .012 }, .945)
  },

  onProgress(p) {
    if (reduced) return
    /* the frieze walks p 0 → .40 (steps(4) leg cadence lives in the glyph) */
    const w = Math.min(1, p / .40)
    for (let i = 0; i < cattleSvgs.length; i++) walk(cattleSvgs[i], w)
    /* Zeus: flash ×2, bolt, shake — once per upward crossing of .40 */
    if (prevP >= 0 && prevP < .40 && p >= .40) {
      if (boltSvg) strike(boltSvg, true)
      if (prevP >= .35 && flashEl) { flashEl.classList.remove('is-flash'); void flashEl.offsetWidth; flashEl.classList.add('is-flash'); shakeEnd = performance.now() + 400 }
    } else if (prevP >= .39 && p < .39) {
      if (boltSvg) strike(boltSvg, false)
      flashEl?.classList.remove('is-flash')
    } else if (prevP < 0 && p >= .40 && boltSvg) strike(boltSvg, true)
    /* the S fills gold at .935 — idempotent per crossing */
    if (p >= .935 && !glyphSent) { glyphSent = true; document.dispatchEvent(new CustomEvent('mtf:glyph', { detail: { letter: 'S' } })) }
    else if (p < .90 && glyphSent) glyphSent = false
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
