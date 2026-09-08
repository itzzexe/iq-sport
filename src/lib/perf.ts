/**
 * Device capability tiering.
 *
 * The 3D layer is expensive, so everything it does is scaled by a tier decided
 * once on mount. `low` still renders — it just drops to a cheaper shader path,
 * fewer particles and a capped pixel ratio — so the identity never disappears
 * on a mid-range phone.
 */

export type Tier = 'low' | 'mid' | 'high'

export type Capabilities = {
  tier: Tier
  dpr: [number, number]
  reducedMotion: boolean
  /** false when WebGL is unavailable or the user asked for reduced motion */
  webgl: boolean
  coarsePointer: boolean
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2') ??
        canvas.getContext('webgl') ??
        canvas.getContext('experimental-webgl'),
    )
  } catch {
    return false
  }
}

export function detectCapabilities(): Capabilities {
  if (typeof window === 'undefined') {
    return { tier: 'mid', dpr: [1, 1.5], reducedMotion: false, webgl: false, coarsePointer: false }
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  const webgl = hasWebGL()

  const cores = navigator.hardwareConcurrency ?? 4
  // `deviceMemory` is Chromium-only; absence is treated as "probably fine".
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  const narrow = window.innerWidth < 768

  let tier: Tier = 'high'
  if (narrow || cores <= 4 || memory <= 4) tier = 'mid'
  if (cores <= 2 || memory <= 2) tier = 'low'
  if (reducedMotion) tier = 'low'

  const dpr: [number, number] = tier === 'high' ? [1, 2] : tier === 'mid' ? [1, 1.6] : [1, 1.25]

  return { tier, dpr, reducedMotion, webgl: webgl && !reducedMotion, coarsePointer }
}

/** Particle / segment budgets keyed off the tier, kept in one place. */
export const BUDGET: Record<Tier, { ribbonSegments: number; particles: number; noiseOctaves: number }> = {
  low: { ribbonSegments: 48, particles: 0, noiseOctaves: 1 },
  mid: { ribbonSegments: 96, particles: 900, noiseOctaves: 2 },
  high: { ribbonSegments: 180, particles: 2600, noiseOctaves: 3 },
}
