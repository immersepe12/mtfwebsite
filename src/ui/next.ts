import './next.css'
import { player } from '../engine/play'
import type { ScrollEngine } from '../engine/scroll'

/**
 * NEXT — the film's own control (DESIGN-BIBLE §7: the reader should never have to guess when to move).
 *
 * One press plays the next moment and stops there; while it plays, a gold ring draws around the button for
 * exactly as long as the moment lasts, so the wait is shown rather than guessed, and a second press cannot
 * hurry it. It stands down while PLAY THE STORY is running, and once the film is over and the footer scrolls
 * on its own.
 */
export function initNext(scroll: ScrollEngine) {
  const el = document.createElement('button')
  el.type = 'button'
  el.className = 'next'
  el.setAttribute('aria-label', 'Next')
  el.innerHTML = '<span class="next__ring" aria-hidden="true"></span><span class="next__v" aria-hidden="true"></span><span class="next__hint">Next</span>'
  document.body.appendChild(el)

  let busy = false
  el.addEventListener('click', () => { if (!busy) player.step(1) })
  player.onBusy((on, ms) => {
    busy = on
    el.classList.toggle('is-busy', on)
    if (on) el.style.setProperty('--dur', `${Math.round(ms)}ms`)
    el.setAttribute('aria-disabled', String(on))
    if (!on) show()
  })
  player.onChange(() => show())

  const show = () => el.classList.toggle('is-on', !player.playing && player.hasNext)
  // the page's height is only known after the first refresh, so ask again whenever the scroll moves and once the
  // curtain is up — deciding this once at start-up would leave the control hidden for the whole film
  scroll.onScroll(show)
  document.addEventListener('mtf:ready', show)
  show()
  // the label introduces the control once the curtain is up, then leaves
  const hint = () => { el.classList.add('is-hint'); window.setTimeout(() => el.classList.remove('is-hint'), 4200) }
  if (document.documentElement.classList.contains('is-ready')) hint()
  else document.addEventListener('mtf:ready', hint, { once: true })
  document.addEventListener('mtf:step', () => show())
  window.addEventListener('resize', show)
  return { el, show }
}
