import { Sparkline } from "./Sparkline";
import { TrendingUp, TrendingDown } from "lucide-react";

export type Contract = {
  symbol: string;
  title: string;
  strike: string;
  expiry: string;
  probability: number; // 0-100
  price: number; // 0-1
  volume: string;
  delta: number; // %
  series: number[];
  category: string;
};

export function ContractCard({ c }: { c: Contract }) {
  const up = c.delta >= 0;
  const color = up ? "var(--success)" : "var(--destructive)";
  return (
    <div className="panel p-4 hover:panel-glow transition-shadow group relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition" />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{c.symbol}</span>
            <span className="chip">{c.category}</span>
          </div>
          <h3 className="mt-1.5 text-[15px] font-semibold tracking-tight leading-snug truncate">{c.title}</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">{c.strike} · settles {c.expiry}</p>
        </div>
        <div className={`chip ${up ? "chip-pos" : "chip-neg"}`}>
          {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {up ? "+" : ""}{c.delta.toFixed(1)}%
        </div>
      </div>

      <div className="mt-3 -mx-1">
        <Sparkline data={c.series} color={color} height={50} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <Stat label="PROB" value={`${c.probability}%`} accent />
        <Stat label="PRICE" value={`$${c.price.toFixed(2)}`} />
        <Stat label="VOL 24H" value={c.volume} />
      </div>

      <div className="mt-3 flex gap-2">
        <button className="flex-1 py-1.5 rounded-md text-[12px] font-semibold border border-success/40 text-success bg-success/10 hover:bg-success/15 transition">
          BUY · ${c.price.toFixed(2)}
        </button>
        <button className="flex-1 py-1.5 rounded-md text-[12px] font-semibold border border-destructive/40 text-destructive bg-destructive/10 hover:bg-destructive/15 transition">
          SHORT · ${(1 - c.price).toFixed(2)}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-md border border-border-subtle bg-background/40 px-2 py-1.5">
      <div className="text-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className={`text-num text-[13px] font-semibold ${accent ? "text-primary" : "text-foreground"}`}>{value}</div>
    </div>
  );
}
