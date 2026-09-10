import { useMemo } from "react";
import * as THREE from "three";
import {
  FLOWER,
  createReceptacleGeometry,
  createStamenLayout,
  createStemGeometry,
  createTepalGeometry,
  type FlowerMorphology,
  type TepalSpec2,
} from "./flower";

/** Coarse twin used only for the faint scan overlay. */
const WIRE_Q = 0.3;
const EDGE = new THREE.Color("#F0EDFA");
const ATTEN = new THREE.Color("#3f4fd8");

/**
 * Thin translucent botanical membrane. The smooth high-resolution surface
 * reads first; a low-density mesh twin supplies the scan aesthetic.
 */
function Membrane({
  geometry,
  wire,
  emphasis,
  thickness = 0.5,
  opacity = 0.92,
}: {
  geometry: THREE.BufferGeometry;
  wire: THREE.BufferGeometry;
  emphasis: number;
  thickness?: number;
  opacity?: number;
}) {
  return (
    <group>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          vertexColors
          transparent
          opacity={opacity * emphasis + 0.06}
          transmission={0.7}
          thickness={thickness}
          roughness={0.12}
          metalness={0}
          ior={1.4}
          clearcoat={0.5}
          clearcoatRoughness={0.18}
          iridescence={0.2}
          iridescenceIOR={1.25}
          specularIntensity={1}
          attenuationColor={ATTEN}
          attenuationDistance={0.35}
          side={THREE.DoubleSide}
          flatShading={false}
          depthWrite={emphasis > 0.5}
        />
      </mesh>
      <mesh geometry={wire} scale={1.0015}>
        <meshBasicMaterial
          color={EDGE}
          wireframe
          transparent
          opacity={0.07 * emphasis}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function Tepal({ spec, emphasis }: { spec: TepalSpec2; emphasis: number }) {
  const geo = useMemo(() => createTepalGeometry(spec), [spec]);
  const wire = useMemo(() => createTepalGeometry(spec, WIRE_Q), [spec]);
  return (
    <group rotation={[0, spec.angle, 0]} scale={spec.scale ?? 1}>
      <group position={[0, 0, spec.attach]} rotation={[-spec.tilt, 0, 0]}>
        <Membrane geometry={geo} wire={wire} emphasis={emphasis} thickness={0.22} />
      </group>
    </group>
  );
}

function Stamens({ emphasis, morph }: { emphasis: number; morph: FlowerMorphology }) {
  const items = useMemo(() => createStamenLayout(morph.stamens), [morph]);
  return (
    <group>
      {items.map((s, i) => (
        <group key={i} position={s.pos} rotation={s.rot}>
          <mesh position={[0, s.len / 2, 0]}>
            <cylinderGeometry args={[0.0028, 0.0042, s.len, 20, 6]} />
            <meshBasicMaterial
              color={EDGE}
              transparent
              opacity={0.5 * emphasis}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, s.len, 0]}>
            <sphereGeometry args={[0.0155, 32, 22]} />
            <meshPhysicalMaterial
              color="#598FFD"
              transparent
              opacity={0.72 * emphasis}
              transmission={0.5}
              thickness={0.06}
              roughness={0.16}
              flatShading={false}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * The complete bloom: receptacle, one dominant central tepal, a ring of
 * upright inner tepals, broad laterally-opening outer tepals, small recurved
 * basal tepals, the stamen boss, and the scape it grows from.
 */
export function ProceduralFlower({
  morph = FLOWER,
  emphasis = 1,
  stemEmphasis = 1,
}: {
  morph?: FlowerMorphology;
  emphasis?: number;
  stemEmphasis?: number;
}) {
  const receptacle = useMemo(() => createReceptacleGeometry(morph.receptacle), [morph]);
  const receptacleWire = useMemo(
    () => createReceptacleGeometry(morph.receptacle, WIRE_Q),
    [morph],
  );
  const stem = useMemo(() => createStemGeometry(morph.stem), [morph]);
  const stemWire = useMemo(() => createStemGeometry(morph.stem, WIRE_Q), [morph]);

  const top = morph.receptacle.height;

  return (
    <group>
      <Membrane
        geometry={stem}
        wire={stemWire}
        emphasis={stemEmphasis}
        thickness={0.3}
        opacity={0.6}
      />
      <Membrane
        geometry={receptacle}
        wire={receptacleWire}
        emphasis={stemEmphasis * 0.4 + emphasis * 0.6}
        thickness={0.36}
        opacity={0.66}
      />
      <group position={[0, top * 0.9, 0]}>
        {morph.basal.map((t, i) => (
          <Tepal key={`b-${i}`} spec={t} emphasis={emphasis} />
        ))}
        {morph.outer.map((t, i) => (
          <Tepal key={`o-${i}`} spec={t} emphasis={emphasis} />
        ))}
        {morph.inner.map((t, i) => (
          <Tepal key={`i-${i}`} spec={t} emphasis={emphasis} />
        ))}
        <Tepal spec={morph.central} emphasis={emphasis} />
        <Stamens emphasis={emphasis} morph={morph} />
      </group>
    </group>
  );
}
