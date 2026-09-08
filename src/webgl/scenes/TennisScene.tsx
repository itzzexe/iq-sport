'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { damp, phase } from '../store'
import { COLORS, type SceneProps } from './common'

/**
 * Tennis — a regulation court drawn as light, receding into black.
 *
 * The court is built to real dimensions (23.77 × 10.97 m) so the proportions
 * are the ones a player knows. WebGL cannot draw a line wider than a pixel,
 * so every marking is a thin flat box laid on the ground — that is what gives
 * the lines weight and lets them glow. A ball arcs over the net on a parabola
 * and leaves a fading trail; scroll carries the camera from behind the
 * baseline up and over the court.
 */

const L = 23.77
const W = 10.97
const SINGLES = 8.23
const SERVICE = 6.4
const LINE_W = 0.1

type Seg = [number, number, number, number]

function courtSegments(): Seg[] {
  const hw = W / 2
  const hl = L / 2
  const hs = SINGLES / 2
  return [
    [-hw, -hl, hw, -hl],
    [-hw, hl, hw, hl],
    [-hw, -hl, -hw, hl],
    [hw, -hl, hw, hl],
    [-hs, -hl, -hs, hl],
    [hs, -hl, hs, hl],
    [-hs, -SERVICE, hs, -SERVICE],
    [-hs, SERVICE, hs, SERVICE],
    [0, -SERVICE, 0, SERVICE],
    [-hw, 0, hw, 0],
    [0, -hl, 0, -hl + 0.35],
    [0, hl, 0, hl - 0.35],
  ]
}

function gridSegments(extent: number, step: number): Seg[] {
  const out: Seg[] = []
  for (let i = -extent; i <= extent; i += step) {
    out.push([i, -extent, i, extent], [-extent, i, extent, i])
  }
  return out
}

/** Lays one unit box per segment: scaled to its length, rotated to its heading. */
function layout(mesh: THREE.InstancedMesh, segs: Seg[], width: number, y: number) {
  const d = new THREE.Object3D()
  segs.forEach(([x1, z1, x2, z2], i) => {
    const len = Math.hypot(x2 - x1, z2 - z1)
    d.position.set((x1 + x2) / 2, y, (z1 + z2) / 2)
    d.rotation.set(0, Math.atan2(x2 - x1, z2 - z1), 0)
    d.scale.set(width, 0.02, len + width)
    d.updateMatrix()
    mesh.setMatrixAt(i, d.matrix)
  })
  mesh.instanceMatrix.needsUpdate = true
}

const TRAIL = 30

export default function TennisScene({ tier, reducedMotion }: SceneProps) {
  const group = useRef<THREE.Group>(null)
  const court = useRef<THREE.InstancedMesh>(null)
  const glow = useRef<THREE.InstancedMesh>(null)
  const grid = useRef<THREE.InstancedMesh>(null)
  const ball = useRef<THREE.Mesh>(null)
  const trail = useRef<THREE.InstancedMesh>(null)
  const net = useRef<THREE.Mesh>(null)

  const courtSegs = useMemo(() => courtSegments(), [])
  const gridSegs = useMemo(() => gridSegments(64, tier === 'low' ? 4 : 2), [tier])
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])

  const s = useRef({ opacity: 0, px: 0, py: 0, placed: false, history: [] as THREE.Vector3[] })
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const g = group.current
    if (!g || !court.current || !glow.current || !grid.current) return
    const st = s.current
    const t = state.clock.elapsedTime

    if (!st.placed) {
      layout(court.current, courtSegs, LINE_W, 0.01)
      layout(glow.current, courtSegs, LINE_W * 3.2, 0)
      layout(grid.current, gridSegs, 0.035, -0.01)
      st.placed = true
    }

    st.opacity = damp(st.opacity, phase.entered ? 1 : 0, 3, dt)
    st.px = damp(st.px, phase.pointer.x, 3, dt)
    st.py = damp(st.py, phase.pointer.y, 3, dt)

    g.rotation.y = st.px * 0.1 + phase.hero * 0.3
    g.visible = st.opacity > 0.01
    ;(court.current.material as THREE.MeshBasicMaterial).opacity = st.opacity
    ;(glow.current.material as THREE.MeshBasicMaterial).opacity = st.opacity * 0.22
    ;(grid.current.material as THREE.MeshBasicMaterial).opacity = st.opacity * 0.16
    if (net.current) (net.current.material as THREE.MeshBasicMaterial).opacity = st.opacity * 0.28

    // Rally: the ball crosses the court every 2.4 s, rising over the net.
    const period = reducedMotion ? 12 : 2.4
    const u = (t % period) / period
    const dir = Math.floor(t / period) % 2 === 0 ? 1 : -1
    const z = (u * 2 - 1) * (L / 2 - 1.2) * dir
    const x = Math.sin(u * Math.PI) * 2.2 * dir + Math.sin(t * 0.7) * 0.6
    const y = 0.2 + Math.sin(u * Math.PI) * 2.6
    if (ball.current) {
      ball.current.position.set(x, y, z)
      ball.current.visible = st.opacity > 0.01
    }

    st.history.unshift(new THREE.Vector3(x, y, z))
    if (st.history.length > TRAIL) st.history.length = TRAIL
    if (trail.current) {
      for (let i = 0; i < TRAIL; i++) {
        const p = st.history[i]
        if (!p) dummy.scale.setScalar(0)
        else {
          dummy.position.copy(p)
          dummy.scale.setScalar(0.16 * (1 - i / TRAIL))
        }
        dummy.updateMatrix()
        trail.current.setMatrixAt(i, dummy.matrix)
      }
      trail.current.instanceMatrix.needsUpdate = true
      trail.current.visible = st.opacity > 0.01
    }
  })

  return (
    <group ref={group} position={[0, -1.6, 0]}>
      {/* Soft halo underneath the crisp line — additive, so it reads as glow. */}
      <instancedMesh ref={glow} args={[box, undefined, courtSegs.length]} frustumCulled={false}>
        <meshBasicMaterial color={COLORS.green} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={court} args={[box, undefined, courtSegs.length]} frustumCulled={false}>
        <meshBasicMaterial color={COLORS.volt} transparent opacity={0} />
      </instancedMesh>
      <instancedMesh ref={grid} args={[box, undefined, gridSegs.length]} frustumCulled={false}>
        <meshBasicMaterial color={COLORS.green} transparent opacity={0} depthWrite={false} />
      </instancedMesh>

      {/* Net: a translucent wire band at centre court. */}
      <mesh ref={net} position={[0, 0.52, 0]}>
        <planeGeometry args={[W + 0.9, 1.04, 40, 8]} />
        <meshBasicMaterial color={COLORS.green} transparent opacity={0} side={THREE.DoubleSide} wireframe />
      </mesh>

      <mesh ref={ball}>
        <sphereGeometry args={[0.2, 20, 16]} />
        <meshBasicMaterial color={COLORS.volt} />
      </mesh>

      <instancedMesh ref={trail} args={[undefined, undefined, TRAIL]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshBasicMaterial color={COLORS.green} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
    </group>
  )
}

export const tennisCamera = { base: [0, 6.5, 17] as const, scroll: [0, 8, -9] as const, fov: 50, lookY: -1.6 }
