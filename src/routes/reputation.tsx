import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { Sparkline } from "@/components/Sparkline";
import { credentials, settlements, makeSeries } from "@/lib/mockData";
import { ShieldCheck, Fingerprint, CheckCircle2, Brain, Activity, Hash } from "lucide-react";

export const Route = createFileRoute("/reputation")({
  head: () => ({ meta: [{ title: "Reputation — Skill Futures" }, { name: "description", content: "Cryptographic identity and on-chain settlement history." }] }),
  component: Reputation,
});

function Reputation() {
  return (
    <Shell>
      <div className="mb-6">
        <p className="text-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Trust Layer</p>
        <h1 className="text-3xl font-semibold tracking-tight mt-1">Reputation</h1>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Trust score */}
        <div className="col-span-12 lg:col-span-4 panel panel-glow p-5 relative overflow-hidden">
          <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /><h3 className="text-[14px] font-semibold tracking-tight">Credential Trust Score</h3></div>
          <Gauge value={87} />
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Mini label="Verifications" value="14" />
            <Mini label="Disputes" value="0" highlight />
            <Mini label="AI Accuracy" value="94.6%" highlight />
            <Mini label="Settled" value="11/14" />
          </div>
        </div>

        {/* Identity graph */}
        <div className="col-span-12 lg:col-span-8 panel p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold tracking-tight flex items-center gap-2"><Fingerprint className="size-4 text-primary" />ERC-8004 Identity Graph</h3>
            <span className="chip chip-neon">0x7a3f…f19c</span>
          </div>
          <IdentityGraph />
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-[12px]">
            {[
              ["Issuer", "U. Waterloo"],
              ["Network", "Base · L2"],
              ["Verifier", "AI Oracle v3.2"],
              ["Last attestation", "2h ago"],
            ].map(([l, v]) => (
              <div key={l} className="rounded-md border border-border-subtle bg-background/40 p-2.5">
                <div className="text-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{l}</div>
                <div className="text-num text-[13px] mt-0.5">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification history */}
        <div className="col-span-12 lg:col-span-7 panel p-5">
          <h3 className="text-[14px] font-semibold tracking-tight flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" />Verification History</h3>
          <div className="mt-3 divide-y divide-border-subtle">
            {credentials.map((c) => (
              <div key={c.name} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate">{c.name}</div>
                  <div className="text-mono text-[11px] text-muted-foreground flex items-center gap-1.5"><Hash className="size-3" />{c.hash} · {c.issuer}</div>
                </div>
                <span className={`chip ${c.status === "Verified" ? "chip-pos" : ""}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Accuracy chart */}
        <div className="col-span-12 lg:col-span-5 panel p-5">
          <h3 className="text-[14px] font-semibold tracking-tight flex items-center gap-2"><Brain className="size-4 text-primary" />AI Assessment Accuracy</h3>
          <p className="text-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">90-day rolling</p>
          <Sparkline data={makeSeries(0.85, 60, 0.012, 0.001, 33)} height={100} color="var(--primary)" />
          <div className="grid grid-cols-3 gap-2 mt-3">
            <Mini label="Hit rate" value="94.6%" highlight />
            <Mini label="Brier" value="0.094" />
            <Mini label="Calib." value="0.97" />
          </div>
        </div>

        {/* Settlement history */}
        <div className="col-span-12 panel overflow-hidden">
          <div className="p-4 border-b border-border-subtle flex items-center justify-between">
            <h3 className="text-[14px] font-semibold tracking-tight flex items-center gap-2"><Activity className="size-4 text-primary" />Settlement History</h3>
            <span className="text-mono text-[11px] text-muted-foreground">on-chain · x402</span>
          </div>
          <table className="w-full text-[12.5px]">
            <thead className="text-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <tr className="border-b border-border-subtle">
                <th className="text-left py-2 px-4">Tx</th>
                <th className="text-left py-2">Asset</th>
                <th className="text-left py-2">Outcome</th>
                <th className="text-right py-2">Payout</th>
                <th className="text-right py-2 pr-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((s) => (
                <tr key={s.id} className="border-b border-border-subtle/60">
                  <td className="py-2.5 px-4 text-mono">{s.id}</td>
                  <td className="py-2.5 text-mono">{s.asset}</td>
                  <td className="py-2.5"><span className={`chip ${s.outcome === "YES" ? "chip-pos" : "chip-neg"}`}>{s.outcome}</span></td>
                  <td className="py-2.5 text-right text-num">{s.payout}</td>
                  <td className="py-2.5 pr-4 text-right text-mono text-muted-foreground">{s.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}

function Mini({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-md border border-border-subtle bg-background/40 p-2.5">
      <div className="text-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className={`text-num text-[13px] font-semibold ${highlight ? "text-success" : ""}`}>{value}</div>
    </div>
  );
}

function Gauge({ value }: { value: number }) {
  const r = 76;
  const C = 2 * Math.PI * r;
  const dash = (value / 100) * C;
  return (
    <div className="relative mt-3 grid place-items-center">
      <svg width={200} height={200} viewBox="0 0 200 200" className="-rotate-90">
        <circle cx={100} cy={100} r={r} stroke="var(--border-subtle)" strokeWidth="10" fill="none" />
        <circle cx={100} cy={100} r={r} stroke="url(#gg)" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={`${dash} ${C - dash}`} />
        <defs>
          <linearGradient id="gg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.82 0.14 195)" />
            <stop offset="100%" stopColor="oklch(0.78 0.16 165)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-5xl font-semibold tracking-tight text-num">{value}</div>
        <div className="text-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">trust score</div>
      </div>
    </div>
  );
}

function IdentityGraph() {
  // Static-but-pretty SVG node graph
  const nodes = [
    { x: 50, y: 50, l: "ID", primary: true },
    { x: 18, y: 22, l: "Univ" },
    { x: 82, y: 20, l: "GH" },
    { x: 12, y: 78, l: "Co-op" },
    { x: 85, y: 75, l: "FPGA" },
    { x: 50, y: 92, l: "AI" },
  ];
  return (
    <div className="mt-3 relative aspect-[2.4/1] rounded-md border border-border-subtle bg-background/40 overflow-hidden">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        {nodes.slice(1).map((n, i) => (
          <line key={i} x1={50} y1={50} x2={n.x} y2={n.y} stroke="oklch(0.82 0.14 195 / 0.4)" strokeWidth="0.3" strokeDasharray="0.6 0.6" />
        ))}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={n.primary ? 3.5 : 2} fill={n.primary ? "oklch(0.82 0.14 195)" : "oklch(0.22 0.016 250)"} stroke="oklch(0.82 0.14 195 / 0.6)" strokeWidth="0.4" />
            <text x={n.x} y={n.y - 4} textAnchor="middle" fontSize="2.2" fill="oklch(0.85 0.005 250)" fontFamily="JetBrains Mono">{n.l}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
