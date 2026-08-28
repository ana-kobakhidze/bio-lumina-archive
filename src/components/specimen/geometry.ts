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

/** Recurved tepal / petal blade. */
export function petalGeometry(opts?: {
  length?: number;
  width?: number;
  curl?: number;
  recurve?: number;
  cup?: number;
}) {
  const length = opts?.length ?? 1.05;
  const width = opts?.width ?? 0.3;
  // arc swept by the midrib, in radians, measured from the start angle
  const arc = opts?.curl ?? 3.05;
  const start = opts?.recurve ?? 0.45;
  const cup = opts?.cup ?? 0.5;

  return parametricGeometry(
    (u, v, out) => {
      const t = u;
      const w = Math.sin(Math.pow(t, 0.6) * Math.PI) * width * (1 - 0.3 * t);
      const s = (v - 0.5) * 2; // -1..1 across the blade
      // midrib: integrate a constantly turning tangent -> outward then recurved down
      const phi = start + arc * t;
      const spineZ = (length * (Math.cos(start) - Math.cos(phi))) / arc;
      const spineY = (length * (Math.sin(phi) - Math.sin(start))) / arc;
      const cupY = -Math.pow(s, 2) * w * cup;
      out.set(s * w, spineY + cupY, spineZ + Math.pow(s, 2) * w * 0.16);
    },
    28,
    10,
  );
}

/** Lanceolate leaf blade with a slight longitudinal fold. */
export function leafGeometry(length = 1.05, width = 0.22) {
  return parametricGeometry(
    (u, v, out) => {
      const w = Math.sin(Math.pow(u, 0.55) * Math.PI) * width;
      const s = (v - 0.5) * 2;
      const droop = -Math.pow(u, 2.1) * length * 0.42;
      out.set(s * w, droop + Math.abs(s) * w * 0.35, u * length);
    },
    24,
    8,
  );
}

/** Fluted hollow scape. */
export function stemGeometry(height = 2.0) {
  return parametricGeometry(
    (u, v, out) => {
      const a = v * Math.PI * 2;
      const flute = 1 + Math.cos(a * 5) * 0.12;
      const r = (0.042 - 0.018 * u) * flute;
      const sway = Math.sin(u * 1.4) * 0.06;
      out.set(Math.cos(a) * r + sway, u * height, Math.sin(a) * r);
    },
    22,
    14,
  );
}

/** Three-chambered pendent capsule. */
export function capsuleFruitGeometry(size = 0.115) {
  return parametricGeometry(
    (u, v, out) => {
      const a = v * Math.PI * 2;
      const lobes = 1 + Math.cos(a * 3) * 0.18;
      const prof = Math.sin(u * Math.PI) * (0.55 + 0.45 * Math.sin(u * Math.PI));
      const r = prof * size * lobes;
      out.set(Math.cos(a) * r, (u - 0.5) * size * 2.6, Math.sin(a) * r);
    },
    24,
    20,
  );
}

/** Winged seed body. */
export function seedGeometry(size = 0.09) {
  return parametricGeometry(
    (u, v, out) => {
      const a = v * Math.PI * 2;
      const r = Math.sin(u * Math.PI) * size;
      out.set(Math.cos(a) * r * 0.8, (u - 0.5) * size * 3.1, Math.sin(a) * r);
    },
    18,
    18,
  );
}
