/**
 * Shared anchors of the Ogygia scene (chapters 04 and 05 stage the same island; the star lands in its window).
 * World units. The island's mood keys point at the base of its rock window; the body runs east (+x) of it.
 */
export const ISLE: [number, number, number] = [2.2, -1.2, -14]
export const ISLE_SCALE = 0.75
/** The cave — the star's landing point: the centre of the window, a hand's breadth in front of it. */
export const CAVE: [number, number, number] = [ISLE[0], ISLE[1] + 0.55 * ISLE_SCALE, ISLE[2] + 0.35 * ISLE_SCALE]
