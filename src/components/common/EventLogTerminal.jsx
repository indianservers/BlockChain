import { TerminalSquare } from "lucide-react";

export default function EventLogTerminal({ title = "Event log terminal", events = [] }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-soft">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-white">
        <TerminalSquare size={18} className="text-cyanx" />
        <h3 className="font-black">{title}</h3>
      </div>
      <div className="max-h-96 overflow-auto p-4 font-mono text-sm">
        {events.length ? events.map(event => (
          <div key={event.id} className="mb-3 rounded-lg bg-white/[.03] p-3 text-slate-200">
            <span className="text-cyanx">[{event.timestamp}]</span>{" "}
            <span className="text-emerald-300">{event.name}</span>{" "}
            <span className={`rounded px-1.5 py-0.5 text-xs font-black uppercase ${event.status === "Rejected" || event.status === "Failed" ? "bg-red-500/20 text-red-200" : "bg-emerald-500/20 text-emerald-200"}`}>
              {event.status}
            </span>
            <p className="mt-2 whitespace-pre-wrap text-slate-300">{event.details}</p>
          </div>
        )) : (
          <p className="rounded-lg bg-white/[.03] p-3 text-slate-400">No events yet.</p>
        )}
      </div>
    </article>
  );
}

export function createLogEvent(name, details, status = "Success") {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toLocaleTimeString(),
    name,
    details,
    status
  };
}
