import { Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function DataParticle({ id, position, target, active, onHover }) {
  const ref = useRef();
  const start = useRef(new THREE.Vector3(...position));
  const end = useRef(new THREE.Vector3(...target));

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = Math.sin(clock.elapsedTime * 2 + id) * 0.04;
    const next = active ? end.current : start.current;
    ref.current.position.lerp(next, 0.045);
    ref.current.scale.setScalar(1 + pulse);
  });

  return (
    <Sphere
      ref={ref}
      args={[0.055, 16, 16]}
      position={position}
      onPointerOver={event => {
        event.stopPropagation();
        onHover?.("Raw data");
      }}
      onPointerOut={() => onHover?.(null)}
    >
      <meshStandardMaterial color="#67e8f9" emissive="#0891b2" emissiveIntensity={0.55} roughness={0.3} />
    </Sphere>
  );
}
