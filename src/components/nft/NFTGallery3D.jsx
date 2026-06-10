import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls, RoundedBox } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createHash } from "../../utils/blockchainEngine.js";
import EventLogTerminal, { createLogEvent } from "../common/EventLogTerminal.jsx";
import NFTDetailPanel from "./NFTDetailPanel.jsx";
import NFTMarketplaceActions from "./NFTMarketplaceActions.jsx";
import OwnershipTrail from "./OwnershipTrail.jsx";

const key = "bfv-nft-gallery-state";
const logKey = "bfv-nft-gallery-events";

export default function NFTGallery3D() {
  const [nfts, setNfts] = useState(loadNfts);
  const [selectedId, setSelectedId] = useState(nfts[0]?.id ?? 1);
  const [actor, setActor] = useState("Alice");
  const [receiver, setReceiver] = useState("Bob");
  const [message, setMessage] = useState("Click an NFT card to inspect ownership.");
  const [events, setEvents] = useState(loadEvents);
  const selected = nfts.find(nft => nft.id === selectedId) ?? nfts[0];

  useEffect(() => localStorage.setItem(key, JSON.stringify(nfts)), [nfts]);
  useEffect(() => localStorage.setItem(logKey, JSON.stringify(events)), [events]);

  function log(name, details, status = "Success") {
    setEvents(current => [createLogEvent(name, details, status), ...current].slice(0, 50));
  }

  function appendHistory(nft, action, detail) {
    return { ...nft, history: [...nft.history, { action, detail, hash: createHash(`${nft.id}|${action}|${detail}|${Date.now()}`) }] };
  }

  function transfer(id, from, to) {
    setNfts(current => current.map(nft => {
      if (nft.id !== id) return nft;
      if (nft.owner !== from) {
        setMessage("Prevented: non-owner cannot transfer this NFT.");
        log("InvalidActionRejected", `${from} tried to transfer NFT #${id} owned by ${nft.owner}.`, "Rejected");
        return nft;
      }
      setMessage(`NFT #${id} transferred from ${from} to ${to}.`);
      log("NFTTransferred", `NFT #${id} transferred from ${from} to ${to}.`);
      return appendHistory({ ...nft, owner: to, listed: false }, "Transferred", `${from} -> ${to}`);
    }));
  }

  function list(id, owner) {
    setNfts(current => current.map(nft => {
      if (nft.id !== id) return nft;
      if (nft.owner !== owner) {
        setMessage("Prevented: only owner can list NFT.");
        log("InvalidActionRejected", `${owner} tried to list NFT #${id} owned by ${nft.owner}.`, "Rejected");
        return nft;
      }
      setMessage(`NFT #${id} listed for sale.`);
      log("NFTListed", `NFT #${id} listed by ${owner}.`);
      return appendHistory({ ...nft, listed: true, price: 18 }, "Listed", `${owner} listed for 18 LRN`);
    }));
  }

  function buy(id, buyer) {
    setNfts(current => current.map(nft => {
      if (nft.id !== id) return nft;
      if (!nft.listed) {
        setMessage("NFT is not listed for sale.");
        log("InvalidActionRejected", `Buy rejected for NFT #${id}; not listed.`, "Rejected");
        return nft;
      }
      const seller = nft.owner;
      setMessage(`${buyer} bought NFT #${id}.`);
      log("NFTBought", `${buyer} bought NFT #${id} from ${seller}.`);
      return appendHistory({ ...nft, owner: buyer, listed: false }, "Bought", `${buyer} bought from ${seller}`);
    }));
  }

  return (
    <section id="nft-ownership-gallery-3d" className="section-wrap bg-slate-950 text-white">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-cyanx">3D NFT Ownership Gallery</p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">Inspect, list, buy, and transfer unique NFT records</h2>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="h-[430px] overflow-hidden rounded-lg border border-white/10 bg-slate-950">
          <Canvas camera={{ position: [0, 1.2, 6], fov: 46 }} dpr={[1, 1.7]}>
            <color attach="background" args={["#07101f"]} />
            <ambientLight intensity={0.75} />
            <directionalLight position={[4, 5, 5]} intensity={1.3} />
            {nfts.map((nft, index) => <NftCardMesh key={nft.id} nft={nft} index={index} active={nft.id === selectedId} onSelect={setSelectedId} />)}
            <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.45} />
          </Canvas>
        </div>
        <div className="grid gap-5 text-slate-950 dark:text-white">
          <NFTDetailPanel nft={selected} />
          <NFTMarketplaceActions nft={selected} actor={actor} setActor={setActor} receiver={receiver} setReceiver={setReceiver} onTransfer={transfer} onList={list} onBuy={buy} message={message} />
        </div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2 text-slate-950 dark:text-white">
        <OwnershipTrail nft={selected} />
        <EventLogTerminal title="NFT ownership event terminal" events={events} />
      </div>
    </section>
  );
}

function NftCardMesh({ nft, index, active, onSelect }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const angle = (Math.PI * 2 * index) / 4;
  const position = [Math.cos(angle) * 2.4, Math.sin(index) * 0.3, Math.sin(angle) * 1.1];
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.45 + index;
    ref.current.scale.lerp(new THREE.Vector3(hovered || active ? 1.16 : 1, hovered || active ? 1.16 : 1, 1), 0.08);
  });
  return (
    <group ref={ref} position={position} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} onClick={() => onSelect(nft.id)}>
      <RoundedBox args={[1.35, 1.85, 0.08]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color={active ? "#2563eb" : "#0f766e"} emissive={active ? "#1d4ed8" : "#0f766e"} emissiveIntensity={0.25} roughness={0.28} />
      </RoundedBox>
      <Text position={[0, 0.28, 0.08]} fontSize={0.16} color="#f8fafc" anchorX="center">{nft.metadata.name}</Text>
      <Text position={[0, -0.08, 0.08]} fontSize={0.12} color="#bae6fd" anchorX="center">#{nft.id} · {nft.owner}</Text>
      <Text position={[0, -0.42, 0.08]} fontSize={0.1} color="#ccfbf1" anchorX="center">{nft.listed ? "Listed" : "Owned"}</Text>
    </group>
  );
}

function loadNfts() {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || "null");
    if (Array.isArray(stored)) return stored;
  } catch {
    // default below
  }
  return ["Consensus Badge", "Hash Art", "Genesis Pass", "Validator Card"].map((name, index) => ({
    id: index + 1,
    owner: "Alice",
    listed: false,
    price: 18,
    metadata: { name, rarity: ["Rare", "Common", "Epic", "Uncommon"][index], course: "Blockchain Foundations" },
    history: [{ action: "Minted", detail: `Minted to Alice`, hash: createHash(`${index + 1}|mint|Alice`) }]
  }));
}

function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem(logKey) || "[]");
  } catch {
    return [];
  }
}
