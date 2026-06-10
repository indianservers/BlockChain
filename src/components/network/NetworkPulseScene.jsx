import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Radio, RotateCcw, Send } from "lucide-react";
import NodeStatusCard from "./NodeStatusCard.jsx";

const center = { x: 240, y: 170 };

export default function NetworkPulseScene() {
  const baseNodes = useMemo(() => createNodes(), []);
  const [nodes, setNodes] = useState(baseNodes);
  const [broadcasting, setBroadcasting] = useState(false);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!broadcasting) return undefined;
    const timers = [];
    baseNodes.forEach((node, index) => {
      const delay = index === 0 ? 0 : 260 + index * 180;
      timers.push(window.setTimeout(() => updateNode(index, "Received", delay), delay));
      timers.push(window.setTimeout(() => updateNode(index, "Validating", delay + 420), delay + 420));
      timers.push(window.setTimeout(() => updateNode(index, "Accepted", delay + 840), delay + 840));
    });
    timers.push(window.setTimeout(() => setBroadcasting(false), 2600));
    return () => timers.forEach(window.clearTimeout);
  }, [broadcasting, baseNodes, round]);

  function updateNode(index, status, timing) {
    setNodes(current => current.map(node => node.index === index ? { ...node, status, timing } : node));
  }

  function broadcast() {
    setNodes(baseNodes);
    setRound(value => value + 1);
    setBroadcasting(true);
  }

  function reset() {
    setBroadcasting(false);
    setNodes(baseNodes);
  }

  return (
    <section id="network-pulse" className="section-wrap bg-slate-950 text-white">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
          <Radio size={17} /> Node Network Pulse Animation
        </p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">Broadcast a transaction across seven peer nodes</h2>
        <p className="mt-3 text-lg leading-8 text-slate-300">
          Pulses move from the sender node to every peer while node states update from waiting to accepted.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <article className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-soft backdrop-blur-xl">
          <div className="relative mx-auto aspect-[1.42] max-w-3xl overflow-hidden rounded-lg border border-white/10 bg-slate-950">
            <svg viewBox="0 0 480 340" className="h-full w-full">
              {nodes.slice(1).map(node => (
                <line key={`line-${node.index}`} x1={center.x} y1={center.y} x2={node.x} y2={node.y} stroke="#67e8f9" strokeOpacity="0.35" strokeWidth="2" />
              ))}
              {nodes.map(node => (
                <g key={node.index}>
                  <circle cx={node.x} cy={node.y} r="26" fill={node.index === 0 ? "#2563eb" : "#0f766e"} opacity="0.95" />
                  <circle cx={node.x} cy={node.y} r="34" fill="none" stroke={node.status === "Accepted" ? "#34d399" : "#67e8f9"} strokeOpacity="0.42" />
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fill="white" fontSize="12" fontWeight="900">{node.index + 1}</text>
                </g>
              ))}
              {broadcasting && nodes.slice(1).map(node => (
                <motion.circle
                  key={`${round}-${node.index}`}
                  r="7"
                  fill="#22d3ee"
                  initial={{ cx: center.x, cy: center.y, opacity: 0.95 }}
                  animate={{ cx: node.x, cy: node.y, opacity: [0.95, 0.95, 0] }}
                  transition={{ duration: 0.75, delay: node.index * 0.12, ease: "easeOut" }}
                />
              ))}
            </svg>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={broadcast} disabled={broadcasting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-45"><Send size={18} /> Broadcast Transaction</button>
            <button type="button" onClick={reset} className="btn-secondary"><RotateCcw size={18} /> Reset</button>
          </div>
        </article>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {nodes.map(node => <NodeStatusCard key={node.index} node={node} />)}
        </div>
      </div>
    </section>
  );
}

function createNodes() {
  return Array.from({ length: 7 }, (_, index) => {
    const angle = index === 0 ? 0 : ((Math.PI * 2 * (index - 1)) / 6) - Math.PI / 2;
    const radius = index === 0 ? 0 : 120;
    return {
      index,
      name: index === 0 ? "Sender Node" : `Peer Node ${index}`,
      role: index === 0 ? "Broadcast source" : "Network participant",
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
      status: "Waiting",
      timing: 0
    };
  });
}
