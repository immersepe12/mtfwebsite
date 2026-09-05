import type { Shared } from '../engine/chapter'
/** DESIGN-BIBLE §7.7 — no custom cursor. The pointer still drives glints and parallax; it does not dress up. */
export function initCursor(_shared: Shared) {
  document.getElementById('cursor')?.remove()
  document.documentElement.classList.remove('has-cursor')
}
