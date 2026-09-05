import type { World } from './gl'
import type { ScrollEngine } from './scroll'
import type { MoodSpec } from './mood'

export interface Shared {
  time: number; dt: number
  scrollY: number; scrollProgress: number; velocity: number
  mouse: { x: number; y: number; tx: number; ty: number; down: boolean } // normalised -1..1, lerped (x,y) and raw target (tx,ty)
  vw: number; vh: number; dpr: number
  reduced: boolean; touch: boolean; mobile: boolean
}

export interface ChapterCtx {
  el: HTMLElement
  world: World
  scroll: ScrollEngine
  shared: Shared
  content: any
}

/**
 * A Chapter owns one <section class="chapter"> and (optionally) a Mood for the WebGL world.
 * `mount` builds its DOM and any ScrollTriggers it needs (pins included).
 * `onProgress(p)` receives 0..1 while the section travels from entering the bottom of the viewport
 * to leaving the top. `mood` is blended by the Stage with the neighbouring chapters.
 */
export interface Chapter {
  id: string
  label?: string            // nav label (mono caps)
  navIndex?: string         // e.g. "01"
  inNav?: boolean           // show in the overlay navigation
  mount(ctx: ChapterCtx): void | Promise<void>
  onProgress?(p: number, ctx: ChapterCtx): void
  onEnter?(ctx: ChapterCtx): void
  onLeave?(ctx: ChapterCtx): void
  onFrame?(shared: Shared, ctx: ChapterCtx): void   // called every frame while the section is near the viewport
  mood?: MoodSpec
  /** Extra scroll length multiplier hint for the stage when a chapter pins (informational). */
  pin?: boolean
}
