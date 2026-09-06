/**
 * Mood — the complete parameter set of the WebGL world at any scroll position.
 * Chapters declare a Mood (static or as a function of their local progress 0..1);
 * the Stage blends neighbouring chapter moods so the world is one continuous film.
 * Colours are linear-ish [r,g,b] in 0..1. Positions are world units (camera looks down -Z).
 */
export type RGB = [number, number, number]

export interface Mood {
  // camera (looks down −Z; camYaw = heading in radians around Y, camTilt = pitch, positive looks up)
  camX: number; camY: number; camZ: number; camTilt: number; camYaw: number; fov: number
  // sky gradient + haze
  skyTop: RGB; skyBottom: RGB; haze: number
  // the sun / the star. sunNear 0 = a celestial body (pushed out along its ray, cut by the horizon);
  // 1 = an object in the scene at its declared point (the star landing in the island's window)
  sunX: number; sunY: number; sunZ: number; sunRadius: number; sunGlow: number; sunHeat: number; sunVisible: number; sunNear: number
  // the island (gl/layers/island.ts): presence, the base of its rock window (Y = the waterline it stands in), size, heading, night stone → paper sand
  island: number; islandX: number; islandY: number; islandZ: number; islandScale: number; islandYaw: number; islandTone: number
  // the sea
  seaY: number; seaAmp: number; seaSpeed: number; seaOpacity: number; seaColor: RGB
  // stars / constellations
  stars: number; starDrift: number; constellation: number
  // tesserae mosaic field. tessForm = formation index in STORY ORDER (0 sun disc … see gl/layers/tesserae.ts);
  // fractional values morph between neighbouring formations. tess = assembly 0 scattered → 1 locked.
  tess: number; tessForm: number; tessSpread: number; tessGlint: number; tessGold: number
  // the veil (cloth/shader plane) 0 absent → 1 fully across
  veil: number
  // generic parameters (DESIGN-BIBLE §8.1, binding): p1 = tessera WRITE amount (tiles under the mask flip to ink),
  // p2 = write mask index (0 "SUN", 1 "XI"), p3 = tessera SHATTER gravity (tiles fall below seaY), p4 = VEIL TEAR 0→1.
  p1: number; p2: number; p3: number; p4: number
  // post-processing
  bloom: number; grain: number; vignette: number; mosaic: number; aberration: number
  // global palette warmth 0 cool (night) → 1 warm (noon)
  warmth: number
}

export const hex = (h: string): RGB => {
  const n = parseInt(h.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export const DEFAULT_MOOD: Mood = {
  camX: 0, camY: 0.6, camZ: 8, camTilt: 0, camYaw: 0, fov: 42,
  skyTop: hex('#090D16'), skyBottom: hex('#0E3D57'), haze: 0.35,
  sunX: 0, sunY: 1.4, sunZ: -6, sunRadius: 1.1, sunGlow: 0.8, sunHeat: 0.5, sunVisible: 1, sunNear: 0,
  island: 0, islandX: 2.4, islandY: -1.2, islandZ: -9.4, islandScale: 1, islandYaw: 0, islandTone: 0,
  seaY: -1.2, seaAmp: 0.25, seaSpeed: 0.6, seaOpacity: 1, seaColor: hex('#0E3D57'),
  stars: 0.6, starDrift: 0.2, constellation: 0,
  tess: 0, tessForm: 0, tessSpread: 1, tessGlint: 0.5, tessGold: 0.5,
  veil: 0,
  p1: 0, p2: 0, p3: 0, p4: 0,
  bloom: 0.6, grain: 0.06, vignette: 0.35, mosaic: 0, aberration: 0.0,
  warmth: 0.35,
}

export type MoodPatch = Partial<Mood>
export type MoodSpec = MoodPatch | ((p: number) => MoodPatch)

const isRGB = (v: unknown): v is RGB => Array.isArray(v) && v.length === 3

export function lerpMood(a: Mood, b: Mood, t: number, out: Mood = { ...a }): Mood {
  for (const k in a) {
    const key = k as keyof Mood
    const va = a[key] as any, vb = b[key] as any
    if (isRGB(va) && isRGB(vb)) {
      const o = (out[key] as RGB) && (out[key] as RGB) !== va ? (out[key] as RGB) : [0, 0, 0] as RGB
      o[0] = va[0] + (vb[0] - va[0]) * t; o[1] = va[1] + (vb[1] - va[1]) * t; o[2] = va[2] + (vb[2] - va[2]) * t
      ;(out as any)[key] = o
    } else if (typeof va === 'number' && typeof vb === 'number') {
      ;(out as any)[key] = va + (vb - va) * t
    }
  }
  return out
}

/**
 * Resolve a chapter's mood for progress `p` INTO `out` (no allocation): the Stage calls this every frame for the
 * current chapter and the next one, and returning fresh objects here is a steady drip of garbage at 60fps.
 */
export function resolveMoodInto(out: Mood, spec: MoodSpec | undefined, p: number, base: Mood = DEFAULT_MOOD): Mood {
  copyMood(base, out)
  const patch = typeof spec === 'function' ? spec(p) : (spec ?? {})
  for (const k in patch) {
    const v = (patch as any)[k]
    if (v === undefined) continue
    if (isRGB(v)) { const o = out[k as keyof Mood] as RGB; o[0] = v[0]; o[1] = v[1]; o[2] = v[2] }
    else (out as any)[k] = v
  }
  return out
}

export function resolveMood(spec: MoodSpec | undefined, p: number, base: Mood = DEFAULT_MOOD): Mood {
  const patch = typeof spec === 'function' ? spec(p) : (spec ?? {})
  return { ...base, ...patch }
}

export function copyMood(src: Mood, dst: Mood) {
  for (const k in src) {
    const key = k as keyof Mood
    const v = src[key] as any
    ;(dst as any)[key] = isRGB(v) ? [v[0], v[1], v[2]] : v
  }
  return dst
}

/** Piecewise-linear keyframes: kf(p, [[0, a], [.5, b], [1, c]]). Anchors must be sorted by p. */
export function kf(p: number, pairs: [number, number][]): number {
  if (p <= pairs[0][0]) return pairs[0][1]
  for (let i = 1; i < pairs.length; i++) {
    const [p1, v1] = pairs[i]
    if (p <= p1) { const [p0, v0] = pairs[i - 1]; const t = p1 === p0 ? 1 : (p - p0) / (p1 - p0); return v0 + (v1 - v0) * t }
  }
  return pairs[pairs.length - 1][1]
}
/** Piecewise-linear RGB keyframes: kfRGB(p, [[0, '#090D16'], [1, '#0E3D57']]) → RGB (allocates; fine inside mood(p)). */
export function kfRGB(p: number, pairs: [number, string][]): RGB {
  const cols = pairs.map(([q, h]) => [q, hex(h)] as [number, RGB])
  if (p <= cols[0][0]) return [...cols[0][1]] as RGB
  for (let i = 1; i < cols.length; i++) {
    const [p1, c1] = cols[i]
    if (p <= p1) { const [p0, c0] = cols[i - 1]; const t = p1 === p0 ? 1 : (p - p0) / (p1 - p0); return [c0[0] + (c1[0] - c0[0]) * t, c0[1] + (c1[1] - c0[1]) * t, c0[2] + (c1[2] - c0[2]) * t] }
  }
  return [...cols[cols.length - 1][1]] as RGB
}
/** GLSL snippet: mood colours are sRGB design tokens; the composer encodes linear → sRGB, so layers convert with this. */
export const SRGB_TO_LINEAR_GLSL = /* glsl */ `
vec3 srgbToLinear(vec3 c){ return pow(max(c, 0.0), vec3(2.2)); }
`
/** JS twin of the GLSL helper for uniforms set from tokens. */
export const toLinear = (c: RGB): RGB => [Math.pow(c[0], 2.2), Math.pow(c[1], 2.2), Math.pow(c[2], 2.2)]
