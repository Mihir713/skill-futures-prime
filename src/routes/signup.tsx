import { useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Shell } from "@/components/Shell"
import { signup, getBuckets, parseCredentials } from "@/server/api"
import { GraduationCap, Send, Check, Brain } from "lucide-react"

export const Route = createFileRoute("/signup")({
  component: SignupPage,
})

function SignupPage() {
  const nav = useNavigate()
  const [step, setStep] = useState<"form" | "agent" | "done">("form")
  const [form, setForm] = useState({ name: "", email: "", uni: "", program: "", year: "", spec: "", coop: 0, courses: "", employer: "" })
  const [status, setStatus] = useState("")
  const [result, setResult] = useState<{ userId: string; erc8004: string; bucketId: string } | null>(null)
  const [buckets, setBuckets] = useState<any[]>([])

  const handleSubmit = async () => {
    setStatus("🤖 Agent is processing your credentials...")
    setStep("agent")
    
    // Build credential text for LLM parsing
    const credText = [form.uni, form.program, form.spec, `graduating ${form.year}`, `${form.coop} co-op${form.employer ? ` at ${form.employer}` : ""}`, form.courses].filter(Boolean).join(", ")
    
    let parsed
    try {
      parsed = await parseCredentials({ data: { text: credText } })
    } catch {
      parsed = { university: form.uni, program: form.program, gradYear: form.year, specialization: form.spec || "RF Engineering", coopCount: form.coop, courses: form.courses.split(/[,;\s]+/).filter(Boolean), employer: form.employer || undefined }
    }

    setStatus(`✅ Attestations received. Assigning to bucket...`)
    
    try {
      const res = await signup({
        data: {
          name: form.name,
          email: form.email,
          university: parsed.university,
          program: parsed.program,
          gradYear: parsed.gradYear,
          specialization: parsed.specialization,
          coopCount: parsed.coopCount,
          courses: parsed.courses,
          employer: parsed.employer,
        },
      })
      setResult(res)
      setStatus(`✅ ERC-8004 Created · Assigned to **${res.bucketId}**`)
      setStep("done")

      const b = await getBuckets({ data: {} as any })
      setBuckets(b)
    } catch (e: any) {
      setStatus(`❌ Error: ${e.message}`)
    }
  }

  return (
    <Shell>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-lg bg-primary/20 border border-primary/30 grid place-items-center">
            <GraduationCap className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Register Your Identity</h1>
            <p className="text-sm text-muted-foreground">Submit your credentials for on-chain attestation</p>
          </div>
        </div>

        {step === "form" && (
          <div className="panel p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Full Name</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Jane Doe" className="input w-full mt-1" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="jane@mcmaster.ca" className="input w-full mt-1" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">University</label>
                <input value={form.uni} onChange={e => setForm(p => ({ ...p, uni: e.target.value }))} placeholder="McMaster University" className="input w-full mt-1" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Program</label>
                <input value={form.program} onChange={e => setForm(p => ({ ...p, program: e.target.value }))} placeholder="Electrical Engineering" className="input w-full mt-1" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Graduation Year</label>
                <input value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} placeholder="2028" className="input w-full mt-1" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Specialization</label>
                <input value={form.spec} onChange={e => setForm(p => ({ ...p, spec: e.target.value }))} placeholder="RF Engineering" className="input w-full mt-1" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Co-ops Completed</label>
                <input type="number" min={0} max={6} value={form.coop} onChange={e => setForm(p => ({ ...p, coop: parseInt(e.target.value) || 0 }))} className="input w-full mt-1" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Co-op Employer</label>
                <input value={form.employer} onChange={e => setForm(p => ({ ...p, employer: e.target.value }))} placeholder="Nokia, AMD, etc." className="input w-full mt-1" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Courses Completed (comma-separated)</label>
              <textarea value={form.courses} onChange={e => setForm(p => ({ ...p, courses: e.target.value }))} placeholder="ELECENG 2FH4, ELECENG 2CJ4, COMPENG 3A04" rows={2} className="input w-full mt-1 resize-none" />
            </div>
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground p-3 rounded-md bg-accent/5 border border-accent/20">
              <Brain className="size-4 text-accent shrink-0" />
              Your credentials will be verified by issuer agents and bundled into an ERC-8004 identity on-chain.
            </div>
            <button onClick={handleSubmit} className="btn-primary w-full">
              <Send className="size-4" /> Submit Credentials to Agent
            </button>
          </div>
        )}

        {step === "agent" && (
          <div className="panel p-8 text-center">
            <div className="size-16 mx-auto rounded-full bg-primary/20 border border-primary/30 grid place-items-center animate-pulse">
              <Brain className="size-8 text-primary" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: status.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
            <div className="mt-4 flex justify-center gap-1">
              {[0,1,2].map(i => <div key={i} className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        )}

        {step === "done" && result && (
          <div className="space-y-4">
            <div className="panel p-6 border-success/30 bg-success/5">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-success/20 border border-success/30 grid place-items-center">
                  <Check className="size-5 text-success" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Identity Registered</h2>
                  <p className="text-sm text-muted-foreground">Your credentials have been attested on-chain</p>
                </div>
              </div>
              <div className="mt-4 grid md:grid-cols-2 gap-3 text-[13px]">
                <div className="p-3 rounded-md bg-background/50 border border-border-subtle">
                  <div className="text-mono text-[10px] text-muted-foreground uppercase">ERC-8004</div>
                  <div className="font-mono text-[12px] mt-1">{result.erc8004}</div>
                </div>
                <div className="p-3 rounded-md bg-background/50 border border-border-subtle">
                  <div className="text-mono text-[10px] text-muted-foreground uppercase">Assigned Bucket</div>
                  <div className="font-medium text-[12px] mt-1">{result.bucketId}</div>
                </div>
              </div>
            </div>

            {buckets.length > 0 && (
              <div className="panel p-4">
                <h3 className="text-[13px] font-semibold mb-3">Active Buckets</h3>
                <div className="space-y-2">
                  {buckets.map(b => (
                    <div key={b.id} className="flex items-center justify-between px-3 py-2 rounded-md bg-background/30 border border-border-subtle">
                      <div className="text-[12px] font-medium truncate max-w-[280px]">{b.id}</div>
                      <div className="flex items-center gap-4 text-mono text-[11px]">
                        <span className={b.id === result.bucketId ? "text-accent font-semibold" : "text-muted-foreground"}>${b.price.toFixed(2)}</span>
                        <span className="text-muted-foreground">{b.studentCount} students</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => nav({ to: "/agent" })} className="btn-primary flex-1">Open Agent Chat</button>
              <button onClick={() => nav({ to: "/wallet" })} className="btn-ghost flex-1">Go to Wallet</button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  )
}