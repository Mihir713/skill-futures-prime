import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { Sparkline } from "@/components/Sparkline";
import { makeSeries } from "@/lib/mockData";
import { useMemo, useState } from "react";
import { Brain, CircuitBoard, Cpu, Activity, MapPin, GraduationCap, Briefcase, Sparkles, Check, ArrowRight, Zap } from "lucide-react";

export const Route = createFileRoute("/mint")({
  head: () => ({ meta: [{ title: "Mint Contract — talentmkt" }, { name: "description", content: "Mint a verified skill futures contract." }] }),
  component: Mint,
});

const skillOpts = [
  { v: "RF Engineering", icon: Activity },
  { v: "FPGA Design", icon: CircuitBoard },
  { v: "Embedded Systems", icon: Cpu },
  { v: "AI / ML", icon: Brain },
];
const industries = ["Semiconductors", "Defense Tech", "Quant Finance", "Robotics", "AI Infrastructure", "Aerospace"];
const regions = ["North America", "EU", "UK", "APAC", "Global"];
const years = ["2026", "2027", "2028", "2029", "2030"];

function Mint() {
  const [skill, setSkill] = useState("RF Engineering");
  const [salary, setSalary] = useState(85);
  const [year, setYear] = useState("2028");
  const [industry, setIndustry] = useState("Semiconductors");
  const [region, setRegion] = useState("North America");

  // Deterministic AI estimate from inputs
  const ai = useMemo(() => {
    const base = 0.55;
    const salaryFactor = Math.max(-0.35, Math.min(0.25, (90 - salary) / 200));
    const industryBoost = { "Semiconductors": 0.10, "Defense Tech": 0.12, "Quant Finance": 0.06, "Robotics": 0.05, "AI Infrastructure": 0.18, "Aerospace": 0.04 }[industry] ?? 0;
    const regionBoost = { "North America": 0.06, "EU": 0.02, "UK": 0.01, "APAC": 0.04, "Global": 0.05 }[region] ?? 0;
    const skillBoost = { "RF Engineering": 0.10, "FPGA Design": 0.14, "Embedded Systems": 0.07, "AI / ML": 0.22 }[skill] ?? 0.05;
    const yearPenalty = (Number(year) - 2026) * -0.012;
    const p = Math.max(0.05, Math.min(0.97, base + salaryFactor + industryBoost + regionBoost + skillBoost + yearPenalty));
    const risk = Math.round((1 - p) * 65 + 15);
    const liquidity = Math.round(40 + skillBoost * 200 + industryBoost * 120);
    return {
      probability: Math.round(p * 100),
      suggestedPrice: p,
      risk,
      liquidity,
      series: makeSeries(p - 0.15, 32, 0.03, 0.005, Math.floor(p * 1000)),
    };
  }, [skill, salary, year, industry, region]);

  return (
    <Shell>
      <div className="mb-6">
        <p className="text-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Primary Issuance</p>
        <h1 className="text-3xl font-semibold tracking-tight mt-1">Mint Skill Future</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Define the parameters. Oracle v3.2 prices it. Settle via x402.</p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Form */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <div className="panel p-5">
            <h3 className="text-[14px] font-semibold tracking-tight mb-3 flex items-center gap-2">
              <span className="size-5 grid place-items-center rounded-md bg-primary/15 text-primary text-mono text-[11px]">01</span> Skill Category
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {skillOpts.map((s) => (
                <button
                  key={s.v}
                  onClick={() => setSkill(s.v)}
                  className={`p-3 rounded-md border text-left transition ${
                    skill === s.v ? "border-primary/50 bg-primary/10" : "border-border-subtle hover:border-border bg-background/40"
                  }`}
                >
                  <s.icon className={`size-4 ${skill === s.v ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="mt-2 text-[13px] font-medium">{s.v}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <h3 className="text-[14px] font-semibold tracking-tight mb-3 flex items-center gap-2">
              <span className="size-5 grid place-items-center rounded-md bg-primary/15 text-primary text-mono text-[11px]">02</span> Salary Threshold
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-mono text-3xl font-semibold text-primary">${salary}k</span>
              <span className="text-mono text-[11px] text-muted-foreground">base salary by {year}</span>
            </div>
            <input
              type="range" min={50} max={250} step={5} value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              className="w-full mt-3 accent-[oklch(0.82_0.14_195)]"
            />
            <div className="flex justify-between text-mono text-[10px] text-muted-foreground mt-1">
              <span>$50k</span><span>$150k</span><span>$250k</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Field icon={<GraduationCap className="size-4 text-primary" />} label="03 · Graduation Year" value={year} onChange={setYear} opts={years} />
            <Field icon={<Briefcase className="size-4 text-primary" />} label="04 · Target Industry" value={industry} onChange={setIndustry} opts={industries} />
            <Field icon={<MapPin className="size-4 text-primary" />} label="05 · Geographic Region" value={region} onChange={setRegion} opts={regions} />
          </div>
        </div>

        {/* AI panel */}
        <aside className="col-span-12 lg:col-span-5">
          <div className="panel panel-glow p-5 sticky top-24 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px scanline" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="size-4 text-primary" />
                <h3 className="text-[14px] font-semibold tracking-tight">AI Oracle Estimate</h3>
              </div>
              <span className="chip chip-neon"><Sparkles className="size-3" />v3.2</span>
            </div>

            <div className="mt-4">
              <div className="text-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Probability of YES outcome</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-semibold tracking-tight text-primary text-num">{ai.probability}%</span>
                <span className="text-mono text-[12px] text-success">calibrated</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-surface overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${ai.probability}%` }} />
              </div>
            </div>

            <div className="mt-4 -mx-1">
              <Sparkline data={ai.series} color="var(--primary)" height={60} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Mini label="Price" value={`$${ai.suggestedPrice.toFixed(2)}`} accent />
              <Mini label="Risk" value={`${ai.risk}/100`} />
              <Mini label="Liquidity" value={`${ai.liquidity}`} />
            </div>

            <div className="mt-4 rounded-md border border-border-subtle bg-background/40 p-3">
              <div className="text-mono text-[10px] uppercase tracking-[0.18em] text-primary">Labor demand analysis</div>
              <p className="text-[12.5px] mt-1 text-foreground/90 leading-snug">
                {skill} demand in {industry} ({region}) is projected to grow{" "}
                <span className="text-success">+{Math.round(8 + ai.probability / 4)}% YoY</span> through {year}.
                {salary > 120 ? " Premium TC tier; tighter convergence expected post-2027." : " Within median TC band; broad market participation likely."}
              </p>
            </div>

            <button className="btn-primary w-full mt-4">
              <Zap className="size-4" /> Mint Contract · x402 Settlement <ArrowRight className="size-4" />
            </button>
            <div className="mt-2 flex items-center justify-center gap-3 text-mono text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Check className="size-3 text-success" />Gas-less</span>
              <span className="flex items-center gap-1"><Check className="size-3 text-success" />Instant settle</span>
              <span className="flex items-center gap-1"><Check className="size-3 text-success" />ERC-8004 verified</span>
            </div>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

function Field({ icon, label, value, onChange, opts }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; opts: string[] }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 text-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {icon}{label}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full bg-background/60 border border-border-subtle rounded-md px-3 py-2 text-[13px] outline-none focus:border-primary/50"
      >
        {opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-md border border-border-subtle bg-background/40 p-2.5">
      <div className="text-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className={`text-num text-[15px] font-semibold ${accent ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}
