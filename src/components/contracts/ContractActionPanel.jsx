import { Play, RefreshCw, ShieldAlert } from "lucide-react";

export default function ContractActionPanel({ onAction, onInvalid, onReset }) {
  return (
    <article className="panel p-5">
      <h3 className="text-2xl font-black">Contract controls</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => onAction("deploy")} className="btn-secondary">Deploy Contract</button>
        <button type="button" onClick={() => onAction("deposit")} className="btn-secondary">Deposit</button>
        <button type="button" onClick={() => onAction("deliver")} className="btn-secondary">Mark Delivered</button>
        <button type="button" onClick={() => onAction("confirm")} className="btn-secondary">Confirm Delivery</button>
        <button type="button" onClick={() => onAction("release")} className="btn-primary"><Play size={18} /> Release Payment</button>
        <button type="button" onClick={onInvalid} className="btn-secondary"><ShieldAlert size={18} /> Try Invalid Action</button>
        <button type="button" onClick={onReset} className="btn-secondary sm:col-span-2"><RefreshCw size={18} /> Reset</button>
      </div>
    </article>
  );
}
