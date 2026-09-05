import type { Chapter, ChapterCtx } from '../../engine/chapter'
import { createFilm } from '../../engine/film'
import { gsap } from '../../engine/scroll'
import { SplitText } from 'gsap/SplitText'
import { hex, type Mood, type RGB } from '../../engine/mood'
import { counter, setValue, freeze, dissolve } from '../../art/counter'
import './style.css'

/**
 * Chapter 09 — FOREVER · Canto VIII · Net Positive · 04:50 · DESIGN-BIBLE §6.9
 * Rothko's cold field (sky = sea = --sky); Opałka's counter climbs only while you scroll; it freezes on
 * "Life matters because it ends." and dissolves tile-wise; the field warms to gold in three sliding bands;
 * the Forum lands; the N fills and S·U·N reads whole for the first time.
 *
 * Composition (§4.2 placement): ONE left column (.col) holds the head and the storyteller stack in normal
 * flow, so the stack can never land on the headline however the headline wraps; the counter is an emblema
 * centred on the sea band well below the stack; the Forum owns the right column; the two sub-blocks land
 * bottom-left, in the band the counter has vacated. Nothing overlaps at any p.
 */

gsap.registerPlugin(SplitText)

/* ─── mood keyframes (§6.9 table, piecewise-linear) ─── */
type KF = [number, number][]
const kf = (p: number, k: KF): number => {
  if (p <= k[0][0]) return k[0][1]
  for (let i = 1; i < k.length; i++) {
    const p1 = k[i][0]
    if (p <= p1) { const p0 = k[i - 1][0], v0 = k[i - 1][1]; return v0 + (k[i][1] - v0) * ((p - p0) / (p1 - p0)) }
  }
  return k[k.length - 1][1]
}
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
const SKY = hex('#0F5A80'), GOLD = hex('#D9A441'), GOLD_DEEP = hex('#A67C2E'), UMBER = hex('#6E4A1E'), UMBER_DEEP = hex('#3A2A14')
const TAU = Math.PI * 2
/* three sliding Rothko bands: the sea warms first, then the lower sky, then the upper sky; all reach the table's .85 */
const SEA_C: [number, RGB][] = [[.50, SKY], [.72, GOLD_DEEP], [.85, GOLD_DEEP], [1, UMBER]]
const SKY_B: [number, RGB][] = [[.56, SKY], [.80, GOLD], [.85, GOLD], [1, GOLD_DEEP]]
const SKY_T: [number, RGB][] = [[.62, SKY], [.85, UMBER], [1, UMBER_DEEP]]
const K = {
  camZ: [[0, 2], [.5, -1], [.85, -4]] as KF,
  p4: [[.1, 1], [.2, 0]] as KF,
  haze: [[.5, .05], [.85, .15]] as KF,
  seaAmp: [[.5, .06], [.85, .08]] as KF,
  stars: [[.85, 0], [1, .1]] as KF,
  grain: [[.5, .02], [.85, .05], [1, .06]] as KF,
  vignette: [[.5, .2], [.85, .3], [1, .35]] as KF,
  bloom: [[.5, .4], [.85, .6], [1, .5]] as KF,
  warmth: [[.5, .1], [.85, .9], [1, .7]] as KF,
}
/* constants for the whole chapter (monotonic params declared explicitly, §8.1) */
const HOLD: Partial<Mood> = {
  camX: 2, camY: 1.6, camTilt: .04, camYaw: TAU, fov: 34,
  sunVisible: 0, seaSpeed: .25, constellation: 0,
  tess: 0, tessForm: 1, tessSpread: 2, veil: 3, p1: 0, p2: 0, p3: 0, mosaic: 0, aberration: 0,
}
const moodAt = (p: number): Partial<Mood> => ({
  ...HOLD,
  camZ: kf(p, K.camZ), p4: kf(p, K.p4),
  skyTop: kfRGB(p, SKY_T), skyBottom: kfRGB(p, SKY_B), seaColor: kfRGB(p, SEA_C),
  haze: kf(p, K.haze), seaAmp: kf(p, K.seaAmp), stars: kf(p, K.stars),
  grain: kf(p, K.grain), vignette: kf(p, K.vignette), bloom: kf(p, K.bloom), warmth: kf(p, K.warmth),
})
/** Reduced motion: the chapter's end state as a still (§5.3). */
const STILL = moodAt(1)

/* ─── copy (Storyteller lines are bible-final §6.9; Forum copy from content.json theme.pillars[2]) ─── */
const STORY_A = ['She offered Ulysses immortality.', 'No ageing.', 'No sickness.', 'No grave.', 'Forever young.', 'Forever together.']
const STORY_B = ['But Ulysses understood what eternity had hidden from Calypso:', 'Life matters because it ends.', 'If tomorrow were infinite…', 'why would today be sacred?']
const LEAF = 'A leaf falls.'

interface Pillar {
  letter: string; name: string; deckTitle: string; question: string; closingLine: string
  lines: string[]; means: string[]; subSections: { title: string; lines: string[] }[]
}
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const sentence = (s: string) => s.charAt(0) + s.slice(1).toLowerCase()
const isCaps = (s: string) => s === s.toUpperCase()

/* ─── beat table (§5.3 pacing: 18 substantive beats, ~4.3 % of p apart; frame empty p < .06 and p > .90) ─── */
const B = {
  eyeRule: .060, eyeText: .078, head: .105,
  a: [.150, .190, .230, .270, .310, .350],
  b: [.395, .440, .485, .525],
  freeze: .440, dissolve: .480, fxOut: .530,
  fRule: .565, fLabel: .586, fLead: .610, fMeasure: .650, fQ: .668, fMeans: .700, fChips: .716,
  sub: [.745, .783],
  exit: .828, leafIn: .864, leafOut: .884,
} as const

/* ─── chapter state (one instance on the page) ─── */
let reduced = false
let prevP = -1
let glyphSent = false
let counterRoot: HTMLElement | null = null
let digits: HTMLElement[] = []
let counterVal = 0
let counterShown = -1
let leadShown = -1
let frozen = false
/** arrivals added per unit of |Δp| — a full pass to the freeze reaches ≈ 3.7 M. */
const COUNT_RATE = 8_437_000

/** Roll the cached digit strips to n (same semantics as art/counter setValue, no DOM queries per frame). */
function roll(n: number) {
  const s = String(n).padStart(9, '0')
  const lead = 9 - String(n).length
  for (let i = 0; i < 9; i++) digits[i].style.setProperty('--d', s[i])
  if (lead !== leadShown) { leadShown = lead; for (let i = 0; i < 9; i++) digits[i].classList.toggle('is-lead', i < lead) }
}

function frameHTML(n: Pillar): string {
  const eyebrow = `09 — ${esc(n.deckTitle.replace(' | ', ' · '))} — ${esc(n.question)}`
  const story = (lines: string[], cls: string) => lines.map(l => `<p class="s ${cls}${l === STORY_B[1] ? ' s--key' : ''}">${esc(l)}</p>`).join('')
  const chips = n.means.map(m => `<li class="chip">${esc(m)}</li>`).join('')
  const subs = n.subSections.map(s => `
      <div class="sub">
        <span class="sub__rule" aria-hidden="true"></span>
        <p class="label sub__t">${esc(s.title)}</p>
        ${s.lines.map(l => `<p class="${isCaps(l) ? 'sub__caps' : 'sub__line'}">${esc(l)}</p>`).join('')}
      </div>`).join('')
  return `
    <div class="col">
      <div class="head">
        <p class="eyebrow eye"><span class="eye__rule" aria-hidden="true"></span><span class="eye__t">${eyebrow}</span></p>
        <h2 class="h1 hl">${esc(sentence(n.closingLine))}</h2>
      </div>
      <div class="stack" aria-label="The Storyteller">${story(STORY_A, 's--a')}${story(STORY_B, 's--b')}</div>
    </div>
    <div class="forum">
      <span class="forum__rule" aria-hidden="true"></span>
      <p class="label forum__label">${esc(n.letter)} · ${esc(n.name.toUpperCase())}</p>
      <p class="f f--lead">${esc(n.lines[0])}</p>
      <p class="f f--pre">${esc(n.lines[1])}</p>
      <p class="h2 q">${esc(n.lines[2])}</p>
      <p class="f f--pre">${esc(n.lines[3])}</p>
      <ul class="chip-row means" aria-label="Net Positive means">${chips}</ul>
    </div>
    <div class="subs">${subs}</div>
    <p class="s leaf">${esc(LEAF)}</p>`
}

export const forever: Chapter = {
  id: 'forever',
  label: 'Forever',
  inNav: false,

  mount(ctx: ChapterCtx) {
    const { el, shared, content } = ctx
    const pillar = content.theme.pillars[2] as Pillar
    reduced = shared.reduced
    if (reduced) {
      el.classList.add('chapter--static')
      el.innerHTML = `<div class="pin__frame">${frameHTML(pillar)}</div>`
      return
    }
    const mobile = shared.mobile
    const { pin, tl } = createFilm(ctx, { length: mobile ? 2 : 3 })
    pin.innerHTML = `
      <div class="pin__layer plate" aria-hidden="true"><span class="wash wash--l"></span><span class="wash wash--r"></span></div>
      <div class="pin__frame">${frameHTML(pillar)}</div>
      <div class="pin__layer fx"><div class="count">${counter()}</div></div>`

    const q = <T extends Element = HTMLElement>(sel: string) => pin.querySelector(sel) as T
    const qa = (sel: string) => Array.from(pin.querySelectorAll<HTMLElement>(sel))
    const plate = q('.plate'), fx = q('.fx')
    const head = q('.head'), eyeRule = q('.eye__rule'), eyeT = q('.eye__t'), hl = q('.hl')
    const sA = qa('.s--a'), sB = qa('.s--b'), stack = q('.stack')
    const forum = q('.forum'), fRule = q('.forum__rule'), fLabel = q('.forum__label')
    const pres = qa('.f--pre')
    const chips = qa('.means .chip')
    const subs = qa('.sub'), subRules = qa('.sub__rule'), leaf = q('.leaf')
    counterRoot = q('.glyph--counter')
    digits = qa('.glyph--counter .digit')
    counterVal = 0; counterShown = -1; leadShown = -1; frozen = false; prevP = -1
    setValue(counterRoot, 0)

    /* initial states — the seam rule: nothing visible before p .06 */
    gsap.set([eyeT, hl, ...sA, ...sB, fLabel, q('.f--lead'), ...pres, q('.q'), ...chips, ...subs, leaf], { opacity: 0 })
    gsap.set([...sA, ...sB, leaf], { y: 4 })
    gsap.set([q('.f--lead'), ...pres, q('.q'), ...chips, ...subs], { y: 10 })
    gsap.set([eyeRule, fRule, ...subRules], { scaleX: 0, transformOrigin: 'left center' })
    gsap.set([fx, plate], { opacity: 0 })

    /* head: rule → eyebrow → headline lines (masked) · the counter and the legibility plate surface with it */
    tl.to(eyeRule, { scaleX: 1, duration: .035 }, B.eyeRule)
    tl.to(eyeT, { opacity: 1, duration: .02 }, B.eyeText)
    tl.to(fx, { opacity: 1, duration: .05 }, B.eyeRule)
    tl.to(plate, { opacity: 1, duration: .08 }, B.eyeRule)
    SplitText.create(hl, {
      type: 'lines', mask: 'lines', linesClass: 'line', autoSplit: true,
      onSplit: self => {
        const tw = gsap.fromTo(self.lines, { yPercent: 110 }, { yPercent: 0, duration: .05, stagger: .014, ease: 'none', immediateRender: true })
        tl.add(tw, B.head)
        tw.render(Math.max(0, Math.min(tw.duration(), tl.time() - B.head)), true, true)
        return tw
      },
    })
    tl.to(hl, { opacity: 1, duration: .012 }, B.head)
    hl.classList.add('is-split')

    /* storyteller: lines land whole (4 px rise) and stack; the previous line falls back but stays legible on gold */
    const land = (line: HTMLElement, at: number, prev?: HTMLElement) => {
      tl.to(line, { opacity: 1, y: 0, duration: .025 }, at)
      if (prev) tl.to(prev, { opacity: .62, duration: .02 }, at)
    }
    sA.forEach((l, i) => land(l, B.a[i], sA[i - 1]))
    /* the offer collapses, the answer arrives · "Life matters because it ends." stays bright */
    tl.to(sA, { opacity: 0, height: 0, marginBottom: 0, duration: .012 }, B.b[0] - .012)
    land(sB[0], B.b[0])
    land(sB[1], B.b[1], sB[0])
    land(sB[2], B.b[2])
    land(sB[3], B.b[3], sB[2])
    tl.to(fx, { opacity: 0, duration: .035 }, B.fxOut)   // the dissolve (600 ms) has finished by here

    /* mobile: the left column makes room before the one-column Forum lands (§6.9 Mobile) */
    if (mobile) tl.to(q('.col'), { opacity: 0, y: -8, duration: .03 }, B.fxOut + .01)

    /* the Forum lands over the warming field: rule → label → lead → measure + question → means + chips */
    tl.to(fRule, { scaleX: 1, duration: .035 }, B.fRule)
    tl.to(fLabel, { opacity: 1, duration: .02 }, B.fLabel)
    tl.to(q('.f--lead'), { opacity: 1, y: 0, duration: .03 }, B.fLead)
    tl.to(pres[0], { opacity: 1, y: 0, duration: .022 }, B.fMeasure)
    tl.to(q('.q'), { opacity: 1, y: 0, duration: .035 }, B.fQ)
    tl.to(pres[1], { opacity: 1, y: 0, duration: .022 }, B.fMeans)
    tl.to(chips, { opacity: 1, y: 0, duration: .02, stagger: .0035 }, B.fChips)

    /* the two sub-blocks land in the band the counter has vacated: rule → label → lines */
    subs.forEach((s, i) => {
      tl.to(subRules[i], { scaleX: 1, duration: .028 }, B.sub[i] - .008)
      tl.to(s, { opacity: 1, y: 0, duration: .03 }, B.sub[i])
    })

    /* exit · .835–.87 · then only the transition line, gone by .90 (§5.3 seam rule) */
    const exiting = mobile ? [forum, ...subs] : [head, stack, forum, ...subs]
    tl.to(exiting, { opacity: 0, y: -8, duration: .032 }, B.exit)
    tl.to([eyeRule, fRule, ...subRules], { opacity: 0, duration: .028 }, B.exit)
    tl.to(plate, { opacity: 0, duration: .045 }, B.exit)
    tl.to(leaf, { opacity: 1, y: 0, duration: .016 }, B.leafIn)
    tl.to(leaf, { opacity: 0, y: -8, duration: .014 }, B.leafOut)
  },

  onProgress(p) {
    if (reduced) return
    const root = counterRoot
    if (root) {
      /* Opałka: the count climbs only while you move — it never runs on its own, and it never runs back.
         A direct jump (?p=) seeds it so a still is a number, not nine zeros. */
      if (!frozen && p < B.freeze) {
        counterVal = prevP < 0 ? p * COUNT_RATE : Math.min(999_999_999, counterVal + Math.abs(p - prevP) * COUNT_RATE)
        const n = Math.floor(counterVal)
        if (n !== counterShown) { counterShown = n; roll(n) }
      }
      /* freeze on "Life matters because it ends." · dissolve tile-wise · both reversible */
      if (p >= B.freeze && !frozen) { frozen = true; freeze(root) }
      else if (p < B.freeze - .02 && frozen) { frozen = false; root.classList.remove('is-frozen') }
      if (prevP < B.dissolve && p >= B.dissolve) dissolve(root)
      else if (prevP >= B.dissolve && p < B.dissolve - .02) { root.classList.remove('tess-out'); root.style.setProperty('--go', '0'); if (!frozen) root.classList.remove('is-frozen') }
    }
    /* the N fills gold at .88 — S · U · N complete; the rail shines all three (idempotent per crossing) */
    if (p >= .88 && !glyphSent) { glyphSent = true; document.dispatchEvent(new CustomEvent('mtf:glyph', { detail: { letter: 'N' } })) }
    else if (p < .84 && glyphSent) glyphSent = false
    prevP = p
  },

  mood: p => (reduced ? STILL : moodAt(p)),
}
