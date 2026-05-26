import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { NetworkBackground } from "@/components/NetworkBackground";
import { Sparkline } from "@/components/Sparkline";
import { ContractCard } from "@/components/ContractCard";
import { featuredContracts, makeSeries } from "@/lib/mockData";
import { ArrowRight, Brain, ShieldCheck, Activity, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "talentmkt — Talent Markets" },
      { name: "description", content: "AI-powered futures contracts for skill trajectories and labor demand." },
      { property: "og:title", content: "talentmkt — Talent Markets" },
      { property: "og:description", content: "Price the future of work. Mint skill futures contracts on verified credentials." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <Shell>
      {/* HERO */}
      <section className="relative -mt-8 -mx-6 px-6 pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 -z-10 opacity-70">
          <NetworkBackground />
        </div>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="mx-auto max-w-[1100px] text-center">
          <div className="inline-flex items-center gap-2 chip chip-neon animate-fade-up">
            <Sparkles className="size-3" />
            ERC-8004 Identity · x402 Settlement · AI Oracle v3.2
          </div>
          <h1 className="mt-6 text-[clamp(2.6rem,6.5vw,5.4rem)] font-semibold tracking-[-0.035em] leading-[0.98] animate-fade-up">
            Markets for{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Human Capital
            </span>
          </h1>
          <p className="mt-5 mx-auto max-w-2xl text-base md:text-lg text-muted-foreground animate-fade-up">
            AI-powered futures contracts for skill trajectories and labor demand.
            Verified credentials in. Liquid prediction markets out.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-up">
            <Link to="/mint" className="btn-primary">
              Mint Your Contract <ArrowRight className="size-4" />
            </Link>
            <Link to="/markets" className="btn-ghost">Explore Markets</Link>
          </div>

          {/* Quick stats */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              ["Open Interest", "$48.2M", "+3.4%"],
              ["Contracts Minted", "126,418", "+812 / 24h"],
              ["Verified Identities", "31,204", "+148 / 24h"],
              ["Oracle Accuracy", "94.6%", "rolling 90d"],
            ].map(([l, v, s]) => (
              <div key={l} className="panel p-4 text-left">
                <div className="text-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{l}</div>
                <div className="mt-1 text-xl font-semibold tracking-tight">{v}</div>
                <div className="text-mono text-[11px] text-success">{s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating mock terminal preview */}
        <div className="mt-20 mx-auto max-w-6xl relative">
          <div className="panel panel-glow p-1.5 animate-float-slow">
            <div className="rounded-md bg-background/60 border border-border-subtle overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-background/60">
                <div className="flex items-center gap-2 text-mono text-[11px] text-muted-foreground">
                  <span className="size-2 rounded-full bg-destructive/70" />
                  <span className="size-2 rounded-full bg-warning/70" />
                  <span className="size-2 rounded-full bg-success/70" />
                  <span className="ml-3">terminal://talentmkt/markets</span>
                </div>
                <div className="flex items-center gap-2 text-mono text-[11px] text-muted-foreground">
                  <span className="pulse-dot" /> LIVE FEED
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3 p-3">
                {featuredContracts.map((c) => <ContractCard key={c.symbol} c={c} />)}
              </div>
              <div className="border-t border-border-subtle p-3">
                <Sparkline data={makeSeries(0.45, 80, 0.025, 0.003, 5)} height={64} />
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -inset-x-20 -bottom-10 h-40 bg-gradient-to-t from-background to-transparent" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="mt-8 grid md:grid-cols-3 gap-3">
        <Feature
          icon={<ShieldCheck className="size-5" />}
          title="Verified Identity"
          body="ERC-8004 identity binds transcripts, code, and employment proofs to a single cryptographic graph."
        />
        <Feature
          icon={<Brain className="size-5" />}
          title="AI-Native Forecasts"
          body="Oracle v3.2 ingests 2.4B labor signals daily — calibrated probabilities, not vibes."
        />
        <Feature
          icon={<Activity className="size-5" />}
          title="Liquid Markets"
          body="Two-sided order books with x402 instant settlement. Trade conviction in skill trajectories."
        />
      </section>
    </Shell>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="panel p-5">
      <div className="size-9 rounded-md border border-primary/30 bg-primary/10 grid place-items-center text-primary">{icon}</div>
      <h3 className="mt-3 text-[15px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-[13px] text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
