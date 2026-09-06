import './holdcue.css'
import type { HoldState } from '../engine/hold'

/**
 * The reading cue. When the reader pushes the wheel against a closed gate, a gold hairline along the bottom of
 * the viewport shows how much of the sentence's time is left, and fades the moment the way is clear again — so
 * a scroll that does not answer never reads as a page that has frozen.
 */
export function initHoldCue() {
  const el = document.createElement('div')
  el.className = 'holdcue'
  el.setAttribute('aria-hidden', 'true')
  el.innerHTML = '<span class="holdcue__bar"></span>'
  document.body.appendChild(el)
  const bar = el.firstElementChild as HTMLElement
  let hide = 0
  document.addEventListener('mtf:hold', e => {
    const h = (e as CustomEvent<HoldState>).detail
    if (!h) return
    bar.style.transform = `scaleX(${(1 - h.remaining / h.ms).toFixed(3)})`
    el.classList.add('is-on')
    clearTimeout(hide)
    hide = window.setTimeout(() => el.classList.remove('is-on'), Math.min(1600, h.remaining + 250))
  })
}
