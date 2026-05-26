import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, LineChart, PlusCircle, Briefcase, ShieldCheck, Wallet } from "lucide-react";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: Activity },
  { to: "/markets", label: "Markets", icon: LineChart },
  { to: "/mint", label: "Mint Contract", icon: PlusCircle },
  { to: "/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/reputation", label: "Reputation", icon: ShieldCheck },
  { to: "/wallet", label: "Wallet", icon: Wallet },
] as const;

export function TopNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle/80 backdrop-blur-xl bg-background/70">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark />
          <div className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-semibold tracking-tight">Skill Futures</span>
            <span className="text-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">v1.0</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {items.map((it) => {
            const active = path === it.to || (it.to !== "/dashboard" && path.startsWith(it.to));
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`group relative px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {it.label}
                {active && (
                  <span className="absolute inset-x-2 -bottom-[14px] h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-mono text-[11px] text-muted-foreground">
            <span className="pulse-dot" />
            <span>LIVE · NYSE 14:32:08 UTC</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md border border-border-subtle text-mono text-[11px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-accent" />
            0x7A…F19c
          </div>
          <button className="btn-primary !py-1.5 !px-3 text-[12px]">Connect Identity</button>
        </div>
      </div>
      <Ticker />
    </header>
  );
}

function LogoMark() {
  return (
    <div className="relative size-7 rounded-md border border-primary/40 bg-gradient-to-br from-primary/30 to-accent/20 grid place-items-center overflow-hidden">
      <div className="absolute inset-0 scanline opacity-60" />
      <svg viewBox="0 0 24 24" className="size-4 text-primary relative">
        <path d="M3 18 L9 12 L13 16 L21 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="3" cy="18" r="1.6" fill="currentColor" />
        <circle cx="21" cy="6" r="1.6" fill="currentColor" />
      </svg>
    </div>
  );
}

const tickerData = [
  ["RF-ENG·2028", "0.72", "+4.2%"],
  ["MATLAB·2028", "0.61", "+1.8%"],
  ["CAD-DSGN·2028", "0.18", "-2.1%"],
  ["FPGA·2027", "0.84", "+6.7%"],
  ["EMB-SYS·2028", "0.69", "+0.9%"],
  ["AI-ML·2030", "0.91", "+0.4%"],
  ["QUANT-DEV·2029", "0.77", "+3.1%"],
  ["BIOINF·2028", "0.42", "-0.6%"],
  ["ROBOTICS·2029", "0.66", "+2.4%"],
  ["DEFTECH·2027", "0.81", "+5.2%"],
];

function Ticker() {
  const rows = [...tickerData, ...tickerData];
  return (
    <div className="border-t border-border-subtle/60 overflow-hidden bg-background/40">
      <div className="ticker-row flex gap-8 whitespace-nowrap py-1.5 text-mono text-[11px]">
        {rows.map((r, i) => {
          const up = r[2].startsWith("+");
          return (
            <span key={i} className="flex items-center gap-2 text-muted-foreground">
              <span className="text-foreground/80">{r[0]}</span>
              <span className="text-foreground">${r[1]}</span>
              <span className={up ? "text-success" : "text-destructive"}>{r[2]}</span>
              <span className="text-border">·</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
