/**
 * PACING — the film's global scroll rhythm (lead-owned).
 *
 * A chapter declares the film length its composition wants; this table is the one place the whole picture's
 * pace is tuned. The multiplier is chosen per chapter from its beat density: a chapter that fires 30 timeline
 * beats needs far more scroll than one that fires 8, or a single flick of the wheel runs through a dozen beats
 * at once and the film reads as a strobe rather than a story.
 *
 * Target: ≥ ~180 px of scroll per beat at a 900 px viewport (a wheel notch ≈ 100 px, a flick ≈ 800–1500 px),
 * and no chapter shorter than ~2.5 screens of travel.
 */
export const FILM_SCALE_DEFAULT = 1.1

/** Per-chapter multiplier on the chapter's declared length. Keyed by `Chapter.id`. */
export const PACING: Record<string, number> = {
  hero: 1.0,       //  8 beats — the sun's descent wants air, not beats
  warning: 1.1,   // 21 beats + the Shatter
  stars: 1.0,      // 18 beats — the eleven stars light one by one
  ogygia: 1.0,     // 20 beats — three storyteller stacks, then the host
  unity: 1.7,      // 25 beats in 2 screens: the tightest chapter in the film
  paradise: .9,   // 14 beats over three sunrises — already roomy
  eleven: 1.2,     // 15 beats, but the sky crosses two and a half days: each pass needs room
  rudder: 1.2,     // 33 beats — four bearings and a 360° yaw
  forever: 1.3,    // 19 beats — the counter needs scroll to climb
  remains: 1.35,    // 30 beats — four programme columns
  hand: 1.25,      // 30 beats — the cut, the assembly, the couplet
  homer: .85,      //  8 beats and the hold: its silence is the point
  register: .85,   //  6 beats; the form is read, not scrubbed
  sunrise: 1.4,   // 12 beats — the whole sunrise happened in one screen
}

/** Touch is not stepped (a swipe scrolls natively), so on a phone the film is still scrubbed by distance and
 *  needs the room the wheel no longer does. */
const TOUCH_SCALE = 1.5

export const filmLength = (id: string | undefined, base: number) =>
  base * ((id && PACING[id]) || FILM_SCALE_DEFAULT) *
  (typeof matchMedia !== 'undefined' && matchMedia('(hover: none), (pointer: coarse)').matches ? TOUCH_SCALE : 1)
