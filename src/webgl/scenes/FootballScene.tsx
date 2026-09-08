'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { damp, phase } from '../store'
import { COLORS, GLSL_HASH, GLSL_SHADE, type SceneProps } from './common'

/**
 * Football — a faceted ball that comes apart as you scroll and finds itself
 * again at the end.
 *
 * Every face carries its own centroid and barycentric coordinates, so the
 * vertex stage can push each panel out along its own axis (the explode) and
 * the fragment stage can ink the seams between panels without a second pass.
 * A hash on the centroid darkens a subset of faces, giving the black-panel
 * pattern of a classic ball without modelling a truncated icosahedron.
 */

const VERT = /* glsl */ `
attribute vec3 aCenter;
attribute vec3 aBary;
uniform float uExplode;
uniform float uTime;

varying vec3 vBary;
varying vec3 vN;
varying vec3 vV;
varying float vSeed;

${GLSL_HASH}

void main() {
  float seed = hash21(aCenter.xy * 13.7 + aCenter.z);
  vec3 dir = normalize(aCenter);

  // Each panel travels a different distance and tumbles slightly on the way.
  float push = uExplode * (0.35 + seed * 1.6);
  vec3 pos = position + dir * push;

  // Small per-panel jitter so the exploded state looks suspended, not frozen.
  pos += dir * sin(uTime * 1.3 + seed * 20.0) * 0.05 * uExplode;

  vBary = aBary;
  vSeed = seed;
  vec4 wp = modelMatrix * vec4(pos, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const FRAG = /* glsl */ `
precision highp float;
uniform vec3  uGreen;
uniform vec3  uVolt;
uniform float uOpacity;
uniform float uExplode;

varying vec3 vBary;
varying vec3 vN;
varying vec3 vV;
varying float vSeed;

${GLSL_SHADE}

void main() {
  vec3 n = normalize(vN);
  // Roughly a third of the panels go black, like the pentagons on a real ball.
  float dark = step(0.66, vSeed);
  vec3 base = mix(vec3(0.16), vec3(0.03), dark);
  vec3 col = shade(n, normalize(vV), base, uGreen, 2.6);

  // Seam ink: distance to the nearest edge in barycentric space.
  float edge = min(min(vBary.x, vBary.y), vBary.z);
  float w = fwidth(edge) * 1.6;
  float seam = 1.0 - smoothstep(0.0, w + 0.012, edge);
  col = mix(col, mix(uGreen, uVolt, vSeed), seam * (0.75 + uExplode * 0.25));

  gl_FragColor = vec4(col, uOpacity);
  #include <colorspace_fragment>
}
`

function buildBall(detail: number) {
  // IcosahedronGeometry is already non-indexed; only convert if that changes.
  const src = new THREE.IcosahedronGeometry(1.6, detail)
  const geo = src.index ? src.toNonIndexed() : src
  const pos = geo.attributes.position
  const count = pos.count
  const centers = new Float32Array(count * 3)
  const bary = new Float32Array(count * 3)
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  for (let i = 0; i < count; i += 3) {
    a.fromBufferAttribute(pos, i)
    b.fromBufferAttribute(pos, i + 1)
    c.fromBufferAttribute(pos, i + 2)
    const cx = (a.x + b.x + c.x) / 3
    const cy = (a.y + b.y + c.y) / 3
    const cz = (a.z + b.z + c.z) / 3
    for (let k = 0; k < 3; k++) {
      centers[(i + k) * 3] = cx
      centers[(i + k) * 3 + 1] = cy
      centers[(i + k) * 3 + 2] = cz
    }
    bary.set([1, 0, 0], i * 3)
    bary.set([0, 1, 0], (i + 1) * 3)
    bary.set([0, 0, 1], (i + 2) * 3)
  }
  geo.setAttribute('aCenter', new THREE.BufferAttribute(centers, 3))
  geo.setAttribute('aBary', new THREE.BufferAttribute(bary, 3))
  geo.computeVertexNormals()
  return geo
}

export default function FootballScene({ tier, reducedMotion }: SceneProps) {
  const mesh = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.ShaderMaterial>(null)
  const geometry = useMemo(() => buildBall(tier === 'low' ? 1 : 2), [tier])

  const uniforms = useMemo(
    () => ({
      uExplode: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uGreen: { value: COLORS.green.clone() },
      uVolt: { value: COLORS.volt.clone() },
    }),
    [],
  )

  const s = useRef({ opacity: 0, explode: 0, px: 0, py: 0 })

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const m = mesh.current
    const sm = mat.current
    if (!m || !sm) return
    const st = s.current
    const t = state.clock.elapsedTime

    st.opacity = damp(st.opacity, phase.entered ? 1 : 0, 3, dt)
    st.px = damp(st.px, phase.pointer.x, 3, dt)
    st.py = damp(st.py, phase.pointer.y, 3, dt)

    // Comes apart across the hero, hangs open through the story, closes at the
    // foot of the page so the CTA sits next to a whole ball again.
    const open = Math.min(1, phase.hero * 1.4)
    const close = Math.max(0, (phase.page - 0.72) / 0.22)
    const target = reducedMotion ? 0 : Math.max(0, open - close) + Math.abs(phase.velocity) * 0.25
    st.explode = damp(st.explode, target, 3, dt)

    m.rotation.y = t * (reducedMotion ? 0.05 : 0.22) + st.px * 0.4 + phase.page * 2.0
    m.rotation.x = Math.sin(t * 0.3) * 0.15 + st.py * 0.3
    m.position.y = Math.sin(t * 0.8) * 0.08 - phase.hero * 0.3
    m.position.z = -phase.hero * 1.5
    m.visible = st.opacity > 0.01

    sm.uniforms.uExplode.value = st.explode
    sm.uniforms.uTime.value = t
    sm.uniforms.uOpacity.value = st.opacity
  })

  return (
    <mesh ref={mesh} geometry={geometry} frustumCulled={false}>
      <shaderMaterial ref={mat} vertexShader={VERT} fragmentShader={FRAG} uniforms={uniforms} transparent side={THREE.DoubleSide} />
    </mesh>
  )
}

export const footballCamera = { base: [0, 0.2, 6.2] as const, scroll: [0, 0.4, -1.8] as const, fov: 42, lookY: 0 }
