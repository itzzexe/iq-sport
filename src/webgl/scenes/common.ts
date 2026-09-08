import * as THREE from 'three'
import { BRAND } from '@/data/site'
import type { Tier } from '@/lib/perf'

/** Shared props every division scene receives. */
export type SceneProps = { tier: Tier; reducedMotion: boolean }

export const COLORS = {
  green: new THREE.Color(BRAND.green),
  volt: new THREE.Color(BRAND.volt),
  navy: new THREE.Color(BRAND.navy),
  orange: new THREE.Color(BRAND.orange),
  black: new THREE.Color(BRAND.black),
  white: new THREE.Color(BRAND.white),
}

/** Cheap hash used by several shaders for per-element variation. */
export const GLSL_HASH = /* glsl */ `
float hash11(float p){ p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
`

/**
 * Face-flat lighting with a brand rim. Used by the solid-object scenes so they
 * share one look: matte black body, a single cool key from above, and the
 * fresnel edge picking up brand green.
 */
export const GLSL_SHADE = /* glsl */ `
vec3 shade(vec3 n, vec3 v, vec3 base, vec3 rim, float rimPow) {
  float key = clamp(dot(n, normalize(vec3(0.35, 0.9, 0.4))), 0.0, 1.0);
  float fill = clamp(dot(n, normalize(vec3(-0.6, -0.2, 0.7))), 0.0, 1.0) * 0.35;
  float fres = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), rimPow);
  vec3 col = base * (0.18 + key * 0.75 + fill);
  col += rim * fres;
  return col;
}
`
