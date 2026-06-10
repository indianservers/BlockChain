import { Environment, Line, OrbitControls, Stars, Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import BlockMesh from "./BlockMesh.jsx";
import DataParticle from "./DataParticle.jsx";
import NetworkNodeMesh from "./NetworkNodeMesh.jsx";
import TransactionMesh from "./TransactionMesh.jsx";

const cameraStops = [
  { position: [0, 2.2, 6.6], target: [0, 0, 0] },
  { position: [-2.4, 1.4, 5.2], target: [-2.2, 0.1, 0] },
  { position: [-1.1, 1.6, 4.8], target: [-1.2, 0, 0] },
  { position: [0.4, 1.8, 5.1], target: [0.3, 0, 0] },
  { position: [1.2, 1.9, 5.6], target: [1.1, 0, 0] },
  { position: [0.3, 1.5, 4.5], target: [0, 0, 0] },
  { position: [1.2, 1.6, 4.5], target: [1.1, 0, 0] },
  { position: [2.6, 2.1, 5.2], target: [2.2, 0, 0] },
  { position: [0, 2.4, 6.3], target: [0.2, 0, 0] },
  { position: [0, 3.1, 7.2], target: [0, -0.3, 0] }
];

export default function BlockchainAssemblyScene({ currentStep, selectedObject, onSelectObject, onHoverObject }) {
  const blocks = useMemo(() => createBlocks(), []);
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => {
        const angle = index * 0.72;
        return {
          id: index,
          position: [-3.2 + Math.cos(angle) * 0.9, Math.sin(index * 1.9) * 0.8, Math.sin(angle) * 0.9],
          target: [-1.45 + (index % 4) * 0.22, -0.55 + Math.floor(index / 4) * 0.13, 0.15]
        };
      }),
    []
  );
  const transactions = useMemo(
    () => [
      [-1.25, 0.58, 0],
      [-1.25, -0.08, 0],
      [-1.25, -0.74, 0]
    ],
    []
  );
  const blockPositions = useMemo(() => [[-0.1, 0, 0], [1.05, 0, 0], [2.2, 0, 0]], []);
  const nodes = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 6;
        return [Math.cos(angle) * 2.2 + 0.6, -1.85, Math.sin(angle) * 1.2];
      }),
    []
  );

  return (
    <div className="relative h-[32rem] overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-soft">
      <Canvas camera={{ position: [0, 2.2, 6.6], fov: 48 }} dpr={[1, 1.7]} onPointerMissed={() => onSelectObject?.(null)}>
        <color attach="background" args={["#07101f"]} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[5, 6, 5]} intensity={1.45} />
        <pointLight position={[-4, 2, 3]} color="#18b7a8" intensity={1.9} />
        <pointLight position={[3, 2.5, -2]} color="#2563eb" intensity={1.6} />
        <Stars radius={28} depth={18} count={700} factor={2.4} saturation={0} fade speed={0.45} />
        <CameraRig step={currentStep} />

        <group>
          <Text position={[-3.15, 1.35, 0]} fontSize={0.16} color="#bae6fd" anchorX="center">
            Raw data
          </Text>
          {particles.map(particle => (
            <DataParticle key={particle.id} {...particle} active={currentStep >= 1} onHover={onHoverObject} />
          ))}
        </group>

        {transactions.map((position, index) => (
          <TransactionMesh
            key={index}
            id={index}
            position={position}
            visible={currentStep >= 1}
            active={currentStep >= 2 && currentStep <= 4}
            onHover={onHoverObject}
          />
        ))}

        {blocks.map((block, index) => (
          <BlockMesh
            key={block.index}
            block={block}
            position={blockPositions[index]}
            previousPosition={index ? blockPositions[index - 1] : null}
            visible={currentStep >= 5}
            active={currentStep >= 5 && currentStep <= 8}
            selected={selectedObject?.type === "block" && selectedObject.index === block.index}
            onSelect={blockData => onSelectObject?.({ type: "block", ...blockData })}
            onHover={onHoverObject}
          />
        ))}

        {currentStep >= 7 && nodes.map((position, index) => (
          <NetworkNodeMesh key={index} id={index} position={position} active={currentStep >= 8} onHover={onHoverObject} />
        ))}
        {currentStep >= 7 && nodes.map((position, index) => (
          <Line key={`node-line-${index}`} points={[position, nodes[(index + 1) % nodes.length]]} color="#67e8f9" lineWidth={1.5} transparent opacity={0.52} />
        ))}
        {currentStep >= 9 && blockPositions.map((position, index) => (
          <Line key={`ledger-sync-${index}`} points={[position, nodes[index % nodes.length]]} color="#93c5fd" lineWidth={1} transparent opacity={0.42} />
        ))}

        <Environment preset="city" />
      </Canvas>
      <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-black text-white backdrop-blur-xl">
        Step {currentStep + 1}: assembly view
      </div>
    </div>
  );
}

function CameraRig({ step }) {
  const { camera } = useThree();
  const controls = useRef();
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const stop = cameraStops[Math.min(step, cameraStops.length - 1)];
    camera.position.lerp(new THREE.Vector3(...stop.position), 0.045);
    target.lerp(new THREE.Vector3(...stop.target), 0.05);
    camera.lookAt(target);
    controls.current?.target.copy(target);
    controls.current?.update();
  });

  return <OrbitControls ref={controls} enablePan={false} enableZoom={false} />;
}

function createBlocks() {
  const now = new Date().toLocaleTimeString();
  return [0, 1, 2].map(index => {
    const previousHash = index === 0 ? "0000000000000000" : `bfv-prev-${index - 1}-49a2`;
    return {
      index,
      hash: `bfv-${index}-hash-${["8cf9a2", "10ab67", "f42d91"][index]}-${index + 41}`,
      previousHash,
      timestamp: now,
      transactions: index === 0 ? 3 : 2 + index
    };
  });
}
