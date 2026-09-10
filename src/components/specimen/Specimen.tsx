import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { PartId, SpeciesId } from "@/lib/botany";
import { FLOWER } from "./flower";
import {
  createFruitGeometry,
  createLeafGeometry,
  createMidribGeometry,
  createSeedGeometry,
  type LeafSpec,
} from "./geometry";
import { ProceduralFlower } from "./ProceduralFlower";
import { ProceduralFlytrap } from "./ProceduralFlytrap";

const EDGE = new THREE.Color("#3FE7BE");
const DEEP = new THREE.Color("#25387A");


const WIRE_Q = 0.26;

function emphasisOf(active: PartId, id: PartId) {
  if (active === "whole" || active === id) return 1;
  return 0.24;
}

function Tissue({
  geometry,
  wire,
  emphasis,
  thickness = 0.3,
}: {
  geometry: THREE.BufferGeometry;
  wire?: THREE.BufferGeometry;
  emphasis: number;
  thickness?: number;
}) {
  return (
    <group>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color="#5950B8"
          transparent
          opacity={1}
          transmission={0.42}
          thickness={thickness}
          roughness={0.2}
          metalness={0}
          ior={1.35}
          emissive={DEEP}
          emissiveIntensity={0.2 * emphasis}
          attenuationColor={DEEP}
          attenuationDistance={0.9}
          side={THREE.DoubleSide}
          flatShading={false}
          depthWrite
        />
      </mesh>

      <mesh geometry={wire ?? geometry} scale={1.001}>
        <meshBasicMaterial
          color={EDGE}
          wireframe
          transparent
          opacity={0.04 * emphasis}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/** Leaves hang off nodes below the bloom; only shown for the Leaf study. */
const LEAVES: LeafSpec[] = [
  { node: 0.7, around: 0.35, tilt: 0.42, petiole: 0.13, length: 0.8, width: 0.19, arch: 0.5, twist: 0.35 },
  { node: 0.48, around: 2.79, tilt: -0.1, petiole: 0.1, length: 0.62, width: 0.15, arch: 0.42, twist: -0.3 },
  { node: 0.3, around: 4.97, tilt: 0.16, petiole: 0.08, length: 0.45, width: 0.11, arch: 0.36, twist: 0.28 },
];

function Leaf({ spec, emphasis }: { spec: LeafSpec; emphasis: number }) {
  const blade = useMemo(() => createLeafGeometry(spec), [spec]);
  const bladeWire = useMemo(() => createLeafGeometry(spec, WIRE_Q), [spec]);
  const midrib = useMemo(() => createMidribGeometry(spec), [spec]);
  const y = -spec.node * FLOWER.stem.length;
  const nodeR = FLOWER.stem.radius * (1 + 0.5 * spec.node);

  return (
    <group position={[Math.sin(spec.node * 1.1) * 0.05, y, 0]} rotation={[0, spec.around, 0]}>
      <mesh>
        <sphereGeometry args={[nodeR * 1.4, 32, 20]} />
        <meshBasicMaterial color={EDGE} transparent opacity={0.3 * emphasis} depthWrite={false} />
      </mesh>
      <group rotation={[Math.PI / 2 + spec.tilt, 0, 0]}>
        <mesh position={[0, spec.petiole / 2, 0]}>
          <cylinderGeometry args={[nodeR * 0.32, nodeR * 0.55, spec.petiole, 24, 8]} />
          <meshBasicMaterial color={EDGE} transparent opacity={0.45 * emphasis} depthWrite={false} />
        </mesh>
      </group>
      <group
        position={[0, -Math.sin(spec.tilt) * spec.petiole, Math.cos(spec.tilt) * spec.petiole]}
        rotation={[spec.tilt, 0, 0]}
      >
        <Tissue geometry={blade} wire={bladeWire} emphasis={emphasis} thickness={0.1} />
        <mesh geometry={midrib}>
          <meshBasicMaterial color={EDGE} transparent opacity={0.35 * emphasis} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

export function Specimen({ species, active }: { species: SpeciesId; active: PartId }) {
  const root = useRef<THREE.Group>(null);

  const fruit = useMemo(() => createFruitGeometry(0.1), []);
  const fruitWire = useMemo(() => createFruitGeometry(0.1, WIRE_Q), []);
  const seed = useMemo(() => createSeedGeometry(), []);
  const seedWire = useMemo(() => createSeedGeometry(0.09, WIRE_Q), []);

  useFrame((state) => {
    if (!root.current) return;
    const t = state.clock.elapsedTime;
    root.current.rotation.z = Math.sin(t * 0.25) * 0.01;
    root.current.position.y = Math.sin(t * 0.4) * 0.012;
  });

  const eFlower = emphasisOf(active, "flower");
  const eStem = emphasisOf(active, "stem");
  const eLeaf = emphasisOf(active, "leaf");
  const eFruit = emphasisOf(active, "fruit");
  const eSeed = emphasisOf(active, "seed");

  const showLeaves = active === "leaf";
  const showFruit = active === "fruit" || active === "seed";

  if (species === "dionaea") {
    return (
      <group ref={root}>
        <ProceduralFlytrap emphasis={eFlower} stemEmphasis={eStem} leafEmphasis={eLeaf} />
      </group>
    );
  }

  return (
    <group ref={root}>
      <ProceduralFlower emphasis={eFlower} stemEmphasis={eStem} />

      {showLeaves && LEAVES.map((l, i) => <Leaf key={i} spec={l} emphasis={eLeaf} />)}

      {showFruit && (
        <group position={[0, -0.42, 0]} rotation={[0, -0.7, 0]}>
          <mesh position={[0, 0.02, 0.13]} rotation={[1.05, 0, 0]}>
            <cylinderGeometry args={[0.005, 0.009, 0.3, 24, 8]} />
            <meshBasicMaterial color={EDGE} transparent opacity={0.45 * eFruit} depthWrite={false} />
          </mesh>
          <group position={[0, -0.13, 0.24]}>
            <Tissue geometry={fruit} wire={fruitWire} emphasis={eFruit} thickness={0.35} />
            {active === "seed" && (
              <group position={[0.03, -0.36, 0.1]} rotation={[0, 0, 0.4]}>
                <Tissue geometry={seed} wire={seedWire} emphasis={eSeed} thickness={0.08} />
                <mesh position={[0, 0.2, 0]}>
                  <cylinderGeometry args={[0.0015, 0.0015, 0.34, 16, 4]} />
                  <meshBasicMaterial
                    color={EDGE}
                    transparent
                    opacity={0.3 * eSeed}
                    depthWrite={false}
                  />
                </mesh>
              </group>
            )}
          </group>
        </group>
      )}
    </group>
  );
}
