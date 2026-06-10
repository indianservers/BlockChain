import { RoundedBox, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function TransactionMesh({ id, position, visible, active, onHover }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.5 + id) * 0.05;
    ref.current.scale.lerp({ x: visible ? 1 : 0.001, y: visible ? 1 : 0.001, z: visible ? 1 : 0.001 }, 0.08);
  });

  return (
    <group
      ref={ref}
      position={position}
      onPointerOver={event => {
        event.stopPropagation();
        onHover?.("Verified transaction");
      }}
      onPointerOut={() => onHover?.(null)}
    >
      <RoundedBox args={[1.25, 0.62, 0.08]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color={active ? "#2563eb" : "#0f766e"} emissive={active ? "#1d4ed8" : "#0f766e"} emissiveIntensity={0.22} roughness={0.34} />
      </RoundedBox>
      <Text position={[0, 0, 0.07]} fontSize={0.12} color="#f8fafc" anchorX="center" anchorY="middle">
        TX-{id + 1}
      </Text>
    </group>
  );
}
