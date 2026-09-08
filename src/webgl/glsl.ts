/**
 * Shared GLSL. Kept as plain strings so there is no loader/plugin in the build
 * chain and the shaders stay readable next to the components that use them.
 */

/** Ashima / Stefan Gustavson simplex noise, 3D. Public domain. */
export const SIMPLEX_3D = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`

/* ------------------------------------------------------------------ ribbon */

/**
 * The two brand ribbons are extruded straight from the logo outline, then
 * pushed through a travelling noise field so they read as fabric caught in
 * motion rather than a spinning solid. The wave amplitude ramps along X so the
 * ribbon stays anchored at the leading edge and flows at the trailing one —
 * that asymmetry is what makes it look like it is being pulled, not wobbling.
 */
export const RIBBON_VERT = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uFlow;
uniform float uHalfWidth;
uniform vec2  uPointer;

varying vec2  vUv;
varying vec3  vNormalW;
varying vec3  vViewDir;
varying float vWave;
varying float vDepth;

${SIMPLEX_3D}

void main() {
  vUv = uv;

  vec3 pos = position;

  // 0 at the anchored (leading) edge, 1 at the trailing edge. Normalised by the
  // mesh's real half-width so the ramp spans the whole shape at any scale.
  float along = clamp(position.x / max(uHalfWidth, 0.001) * 0.5 + 0.5, 0.0, 1.0);
  float ramp  = pow(along, 1.6);

  float t = uTime * uFlow;
  float n1 = snoise(vec3(pos.x * 0.55, pos.y * 0.9, t * 0.32));
  float n2 = snoise(vec3(pos.x * 1.30 + 4.2, pos.y * 1.6, t * 0.52));
  float wave = n1 * 0.72 + n2 * 0.28;

  // Pointer parallax bends the sheet toward the cursor without moving the mesh.
  float lean = dot(normalize(vec3(uPointer, 1.0)), vec3(0.0, 0.0, 1.0));

  float disp = wave * uAmp * ramp;
  pos += normal * disp;
  pos.z += ramp * (uPointer.x * 0.22 + lean * 0.05);
  pos.y += ramp * uPointer.y * 0.14;

  vWave = wave;

  vec4 world = modelMatrix * vec4(pos, 1.0);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewDir = normalize(cameraPosition - world.xyz);

  vec4 mv = viewMatrix * world;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`

export const RIBBON_FRAG = /* glsl */ `
precision highp float;

uniform vec3  uColor;
uniform vec3  uColorAlt;
uniform vec3  uColorDeep;
uniform float uTime;
uniform float uOpacity;
uniform float uEnergy;

varying vec2  vUv;
varying vec3  vNormalW;
varying vec3  vViewDir;
varying float vWave;
varying float vDepth;

void main() {
  vec3 n = normalize(vNormalW);
  float facing = abs(dot(n, normalize(vViewDir)));

  // Fresnel rim: the edge lights up, the flat face stays graphic and matte,
  // which is what keeps the mark legible as a logo instead of a glass blob.
  float fres = pow(1.0 - facing, 2.4);

  // Energy bands travelling along the ribbon.
  float band = sin((vUv.x * 9.0) - uTime * 1.35 + vWave * 2.2);
  band = smoothstep(0.55, 1.0, band) * uEnergy;

  vec3 col = mix(uColorDeep, uColor, facing);
  col = mix(col, uColorAlt, clamp(fres * 1.15, 0.0, 1.0));
  col += uColor * band * 0.55;
  col += uColorAlt * fres * 0.5;

  // Distance falloff so the far ribbon sits back into the black.
  float fog = 1.0 - smoothstep(5.0, 16.0, vDepth);

  gl_FragColor = vec4(col, uOpacity * mix(0.35, 1.0, fog));
  #include <colorspace_fragment>
}
`

/* --------------------------------------------------------------- particles */

export const PARTICLE_VERT = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uSpread;
uniform vec2  uPointer;
uniform float uPixelRatio;

attribute float aSeed;
attribute float aScale;

varying float vAlpha;
varying float vSeed;

${SIMPLEX_3D}

void main() {
  vec3 pos = position;

  float t = uTime * 0.06;
  // Cheap curl-ish advection: three noise samples offset in space.
  pos.x += snoise(vec3(pos.yz * 0.35, t + aSeed)) * uSpread;
  pos.y += snoise(vec3(pos.zx * 0.35, t + aSeed + 11.0)) * uSpread;
  pos.z += snoise(vec3(pos.xy * 0.35, t + aSeed + 23.0)) * uSpread * 0.6;

  pos.x += uPointer.x * 0.35;
  pos.y += uPointer.y * 0.25;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  float dist = -mv.z;

  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * uPixelRatio * (7.0 / max(dist, 0.4));

  // Fade at both ends of the depth range so nothing pops at the near plane.
  vAlpha = smoothstep(0.5, 3.0, dist) * (1.0 - smoothstep(11.0, 20.0, dist));
  vSeed = aSeed;
}
`

export const PARTICLE_FRAG = /* glsl */ `
precision mediump float;

uniform vec3  uColor;
uniform vec3  uColorAlt;
uniform float uOpacity;

varying float vAlpha;
varying float vSeed;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c);
  if (d > 0.25) discard;

  float core = 1.0 - smoothstep(0.0, 0.25, d);
  vec3 col = mix(uColor, uColorAlt, fract(vSeed * 7.31));

  gl_FragColor = vec4(col, core * vAlpha * uOpacity);
  #include <colorspace_fragment>
}
`

/* ------------------------------------------------------------ image plane */

/**
 * Curved plane used by the divisions ring. The texture is displaced by the same
 * noise field as the ribbons so the gallery feels cut from one material, and a
 * scroll-velocity-driven RGB split gives the smear that sells the motion.
 */
export const PLANE_VERT = /* glsl */ `
uniform float uTime;
uniform float uCurve;
uniform float uVelocity;

varying vec2  vUv;
varying float vBend;

void main() {
  vUv = uv;

  vec3 pos = position;
  float x = uv.x * 2.0 - 1.0;

  // Barrel the plane away from the viewer at its edges.
  pos.z -= x * x * uCurve;
  // Velocity shear: the faster you scroll, the more the panel trails.
  pos.y += x * uVelocity * 0.22;

  vBend = x;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

export const PLANE_FRAG = /* glsl */ `
precision highp float;

uniform sampler2D uMap;
uniform float uTime;
uniform float uVelocity;
uniform float uActive;
uniform float uOpacity;
uniform vec3  uTint;
uniform vec2  uCover;

varying vec2  vUv;
varying float vBend;

void main() {
  // object-fit: cover, done in UV space so the texture never distorts.
  vec2 uv = (vUv - 0.5) * uCover + 0.5;

  float shift = (abs(uVelocity) * 0.020 + abs(vBend) * 0.004);

  float r = texture2D(uMap, uv + vec2(shift, 0.0)).r;
  float g = texture2D(uMap, uv).g;
  float b = texture2D(uMap, uv - vec2(shift, 0.0)).b;
  vec3 col = vec3(r, g, b);

  // Inactive panels sit desaturated and dark; the focused one comes forward.
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  vec3 dim = mix(vec3(lum) * 0.42, col, 0.25);
  col = mix(dim, col, uActive);

  // Brand tint, deliberately faint and confined to the darkest values. The
  // source photography is black and white, so any wideband tint reads as a
  // green cast over the whole frame rather than as a graded shadow.
  float shadow = 1.0 - smoothstep(0.0, 0.35, lum);
  col += uTint * shadow * 0.05 * uActive;

  // Vignette toward the panel edges.
  float edge = 1.0 - smoothstep(0.72, 1.0, abs(vBend));
  col *= mix(0.55, 1.0, edge);

  float alpha = uOpacity * smoothstep(0.0, 0.06, uv.x) * smoothstep(1.0, 0.94, uv.x)
                          * smoothstep(0.0, 0.06, uv.y) * smoothstep(1.0, 0.94, uv.y);

  gl_FragColor = vec4(col, alpha);
  #include <colorspace_fragment>
}
`
