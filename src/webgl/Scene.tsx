'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Ribbons } from './Ribbons'
import { Particles } from './Particles'
import { DivisionRing } from './DivisionRing'
import { damp, phase } from './store'
import { BUDGET, detectCapabilities, type Capabilities } from '@/lib/perf'

/** Eases the camera between the page's three staging positions. */
function Rig() {
  const smoothed = useRef({ x: 0, y: 0, z: 5, fov: 45 })
  const { camera } = useThree()

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const s = smoothed.current
    const cam = camera as THREE.PerspectiveCamera

    // Hero: drift back and up. Gallery: settle square-on to the ring.
    const targetZ = 5 + phase.hero * 1.6 - phase.divisions * 0.5
    const targetY = phase.hero * 0.35
    const targetX = phase.pointer.x * 0.25 * (1 - phase.divisions)
    const targetFov = 45 + phase.hero * 6 - phase.divisions * 4

    s.z = damp(s.z, targetZ, 3, dt)
    s.y = damp(s.y, targetY, 3, dt)
    s.x = damp(s.x, targetX, 2.4, dt)
    s.fov = damp(s.fov, targetFov, 3, dt)

    cam.position.set(s.x, s.y, s.z)
    cam.lookAt(0, phase.hero * 0.15, 0)
    if (Math.abs(cam.fov - s.fov) > 0.01) {
      cam.fov = s.fov
      cam.updateProjectionMatrix()
    }
  })

  return null
}

/**
 * Drops the render loop to on-demand while the tab is hidden or the canvas is
 * fully covered, so the GPU is not burning frames nobody is looking at.
 */
function Throttle() {
  const { invalidate, setFrameloop } = useThree()

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        setFrameloop('never')
      } else {
        setFrameloop('always')
        invalidate()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [invalidate, setFrameloop])

  return null
}

function SceneContents({ caps, galleryReady }: { caps: Capabilities; galleryReady: boolean }) {
  const budget = BUDGET[caps.tier]
  const pixelRatio = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, caps.dpr[1]) : 1

  return (
    <>
      <Rig />
      <Throttle />

      {/* Everything is emissive/unlit by design — the palette is only ever
          black, brand green and volt, so a lighting rig would only muddy it. */}
      <Ribbons tier={caps.tier} reducedMotion={caps.reducedMotion} />

      {budget.particles > 0 && <Particles count={budget.particles} pixelRatio={pixelRatio} />}

      {/* Six panel textures are ~230 kB that nobody needs until the gallery is
          in reach, so the ring is not mounted until the reader is heading for it. */}
      {galleryReady && (
        <Suspense fallback={null}>
          <DivisionRing tier={caps.tier} />
        </Suspense>
      )}
    </>
  )
}

export default function Scene() {
  const [caps, setCaps] = useState<Capabilities | null>(null)
  const [galleryReady, setGalleryReady] = useState(false)

  useEffect(() => {
    setCaps(detectCapabilities())
  }, [])

  // Watch the DOM section the ring belongs to and warm the gallery a viewport
  // and a half before it arrives — far enough ahead that the textures are
  // decoded by the time the pin starts, late enough to stay off first load.
  useEffect(() => {
    const section = document.getElementById('divisions')
    if (!section || typeof IntersectionObserver === 'undefined') {
      setGalleryReady(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setGalleryReady(true)
          io.disconnect()
        }
      },
      { rootMargin: '150% 0px' },
    )
    io.observe(section)
    return () => io.disconnect()
  }, [])

  // Pointer feeds the store directly; nothing here triggers a React render.
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
    () => ({
      antialias: caps?.tier === 'high',
      alpha: true,
      powerPreference: 'high-performance' as const,
      stencil: false,
      depth: true,
    }),
    [caps?.tier],
  )

  if (!caps || !caps.webgl) return null

  return (
    <div className="webgl-root" aria-hidden="true">
      <Canvas
        dpr={caps.dpr}
        gl={gl}
        camera={{ position: [0, 0, 5], fov: 45, near: 0.1, far: 60 }}
        onCreated={({ gl: renderer }) => {
          renderer.setClearColor(0x000000, 0)
          renderer.toneMapping = THREE.ACESFilmicToneMapping
          renderer.toneMappingExposure = 1.05
        }}
      >
        <SceneContents caps={caps} galleryReady={galleryReady} />
      </Canvas>
    </div>
  )
}
