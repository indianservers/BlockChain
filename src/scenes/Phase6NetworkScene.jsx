import { Line, OrbitControls, Sphere, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";

function NetworkModel() {
  const group = useRef();
  const positions = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 7;
        return [Math.cos(angle) * 2.4, Math.sin(index * 1.7) * 0.35, Math.sin(angle) * 1.4];
      }),
    []
  );

  useFrame(({ clock }) => {
    group.current.rotation.y = clock.elapsedTime * 0.22;
  });

  return (
    <group ref={group}>
      {positions.map((point, index) => (
        <Sphere key={index} args={[0.18, 28, 28]} position={point}>
          <meshStandardMaterial color={index === 5 ? "#ef4444" : "#18b7a8"} emissive={index === 5 ? "#7f1d1d" : "#0f766e"} emissiveIntensity={0.25} />
        </Sphere>
      ))}
      {positions.map((point, index) => (
        <Line key={`ring-${index}`} points={[point, positions[(index + 1) % positions.length]]} color="#67e8f9" transparent opacity={0.7} lineWidth={2} />
      ))}
      {positions.map((point, index) => (
        <Line key={`cross-${index}`} points={[point, positions[(index + 3) % positions.length]]} color="#93c5fd" transparent opacity={0.28} lineWidth={1} />
      ))}
      <Text position={[0, -1.7, 0]} fontSize={0.18} color="#e0f2fe" anchorX="center">
        Seven nodes vote on one valid chain state
      </Text>
    </group>
  );
}

export default function Phase6NetworkScene() {
  return (
    <Canvas camera={{ position: [0, 1.2, 5.6], fov: 45 }} dpr={[1, 1.8]}>
      <color attach="background" args={["#07101f"]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 6, 5]} intensity={1.35} />
      <pointLight position={[-3, 2, 4]} color="#18b7a8" intensity={1.8} />
      <NetworkModel />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.45} />
    </Canvas>
  );
}
