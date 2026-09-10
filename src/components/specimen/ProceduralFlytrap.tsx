import { useMemo } from "react";
import * as THREE from "three";
import {
  FLYTRAP,
  createCiliaLayout,
  createLobeGeometry,
  createPetioleGeometry,
  createTriggerLayout,
  petioleTip,
  type FlytrapMorphology,
  type TrapPlacement,
  type TrapSpec,
} from "./flytrap";
import { createStemGeometry } from "./flower";
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
            <cylinderGeometry args={[0.006, 0.009, morph.trap.length, 20, 6]} />
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

/**
 * Dionaea muscipula: a rosette of winged petioles, each terminating in an
 * open two-valved snap trap fringed with marginal cilia, over a short rhizome.
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
