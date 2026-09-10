import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PARTS, type PartId } from "@/lib/botany";
import { Specimen } from "./Specimen";

/** deep-water archive ground — the scene owns it so glass can transmit it */
const GROUND = "#0C0827";


function CameraRig({
  active,
  controls,
  nonce,
}: {
  active: PartId;
  controls: React.RefObject<any>;
  nonce: number;
}) {
  const { camera } = useThree();
  const goal = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  const flying = useRef(false);

  useEffect(() => {
    const spec = (PARTS.find((p) => p.id === active) ?? PARTS[0])!;
    goal.current.set(...spec.camera);
    look.current.set(...spec.target);
    flying.current = true;
  }, [active, nonce]);

  useFrame((_, delta) => {
    if (!flying.current) return;
    const k = 1 - Math.exp(-2.4 * Math.min(delta, 0.05));
    camera.position.lerp(goal.current, k);
    const c = controls.current;
    if (c) {
      c.target.lerp(look.current, k);
      c.update();
    }
    if (camera.position.distanceTo(goal.current) < 0.004) flying.current = false;
  });

  return null;
}

export function SpecimenViewer({
  active,
  resetNonce,
  onUserInteract,
}: {
  active: PartId;
  resetNonce: number;
  onUserInteract?: () => void;
}) {
  const controls = useRef<any>(null);
  const [idle, setIdle] = useState(true);

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false }}
      camera={{ position: [0.22, 0.92, 2.95], fov: 26 }}
      onPointerDown={() => {
        setIdle(false);
        onUserInteract?.();
      }}
      onWheel={() => setIdle(false)}
    >
      {/* the scene owns its ground colour so transmissive tissue transmits it */}
      <color attach="background" args={[GROUND]} />

      {/* controlled studio lighting: soft key, weak fill, strong rim */}
      <ambientLight intensity={0.22} />
      <directionalLight position={[2.5, 4, 5]} intensity={0.6} color="#5950B8" />
      <directionalLight position={[-4.5, 1.2, 2.5]} intensity={0.35} color="#25387A" />
      <directionalLight position={[-1.5, 3.5, -6]} intensity={3.2} color="#1EA598" />

      {/* small studio reflection rig — no HDRI, no ground plane */}
      <Environment resolution={256}>
        <Lightformer intensity={1.8} position={[0, 4, 2]} scale={[8, 8, 1]} color="#5950B8" />
        <Lightformer
          intensity={2.4}
          position={[-4, 1, -2]}
          rotation-y={Math.PI / 2}
          scale={[10, 2, 1]}
          color="#1EA598"
        />
        <Lightformer
          intensity={1.4}
          position={[4, 0.5, -2]}
          rotation-y={-Math.PI / 2}
          scale={[10, 2, 1]}
          color="#25387A"
        />
      </Environment>


      <Suspense fallback={null}>
        <Specimen active={active} />
      </Suspense>
      <CameraRig active={active} controls={controls} nonce={resetNonce} />
      <OrbitControls
        ref={controls}
        makeDefault
        enablePan
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.35}
        zoomSpeed={0.5}
        panSpeed={0.4}
        minDistance={0.8}
        maxDistance={14}
        autoRotate={idle && active === "whole"}
        autoRotateSpeed={0.22}
        target={[0, 0.33, 0]}
      />

    </Canvas>
  );
}
