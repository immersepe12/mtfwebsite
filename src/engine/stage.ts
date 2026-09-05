import { ScrollTrigger } from './scroll'
import type { ScrollEngine } from './scroll'
import type { World } from './gl'
import type { Chapter, ChapterCtx, Shared } from './chapter'
import { DEFAULT_MOOD, lerpMood, resolveMood, type Mood } from './mood'
import { clamp, smoothstep } from './utils'

interface Mounted { chapter: Chapter; el: HTMLElement; ctx: ChapterCtx; top: number; height: number; active: boolean; film: boolean; filmLen: number }

/**
 * Stage — mounts chapters into <main id="app"> in order, gives each a ScrollTrigger for progress/enter/leave,
 * and every frame blends the chapter moods into one target Mood for the World.
 */
export class Stage {
  mounted: Mounted[] = []
  private target: Mood = { ...DEFAULT_MOOD }
  private tmpA: Mood = { ...DEFAULT_MOOD }
  private tmpB: Mood = { ...DEFAULT_MOOD }

  /** `ctxWorld` is what chapters see (a NullWorld in DOM-only mode); `world` is the real renderer or null. */
  constructor(public app: HTMLElement, public chapters: Chapter[], public world: World | null, public scroll: ScrollEngine, public shared: Shared, public content: any, public ctxWorld: World | null = world) {}

  async mount() {
    for (const chapter of this.chapters) {
      const el = document.createElement('section')
      el.className = 'chapter'
      el.id = `ch-${chapter.id}`
      el.dataset.chapter = chapter.id
      if (chapter.label) el.setAttribute('aria-label', chapter.label)
      this.app.appendChild(el)
      const ctx: ChapterCtx = { el, world: (this.ctxWorld ?? this.world) as World, scroll: this.scroll, shared: this.shared, content: this.content }
      const m: Mounted = { chapter, el, ctx, top: 0, height: 1, active: false, film: false, filmLen: 0 }
      this.mounted.push(m)
      try { await chapter.mount(ctx) } catch (e) { console.error(`[stage] chapter "${chapter.id}" failed to mount`, e); el.classList.add('is-broken') }
      m.film = el.classList.contains('chapter--film')
      m.filmLen = parseFloat(el.style.getPropertyValue('--film-len')) || 0
      // Film chapters: p = the pinned travel ((filmLen − 1) × vh from the top), identical to createFilm's timeline —
      // even when flowing content (a footer) follows the film inside the section. Flowing chapters: viewport passage.
      const filmEnd = () => `+=${Math.max(1, (m.filmLen || m.height / window.innerHeight) * window.innerHeight - window.innerHeight)}`
      ScrollTrigger.create({
        trigger: el, start: m.film ? 'top top' : 'top bottom', end: m.film ? filmEnd : 'bottom top',
        onUpdate: st => chapter.onProgress?.(st.progress, ctx),
        onEnter: () => { m.active = true; el.classList.add('is-active'); chapter.onEnter?.(ctx) },
        onEnterBack: () => { m.active = true; el.classList.add('is-active'); chapter.onEnter?.(ctx) },
        onLeave: () => { m.active = false; el.classList.remove('is-active'); chapter.onLeave?.(ctx) },
        onLeaveBack: () => { m.active = false; el.classList.remove('is-active'); chapter.onLeave?.(ctx) },
      })
      // films also count as active while they are entering/leaving the viewport (for onFrame work near the seams)
      if (m.film) ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: st => { if (!st.isActive) { m.active = false; el.classList.remove('is-active') } } })
    }
    this.measure()
    ScrollTrigger.addEventListener('refresh', () => this.measure())
  }

  measure() {
    for (const m of this.mounted) {
      const r = m.el.getBoundingClientRect()
      m.top = r.top + window.scrollY
      m.height = Math.max(1, r.height)
    }
  }

  /** Local progress of a mounted chapter for the current scroll position (film: pinned travel; flowing: centre passage). */
  travelOf(m: Mounted, vh: number) { return Math.max(1, (m.filmLen ? m.filmLen * vh : m.height) - vh) }
  progressOf(m: Mounted, scrollY: number, vh: number) {
    if (m.film) return clamp((scrollY - m.top) / this.travelOf(m, vh))
    return clamp((scrollY + vh * 0.5 - m.top) / m.height)
  }

  /** Blend chapter moods for the current scroll position. */
  computeMood(scrollY: number, vh: number): Mood {
    const list = this.mounted
    if (!list.length) return this.target
    const centre = scrollY + vh * 0.5
    // the "current" chapter: for films, the one whose pinned travel contains scrollY; otherwise by viewport centre
    let i = list.findIndex(m => m.film ? (scrollY >= m.top && scrollY < m.top + m.height - vh) : (centre >= m.top && centre < m.top + m.height))
    if (i < 0) i = list.findIndex(m => centre >= m.top && centre < m.top + m.height)
    if (i < 0) i = centre < list[0].top ? 0 : list.length - 1
    const cur = list[i]
    const p = this.progressOf(cur, scrollY, vh)
    Object.assign(this.tmpA, resolveMood(cur.chapter.mood, p, DEFAULT_MOOD))
    const next = list[i + 1]
    if (next) {
      // films hand over at the seam (their frames are empty by p .90); flowing sections blend earlier
      const s = cur.film ? smoothstep(0.86, 1.0, p) : smoothstep(0.62, 1.0, p)
      if (s > 0) {
        Object.assign(this.tmpB, resolveMood(next.chapter.mood, 0, DEFAULT_MOOD))
        lerpMood(this.tmpA, this.tmpB, s, this.target)
        return this.target
      }
    }
    lerpMood(this.tmpA, this.tmpA, 0, this.target)
    return this.target
  }

  /** Dev override (`?mood=tess:1,tessForm:2,sunHeat:0`) merged over the computed mood every frame. */
  override: Partial<Mood> | null = null
  private noGlTick = 0

  frame(shared: Shared) {
    const mood = this.computeMood(shared.scrollY, shared.vh)
    if (this.override) for (const k in this.override) { const v = (this.override as any)[k]; (mood as any)[k] = Array.isArray(v) ? [v[0], v[1], v[2]] : v }
    if (this.world) this.world.setTarget(mood)
    else if ((this.noGlTick = (this.noGlTick + 1) % 3) === 0) {
      // DOM-only mode: the Stage writes the live CSS values the World would have written
      const root = document.documentElement.style
      const c = (rgb: number[]) => `rgb(${Math.round(rgb[0] * 255)} ${Math.round(rgb[1] * 255)} ${Math.round(rgb[2] * 255)})`
      root.setProperty('--sky-now', c(mood.skyBottom)); root.setProperty('--warmth-now', mood.warmth.toFixed(3))
      root.setProperty('--veil-now', mood.veil.toFixed(4)); root.setProperty('--tear-now', mood.p4.toFixed(4))
    }
    for (const m of this.mounted) if (m.active) m.chapter.onFrame?.(shared, m.ctx)
  }
}
