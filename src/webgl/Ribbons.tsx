'use client'

import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { RIBBON_FRAG, RIBBON_VERT } from './glsl'
import { clamp01, damp, phase } from './store'
import { BRAND } from '@/data/site'
import type { Tier } from '@/lib/perf'

/**
 * The exact outlines of the two ribbons in the IQ Sports Group mark, lifted
 * from the vector artwork in the brand guideline (page 03). Everything the hero
 * renders in 3D is extruded from these two paths — the identity *is* the
 * geometry rather than a decoration placed next to it.
 */
const RIBBON_PATHS = [
  'M368.96 342.98C368.73 343.29 368.12 343.59 367.44 343.57L337.50 342.67C333.21 342.55 329.22 343.78 326.28 346.75L321.39 351.69C317.85 355.26 313.49 356.90 308.13 356.54C295.86 355.71 284.30 353.52 272.45 351.58C270.50 351.26 269.38 350.52 268.87 348.58L263.05 326.70C262.89 326.10 263.11 325.45 263.35 325.13C263.71 324.66 264.33 324.43 265.14 324.57C276.91 326.63 288.48 328.66 300.36 329.54C305.16 329.90 309.55 329.05 312.96 325.70L319.43 319.36C322.03 316.80 325.69 315.65 329.43 315.75L359.70 316.56C361.37 316.60 362.75 317.27 363.21 318.96L369.29 341.65C369.42 342.13 369.12 342.76 368.96 342.98Z',
  'M361.60 311.01C361.36 311.32 360.75 311.62 360.07 311.60L330.14 310.70C325.85 310.57 321.85 311.81 318.92 314.77L314.03 319.71C310.49 323.28 306.13 324.92 300.77 324.56C288.50 323.74 276.94 321.54 265.08 319.61C263.14 319.29 262.02 318.55 261.51 316.60L255.69 294.72C255.53 294.12 255.75 293.48 255.99 293.16C256.35 292.69 256.96 292.46 257.78 292.60C269.55 294.65 281.12 296.68 293.00 297.56C297.80 297.92 302.19 297.07 305.60 293.73L312.07 287.38C314.67 284.83 318.33 283.68 322.07 283.78L352.34 284.58C354.01 284.63 355.39 285.29 355.84 286.98L361.93 309.68C362.06 310.15 361.76 310.78 361.60 311.01Z',
]

/** viewBox of the source artwork, used to centre and normalise the shapes. */
const VIEWBOX = { x: 255.53, y: 283.68, w: 113.9, h: 73.22 }

function useRibbonGeometries(tier: Tier) {
  return useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.w} ${VIEWBOX.h}">${RIBBON_PATHS.map(
      (d) => `<path d="${d}"/>`,
    ).join('')}</svg>`

    const parsed = new SVGLoader().parse(svg)

    // Normalise so the mark is 4 world-units wide and centred on the origin.
    const scale = 4 / VIEWBOX.w
    const cx = VIEWBOX.x + VIEWBOX.w / 2
    const cy = VIEWBOX.y + VIEWBOX.h / 2

    const curveSegments = tier === 'high' ? 24 : tier === 'mid' ? 14 : 8
    const bevelSegments = tier === 'high' ? 3 : 1

    return parsed.paths.map((path) => {
      const shapes = SVGLoader.createShapes(path)
      const geo = new THREE.ExtrudeGeometry(shapes, {
        depth: 3.2,
        bevelEnabled: true,
        bevelThickness: 1.1,
        bevelSize: 0.9,
        bevelSegments,
        curveSegments,
      })

      // SVG's Y axis points down; flip it, centre it, then scale to world units.
      geo.translate(-cx, -cy, 0)
      geo.scale(scale, -scale, scale)
      geo.computeVertexNormals()

      // The shader ramps its wave along X in −1…1 space, so the geometry has to
      // actually span that range for the ramp to land where it is meant to.
      geo.computeBoundingBox()
      const bb = geo.boundingBox!
      const halfWidth = Math.max(Math.abs(bb.min.x), Math.abs(bb.max.x)) || 1
      geo.userData.halfWidth = halfWidth

      return geo
    })
  }, [tier])
}

type Props = { tier: Tier; reducedMotion: boolean }

export function Ribbons({ tier, reducedMotion }: Props) {
  const group = useRef<THREE.Group>(null)
  const geometries = useRibbonGeometries(tier)
  const materials = useRef<THREE.ShaderMaterial[]>([])

  const uniforms = useMemo(
    () =>
      geometries.map((geo) => ({
        uTime: { value: 0 },
        uAmp: { value: 0 },
        uFlow: { value: 1 },
        uOpacity: { value: 0 },
        uEnergy: { value: 0.5 },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uColor: { value: new THREE.Color(BRAND.green) },
        uColorAlt: { value: new THREE.Color(BRAND.volt) },
        uColorDeep: { value: new THREE.Color(BRAND.navy) },
        // keeps the X ramp aligned with the real extent of each shape
        uHalfWidth: { value: geo.userData.halfWidth ?? 2 },
      })),
    [geometries],
  )

  const smoothed = useRef({ hero: 0, opacity: 0, px: 0, py: 0, x: 0 })
  const viewport = useThree((state) => state.viewport)
  const size = useThree((state) => state.size)

  /**
   * The headline is the hero — the mark stages *around* it rather than through
   * it. On a wide screen the ribbons sit in the empty half opposite the copy;
   * the copy is start-aligned, so that is screen-left in Arabic and screen-right
   * in English, and the offset has to flip with the language or the mark lands
   * straight on the words. On a phone there is no free column, so they retreat
   * up and back behind the type instead.
   */
  const layout = useMemo(() => {
    const narrow = size.width < 768
    const half = viewport.width / 2
    return narrow
      ? { offset: 0, y: 1.25, z: -3.2, scale: 0.62, opacity: 0.5 }
      : { offset: half * 0.42, y: 0.35, z: -1.6, scale: 0.82, opacity: 0.92 }
  }, [size.width, viewport.width])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const g = group.current
    if (!g) return

    const s = smoothed.current
    s.hero = damp(s.hero, phase.hero, 5, dt)
    s.px = damp(s.px, phase.pointer.x, 3.5, dt)
    s.py = damp(s.py, phase.pointer.y, 3.5, dt)

    // Visible through the hero, then handed over to the divisions ring.
    const target = phase.entered ? clamp01(1 - phase.hero * 1.35) * layout.opacity : 0
    s.opacity = damp(s.opacity, target, 4, dt)

    const t = state.clock.elapsedTime

    // Scroll drives a slow roll and a push back into depth; the idle drift keeps
    // it alive when the page is not moving.
    g.rotation.x = -0.24 + s.hero * 0.55 + Math.sin(t * 0.21) * 0.04
    g.rotation.y = 0.42 - s.hero * 1.25 + s.px * 0.22 + Math.sin(t * 0.17) * 0.05
    g.rotation.z = -0.06 + s.hero * 0.3 + s.py * 0.05

    // Damped so switching language slides the mark across rather than teleporting.
    const targetX = layout.offset * (phase.rtl ? -1 : 1)
    s.x = damp(s.x, targetX, 4, dt)
    g.position.x = s.x + s.px * 0.18
    g.position.y = layout.y + s.hero * 1.4 + Math.sin(t * 0.3) * 0.03
    g.position.z = layout.z - s.hero * 5.5

    g.scale.setScalar(layout.scale * (1 + s.hero * 0.35))

    for (const mat of materials.current) {
      if (!mat) continue
      const u = mat.uniforms
      u.uTime.value = t
      u.uOpacity.value = s.opacity
      u.uAmp.value = reducedMotion ? 0.02 : 0.09 + Math.abs(phase.velocity) * 0.1
      u.uFlow.value = reducedMotion ? 0.15 : 0.55 + Math.abs(phase.velocity) * 0.9
      u.uEnergy.value = 0.35 + Math.abs(phase.velocity) * 0.55
      u.uPointer.value.set(s.px, s.py)
    }

    g.visible = s.opacity > 0.004
  })

  return (
    <group ref={group} dispose={null}>
      {geometries.map((geo, i) => (
        <mesh
          key={i}
          geometry={geo}
          // The two ribbons are offset in Z so they read as separate sheets
          // rather than a single flat badge when the group rolls.
          position={[0, 0, i === 0 ? -0.18 : 0.18]}
          frustumCulled={false}
        >
          <shaderMaterial
            ref={(m) => {
              if (m) materials.current[i] = m as THREE.ShaderMaterial
            }}
            vertexShader={RIBBON_VERT}
            fragmentShader={RIBBON_FRAG}
            uniforms={uniforms[i]}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.NormalBlending}
          />
        </mesh>
      ))}
    </group>
  )
}
