'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SIMPLEX_3D } from '../glsl'
import { damp, phase } from '../store'
import { COLORS, type SceneProps } from './common'

/**
 * Swimming — a black water surface lit only by brand-green caustics.
 *
 * The plane is displaced by three Gerstner-style waves plus a noise layer, and
 * the fragment stage rebuilds the normal from screen-space derivatives, so the
 * lighting reacts to the real displaced surface rather than a flat normal.
 * Scroll deepens the swell and lifts the camera; the pointer drops a ripple.
 */

const VERT = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform vec2  uRipple;
uniform float uRippleT;

varying vec3 vWorld;
varying float vHeight;

${SIMPLEX_3D}

float wave(vec2 p, vec2 dir, float len, float speed, float t) {
  float k = 6.28318 / len;
  return sin(dot(p, normalize(dir)) * k + t * speed);
}

void main() {
  vec3 pos = position;
  float t = uTime;

  float h = 0.0;
  h += wave(pos.xy, vec2(1.0, 0.35), 4.2, 0.9, t) * 0.55;
  h += wave(pos.xy, vec2(-0.6, 1.0), 2.6, 1.3, t) * 0.32;
  h += wave(pos.xy, vec2(0.3, -1.0), 1.4, 1.9, t) * 0.14;
  h += snoise(vec3(pos.xy * 0.45, t * 0.25)) * 0.45;

  // Pointer ripple: a decaying ring expanding from the last pointer position.
  float d = distance(pos.xy, uRipple);
  float age = t - uRippleT;
  float ring = sin(d * 6.0 - age * 7.0) * exp(-d * 0.55) * exp(-age * 1.4);
  h += ring * 0.35 * step(0.0, age);

  pos.z += h * uAmp;

  vHeight = h;
  vec4 world = modelMatrix * vec4(pos, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

const FRAG = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uOpacity;
uniform vec3  uDeep;
uniform vec3  uGreen;
uniform vec3  uVolt;

varying vec3 vWorld;
varying float vHeight;

${SIMPLEX_3D}

void main() {
  // Normal from the actual displaced surface.
  vec3 dx = dFdx(vWorld);
  vec3 dy = dFdy(vWorld);
  vec3 n = normalize(cross(dx, dy));
  vec3 v = normalize(cameraPosition - vWorld);

  float fres = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 3.0);

  // Caustic web: two noise fields multiplied, thresholded, drifting apart.
  float c1 = snoise(vec3(vWorld.xz * 0.9, uTime * 0.18));
  float c2 = snoise(vec3(vWorld.xz * 1.7 + 5.0, -uTime * 0.14));
  float caustic = smoothstep(0.35, 0.95, c1 * c2 * 2.2 + 0.2);

  // Crests catch the light; troughs stay black.
  float crest = smoothstep(0.1, 0.9, vHeight);

  vec3 col = uDeep * 0.55;
  col += uGreen * caustic * 0.55;
  col += uVolt * crest * 0.35;
  col += mix(uGreen, uVolt, 0.5) * fres * 0.9;

  // Depth fog into black so the far edge dissolves rather than ends.
  float dist = length(cameraPosition - vWorld);
  float fog = smoothstep(6.0, 22.0, dist);
  col = mix(col, vec3(0.0), fog);

  gl_FragColor = vec4(col, uOpacity);
  #include <colorspace_fragment>
}
`

export default function SwimmingScene({ tier, reducedMotion }: SceneProps) {
  const mesh = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => {
    const seg = tier === 'high' ? 180 : tier === 'mid' ? 110 : 60
    return new THREE.PlaneGeometry(26, 20, seg, Math.round(seg * 0.77))
  }, [tier])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.6 },
      uOpacity: { value: 0 },
      uRipple: { value: new THREE.Vector2(100, 100) },
      uRippleT: { value: -10 },
      uDeep: { value: COLORS.navy.clone() },
      uGreen: { value: COLORS.green.clone() },
      uVolt: { value: COLORS.volt.clone() },
    }),
    [],
  )

  const s = useRef({ opacity: 0, amp: 0.6, lastPx: 0, lastPy: 0 })

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const m = mat.current
    if (!m) return
    const t = state.clock.elapsedTime
    const st = s.current

    st.opacity = damp(st.opacity, phase.entered ? 1 : 0, 3, dt)
    const targetAmp = reducedMotion ? 0.15 : 0.45 + phase.hero * 0.7 + Math.abs(phase.velocity) * 0.4
    st.amp = damp(st.amp, targetAmp, 3, dt)

    // Drop a ripple when the pointer has moved a meaningful distance.
    const px = phase.pointer.x
    const py = phase.pointer.y
    if (Math.hypot(px - st.lastPx, py - st.lastPy) > 0.08) {
      uniforms.uRipple.value.set(px * 8, py * 5 - 2)
      uniforms.uRippleT.value = t
      st.lastPx = px
      st.lastPy = py
    }

    m.uniforms.uTime.value = reducedMotion ? t * 0.2 : t
    m.uniforms.uAmp.value = st.amp
    m.uniforms.uOpacity.value = st.opacity

    if (mesh.current) mesh.current.visible = st.opacity > 0.01
  })

  return (
    <mesh ref={mesh} geometry={geometry} rotation={[-Math.PI / 2.35, 0, 0]} position={[0, -1.6, -2]} frustumCulled={false}>
      <shaderMaterial ref={mat} vertexShader={VERT} fragmentShader={FRAG} uniforms={uniforms} transparent side={THREE.DoubleSide} />
    </mesh>
  )
}

/** Camera staging for this scene, consumed by the shared rig. */
export const swimmingCamera = { base: [0, 1.4, 6.5] as const, scroll: [0, 2.6, -1.5] as const, fov: 50, lookY: -0.8 }
