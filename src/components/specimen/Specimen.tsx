import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { PartId } from "@/lib/botany";
import {
  ASTROMIRABILIS,
  createFruitGeometry,
  createLeafGeometry,
  createMidribGeometry,
  createReceptacleGeometry,
  createSeedGeometry,
  createStamenGeometry,
  createStemGeometry,
  createTepalGeometry,
  type LeafSpec,
  type Morphology,
} from "./geometry";

const BASE = new THREE.Color("#2b1de8");
const DEEP = new THREE.Color("#5b3df0");
const EDGE = new THREE.Color("#c9c2ff");

function emphasisOf(active: PartId, id: PartId) {
  if (active === "whole" || active === id) return 1;
  return 0.22;
}

/** Translucent x-ray tissue + contour overlay. */
function Tissue({
  geometry,
  emphasis,
  color = BASE,
  thickness = 0.4,
  contour = 0.5,
}: {
  geometry: THREE.BufferGeometry;
  emphasis: number;
  color?: THREE.Color;
  thickness?: number;
  contour?: number;
}) {
  return (
    <group>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.46 * emphasis + 0.05}
          transmission={0.85}
          thickness={thickness}
          roughness={0.16}
          ior={1.42}
          metalness={0}
          attenuationColor={DEEP}
          attenuationDistance={1.4}
          iridescence={0.35}
          iridescenceIOR={1.25}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={geometry} scale={1.001}>
        <meshBasicMaterial
          color={EDGE}
          wireframe
          transparent
          opacity={contour * 0.045 * emphasis}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- */

function Stamens({ emphasis, morph }: { emphasis: number; morph: Morphology }) {
  const items = useMemo(() => createStamenGeometry(morph.flower), [morph]);
  return (
    <group>
      {items.map((s, i) => (
        <group key={i} position={s.pos} rotation={s.rot}>
          <mesh position={[0, s.len / 2, 0]}>
            <cylinderGeometry args={[0.0035, 0.005, s.len, 5]} />
            <meshBasicMaterial
              color={EDGE}
              transparent
              opacity={0.55 * emphasis}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, s.len, 0]}>
            <sphereGeometry args={[0.019, 10, 10]} />
            <meshPhysicalMaterial
              color={DEEP}
              transparent
              opacity={0.6 * emphasis}
              transmission={0.7}
              thickness={0.08}
              roughness={0.1}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Wide, flat, radial bloom sitting directly on the receptacle. */
function Flower({ emphasis, morph }: { emphasis: number; morph: Morphology }) {
  const f = morph.flower;

  const tepals = useMemo(() => {
    const out: { geo: THREE.BufferGeometry; a: number; tilt: number }[] = [];
    for (let i = 0; i < f.tepalCount; i++) {
      const j = (i * 7919) % 11; // deterministic pseudo-variation
      const k = (i * 104729) % 13;
      out.push({
        geo: createTepalGeometry({
          ...f.tepal,
          length: f.tepal.length * (1 + (j / 11 - 0.5) * 0.08),
          width: f.tepal.width * (1 + (k / 13 - 0.5) * 0.08),
          recurve: f.tepal.recurve * (1 + (j / 11 - 0.5) * 0.12),
          sweep: f.tepal.sweep * (i % 2 === 0 ? 1 : -1),
        }),
        a: (i / f.tepalCount) * Math.PI * 2 + (j / 11 - 0.5) * 0.14,
        tilt: 0.04 + (k / 13 - 0.5) * 0.1,
      });
    }
    return out;
  }, [f]);

  const inner = useMemo(() => {
    const r = f.innerRatio;
    const out: { geo: THREE.BufferGeometry; a: number }[] = [];
    for (let i = 0; i < f.tepalCount - 1; i++) {
      out.push({
        geo: createTepalGeometry({
          ...f.tepal,
          length: f.tepal.length * r,
          width: f.tepal.width * (r + 0.12),
          rise: f.tepal.rise * 1.7,
          drop: f.tepal.drop * 0.7,
          recurve: f.tepal.recurve * 0.8,
          cup: f.tepal.cup * 1.6,
        }),
        a: (i / (f.tepalCount - 1)) * Math.PI * 2 + 0.55,
      });
    }
    return out;
  }, [f]);

  return (
    <group>
      {tepals.map((t, i) => (
        <group key={i} rotation={[0, t.a, 0]}>
          <group rotation={[-t.tilt, 0, 0]} position={[0, 0, morph.receptacle.radius * 0.55]}>
            <Tissue geometry={t.geo} emphasis={emphasis} thickness={0.45} contour={0.55} />
          </group>
        </group>
      ))}
      {inner.map((t, i) => (
        <group key={`in-${i}`} rotation={[0, t.a, 0]}>
          <group rotation={[-0.42, 0, 0]} position={[0, 0.03, morph.receptacle.radius * 0.35]}>
            <Tissue geometry={t.geo} emphasis={emphasis} thickness={0.28} contour={0.7} />
          </group>
        </group>
      ))}
      <Stamens emphasis={emphasis} morph={morph} />
    </group>
  );
}

/** Stem -> node -> petiole -> blade. */
function Leaf({ spec, emphasis, morph }: { spec: LeafSpec; emphasis: number; morph: Morphology }) {
  const blade = useMemo(() => createLeafGeometry(spec), [spec]);
  const midrib = useMemo(() => createMidribGeometry(spec), [spec]);

  const y = spec.node * morph.stem.height;
  const sway = Math.sin(spec.node * 1.35) * morph.stem.sway;
  const nodeR = morph.stem.radius * (1 - morph.stem.taper * spec.node);

  return (
    <group position={[sway, y, 0]} rotation={[0, spec.around, 0]}>
      {/* node swelling */}
      <mesh>
        <sphereGeometry args={[nodeR * 1.5, 10, 8]} />
        <meshBasicMaterial color={EDGE} transparent opacity={0.35 * emphasis} depthWrite={false} />
      </mesh>
      {/* petiole rises out of the stem surface and tilts outward */}
      <group rotation={[Math.PI / 2 + spec.tilt, 0, 0]}>
        <mesh position={[0, spec.petiole / 2, 0]}>
          <cylinderGeometry args={[nodeR * 0.32, nodeR * 0.55, spec.petiole, 6]} />
          <meshBasicMaterial
            color={EDGE}
            transparent
            opacity={0.5 * emphasis}
            depthWrite={false}
          />
        </mesh>
      </group>
      {/* blade starts exactly where the petiole ends */}
      <group
        position={[0, -Math.sin(spec.tilt) * spec.petiole, Math.cos(spec.tilt) * spec.petiole]}
        rotation={[spec.tilt, 0, 0]}
        scale={spec.scale ?? 1}
      >
        <Tissue geometry={blade} emphasis={emphasis} thickness={0.1} contour={1} />
        <mesh geometry={midrib}>
          <meshBasicMaterial
            color={EDGE}
            transparent
            opacity={0.4 * emphasis}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

/* ---------------------------------------------------------------- */

export function Specimen({ active, morph = ASTROMIRABILIS }: { active: PartId; morph?: Morphology }) {
  const root = useRef<THREE.Group>(null);

  const stem = useMemo(() => createStemGeometry(morph.stem), [morph]);
  const receptacle = useMemo(() => createReceptacleGeometry(morph.receptacle), [morph]);
  const fruit = useMemo(() => createFruitGeometry(morph.fruit.size), [morph]);
  const seed = useMemo(() => createSeedGeometry(), []);

  useFrame((state) => {
    if (!root.current) return;
    const t = state.clock.elapsedTime;
    root.current.rotation.z = Math.sin(t * 0.25) * 0.012;
    root.current.position.y = Math.sin(t * 0.4) * 0.015;
  });

  const eFlower = emphasisOf(active, "flower");
  const eLeaf = emphasisOf(active, "leaf");
  const eStem = emphasisOf(active, "stem");
  const eFruit = emphasisOf(active, "fruit");
  const eSeed = emphasisOf(active, "seed");

  const topY = morph.stem.height;
  const topSway = Math.sin(1.35) * morph.stem.sway;
  const fruitY = morph.fruit.node * morph.stem.height;
  const fruitSway = Math.sin(morph.fruit.node * 1.35) * morph.stem.sway;

  return (
    <group ref={root} position={[0, -0.75, 0]}>
      {/* Scape */}
      <Tissue geometry={stem} emphasis={eStem} thickness={0.25} contour={0.7} />

      {/* Leaves — each attached at a node via a petiole */}
      {morph.leaves.map((l, i) => (
        <Leaf key={i} spec={l} emphasis={eLeaf} morph={morph} />
      ))}

      {/* Pendent capsule on a lateral pedicel from an upper node */}
      <group position={[fruitSway, fruitY, 0]} rotation={[0, morph.fruit.around, 0]}>
        <mesh
          position={[0, 0.02, morph.fruit.pedicel * 0.42]}
          rotation={[1.05, 0, 0]}
        >
          <cylinderGeometry args={[0.005, 0.009, morph.fruit.pedicel, 6]} />
          <meshBasicMaterial color={EDGE} transparent opacity={0.5 * eFruit} depthWrite={false} />
        </mesh>
        <group position={[0, -0.11, morph.fruit.pedicel * 0.8]}>
          <Tissue geometry={fruit} emphasis={eFruit} thickness={0.35} contour={0.8} />
          {/* Exploded anatomical detail — only when the seed is selected */}
          {active === "seed" && (
            <group position={[0.03, -0.38, 0.1]} rotation={[0, 0, 0.4]}>
              <Tissue geometry={seed} emphasis={eSeed} thickness={0.08} contour={1.2} />
              <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.0015, 0.0015, 0.34, 4]} />
                <meshBasicMaterial
                  color={EDGE}
                  transparent
                  opacity={0.3 * eSeed}
                  depthWrite={false}
                />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.12, 20]} />
                <meshBasicMaterial
                  color={EDGE}
                  wireframe
                  transparent
                  opacity={0.28 * eSeed}
                  side={THREE.DoubleSide}
                  depthWrite={false}
                />
              </mesh>
            </group>
          )}
        </group>
      </group>

      {/* Receptacle + flower head, growing out of the top of the scape */}
      <group position={[topSway, topY - 0.01, 0]}>
        <Tissue geometry={receptacle} emphasis={eStem * 0.6 + eFlower * 0.4} thickness={0.2} contour={0.9} />
        <group position={[0, morph.receptacle.height * 0.86, 0]}>
          <Flower emphasis={eFlower} morph={morph} />
        </group>
      </group>
    </group>
  );
}
