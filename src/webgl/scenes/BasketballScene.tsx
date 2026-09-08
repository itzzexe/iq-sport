'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { damp, phase } from '../store'
import { COLORS, GLSL_SHADE, type SceneProps } from './common'

/**
 * Basketball — the one page that uses the palette's orange.
 *
 * The seams are drawn analytically on the sphere's normal (two great circles
 * plus two offset rings), so the ball can be any resolution and the lines stay
 * crisp. It bounces with squash-and-stretch, and each landing fires an
 * expanding ring on the floor plane. Scroll orbits the camera around it.
 */

const BALL_VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
varying vec3 vObj;
void main() {
  vObj = normalize(position);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const BALL_FRAG = /* glsl */ `
precision highp float;
uniform vec3  uOrange;
uniform vec3  uGreen;
uniform float uOpacity;
varying vec3 vN;
varying vec3 vV;
varying vec3 vObj;

${GLSL_SHADE}

float seam(float d, float w) { return 1.0 - smoothstep(0.0, w, abs(d)); }

void main() {
  vec3 o = vObj;
  // Two great circles and two offset rings give the eight-panel read.
  float s = 0.0;
  s = max(s, seam(o.y, 0.025));
  s = max(s, seam(o.x, 0.025));
  s = max(s, seam(abs(o.z) - 0.62, 0.025) * step(0.0, 0.62 - abs(o.y) * 0.4));
  s = max(s, seam(abs(o.z) + 0.62 - 1.24, 0.0));

  // Pebbled grain, cheap: high-frequency noise from the object normal.
  float grain = fract(sin(dot(floor(o.xy * 140.0), vec2(12.9898, 78.233))) * 43758.5453);
  vec3 base = uOrange * (0.86 + grain * 0.14);

  vec3 col = shade(normalize(vN), normalize(vV), base, uGreen, 3.5);
  col = mix(col, vec3(0.02), s * 0.9);

  gl_FragColor = vec4(col, uOpacity);
  #include <colorspace_fragment>
}
`

const FLOOR_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const FLOOR_FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uImpact;
uniform vec2  uCenter;
uniform vec3  uGreen;
uniform float uOpacity;
varying vec2 vUv;

void main() {
  vec2 p = (vUv - 0.5) * 24.0;
  float d = distance(p, uCenter);
  float age = uTime - uImpact;

  // Expanding ring from the last landing, plus a static hoop key line.
  float r = age * 5.5;
  float ring = (1.0 - smoothstep(0.0, 0.35, abs(d - r))) * exp(-age * 1.6) * step(0.0, age);
  float ring2 = (1.0 - smoothstep(0.0, 0.25, abs(d - r * 0.55))) * exp(-age * 2.2) * step(0.0, age);

  // Court markings: a three-point arc and the key, faint.
  float arc = 1.0 - smoothstep(0.0, 0.12, abs(d - 6.75));
  float key = (1.0 - smoothstep(0.0, 0.1, abs(abs(p.x) - 2.45))) * step(abs(p.y), 5.8);

  float fade = 1.0 - smoothstep(6.0, 12.0, d);
  vec3 col = uGreen * (ring * 0.9 + ring2 * 0.6 + (arc + key) * 0.18) * fade;

  gl_FragColor = vec4(col, uOpacity * fade);
  #include <colorspace_fragment>
}
`

export default function BasketballScene({ tier, reducedMotion }: SceneProps) {
  const group = useRef<THREE.Group>(null)
  const ball = useRef<THREE.Mesh>(null)
  const ballMat = useRef<THREE.ShaderMaterial>(null)
  const floorMat = useRef<THREE.ShaderMaterial>(null)

  const ballUniforms = useMemo(
    () => ({ uOrange: { value: COLORS.orange.clone() }, uGreen: { value: COLORS.green.clone() }, uOpacity: { value: 0 } }),
    [],
  )
  const floorUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uImpact: { value: -10 },
      uCenter: { value: new THREE.Vector2() },
      uGreen: { value: COLORS.green.clone() },
      uOpacity: { value: 0 },
    }),
    [],
  )

  const s = useRef({ opacity: 0, px: 0, py: 0, wasDown: false })
  const seg = tier === 'high' ? 96 : tier === 'mid' ? 64 : 40

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const g = group.current
    const b = ball.current
    if (!g || !b || !ballMat.current || !floorMat.current) return
    const st = s.current
    const t = state.clock.elapsedTime

    st.opacity = damp(st.opacity, phase.entered ? 1 : 0, 3, dt)
    st.px = damp(st.px, phase.pointer.x, 3, dt)
    st.py = damp(st.py, phase.pointer.y, 3, dt)

    // Bounce: |sin| shaped so the ball hangs at the top and snaps at the floor.
    const rate = reducedMotion ? 0.35 : 1.35
    const raw = Math.abs(Math.sin(t * rate))
    const height = Math.pow(raw, 0.62)
    const amp = 2.6 + phase.hero * 1.2
    const y = 1.1 + height * amp

    // Squash on contact, stretch on the way up.
    const contact = 1 - Math.min(1, height * 6)
    const rising = Math.cos(t * rate) * Math.sign(Math.sin(t * rate)) > 0
    const stretch = rising ? 1 + (1 - height) * 0.08 : 1
    b.position.set(Math.sin(t * 0.35) * 0.6, y - contact * 0.22, 0)
    b.scale.set(1 + contact * 0.28, (1 - contact * 0.32) * stretch, 1 + contact * 0.28)
    b.rotation.z = t * 0.9
    b.rotation.x = t * 0.4

    const down = height < 0.05
    if (down && !st.wasDown) {
      floorUniforms.uImpact.value = t
      floorUniforms.uCenter.value.set(b.position.x, 0)
    }
    st.wasDown = down

    g.rotation.y = phase.page * Math.PI * 1.3 + st.px * 0.25
    g.rotation.x = st.py * 0.08
    g.position.z = -phase.hero * 2.2
    g.visible = st.opacity > 0.01

    ballMat.current.uniforms.uOpacity.value = st.opacity
    floorMat.current.uniforms.uOpacity.value = st.opacity
    floorMat.current.uniforms.uTime.value = t
  })

  return (
    <group ref={group} position={[0, -1.5, 0]}>
      <mesh ref={ball}>
        <sphereGeometry args={[1.1, seg, seg]} />
        <shaderMaterial ref={ballMat} vertexShader={BALL_VERT} fragmentShader={BALL_FRAG} uniforms={ballUniforms} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[24, 24]} />
        <shaderMaterial ref={floorMat} vertexShader={FLOOR_VERT} fragmentShader={FLOOR_FRAG} uniforms={floorUniforms} transparent depthWrite={false} />
      </mesh>
    </group>
  )
}

export const basketballCamera = { base: [0, 1.6, 8] as const, scroll: [0, 3.2, -1.5] as const, fov: 44, lookY: 0.4 }
