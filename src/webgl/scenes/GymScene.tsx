'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { damp, phase } from '../store'
import { COLORS, GLSL_SHADE, drive, type SceneProps } from './common'

/**
 * Gym — a loaded bar. Five plates on each side, matte black with a green rim,
 * that pull apart along the bar as the page scrolls and slam back together
 * when it stops. The whole rig breathes on a slow heartbeat so it never sits
 * dead-still, and the pointer tips it in space.
 */

const VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
varying vec3 vP;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  vP = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const FRAG = /* glsl */ `
precision highp float;
uniform vec3  uBase;
uniform vec3  uRim;
uniform float uOpacity;
uniform float uPulse;
varying vec3 vN;
varying vec3 vV;
varying vec3 vP;

${GLSL_SHADE}

void main() {
  vec3 n = normalize(vN);
  vec3 col = shade(n, normalize(vV), uBase, uRim, 3.2);
  // Machined grooves around the plate: a fine ring pattern in the radial direction.
  float r = length(vP.yz);
  float groove = smoothstep(0.35, 0.5, abs(sin(r * 28.0)));
  col *= 0.85 + groove * 0.15;
  col += uRim * uPulse * 0.12;
  gl_FragColor = vec4(col, uOpacity);
  #include <colorspace_fragment>
}
`

const PLATES = [
  { r: 1.25, w: 0.26 },
  { r: 1.25, w: 0.26 },
  { r: 1.0, w: 0.2 },
  { r: 0.8, w: 0.16 },
  { r: 0.6, w: 0.14 },
]

export default function GymScene({ tier, reducedMotion, progress }: SceneProps) {
  const group = useRef<THREE.Group>(null)
  const left = useRef<THREE.Group>(null)
  const right = useRef<THREE.Group>(null)
  const mats = useRef<THREE.ShaderMaterial[]>([])

  const seg = tier === 'high' ? 96 : tier === 'mid' ? 64 : 40

  const plateGeos = useMemo(
    () =>
      PLATES.map(({ r, w }) => {
        // A torus with a fat tube reads as a rounded plate; a cylinder reads as a coin.
        const g = new THREE.TorusGeometry(r - 0.28, 0.28, 18, seg)
        g.scale(1, 1, w / 0.56)
        g.rotateY(Math.PI / 2)
        return g
      }),
    [seg],
  )
  const barGeo = useMemo(() => new THREE.CylinderGeometry(0.09, 0.09, 9, 24).rotateZ(Math.PI / 2), [])
  const collarGeo = useMemo(() => new THREE.CylinderGeometry(0.17, 0.17, 0.12, 32).rotateZ(Math.PI / 2), [])

  const makeUniforms = () => ({
    uBase: { value: new THREE.Color('#141414') },
    uRim: { value: COLORS.green.clone() },
    uOpacity: { value: 0 },
    uPulse: { value: 0 },
  })
  const uniformSets = useMemo(() => Array.from({ length: PLATES.length * 2 + 3 }, makeUniforms), [])

  const s = useRef({ opacity: 0, spread: 0, px: 0, py: 0 })

  useFrame((state, delta) => {
    const { hero, page, weight } = drive(progress)
    const dt = Math.min(delta, 1 / 30)
    const g = group.current
    if (!g || !left.current || !right.current) return
    const st = s.current
    const t = state.clock.elapsedTime

    st.opacity = damp(st.opacity, phase.entered ? weight : 0, 3, dt)
    // Spread with scroll, snap back when the reader pauses.
    const targetSpread = reducedMotion ? 0 : Math.min(1, hero * 1.6) * 0.9 + Math.abs(phase.velocity) * 0.5
    st.spread = damp(st.spread, targetSpread, targetSpread > st.spread ? 3.5 : 6, dt)
    st.px = damp(st.px, phase.pointer.x, 3, dt)
    st.py = damp(st.py, phase.pointer.y, 3, dt)

    // Heartbeat: two quick beats then rest, on a ~1.1 s cycle.
    const beat = reducedMotion ? 0 : Math.max(0, Math.sin(t * 5.7)) ** 12 * 0.6 + Math.max(0, Math.sin(t * 5.7 - 1.1)) ** 12 * 0.35
    const breathe = 1 + beat * 0.025

    g.rotation.y = 0.55 + hero * 1.1 + st.px * 0.25 + Math.sin(t * 0.2) * 0.05
    g.rotation.x = -0.12 + st.py * 0.15 + Math.sin(t * 0.17) * 0.03
    g.rotation.z = 0.08 - hero * 0.25
    g.position.z = -hero * 2.5
    g.scale.setScalar(breathe)
    g.visible = st.opacity > 0.01

    // Plates slide outward, the small ones furthest — like a rack being loaded.
    const place = (side: THREE.Group, dir: number) => {
      let x = 0.7
      side.children.forEach((child, i) => {
        const w = PLATES[i]?.w ?? 0.14
        child.position.x = dir * (x + w / 2 + st.spread * (0.35 + i * 0.28))
        x += w + 0.02
      })
    }
    place(left.current, -1)
    place(right.current, 1)

    // Materials are collected once from the tree rather than through ref
    // callbacks, which re-fire on every render and would double-count.
    if (mats.current.length === 0) {
      g.traverse((o) => {
        const mm = (o as THREE.Mesh).material
        if (mm instanceof THREE.ShaderMaterial) mats.current.push(mm)
      })
    }
    for (const m of mats.current) {
      m.uniforms.uOpacity.value = st.opacity
      m.uniforms.uPulse.value = beat
    }
  })

  return (
    <group ref={group} position={[0, 0.1, -1]}>
      <mesh geometry={barGeo}>
        <shaderMaterial vertexShader={VERT} fragmentShader={FRAG} uniforms={uniformSets[0]} transparent />
      </mesh>
      <mesh geometry={collarGeo} position={[-0.62, 0, 0]}>
        <shaderMaterial vertexShader={VERT} fragmentShader={FRAG} uniforms={uniformSets[1]} transparent />
      </mesh>
      <mesh geometry={collarGeo} position={[0.62, 0, 0]}>
        <shaderMaterial vertexShader={VERT} fragmentShader={FRAG} uniforms={uniformSets[2]} transparent />
      </mesh>
      <group ref={left}>
        {plateGeos.map((geo, i) => (
          <mesh key={`l${i}`} geometry={geo}>
            <shaderMaterial vertexShader={VERT} fragmentShader={FRAG} uniforms={uniformSets[3 + i]} transparent />
          </mesh>
        ))}
      </group>
      <group ref={right}>
        {plateGeos.map((geo, i) => (
          <mesh key={`r${i}`} geometry={geo}>
            <shaderMaterial vertexShader={VERT} fragmentShader={FRAG} uniforms={uniformSets[3 + PLATES.length + i]} transparent />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export const gymCamera = { base: [0, 0.3, 7.5] as const, scroll: [0, 0.6, -1.2] as const, fov: 42, lookY: 0 }
