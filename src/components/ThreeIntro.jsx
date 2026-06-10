import { Box, Network } from "lucide-react";
import BlockchainScene from "../scenes/BlockchainScene.jsx";

export default function ThreeIntro() {
  return (
    <section id="intro" className="section-wrap">
      <div className="mb-7 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-cyanx">
          <Network size={17} /> 3D Intro
        </p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">Data becomes blocks, blocks become a shared network</h2>
        <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">
          Rotate through the idea visually: particles represent data, cubes represent blocks, links represent the chain, and nodes represent distributed participants.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
        <div className="h-[460px] overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-soft dark:border-white/10">
          <BlockchainScene />
        </div>
        <div className="panel grid content-center gap-4 p-6">
          {["Data particles form records", "Records are grouped into blocks", "Blocks link by previous hash", "Copies spread across participant nodes"].map((item, index) => (
            <div key={item} className="flex gap-3 rounded-lg bg-slate-50 p-4 dark:bg-white/5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-bluex text-sm font-black text-white">{index + 1}</span>
              <div>
                <p className="font-black">{item}</p>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">This is the foundation for a ledger many computers can verify together.</p>
              </div>
            </div>
          ))}
          <div className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-cyanx">
            <Box size={16} /> Data → Block → Chain → Distributed network
          </div>
        </div>
      </div>
    </section>
  );
}
