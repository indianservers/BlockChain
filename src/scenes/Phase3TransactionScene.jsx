import { Float, Line, OrbitControls, Sphere, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";

function FlowModel() {
  const group = useRef();
  const points = useMemo(
    () => [
      [-2.8, 0.2, 0],
      [-1.35, -0.15, 0],
      [0, 0.25, 0],
      [1.35, -0.15, 0],
      [2.8, 0.2, 0]
    ],
    []
  );
  const labels = ["Wallet", "Transaction", "Signature", "Mempool", "Block"];

  useFrame(({ clock }) => {
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.18;
  });

  return (
    <group ref={group}>
      {points.map((point, index) => (
        <Float key={labels[index]} speed={1.1 + index * 0.12} floatIntensity={0.2} rotationIntensity={0.14}>
          {index === 4 ? (
            <mesh position={point}>
              <boxGeometry args={[0.78, 0.78, 0.78]} />
              <meshStandardMaterial color="#2563eb" roughness={0.32} metalness={0.2} />
            </mesh>
          ) : (
            <Sphere args={[0.32, 28, 28]} position={point}>
              <meshStandardMaterial color={index === 2 ? "#18b7a8" : "#60a5fa"} emissive="#0f172a" />
            </Sphere>
          )}
          <Text position={[point[0], point[1] - 0.72, point[2]]} fontSize={0.15} color="#e0f2fe" anchorX="center">
            {labels[index]}
          </Text>
        </Float>
      ))}
      {points.slice(0, -1).map((point, index) => (
        <Line key={index} points={[point, points[index + 1]]} color="#67e8f9" lineWidth={3} transparent opacity={0.85} />
      ))}
    </group>
  );
}

export default function Phase3TransactionScene() {
  return (
    <Canvas camera={{ position: [0, 1.1, 6], fov: 45 }} dpr={[1, 1.8]}>
      <color attach="background" args={["#07101f"]} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[5, 6, 5]} intensity={1.3} />
      <pointLight position={[-3, 2, 4]} color="#18b7a8" intensity={1.8} />
      <FlowModel />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.55} />
    </Canvas>
  );
}
