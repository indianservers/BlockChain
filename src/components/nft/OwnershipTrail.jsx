import { hashPreview } from "../../utils/blockchainEngine.js";

export default function OwnershipTrail({ nft }) {
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Ownership trail</h3>
      <div className="mt-4 grid gap-3">
        {nft.history.map((event, index) => (
          <div key={`${event.hash}-${index}`} className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
            <p className="font-black">{event.action}</p>
            <p className="mt-1 text-sm font-bold text-slate-600 dark:text-slate-300">{event.detail}</p>
            <p className="mt-2 break-all font-mono text-xs font-black text-cyanx">{hashPreview(event.hash, 16)}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
