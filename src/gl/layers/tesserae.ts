import * as THREE from 'three'
import type { Layer, LayerCtx } from '../../engine/gl'
import type { Mood } from '../../engine/mood'
import type { Shared } from '../../engine/chapter'
import { buildFormations, drawWriteMask, FORMATION_COUNT, MASK_SIZE, PALETTE, type FormationData } from './tesserae-formations'

/**
 * TesseraeLayer — THE signature system (DESIGN-BIBLE §8.5): one InstancedMesh of 6,000 (1,500 mobile) mosaic
 * tiles that is, in story order, the hero sun disc (0) → the Mediterranean (1) → the fist (2) → the open hand (3)
 * → the sunrise path (4) → the dawn disc (5). `mood.tessForm` picks the formation (fractional = morph between
 * neighbours; the 2→3 morph staggers by finger group); `mood.tess` assembles (0 scattered → 1 locked) with the
 * per-tile stagger; `tessSpread` scales the scatter shell; `tessGlint` the specular + the pointer-driven sweep;
 * `tessGold` how much of the gold stays bright. Reserved params: p1 = write amount (tiles under the current
 * mask flip on a hinge to press-ink), p2 = mask index (0 "SUN", 1 "XI"), p3 = shatter gravity (tiles fall,
 * drift with the water and sink below seaY).
 *
 * Loose tiles (tess < 1) are distant glints, never confetti: the scatter shell is r 14–20 × spread around the hero
 * field and every shell point is held ≥ 6 units from the camera; scattered tiles are cut ×.6 and their alpha is
 * gated by smoothstep(0, .35, tess) so tess 0 shows nothing regardless of tessSpread (Ch 11 p 1, 12, 13).
 * Surplus instances (tint 0) never travel to a centroid — see the morph block. Formation 1 is a slab tilted 25°
 * about its x-axis (uTilt) so the Mediterranean outline reads from the low Ch 04/05 camera.
 *
 * One draw call, one material, no per-frame allocations. Renders before the sun (renderOrder −60) and writes
 * depth so the additive sun/star is occluded behind tiles and shows through the grout.
 */
export class TesseraeLayer implements Layer {
  name = 'tesserae'
  private mesh!: THREE.InstancedMesh
  private mat!: THREE.ShaderMaterial
  private data!: FormationData
  private maskData: Uint8Array[] = []
  private masks: THREE.DataTexture[] = []
  private reduced = false
  private touch = false
  // reused vectors
  private vRight = new THREE.Vector3()
  private vUp = new THREE.Vector3()
  private vFwd = new THREE.Vector3()
  private sweepTouch = 0

  /** World anchors of the formations (palm centre, Malta tile, disc centres) for chapters that pin DOM to them. */
  get anchors() { return this.data.anchors }

  init(ctx: LayerCtx) {
    const N = ctx.shared.mobile ? 1500 : 6000
    this.reduced = ctx.shared.reduced
    this.touch = ctx.shared.touch
    const d = (this.data = buildFormations(N, ctx.shared.mobile))

    const geo = new THREE.PlaneGeometry(1, 1)
    const names = ['aT0', 'aT1', 'aT2', 'aT3', 'aT4', 'aT5']
    for (let f = 0; f < FORMATION_COUNT; f++) geo.setAttribute(names[f], new THREE.InstancedBufferAttribute(d.targets[f], 3))
    geo.setAttribute('aScatter', new THREE.InstancedBufferAttribute(d.scatter, 3))
    geo.setAttribute('aMeta', new THREE.InstancedBufferAttribute(d.meta, 4))
    geo.setAttribute('aDiscUV', new THREE.InstancedBufferAttribute(d.discUV, 2))

    // write masks: 64×64 "SUN" and "XI" — drawn now (fallback face if Fraunces is not ready) and redrawn once fonts land
    for (const word of ['SUN', 'XI']) {
      const buf = new Uint8Array(MASK_SIZE * MASK_SIZE * 4)
      drawWriteMask(word, buf)
      const tex = new THREE.DataTexture(buf, MASK_SIZE, MASK_SIZE, THREE.RGBAFormat, THREE.UnsignedByteType)
      tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = false
      tex.flipY = false      // row 0 = canvas top = disc top (discUV.y = 0 at the top of the disc)
      tex.needsUpdate = true
      this.maskData.push(buf); this.masks.push(tex)
    }
    this.redrawMasksWhenFontsReady()

    const pal = PALETTE.map(c => new THREE.Vector3(c[0], c[1], c[2]))
    const anchors = Array.from({ length: FORMATION_COUNT }, () => new THREE.Vector3())

    this.mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: true, depthTest: true, side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 }, uTess: { value: 0 }, uForm: { value: 0 }, uSpread: { value: 1 },
        uGlint: { value: 0.5 }, uGold: { value: 0.5 },
        uP1: { value: 0 }, uP2: { value: 0 }, uP3: { value: 0 },
        uSeaY: { value: -1.2 },
        uSun: { value: new THREE.Vector3() }, uSunVisible: { value: 1 }, uSunHeat: { value: 1 },
        uLamp: { value: new THREE.Vector3() }, uCam: { value: new THREE.Vector3() },
        uSweep: { value: 0 }, uFlow: { value: new THREE.Vector3(0.7, 0, 0.35) },
        uAnchor: { value: anchors }, uScale: { value: d.scale }, uFlat: { value: d.flat }, uTilt: { value: d.tilt }, uPal: { value: pal },
        uMaskA: { value: this.masks[0] }, uMaskB: { value: this.masks[1] },
        uWarmth: { value: 0.35 },
      },
      vertexShader: /* glsl */ `
        precision highp float;
        attribute vec3 aT0, aT1, aT2, aT3, aT4, aT5;
        attribute vec3 aScatter;
        attribute vec4 aMeta;      // seed, group (+8 = Malta), tintA (forms 0–2, base 16), tintB (forms 3–5)
        attribute vec2 aDiscUV;
        uniform float uTime, uTess, uForm, uSpread, uP1, uP2, uP3, uSeaY, uGold;
        uniform vec3 uAnchor[6];
        uniform float uScale[6];
        uniform float uFlat[6];
        uniform float uTilt[6];
        uniform vec3 uPal[10];
        uniform vec3 uFlow;
        uniform vec3 uCam;
        uniform sampler2D uMaskA, uMaskB;
        varying vec3 vCol; varying vec3 vN; varying vec3 vW; varying vec2 vUv; varying vec2 vNdc;
        varying vec4 vF;           // gold, alpha, malta pulse weight, write amount
        varying float vSeed; varying float vLock;

        mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1.,0.,0., 0.,c,s, 0.,-s,c); }
        mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0.,-s, 0.,1.,0., s,0.,c); }
        mat3 rotZ(float a){ float c=cos(a), s=sin(a); return mat3(c,s,0., -s,c,0., 0.,0.,1.); }
        float digit(float packed, float k){ return mod(floor(packed / pow(16.0, k) + 0.01), 16.0); }

        void form(int i, out vec3 t, out float tint, out float fl, out float tl, out float sc, out vec3 an){
          if (i == 0)      { t = aT0; tint = digit(aMeta.z, 0.0); fl = uFlat[0]; tl = uTilt[0]; sc = uScale[0]; an = uAnchor[0]; }
          else if (i == 1) { t = aT1; tint = digit(aMeta.z, 1.0); fl = uFlat[1]; tl = uTilt[1]; sc = uScale[1]; an = uAnchor[1]; }
          else if (i == 2) { t = aT2; tint = digit(aMeta.z, 2.0); fl = uFlat[2]; tl = uTilt[2]; sc = uScale[2]; an = uAnchor[2]; }
          else if (i == 3) { t = aT3; tint = digit(aMeta.w, 0.0); fl = uFlat[3]; tl = uTilt[3]; sc = uScale[3]; an = uAnchor[3]; }
          else if (i == 4) { t = aT4; tint = digit(aMeta.w, 1.0); fl = uFlat[4]; tl = uTilt[4]; sc = uScale[4]; an = uAnchor[4]; }
          else             { t = aT5; tint = digit(aMeta.w, 2.0); fl = uFlat[5]; tl = uTilt[5]; sc = uScale[5]; an = uAnchor[5]; }
        }

        void main(){
          float seed = aMeta.x;
          vSeed = seed;
          float malta = step(7.5, aMeta.y);
          float group = aMeta.y - 8.0 * malta;

          // ── formation blend (story order, fractional morph) ──
          float f = clamp(uForm, 0.0, 5.0);
          int i0 = int(floor(min(f, 4.999)));
          float ft = f - float(i0);
          vec3 tA, tB, anA, anB; float tintA, tintB, flA, flB, tlA, tlB, scA, scB;
          form(i0, tA, tintA, flA, tlA, scA, anA);
          form(i0 + 1, tB, tintB, flB, tlB, scB, anB);
          // fist → open hand unfolds one finger group at a time (palm first, thumb last)
          float delay = (i0 == 2) ? group * 0.12 : 0.0;
          float tm = smoothstep(0.0, 1.0, clamp((ft - delay) / (1.0 - delay), 0.0, 1.0));
          float visA = step(0.5, tintA), visB = step(0.5, tintB);
          vec3 pA = tA + anA, pB = tB + anB;
          // Surplus instances (a formation with fewer cells than N parks them at its centroid with tint 0) are never
          // seen: a tile the next formation has no cell for stays in place and fades out over the first part of the
          // morph; one the previous formation lacked fades in, in place, over the last part. Neither travels to a
          // centroid, so no block of tiles can form mid-morph, and at every integer form only real cells are lit.
          float onlyA = visA * (1.0 - visB), onlyB = visB * (1.0 - visA);
          if (onlyA > 0.5) { pB = pA; tintB = tintA; flB = flA; tlB = tlA; scB = scA; }
          if (onlyB > 0.5) { pA = pB; tintA = tintB; flA = flB; tlA = tlB; scA = scB; }
          float fadeOut = 1.0 - smoothstep(0.0, 0.45, tm * (1.0 + seed * 0.6));
          float fadeIn  = smoothstep(0.55, 1.0, 1.0 - (1.0 - tm) * (1.0 + seed * 0.6));
          float vis = visA * visB + onlyA * fadeOut + onlyB * fadeIn;
          vec3 target = mix(pA, pB, tm);
          float lie = mix(flA, flB, tm);
          float tilt = mix(tlA, tlB, tm);
          float scale = mix(scA, scB, tm);
          vec3 colA = uPal[int(tintA)], colB = uPal[int(tintB)];
          vec3 col = mix(colA, colB, tm);
          float goldA = step(0.5, tintA) * step(tintA, 3.5), goldB = step(0.5, tintB) * step(tintB, 3.5);
          float gold = mix(goldA, goldB, tm);
          // tessGold: beyond the threshold, gold tiles dim to gold-deep
          float dimGold = gold * step(uGold, fract(seed * 91.7));
          col = mix(col, uPal[3], dimGold * 0.85);
          float wIsland = (i0 == 0 ? ft : 0.0) + (i0 == 1 ? 1.0 - ft : 0.0);
          float wDisc   = (i0 == 0 ? 1.0 - ft : 0.0) + (i0 == 4 ? ft : 0.0);

          // ── assembly with per-tile stagger ──
          float t = smoothstep(0.0, 1.0, clamp(uTess * 1.15 - seed * 0.15, 0.0, 1.0));
          float drift = 1.0 - t;
          // scatter: a far polar shell (r 14–20 × spread) around the hero field for billboards — loose tiles are distant
          // glints, never confetti: whatever the spread, a shell point is pushed to ≥ 6–9 units from the camera
          // an assembling field draws its tiles from a NEAR shell (they must read as a swarm converging into the
          // figure); an idle field (tess ≈ 0) keeps them far away, where they are distant glints, never confetti
          float near = mix(1.0, 0.26, smoothstep(0.05, 0.75, uTess));
          vec3 shell = vec3(0.0, 0.2, -4.0) + aScatter * uSpread * near;
          vec3 dc = shell - uCam;
          float dl = length(dc);
          shell = uCam + dc * (max(dl, 6.0 + seed * 3.0) / max(dl, 0.0001));
          // the flat pavements rise from under the water (relative to the sea, so a lifted slab never hovers loose)
          vec3 under = vec3(target.x, min(target.y, uSeaY), target.z) + vec3((seed - 0.5) * 1.6, -(1.2 + seed * 2.0), (fract(seed * 7.31) - 0.5) * 1.6) * uSpread;
          vec3 sc = mix(shell, under, lie);
          sc += vec3(sin(uTime * 0.3 + seed * 20.0), cos(uTime * 0.25 + seed * 13.0), sin(uTime * 0.2 + seed * 9.0)) * 0.25 * drift;
          // a shatter holds the tiles in the image (whatever tess says) and lets gravity take them
          float hold = smoothstep(0.0, 0.5, uP3);
          float tEff = max(t, hold);
          vec3 centre = mix(sc, target, tEff);
          // loose tiles are cut small; they only reach full size once laid
          scale *= mix(0.6, 1.0, tEff);

          // ── shatter: gravity below the sea, drifting with the water ──
          float fall = pow(uP3, 1.6);
          float g = fall * (2.5 + seed * 3.0);
          centre.y -= g;
          centre += uFlow * fall * (0.6 + seed * 1.2) + vec3(sin(uTime * 0.8 + seed * 30.0), 0.0, cos(uTime * 0.7 + seed * 17.0)) * uP3 * 0.15;

          // ── the write: tiles under the mask flip to ink on a hinge (disc formations only) ──
          float mA = texture2D(uMaskA, aDiscUV).r, mB = texture2D(uMaskB, aDiscUV).r;
          float mval = mix(mA, mB, clamp(uP2, 0.0, 1.0));
          float wr = clamp((uP1 - seed * 0.25) / 0.75, 0.0, 1.0) * step(0.5, mval) * wDisc;
          float hinge = wr * 3.14159265;

          // ── tile orientation: Ravenna tilt ±7°, hinge, tumble while loose or falling ──
          float wob = drift * 3.0 + uP3 * 2.0;
          mat3 R = rotY((seed - 0.5) * 0.244) * rotX((fract(seed * 7.0) - 0.5) * 0.244) * rotZ((fract(seed * 3.3) - 0.5) * 0.12);
          R = rotY(seed * 6.28 * wob + uTime * 0.2 * (drift + uP3)) * rotX(seed * 3.0 * wob + drift * 0.8) * R;
          R = R * rotX(hinge);
          vec3 p = R * vec3(position.xy, 0.0);
          vec3 n = R * vec3(0.0, 0.0, 1.0);
          // billboard basis (camera axes in world) vs flat on the water (local y → −z, normal → +y), the flat basis
          // tilted about x by the formation's uTilt (the island slab: far edge lifted, face turned toward the camera)
          vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
          vec3 up    = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
          vec3 fwd   = vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]);
          vec3 offB = right * p.x + up * p.y + fwd * p.z;
          vec3 nB   = right * n.x + up * n.y + fwd * n.z;
          mat3 T = rotX(tilt);
          vec3 offF = T * vec3(p.x, p.z, -p.y);
          vec3 nF   = T * vec3(n.x, n.z, -n.y);
          vec3 off = mix(offB, offF, lie) * scale;
          vN = normalize(mix(nB, nF, lie));
          vec3 wp = centre + off;
          vW = wp;
          vUv = uv;
          vCol = mix(col, uPal[8], smoothstep(0.45, 0.55, wr));

          // ── alpha: invisible surplus, loose tiles faint (and gone at tess 0, whatever the spread), sinking tiles
          //    fade below the water; a shatter's held/falling tiles keep their alpha through the sink ──
          float sink = smoothstep(uSeaY - 0.7, uSeaY - 0.02, centre.y);
          float loose = mix(smoothstep(0.0, 0.35, uTess), 1.0, tEff);
          float a = vis * (0.55 + 0.45 * tEff) * loose * sink;
          vF = vec4(gold * (1.0 - smoothstep(0.45, 0.55, wr)), a, malta * wIsland, wr);
          vLock = tEff * (1.0 - uP3);

          vec4 clip = projectionMatrix * viewMatrix * vec4(wp, 1.0);
          vNdc = clip.xy / max(clip.w, 0.0001);
          gl_Position = clip;
        }`,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform vec3 uSun, uLamp, uCam; uniform float uGlint, uSunVisible, uSunHeat, uSweep, uTime, uWarmth;
        varying vec3 vCol; varying vec3 vN; varying vec3 vW; varying vec2 vUv; varying vec2 vNdc; varying vec4 vF; varying float vSeed; varying float vLock;
        const vec3 GROUT = vec3(0.0032, 0.0037, 0.0075);   // #0B0A09-dark press-ink grout, linear
        void main(){
          float a = vF.y;
          if (a < 0.02) discard;
          // the quad is one full pitch; the tessera face is the inner 85%, the outer band is grout
          vec2 fuv = (vUv - 0.075) / 0.85;
          float inFace = step(0.0, fuv.x) * step(fuv.x, 1.0) * step(0.0, fuv.y) * step(fuv.y, 1.0);
          if (inFace < 0.5) {
            float ga = a * 0.82 * vLock;                       // grout only exists once the tile is laid
            if (ga < 0.02) discard;
            gl_FragColor = vec4(GROUT, ga);
            return;
          }
          vec3 N = normalize(vN);
          if (!gl_FrontFacing) N = -N;
          vec3 V = normalize(uCam - vW);
          vec3 Ls = normalize(uSun - vW);
          vec3 Ll = normalize(uLamp - vW);
          // the sun (when it is up) and the lamp at the pointer: wrapped diffuse so shadow sides stay readable
          float dS = max(dot(N, Ls), 0.0) * uSunVisible;
          float dL = max(dot(N, Ll), 0.0);
          float back = max(-dot(N, Ls), 0.0) * uSunVisible * uSunHeat;    // light bleeding round tiles the sun is behind
          float diff = 0.42 + 0.42 * dS + 0.28 * dL + 0.12 * back;
          vec3 H1 = normalize(Ls + V), H2 = normalize(Ll + V);
          float specK = uGlint * mix(0.5, 1.6, vF.x);
          float spec = (pow(max(dot(N, H1), 0.0), 60.0) * uSunVisible + pow(max(dot(N, H2), 0.0), 60.0) * 0.55) * specK;
          // per-tile luminance ±7% (no two tesserae are cut alike)
          float lum = 1.0 + (fract(vSeed * 43.7) - 0.5) * 0.14;
          vec3 col = vCol * diff * lum;
          // the sweep glint: a diagonal band that crosses the field with the pointer (or the scroll on touch)
          float band = abs(vNdc.x * 0.8 + vNdc.y * 0.35 - uSweep);
          float sw = smoothstep(0.045, 0.0, band) * uGlint * (0.35 + 0.65 * vF.x) * 0.5;
          vec3 warm = mix(vec3(1.0, 0.92, 0.72), vec3(1.0, 0.82, 0.45), vF.x);
          col += warm * (spec + sw);
          // Malta pulses gold
          col += vec3(1.0, 0.75, 0.35) * vF.z * (0.45 + 0.45 * sin(uTime * 2.4)) * (0.6 + uGlint);
          // bevel: the setter's edge, darker toward the rim of every tessera
          float e = min(min(fuv.x, 1.0 - fuv.x), min(fuv.y, 1.0 - fuv.y));
          col *= 1.0 - 0.15 * (1.0 - smoothstep(0.0, 0.14, e));
          gl_FragColor = vec4(col, a);
        }`,
    })
    this.mesh = new THREE.InstancedMesh(geo, this.mat, N)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = -60
    this.mesh.position.set(0, 0, 0)
    ctx.scene.add(this.mesh)
  }

  private redrawMasksWhenFontsReady() {
    if (typeof document === 'undefined' || !('fonts' in document)) return
    const redraw = () => {
      for (let i = 0; i < 2; i++) {
        if (drawWriteMask(i === 0 ? 'SUN' : 'XI', this.maskData[i])) this.masks[i].needsUpdate = true
      }
    }
    document.fonts.load('320 40px Fraunces').then(redraw).catch(() => {})
    document.fonts.ready.then(redraw).catch(() => {})
  }

  update(m: Mood, s: Shared, ctx: LayerCtx) {
    const u = this.mat.uniforms
    u.uTime.value = this.reduced ? 0 : s.time
    u.uTess.value = m.tess; u.uForm.value = m.tessForm; u.uSpread.value = m.tessSpread
    u.uGlint.value = m.tessGlint; u.uGold.value = m.tessGold; u.uWarmth.value = m.warmth
    u.uP1.value = m.p1; u.uP2.value = m.p2; u.uP3.value = m.p3
    u.uSeaY.value = m.seaY
    u.uSunVisible.value = m.sunVisible; u.uSunHeat.value = m.sunHeat
    ;(u.uSun.value as THREE.Vector3).set(m.sunX, m.sunY, m.sunZ)
    // live anchors: the island on the water; the sunrise path and the dawn disc follow the sun
    const an = u.uAnchor.value as THREE.Vector3[]
    an[1].set(0, m.seaY, 0)
    an[4].set(m.sunX, m.seaY, m.sunZ)
    an[5].set(m.sunX, m.sunY, m.sunZ)
    // the lamp: the pointer, hung a little above and beside the camera
    const cam = ctx.camera
    ;(u.uCam.value as THREE.Vector3).copy(cam.position)
    this.vRight.setFromMatrixColumn(cam.matrixWorld, 0)
    this.vUp.setFromMatrixColumn(cam.matrixWorld, 1)
    this.vFwd.setFromMatrixColumn(cam.matrixWorld, 2)
    const lamp = u.uLamp.value as THREE.Vector3
    lamp.copy(cam.position)
      .addScaledVector(this.vRight, s.mouse.x * 3.5)
      .addScaledVector(this.vUp, 1.8 + s.mouse.y * 2.0)
      .addScaledVector(this.vFwd, -1.0)
    // the sweep: pointer x on desktop; on touch it rides the scroll
    if (this.touch) { this.sweepTouch = ((s.scrollProgress * 40) % 2.6) - 1.3; u.uSweep.value = this.sweepTouch }
    else u.uSweep.value = s.mouse.x * 1.15
    // tess 0 is invisible by construction (loose alpha → 0) unless a shatter is holding/dropping the tiles
    this.mesh.visible = m.tess > 0.001 || m.p3 > 0.001
  }

  dispose() {
    this.mesh.geometry.dispose(); this.mat.dispose()
    for (const t of this.masks) t.dispose()
  }
}
