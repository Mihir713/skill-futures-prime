import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { Sparkline } from "@/components/Sparkline";
import { makeSeries } from "@/lib/mockData";
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Copy, Zap } from "lucide-react";

export const Route = createFileRoute("/wallet")({
  head: () => ({ meta: [{ title: "Wallet — Skill Futures" }, { name: "description", content: "Balances, transfers, and x402 settlement." }] }),
  component: WalletPage,
});

const txs = [
  { type: "in", desc: "Settlement · INTERN-2024", amount: "+$1,420.00", time: "2h", hash: "0x9af4…2c11" },
  { type: "out", desc: "Mint · RFE-2028", amount: "-$732.00", time: "5h", hash: "0x71b2…ee08" },
  { type: "in", desc: "Sale · FPGA-2027 (200 ct)", amount: "+$168.00", time: "1d", hash: "0x4c0a…1ff7" },
  { type: "out", desc: "Mint · AIML-2030", amount: "-$234.00", time: "2d", hash: "0xa12c…77b0" },
  { type: "in", desc: "Settlement · GPA-3.7-2025", amount: "+$640.00", time: "4d", hash: "0xeec1…aa42" },
];

function WalletPage() {
  return (
    <Shell>
      <div className="mb-6">
        <p className="text-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Treasury</p>
        <h1 className="text-3xl font-semibold tracking-tight mt-1">Wallet</h1>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 panel panel-glow p-5 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 size-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-2"><WalletIcon className="size-4 text-primary" /><h3 className="text-[14px] font-semibold tracking-tight">Available Balance</h3></div>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-5xl font-semibold tracking-tight text-num">$8,412.66</span>
            <span className="text-mono text-sm text-success">+$214.30 · 24h</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-mono text-[11px] text-muted-foreground">
            <span>0x7a3f9c2b9aA1F19c</span>
            <button className="hover:text-foreground inline-flex items-center gap-1"><Copy className="size-3" /> copy</button>
            <span className="chip chip-neon ml-2">x402 enabled</span>
          </div>
          <div className="mt-4 -mx-1">
            <Sparkline data={makeSeries(0.45, 80, 0.025, 0.004, 47)} height={90} color="var(--accent)" />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button className="btn-primary"><ArrowDownLeft className="size-4" />Deposit</button>
            <button className="btn-ghost"><ArrowUpRight className="size-4" />Withdraw</button>
            <button className="btn-ghost"><Zap className="size-4" />Streaming Pay</button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 panel p-5">
          <h3 className="text-[14px] font-semibold tracking-tight">Assets</h3>
          <div className="mt-3 space-y-2">
            {[
              ["USDC", "8,412.66", "$8,412.66"],
              ["ETH (Base)", "0.412", "$1,318.40"],
              ["SF-LP Token", "1,204", "$2,108.00"],
            ].map(([sym, qty, val]) => (
              <div key={sym} className="flex items-center justify-between p-2.5 rounded-md border border-border-subtle bg-background/40">
                <div>
                  <div className="text-[13px] font-medium">{sym}</div>
                  <div className="text-mono text-[11px] text-muted-foreground">{qty}</div>
                </div>
                <div className="text-num text-[13px]">{val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 panel overflow-hidden">
          <div className="p-4 border-b border-border-subtle flex items-center justify-between">
            <h3 className="text-[14px] font-semibold tracking-tight">Recent Transactions</h3>
            <span className="text-mono text-[11px] text-muted-foreground flex items-center gap-2"><span className="pulse-dot" />streaming</span>
          </div>
          <table className="w-full text-[12.5px]">
            <thead className="text-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <tr className="border-b border-border-subtle">
                <th className="text-left py-2 px-4">Type</th>
                <th className="text-left py-2">Description</th>
                <th className="text-left py-2">Hash</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-right py-2 pr-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t, i) => {
                const inbound = t.type === "in";
                return (
                  <tr key={i} className="border-b border-border-subtle/60 hover:bg-surface-elevated/60 transition">
                    <td className="py-2.5 px-4">
                      <span className={`chip ${inbound ? "chip-pos" : "chip-neg"}`}>{inbound ? "IN" : "OUT"}</span>
                    </td>
                    <td className="py-2.5">{t.desc}</td>
                    <td className="py-2.5 text-mono text-muted-foreground">{t.hash}</td>
                    <td className={`py-2.5 text-right text-num ${inbound ? "text-success" : "text-destructive"}`}>{t.amount}</td>
                    <td className="py-2.5 pr-4 text-right text-mono text-muted-foreground">{t.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
