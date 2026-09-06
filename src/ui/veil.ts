import './veil.css'
import type { World } from '../engine/gl'

/**
 * The veil — DESIGN-BIBLE §7.6.
 *
 * A fixed, full-viewport, pointer-events-none cloth that the world drives purely through two CSS
 * custom properties written on <html> every third frame (src/engine/gl.ts):
 *
 *   --veil-now  (mood.veil) — a MONOTONIC phase, never reset. The cloth's position is fract(veil):
 *               0 = parked off-right · .5 = fully across the stage · 1 = parked off-left.
 *               Crossing 1 is veil 0 → 1 (Ch 04→05), crossing 2 is 1 → 2 (Ch 07→08), the tear happens
 *               at 2 → 2.5 (cloth half across, Ch 08) and 2.5 → 3 slides the torn halves off left (Ch 09).
 *   --tear-now  (mood.p4) — Fontana's cut, 0 → 1: a 2 px cream slash draws top → bottom down a jagged
 *               centre polyline over the first 30 %, then the two halves part translateX(±140px) rotate(∓4°).
 *
 * Desktop with WebGL: an inline SVG — the scalloped-hem cloth (art plan A4 geometry: six quadratic
 * scallops along the hem), sand .22 + a 40 × 40 gold hairline grid .18 + a second copy offset (−30, +20)
 * at .14 in screen blend — warped by feTurbulence + feDisplacementMap whose baseFrequency breathes over 9 s
 * (setAttribute at 30 fps, only while the cloth is on stage).
 * Mobile (< 820 px) and html.no-gl: a Bridget Riley moiré — two repeating-linear-gradient line layers at a
 * 2° offset, one drifting — no SVG filters.
 * Reduced motion: no slide, no breath — opacity crossfades only.
 *
 * The cloth also carries the Storyteller line the active chapter sets as `data-veil-line` on #veil
 * (Ch 04: "Kalyptein. / To cover. To conceal. / To draw a veil."), Fraunces italic with the SOFT-axis breath.
 * The line belongs to the crossing (floor(veil)) in which the attribute was set: it rides the cloth for that
 * crossing only, is spent the moment the cloth parks, and a stale attribute is ignored on every later crossing.
 *
 * Parked (f < .02 or > .98) means NOTHING of the cloth is on stage: both modes, whole or torn. The torn halves
 * exist only while --tear-now > 0 AND the cloth is on stage — parking drops the tear (it is re-applied from
 * --tear-now when the cloth next comes on) so Ch 09 taking p4 back to 0 while hidden can never strand them.
 *
 * Per frame: one cached getComputedStyle read of the two vars, a handful of comparisons, and DOM writes
 * only when a value actually changed. No per-frame allocations beyond the strings the DOM needs.
 */

type Mode = 'svg' | 'moire'

const PAD = 48 // the cloth overhangs the viewport so the warp never reveals an edge
const SCALLOPS = 6
const HEM = 0.86 // hem height as a fraction of the viewport — the sea stays visible beneath it
const TEAR_TX = 140 // px the halves part
const TEAR_ROT = 4 // degrees the halves curl
const SLASH_END = 0.3 // the slash finishes drawing at 30 % of the tear
const WARP = 40 // feDisplacementMap scale at rest
const BREATH_MS = 9000 // baseFrequency breath period
const MOBILE_BP = 820
// nine tear vertices, jittered ±14 (fixed so the cut is the same cut on every frame and every resize)
const JITTER = [3, -11, 8, -14, 5, 12, -6, 14, -2]
const TAU = Math.PI * 2

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smooth = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t) }

/** The scalloped cloth (SVG `d` — also valid inside CSS `path()`). */
function clothPath(w: number, h: number): string {
  const hem = h * HEM
  const sw = w / SCALLOPS
  const depth = Math.min(sw * 0.3, h * 0.07)
  let d = `M${-PAD} ${-PAD}H${w + PAD}V${hem}H${w}`
  for (let i = 0; i < SCALLOPS; i++) d += `q${-sw / 2} ${depth} ${-sw} 0`
  return d + `H${-PAD}Z`
}
/** The jagged centre polyline as [x, y] pairs from above the top edge to below the bottom. */
function tearLine(w: number, h: number): number[] {
  const out: number[] = []
  const n = JITTER.length
  for (let i = 0; i < n; i++) out.push(w / 2 + JITTER[i]!, -PAD + ((h + PAD * 2) * i) / (n - 1))
  return out
}
const pointsOf = (pts: number[]) => { let s = ''; for (let i = 0; i < pts.length; i += 2) s += `${pts[i]} ${pts[i + 1]} `; return s.trim() }
/** Half of the cloth's box on one side of the tear (SVG polygon points). */
function halfPoints(pts: number[], w: number, h: number, side: 'l' | 'r'): string {
  const x = side === 'l' ? -PAD : w + PAD
  return `${x} ${-PAD} ${pointsOf(pts)} ${x} ${h + PAD}`
}
/** The same half as a CSS `path()` for the moiré cloth's clip. */
function halfPath(pts: number[], w: number, h: number, side: 'l' | 'r'): string {
  const x = side === 'l' ? -PAD : w + PAD
  let d = `M${x} ${-PAD}`
  for (let i = 0; i < pts.length; i += 2) d += `L${pts[i]} ${pts[i + 1]}`
  return d + `L${x} ${h + PAD}Z`
}

const svgMarkup = (w: number, h: number, pts: number[]) => `
<svg class="veil__svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  <defs>
    <pattern id="veilGrid" width="40" height="40" patternUnits="userSpaceOnUse"><path class="veil__grid" d="M40 .5H0M.5 0V40"/></pattern>
    <filter id="veilWarp" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
      <feTurbulence class="veil__turb" type="fractalNoise" baseFrequency="0.008 0.02" numOctaves="2" seed="7" result="n"/>
      <feDisplacementMap class="veil__disp" in="SourceGraphic" in2="n" scale="${WARP}" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <path id="veilShape" class="veil__shape" d="${clothPath(w, h)}"/>
    <g id="veilCloth">
      <use href="#veilShape" class="veil__a"/>
      <use href="#veilShape" fill="url(#veilGrid)"/>
      <use href="#veilShape" class="veil__b" transform="translate(-30 20)"/>
    </g>
    <clipPath id="veilClipL"><polygon class="veil__clip--l" points="${halfPoints(pts, w, h, 'l')}"/></clipPath>
    <clipPath id="veilClipR"><polygon class="veil__clip--r" points="${halfPoints(pts, w, h, 'r')}"/></clipPath>
  </defs>
  <g class="veil__whole"><use href="#veilCloth" filter="url(#veilWarp)"/></g>
  <g class="veil__halves">
    <g class="veil__half veil__half--l"><g clip-path="url(#veilClipL)"><use href="#veilCloth" filter="url(#veilWarp)"/></g><polyline class="veil__slash" pathLength="1" points="${pointsOf(pts)}"/></g>
    <g class="veil__half veil__half--r"><g clip-path="url(#veilClipR)"><use href="#veilCloth" filter="url(#veilWarp)"/></g><polyline class="veil__slash" pathLength="1" points="${pointsOf(pts)}"/></g>
  </g>
</svg>`

const sheetMarkup = () => `<div class="veil__sheet"><i class="veil__moire veil__moire--a"></i><i class="veil__moire veil__moire--b"></i></div>`
const cutMarkup = (w: number, h: number, pts: number[]) =>
  `<svg class="veil__cut" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true" focusable="false"><polyline class="veil__slash" pathLength="1" points="${pointsOf(pts)}"/></svg>`
const moireMarkup = (w: number, h: number, pts: number[]) => `
<div class="veil__whole">${sheetMarkup()}</div>
<div class="veil__halves">
  <div class="veil__half veil__half--l">${sheetMarkup()}${cutMarkup(w, h, pts)}</div>
  <div class="veil__half veil__half--r">${sheetMarkup()}${cutMarkup(w, h, pts)}</div>
</div>`

export function initVeil({ world }: { world: World | null }) {
  const root = document.getElementById('veil')
  if (!root) return
  const html = document.documentElement
  const reduced = html.classList.contains('reduced-motion')
  const noGl = !world || html.classList.contains('no-gl')
  const pickMode = (): Mode => (noGl || root.clientWidth < MOBILE_BP ? 'moire' : 'svg')

  // ── the DOM ──────────────────────────────────────────────────────────────────────────────────────
  root.innerHTML = `<div class="veil__cloth"></div><p class="veil__text" aria-hidden="true"></p>`
  const cloth = root.firstElementChild as HTMLDivElement
  const text = root.lastElementChild as HTMLParagraphElement
  // the text rides on the cloth
  cloth.appendChild(text)

  let mode: Mode = pickMode()
  let vw = root.clientWidth || innerWidth
  let vh = root.clientHeight || innerHeight
  let pts = tearLine(vw, vh)
  // live references (rebuilt with the DOM)
  let halves: (SVGGElement | HTMLElement)[] = []
  let slashes: (SVGPolylineElement)[] = []
  let turb: SVGFETurbulenceElement | null = null
  let disp: SVGFEDisplacementMapElement | null = null
  let sheets: HTMLElement[] = []
  let body: HTMLDivElement | null = null
  // frame state (written only when a value changes)
  let on = false
  let lastF = -1
  let lastEdge = ''
  let lastTear = -1
  let torn = false
  const cs = html.style            // the world writes these inline; reading the inline value costs no style flush
  const readVeil = () => parseFloat(cs.getPropertyValue('--veil-now')) || 0

  const build = () => {
    cloth.classList.toggle('veil__cloth--moire', mode === 'moire')
    // remove the previous cloth body but keep the text element
    while (cloth.firstChild && cloth.firstChild !== text) cloth.removeChild(cloth.firstChild)
    body = document.createElement('div')
    body.className = 'veil__body'
    body.innerHTML = mode === 'svg' ? svgMarkup(vw, vh, pts) : moireMarkup(vw, vh, pts)
    cloth.insertBefore(body, text)
    lastEdge = ''
    halves = Array.from(body.querySelectorAll<SVGGElement | HTMLElement>('.veil__half'))
    slashes = Array.from(body.querySelectorAll<SVGPolylineElement>('.veil__slash'))
    turb = body.querySelector<SVGFETurbulenceElement>('.veil__turb')
    disp = body.querySelector<SVGFEDisplacementMapElement>('.veil__disp')
    sheets = Array.from(body.querySelectorAll<HTMLElement>('.veil__sheet'))
    if (mode === 'moire') {
      const d = clothPath(vw, vh)
      for (const s of sheets) s.style.clipPath = `path("${d}")`
      ;(halves[0] as HTMLElement).style.clipPath = `path("${halfPath(pts, vw, vh, 'l')}")`
      ;(halves[1] as HTMLElement).style.clipPath = `path("${halfPath(pts, vw, vh, 'r')}")`
    }
    lastTear = -1 // force the tear state to be re-applied on the new DOM
  }

  // ── the storyteller line the cloth carries ───────────────────────────────────────────────────────
  // Latched per crossing: `lineCrossing` = floor(veil) when the attribute was (re)set. A chapter re-setting
  // the same value does not re-arm a spent line — it must be removed and set again (Ch 04 does, either way).
  let hasLine = false
  let lineRaw = ''
  let lineCrossing = -1
  let shown = false
  const setShown = (v: boolean) => { if (v === shown) return; shown = v; text.classList.toggle('is-shown', v) }
  const clearLine = () => { hasLine = false; text.textContent = ''; setShown(false) }
  const setLine = (raw: string | null, force = false) => {
    const v = (raw ?? '').trim()
    if (v === lineRaw && !force) return
    lineRaw = v
    if (!v) { clearLine(); return }
    hasLine = true
    lineCrossing = Math.floor(readVeil())
    text.innerHTML = v.split(/\s*(?:\/|\n)\s*/).filter(Boolean).map(l => `<span class="veil__line">${escapeHtml(l)}</span>`).join('')
  }
  setLine(root.getAttribute('data-veil-line'))
  new MutationObserver(records => {
    const v = (root.getAttribute('data-veil-line') ?? '').trim()
    // a removal + re-set batched into one callback still counts as a change (some oldValue ≠ the current value)
    let changed = v !== lineRaw
    for (const r of records) if ((r.oldValue ?? '').trim() !== v) changed = true
    if (changed) setLine(v, true)
  }).observe(root, { attributes: true, attributeFilter: ['data-veil-line'], attributeOldValue: true })

  // ── parked: nothing of the cloth may stay on stage — drop the tear, spend the line ───────────────
  const park = () => {
    if (torn) { torn = false; cloth.classList.remove('is-torn') }
    lastTear = -1; lastF = -1
    clearLine()
  }

  // ── the tear (Fontana's cut) ─────────────────────────────────────────────────────────────────────
  const applyTear = (tear: number) => {
    const t = reduced ? (tear > 0.5 ? 1 : 0) : tear
    const isTorn = t > 0.001
    if (isTorn !== torn) { torn = isTorn; cloth.classList.toggle('is-torn', torn) }
    if (!isTorn) return
    const slash = clamp01(t / SLASH_END)
    const part = smooth(SLASH_END, 1, t)
    const tx = TEAR_TX * part, rot = TEAR_ROT * part
    const off = (1 - slash).toFixed(4)
    for (const s of slashes) s.style.strokeDashoffset = off
    if (mode === 'svg') {
      halves[0]?.setAttribute('transform', `translate(${-tx} 0) rotate(${rot} ${vw / 2} 0)`)
      halves[1]?.setAttribute('transform', `translate(${tx} 0) rotate(${-rot} ${vw / 2} 0)`)
      // the warp spikes as the cut opens (art plan A4: 40 → 110 → 30, tamed)
      disp?.setAttribute('scale', (WARP + 50 * Math.sin(Math.PI * clamp01(t / 0.6))).toFixed(1))
    } else {
      const l = halves[0] as HTMLElement | undefined, r = halves[1] as HTMLElement | undefined
      if (l) l.style.transform = `translateX(${-tx}px) rotate(${rot}deg)`
      if (r) r.style.transform = `translateX(${tx}px) rotate(${-rot}deg)`
    }
  }

  // ── resize: regenerate the geometry (or rebuild when the mode flips across 820 px) ───────────────
  let resizeQueued = false
  const onResize = () => {
    if (resizeQueued) return
    resizeQueued = true
    requestAnimationFrame(() => {
      resizeQueued = false
      const w = root.clientWidth || innerWidth, h = root.clientHeight || innerHeight
      if (w === vw && h === vh && pickMode() === mode) return
      vw = w; vh = h; pts = tearLine(vw, vh)
      const next = pickMode()
      if (next !== mode) { mode = next; build(); return }
      if (mode === 'svg') {
        const svg = cloth.querySelector<SVGSVGElement>('.veil__svg')
        svg?.setAttribute('viewBox', `0 0 ${vw} ${vh}`)
        svg?.querySelector('.veil__shape')?.setAttribute('d', clothPath(vw, vh))
        svg?.querySelector('.veil__clip--l')?.setAttribute('points', halfPoints(pts, vw, vh, 'l'))
        svg?.querySelector('.veil__clip--r')?.setAttribute('points', halfPoints(pts, vw, vh, 'r'))
        for (const s of slashes) s.setAttribute('points', pointsOf(pts))
      } else {
        const d = clothPath(vw, vh)
        for (const s of sheets) s.style.clipPath = `path("${d}")`
        ;(halves[0] as HTMLElement | undefined)?.style.setProperty('clip-path', `path("${halfPath(pts, vw, vh, 'l')}")`)
        ;(halves[1] as HTMLElement | undefined)?.style.setProperty('clip-path', `path("${halfPath(pts, vw, vh, 'r')}")`)
        for (const c of cloth.querySelectorAll<SVGSVGElement>('.veil__cut')) c.setAttribute('viewBox', `0 0 ${vw} ${vh}`)
        for (const s of slashes) s.setAttribute('points', pointsOf(pts))
      }
      lastF = -1; lastTear = -1
    })
  }
  addEventListener('resize', onResize, { passive: true })

  // ── the frame loop ───────────────────────────────────────────────────────────────────────────────
  let breathAcc = 0
  let lastNow = performance.now()
  const tick = (now: number) => {
    requestAnimationFrame(tick)
    const dt = now - lastNow; lastNow = now
    const veil = readVeil()
    const tear = parseFloat(cs.getPropertyValue('--tear-now')) || 0
    const crossing = Math.floor(veil)
    const f = veil - crossing
    // hidden when parked (f < .02 or > .98); under reduced motion the cloth only exists while it covers the stage
    const wantOn = reduced ? f > 0.15 && f < 0.85 : f >= 0.02 && f <= 0.98
    if (wantOn !== on) {
      on = wantOn; cloth.classList.toggle('is-on', on)
      if (on) { lastF = -1; lastTear = -1 } else park()
    }
    if (!on) return
    if (!reduced && f !== lastF) {
      lastF = f
      cloth.style.transform = `translate3d(${((0.5 - f) * 2 * vw).toFixed(1)}px,0,0)`
      // the first/last 5 % of travel fades the body so the overhang — and the parted halves — never pop at the threshold
      const edge = Math.min(1, (f - 0.02) / 0.05, (0.98 - f) / 0.05).toFixed(2)
      if (edge !== lastEdge && body) { lastEdge = edge; body.style.opacity = edge }
    }
    // the line breathes in once its part of the cloth is on stage — only in the crossing it was set for
    setShown(hasLine && crossing === lineCrossing && f > 0.08 && f < 0.92)
    if (tear !== lastTear) { lastTear = tear; applyTear(tear) }
    // the cloth's weave breathes: baseFrequency .008 .02 → .010 .024 → back over 9 s, written at 30 fps
    if (turb && !reduced) {
      breathAcc += dt
      if (breathAcc >= 1000 / 30) {
        breathAcc = 0
        const k = 0.5 - 0.5 * Math.cos(((now % BREATH_MS) / BREATH_MS) * TAU)
        turb.setAttribute('baseFrequency', `${(0.008 + 0.002 * k).toFixed(5)} ${(0.02 + 0.004 * k).toFixed(5)}`)
      }
    }
  }

  build()
  requestAnimationFrame(tick)
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;'))
}
