import { Float, Line, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";

function ChainModel() {
  const group = useRef();
  const positions = useMemo(() => [[-2.4, 0, 0], [-0.8, 0.3, 0], [0.8, -0.15, 0], [2.4, 0.25, 0]], []);

  useFrame(({ clock }) => {
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.45) * 0.2;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.25) * 0.06;
  });

  return (
    <group ref={group}>
      {positions.map((position, index) => (
        <Float key={index} speed={1.2 + index * 0.15} floatIntensity={0.2} rotationIntensity={0.16}>
          <mesh position={position}>
            <boxGeometry args={[0.95, 0.95, 0.95]} />
            <meshStandardMaterial color={index === 0 ? "#0f766e" : "#2563eb"} roughness={0.34} metalness={0.2} />
          </mesh>
          <Text position={[position[0], position[1] - 0.78, position[2]]} fontSize={0.17} color="#e0f2fe" anchorX="center">
            {index === 0 ? "Genesis" : `Block ${index}`}
          </Text>
        </Float>
      ))}
      {positions.slice(0, -1).map((position, index) => (
        <Line key={index} points={[position, positions[index + 1]]} color="#67e8f9" lineWidth={3} transparent opacity={0.85} />
      ))}
      {positions.map((position, index) => (
        <Text key={`hash-${index}`} position={[position[0], position[1] + 0.78, position[2]]} fontSize={0.13} color="#93c5fd" anchorX="center">
          hash → prevHash
        </Text>
      ))}
    </group>
  );
}

export default function Phase2ChainScene() {
  return (
    <Canvas camera={{ position: [0, 1.3, 6], fov: 45 }} dpr={[1, 1.8]}>
      <color attach="background" args={["#07101f"]} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[5, 6, 5]} intensity={1.4} />
      <pointLight position={[-3, 2, 4]} color="#18b7a8" intensity={1.8} />
      <ChainModel />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.55} />
    </Canvas>
  );
}
