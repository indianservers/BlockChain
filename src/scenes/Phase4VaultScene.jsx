import { Float, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

function VaultModel() {
  const group = useRef();

  useFrame(({ clock }) => {
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.22;
  });

  return (
    <group ref={group}>
      <Float speed={1.2} floatIntensity={0.15} rotationIntensity={0.08}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.4, 1.65, 1.2]} />
          <meshStandardMaterial color="#2563eb" roughness={0.28} metalness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0.64]}>
          <torusGeometry args={[0.45, 0.08, 18, 64]} />
          <meshStandardMaterial color="#18b7a8" emissive="#0f766e" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, 0, 0.73]}>
          <circleGeometry args={[0.22, 32]} />
          <meshStandardMaterial color="#e0f2fe" />
        </mesh>
      </Float>
      <Float speed={1.5} floatIntensity={0.25}>
        <mesh position={[-1.9, 1.05, 0]}>
          <boxGeometry args={[0.7, 0.24, 0.16]} />
          <meshStandardMaterial color="#18b7a8" />
        </mesh>
        <Text position={[-1.9, 0.65, 0]} fontSize={0.14} color="#e0f2fe" anchorX="center">Private Key</Text>
      </Float>
      <Float speed={1.4} floatIntensity={0.25}>
        <mesh position={[1.9, 1.05, 0]}>
          <boxGeometry args={[0.7, 0.24, 0.16]} />
          <meshStandardMaterial color="#60a5fa" />
        </mesh>
        <Text position={[1.9, 0.65, 0]} fontSize={0.14} color="#e0f2fe" anchorX="center">Address</Text>
      </Float>
      <Text position={[0, -1.35, 0]} fontSize={0.18} color="#93c5fd" anchorX="center">
        Ownership = private key control
      </Text>
    </group>
  );
}

export default function Phase4VaultScene() {
  return (
    <Canvas camera={{ position: [0, 1.1, 5.5], fov: 45 }} dpr={[1, 1.8]}>
      <color attach="background" args={["#07101f"]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 6, 5]} intensity={1.35} />
      <pointLight position={[-3, 2, 4]} color="#18b7a8" intensity={1.8} />
      <VaultModel />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.55} />
    </Canvas>
  );
}
