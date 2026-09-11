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
const MESH = new THREE.Color("#BFC4FF");
const CONTOUR = new THREE.Color("#9FF0DA");
const ATTEN = new THREE.Color("#4A44D6");
const BIO = new THREE.Color("#3FE7BE");

/**
 * Blown-glass botanical tissue: a thin, strongly transmissive membrane whose
 * colour comes from absorption through overlapping layers rather than from a
 * heavy tinted body. Edges catch the rim light; the technical mesh is almost
 * subliminal.
 */
export function Membrane({
  geometry,
  wire,
  outline,
  emphasis,
  thickness = 0.12,
  transmission = 0.96,
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
          roughness={0.07}
          metalness={0}
          ior={1.45}
          clearcoat={0.7}
          clearcoatRoughness={0.06}
          specularIntensity={1}
          iridescence={0.22}
          iridescenceIOR={1.3}
          attenuationColor={ATTEN}
          attenuationDistance={0.28}
          side={THREE.DoubleSide}
          flatShading={false}
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={wire} scale={1.0015}>
        <meshBasicMaterial
          color={MESH}
          wireframe
          transparent
          opacity={0.022 * dim}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {outline ? (
        <lineSegments geometry={outline}>
          <lineBasicMaterial
            color={CONTOUR}
            transparent
            opacity={0.1 * dim}
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
              color="#3FE7BE"
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
        {morph.central ? <Tepal spec={morph.central} emphasis={emphasis} /> : null}
        <Stamens emphasis={emphasis} morph={morph} />
      </group>
    </group>
  );
}
