/**
 * A plain mutable object shared between the DOM (ScrollTrigger writes to it)
 * and the R3F render loop (useFrame reads it). Deliberately *not* React state:
 * these values change every frame and pushing them through re-renders would
 * cost far more than the render itself.
 */

export type Phase = {
  /** 0 → 1 across the hero section */
  hero: number
  /** 0 → 1 across the pinned divisions section */
  divisions: number
  /** index of the focused division, fractional while scrubbing */
  divisionIndex: number
  /** scroll velocity, normalised and smoothed, roughly −1 … 1 */
  velocity: number
  /** overall document progress 0 → 1 */
  page: number
  /** pointer in normalised device coords */
  pointer: { x: number; y: number }
  /** true once the preloader has handed over */
  entered: boolean
  /**
   * Divisions journey: fractional station index (0 = the intro, 1…n = the
   * sports) the camera is flying towards, or -1 when the journey is not on screen.
   */
  journey: number
  /**
   * Reading direction. The 3D layer stages itself opposite the copy, and the
   * copy flips sides with the language, so the scene has to know which way the
   * page reads. Kept here rather than read from the DOM every frame.
   */
  rtl: boolean
}

export const phase: Phase = {
  hero: 0,
  divisions: 0,
  divisionIndex: 0,
  velocity: 0,
  page: 0,
  pointer: { x: 0, y: 0 },
  entered: false,
  journey: -1,
  rtl: true,
}

/** Frame-rate independent lerp. `speed` is roughly "units per second". */
export function damp(current: number, target: number, speed: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-speed * dt))
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

// Exposed for debugging in the browser console (read-only use).
if (typeof window !== 'undefined') (window as unknown as { __iqPhase?: Phase }).__iqPhase = phase
