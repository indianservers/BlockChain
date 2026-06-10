import { Float, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

function MiningModel() {
  const nonceRef = useRef();
  const gateRef = useRef();

  useFrame(({ clock }) => {
    nonceRef.current.rotation.y = clock.elapsedTime * 2.5;
    gateRef.current.rotation.z = Math.sin(clock.elapsedTime) * 0.12;
  });

  return (
    <group>
      <Float speed={1.2} floatIntensity={0.18} rotationIntensity={0.08}>
        <mesh position={[-1.9, 0, 0]}>
          <boxGeometry args={[1.05, 1.05, 1.05]} />
          <meshStandardMaterial color="#2563eb" roughness={0.32} metalness={0.2} />
        </mesh>
        <Text position={[-1.9, -0.9, 0]} fontSize={0.16} color="#e0f2fe" anchorX="center">Candidate Block</Text>
      </Float>

      <group ref={nonceRef} position={[0, 0.08, 0]}>
        <mesh>
          <torusGeometry args={[0.55, 0.12, 18, 72]} />
          <meshStandardMaterial color="#18b7a8" emissive="#0f766e" emissiveIntensity={0.25} />
        </mesh>
        <Text position={[0, -0.9, 0]} fontSize={0.16} color="#e0f2fe" anchorX="center">Nonce Search</Text>
      </group>

      <group ref={gateRef} position={[1.95, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.72, 0.07, 16, 72]} />
          <meshStandardMaterial color="#f59e0b" emissive="#92400e" emissiveIntensity={0.2} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.95, 0.12, 0.12]} />
          <meshStandardMaterial color="#fde68a" />
        </mesh>
        <Text position={[0, -0.9, 0]} fontSize={0.16} color="#e0f2fe" anchorX="center">Target Gate</Text>
      </group>

      <Text position={[0, 1.25, 0]} fontSize={0.18} color="#93c5fd" anchorX="center">
        Block + Nonce → Hash → Difficulty Target
      </Text>
    </group>
  );
}

export default function Phase5MiningScene() {
  return (
    <Canvas camera={{ position: [0, 1.1, 5.5], fov: 45 }} dpr={[1, 1.8]}>
      <color attach="background" args={["#07101f"]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 6, 5]} intensity={1.35} />
      <pointLight position={[-3, 2, 4]} color="#18b7a8" intensity={1.8} />
      <MiningModel />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}
