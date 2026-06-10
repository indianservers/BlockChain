import { BadgeCheck } from "lucide-react";

export default function NFTDetailPanel({ nft }) {
  if (!nft) return null;
  return (
    <article className="panel p-5">
      <BadgeCheck className="mb-4 text-cyanx" size={30} />
      <h3 className="text-2xl font-black">{nft.metadata.name}</h3>
      <div className="mt-4 grid gap-3">
        <Field label="Token ID" value={`#${nft.id}`} />
        <Field label="Current owner" value={nft.owner} />
        <Field label="Marketplace status" value={nft.listed ? `Listed for ${nft.price} LRN` : "Not listed"} />
        <Field label="Metadata" value={JSON.stringify(nft.metadata, null, 2)} mono />
      </div>
    </article>
  );
}

function Field({ label, value, mono }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <pre className={`${mono ? "whitespace-pre-wrap font-mono text-xs" : "font-sans"} break-words font-black`}>{value}</pre>
    </div>
  );
}
