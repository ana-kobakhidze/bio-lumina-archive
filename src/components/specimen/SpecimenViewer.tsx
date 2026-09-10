import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PARTS, type PartId } from "@/lib/botany";
import { Specimen } from "./Specimen";

/** olive-yellow archive ground — the scene owns it so glass can transmit it */
const GROUND = "#C7CC10";

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
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0.3, 1.25, 5.3], fov: 26 }}
      onPointerDown={() => {
        setIdle(false);
        onUserInteract?.();
      }}
      onWheel={() => setIdle(false)}
    >
      {/* controlled studio lighting: soft key, weak fill, strong rim */}
      <ambientLight intensity={0.28} />
      <directionalLight position={[2.5, 4, 5]} intensity={0.85} color="#eef0ff" />
      <directionalLight position={[-4.5, 1.2, 2.5]} intensity={0.35} color="#9d8cff" />
      <directionalLight position={[-1.5, 3.5, -6]} intensity={2.1} color="#cfd6ff" />
      <pointLight position={[0, 0.6, -3.5]} intensity={9} distance={12} color="#ff5a1f" />
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
