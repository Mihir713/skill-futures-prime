import { TopNav } from "./TopNav";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <TopNav />
      <main className="relative z-10 mx-auto max-w-[1440px] px-6 py-8">{children}</main>
      <footer className="relative z-10 border-t border-border-subtle/60 mt-16">
        <div className="mx-auto max-w-[1440px] px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-mono text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="pulse-dot" />
            <span>talentmkt Exchange · Regulated Sandbox · ERC-8004 Identity Layer</span>
          </div>
          <div className="flex gap-4">
            <span>Settlement: x402</span>
            <span>Oracle: AI-Forecast v3.2</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
