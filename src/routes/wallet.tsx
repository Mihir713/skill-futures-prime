import { useState, useEffect } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Shell } from "@/components/Shell"
import { getUser, agentDeposit } from "@/server/api"
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, Bot, Copy, ExternalLink, ArrowDownRight } from "lucide-react"

export const Route = createFileRoute("/wallet")({
  component: WalletPage,
})

// In-memory user ID tracker (website just finished signup flow)
// In prod this would use session/auth
let _activeUserId: string | null = null
export function setActiveUser(id: string) { _activeUserId = id }
export function getActiveUser() { return _activeUserId }

function WalletPage() {
  const nav = useNavigate()
  const [userId, setUserId] = useState(_activeUserId || "demo_user")
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [depositAmt, setDepositAmt] = useState(50)
  const [depositPrompt, setDepositPrompt] = useState("")
  const [depositStatus, setDepositStatus] = useState("")
  const [depositing, setDepositing] = useState(false)

  useEffect(() => {
    loadData()
  }, [userId])

  async function loadData() {
    setLoading(true)
    try {
      const data = await getUser({ data: { userId } })
      setUserData(data)
    } catch {
      // Demo mode — show empty state
      setUserData({
        name: "Demo User", walletBalance: 0, bucket: null,
        transactions: [], holdings: [],
        credentials: [], erc8004: "",
      })
    }
    setLoading(false)
  }

  async function handleDeposit() {
    if (!depositPrompt.trim() || depositing) return
    setDepositing(true)
    setDepositStatus("⏳ Processing x402 payment...")
    try {
      const res = await agentDeposit({ data: { userId, amount: depositAmt, prompt: depositPrompt } })
      setDepositStatus(`✅ Deposited $${depositAmt} via agent. x402 tx: ${res.x402Tx}`)
      loadData()
      setDepositAmt(50)
      setDepositPrompt("")
    } catch (e: any) {
      setDepositStatus(`❌ ${e.message}`)
    }
    setDepositing(false)
  }

  return (
    <Shell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Treasury</p>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">Wallet</h1>
        </div>
        {!getActiveUser() && (
          <button onClick={() => nav({ to: "/signup" })} className="btn-primary text-[12px]">
            Register Identity First
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-4">
        {/* Left: Balance & Tx history */}
        <div className="space-y-4">
          {/* Balance card */}
          <div className="panel panel-glow p-5 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 size-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 text-mono text-[11px] text-muted-foreground mb-1">
                <WalletIcon className="size-3.5" />
                {userData?.erc8004 ? `${userData.erc8004.slice(0, 8)}…${userData.erc8004.slice(-4)}` : "No identity"}
              </div>
              <div className="text-mono text-[clamp(2rem,5vw,3.2rem)] font-semibold tracking-tight">
                ${(userData?.walletBalance || 0).toFixed(2)}
                <span className="text-base text-muted-foreground font-normal ml-2">USDC</span>
              </div>
              <div className="mt-1 text-[12px] text-muted-foreground">Agent-managed wallet · x402 settlement</div>
            </div>
          </div>

          {/* Transactions */}
          <div className="panel p-4">
            <h3 className="text-[13px] font-semibold mb-3">Transaction History</h3>
            {(!userData?.transactions || userData.transactions.length === 0) ? (
              <div className="text-center py-8 text-muted-foreground">
                <ArrowDownRight className="size-8 mx-auto mb-2 opacity-40" />
                <p className="text-[13px]">No transactions yet</p>
                <p className="text-[11px] mt-1">Prompt the agent to deposit credits</p>
              </div>
            ) : (
              <div className="space-y-2">
                {userData.transactions.slice().reverse().map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between px-3 py-2 rounded-md bg-background/30 border border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className={`size-7 rounded-full grid place-items-center ${tx.amount > 0 ? "bg-success/20" : "bg-destructive/20"}`}>
                        {tx.amount > 0 ? <ArrowDownLeft className="size-3.5 text-success" /> : <ArrowUpRight className="size-3.5 text-destructive" />}
                      </div>
                      <div>
                        <div className="text-[12px] font-medium">{tx.note?.slice(0, 50)}</div>
                        <div className="text-mono text-[10px] text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className={`text-[13px] font-semibold ${tx.amount > 0 ? "text-success" : "text-destructive"}`}>
                      {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Holdings */}
          {userData?.holdings?.length > 0 && (
            <div className="panel p-4">
              <h3 className="text-[13px] font-semibold mb-3">Holdings</h3>
              <div className="space-y-2">
                {userData.holdings.map((h: any) => (
                  <div key={h.bucketId} className="flex items-center justify-between px-3 py-2 rounded-md bg-background/30 border border-border-subtle">
                    <div className="text-[12px] font-medium">{h.bucketId}</div>
                    <div className="text-right text-mono text-[11px]">
                      <div className="font-semibold">{h.shares} shares</div>
                      <div className="text-muted-foreground">avg ${h.avgPrice.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Agent Deposit Panel */}
        <div className="space-y-4">
          <div className="panel p-5 border-accent/30 bg-gradient-to-b from-accent/5 to-transparent">
            <div className="flex items-center gap-2 mb-4">
              <div className="size-8 rounded-md bg-accent/20 border border-accent/30 grid place-items-center">
                <Bot className="size-4 text-accent" />
              </div>
              <div>
                <div className="text-[13px] font-semibold">Agent-Only Deposit</div>
                <div className="text-mono text-[10px] text-muted-foreground">x402 payment required</div>
              </div>
            </div>

            <p className="text-[12px] text-muted-foreground mb-4 leading-relaxed">
              You cannot deposit credits directly. You must prompt the AI agent to execute an x402 payment from the agent wallet on your behalf.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Amount (USDC)</label>
                <input type="number" min={1} max={10000} value={depositAmt}
                  onChange={e => setDepositAmt(parseInt(e.target.value) || 0)}
                  className="input w-full mt-1" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Prompt / Reason</label>
                <textarea value={depositPrompt} onChange={e => setDepositPrompt(e.target.value)}
                  placeholder="e.g. 'I want to invest $50 in the RF bucket'"
                  rows={2} className="input w-full mt-1 resize-none" />
                <p className="text-[10px] text-muted-foreground mt-1">The agent reviews your prompt before authorizing the x402 payment</p>
              </div>
              <button onClick={handleDeposit} disabled={!depositPrompt.trim() || depositing}
                className="btn-primary w-full !py-2.5 disabled:opacity-50">
                <ExternalLink className="size-4" /> Execute x402 Payment
              </button>
              <div className="text-[12px] font-medium">
                <span className="text-muted-foreground">Agent fee (10%): </span>
                <span className="text-destructive">${(depositAmt * 0.1).toFixed(2)}</span>
                <span className="text-muted-foreground"> · You receive: </span>
                <span className="text-success">${(depositAmt * 0.9).toFixed(2)}</span>
              </div>
            </div>

            {depositStatus && (
              <div className="mt-3 p-3 rounded-md bg-background/50 border border-border-subtle text-[12px]" dangerouslySetInnerHTML={{ __html: depositStatus.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
            )}
          </div>

          {/* Quick info */}
          <div className="panel p-3">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <WalletIcon className="size-3.5" />
              <span>x402 Wallet: <code className="text-accent">0xA…</code></span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1.5">
              <ExternalLink className="size-3.5" />
              <span>All deposits require agent authorization</span>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}