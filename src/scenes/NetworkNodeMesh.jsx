import { Sphere, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function NetworkNodeMesh({ id, position, active, onHover }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.1 + id) * 0.08;
  });

  return (
    <group
      ref={ref}
      position={position}
      onPointerOver={event => {
        event.stopPropagation();
        onHover?.(`Distributed node ${id + 1}`);
      }}
      onPointerOut={() => onHover?.(null)}
    >
      <Sphere args={[0.18, 24, 24]}>
        <meshStandardMaterial color={active ? "#18b7a8" : "#64748b"} emissive={active ? "#0f766e" : "#334155"} emissiveIntensity={0.32} roughness={0.28} />
      </Sphere>
      <Text position={[0, -0.36, 0]} fontSize={0.11} color="#e0f2fe" anchorX="center">
        Node {id + 1}
      </Text>
    </group>
  );
}
