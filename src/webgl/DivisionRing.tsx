'use client'

import { useMemo, useRef } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PLANE_FRAG, PLANE_VERT } from './glsl'
import { damp, phase } from './store'
import { BRAND } from './brand'
import type { Tier } from '@/lib/perf'

/**
 * A cylinder of curved panels — one per division — that the pinned Divisions
 * section scrubs through. Each panel carries the real facility photography from
 * the company profile, so the 3D moment is showing the actual venues rather
 * than abstract geometry.
 */

const RADIUS = 6.4
const PANEL_W = 4.6
const PANEL_H = 2.85

/** One curved panel per division — slug for the key, an image URL for the texture. */
export type RingPanel = { slug: string; image: string }

type Props = { tier: Tier; panels: RingPanel[] }

export function DivisionRing({ tier, panels }: Props) {
  const group = useRef<THREE.Group>(null)
  const count = panels.length

  const urls = useMemo(() => panels.map((d) => d.image), [panels])
  const textures = useLoader(THREE.TextureLoader, urls)

  useMemo(() => {
    for (const tex of textures) {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.generateMipmaps = true
      tex.minFilter = THREE.LinearMipmapLinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.anisotropy = tier === 'high' ? 8 : 4
      tex.needsUpdate = true
    }
  }, [textures, tier])

  const geometry = useMemo(() => {
    const seg = tier === 'high' ? 32 : tier === 'mid' ? 20 : 12
    return new THREE.PlaneGeometry(PANEL_W, PANEL_H, seg, 2)
  }, [tier])

  const materials = useRef<THREE.ShaderMaterial[]>([])

  const uniformSets = useMemo(
    () =>
      textures.map((tex) => {
        // "cover" factors: shrink the UV window on the axis that overflows so
        // the photo fills the panel without ever being squashed.
        const image = tex.image as { width: number; height: number } | undefined
        const texAspect = image && image.height ? image.width / image.height : 16 / 9
        const panelAspect = PANEL_W / PANEL_H
        const cover =
          texAspect > panelAspect
            ? new THREE.Vector2(panelAspect / texAspect, 1)
            : new THREE.Vector2(1, texAspect / panelAspect)

        return {
          uMap: { value: tex },
          uTime: { value: 0 },
          uCurve: { value: 0.55 },
          uVelocity: { value: 0 },
          uActive: { value: 0 },
          uOpacity: { value: 0 },
          uCover: { value: cover },
          uTint: { value: new THREE.Color(BRAND.green) },
        }
      }),
    [textures],
  )

  const smoothed = useRef({ rotation: 0, opacity: 0, velocity: 0, x: 0 })
  const viewport = useThree((state) => state.viewport)
  const size = useThree((state) => state.size)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const g = group.current
    if (!g) return

    const s = smoothed.current
    const step = (Math.PI * 2) / count

    // The section's scroll progress maps directly to ring rotation, so the
    // panel that is "in front" is always the one the copy is describing.
    const targetRotation = -phase.divisionIndex * step
    s.rotation = damp(s.rotation, targetRotation, 6, dt)
    s.velocity = damp(s.velocity, phase.velocity, 8, dt)

    // Fades in over the first slice of the pin and is fully gone by the end of
    // it — a residual few percent would otherwise ghost over the next section.
    const fadeIn = Math.min(1, phase.divisions * 3.2)
    const fadeOut = 1 - Math.max(0, (phase.divisions - 0.94) / 0.06)
    const targetOpacity = phase.entered ? Math.max(0, Math.min(1, fadeIn * fadeOut)) : 0
    s.opacity = damp(s.opacity, targetOpacity, 5, dt)

    // The chapter copy is start-aligned, so the front panel slides towards the
    // free side of the screen (left in Arabic, right in English) on wide views.
    const shift = size.width >= 1024 ? viewport.width * 0.2 : 0
    s.x = damp(s.x, shift * (phase.rtl ? -1 : 1), 3, dt)

    g.rotation.y = s.rotation
    g.position.x = s.x
    g.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    g.visible = s.opacity > 0.005

    for (let i = 0; i < materials.current.length; i++) {
      const mat = materials.current[i]
      if (!mat) continue
      // Angular distance from the camera-facing slot, wrapped to −0.5…0.5 turns.
      let d = i - phase.divisionIndex
      d = ((d % count) + count) % count
      if (d > count / 2) d -= count
      const focus = Math.max(0, 1 - Math.abs(d) * 1.15)

      mat.uniforms.uTime.value = state.clock.elapsedTime
      mat.uniforms.uActive.value = damp(mat.uniforms.uActive.value, focus, 6, dt)
      mat.uniforms.uVelocity.value = s.velocity
      mat.uniforms.uOpacity.value = s.opacity
    }
  })

  return (
    <group ref={group} position={[0, 0, -RADIUS + 1.6]} dispose={null}>
      {panels.map((division, i) => {
        const angle = (i / count) * Math.PI * 2
        return (
          <mesh
            key={division.slug}
            geometry={geometry}
            position={[Math.sin(angle) * RADIUS, 0, Math.cos(angle) * RADIUS]}
            rotation={[0, angle, 0]}
            frustumCulled={false}
          >
            <shaderMaterial
              ref={(m) => {
                if (m) materials.current[i] = m as THREE.ShaderMaterial
              }}
              vertexShader={PLANE_VERT}
              fragmentShader={PLANE_FRAG}
              uniforms={uniformSets[i]}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </group>
  )
}
