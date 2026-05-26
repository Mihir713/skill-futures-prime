import { useState, useRef, useEffect } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Shell } from "@/components/Shell"
import { agentRespond } from "@/agent/agentEngine"
import { Bot, Send } from "lucide-react"

export const Route = createFileRoute("/agent")({
  component: AgentPage,
})

function AgentPage() {
  const [msgs, setMsgs] = useState([
    { role: "agent" as const, text: "I'm the **talentmkt Agent**. I verify credentials on-chain via **ERC-8004**, assign you to a career outcome bucket, and let you **buy/sell shares** using **x402 payments**.\n\nTry:\n• \"i'm a mcmaster student graduating 2028, rf, one co-op\"\n• \"show me buckets\"\n• \"what do you do?\"", ts: Date.now() },
  ])
  const [input, setInput] = useState("")
  const [erc, setErc] = useState("")
  const bottom = useRef<HTMLDivElement>(null)

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }) }, [msgs])

  function send() {
    if (!input.trim()) return
    const userMsg = { role: "user" as const, text: input, ts: Date.now() }
    setMsgs(p => [...p, userMsg])
    const txt = input
    setInput("")
    setTimeout(() => {
      const replies = agentRespond(txt, erc || undefined)
      setMsgs(p => [...p, ...replies.map(r => ({ role: r.role as "user" | "agent", text: r.text, ts: r.timestamp }))])
      for (const r of replies) {
        const m = r.text.match(/0x[a-fA-F0-9]{4}[^a-zA-Z]*[a-fA-F0-9]{4}/)
        if (m) setErc(m[0])
      }
    }, 300)
  }

  return (
    <Shell>
      <div className="panel max-w-3xl mx-auto flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
        {/* header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle">
          <div className="size-8 rounded-md bg-primary/20 border border-primary/30 grid place-items-center">
            <Bot className="size-4 text-primary" />
          </div>
          <div>
            <div className="text-[13px] font-semibold">talentmkt Agent</div>
            <div className="flex items-center gap-1.5 text-mono text-[10px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" /> ERC-8004 · x402
            </div>
          </div>
          {erc && <div className="ml-auto text-mono text-[10px] text-muted-foreground bg-background/40 px-2 py-1 rounded border border-border-subtle">{erc}</div>}
        </div>

        {/* messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-primary/15 border border-primary/20" : "bg-background/50 border border-border-subtle"}`}
                dangerouslySetInnerHTML={{
                  __html: m.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/`(.*?)`/g, "<code class='text-accent text-[12px] bg-background/60 px-1 rounded'>$1</code>").replace(/\n/g, "<br/>")
                }}
              />
            </div>
          ))}
          <div ref={bottom} />
        </div>

        {/* input */}
        <div className="border-t border-border-subtle p-3">
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Message the agent..." autoFocus
              className="flex-1 bg-background/60 border border-border-subtle rounded-md px-3 py-2 text-[13px] outline-none focus:border-primary/40 transition-colors" />
            <button onClick={send} className="btn-primary !px-3 !py-2"><Send className="size-4" /></button>
          </div>
        </div>
      </div>
    </Shell>
  )
}