import * as THREE from "three";
import { parametricGeometry } from "./geometry";

/* ------------------------------------------------------------------ *
 * Astromirabilis grandiflora — flower head morphology (data only)
 * ------------------------------------------------------------------ */

export interface TepalSpec2 {
  /** arc length of the blade */
  length: number;
  /** maximum half-width */
  width: number;
  /** how far outward from the axis the centerline travels (0 = vertical) */
  out: number;
  /** how far up the centerline rises */
  rise: number;
  /** downward recurve applied to the outer ~35% */
  curl: number;
  /** transverse cupping */
  cup: number;
  /** longitudinal twist, radians */
  twist: number;
  /** lateral sweep of the midrib (asymmetry) */
  sweep: number;
  /** 0.35..0.8 — lower = broader, more rounded tip */
  tipRound: number;
  /** azimuth placement, radians */
  angle: number;
  /** radial offset of the attachment point from the axis */
  attach: number;
  /** small tilt applied at the attachment */
  tilt: number;
  /** uniform scale multiplier */
  scale?: number;
}

export interface FlowerMorphology {
  receptacle: { radius: number; height: number };
  stem: { length: number; radius: number; flare: number; flutes: number };
  central: TepalSpec2;
  inner: TepalSpec2[];
  outer: TepalSpec2[];
  basal: TepalSpec2[];
  stamens: { count: number; height: number; spread: number };
}

/** deterministic pseudo-variation in [-1, 1] */
const vary = (i: number, salt: number) => {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

function outerRing(count: number): TepalSpec2[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + vary(i, 3) * 0.09;
    return {
      length: 0.66 * (1 + vary(i, 1) * 0.05),
      width: 0.3 * (1 + vary(i, 2) * 0.05),
      out: 0.82,
      rise: 0.5 + vary(i, 4) * 0.06,
      curl: 0.34 * (1 + vary(i, 5) * 0.08),
      cup: 0.5 + vary(i, 6) * 0.06,
      twist: 0.16 * (i % 2 === 0 ? 1 : -1) + vary(i, 7) * 0.06,
      sweep: 0.07 * (i % 2 === 0 ? 1 : -1),
      tipRound: 0.58,
      angle: a,
      attach: 0.07,
      tilt: 0.05 + vary(i, 8) * 0.06,
    };
  });
}

function innerRing(count: number): TepalSpec2[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + 0.62 + vary(i, 11) * 0.08;
    return {
      length: 0.52 * (1 + vary(i, 12) * 0.06),
      width: 0.225 * (1 + vary(i, 13) * 0.06),
      out: 0.36,
      rise: 0.96,
      curl: 0.16,
      cup: 0.8,
      twist: 0.1 * (i % 2 === 0 ? 1 : -1),
      sweep: 0.05 * vary(i, 14),
      tipRound: 0.62,
      angle: a,
      attach: 0.045,
      tilt: -0.16 + vary(i, 15) * 0.05,
    };
  });
}

function basalRing(count: number): TepalSpec2[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + 1.15;
    return {
      length: 0.3 * (1 + vary(i, 21) * 0.08),
      width: 0.11,
      out: 0.9,
      rise: 0.06,
      curl: 0.72,
      cup: 0.3,
      twist: 0.2 * vary(i, 22),
      sweep: 0.08 * vary(i, 23),
      tipRound: 0.6,
      angle: a,
      attach: 0.085,
      tilt: 0.5 + vary(i, 24) * 0.1,
    };
  });
}

export const FLOWER: FlowerMorphology = {
  receptacle: { radius: 0.115, height: 0.13 },
  stem: { length: 1.9, radius: 0.017, flare: 1.3, flutes: 5 },
  central: {
    length: 0.8,
    width: 0.27,
    out: 0.14,
    rise: 1.0,
    curl: 0.06,
    cup: 0.95,
    twist: 0.06,
    sweep: 0.03,
    tipRound: 0.66,
    angle: 0.32,
    attach: 0.012,
    tilt: -0.05,
  },
  inner: innerRing(4),
  outer: outerRing(6),
  basal: basalRing(4),
  stamens: { count: 14, height: 0.2, spread: 0.06 },
};

/* ------------------------------------------------------------------ *
 * Generators
 * q = 1 -> smooth render geometry, q ~ 0.28 -> coarse scan overlay twin
 * ------------------------------------------------------------------ */

const seg = (n: number, q: number) => Math.max(5, Math.round(n * q));

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/**
 * Archive palette. Dense base -> periwinkle body -> pale lavender tips,
 * with a brighter cobalt margin.
 */
export const PALETTE = {
  dense: "#2b3f9e",
  mid: "#8987EC",
  pale: "#F0EDFA",
  rim: "#598FFD",
  ink: "#5E4C3C",
  ground: "#C7CC10",
} as const;

const DENSE = new THREE.Color(PALETTE.dense);
const MID = new THREE.Color(PALETTE.mid);
const PALE = new THREE.Color(PALETTE.pale);
const RIM = new THREE.Color(PALETTE.rim);

function tint(geo: THREE.BufferGeometry) {
  const uv = geo.getAttribute("uv");
  const colors = new Float32Array(uv.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i);
    const s = Math.abs(uv.getY(i) - 0.5) * 2;
    c.copy(DENSE).lerp(MID, smoothstep(0, 0.4, u)).lerp(PALE, smoothstep(0.3, 1, u) * 0.8);
    c.lerp(RIM, Math.pow(s, 2.4) * 0.6);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

/**
 * A single tepal: a dense parametric membrane swept along a smooth
 * CatmullRom centerline with continuous width / cup / twist functions.
 * Local frame: +Z outward from the flower axis, +Y up, X across the blade.
 */
export function createTepalGeometry(t: TepalSpec2, q = 1) {
  const centerline = new THREE.CatmullRomCurve3(
    Array.from({ length: 12 }, (_, i) => {
      const u = i / 11;
      const outward = t.length * t.out * Math.pow(u, 0.92);
      const lift = t.rise * Math.sin(Math.PI * 0.5 * Math.pow(u, 0.86));
      const curl = t.curl * Math.pow(smoothstep(0.5, 1, u), 1.7);
      return new THREE.Vector3(
        t.sweep * t.length * Math.pow(u, 1.7),
        t.length * (lift - curl),
        outward,
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
  const face = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const alt = new THREE.Vector3(0, 0, 1);

  const geo = parametricGeometry(
    (u, v, out) => {
      const s = (v - 0.5) * 2;
      centerline.getPoint(u, point);
      centerline.getTangent(u, tangent).normalize();
      const ref = Math.abs(tangent.dot(up)) > 0.95 ? alt : up;
      side.crossVectors(ref, tangent).normalize();
      normal.crossVectors(tangent, side).normalize();

      // Broad rounded outline: low exponent keeps the tip full rather than
      // collapsing into a triangular point.
      const prof = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.78)), t.tipRound) * (1 - 0.1 * u);
      const w = t.width * Math.max(0.0015, prof);

      const tw = t.twist * smoothstep(0, 1, u);
      lateral.copy(side).multiplyScalar(Math.cos(tw)).addScaledVector(normal, Math.sin(tw));
      face.copy(normal).multiplyScalar(Math.cos(tw)).addScaledVector(side, -Math.sin(tw));

      const cup = -s * s * w * t.cup * (1 - 0.4 * smoothstep(0.6, 1, u));
      const roll = s * s * s * w * 0.06 * Math.sin(Math.PI * u);

      out.copy(point)
        .addScaledVector(lateral, s * w)
        .addScaledVector(face, cup + roll);
    },
    seg(72, q),
    seg(30, q),
  );
  return tint(geo);
}

/** Compact organic receptacle — a deformed high-resolution dome, not a sphere. */
export function createReceptacleGeometry(r: FlowerMorphology["receptacle"], q = 1) {
  return tint(
    parametricGeometry(
      (u, v, out) => {
        const a = v * Math.PI * 2;
        const prof =
          Math.pow(Math.sin(Math.PI * (0.1 + u * 0.82)), 0.7) *
          (1 + 0.05 * Math.cos(a * 6) + 0.04 * Math.sin(u * Math.PI * 2));
        const rad = r.radius * prof;
        const y = r.height * (u - 0.06 * Math.sin(u * Math.PI) * Math.cos(a * 3));
        out.set(Math.cos(a) * rad, y, Math.sin(a) * rad);
      },
      seg(56, q),
      seg(64, q),
    ),
  );
}

/** Thin scape descending from the receptacle and cropped by the frame. */
export function createStemGeometry(s: FlowerMorphology["stem"], q = 1) {
  return tint(
    parametricGeometry(
      (u, v, out) => {
        const a = v * Math.PI * 2;
        const flute = 1 + Math.cos(a * s.flutes) * 0.07;
        const grow = 1 + (s.flare - 1) * Math.pow(u, 1.25);
        const neck = 1 + 1.5 * Math.pow(1 - Math.min(1, u * 14), 3);
        const r = s.radius * grow * flute * Math.max(1, neck);
        const bend = Math.sin(u * 1.1) * 0.05;
        out.set(Math.cos(a) * r + bend, -u * s.length, Math.sin(a) * r);
      },
      seg(80, q),
      seg(36, q),
    ),
  );
}

/** Filament + anther placement for the central boss. */
export function createStamenLayout(s: FlowerMorphology["stamens"]) {
  return Array.from({ length: s.count }, (_, i) => {
    const a = (i / s.count) * Math.PI * 2 + i * 0.7;
    const r = s.spread * (0.3 + ((i * 13) % 7) / 9);
    return {
      pos: [Math.cos(a) * r, 0, Math.sin(a) * r] as [number, number, number],
      rot: [Math.sin(a) * 0.26, 0, -Math.cos(a) * 0.26] as [number, number, number],
      len: s.height * (0.55 + ((i * 29) % 13) / 24),
    };
  });
}
