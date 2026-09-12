'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { BUDGET, detectCapabilities, type Capabilities } from '@/lib/perf'
import { Particles } from './Particles'
import { Ribbons } from './Ribbons'
import { clamp01, damp, phase } from './store'
import BasketballScene, { basketballCamera } from './scenes/BasketballScene'
import FootballScene, { footballCamera } from './scenes/FootballScene'
import GymScene, { gymCamera } from './scenes/GymScene'
import PadelScene, { padelCamera } from './scenes/PadelScene'
import SwimmingScene, { swimmingCamera } from './scenes/SwimmingScene'
import TennisScene, { tennisCamera } from './scenes/TennisScene'
import type { SceneProgress, SceneProps } from './scenes/common'

type CameraSpec = {
  base: readonly [number, number, number]
  scroll: readonly [number, number, number]
  fov: number
  lookY: number
}

const SPORTS: Record<string, { Scene: (p: SceneProps) => React.JSX.Element; camera: CameraSpec }> = {
  padel: { Scene: PadelScene, camera: padelCamera },
  gym: { Scene: GymScene, camera: gymCamera },
  swimming: { Scene: SwimmingScene, camera: swimmingCamera },
  tennis: { Scene: TennisScene, camera: tennisCamera },
  football: { Scene: FootballScene, camera: footballCamera },
  basketball: { Scene: BasketballScene, camera: basketballCamera },
}

/** Station 0 — the brand mark. */
const INTRO_CAMERA: CameraSpec = { base: [0, 0, 5], scroll: [0, 0, 0], fov: 45, lookY: 0 }

/** Distance between stations along -Z; larger than any scene's footprint (the tennis court is ~24 units long). */
const SPACING = 70
/** Stations zig-zag sideways so the camera swoops rather than runs down a corridor. */
const LATERAL = 9

export type JourneyStation = { slug: string; sport?: string | null }

type Station = {
  slug: string
  sport: string | null
  position: THREE.Vector3
  camera: CameraSpec
}

function buildStations(list: JourneyStation[]): Station[] {
  const intro: Station = { slug: '__intro', sport: null, position: new THREE.Vector3(0, 0, 0), camera: INTRO_CAMERA }
  const sports = list.map((d, i) => {
    const sport = d.sport && SPORTS[d.sport] ? d.sport : null
    const k = i + 1
    return {
      slug: d.slug,
      sport,
      position: new THREE.Vector3((k % 2 === 0 ? -1 : 1) * LATERAL, 0, -k * SPACING),
      camera: sport ? SPORTS[sport].camera : INTRO_CAMERA,
    }
  })
  return [intro, ...sports]
}

/**
 * Flies the camera along a smooth spline through every station. `phase.journey`
 * is the fractional station index the DOM has scrolled to; the rig eases
 * towards it, so a fast scroll reads as a swoop rather than a cut.
 */
function Rig({ stations }: { stations: Station[] }) {
  const { camera, size } = useThree()
  const curves = useMemo(() => {
    const eyes = stations.map((s) => new THREE.Vector3(...s.camera.base).add(s.position))
    const looks = stations.map((s) => new THREE.Vector3(0, s.camera.lookY, 0).add(s.position))
    return {
      eye: new THREE.CatmullRomCurve3(eyes, false, 'centripetal', 0.6),
      look: new THREE.CatmullRomCurve3(looks, false, 'centripetal', 0.6),
    }
  }, [stations])
  const smoothed = useRef({ j: 0, fov: 45 })
  const eye = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const cam = camera as THREE.PerspectiveCamera
    const s = smoothed.current
    const last = stations.length - 1
    const target = clamp01(Math.max(0, phase.journey) / last) * last
    s.j = damp(s.j, target, 3.2, dt)

    const u = last > 0 ? s.j / last : 0
    curves.eye.getPoint(u, eye)
    curves.look.getPoint(u, look)

    // Portrait phones see a much narrower slice of each scene: back off in proportion.
    const aspect = size.width / Math.max(size.height, 1)
    const back = aspect < 1.2 ? 1 + (1.2 - aspect) * 0.9 : 1

    const i0 = Math.min(last, Math.floor(s.j))
    const i1 = Math.min(last, i0 + 1)
    const f = s.j - i0
    const fov = THREE.MathUtils.lerp(stations[i0].camera.fov, stations[i1].camera.fov, f)

    // The copy sits on the reading side of the screen, so the subject is framed
    // on the other side: shift what the camera looks at (and the camera with it).
    // (Not at the intro: the mark already places itself opposite the copy.)
    const side = size.width >= 1024 ? (phase.rtl ? 1 : -1) * 2.4 * clamp01(s.j) : 0
    look.x += side
    eye.x += side * 0.6

    const t = state.clock.elapsedTime
    cam.position.set(
      look.x + (eye.x - look.x) * back + phase.pointer.x * 0.35,
      look.y + (eye.y - look.y) * back + phase.pointer.y * 0.2 + Math.sin(t * 0.6) * 0.04,
      look.z + (eye.z - look.z) * back,
    )
    cam.lookAt(look)
    s.fov = damp(s.fov, fov, 3, dt)
    if (Math.abs(cam.fov - s.fov) > 0.01) {
      cam.fov = s.fov
      cam.updateProjectionMatrix()
    }
  })
  return null
}

/**
 * One station: the sport's scene inside a group at its place on the route.
 * The scene is only rendered while the camera is near it, and it is handed a
 * local progress (0 arriving → 1 leaving) plus a weight that fades it in and
 * out with distance, so scenes never overlap visually.
 */
function StationNode({ station, index, caps }: { station: Station; index: number; caps: Capabilities }) {
  const group = useRef<THREE.Group>(null)
  const progress = useMemo<SceneProgress>(() => ({ value: 0, weight: 0 }), [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const j = Math.max(0, phase.journey)
    const d = j - index
    const near = Math.abs(d) < 1.35
    if (group.current) group.current.visible = near
    if (!near) return
    // Start pose while the camera is arriving and at the station; it pushes back as we leave.
    progress.value = damp(progress.value, clamp01(d), 4, dt)
    progress.weight = damp(progress.weight, clamp01(1.15 - Math.abs(d) * 1.15), 4, dt)
  })

  const entry = station.sport ? SPORTS[station.sport] : null
  return (
    <group ref={group} position={station.position} visible={false}>
      {entry ? (
        <entry.Scene tier={caps.tier} reducedMotion={caps.reducedMotion} progress={progress} />
      ) : (
        <Ribbons tier={caps.tier} reducedMotion={caps.reducedMotion} />
      )}
    </group>
  )
}

/** Ambient dust that travels with the camera so the route never runs out of it. */
function TravellingParticles({ count, pixelRatio }: { count: number; pixelRatio: number }) {
  const group = useRef<THREE.Group>(null)
  const { camera } = useThree()
  useFrame(() => {
    if (group.current) group.current.position.set(camera.position.x, camera.position.y, camera.position.z - 6)
  })
  return (
    <group ref={group}>
      <Particles count={count} pixelRatio={pixelRatio} />
    </group>
  )
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

/**
 * The divisions journey: a single continuous 3D route. Station 0 is the brand
 * mark; every published division is a station after it, staged with that
 * sport's own scene. The DOM (DivisionsJourney) scrolls the route by writing
 * `phase.journey`; this canvas does the flying.
 */
export default function JourneyCanvas({ stations: list }: { stations: JourneyStation[] }) {
  const [caps, setCaps] = useState<Capabilities | null>(null)
  const stations = useMemo(() => buildStations(list), [list])

  useEffect(() => {
    setCaps(detectCapabilities())
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
    () => ({ antialias: caps?.tier === 'high', alpha: true, powerPreference: 'high-performance' as const, stencil: false }),
    [caps?.tier],
  )

  if (!caps || !caps.webgl) return null
  const budget = BUDGET[caps.tier]
  const pixelRatio = Math.min(window.devicePixelRatio, caps.dpr[1])

  return (
    <div className="webgl-root" aria-hidden="true">
      <Canvas
        dpr={caps.dpr}
        gl={gl}
        camera={{ position: [0, 0, 5], fov: 45, near: 0.1, far: 120 }}
        onCreated={({ gl: renderer }) => {
          renderer.setClearColor(0x000000, 0)
          renderer.toneMapping = THREE.ACESFilmicToneMapping
          renderer.toneMappingExposure = 1.05
        }}
      >
        <Rig stations={stations} />
        <Throttle />
        {budget.particles > 0 && <TravellingParticles count={Math.round(budget.particles * 0.6)} pixelRatio={pixelRatio} />}
        {stations.map((station, i) => (
          <StationNode key={station.slug} station={station} index={i} caps={caps} />
        ))}
      </Canvas>
    </div>
  )
}
