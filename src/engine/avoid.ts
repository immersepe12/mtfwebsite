/**
 * avoidOverlaps — the one fault a reader always notices.
 *
 * A chapter places its headline and its storyteller stack at fixed percentages of the frame. The headline is
 * set in a display serif and wraps differently at every viewport width and with every font fallback, so at some
 * widths its last line lands exactly where the first storyteller line begins and the story prints itself over
 * the title. No amount of per-chapter nudging fixes that, because the collision depends on how the line broke.
 *
 * So the frame is checked after layout: if a text block that comes later in the DOM sits on — or too close under —
 * the headline in the same column, it is pushed down until it clears it by a set amount. Blocks are only
 * moved vertically, only downward, only when their columns genuinely overlap, and never past the frame's foot —
 * the composition the chapter designed is kept; the collision is not.
 */

const GAP = 26                 // px of clearance a block must keep below the one above it
const COL_OVERLAP = 0.28       // share of the narrower block's width that must overlap to count as one column
const FOOT = 0.94              // never push a block below this share of the frame

const rectOf = (el: HTMLElement, base: DOMRect) => {
  const r = el.getBoundingClientRect()
  return { top: r.top - base.top, bottom: r.bottom - base.top, left: r.left - base.left, right: r.right - base.left, w: r.width, h: r.height }
}

/** Blocks that may be moved: the storyteller lines and anything a chapter marks itself. */
const MOVABLE = '.s, .story, [data-avoid]'
/** Blocks that hold their ground: anything with type in it that already sits above the block being placed. */
const ANCHOR = 'h1, h2, h3, .display, .h1, .h2, .hl, .couplet, .stat, .chip-row, blockquote'

export function avoidOverlaps(frame: HTMLElement) {
  const base = frame.getBoundingClientRect()
  if (base.height < 100) return
  // Never reach into a section the browser is skipping (content-visibility): querying its descendants forces it
  // to lay out and undoes the saving. A frame more than a screen away cannot be colliding on screen anyway.
  const vh = window.innerHeight
  if (base.bottom < -vh || base.top > vh * 2) return

  // the movable groups: a storyteller stack moves as one, so take each line's positioned container
  const groups = new Map<HTMLElement, HTMLElement[]>()
  for (const line of Array.from(frame.querySelectorAll<HTMLElement>(MOVABLE))) {
    if (!line.textContent?.trim()) continue
    let box: HTMLElement = line
    while (box.parentElement && box.parentElement !== frame && getComputedStyle(box).position === 'static') box = box.parentElement
    const arr = groups.get(box) || []
    arr.push(line)
    groups.set(box, arr)
  }
  if (!groups.size) return

  const anchors = Array.from(frame.querySelectorAll<HTMLElement>(ANCHOR)).filter(a => {
    if (!a.textContent?.trim() || a.offsetHeight === 0) return false
    if (a.closest(MOVABLE) || a.querySelector(MOVABLE)) return false   // a block cannot anchor itself
    const cs = getComputedStyle(a)
    return cs.visibility !== 'hidden' && +cs.opacity > 0.02
  })
  if (!anchors.length) return

  // resolve top-to-bottom so a block pushed down can in turn push the block beneath it
  const boxes = Array.from(groups.keys()).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
  const placed: { top: number; bottom: number; left: number; right: number; w: number; h: number }[] = []
  for (const box of boxes) {
    if (anchors.some(a => a === box || a.contains(box) || box.contains(a))) continue
    const prev = box.style.top
    // measure from the chapter's own placement, not from a previous correction
    if (box.dataset.avoidTop) box.style.top = box.dataset.avoidTop
    const r = rectOf(box, base)
    if (r.h < 4) continue

    let push = 0
    const against = [...anchors.map(a => rectOf(a, base)), ...placed]
    for (const ar of against) {
      const overlapX = Math.min(r.right, ar.right) - Math.max(r.left, ar.left)
      const narrower = Math.min(r.w, ar.w) || 1
      if (overlapX / narrower < COL_OVERLAP) continue                 // different columns: no quarrel
      if (r.top < ar.top - 4) continue                                // the block sits above: it is not the intruder
      // clearance, not just separation: display type set at lh 1.02 can miss a box by 7px and still read as
      // one line printed on another, which is exactly what a reader calls an overlap
      const clearance = r.top - ar.bottom
      if (clearance >= GAP) continue
      push = Math.max(push, GAP - clearance)
    }

    if (push < 2) { if (prev && !box.dataset.avoidTop) box.style.top = prev; placed.push(r); continue }
    const maxTop = base.height * FOOT - r.h
    const style = getComputedStyle(box)
    if (style.position === 'absolute' || style.position === 'fixed') {
      if (!box.dataset.avoidTop) box.dataset.avoidTop = box.style.top || `${r.top}px`
      box.style.top = `${Math.min(r.top + push, Math.max(0, maxTop))}px`
    } else {
      box.style.marginTop = `${Math.min(push, Math.max(0, maxTop - r.top))}px`
    }
    const moved = Math.min(push, Math.max(0, maxTop - r.top))
    placed.push({ ...r, top: r.top + moved, bottom: r.bottom + moved })
  }
}

/** Run over every mounted chapter's frame. */
export function avoidAll(root: ParentNode = document) {
  for (const frame of Array.from(root.querySelectorAll<HTMLElement>('#app .pin__frame, #app .ch-inner'))) avoidOverlaps(frame)
}
