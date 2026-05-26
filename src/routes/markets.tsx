import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { ContractCard } from "@/components/ContractCard";
import { Sparkline } from "@/components/Sparkline";
import { marketBoard, aiFeed, makeSeries } from "@/lib/mockData";
import { Search, TrendingUp, Flame, Gem, Telescope } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/markets")({
  head: () => ({ meta: [{ title: "Markets — Skill Futures" }, { name: "description", content: "Live prediction markets for skill trajectories." }] }),
  component: Markets,
});

const tabs = [
  { id: "trending", label: "Trending", icon: Flame },
  { id: "top", label: "Top Performing", icon: TrendingUp },
  { id: "under", label: "Undervalued", icon: Gem },
  { id: "emerging", label: "Emerging Trends", icon: Telescope },
];

function Markets() {
  const [tab, setTab] = useState("trending");
  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Order Book</p>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">Skill Markets</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Live prediction markets for labor demand across 2,400+ skill buckets.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border-subtle bg-background/40 text-[13px] min-w-[260px]">
            <Search className="size-4 text-muted-foreground" />
            <input className="bg-transparent outline-none flex-1 placeholder:text-muted-foreground" placeholder="Search RF-2028, MATLAB, FPGA…" />
            <span className="text-mono text-[10px] text-muted-foreground">⌘K</span>
          </div>
        </div>
      </div>

      {/* Market stats banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          ["Markets", "2,418", "+34"],
          ["24h Volume", "$4.21M", "+8.2%"],
          ["Open Interest", "$48.2M", "+3.4%"],
          ["Avg. Spread", "1.2¢", "tight"],
          ["Oracle Health", "99.7%", "nominal"],
        ].map(([l, v, s]) => (
          <div key={l} className="panel p-3">
            <div className="text-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{l}</div>
            <div className="text-num text-lg font-semibold mt-0.5">{v}</div>
            <div className="text-mono text-[11px] text-success">{s}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-9 space-y-4">
          {/* Tabs */}
          <div className="panel p-1.5 flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-[13px] transition whitespace-nowrap ${
                  tab === t.id ? "bg-primary/15 text-foreground border border-primary/30" : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <t.icon className="size-3.5" />{t.label}
              </button>
            ))}
          </div>

          {/* Market grid */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {marketBoard.map((c) => <ContractCard key={c.symbol} c={c} />)}
          </div>

          {/* Order book table */}
          <div className="panel overflow-hidden">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-[14px] font-semibold tracking-tight">Live Tape · All Markets</h3>
              <span className="text-mono text-[11px] text-muted-foreground flex items-center gap-2"><span className="pulse-dot" />streaming</span>
            </div>
            <table className="w-full text-[12.5px]">
              <thead className="text-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <tr className="border-b border-border-subtle">
                  <th className="text-left py-2 px-4">Symbol</th>
                  <th className="text-left py-2">Market</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Δ 24h</th>
                  <th className="text-right py-2">Vol</th>
                  <th className="text-right py-2 pr-4">Trend</th>
                </tr>
              </thead>
              <tbody>
                {marketBoard.map((c) => {
                  const up = c.delta >= 0;
                  return (
                    <tr key={c.symbol} className="border-b border-border-subtle/60 hover:bg-surface-elevated/60 transition">
                      <td className="py-2.5 px-4 text-mono text-[12px]">{c.symbol}</td>
                      <td className="py-2.5 text-foreground/90 truncate max-w-[280px]">{c.title}</td>
                      <td className="py-2.5 text-right text-num">${c.price.toFixed(2)}</td>
                      <td className={`py-2.5 text-right text-num ${up ? "text-success" : "text-destructive"}`}>{up ? "+" : ""}{c.delta.toFixed(1)}%</td>
                      <td className="py-2.5 text-right text-num text-muted-foreground">{c.volume}</td>
                      <td className="py-2.5 pr-4 w-[140px]">
                        <Sparkline data={c.series} height={28} fill={false} color={up ? "var(--success)" : "var(--destructive)"} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: AI commentary + emerging */}
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <div className="panel p-4">
            <h3 className="text-[14px] font-semibold tracking-tight">AI Market Commentary</h3>
            <div className="mt-3 space-y-2.5">
              {aiFeed.slice(0, 5).map((f, i) => (
                <div key={i} className="rounded-md border border-border-subtle bg-background/40 p-2.5">
                  <div className="flex justify-between"><span className="text-mono text-[9.5px] uppercase tracking-[0.18em] text-primary">{f.tag}</span><span className="text-mono text-[10px] text-muted-foreground">{f.time}</span></div>
                  <p className="mt-1 text-[12.5px] leading-snug">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="panel p-4">
            <h3 className="text-[14px] font-semibold tracking-tight">Emerging Labor Trends</h3>
            <div className="mt-3 space-y-3">
              {[
                ["Quantum Hardware", "+118%", makeSeries(0.2, 40, 0.04, 0.015, 7)],
                ["Bio-AI Engineering", "+82%", makeSeries(0.25, 40, 0.04, 0.012, 8)],
                ["Climate Modeling", "+47%", makeSeries(0.35, 40, 0.03, 0.008, 9)],
                ["Robot Teleop", "+39%", makeSeries(0.30, 40, 0.03, 0.007, 10)],
              ].map(([name, d, s]) => (
                <div key={String(name)} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-[12.5px]">
                      <span className="truncate">{String(name)}</span>
                      <span className="text-success text-mono">{String(d)}</span>
                    </div>
                    <Sparkline data={s as number[]} height={28} color="var(--accent)" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
