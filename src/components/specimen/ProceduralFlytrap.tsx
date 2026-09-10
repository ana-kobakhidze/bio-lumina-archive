import { useMemo } from "react";
import * as THREE from "three";
import {
  FLYTRAP,
  SCAPE,
  createCiliaLayout,
  createLobeGeometry,
  createPetioleGeometry,
  createTriggerLayout,
  petioleTip,
  scapeFlowerTepals,
  type FlytrapMorphology,
  type TrapPlacement,
  type TrapSpec,
} from "./flytrap";
import { createStemGeometry, createTepalGeometry } from "./flower";

import { outlineGeometry } from "./geometry";
import { Membrane } from "./ProceduralFlower";

const WIRE_Q = 0.26;
const GLOW = new THREE.Color("#3FE7BE");

/** One valve of the trap: the lobe surface, its marginal teeth and trigger hairs. */
function Lobe({ trap, sign, emphasis }: { trap: TrapSpec; sign: 1 | -1; emphasis: number }) {
  const geo = useMemo(() => createLobeGeometry(trap, sign), [trap, sign]);
  const wire = useMemo(() => createLobeGeometry(trap, sign, WIRE_Q), [trap, sign]);
  const outline = useMemo(() => outlineGeometry(geo), [geo]);
  const cilia = useMemo(() => createCiliaLayout(trap, sign), [trap, sign]);
  const triggers = useMemo(() => createTriggerLayout(trap, sign), [trap, sign]);

  return (
    <group>
      <Membrane
        geometry={geo}
        wire={wire}
        outline={outline}
        emphasis={emphasis}
        thickness={0.24}
        transmission={0.58}
      />

      {cilia.map((c, i) => (
        <mesh key={`c-${i}`} position={c.pos} quaternion={c.quat}>
          <cylinderGeometry args={[0.0007, 0.0026, c.len, 12, 3]} />
          <meshBasicMaterial
            color={GLOW}
            transparent
            opacity={0.55 * emphasis}
            depthWrite={false}
          />
        </mesh>
      ))}

      {triggers.map((t, i) => (
        <mesh key={`t-${i}`} position={t.pos}>
          <sphereGeometry args={[0.006, 20, 14]} />
          <meshBasicMaterial
            color={GLOW}
            transparent
            opacity={0.75 * emphasis}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** One leaf: winged petiole carrying a two-valved trap at its tip. */
function TrapLeaf({
  morph,
  place,
  trapEmphasis,
  leafEmphasis,
}: {
  morph: FlytrapMorphology;
  place: TrapPlacement;
  trapEmphasis: number;
  leafEmphasis: number;
}) {
  const petiole = useMemo(() => createPetioleGeometry(morph.petiole), [morph]);
  const petioleWire = useMemo(() => createPetioleGeometry(morph.petiole, WIRE_Q), [morph]);
  const tip = useMemo(() => petioleTip(morph.petiole), [morph]);

  return (
    <group rotation={[0, place.angle, 0]} scale={place.scale}>
      <group rotation={[-place.tilt, 0, place.roll]}>
        <Membrane
          geometry={petiole}
          wire={petioleWire}
          emphasis={leafEmphasis}
          thickness={0.18}
          transmission={0.5}
        />
        <group position={tip.pos} rotation={[-tip.pitch, 0, 0]}>
          <Lobe trap={morph.trap} sign={1} emphasis={trapEmphasis} />
          <Lobe trap={morph.trap} sign={-1} emphasis={trapEmphasis} />
          {/* midrib along the hinge */}
          <mesh position={[0, 0, morph.trap.length / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.004, 0.006, morph.trap.length * 1.02, 18, 4]} />

            <meshBasicMaterial
              color={GLOW}
              transparent
              opacity={0.4 * trapEmphasis}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/** The flowering scape: a tall bare stalk with a small umbel of flowers and buds. */
function Scape({ emphasis }: { emphasis: number }) {
  const stem = useMemo(() => createStemGeometry(SCAPE.stem), []);
  const stemWire = useMemo(() => createStemGeometry(SCAPE.stem, WIRE_Q), []);
  const specs = useMemo(() => scapeFlowerTepals(), []);
  const petals = useMemo(() => specs.map((s) => createTepalGeometry(s)), [specs]);
  const petalWires = useMemo(() => specs.map((s) => createTepalGeometry(s, WIRE_Q)), [specs]);

  return (
    <group>
      <Membrane
        geometry={stem}
        wire={stemWire}
        emphasis={emphasis}
        thickness={0.3}
        transmission={0.45}
      />
      {SCAPE.flowers.map((f, i) => (
        <group key={`f-${i}`} position={f.pos} rotation={[f.tilt, f.spin, 0]} scale={f.scale}>
          {petals.map((g, j) => (
            <Membrane
              key={j}
              geometry={g}
              wire={petalWires[j]!}
              emphasis={emphasis}
              thickness={0.16}
              transmission={0.6}
            />
          ))}
          <mesh>
            <sphereGeometry args={[0.014, 18, 14]} />
            <meshBasicMaterial color={GLOW} transparent opacity={0.7 * emphasis} depthWrite={false} />
          </mesh>
        </group>
      ))}
      {SCAPE.buds.map((b, i) => (
        <mesh key={`b-${i}`} position={b.pos} scale={[b.scale, b.scale * 1.7, b.scale]}>
          <sphereGeometry args={[0.026, 24, 18]} />
          <meshBasicMaterial color={GLOW} transparent opacity={0.35 * emphasis} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Dionaea muscipula: a low rosette of flat winged petioles, each terminating in
 * an open two-valved snap trap fringed with marginal cilia, with a tall
 * flowering scape rising from the centre.
 */
export function ProceduralFlytrap({
  morph = FLYTRAP,
  emphasis = 1,
  stemEmphasis = 1,
  leafEmphasis = 1,
}: {
  morph?: FlytrapMorphology;
  emphasis?: number;
  stemEmphasis?: number;
  leafEmphasis?: number;
}) {
  const rhizome = useMemo(() => createStemGeometry(morph.rhizome), [morph]);
  const rhizomeWire = useMemo(() => createStemGeometry(morph.rhizome, WIRE_Q), [morph]);

  return (
    <group>
      <Membrane
        geometry={rhizome}
        wire={rhizomeWire}
        emphasis={stemEmphasis}
        thickness={0.4}
        transmission={0.3}
      />
      <Scape emphasis={stemEmphasis} />
      {morph.traps.map((p, i) => (
        <TrapLeaf
          key={i}
          morph={morph}
          place={p}
          trapEmphasis={emphasis}
          leafEmphasis={leafEmphasis}
        />
      ))}
    </group>
  );
}

