import type { Chapter, ChapterCtx, Shared } from '../../engine/chapter'
import { createFilm } from '../../engine/film'
import { gsap } from '../../engine/scroll'
import { SplitText } from 'gsap/SplitText'
import { hex, type Mood, type RGB } from '../../engine/mood'
import { olive, leaf, flip } from '../../art/olive'
import { clamp } from '../../engine/utils'
import './style.css'

/**
 * Chapter 10 — WHAT REMAINS · Canto IX · People · 05:20 · DESIGN-BIBLE §6.10
 * Penone's olive branch across the top-left third; the leaves turn silver in the wind of the pointer
 * (scroll velocity on touch); two leaves fall along offset-paths and land exactly where the → rows begin;
 * the four programme columns draw themselves rule → label → list in the lower half; at the end the
 * branch goes to cream thread and three of Ch 11's net lines are drawn in the frame — "Then came the net."
 *
 * Beats (p): branch visible from 0 · leaf A falls .03–.30 · head .06–.14 · storyteller ×7 .14–.28 ·
 *            columns .32/.42/.52/.62 (+.08 each) · leaf B falls .36–.64 · exit .85–.90 ·
 *            thread .80–.88 · net lines .88–1 · "Then came the net." .89–.99
 */

gsap.registerPlugin(SplitText)

/* ─── mood keyframes (§6.10 table, piecewise-linear; a designed .8 anchor holds the navy so the night deepens last) ─── */
type KF = [number, number][]
const kf = (p: number, k: KF): number => {
  if (p <= k[0][0]) return k[0][1]
  for (let i = 1; i < k.length; i++) {
    if (p <= k[i][0]) { const p0 = k[i - 1][0], v0 = k[i - 1][1]; return v0 + (k[i][1] - v0) * ((p - p0) / (k[i][0] - p0)) }
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
const TAU = Math.PI * 2
const UMBER_DEEP = hex('#3A2A14'), GOLD_DEEP = hex('#A67C2E'), UMBER = hex('#6E4A1E')
const PRESS = hex('#090D16'), SEA = hex('#0E3D57'), SEA_DEEP = hex('#123044'), SEA_NIGHT = hex('#0B2A3D')
const K = {
  camX: [[0, 2], [.3, 1.6], [1, 1]] as KF,
  camY: [[0, 1.6], [.3, 1.9], [1, 2.4]] as KF,
  camZ: [[0, -4], [.3, -6], [1, -8]] as KF,
  camTilt: [[0, .04], [.3, .03], [1, .02]] as KF,
  haze: [[0, .15], [.3, .2], [1, .2]] as KF,
  seaAmp: [[0, .08], [.3, .1], [1, .08]] as KF,
  stars: [[0, .1], [.3, .3], [1, .2]] as KF,
  warmth: [[0, .7], [.3, .3], [.8, .28], [1, .25]] as KF,
}
const SKY_T: [number, RGB][] = [[0, UMBER_DEEP], [.3, PRESS]]
const SKY_B: [number, RGB][] = [[0, GOLD_DEEP], [.3, SEA], [.8, SEA], [.95, SEA_DEEP]]
const SEA_C: [number, RGB][] = [[0, UMBER], [.3, SEA], [.8, SEA], [.95, SEA_NIGHT]]
/* constants for the whole chapter — the monotonic params declared explicitly (§8.1) */
const HOLD: Partial<Mood> = {
  camYaw: TAU, fov: 34, sunVisible: 0, seaSpeed: .25, constellation: 0,
  tess: 0, tessForm: 1, tessSpread: 2, veil: 3, p1: 0, p2: 0, p3: 0, p4: 0,
  grain: .06, bloom: .5, vignette: .35, mosaic: 0, aberration: 0,
}
const moodAt = (p: number): Partial<Mood> => ({
  ...HOLD,
  camX: kf(p, K.camX), camY: kf(p, K.camY), camZ: kf(p, K.camZ), camTilt: kf(p, K.camTilt),
  skyTop: kfRGB(p, SKY_T), skyBottom: kfRGB(p, SKY_B), seaColor: kfRGB(p, SEA_C),
  haze: kf(p, K.haze), seaAmp: kf(p, K.seaAmp), stars: kf(p, K.stars), warmth: kf(p, K.warmth),
})
const STILL = moodAt(1)

/* ─── copy (Storyteller lines and the compressed headline are bible-final §6.10; Forum copy from content.json) ─── */
const HEADLINE = 'Perhaps immortality is what remains because we lived.'   // gala.keyLines — compressed as in the spine
const STORY = ['Perhaps immortality was never about refusing to die.', 'A child.', 'A kindness.', 'A courage.', 'A love.', 'A story.', 'Did we help someone stand?']
const NET_LINE = 'Then came the net.'
const DAYS_NOTE = 'Days to be confirmed.'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
const day = (iso: string) => String(+iso.slice(8, 10))
const month = (iso: string) => MONTHS[+iso.slice(5, 7) - 1]
const dateRange = (a: string, b?: string) => (b && b !== a ? `${day(a)}–${day(b)} ${month(a)}` : `${day(a)} ${month(a)}`)

interface Col { id: string; title: string; date: string; note?: string; blocks: string[]; link: { text: string; href: string; ext?: boolean } }

function columns(c: any): Col[] {
  const s = c.skillsCareersBusiness, k = c.knowledgeForum
  const mail: string = (c.contact.emails as { id: string; address: string }[]).find(e => e.id === 'forum')?.address ?? 'forum@medtourismfoundation.com'
  const mailto = (subject: string) => `mailto:${mail}?subject=${encodeURIComponent(subject)}`
  const chips = (arr: string[], label: string) => `<ul class="chip-row" aria-label="${esc(label)}">${arr.map(x => `<li class="chip">${esc(x)}</li>`).join('')}</ul>`
  const chain = (steps: string[]) => `<p class="chain">${esc(steps[0])}${steps.slice(1).map(x => ` <span class="st"><span class="arr" aria-hidden="true">→</span><span class="sr-only">then</span> ${esc(x)}</span>`).join('')}</p>`
  const lead = (t: string, mono = false) => `<p class="${mono ? 'col__mono' : 'small'}">${esc(t)}</p>`
  const d26 = dateRange(s.date)
  const kDays = k.days.value as string[]
  return [
    { id: 'competitions', title: s.competitions.deckTitle, date: d26,
      blocks: [lead(s.competitions.lead, true), chips(s.competitions.categories, 'Competition categories')],
      link: { text: 'ENTER THE COMPETITIONS', href: mailto('Hospitality Skills Competitions — MTF11') } },
    { id: 'careers', title: String(s.careers.title).toUpperCase(), date: d26,
      blocks: [lead(s.careers.lead), chips(s.careers.fields, 'Career fields')],
      link: { text: 'CAREERS PROGRAMME', href: mailto('Hospitality Careers Programme — MTF11') } },
    { id: 'b2b', title: s.b2b.deckTitle, date: `25–26 ${month(s.date)}`,   // bible-final §6.10: B2B runs 25–26
      blocks: [lead(s.b2b.lead), chips(s.b2b.connecting, 'Who the B2B meetings connect'), chain(s.b2b.chainSteps)],
      link: { text: 'REQUEST B2B MEETINGS', href: mailto('B2B Business Meetings — MTF11') } },
    { id: 'knowledge', title: k.deckTitle, date: dateRange(kDays[0], kDays[kDays.length - 1]), note: DAYS_NOTE,
      blocks: [`<p class="small col__line">${esc(k.lines[0])}</p>`, lead(k.bringingTogetherLead), chips(k.bringingTogether, 'Who the Forum brings together'),
        chain(k.chainSteps), chips(k.themes, 'Forum themes'), `<p class="col__caps">${esc(k.closingLine)}</p>`],
      link: { text: 'SUBMIT RESEARCH', href: k.precedent2025.url, ext: true } },
  ]
}

function colHTML(col: Col, i: number): string {
  const ext = col.link.ext ? ' target="_blank" rel="noopener"' : ''
  return `
    <li class="col card card--frame" data-col="${col.id}">
      <span class="card__rule card__rule--t" aria-hidden="true"></span><span class="card__rule card__rule--l" aria-hidden="true"></span>
      <span class="card__rule card__rule--b" aria-hidden="true"></span><span class="card__rule card__rule--r" aria-hidden="true"></span>
      <span class="card__corner card__corner--tl" aria-hidden="true"></span><span class="card__corner card__corner--tr" aria-hidden="true"></span>
      <span class="card__corner card__corner--bl" aria-hidden="true"></span><span class="card__corner card__corner--br" aria-hidden="true"></span>
      <h3 class="label col__t"><span class="index col__n">0${i + 1}</span>${esc(col.title)}<span class="col__d">— ${esc(col.date)}</span></h3>
      <div class="col__body">
        ${col.note ? `<p class="fine col__note">${esc(col.note)}</p>` : ''}
        ${col.blocks.join('')}
        <a class="link link--mono col__link" href="${col.link.href}"${ext}>${esc(col.link.text)} <span class="btn__arrow" aria-hidden="true">→</span></a>
      </div>
    </li>`
}

function frameHTML(c: any): string {
  const ev = c.event.dates
  const eyebrow = `10 — PEOPLE · SKILLS · IDEAS · BUSINESS — ${dateRange(ev.start, ev.end)}`
  return `
    <div class="head">
      <p class="eyebrow eye"><span class="eye__rule" aria-hidden="true"></span><span class="eye__t">${eyebrow}</span></p>
      <h2 class="h1 hl">${esc(HEADLINE)}</h2>
    </div>
    <div class="stack" aria-label="The Storyteller">${STORY.map(l => `<p class="s">${esc(l)}</p>`).join('')}</div>
    <ul class="cols" aria-label="The people programme">${columns(c).map(colHTML).join('')}</ul>
    <p class="s net-line">${esc(NET_LINE)}</p>`
}
const branchHTML = () => `<div class="branch-wrap">${olive()}</div>`
const leafHTML = (cls: string) => `<svg class="fall ${cls}" viewBox="0 0 70 18" width="70" height="18" aria-hidden="true"><g style="fill:var(--olive)">${leaf()}</g></svg>`

/* ─── chapter state (one instance on the page) ─── */
let reduced = false
let curP = 0
let branchSvg: SVGElement | null = null
let lastDrive = 99
let lastQ: number[] = []
const BASE = Array.from({ length: 13 }, (_, i) => (i % 2 ? 18 : -18) + Math.sin(i * 1.7) * 14)

export const remains: Chapter = {
  id: 'remains',
  label: 'What Remains',
  inNav: false,

  mount(ctx: ChapterCtx) {
    const { el, shared, content } = ctx
    reduced = shared.reduced
    if (reduced) {
      el.classList.add('chapter--static')
      el.innerHTML = `<div class="pin__frame">${branchHTML()}${frameHTML(content)}</div>`
      return
    }
    const mobile = shared.mobile
    const { pin, tl } = createFilm(ctx, { length: mobile ? 2.5 : 4 })
    pin.innerHTML = `
      <div class="pin__layer shadow">${branchHTML()}${leafHTML('fall--a')}${leafHTML('fall--b')}<svg class="lying" viewBox="0 0 70 18" width="70" height="18" aria-hidden="true"><g fill="currentColor">${leaf()}</g></svg></div>
      <div class="pin__frame">${frameHTML(content)}</div>
      <div class="pin__layer fx"><svg class="net3" aria-hidden="true" width="100%" height="100%" fill="none" stroke-width=".75" style="stroke:var(--cream);stroke-opacity:.55">
        <line class="t t0" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/><line class="t t1" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/><line class="t t2" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
        <circle class="knot" r="1.5" opacity="0" style="fill:var(--cream);stroke:none"/></svg></div>`

    const q = <T extends Element = HTMLElement>(sel: string) => pin.querySelector(sel) as T
    const qa = (sel: string) => Array.from(pin.querySelectorAll<HTMLElement>(sel))
    const shadow = q('.shadow'), fallA = q('.fall--a'), fallB = q('.fall--b'), lying = q('.lying')
    const head = q('.head'), eyeRule = q('.eye__rule'), eyeT = q('.eye__t'), hl = q('.hl')
    const lines = qa('.stack .s'), stack = q('.stack')
    const cols = qa('.col'), netLine = q('.net-line'), net3 = q<SVGSVGElement>('.net3')
    branchSvg = q<SVGElement>('.glyph--olive')
    lastDrive = 99; lastQ = []
    const leafA = branchSvg.querySelector<SVGGElement>('.leaf[data-i="7"]')
    const leafB = branchSvg.querySelector<SVGGElement>('.leaf[data-i="10"]')

    /* initial states — the seam rule: nothing in the frame before p .06 */
    gsap.set([eyeT, ...lines, netLine], { opacity: 0 })
    gsap.set([...lines, netLine], { y: 4 })
    gsap.set(eyeRule, { scaleX: 0, transformOrigin: 'left center' })
    gsap.set([fallB, lying], { opacity: 0 })
    cols.forEach(col => {
      gsap.set(col.querySelectorAll('.card__rule--t, .card__rule--b'), { scaleX: 0 })
      gsap.set(col.querySelectorAll('.card__rule--l, .card__rule--r'), { scaleY: 0 })
      gsap.set(col.querySelectorAll('.card__corner, .col__t'), { opacity: 0 })
      gsap.set(col.querySelector('.col__body'), { opacity: 0, y: 10 })
    })

    /* the branch is visible from p 0 (it slid up under Ch 09's last line); the fallen leaf lies on the water */
    tl.to(lying, { opacity: .7, duration: .06 }, .06)

    /* fall paths: from leaf #7 / #10 on the branch to where the two → rows begin (measured, remeasured on resize) */
    const chainA = q('[data-col="b2b"] .chain'), chainB = q('[data-col="knowledge"] .chain')
    const layPaths = () => {
      const pr = pin.getBoundingClientRect()
      const path = (from: Element | null, to: Element, out: HTMLElement) => {
        if (!from) return
        const a = from.getBoundingClientRect(), b = to.getBoundingClientRect()
        const body = to.closest('.col__body') as HTMLElement | null
        const dy0 = body ? Number(gsap.getProperty(body, 'y')) || 0 : 0
        const sx = a.left + a.width / 2 - pr.left, sy = a.top + a.height / 2 - pr.top
        const ex = b.left - pr.left - 6, ey = b.top + b.height / 2 - pr.top - dy0
        const dx = ex - sx, dyy = ey - sy
        out.style.offsetPath = `path("M${sx.toFixed(1)},${sy.toFixed(1)} C${(sx + dx * .2 + 90).toFixed(1)},${(sy + dyy * .3).toFixed(1)} ${(sx + dx * .45 - 110).toFixed(1)},${(sy + dyy * .55).toFixed(1)} ${(sx + dx * .68).toFixed(1)},${(sy + dyy * .72).toFixed(1)} S${(ex - 70).toFixed(1)},${(ey - dyy * .1).toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}")`
      }
      path(leafA, chainA, fallA); path(leafB, chainB, fallB)
    }
    gsap.set([fallA, fallB], { offsetDistance: '0%' })
    layPaths()
    document.fonts?.ready.then(layPaths)

    /* three of Ch 11's net lines (same ±45° families, same 44 px pitch, same phase) — drawn in the fx layer at the end */
    const netLines = Array.from(net3.querySelectorAll<SVGLineElement>('.t')), knot = net3.querySelector('.knot') as SVGCircleElement
    const layNet = () => {
      const w = pin.clientWidth, h = pin.clientHeight, sp = mobile ? 60 : 44, step = sp * Math.SQRT2
      const offA = (h / 2 - w / 2) % step, offB = (h / 2 + w / 2) % step
      const cA0 = offA + Math.round((h / 2 - w / 2 - offA) / step) * step, cB0 = offB + Math.round((h / 2 + w / 2 - offB) / step) * step
      const seg = (m: 1 | -1, c: number): [number, number, number, number] => {
        const pts: [number, number][] = []
        const push = (x: number, y: number) => { if (x >= -.01 && x <= w + .01 && y >= -.01 && y <= h + .01) pts.push([x, y]) }
        push(0, c); push(w, m * w + c); push(-c / m, 0); push((h - c) / m, h)
        pts.sort((a, b) => a[0] - b[0])
        const a = pts[0], b = pts[pts.length - 1]
        return [a[0], a[1], b[0], b[1]]
      }
      const L = [seg(1, cA0), seg(-1, cB0), seg(1, cA0 + step)]
      const kx = (cB0 - cA0) / 2, ky = (cA0 + cB0) / 2
      net3.setAttribute('viewBox', `0 0 ${w} ${h}`)
      /* the elements are created once (the tweens hold them); resize only moves them */
      netLines.forEach((ln, i) => { const s = L[i]; ln.setAttribute('x1', s[0].toFixed(1)); ln.setAttribute('y1', s[1].toFixed(1)); ln.setAttribute('x2', s[2].toFixed(1)); ln.setAttribute('y2', s[3].toFixed(1)) })
      knot.setAttribute('cx', kx.toFixed(1)); knot.setAttribute('cy', ky.toFixed(1))
    }
    layNet()
    let raf = 0
    window.addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { layNet(); layPaths() }) }, { passive: true })

    /* head: rule → eyebrow → headline lines (masked) */
    tl.to(eyeRule, { scaleX: 1, duration: .04 }, .06)
    tl.to(eyeT, { opacity: 1, duration: .02 }, .08)
    SplitText.create(hl, {
      type: 'lines', mask: 'lines', linesClass: 'line', autoSplit: true,
      onSplit: self => {
        const tw = gsap.fromTo(self.lines, { yPercent: 110 }, { yPercent: 0, duration: .05, stagger: .012, ease: 'none', immediateRender: true })
        tl.add(tw, .10)
        tw.render(Math.max(0, Math.min(tw.duration(), tl.time() - .10)), true, true)
        return tw
      },
    })
    hl.classList.add('is-split')

    /* storyteller: seven lines land whole (4 px rise) and stack; older lines fall to faint; max six visible */
    lines.forEach((l, i) => {
      const at = .14 + i * .022
      tl.to(l, { opacity: 1, y: 0, duration: .02 }, at)
      if (i > 0) tl.to(lines[i - 1], { opacity: .55, duration: .02 }, at)
      if (i === 6) tl.to(lines[0], { opacity: 0, height: 0, marginBottom: 0, duration: .02 }, at)
    })
    if (mobile) tl.to(stack, { opacity: 0, y: -8, duration: .03 }, .30)   // the lower slot needs the room on portrait

    /* leaf A detaches at once and drifts down to the B2B → row; leaf B follows to the Knowledge → row */
    if (leafA) tl.to(leafA, { opacity: 0, duration: .01 }, .03)
    tl.to(fallA, { offsetDistance: '100%', duration: .27 }, .03)
    if (leafB) tl.to(leafB, { opacity: 0, duration: .01 }, .36)
    tl.to(fallB, { opacity: 1, duration: .01 }, .36)
    tl.to(fallB, { offsetDistance: '100%', duration: .28 }, .36)

    /* the four columns: corner marks → rules draw outward → label → the list settles · 8% of p each */
    const colAt = (i: number) => (mobile ? .32 + i * .13 : .32 + i * .10)
    cols.forEach((col, i) => {
      const at = colAt(i)
      const rT = col.querySelector('.card__rule--t'), rB = col.querySelector('.card__rule--b'), rL = col.querySelector('.card__rule--l'), rR = col.querySelector('.card__rule--r')
      tl.to(col.querySelectorAll('.card__corner'), { opacity: 1, duration: .01 }, at)
      tl.to([rT, rL], { scaleX: 1, scaleY: 1, duration: .04 }, at + .005)
      tl.to([rB, rR], { scaleX: 1, scaleY: 1, duration: .04 }, at + .015)
      tl.to(col.querySelector('.col__t'), { opacity: 1, duration: .02 }, at + .04)
      tl.to(col.querySelector('.col__body'), { opacity: 1, y: 0, duration: .03 }, at + .05)
      if (mobile && i < 3) tl.to(col, { opacity: 0, y: -8, duration: .03 }, colAt(i + 1) - .035)   // portrait: one column at a time
    })
    /* the fallen leaves become the arrows: each fades as its → row lands */
    tl.to(fallA, { opacity: 0, duration: .02 }, colAt(2) + .06)
    tl.to(fallB, { opacity: 0, duration: .02 }, colAt(3) + .06)

    /* exit · .85–.90 */
    tl.to(cols, { opacity: 0, y: -8, duration: .04 }, .845)
    tl.to([head, stack, lying], { opacity: 0, y: -8, duration: .04 }, .855)

    /* the branch's silver goes to thread: leaves thin to lines, olive → cream · .80–.88 */
    tl.to(shadow, { '--thread': 1, duration: .08 }, .80)
    /* the net is being woven in the frame: a line, a knot, another line · .88–1 */
    tl.fromTo(netLines[0], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .05 }, .88)
    tl.fromTo(netLines[1], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .05 }, .91)
    tl.to(knot, { opacity: .7, duration: .015 }, .935)
    tl.fromTo(netLines[2], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .05 }, .95)
    tl.to(netLine, { opacity: 1, y: 0, duration: .025 }, .89)
    tl.to(netLine, { opacity: 0, y: -8, duration: .025 }, .965)

    /* tessera glint on the framed columns: one delegated listener sets --mx/--my (§7.11) */
    q('.cols').addEventListener('pointermove', e => {
      const card = (e.target as HTMLElement).closest('.col') as HTMLElement | null
      if (!card) return
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`)
      card.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`)
    }, { passive: true })
  },

  onProgress(p) { curP = p },

  onFrame(shared: Shared) {
    if (reduced || !branchSvg || curP > .8) return
    /* olive leaves turning silver: the pointer is the wind (scroll velocity on touch); quantised so flip() runs only on change */
    const drive = shared.touch ? clamp(shared.velocity / 40, -1, 1) : shared.mouse.x
    if (Math.abs(drive - lastDrive) < .02) return
    lastDrive = drive
    for (let i = 0; i < 13; i++) {
      const qd = Math.round((BASE[i] + drive * 120) / 12) * 12
      if (qd !== lastQ[i]) { lastQ[i] = qd; flip(branchSvg, i, qd) }
    }
  },

  mood: p => (reduced ? STILL : moodAt(p)),
}
