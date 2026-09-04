import * as THREE from "three";

/**
 * Parametric surface helper: builds an indexed BufferGeometry from a (u,v) map.
 */
export function parametricGeometry(
  fn: (u: number, v: number, out: THREE.Vector3) => void,
  segU = 40,
  segV = 20,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const p = new THREE.Vector3();

  for (let i = 0; i <= segU; i++) {
    const u = i / segU;
    for (let j = 0; j <= segV; j++) {
      const v = j / segV;
      fn(u, v, p);
      positions.push(p.x, p.y, p.z);
      uvs.push(u, v);
    }
  }
  for (let i = 0; i < segU; i++) {
    for (let j = 0; j < segV; j++) {
      const a = i * (segV + 1) + j;
      const b = a + segV + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

/* ------------------------------------------------------------------ *
 * Morphology description — one species = one config object.
 * ------------------------------------------------------------------ */

export interface TepalSpec {
  length: number;
  width: number;
  /** initial upward lift of the midrib, as fraction of length */
  rise: number;
  /** overall downward sag toward the tip */
  drop: number;
  /** extra downward turn applied to the outer ~30% */
  recurve: number;
  /** transverse cupping of the blade */
  cup: number;
  /** sideways sweep of the midrib (asymmetry) */
  sweep: number;
}

export interface LeafSpec {
  /** height along the stem, 0..1 */
  node: number;
  /** rotation around the stem axis, radians */
  around: number;
  /** downward/upward tilt of the petiole, radians (negative = up) */
  tilt: number;
  petiole: number;
  length: number;
  width: number;
  /** curvature of the midrib, positive = drooping */
  arch: number;
  /** longitudinal twist, radians over the blade */
  twist: number;
  scale?: number;
}

export interface Morphology {
  stem: { height: number; radius: number; taper: number; sway: number; flutes: number };
  receptacle: { radius: number; height: number };
  flower: {
    tepalCount: number;
    tepal: TepalSpec;
    innerRatio: number;
    stamenCount: number;
    stamenHeight: number;
    stamenSpread: number;
  };
  leaves: LeafSpec[];
  fruit: { node: number; around: number; pedicel: number; size: number };
}

export const ASTROMIRABILIS: Morphology = {
  stem: { height: 1.5, radius: 0.03, taper: 0.42, sway: 0.045, flutes: 5 },
  receptacle: { radius: 0.115, height: 0.13 },
  flower: {
    tepalCount: 6,
    tepal: {
      length: 0.95,
      width: 0.42,
      rise: 0.2,
      drop: 0.2,
      recurve: 0.42,
      cup: 0.32,
      sweep: 0.06,
    },
    innerRatio: 0.52,
    stamenCount: 14,
    stamenHeight: 0.3,
    stamenSpread: 0.085,
  },
  leaves: [
    { node: 0.22, around: 0.35, tilt: 0.42, petiole: 0.14, length: 0.86, width: 0.2, arch: 0.5, twist: 0.35 },
    { node: 0.5, around: 2.79, tilt: -0.12, petiole: 0.11, length: 0.66, width: 0.155, arch: 0.42, twist: -0.3 },
    { node: 0.72, around: 4.97, tilt: 0.16, petiole: 0.085, length: 0.48, width: 0.115, arch: 0.36, twist: 0.28 },
  ],
  fruit: { node: 0.86, around: -0.7, pedicel: 0.3, size: 0.1 },
};

/* ------------------------------------------------------------------ *
 * Generators
 *
 * Every generator takes a quality multiplier `q`:
 *   q = 1    -> high-resolution render geometry (smooth silhouette)
 *   q = 0.3  -> coarse twin used only for the faint scan-line overlay
 * ------------------------------------------------------------------ */

const seg = (n: number, q: number) => Math.max(4, Math.round(n * q));

/** Smooth 0..1 ramp, C1-continuous. */
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/** Fluted hollow scape, slightly tapered. */
export function createStemGeometry(s: Morphology["stem"], q = 1) {
  return parametricGeometry(
    (u, v, out) => {
      const a = v * Math.PI * 2;
      const flute = 1 + Math.cos(a * s.flutes) * 0.1;
      const r = s.radius * (1 - s.taper * u) * flute;
      const sway = Math.sin(u * 1.35) * s.sway;
      out.set(Math.cos(a) * r + sway, u * s.height, Math.sin(a) * r);
    },
    seg(64, q),
    seg(40, q),
  );
}

/** Compact widened receptacle that the tepals grow out of. */
export function createReceptacleGeometry(r: Morphology["receptacle"], q = 1) {
  return parametricGeometry(
    (u, v, out) => {
      const a = v * Math.PI * 2;
      // narrow at the stem, flaring into a shallow cushion
      const prof = Math.pow(Math.sin(Math.PI * (0.12 + u * 0.78)), 0.75);
      const rad = r.radius * prof * (1 + Math.cos(a * 6) * 0.04);
      out.set(Math.cos(a) * rad, u * r.height, Math.sin(a) * rad);
    },
    seg(48, q),
    seg(56, q),
  );
}

/**
 * Broad recurved tepal: narrow at the receptacle, widest around 40% of its
 * length, sweeping mostly OUTWARD with a continuous downward recurve.
 * Local frame: +Z is outward from the flower axis, Y is up, X across the blade.
 */
export function createTepalGeometry(t: TepalSpec, q = 1) {
  const centerline = new THREE.CatmullRomCurve3(
    Array.from({ length: 9 }, (_, i) => {
      const u = i / 8;
      const lift = t.rise * Math.sin(Math.PI * smoothstep(0, 0.6, u) * 0.62);
      const sag = t.drop * u * u;
      const curl = t.recurve * Math.pow(smoothstep(0.6, 1, u), 1.6);
      return new THREE.Vector3(
        t.sweep * t.length * Math.pow(u, 1.6),
        t.length * (lift - sag - curl),
        t.length * (0.06 + 0.94 * Math.pow(u, 0.92)),
      );
    }),
    false,
    "centripetal",
  );
  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const lateral = new THREE.Vector3();
  const bladeNormal = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);

  return parametricGeometry(
    (u, v, out) => {
      const s = (v - 0.5) * 2;
      centerline.getPoint(u, point);
      centerline.getTangent(u, tangent).normalize();
      side.crossVectors(up, tangent).normalize();
      normal.crossVectors(tangent, side).normalize();

      // A continuous membrane profile: almost pinched at the attachment and
      // smoothly convergent at the tip, without polygonal corner transitions.
      const profile = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.68)), 0.88) * (1 - 0.22 * u);
      const w = t.width * Math.max(0.002, profile);
      const cup = -s * s * w * t.cup * (1 - 0.45 * smoothstep(0.55, 1, u));
      const edgeRoll = s * s * w * 0.08 * Math.sin(Math.PI * u);

      out.copy(point)
        .addScaledVector(side, s * w)
        .addScaledVector(normal, cup + edgeRoll);
    },
    seg(64, q),
    seg(24, q),
  );
}

/** Lanceolate blade: narrow at the petiole, widest ~40%, arched and twisted. */
export function createLeafGeometry(l: LeafSpec, q = 1) {
  const centerline = new THREE.CatmullRomCurve3(
    Array.from({ length: 8 }, (_, i) => {
      const u = i / 7;
      return new THREE.Vector3(0, -l.arch * l.length * Math.pow(u, 1.9), u * l.length);
    }),
    false,
    "centripetal",
  );
  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);

  return parametricGeometry(
    (u, v, out) => {
      const s = (v - 0.5) * 2;
      centerline.getPoint(u, point);
      centerline.getTangent(u, tangent).normalize();
      side.crossVectors(up, tangent).normalize();
      normal.crossVectors(tangent, side).normalize();

      const asym = 1 + s * 0.045;
      const profile = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.62)), 0.92) * (1 - 0.13 * u);
      const w = l.width * Math.max(0.0015, profile) * asym;
      const tw = l.twist * smoothstep(0, 1, u);
      lateral.copy(side).multiplyScalar(Math.cos(tw)).addScaledVector(normal, Math.sin(tw));
      bladeNormal.copy(normal).multiplyScalar(Math.cos(tw)).addScaledVector(side, -Math.sin(tw));
      const fold = s * s * w * 0.22 * Math.sin(Math.PI * u);

      out.copy(point)
        .addScaledVector(lateral, s * w)
        .addScaledVector(bladeNormal, fold);
    },
    seg(60, q),
    seg(20, q),
  );
}

/** Central midrib strand for a leaf. */
export function createMidribGeometry(l: LeafSpec) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 32; i++) {
    const u = i / 32;
    pts.push(new THREE.Vector3(0, -l.arch * l.length * Math.pow(u, 1.9), u * l.length));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, l.width * 0.04, 16, false);
}

/** Thin filament + anther positions for the central stamen cluster. */
export function createStamenGeometry(f: Morphology["flower"]) {
  const out: { pos: [number, number, number]; rot: [number, number, number]; len: number }[] = [];
  for (let i = 0; i < f.stamenCount; i++) {
    const a = (i / f.stamenCount) * Math.PI * 2 + i * 0.7;
    const r = f.stamenSpread * (0.35 + ((i * 13) % 7) / 9);
    const len = f.stamenHeight * (0.62 + ((i * 29) % 13) / 26);
    out.push({
      pos: [Math.cos(a) * r, 0, Math.sin(a) * r],
      rot: [Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3],
      len,
    });
  }
  return out;
}

/** Three-chambered pendent capsule. */
export function createFruitGeometry(size = 0.1, q = 1) {
  return parametricGeometry(
    (u, v, out) => {
      const a = v * Math.PI * 2;
      const lobes = 1 + Math.cos(a * 3) * 0.16;
      const prof = Math.sin(u * Math.PI) * (0.55 + 0.45 * Math.sin(u * Math.PI));
      const r = prof * size * lobes;
      out.set(Math.cos(a) * r, (u - 0.5) * size * 2.6, Math.sin(a) * r);
    },
    seg(64, q),
    seg(48, q),
  );
}

/** Winged seed body (shown as an exploded anatomical detail). */
export function createSeedGeometry(size = 0.09, q = 1) {
  return parametricGeometry(
    (u, v, out) => {
      const a = v * Math.PI * 2;
      const r = Math.sin(u * Math.PI) * size;
      out.set(Math.cos(a) * r * 0.8, (u - 0.5) * size * 3.1, Math.sin(a) * r);
    },
    seg(44, q),
    seg(44, q),
  );
}

