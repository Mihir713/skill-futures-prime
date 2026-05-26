import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { Sparkline } from "@/components/Sparkline";
import { portfolioHoldings, makeSeries } from "@/lib/mockData";
import { TrendingUp, TrendingDown, Brain } from "lucide-react";

export const Route = createFileRoute("/portfolio")({
  head: () => ({ meta: [{ title: "Portfolio — Skill Futures" }, { name: "description", content: "Your contracts, exposures, and projected payouts." }] }),
  component: Portfolio,
});

function Portfolio() {
  const totalValue = portfolioHoldings.reduce((a, h) => a + h.qty * h.mark, 0);
  const totalCost = portfolioHoldings.reduce((a, h) => a + h.qty * h.avg, 0);
  const pnl = totalValue - totalCost;
  const pnlPct = (pnl / totalCost) * 100;

  const exposureMap = portfolioHoldings.reduce<Record<string, number>>((acc, h) => {
    acc[h.exposure] = (acc[h.exposure] || 0) + h.qty * h.mark;
    return acc;
  }, {});
  const exposures = Object.entries(exposureMap).map(([k, v]) => ({ name: k, value: v, pct: (v / totalValue) * 100 }));

  return (
    <Shell>
      <div className="mb-6">
        <p className="text-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Position Book</p>
        <h1 className="text-3xl font-semibold tracking-tight mt-1">Portfolio</h1>
      </div>

      {/* Hero KPIs */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-12 lg:col-span-8 panel panel-glow p-5 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 size-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="text-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Mark-to-market</div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-5xl font-semibold tracking-tight text-num">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span className={`text-mono text-sm ${pnl >= 0 ? "text-success" : "text-destructive"}`}>
              {pnl >= 0 ? "+" : ""}${pnl.toFixed(0)} ({pnlPct.toFixed(2)}%)
            </span>
          </div>
          <div className="mt-3 -mx-1">
            <Sparkline data={makeSeries(0.55, 80, 0.025, 0.005, 13)} height={84} color="var(--primary)" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            <Stat label="Cost basis" value={`$${totalCost.toFixed(0)}`} />
            <Stat label="Unrealized P&L" value={`${pnl >= 0 ? "+" : ""}$${pnl.toFixed(0)}`} highlight={pnl >= 0} />
            <Stat label="Realized YTD" value="+$2,418" highlight />
            <Stat label="Sharpe" value="1.84" />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 panel p-5">
          <h3 className="text-[14px] font-semibold tracking-tight">Labor Exposure</h3>
          <p className="text-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">by category</p>
          <DonutChart data={exposures} />
          <div className="mt-3 space-y-1.5">
            {exposures.map((e, i) => (
              <div key={e.name} className="flex items-center gap-2 text-[12.5px]">
                <span className="size-2 rounded-full" style={{ background: donutColor(i) }} />
                <span className="flex-1 truncate">{e.name}</span>
                <span className="text-mono text-muted-foreground">{e.pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="panel overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-[14px] font-semibold tracking-tight">Owned Contracts</h3>
          <span className="text-mono text-[11px] text-muted-foreground">{portfolioHoldings.length} positions</span>
        </div>
        <table className="w-full text-[12.5px]">
          <thead className="text-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <tr className="border-b border-border-subtle">
              <th className="text-left py-2 px-4">Symbol</th>
              <th className="text-left py-2">Exposure</th>
              <th className="text-right py-2">Qty</th>
              <th className="text-right py-2">Avg</th>
              <th className="text-right py-2">Mark</th>
              <th className="text-right py-2">Value</th>
              <th className="text-right py-2 pr-4">P&L</th>
            </tr>
          </thead>
          <tbody>
            {portfolioHoldings.map((h) => {
              const value = h.qty * h.mark;
              const pnl = (h.mark - h.avg) * h.qty;
              const up = pnl >= 0;
              return (
                <tr key={h.symbol} className="border-b border-border-subtle/60 hover:bg-surface-elevated/60 transition">
                  <td className="py-2.5 px-4 text-mono">{h.symbol}</td>
                  <td className="py-2.5"><span className="chip">{h.exposure}</span></td>
                  <td className="py-2.5 text-right text-num">{h.qty.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-num text-muted-foreground">${h.avg.toFixed(2)}</td>
                  <td className="py-2.5 text-right text-num">${h.mark.toFixed(2)}</td>
                  <td className="py-2.5 text-right text-num">${value.toFixed(0)}</td>
                  <td className={`py-2.5 pr-4 text-right text-num ${up ? "text-success" : "text-destructive"}`}>
                    <span className="inline-flex items-center gap-1">{up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}{up ? "+" : ""}${pnl.toFixed(0)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Projections */}
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div className="panel p-5">
          <h3 className="text-[14px] font-semibold tracking-tight flex items-center gap-2"><Brain className="size-4 text-primary" />AI Payout Projection · 2028</h3>
          <div className="mt-3 space-y-2.5">
            {portfolioHoldings.slice(0, 4).map((h) => {
              const proj = h.qty * 1.0 * (h.mark + Math.random() * 0.05);
              return (
                <div key={h.symbol} className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="text-mono text-[11px] text-muted-foreground">{h.symbol}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-1.5 rounded-full bg-surface overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${h.mark * 100}%` }} />
                    </div>
                    <span className="text-num text-success w-20 text-right">${proj.toFixed(0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="panel p-5">
          <h3 className="text-[14px] font-semibold tracking-tight">Realized Returns · Trailing 12m</h3>
          <div className="mt-3 -mx-1">
            <Sparkline data={makeSeries(0.40, 60, 0.04, 0.008, 21)} height={120} color="var(--accent)" />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <Stat label="Best month" value="+18.2%" highlight />
            <Stat label="Worst month" value="-4.1%" />
            <Stat label="Win rate" value="71%" />
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-md border border-border-subtle bg-background/40 p-2.5">
      <div className="text-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className={`text-num text-[14px] font-semibold ${highlight ? "text-success" : ""}`}>{value}</div>
    </div>
  );
}

function donutColor(i: number) {
  return ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"][i % 5];
}

function DonutChart({ data }: { data: { name: string; value: number; pct: number }[] }) {
  const size = 180;
  const r = 70;
  const cx = size / 2, cy = size / 2;
  const C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="mt-3 grid place-items-center relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth="14" />
        {data.map((d, i) => {
          const dash = (d.pct / 100) * C;
          const el = (
            <circle
              key={d.name}
              cx={cx} cy={cy} r={r} fill="none"
              stroke={donutColor(i)} strokeWidth="14" strokeLinecap="butt"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={-acc}
            />
          );
          acc += dash;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Total</div>
          <div className="text-num text-lg font-semibold">${data.reduce((a, d) => a + d.value, 0).toFixed(0)}</div>
        </div>
      </div>
    </div>
  );
}
