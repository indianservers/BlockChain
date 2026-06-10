import { ShoppingCart, Send } from "lucide-react";

export default function NFTMarketplaceActions({ nft, actor, setActor, receiver, setReceiver, onTransfer, onList, onBuy, message }) {
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Marketplace actions</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Select label="Actor" value={actor} onChange={setActor} />
        <Select label="Receiver" value={receiver} onChange={setReceiver} />
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={() => onTransfer(nft.id, actor, receiver)} className="btn-secondary"><Send size={18} /> Transfer NFT</button>
        <button type="button" onClick={() => onList(nft.id, actor)} className="btn-secondary">List NFT</button>
        <button type="button" onClick={() => onBuy(nft.id, actor)} className="btn-primary"><ShoppingCart size={18} /> Buy NFT</button>
      </div>
      <p className="mt-4 rounded-lg bg-cyanx/10 p-4 font-black text-cyanx">{message}</p>
    </article>
  );
}

function Select({ label, value, onChange }) {
  return (
    <label>
      <span className="mb-1 block text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <select value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-bold dark:border-white/10 dark:bg-slate-900">
        {["Alice", "Bob", "Charlie"].map(name => <option key={name}>{name}</option>)}
      </select>
    </label>
  );
}
