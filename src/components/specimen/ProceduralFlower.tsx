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
import { outlineGeometry } from "./geometry";

/** Coarse twin used only for the faint interior scan grid. */
const WIRE_Q = 0.26;
const MESH = new THREE.Color("#8C85E8");
const CONTOUR = new THREE.Color("#8C85E8");
const ATTEN = new THREE.Color("#25387A");
const EMISSIVE = new THREE.Color("#25387A");
const BIO = new THREE.Color("#1EA598");

/**
 * Translucent botanical tissue: a physically transmissive surface that still
 * reads as a body — dense where blades overlap — with a delicate contour and
 * a barely-there technical mesh over it.
 */
function Membrane({
  geometry,
  wire,
  outline,
  emphasis,
  thickness = 0.25,
  transmission = 0.62,
}: {
  geometry: THREE.BufferGeometry;
  wire: THREE.BufferGeometry;
  outline?: THREE.BufferGeometry;
  emphasis: number;
  thickness?: number;
  transmission?: number;
}) {
  const dim = 0.45 + 0.55 * emphasis;
  return (
    <group>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          vertexColors
          transparent
          opacity={1}
          transmission={transmission}
          thickness={thickness}
          roughness={0.22}
          metalness={0}
          ior={1.35}
          clearcoat={0.35}
          clearcoatRoughness={0.2}
          specularIntensity={0.8}
          emissive={EMISSIVE}
          emissiveIntensity={0.14 * dim}
          attenuationColor={ATTEN}
          attenuationDistance={0.5}
          side={THREE.DoubleSide}
          flatShading={false}
          depthWrite
        />
      </mesh>
      <mesh geometry={wire} scale={1.0015}>
        <meshBasicMaterial
          color={MESH}
          wireframe
          transparent
          opacity={0.07 * dim}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {outline ? (
        <lineSegments geometry={outline}>
          <lineBasicMaterial
            color={CONTOUR}
            transparent
            opacity={0.24 * dim}
            depthWrite={false}
          />
        </lineSegments>
      ) : null}
    </group>
  );
}


function Tepal({ spec, emphasis }: { spec: TepalSpec2; emphasis: number }) {
  const geo = useMemo(() => createTepalGeometry(spec), [spec]);
  const wire = useMemo(() => createTepalGeometry(spec, WIRE_Q), [spec]);
  const outline = useMemo(() => outlineGeometry(geo), [geo]);
  return (
    <group rotation={[0, spec.angle, 0]} scale={spec.scale ?? 1}>
      <group position={[0, 0, spec.attach]} rotation={[-spec.tilt, 0, 0]}>
        <Membrane
          geometry={geo}
          wire={wire}
          outline={outline}
          emphasis={emphasis}
          thickness={0.22}
        />

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
              color={BIO}
              transparent
              opacity={0.6 * emphasis}
              depthWrite={false}
            />

          </mesh>
          <mesh position={[0, s.len, 0]}>
            <sphereGeometry args={[0.0155, 32, 22]} />
            <meshPhysicalMaterial
              color="#1EA598"
              transparent
              opacity={0.85 * emphasis}
              transmission={0.4}

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
        thickness={0.4}
        transmission={0.3}
      />
      <Membrane
        geometry={receptacle}
        wire={receptacleWire}
        emphasis={stemEmphasis * 0.4 + emphasis * 0.6}
        thickness={0.45}
        transmission={0.28}
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
