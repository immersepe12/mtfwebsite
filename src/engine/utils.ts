export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
/** Frame-rate independent damping (exponential decay). lambda ≈ 4–12 feels right. */
export const damp = (a: number, b: number, lambda: number, dt: number) => lerp(a, b, 1 - Math.exp(-lambda * dt))
export const mapRange = (v: number, inA: number, inB: number, outA: number, outB: number) => outA + ((v - inA) / (inB - inA)) * (outB - outA)

export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  try { const v = localStorage.getItem('mtf-motion'); if (v === 'reduced') return true; if (v === 'full') return false } catch {}
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
export const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches
export const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 820

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, html?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag)
  if (className) e.className = className
  if (html !== undefined) e.innerHTML = html
  return e
}
export const qs = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector(sel) as T | null
export const qsa = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll(sel)) as T[]

/** Tiny pub/sub */
export class Emitter<T extends Record<string, unknown[]>> {
  private map = new Map<keyof T, Set<(...a: any[]) => void>>()
  on<K extends keyof T>(k: K, fn: (...a: T[K]) => void) {
    if (!this.map.has(k)) this.map.set(k, new Set())
    this.map.get(k)!.add(fn)
    return () => this.map.get(k)!.delete(fn)
  }
  emit<K extends keyof T>(k: K, ...a: T[K]) { this.map.get(k)?.forEach(f => f(...a)) }
}
