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
    length: 0.4,
    width: 0.24,
    cup: 0.13,
    open: 0.62,
    cilia: { count: 17, length: 0.085 },
  },
  petiole: { reach: 0.64, rise: 0.42, width: 0.115, cup: 0.06 },
  rhizome: { length: 0.34, radius: 0.019, flare: 1.35, flutes: 6 },
  traps: [
    { angle: 0.2, tilt: -0.12, scale: 1, roll: 0.08 },
    { angle: 1.78, tilt: 0.04, scale: 0.86, roll: -0.14 },
    { angle: 3.34, tilt: -0.2, scale: 0.94, roll: 0.16 },
    { angle: 4.86, tilt: 0.12, scale: 0.78, roll: -0.1 },
  ],
};

const seg = (n: number, q: number) => Math.max(5, Math.round(n * q));

/** Half-width of a lobe at parameter u — rounded at both the hinge and the tip. */
function lobeWidth(t: TrapSpec, u: number) {
  return t.width * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.86)), 0.7);
}

/** A point on one lobe. sign = +1 / -1 selects the lobe. */
export function lobePoint(t: TrapSpec, sign: 1 | -1, u: number, v: number, out: THREE.Vector3) {
  const w = lobeWidth(t, u);
  const r = v * w;
  const bulge = t.cup * Math.pow(Math.sin(Math.PI * Math.pow(v, 0.85)), 1.1) * Math.sin(Math.PI * u);
  // the gape is widest across the middle of the trap and closes toward the tip
  const th = t.open * (0.5 + 0.5 * Math.sin(Math.PI * Math.pow(u, 0.9)));
  const lx = Math.cos(th) * sign;
  const ly = Math.sin(th);
  const nx = -Math.sin(th) * sign;
  const ny = Math.cos(th);
  return out.set(lx * r + nx * bulge, ly * r + ny * bulge, t.length * u);
}

/** Smooth high-resolution lobe surface. */
export function createLobeGeometry(t: TrapSpec, sign: 1 | -1, q = 1) {
  return tint(
    parametricGeometry((u, v, out) => lobePoint(t, sign, u, v, out), seg(84, q), seg(30, q)),
  );
}

/** Marginal teeth: thin tapering cilia continuing the lobe plane outward. */
export function createCiliaLayout(t: TrapSpec, sign: 1 | -1) {
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion();

  return Array.from({ length: t.cilia.count }, (_, i) => {
    const u = 0.08 + (i / (t.cilia.count - 1)) * 0.84;
    lobePoint(t, sign, u, 1, a);
    lobePoint(t, sign, u, 0.86, b);
    dir.copy(a).sub(b).normalize();
    // splay the teeth slightly apart, as in a closed interlocking trap
    dir.y += 0.22;
    dir.normalize();
    q.setFromUnitVectors(up, dir);
    const len = t.cilia.length * (0.45 + 0.55 * Math.sin(Math.PI * u));
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
      return new THREE.Vector3(0, p.rise * Math.sin(Math.PI * 0.5 * Math.pow(u, 0.85)), p.reach * Math.pow(u, 1.04));
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
        const prof = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.62)), 0.8) * (0.35 + 0.65 * u);
        const w = p.width * Math.max(0.004, prof);
        const cup = -s * s * w * p.cup * 6;
        out.copy(point).addScaledVector(side, s * w).addScaledVector(normal, cup);
      },
      seg(80, q),
      seg(24, q),
    ),
  );
}
