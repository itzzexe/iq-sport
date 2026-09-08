'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SIMPLEX_3D } from '../glsl'
import { damp, phase } from '../store'
import { COLORS, GLSL_HASH, type SceneProps } from './common'

/**
 * Padel — the perforated face of the racket, blown up into a field of
 * instanced spheres. The sheet breathes with a travelling wave, the pointer
 * pushes a dent into it, and a single ball orbits above on a figure-eight.
 * One draw call for the whole grid: displacement lives in the vertex stage.
 */

const VERT = /* glsl */ `
attribute vec3 aGrid;   // x: column 0..1, y: row 0..1, z: seed
uniform float uTime;
uniform float uWave;
uniform vec2  uPointer;
uniform float uTilt;

varying float vLift;
varying float vSeed;
varying vec3  vN;
varying vec3  vV;

${SIMPLEX_3D}

void main() {
  vec3 ipos = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;

  float t = uTime;
  float lift = 0.0;
  lift += sin(aGrid.x * 9.0 + t * 1.6) * 0.5;
  lift += sin(aGrid.y * 7.0 - t * 1.1) * 0.35;
  lift += snoise(vec3(aGrid.xy * 3.5, t * 0.35)) * 0.6;

  // Pointer dent: the sheet dips toward the cursor.
  vec2 g = aGrid.xy * 2.0 - 1.0;
  float pd = distance(g, uPointer * vec2(1.0, 0.7));
  lift -= exp(-pd * pd * 4.5) * 1.4;

  lift *= uWave;

  // Spheres near the dent swell slightly, so the dent reads as pressure.
  float swell = 1.0 + exp(-pd * pd * 4.5) * 0.6;

  vec3 pos = position * swell;
  vec3 world = ipos + vec3(0.0, 0.0, lift) + pos;

  vLift = lift;
  vSeed = aGrid.z;
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(world, 1.0);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const FRAG = /* glsl */ `
precision highp float;
uniform float uOpacity;
uniform vec3 uGreen;
uniform vec3 uVolt;
uniform vec3 uNavy;

varying float vLift;
varying float vSeed;
varying vec3  vN;
varying vec3  vV;

${GLSL_HASH}

void main() {
  float facing = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
  float fres = pow(1.0 - facing, 2.0);

  // Height → colour: troughs sink into navy, crests glow volt.
  float h = clamp(vLift * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = mix(uNavy * 0.6, uGreen, smoothstep(0.25, 0.8, h));
  col = mix(col, uVolt, smoothstep(0.8, 1.05, h));
  col *= 0.35 + facing * 0.75;
  col += uGreen * fres * 0.5;
  // A few spheres are permanently brighter — the sheet is never uniform.
  col += uVolt * step(0.965, hash11(vSeed)) * 0.6;

  gl_FragColor = vec4(col, uOpacity);
  #include <colorspace_fragment>
}
`

export default function PadelScene({ tier, reducedMotion }: SceneProps) {
  const group = useRef<THREE.Group>(null)
  const ball = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.ShaderMaterial>(null)

  const cols = tier === 'high' ? 72 : tier === 'mid' ? 52 : 34
  const rows = Math.round(cols * 0.62)
  const count = cols * rows

  const geometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(0.075, tier === 'high' ? 12 : 8, tier === 'high' ? 10 : 6)
    const grid = new Float32Array(count * 3)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c
        grid[i * 3] = c / (cols - 1)
        grid[i * 3 + 1] = r / (rows - 1)
        grid[i * 3 + 2] = Math.random() * 100
      }
    }
    geometry.setAttribute('aGrid', new THREE.InstancedBufferAttribute(grid, 3))
    return geometry
  }, [cols, rows, count, tier])

  const meshRef = useRef<THREE.InstancedMesh>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWave: { value: 0 },
      uTilt: { value: 0 },
      uOpacity: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uGreen: { value: COLORS.green.clone() },
      uVolt: { value: COLORS.volt.clone() },
      uNavy: { value: COLORS.navy.clone() },
    }),
    [],
  )

  const s = useRef({ opacity: 0, wave: 0, px: 0, py: 0, placed: false })

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const im = meshRef.current
    const m = mat.current
    const g = group.current
    if (!im || !m || !g) return
    const st = s.current
    const t = state.clock.elapsedTime

    if (!st.placed) {
      const dummy = new THREE.Object3D()
      const w = 11
      const h = w * (rows / cols)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dummy.position.set((c / (cols - 1) - 0.5) * w, (r / (rows - 1) - 0.5) * h, 0)
          dummy.updateMatrix()
          im.setMatrixAt(r * cols + c, dummy.matrix)
        }
      }
      im.instanceMatrix.needsUpdate = true
      st.placed = true
    }

    st.opacity = damp(st.opacity, phase.entered ? 1 : 0, 3, dt)
    st.wave = damp(st.wave, reducedMotion ? 0.25 : 0.7 + phase.hero * 0.6 + Math.abs(phase.velocity) * 0.5, 3, dt)
    st.px = damp(st.px, phase.pointer.x, 4, dt)
    st.py = damp(st.py, phase.pointer.y, 4, dt)

    m.uniforms.uTime.value = reducedMotion ? t * 0.25 : t
    m.uniforms.uWave.value = st.wave
    m.uniforms.uOpacity.value = st.opacity
    m.uniforms.uPointer.value.set(st.px, st.py)

    // Staged as a floor of dots receding under the copy rather than a wall
    // in front of it: tipped well back, pushed into depth, and tipping further
    // as the page scrolls — a racket face turning away after the strike.
    g.rotation.x = -1.05 - phase.hero * 0.35 + st.py * 0.05
    g.rotation.z = Math.sin(t * 0.12) * 0.04 + st.px * 0.04
    g.position.y = 0.9 + phase.hero * 1.2
    g.position.z = -4.5 - phase.hero * 3
    g.visible = st.opacity > 0.01

    // Ball on a figure-eight above the sheet.
    if (ball.current) {
      const k = reducedMotion ? 0.15 : 0.55
      ball.current.position.set(Math.sin(t * k) * 3.6, 1.2 + Math.abs(Math.sin(t * k * 2)) * 1.4, Math.cos(t * k * 2) * 1.2 + 0.4)
      ball.current.visible = st.opacity > 0.01
    }
  })

  return (
    <group ref={group}>
      <instancedMesh ref={meshRef} args={[geometry, undefined, count]} frustumCulled={false}>
        <shaderMaterial ref={mat} vertexShader={VERT} fragmentShader={FRAG} uniforms={uniforms} transparent />
      </instancedMesh>
      <mesh ref={ball}>
        <sphereGeometry args={[0.22, 24, 20]} />
        <meshBasicMaterial color={COLORS.volt} />
      </mesh>
    </group>
  )
}

export const padelCamera = { base: [0, 1.4, 7.5] as const, scroll: [0, 1.6, -1] as const, fov: 46, lookY: 0.4 }
