import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { PartId } from "@/lib/botany";
import {
  capsuleFruitGeometry,
  leafGeometry,
  petalGeometry,
  seedGeometry,
  stemGeometry,
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
  wireSkip = 1,
}: {
  geometry: THREE.BufferGeometry;
  emphasis: number;
  color?: THREE.Color;
  thickness?: number;
  contour?: number;
  wireSkip?: number;
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
          opacity={contour * 0.045 * emphasis * wireSkip}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function Stamens({ emphasis }: { emphasis: number }) {
  const items = useMemo(() => {
    const out: { pos: [number, number, number]; rot: [number, number, number]; len: number }[] = [];
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + i * 0.31;
      const r = 0.06 + (i % 4) * 0.035;
      const len = 0.42 + ((i * 37) % 11) / 40;
      out.push({
        pos: [Math.cos(a) * r, 0, Math.sin(a) * r],
        rot: [Math.cos(a) * 0.55, 0, -Math.sin(a) * 0.55],
        len,
      });
    }
    return out;
  }, []);

  return (
    <group>
      {items.map((s, i) => (
        <group key={i} position={s.pos} rotation={s.rot}>
          <mesh position={[0, s.len / 2, 0]}>
            <cylinderGeometry args={[0.004, 0.007, s.len, 6]} />
            <meshBasicMaterial
              color={EDGE}
              transparent
              opacity={0.5 * emphasis}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, s.len, 0]}>
            <sphereGeometry args={[0.026, 12, 12]} />
            <meshPhysicalMaterial
              color={DEEP}
              transparent
              opacity={0.55 * emphasis}
              transmission={0.7}
              thickness={0.1}
              roughness={0.1}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Specimen({ active }: { active: PartId }) {
  const root = useRef<THREE.Group>(null);

  const petal = useMemo(() => petalGeometry(), []);
  const innerPetal = useMemo(
    () => petalGeometry({ length: 0.7, width: 0.16, curl: 1.9, recurve: 0.1, cup: 0.9 }),
    [],
  );
  const leaf = useMemo(() => leafGeometry(), []);
  const stem = useMemo(() => stemGeometry(1.7), []);
  const fruit = useMemo(() => capsuleFruitGeometry(), []);
  const seed = useMemo(() => seedGeometry(), []);

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

  return (
    <group ref={root} position={[0, -0.35, 0]} scale={1}>
      {/* Stem */}
      <group>
        <Tissue geometry={stem} emphasis={eStem} thickness={0.25} contour={0.7} />
      </group>

      {/* Leaves */}
      <group>
        {[
          { p: [0, 0.72, 0] as const, ry: 2.5, rx: -0.3, s: 1 },
          { p: [0, 1.05, 0] as const, ry: -0.5, rx: -0.42, s: 0.8 },
          { p: [0, 0.4, 0] as const, ry: 1.0, rx: -0.15, s: 0.66 },
        ].map((l, i) => (
          <group key={i} position={l.p} rotation={[l.rx, l.ry, 0]} scale={l.s}>
            <Tissue geometry={leaf} emphasis={eLeaf} thickness={0.12} contour={1} />
          </group>
        ))}
      </group>

      {/* Fruit capsule + seed, pendent from a lateral pedicel */}
      <group position={[0, 1.3, 0]} rotation={[0, -0.7, 0]} scale={0.8}>
        <mesh position={[0, 0.02, 0.19]} rotation={[1.15, 0, 0]}>
          <cylinderGeometry args={[0.006, 0.011, 0.4, 6]} />
          <meshBasicMaterial color={EDGE} transparent opacity={0.45 * eFruit} depthWrite={false} />
        </mesh>
        <group position={[0, -0.2, 0.3]}>
          <Tissue geometry={fruit} emphasis={eFruit} thickness={0.35} contour={0.8} />
          <group position={[0.03, -0.42, 0.1]} rotation={[0, 0, 0.4]}>
            <Tissue geometry={seed} emphasis={eSeed} thickness={0.08} contour={1.2} />
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
        </group>
      </group>

      {/* Flower */}
      <group position={[0, 1.68, 0]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <group key={i} rotation={[0, (i / 6) * Math.PI * 2, 0]}>
            <group rotation={[-0.22 + (i % 2) * 0.1, 0, 0]}>
              <Tissue geometry={petal} emphasis={eFlower} thickness={0.5} contour={0.55} />
            </group>
          </group>
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <group key={`in-${i}`} rotation={[0, (i / 5) * Math.PI * 2 + 0.6, 0]}>
            <group rotation={[-0.55, 0, 0]}>
              <Tissue geometry={innerPetal} emphasis={eFlower} thickness={0.3} contour={0.7} />
            </group>
          </group>
        ))}
        <Stamens emphasis={eFlower} />
        <mesh>
          <sphereGeometry args={[0.1, 20, 20]} />
          <meshPhysicalMaterial
            color={DEEP}
            transparent
            opacity={0.5 * eFlower}
            transmission={0.8}
            thickness={0.3}
            roughness={0.1}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}
