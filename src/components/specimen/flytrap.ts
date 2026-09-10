import * as THREE from "three";
import { parametricGeometry } from "./geometry";
import { tint } from "./flower";

/* ------------------------------------------------------------------ *
 * Dionaea muscipula — Venus flytrap morphology (data only)
 * Local frame of one trap: +Z along the midrib/hinge, lobes open in ±X,
 * inner faces bulge toward +Y.
 * ------------------------------------------------------------------ */

export interface TrapSpec {
  /** midrib length of a lobe */
  length: number;
  /** maximum half-width of a lobe */
  width: number;
  /** inward cupping of the lobe surface */
  cup: number;
  /** half-angle of the gape, radians */
  open: number;
  /** marginal teeth */
  cilia: { count: number; length: number };
}

export interface PetioleSpec {
  /** distance travelled along the ground plane */
  reach: number;
  /** height gained */
  rise: number;
  /** maximum half-width of the winged lamina */
  width: number;
  /** transverse cupping of the lamina */
  cup: number;
}

export interface TrapPlacement {
  angle: number;
  tilt: number;
  scale: number;
  roll: number;
}

export interface FlytrapMorphology {
  trap: TrapSpec;
  petiole: PetioleSpec;
  rhizome: { length: number; radius: number; flare: number; flutes: number };
  traps: TrapPlacement[];
}

export const FLYTRAP: FlytrapMorphology = {
  trap: {
    length: 0.33,
    width: 0.25,
    cup: 0.055,
    open: 0.62,
    cilia: { count: 16, length: 0.115 },
  },
  petiole: { reach: 0.62, rise: 0.11, width: 0.185, cup: 0.045 },
  rhizome: { length: 0.16, radius: 0.017, flare: 1.0, flutes: 6 },

  traps: [
    { angle: 0.12, tilt: 0.3, scale: 1, roll: 0.05 },
    { angle: 0.92, tilt: 0.16, scale: 0.84, roll: -0.12 },
    { angle: 1.78, tilt: 0.38, scale: 0.95, roll: 0.1 },
    { angle: 2.62, tilt: 0.12, scale: 0.78, roll: -0.05 },
    { angle: 3.42, tilt: 0.34, scale: 0.92, roll: 0.13 },
    { angle: 4.26, tilt: 0.2, scale: 0.86, roll: -0.09 },
    { angle: 5.12, tilt: 0.4, scale: 0.98, roll: 0.06 },
    { angle: 5.78, tilt: 0.1, scale: 0.74, roll: -0.14 },
  ],
};

/** Flowering scape: a tall bare stalk carrying a small umbel of flowers. */
export const SCAPE = {
  stem: { length: 1.18, radius: 0.011, flare: 1.15, flutes: 5 },
  flowers: [
    { pos: [0.12, 1.15, 0.05], tilt: 0.5, spin: 0.3, scale: 1 },
    { pos: [-0.13, 1.08, -0.04], tilt: -0.55, spin: 1.4, scale: 0.9 },
    { pos: [0.02, 1.26, -0.1], tilt: 0.15, spin: 2.5, scale: 0.82 },
  ] as { pos: [number, number, number]; tilt: number; spin: number; scale: number }[],
  buds: [
    { pos: [-0.08, 1.21, 0.08] as [number, number, number], scale: 0.9 },
    { pos: [0.14, 1.02, -0.06] as [number, number, number], scale: 0.75 },
    { pos: [-0.03, 1.3, 0.02] as [number, number, number], scale: 0.6 },
  ],

};

/** Five flat spreading petals of one scape flower. */
export function scapeFlowerTepals() {
  return Array.from({ length: 5 }, (_, i) => ({
    length: 0.115,
    width: 0.062,
    out: 0.92,
    rise: 0.2,
    curl: 0.05,
    cup: 0.18,
    twist: 0.04,
    sweep: 0.02,
    tipRound: 0.42,
    angle: (i / 5) * Math.PI * 2,
    attach: 0.012,
    tilt: 0.1,
  }));
}


const seg = (n: number, q: number) => Math.max(5, Math.round(n * q));

/** Lateral extent of a lobe at parameter u — kidney shaped, rounded at both ends. */
function lobeWidth(t: TrapSpec, u: number) {
  return t.width * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.78)), 0.5);
}

/**
 * A point on one lobe. The lobe is a flat kidney-shaped blade attached along
 * the midrib (the Z axis) and rotated about it by the gape half-angle, so the
 * two valves open like a book. sign = +1 / -1 selects the valve.
 */
export function lobePoint(t: TrapSpec, sign: 1 | -1, u: number, v: number, out: THREE.Vector3) {
  const r = v * lobeWidth(t, u);
  // outward convexity of the valve, strongest across the middle of the blade
  const bulge = -t.cup * Math.pow(Math.sin(Math.PI * Math.pow(v, 0.9)), 1.05) * Math.sin(Math.PI * u);
  const th = t.open;
  const c = Math.cos(th);
  const s = Math.sin(th);
  const x = (r * c - bulge * s) * sign;
  const y = r * s + bulge * c + 0.03 * Math.sin(Math.PI * u);
  return out.set(x, y, t.length * u);
}

/** Smooth high-resolution lobe surface. */
export function createLobeGeometry(t: TrapSpec, sign: 1 | -1, q = 1) {
  return tint(
    parametricGeometry((u, v, out) => lobePoint(t, sign, u, v, out), seg(84, q), seg(30, q)),
  );
}

/** Marginal teeth: long thin cilia continuing the lobe plane radially outward. */
export function createCiliaLayout(t: TrapSpec, sign: 1 | -1) {
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion();

  return Array.from({ length: t.cilia.count }, (_, i) => {
    const u = 0.07 + (i / (t.cilia.count - 1)) * 0.86;
    lobePoint(t, sign, u, 1, a);
    lobePoint(t, sign, u, 0.9, b);
    dir.copy(a).sub(b).normalize();
    // fan the teeth apart following the outline of the margin
    const spread = (u - 0.5) * 1.1;
    dir.z += spread;
    dir.y += 0.16;
    dir.normalize();
    q.setFromUnitVectors(up, dir);
    const len = t.cilia.length * (0.5 + 0.5 * Math.sin(Math.PI * Math.pow(u, 0.9)));
    return {
      pos: [a.x, a.y, a.z] as [number, number, number],
      quat: [q.x, q.y, q.z, q.w] as [number, number, number, number],
      len,
    };
  });
}


/** Three trigger hairs on the inner face of each lobe. */
export function createTriggerLayout(t: TrapSpec, sign: 1 | -1) {
  const p = new THREE.Vector3();
  return [
    [0.42, 0.3],
    [0.58, 0.5],
    [0.36, 0.58],
  ].map(([u, v]) => {
    lobePoint(t, sign, u!, v!, p);
    return { pos: [p.x, p.y, p.z] as [number, number, number] };
  });
}

/** Centerline of the winged petiole, from the rhizome out to the trap. */
function petioleCurve(p: PetioleSpec) {
  return new THREE.CatmullRomCurve3(
    Array.from({ length: 9 }, (_, i) => {
      const u = i / 8;
      // steep out of the rhizome, then flattening into a low outward arc
      const y = p.rise * (Math.sin(Math.PI * 0.5 * Math.pow(u, 0.5)) - 0.25 * u * u);
      return new THREE.Vector3(0, y, p.reach * Math.pow(u, 1.12));

    }),
    false,
    "centripetal",
  );
}

/** Where the trap attaches, and the pitch of the petiole tip. */
export function petioleTip(p: PetioleSpec) {
  const curve = petioleCurve(p);
  const pt = curve.getPoint(1);
  const tg = curve.getTangent(1).normalize();
  return { pos: [pt.x, pt.y, pt.z] as [number, number, number], pitch: Math.atan2(tg.y, tg.z) };
}

/** Flat winged lamina — the "leaf" of the flytrap. */
export function createPetioleGeometry(p: PetioleSpec, q = 1) {
  const curve = petioleCurve(p);
  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);

  return tint(
    parametricGeometry(
      (u, v, out) => {
        const s = (v - 0.5) * 2;
        curve.getPoint(u, point);
        curve.getTangent(u, tangent).normalize();
        side.crossVectors(up, tangent).normalize();
        normal.crossVectors(tangent, side).normalize();
        // narrow at the rhizome, widest around two thirds, narrowing into the trap
        // narrow stalk at the rhizome, broadening into a spatulate wing, then
        // pinching in just before the trap
        const wing = Math.pow(u, 1.5) * (1 - 0.55 * Math.pow(u, 6));
        const prof = 0.18 + 1.5 * wing;
        const w = p.width * Math.max(0.02, prof);
        const cup = -s * s * w * p.cup * 6;

        out.copy(point).addScaledVector(side, s * w).addScaledVector(normal, cup);
      },
      seg(80, q),
      seg(24, q),
    ),
  );
}
