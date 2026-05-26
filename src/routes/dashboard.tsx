import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { ContractCard } from "@/components/ContractCard";
import { Sparkline } from "@/components/Sparkline";
import { featuredContracts, aiFeed, laborHeatmap, credentials, makeSeries } from "@/lib/mockData";
import {
  Fingerprint, Network, Activity, Gauge, Vault, Brain,
  CheckCircle2, ShieldCheck, Github, GraduationCap, Briefcase, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Skill Futures" }, { name: "description", content: "Your verified identity, skill graph, and live contracts." }] }),
  component: Dashboard,
});

const sidebar = [
  { label: "Verified Identity", icon: Fingerprint, count: "ERC-8004" },
  { label: "Skill Graph", icon: Network, count: "12 nodes" },
  { label: "Active Contracts", icon: Activity, count: "6" },
  { label: "Market Sentiment", icon: Gauge, count: "+2.4σ" },
  { label: "Credential Vault", icon: Vault, count: "5" },
  { label: "AI Forecasts", icon: Brain, count: "v3.2" },
];

function Dashboard() {
  return (
    <Shell>
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Terminal · Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">Welcome back, Mihir</h1>
        </div>
        <div className="text-mono text-[11px] text-muted-foreground hidden md:flex items-center gap-3">
          <span>Session 0x7a…f19c</span>
          <span className="chip chip-pos">SYNCED</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* LEFT SIDEBAR */}
        <aside className="col-span-12 lg:col-span-2">
          <div className="panel p-2 sticky top-24">
            {sidebar.map((s, i) => (
              <button
                key={s.label}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition ${
                  i === 0 ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                }`}
              >
                <s.icon className="size-4" />
                <span className="flex-1 text-left">{s.label}</span>
                <span className="text-mono text-[10px] text-muted-foreground">{s.count}</span>
              </button>
            ))}
            <div className="mt-2 mx-2 p-2.5 rounded-md border border-border-subtle bg-background/40">
              <div className="text-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">AI Confidence</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-semibold tracking-tight text-primary">82</span>
                <span className="text-mono text-[11px] text-muted-foreground">/100</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-surface overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: "82%" }} />
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER */}
        <section className="col-span-12 lg:col-span-7 space-y-4">
          {/* Profile card */}
          <div className="panel panel-glow p-5 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 size-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="flex items-start gap-5">
              <div className="relative size-16 rounded-lg border border-primary/40 bg-gradient-to-br from-primary/30 to-accent/20 grid place-items-center text-xl font-semibold">
                MS
                <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-background border border-primary/50 grid place-items-center">
                  <ShieldCheck className="size-3 text-primary" />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold tracking-tight">Mihir S.</h2>
                  <span className="chip chip-neon"><Fingerprint className="size-3" />ERC-8004 · 0x7a…f19c</span>
                </div>
                <p className="text-[13px] text-muted-foreground mt-0.5">Engineering · RF Systems · Class of 2027</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["MATLAB", "FPGA", "CAD", "Embedded Systems", "Verilog", "Signal Processing"].map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-md text-[11px] border border-border bg-surface-elevated text-foreground/90">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Badge icon={<GraduationCap className="size-3.5" />} label="Verified Transcript" />
                  <Badge icon={<Github className="size-3.5" />} label="GitHub Analyzed" />
                  <Badge icon={<Briefcase className="size-3.5" />} label="Co-op Verified" />
                  <Badge icon={<Brain className="size-3.5" />} label="AI Score 82%" highlight />
                </div>
              </div>
            </div>
          </div>

          {/* Contracts */}
          <div className="flex items-end justify-between pt-2">
            <div>
              <p className="text-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Live</p>
              <h2 className="text-lg font-semibold tracking-tight">Your Skill Futures Contracts</h2>
            </div>
            <button className="text-[12px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              View all <ChevronRight className="size-3.5" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {featuredContracts.map((c) => <ContractCard key={c.symbol} c={c} />)}
          </div>

          {/* Credential vault */}
          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold tracking-tight flex items-center gap-2">
                <Vault className="size-4 text-primary" /> Credential Vault
              </h3>
              <span className="text-mono text-[11px] text-muted-foreground">5 of 6 verified</span>
            </div>
            <div className="mt-3 divide-y divide-border-subtle">
              {credentials.map((c) => (
                <div key={c.name} className="py-2.5 flex items-center justify-between gap-3 text-[13px]">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{c.name}</div>
                    <div className="text-mono text-[11px] text-muted-foreground">{c.issuer} · {c.hash}</div>
                  </div>
                  <span className={`chip ${c.status === "Verified" ? "chip-pos" : ""}`}>
                    {c.status === "Verified" && <CheckCircle2 className="size-3" />}
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <div className="panel p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold tracking-tight flex items-center gap-2">
                <Brain className="size-4 text-primary" /> AI Labor Market Analysis
              </h3>
              <span className="text-mono text-[10px] text-muted-foreground">v3.2</span>
            </div>
            <div className="mt-3 space-y-2.5">
              {aiFeed.map((f, i) => (
                <div key={i} className="rounded-md border border-border-subtle bg-background/40 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-mono text-[9.5px] uppercase tracking-[0.18em] text-primary">{f.tag}</span>
                    <span className="text-mono text-[10px] text-muted-foreground">{f.time}</span>
                  </div>
                  <p className="mt-1 text-[12.5px] text-foreground/90 leading-snug">{f.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap */}
          <div className="panel p-4">
            <h3 className="text-[14px] font-semibold tracking-tight">Labor Heatmap</h3>
            <p className="text-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">RF / Embedded · 24h</p>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {laborHeatmap.map((r) => (
                <div
                  key={r.code}
                  className="aspect-square rounded-md border border-border-subtle relative overflow-hidden grid place-items-center"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, oklch(0.82 0.14 195 / ${r.heat * 0.55}), transparent 70%), var(--surface)`,
                  }}
                  title={`${r.name} · heat ${(r.heat * 100).toFixed(0)}`}
                >
                  <span className="text-mono text-[10px] font-semibold">{r.code}</span>
                  <span className={`absolute bottom-1 right-1 text-mono text-[9px] ${r.delta >= 0 ? "text-success" : "text-destructive"}`}>
                    {r.delta >= 0 ? "+" : ""}{r.delta}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence meters */}
          <div className="panel p-4">
            <h3 className="text-[14px] font-semibold tracking-tight">Skill Trend Signals</h3>
            <div className="mt-3 space-y-3">
              {[
                ["RF Engineering", 0.86, "+12.4%"],
                ["FPGA Design", 0.81, "+9.1%"],
                ["MATLAB Systems", 0.67, "+3.2%"],
                ["CAD Design", 0.32, "-4.6%"],
              ].map(([name, v, d]) => (
                <div key={String(name)}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-foreground/90">{name}</span>
                    <span className={`text-mono ${(d as string).startsWith("+") ? "text-success" : "text-destructive"}`}>{d}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-surface overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${(v as number) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 -mx-1">
              <Sparkline data={makeSeries(0.4, 40, 0.03, 0.006, 31)} height={48} color="var(--accent)" />
            </div>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

function Badge({ icon, label, highlight }: { icon: React.ReactNode; label: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-[11.5px] ${
      highlight ? "border-primary/40 bg-primary/10 text-primary" : "border-border-subtle bg-background/40 text-foreground/85"
    }`}>
      {icon}{label}
    </div>
  );
}
