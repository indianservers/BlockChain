import { Float, Line, OrbitControls, Sphere, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Particles() {
  const points = useMemo(
    () =>
      Array.from({ length: 54 }, (_, index) => {
        const angle = index * 0.55;
        return [Math.cos(angle) * (1.3 + index * 0.018), Math.sin(index) * 0.7, Math.sin(angle) * 1.15];
      }),
    []
  );

  return points.map((position, index) => (
    <Sphere key={index} args={[0.035, 12, 12]} position={position}>
      <meshStandardMaterial color={index % 3 === 0 ? "#18b7a8" : "#60a5fa"} emissive="#0f172a" />
    </Sphere>
  ));
}

function ChainBlocks() {
  const group = useRef();

  useFrame(({ clock }) => {
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.18;
  });

  const blockPositions = [
    [-1.8, 0, 0],
    [0, 0, 0],
    [1.8, 0, 0]
  ];

  return (
    <group ref={group}>
      {blockPositions.map((position, index) => (
        <Float key={index} speed={1.4 + index * 0.2} rotationIntensity={0.2} floatIntensity={0.25}>
          <mesh position={position}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={index === 1 ? "#2563eb" : "#0f766e"} roughness={0.35} metalness={0.15} />
          </mesh>
          <Text position={[position[0], -0.78, 0]} fontSize={0.18} color="#e2e8f0" anchorX="center">
            {index === 0 ? "Data" : index === 1 ? "Block" : "Chain"}
          </Text>
        </Float>
      ))}
      <Line points={blockPositions} color="#93c5fd" lineWidth={2} />
    </group>
  );
}

function DistributedNodes() {
  const nodes = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 6;
        return [Math.cos(angle) * 3.2, -1.55, Math.sin(angle) * 1.5];
      }),
    []
  );

  return (
    <group>
      {nodes.map((point, index) => (
        <Sphere key={index} args={[0.12, 18, 18]} position={point}>
          <meshStandardMaterial color="#18b7a8" emissive="#0f766e" emissiveIntensity={0.25} />
        </Sphere>
      ))}
      {nodes.map((point, index) => (
        <Line key={`line-${index}`} points={[point, nodes[(index + 1) % nodes.length]]} color="#22d3ee" transparent opacity={0.55} />
      ))}
    </group>
  );
}

export default function BlockchainScene() {
  return (
    <Canvas camera={{ position: [0, 1.2, 6], fov: 48 }} dpr={[1, 1.8]}>
      <color attach="background" args={["#08111f"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-4, 2, 4]} color="#18b7a8" intensity={2} />
      <Particles />
      <ChainBlocks />
      <DistributedNodes />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.7} />
    </Canvas>
  );
}
