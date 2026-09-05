import type { Chapter, ChapterCtx, Shared } from '../../engine/chapter'
import { createFilm } from '../../engine/film'
import { hex, type Mood, type RGB } from '../../engine/mood'
import { net, tighten, cut } from '../../art/net'
import { galaTitle, draw } from '../../art/gala-title'
import './style.css'

/**
 * Chapter 11 — THE OPEN HAND · Canto X · The Gala · Awards · 05:55 · DESIGN-BIBLE §6.11
 * The net tightens, is cut, and the tessera field opens from the fist into the open hand — the only full
 * mosaic figure in the site. STRICT TWO-ZONE POSTER: every word of type lives in the left column / sign-off
 * slot (x 7 % → ~37 %); the mosaic hand is the emblema in the right two thirds. The ONLY thing that sits on
 * the figure is the invitation pill in the palm — the bible's one deliberate emblema, on its own scrim.
 * The drawn CALYPSO'S ODYSSEY lettering was moved OFF the palm into the column's headline slot (§4.2:
 * headline block left 7 %, top 18–24 %): on the palm it printed cream serif over gold tesserae and over the
 * fingers, which is exactly the "type on the picture" fault the client called out.
 *
 * Beats are spaced for the lead's pacing table (4.5 vh × 1.55 ≈ 6,300 px): substantive beats sit ≈ .024 of p
 * apart (≈ 150 px of scroll); the stack, the couplet and the closing lines are ONE accumulating gesture each
 * and step tighter. The seam rule holds: the frame is empty for p < .06 and everything has exited by p .90;
 * p .884–1 is the deliberate cut to black, world only.
 */

/* ─── keyframe helpers (piecewise-linear between the §6.11 anchors) ─── */
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
const PRESS = hex('#090D16'), BLACK = hex('#000000'), INK_SEA = hex('#0B1A2A'), NIGHT = hex('#123044')
const SEA_10 = hex('#0B2A3D'), SEA_GLASS = hex('#0A1622')

/** The palm centre in world units — the tesserae layer's own anchor when it exposes one, else the bible's §6.11 value. */
let PALM: [number, number, number] = [0.8, 0.4, -8]
let mobileMood = false
let reducedMood = false

const K = {
  // camX .05 (not the bible's .8) parks the hand clear of the type column: the camera sits LEFT of the palm,
  // so the figure reads in the right two thirds and the column 7–37 % never meets a tile.
  camX: [[.3, 1], [.42, .25], [.56, .05]] as KF,
  camXm: [[.3, 1], [.42, .8]] as KF,
  // the framing SETTLES by .56 (when the assembly completes) and then holds: from there the hand is a fixed,
  // fully-in-frame emblema — air above the fingertips, its base clear of the bottom edge.
  camY: [[.3, 2.4], [.42, 2.05], [.56, 1.52]] as KF,
  // mobile: the camera stays high and pulls further back so the hand lives in the LOWER band and the
  // column above it is never crossed
  camYm: [[.3, 2.4], [.72, 3.2]] as KF,
  camZ: [[.3, -8], [.42, -5.4], [.56, -3.4]] as KF,
  camZm: [[.3, -8], [.42, -2], [.72, 4.4]] as KF,
  camTilt: [[.3, .02], [.42, 0]] as KF,
  fov: [[0, 34], [.3, 30], [.42, 32], [.56, 34]] as KF,
  // the star arrives at the palm centre only after the pill has left it
  sunGlow: [[.862, 0], [.905, 1.6]] as KF,
  sunVisible: [[.862, 0], [.9, 1]] as KF,
  seaOpacity: [[0, 1], [.3, .8], [.42, .6], [.72, .5], [.88, .5], [1, 0]] as KF,
  seaAmp: [[0, .08], [.3, .05], [.42, .04], [.88, .04], [1, 0]] as KF,
  stars: [[0, .2], [.3, .1], [.88, .1], [1, 0]] as KF,
  // the assembly starts with the cut and is COMPLETE by p .52, so the QA still at .5 is a formed hand rather
  // than a cloud of confetti; holds 1 through p 1 — Ch 12 owns the dissolve
  tess: [[.30, 0], [.52, 1]] as KF,
  tessForm: [[.34, 2], [.56, 3]] as KF,
  // the layer's scatter shell is far (r 14–20 × spread), so the spread must close early or the forming hand is
  // still tiny specks — 4 → 1.3 by .44 puts the tiles on stage while they are still travelling
  tessSpread: [[.28, 4], [.33, 2.2], [.44, 1.3], [.52, 1]] as KF,
  tessGold: [[.34, .8], [.72, .9]] as KF,
  tessGlint: [[.34, .5], [.56, .8], [.70, 1.4], [.86, 1], [1, .6]] as KF,
  bloom: [[.3, .5], [.42, .6], [.72, .8], [.88, .9], [1, .7]] as KF,
  warmth: [[0, .25], [.3, .2], [.42, .2], [.72, .35], [.88, .35], [1, .1]] as KF,
  vignette: [[0, .35], [.3, .4], [.88, .4], [1, .6]] as KF,
}
const SKY_T: [number, RGB][] = [[.88, PRESS], [1, BLACK]]
const SKY_B: [number, RGB][] = [[0, NIGHT], [.3, PRESS], [.42, PRESS], [.72, INK_SEA], [.88, INK_SEA], [1, BLACK]]
const SEA_C: [number, RGB][] = [[0, SEA_10], [.3, SEA_GLASS], [.88, SEA_GLASS], [1, BLACK]]

const moodAt = (p: number): Partial<Mood> => ({
  camX: kf(p, mobileMood ? K.camXm : K.camX), camY: kf(p, mobileMood ? K.camYm : K.camY), camZ: kf(p, mobileMood ? K.camZm : K.camZ),
  camTilt: kf(p, K.camTilt), camYaw: Math.PI * 2, fov: kf(p, K.fov),
  skyTop: kfRGB(p, SKY_T), skyBottom: kfRGB(p, SKY_B), haze: .2,
  sunX: PALM[0], sunY: PALM[1], sunZ: PALM[2], sunRadius: .16, sunGlow: kf(p, K.sunGlow), sunHeat: 0, sunVisible: kf(p, K.sunVisible),
  seaY: -1.2, seaAmp: kf(p, K.seaAmp), seaSpeed: .3, seaOpacity: kf(p, K.seaOpacity), seaColor: kfRGB(p, SEA_C),
  stars: kf(p, K.stars), starDrift: .1, constellation: 0,
  tess: kf(p, K.tess), tessForm: kf(p, K.tessForm), tessSpread: kf(p, K.tessSpread), tessGlint: kf(p, K.tessGlint), tessGold: kf(p, K.tessGold),
  veil: 3, p1: 0, p2: 0, p3: 0, p4: 0,
  bloom: kf(p, K.bloom), grain: .06, vignette: kf(p, K.vignette), mosaic: 0, aberration: 0,
  warmth: kf(p, K.warmth),
})

/* ─── copy (Storyteller lines are bible-final §6.11; facts from content.json gala.* / awards.* / contact.*) ─── */
const STACK = [
  'For seven years Calypso had tried to keep what she loved.',
  'Make paradise beautiful enough.', 'Stop time.', 'Offer forever.', 'Hold tighter.',
  'But holding tighter does not stop departure.', 'Sometimes… it turns love into a chain.',
]
const CUT_LINE = 'Calypso cuts the net.'
const F1 = 'One Storyteller. No dialogue. Nine songs. One night.'
const F2 = 'A Mediterranean production of aerial constellations, ribbons, sea and fire — the story of the star that became Calypso, the island that became Gozo, and the hand that learned to open.'
const AWARDS_S = 'And yet… three thousand years later… you know his name.'
const AWARDS_F = 'The Mediterranean Tourism Awards recognise the people, places and projects whose work will still be known when the season is over.'
const AWARDS_FINE = 'Categories and venue to be announced.'
const CLOSING = ['Everything disappears.', 'No acrobats.', 'No projections.', 'No music.', 'Only the Storyteller.']
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const dayMonth = (iso: string) => { const [, m, d] = iso.split('-'); return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1]}` }

function frameHTML(c: any, film: boolean): string {
  const g = c.gala, a = c.awards
  const email: string = c.contact?.emails?.[0]?.address ?? 'forum@medtourismfoundation.com'
  const galaDate = dayMonth(String(g.date)), year = String(g.date).slice(0, 4)
  const city = String(c.event?.city?.value ?? 'Malta').toUpperCase()
  const eyebrow = `11 — ${galaDate} · ${esc(String(g.titleCaps))} · THE GALA`
  const subtitle = esc(String(g.subtitle))
  const cantos = (g.chapters as { title: string }[]).map((ch, i) =>
    `<li class="canto"><span class="canto__i">${String(i + 1).padStart(2, '0')}</span><span class="canto__t">${esc(String(ch.title).toUpperCase())}</span></li>`).join('')
  const closing = CLOSING.map(l => `<p class="s c">${esc(l)}</p>`).join('')
  const stack = STACK.map(l => `<p class="s st">${esc(l)}</p>`).join('')
  const couplet = (g.keyLines as { sentenceCase?: string }[]).slice(0, 2).map(k => `<p class="s h2 cp">${esc(String(k.sentenceCase ?? ''))}</p>`).join('')
  const invite = `mailto:${email}?subject=${encodeURIComponent(`${g.title} — invitation request`)}`
  const nominate = `mailto:${email}?subject=${encodeURIComponent(`${a.title} — nomination`)}`
  return `
    <div class="scrim" aria-hidden="true"></div>
    <div class="col">
      <p class="eyebrow eye"><span class="eye__rule" aria-hidden="true"></span><span class="eye__t">${eyebrow}</span></p>
      <h2 class="h1 hl${film ? ' sr-only' : ''}">${esc(String(g.title))}<span class="hl__sub">${subtitle}</span></h2>
      <div class="stack" aria-label="The Storyteller">${stack}</div>
      <div class="forum">
        <span class="forum__rule" aria-hidden="true"></span>
        <p class="label forum__label">THE GALA</p>
        <p class="f fb">${esc(F1)}</p>
        <p class="f fb f2">${esc(F2)}</p>
        <div class="track fb"><ol class="cantos" aria-label="The nine cantos">${cantos}</ol></div>
        <ul class="chip-row meta fb" aria-label="Gala details">
          <li class="chip">${galaDate} ${year}</li><li class="chip">${city}</li><li class="chip">APPROX. 70 MINUTES</li><li class="chip chip--tba">BY INVITATION (TBC)</li>
        </ul>
      </div>
      <div class="awards">
        <span class="forum__rule" aria-hidden="true"></span>
        <p class="label awards__label">${esc(String(a.title).toUpperCase())} · ${dayMonth(String(a.date))}</p>
        <p class="s ab">${esc(AWARDS_S)}</p>
        <p class="f ab">${esc(AWARDS_F)}</p>
        <p class="fine ab">${esc(AWARDS_FINE)}</p>
        <a class="link link--mono ab" href="${nominate}">AWARDS — NOMINATE<span class="btn__arrow" aria-hidden="true">→</span></a>
      </div>
    </div>
    <div class="cut-slot"><p class="s cutline">${esc(CUT_LINE)}</p></div>
    <div class="couplet" aria-label="The final image">${couplet}</div>
    ${film ? `<div class="title"><span class="title__ink" aria-hidden="true">${galaTitle({ subtitle })}</span><p class="title__sub" aria-hidden="true">${subtitle}</p></div>` : ''}
    <!-- the pill is the ONLY block that sits on the figure (bible §6.11: "in the palm") -->
    <div class="pill-pos"><a class="btn btn--primary pill" href="${invite}"><span class="flood" aria-hidden="true"></span><span>REQUEST AN INVITATION</span><span class="btn__arrow" aria-hidden="true">→</span></a></div>
    <div class="closing" aria-label="The Storyteller">${closing}</div>`
}

/* ─── film state (cached elements; no per-frame queries) ─── */
let pill: HTMLElement | null = null, pillPos: HTMLElement | null = null, title: HTMLElement | null = null
let px = -1, py = -1

export const hand: Chapter = {
  id: 'hand',
  label: 'The Open Hand',
  navIndex: '05', inNav: true,

  mount(ctx: ChapterCtx) {
    const { el, shared, content } = ctx
    mobileMood = shared.mobile
    // the palm anchor of the tesserae layer (typed narrowly; the layer may still be a stub)
    const tl0 = ctx.world?.layers?.find(l => l.name === 'tesserae') as { anchors?: { palm?: number[] } } | undefined
    const palm = tl0?.anchors?.palm
    if (palm && palm.length === 3) PALM = [palm[0], palm[1], palm[2]]

    if (shared.reduced) {
      reducedMood = true
      el.classList.add('chapter--static')
      el.innerHTML = `<div class="pin__frame">${frameHTML(content, false)}</div>`
      return
    }

    const M = shared.mobile
    /* Beat positions. Portrait recomposes: the column (top band), the lettering (mid band) and the hand
       (lower band) are three stacked zones, so the Gala must clear the column before the Awards enters and
       the Awards must clear it before the closing lines land. Landscape has two columns and more air. */
    const AT = {
      // Landscape: ONE occupant of the column's body at a time. The drawn headline holds the top of the column
      // from .500; the Gala Forum sits beneath it, leaves at .726, and the Awards then takes the WHOLE column
      // (the headline has gone) while the closing lines accumulate in the sign-off slot below.
      // Portrait: ONE column too — the lettering heads it, the Gala sits under it, and both leave before the
      // Awards takes the column; the Awards then clears it before the closing lines land in it.
      titleIn: M ? .486 : .500, titleSub: M ? 1 : .634, titleOut: M ? .700 : .734,
      forumRule: M ? .524 : .538, forumLabel: M ? .544 : .560, forumLine: M ? .566 : .584, forumStep: M ? .020 : .024,
      forumTail: M ? .626 : .660, tailStep: M ? .020 : .024,
      pill: M ? .664 : .706, forumOut: M ? .694 : .726,
      awRule: M ? .706 : .740, awLabel: M ? .728 : .758, awBlock: M ? .750 : .778,
      awStep: M ? .016 : .020, awOut: M ? .820 : .878,
      closing: M ? .828 : .818, closeStep: M ? .010 : .011, closeOut: M ? .878 : .878,
      palmOut: M ? .818 : .830,
    }
    const { pin, tl } = createFilm(ctx, { length: M ? 3 : 4.5 })
    const w = Math.max(320, shared.vw), h = Math.max(320, shared.vh)
    pin.innerHTML = `
      <div class="pin__layer fx" aria-hidden="true">${net({ w, h, spacing: M ? 60 : 44 })}</div>
      <div class="pin__frame">${frameHTML(content, true)}</div>`

    const q = <T extends Element>(s: string) => pin.querySelector(s) as T
    const qa = (s: string) => Array.from(pin.querySelectorAll<HTMLElement>(s))
    const netSvg = q<SVGSVGElement>('.glyph--net')
    const eyeRule = q<HTMLElement>('.eye__rule'), eyeT = q<HTMLElement>('.eye__t')
    const stackLines = qa('.stack .st'), cutLine = q<HTMLElement>('.cutline')
    const couplet = qa('.couplet .cp')
    const forum = q<HTMLElement>('.forum'), forumRule = q<HTMLElement>('.forum .forum__rule'), forumLabel = q<HTMLElement>('.forum__label')
    const forumLines = qa('.forum .f'), forumTail = [q<HTMLElement>('.forum .track'), q<HTMLElement>('.forum .meta')]
    const awards = q<HTMLElement>('.awards'), awardsRule = q<HTMLElement>('.awards .forum__rule'), awardsLabel = q<HTMLElement>('.awards__label'), awardsBlocks = qa('.awards .ab')
    const closing = qa('.closing .c')
    const galaSvg = q<SVGSVGElement>('.glyph--gala')
    const titleSub = q<HTMLElement>('.title__sub')
    const scrim = q<HTMLElement>('.scrim')
    pill = q<HTMLElement>('.pill'); pillPos = q<HTMLElement>('.pill-pos'); title = q<HTMLElement>('.title')
    // crop the lettering to its ink (the traced viewBox is 1000 × 340 with wide margins): the two lines then
    // fill the block and read as a drawn title, not a small stamp. The SVG's own <text> subtitle is replaced
    // by a DOM line under it (CSS hides it) so it can carry the scrim and never lands on the gold palm.
    galaSvg.setAttribute('viewBox', '225 32 550 218')
    netSvg.style.setProperty('--net-draw', '0'); netSvg.style.opacity = '0'
    px = py = -1

    /* ── the net: draw 0–.16 · tighten 1 → .96 over 0–.26 · the cut .268–.368 (all scrubbed through proxies) ── */
    const netState = { draw: 0, tight: 1, cut: 0, op: 0 }
    const netProxy = { svg: netSvg }
    const paintNet = () => {
      const v = netProxy.svg.style
      v.setProperty('--net-draw', netState.draw.toFixed(4))
      v.opacity = netState.op.toFixed(3)
    }

    // the net follows the viewport (rebuilt on resize, cheap: one SVG string)
    let lastW = w, lastH = h
    const rebuildNet = () => {
      const nw = Math.max(320, window.innerWidth), nh = Math.max(320, window.innerHeight)
      if (Math.abs(nw - lastW) < 24 && Math.abs(nh - lastH) < 24) return
      lastW = nw; lastH = nh
      const fx = q<HTMLElement>('.fx'); fx.innerHTML = net({ w: nw, h: nh, spacing: M ? 60 : 44 })
      const s = q<SVGSVGElement>('.glyph--net'); netProxy.svg = s; paintNet(); tighten(s, netState.tight); cut(s, netState.cut)
    }
    window.addEventListener('resize', rebuildNet, { passive: true })

    // opacity is scrubbed (not a tween on the element) so a resize rebuild can re-apply it, and so the frame
    // is genuinely empty at the seam: the knots are filled circles and would otherwise show at p 0
    tl.to(netState, { op: 1, duration: .04, onUpdate: paintNet }, 0)
    tl.to(netState, { draw: 1, duration: .16, onUpdate: paintNet }, 0)
    tl.to(netState, { tight: .96, duration: .26, onUpdate: () => tighten(netProxy.svg, netState.tight) }, 0)
    tl.to(netState, { cut: 1, duration: .10, onUpdate: () => cut(netProxy.svg, netState.cut) }, .268)
    tl.to(netState, { op: 0, duration: .035, onUpdate: paintNet }, .358)

    /* ── head: eyebrow rule draws → eyebrow ── */
    tl.fromTo(eyeRule, { scaleX: 0 }, { scaleX: 1, duration: .035 }, .038)
    tl.fromTo(eyeT, { opacity: 0 }, { opacity: 1, duration: .028 }, .068)
    tl.to([eyeRule, eyeT], { opacity: 0, y: -8, duration: .03 }, .262)

    /* ── the Storyteller stack: one line per beat, 4 px rise; older lines to --fg-faint; max 6 visible ── */
    stackLines.forEach((line, i) => {
      const at = .095 + i * .024
      tl.fromTo(line, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .022 }, at)
      if (i > 0) tl.to(stackLines[i - 1], { opacity: .55, duration: .022 }, at)
      if (i >= 6) tl.to(stackLines[i - 6], { opacity: 0, duration: .018 }, at)
    })
    tl.to(stackLines, { opacity: 0, y: -8, duration: .03 }, .262)
    // the cut line stands alone in its own slot while the strands retreat
    tl.fromTo(cutLine, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .03 }, .300)
    tl.to(cutLine, { opacity: 0, y: -8, duration: .03 }, .390)

    /* ── the couplet: one line per finger group as the hand opens (.30–.52) ── */
    couplet.forEach((line, i) => tl.fromTo(line, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .04 }, .400 + i * .062))
    tl.to(couplet, { opacity: 0, y: -8, duration: .034 }, .528)

    /* ── the drawn headline: CALYPSO'S ODYSSEY strokes on in the column's headline slot, NOT on the palm ── */
    const drawState = { v: 0 }
    tl.fromTo(title, { opacity: 0 }, { opacity: 1, duration: .022 }, AT.titleIn)
    tl.to(drawState, { v: 1, duration: .106, onUpdate: () => draw(galaSvg, drawState.v) }, AT.titleIn)
    tl.fromTo(titleSub, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .028 }, AT.titleSub)
    tl.to(title, { opacity: 0, y: -8, duration: .026 }, AT.titleOut)

    /* ── Forum: rule → label → the two lines → the canto strip + chips ── */
    tl.fromTo(forumRule, { scaleX: 0 }, { scaleX: 1, duration: .03 }, AT.forumRule)
    tl.fromTo(forumLabel, { opacity: 0 }, { opacity: 1, duration: .022 }, AT.forumLabel)
    forumLines.forEach((b, i) => tl.fromTo(b, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .026 }, AT.forumLine + i * AT.forumStep))
    forumTail.forEach((b, i) => tl.fromTo(b, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .026 }, AT.forumTail + i * AT.tailStep))
    tl.to(forum, { opacity: 0, y: -8, duration: .022 }, AT.forumOut)
    // the invitation pill, in the palm — the one deliberate emblema on the figure
    tl.fromTo(pill, { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .03 }, AT.pill)
    tl.to(pill, { opacity: 0, duration: .026 }, AT.palmOut)

    /* ── Awards — the second movement, in the column the Gala and the headline have just left ── */
    tl.fromTo(awardsRule, { scaleX: 0 }, { scaleX: 1, duration: .022 }, AT.awRule)
    tl.fromTo(awardsLabel, { opacity: 0 }, { opacity: 1, duration: .02 }, AT.awLabel)
    awardsBlocks.forEach((b, i) => tl.fromTo(b, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .022 }, AT.awBlock + i * AT.awStep))
    tl.to(awards, { opacity: 0, y: -8, duration: .014 }, AT.awOut)

    /* ── closing lines (fg-faint) in the sign-off slot, dissolving with the frame; empty by p .90 ── */
    closing.forEach((line, i) => tl.fromTo(line, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .012 }, AT.closing + i * AT.closeStep))
    tl.to(closing, { opacity: 0, duration: .014 }, AT.closeOut)
    // the soft column scrim rides with the frame, so the seam is genuinely empty at both ends
    tl.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: .04 }, .030)
    tl.to(scrim, { opacity: 0, duration: .03 }, .862)
  },

  onProgress(p) {
    if (reducedMood) return
    document.documentElement.classList.toggle('is-black', p >= .96)
  },

  onFrame(shared: Shared, ctx: ChapterCtx) {
    // Only the invitation pill is pinned to the world now — the drawn headline lives in the type column, so
    // nothing else has to be projected. Portrait keeps a CSS slot for the pill: no per-frame work at all.
    if (reducedMood || shared.mobile || !pillPos) return
    // the palm centre, a touch below it so the pill sits in the hollow of the hand and never on the fingers
    const a = ctx.world.project(PALM[0], PALM[1] - .30, PALM[2])
    const ax = Math.round(a.x), ay = Math.round(a.y)
    if (ax !== px || ay !== py) { px = ax; py = ay; pillPos.style.transform = `translate3d(${ax}px, ${ay}px, 0) translate(-50%, -50%)` }
  },

  mood: p => reducedMood ? moodAt(.86) : moodAt(p),
}
