import * as THREE from 'three'
import { DEFAULT_MOOD, copyMood, type Mood } from './mood'
import type { Shared } from './chapter'
import type { World } from './gl'

/**
 * NullWorld — a duck-typed stand-in for World in DOM-only mode (html.no-gl / WebGL unavailable).
 * Chapters can call world.project(), read world.mood / world.sunNdc / world.layers safely; nothing renders.
 * The Stage keeps its own `world` null so it writes the live CSS values itself.
 */
export function createNullWorld(shared: Shared): World {
  const camera = new THREE.PerspectiveCamera(DEFAULT_MOOD.fov, shared.vw / shared.vh, 0.1, 400)
  const mood: Mood = copyMood(DEFAULT_MOOD, { ...DEFAULT_MOOD })
  const target: Mood = copyMood(DEFAULT_MOOD, { ...DEFAULT_MOOD })
  const off = { x: -99999, y: -99999, z: 1 }
  const nw = {
    canvas: null, renderer: null, scene: new THREE.Scene(), camera, composer: null, layers: [] as never[],
    mood, target, damping: 4.5, shared, effects: null, sunNdc: new THREE.Vector2(0, 0.3), sunWorld: new THREE.Vector3(0, 1.4, -6),
    forceRender: false,
    addLayer() { return nw }, layer() { return undefined }, get tesserae() { return undefined },
    setTarget(m: Mood) { copyMood(m, target); copyMood(m, mood) }, snap() {}, resize() {}, update() {}, dispose() {},
    project() { return off },
  }
  return nw as unknown as World
}
