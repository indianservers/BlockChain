import { Line, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function BlockMesh({ block, position, previousPosition, visible, active, selected, onSelect, onHover }) {
  const ref = useRef();
  const color = selected ? "#f59e0b" : active ? "#2563eb" : "#0f766e";

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.7 + block.index) * 0.12;
    ref.current.scale.lerp(new THREE.Vector3(visible ? 1 : 0.001, visible ? 1 : 0.001, visible ? 1 : 0.001), 0.08);
  });

  return (
    <group>
      {previousPosition && visible && <Line points={[previousPosition, position]} color="#67e8f9" lineWidth={2} transparent opacity={0.65} />}
      <group
        ref={ref}
        position={position}
        onClick={event => {
          event.stopPropagation();
          onSelect?.(block);
        }}
        onPointerOver={event => {
          event.stopPropagation();
          onHover?.(`Block ${block.index}: ${block.hash.slice(0, 8)}...`);
        }}
        onPointerOut={() => onHover?.(null)}
      >
        <mesh>
          <boxGeometry args={[0.88, 0.88, 0.88]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} metalness={0.12} roughness={0.32} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(0.91, 0.91, 0.91)]} />
          <lineBasicMaterial color="#e0f2fe" transparent opacity={0.7} />
        </lineSegments>
        <Text position={[0, -0.72, 0]} fontSize={0.15} color="#e0f2fe" anchorX="center">
          Block {block.index}
        </Text>
      </group>
    </group>
  );
}
