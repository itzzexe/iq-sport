'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PARTICLE_FRAG, PARTICLE_VERT } from './glsl'
import { damp, phase } from './store'
import { BRAND } from '@/data/site'

/**
 * Volumetric dust. It carries the brand colours through the whole scroll and
 * gives the black field a sense of depth that a flat background cannot — and it
 * is the cheapest way to do that, since one draw call covers the entire volume.
 */
export function Particles({ count, pixelRatio }: { count: number; pixelRatio: number }) {
  const points = useRef<THREE.Points>(null)
  const material = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const scales = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Distributed in a flattened box rather than a sphere — the camera only
      // ever sees a wide, shallow slab, so a sphere would waste most of them.
      positions[i * 3] = (Math.random() - 0.5) * 22
      positions[i * 3 + 1] = (Math.random() - 0.5) * 13
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2
      seeds[i] = Math.random() * 100
      // Skewed small: a few bright motes read better than uniform confetti.
      scales[i] = 0.35 + Math.pow(Math.random(), 3) * 1.5
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 22)
    return geo
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 3.4 },
      uSpread: { value: 1.5 },
      uOpacity: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uPointer: { value: new THREE.Vector2() },
      uColor: { value: new THREE.Color(BRAND.green) },
      uColorAlt: { value: new THREE.Color(BRAND.volt) },
    }),
    [pixelRatio],
  )

  const smoothed = useRef({ opacity: 0, px: 0, py: 0 })

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const mat = material.current
    const p = points.current
    if (!mat || !p) return

    const s = smoothed.current
    s.px = damp(s.px, phase.pointer.x, 2.2, dt)
    s.py = damp(s.py, phase.pointer.y, 2.2, dt)
    // Dust is atmosphere, not content: it is strongest in the hero, thins to a
    // trace once the reader is into the copy, and all but vanishes behind the
    // pinned gallery so the photography stays clean.
    const afterHero = 1 - phase.hero * 0.72
    const target = phase.entered ? Math.max(0, 0.42 * afterHero - phase.divisions * 0.2) : 0
    s.opacity = damp(s.opacity, target, 2.5, dt)

    mat.uniforms.uTime.value = state.clock.elapsedTime
    mat.uniforms.uOpacity.value = s.opacity
    mat.uniforms.uPointer.value.set(s.px, s.py)
    mat.uniforms.uSpread.value = 1.5 + Math.abs(phase.velocity) * 1.1

    p.rotation.y = state.clock.elapsedTime * 0.012 + phase.page * 0.5
    p.visible = s.opacity > 0.005
  })

  if (count <= 0) return null

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={PARTICLE_VERT}
        fragmentShader={PARTICLE_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
