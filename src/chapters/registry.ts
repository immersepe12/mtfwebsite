import type { Chapter } from '../engine/chapter'
/**
 * The ordered list of chapters (DESIGN-BIBLE §6.0). Owned by the lead; chapter agents never edit this file.
 *
 * THE CUT (staging): the compact film — under five minutes played — keeps the set pieces (the sun, the
 * lightning and the Shatter, the constellation, the island and its star, the paper world's three days, the
 * think tanks, the compass, the hand that cuts the net, the raft, the sunrise) and leaves out the four
 * chapters that are narrative alone: Unity, Forever, What Remains, Homer.
 */
import { hero } from './01-hero/index'
import { warning } from './02-warning/index'
import { stars } from './03-stars/index'
import { ogygia } from './04-ogygia/index'
import { unity } from './05-unity/index'
import { paradise } from './06-paradise/index'
import { eleven } from './07-eleven/index'
import { rudder } from './08-rudder/index'
import { forever } from './09-forever/index'
import { remains } from './10-remains/index'
import { hand } from './11-hand/index'
import { homer } from './12-homer/index'
import { register } from './13-register/index'
import { sunrise } from './14-sunrise/index'

export const chapters: Chapter[] = [
  hero, warning, stars, ogygia, paradise, eleven, rudder, hand, register, sunrise,
]
/** the four the cut leaves out, kept importable so the full film is one line away */
export const omitted: Chapter[] = [unity, forever, remains, homer]
