'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { damp, phase } from './store'
import { detectCapabilities, type Capabilities } from '@/lib/perf'
import SwimmingScene, { swimmingCamera } from './scenes/SwimmingScene'
import PadelScene, { padelCamera } from './scenes/PadelScene'
import GymScene, { gymCamera } from './scenes/GymScene'
import TennisScene, { tennisCamera } from './scenes/TennisScene'
import FootballScene, { footballCamera } from './scenes/FootballScene'
import BasketballScene, { basketballCamera } from './scenes/BasketballScene'
import type { SceneProps } from './scenes/common'

type CameraSpec = {
  base: readonly [number, number, number]
  scroll: readonly [number, number, number]
  fov: number
  lookY: number
}

const SCENES: Record<string, { Scene: (p: SceneProps) => React.JSX.Element; camera: CameraSpec }> = {
  swimming: { Scene: SwimmingScene, camera: swimmingCamera },
  padel: { Scene: PadelScene, camera: padelCamera },
  gym: { Scene: GymScene, camera: gymCamera },
  tennis: { Scene: TennisScene, camera: tennisCamera },
  football: { Scene: FootballScene, camera: footballCamera },
  basketball: { Scene: BasketballScene, camera: basketballCamera },
}

/**
 * Per-scene camera staging: `base` for the top of the page, `base + scroll`
 * at the end of the hero, with a pointer drift on top. Scenes stay agnostic
 * of the camera and only describe where they want it.
 */
function Rig({ spec }: { spec: CameraSpec }) {
  const { camera, size } = useThree()
  const s = useRef({ x: spec.base[0], y: spec.base[1], z: spec.base[2], fov: spec.fov })

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const cam = camera as THREE.PerspectiveCamera
    const st = s.current
    const h = phase.hero

    // Portrait phones see a much narrower slice of the scene, so the camera
    // backs off in proportion to how far below landscape the aspect ratio is.
    const aspect = size.width / Math.max(size.height, 1)
    const back = aspect < 1.2 ? 1 + (1.2 - aspect) * 0.9 : 1

    const tx = spec.base[0] + spec.scroll[0] * h + phase.pointer.x * 0.35
    const ty = spec.base[1] * back + spec.scroll[1] * h + phase.pointer.y * 0.2
    const tz = spec.base[2] * back + spec.scroll[2] * h

    st.x = damp(st.x, tx, 2.6, dt)
    st.y = damp(st.y, ty, 2.6, dt)
    st.z = damp(st.z, tz, 2.6, dt)
    st.fov = damp(st.fov, spec.fov + h * 4, 2.6, dt)

    cam.position.set(st.x, st.y, st.z)
    cam.lookAt(0, spec.lookY, 0)
    if (Math.abs(cam.fov - st.fov) > 0.01) {
      cam.fov = st.fov
      cam.updateProjectionMatrix()
    }
  })
  return null
}

function Throttle() {
  const { invalidate, setFrameloop } = useThree()
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) setFrameloop('never')
      else {
        setFrameloop('always')
        invalidate()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [invalidate, setFrameloop])
  return null
}

export default function DivisionCanvas({ slug }: { slug: string }) {
  const [caps, setCaps] = useState<Capabilities | null>(null)

  useEffect(() => {
    setCaps(detectCapabilities())
  }, [])

  useEffect(() => {
    if (!caps || caps.coarsePointer) return
    let raf = 0
    const onMove = (e: PointerEvent) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        phase.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
        phase.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
        raf = 0
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [caps])

  const gl = useMemo(
    () => ({ antialias: caps?.tier === 'high', alpha: true, powerPreference: 'high-performance' as const, stencil: false }),
    [caps?.tier],
  )

  const entry = SCENES[slug]
  if (!caps || !caps.webgl || !entry) return null
  const { Scene, camera } = entry

  return (
    <div className="webgl-root" aria-hidden="true">
      <Canvas
        dpr={caps.dpr}
        gl={gl}
        camera={{ position: [...camera.base], fov: camera.fov, near: 0.1, far: 80 }}
        onCreated={({ gl: renderer }) => {
          renderer.setClearColor(0x000000, 0)
          renderer.toneMapping = THREE.ACESFilmicToneMapping
          renderer.toneMappingExposure = 1.05
        }}
      >
        <Rig spec={camera} />
        <Throttle />
        <Scene tier={caps.tier} reducedMotion={caps.reducedMotion} />
      </Canvas>
    </div>
  )
}
