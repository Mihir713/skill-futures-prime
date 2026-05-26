// Agent engine — pure logic, no UI
// Manages buckets, credential intake, buy/sell, guardrails

export type Bucket = {
  id: string
  label: string
  category: string
  region: string
  gradYear: string
  price: number
  studentCount: number
  volume24h: number
  history: number[]
  holders: number
}

export type CredentialBundle = {
  name: string
  university: string
  program: string
  gradYear: string
  specialization: string
  coopCount: number
  courses: string[]
  employer?: string
}

export type AgentMessage = {
  role: "user" | "agent"
  text: string
  timestamp: number
}

export type Position = {
  bucketId: string
  shares: number
  avgPrice: number
  totalInvested: number
}

const seed = (n: number) => {
  let x = n
  return () => { x = (x * 9301 + 49297) % 233280; return x / 233280 }
}

function makePriceSeries(start: number, len = 28, vol = 0.04, drift = 0.003, s = 1): number[] {
  const r = seed(s)
  const out: number[] = [start]
  for (let i = 1; i < len; i++) {
    const v = out[i - 1] * (1 + drift + (r() - 0.5) * vol)
    out.push(Math.max(0.01, Math.min(0.99, v)))
  }
  return out
}

const BUCKETS: Bucket[] = [
  { id: "ELECENG_RF_Ontario_2028_COOP", label: "RF Engineering — $75k+ by 2028", category: "ELECENG", region: "Ontario", gradYear: "2028", price: 0.35, studentCount: 47, volume24h: 2400, history: makePriceSeries(0.28, 28, 0.04, 0.006, 11), holders: 23 },
  { id: "ELECENG_POWER_Ontario_2028_COOP", label: "Power Engineering — $80k+ by 2028", category: "ELECENG", region: "Ontario", gradYear: "2028", price: 0.22, studentCount: 31, volume24h: 890, history: makePriceSeries(0.20, 28, 0.05, -0.002, 17), holders: 12 },
  { id: "COMPENG_SOFTWARE_Ontario_2028_COOP", label: "Software Engineering — $100k+ by 2028", category: "COMPENG", region: "Ontario", gradYear: "2028", price: 0.61, studentCount: 112, volume24h: 12400, history: makePriceSeries(0.55, 28, 0.035, 0.004, 23), holders: 48 },
  { id: "COMPENG_AI_Ontario_2028_COOP", label: "AI/ML Engineering — $130k+ by 2028", category: "COMPENG", region: "Ontario", gradYear: "2028", price: 0.78, studentCount: 64, volume24h: 8900, history: makePriceSeries(0.70, 28, 0.03, 0.005, 31), holders: 37 },
  { id: "MECHENG_CAD_Ontario_2028_COOP", label: "CAD/Mechanical — $70k+ by 2028", category: "MECHENG", region: "Ontario", gradYear: "2028", price: 0.18, studentCount: 29, volume24h: 620, history: makePriceSeries(0.22, 28, 0.04, -0.004, 7), holders: 8 },
  { id: "ELECENG_FPGA_Ontario_2027_COOP", label: "FPGA Design — $95k+ by 2027", category: "ELECENG", region: "Ontario", gradYear: "2027", price: 0.84, studentCount: 22, volume24h: 5600, history: makePriceSeries(0.62, 28, 0.04, 0.008, 41), holders: 19 },
].map(b => ({ ...b, price: Number(b.price.toFixed(2)) }))

export { BUCKETS }

let identities: Map<string, { erc8004: string; bucketId: string; positions: Position[] }> = new Map()
let pendingIdentityId = 1

function generateERC8004(): string {
  const id = pendingIdentityId++
  return `0x${id.toString(16).padStart(4, "0")}…${(id * 7).toString(16).padStart(4, "0")}`
}

function findBucket(cat: string, spec: string, region: string, year: string, coop: boolean): Bucket | undefined {
  const specToCat: Record<string, string> = {
    "rf": "ELECENG_RF", "rf engineering": "ELECENG_RF",
    "power": "ELECENG_POWER", "power engineering": "ELECENG_POWER",
    "software": "COMPENG_SOFTWARE", "software engineering": "COMPENG_SOFTWARE",
    "ai": "COMPENG_AI", "ml": "COMPENG_AI", "ai/ml": "COMPENG_AI", "machine learning": "COMPENG_AI",
    "cad": "MECHENG_CAD", "cad design": "MECHENG_CAD", "mechanical": "MECHENG_CAD",
    "fpga": "ELECENG_FPGA",
  }
  const prefix = specToCat[spec.toLowerCase()] || `ELECENG_RF`
  const coopSuffix = coop ? "_COOP" : ""
  return BUCKETS.find(b => b.id.startsWith(prefix) && b.region === region && b.gradYear === year && b.id.endsWith(coopSuffix))
}

function extractCredentials(text: string): CredentialBundle | null {
  const lower = text.toLowerCase()
  const uniMatch = text.match(/(\w+)\s*(?:university|u)/i)
  const university = uniMatch ? uniMatch[1] : null
  const progMatch = text.match(/(\w+)\s*(?:engineering|eng|program|ibiomed)/i)
  const program = progMatch ? progMatch[1] : "Electrical Engineering"
  const yearMatch = text.match(/graduat(?:ing|ed)\s*(?:in\s*)?(\d{4})/)
  const year = yearMatch ? yearMatch[1] : "2028"
  const specMatch = text.match(/(?:speciali[sz]ed?\s*(?:in\s*)?)(\w+(?:\s+\w+)?)/i)
  let specialization = specMatch ? specMatch[1] : null
  if (!specialization) {
    const knownSpecs = ["rf", "power", "software", "ai", "ml", "cad", "fpga", "embedded"]
    for (const s of knownSpecs) {
      if (lower.includes(s)) { specialization = s; break }
    }
  }
  specialization = specialization || "RF Engineering"
  const coopMatch = text.match(/(\d+)\s*co-?op/i)
  const coopCount = coopMatch ? parseInt(coopMatch[1]) : 0
  const courseMatches = text.matchAll(/([A-Z]{2,})\s*(\d{2,4}[A-Z]?\d*)/g)
  const courses = Array.from(courseMatches).map(m => m[0])
  const empMatch = text.match(/co-?op\s*(?:in|at)\s+([A-Za-z\s]+?)(?:\.|,|$)/i)
  const employer = empMatch ? empMatch[1].trim() : undefined
  return { name: university || "Student", university: university || "McMaster", program: program || "Engineering", gradYear: year, specialization, coopCount, courses, employer }
}

const BLOCKED_PATTERNS = [
  /send\s+(all|every)\s+(money|funds|eth|usdc)/i,
  /transfer\s+(all|everything)/i,
  /withdraw\s+(all|everything)/i,
  /0x[a-fA-F0-9]{40}/,
]

function checkGuardrails(text: string): string | null {
  for (const p of BLOCKED_PATTERNS) {
    if (p.test(text)) return "⛔ **Command blocked.** Sending funds to external addresses requires human authorization. This is a safety guardrail."
  }
  if (text.toLowerCase().includes("admin") && text.toLowerCase().includes("password")) return "⛔ **Access denied.** Administrative credentials are not available through this interface."
  return null
}

export function agentRespond(userInput: string, erc8004?: string): AgentMessage[] {
  const msgs: AgentMessage[] = []
  const lower = userInput.toLowerCase()
  const guardrail = checkGuardrails(userInput)
  if (guardrail) {
    msgs.push({ role: "agent", text: guardrail, timestamp: Date.now() })
    return msgs
  }
  if (lower.includes("what do you do") || lower.includes("who are you") || lower.includes("describe yourself")) {
    msgs.push({ role: "agent", text: "I am a **talentmkt market agent**. I verify student credentials on-chain using **ERC-8004**. I group students into **career outcome buckets**. I let anyone **buy or sell shares** in those buckets using **x402 payments**. The price of each bucket is the market's probability assessment of whether students in that bucket will hit a salary target. The agent earns a **10% fee** on all trades.", timestamp: Date.now() })
    return msgs
  }
  if (lower.includes("show me") || lower.includes("list") || lower.includes("buckets")) {
    const region = lower.includes("ontario") ? "Ontario" : null
    const filtered = region ? BUCKETS.filter(b => b.region === region) : BUCKETS
    let text = "📊 **Active Buckets:**\n\n"
    filtered.forEach(b => { text += `**${b.id}**\n  Price: $${b.price.toFixed(2)} (${(b.price * 100).toFixed(0)}%) · ${b.studentCount} students · Vol: $${b.volume24h.toLocaleString()}\n\n` })
    text += "Type \\`buy $X of BUCKET_ID\\` to purchase shares."
    msgs.push({ role: "agent", text, timestamp: Date.now() })
    return msgs
  }
  const buyMatch = userInput.match(/buy\s+\$?(\d+(?:\.\d+)?)\s*(?:of|in)?\s*(\S+)/i)
  if (buyMatch) {
    const amount = parseFloat(buyMatch[1])
    const bucketId = buyMatch[2].toUpperCase()
    const bucket = BUCKETS.find(b => b.id === bucketId)
    if (!bucket) {
      msgs.push({ role: "agent", text: `Bucket \\\`${bucketId}\\\` not found. Available: ${BUCKETS.map(b => `\\\`${b.id}\\\``).join(", ")}`, timestamp: Date.now() })
      return msgs
    }
    const shares = Math.floor(amount / bucket.price)
    const fee = amount * 0.1
    msgs.push({ role: "agent", text: `✅ **Order Confirmed**\n  • Bucket: **${bucket.id}**\n  • Amount: **${amount} USDC**\n  • Price: **$${bucket.price.toFixed(2)}**/share\n  • Shares: **${shares}**\n  • Agent fee (10%): **${fee.toFixed(2)} USDC**\n  • x402 Payment: ✅ **Executed**\n\n📈 If bucket resolves YES, you receive **$${(shares * 1).toFixed(2)}** (+$${fee.toFixed(2)} profit)`, timestamp: Date.now() })
    bucket.holders += 1
    bucket.volume24h += amount
    if (erc8004 && identities.has(erc8004)) {
      const ident = identities.get(erc8004)!
      ident.positions.push({ bucketId: bucket.id, shares, avgPrice: bucket.price, totalInvested: amount })
    }
    return msgs
  }
  const investMatch = userInput.match(/invest\s+\$?(\d+(?:\.\d+)?)/i)
  if (investMatch && erc8004 && identities.has(erc8004)) {
    const ident = identities.get(erc8004)!
    const bucket = BUCKETS.find(b => b.id === ident.bucketId)
    if (!bucket) { msgs.push({ role: "agent", text: "Your bucket not found.", timestamp: Date.now() }); return msgs }
    const amount = parseFloat(investMatch[1])
    const discountedPrice = bucket.price * 0.8
    const shares = Math.floor(amount / discountedPrice)
    msgs.push({ role: "agent", text: `🎯 **Participant Purchase (20% discount applied)**\n  • Market price: $${bucket.price.toFixed(2)}\n  • Your price: **$${discountedPrice.toFixed(2)}**\n  • Invested: **${amount} USDC**\n  • Shares: **${shares}**\n  • Effective cost basis: **$${discountedPrice.toFixed(3)}**\n\n📊 If bucket resolves YES at $1.00/share, you receive **$${shares.toFixed(2)}**`, timestamp: Date.now() })
    ident.positions.push({ bucketId: bucket.id, shares, avgPrice: discountedPrice, totalInvested: amount })
    bucket.holders += 1
    bucket.volume24h += amount
    return msgs
  }
  const sellMatch = userInput.match(/sell\s+(\d+)\s*shares/i)
  if (sellMatch) {
    const qty = parseInt(sellMatch[1])
    const bucketId = userInput.match(/sell\s+\d+\s*shares\s*(?:of|in)?\s*(\S+)/i)
    const id = bucketId ? bucketId[1].toUpperCase() : null
    const bucket = id ? BUCKETS.find(b => b.id === id) : null
    if (!bucket) { msgs.push({ role: "agent", text: "Specify which bucket to sell from, e.g. \\`sell 50 shares of ELECENG_RF_Ontario_2028_COOP\\`", timestamp: Date.now() }); return msgs }
    const proceeds = qty * bucket.price * 0.95
    msgs.push({ role: "agent", text: `📤 **Sell Order Filled**\n  • Shares sold: **${qty}** of **${bucket.id}**\n  • Price: **$${bucket.price.toFixed(2)}**\n  • Exit fee (5%): **$${(qty * bucket.price * 0.05).toFixed(2)}**\n  • Proceeds: **$${proceeds.toFixed(2)} USDC**\n  • x402 Settlement: ✅ **Complete**`, timestamp: Date.now() })
    return msgs
  }
  const priceMatch = userInput.match(/price\s+(?:of\s+)?(\S+)/i)
  if (priceMatch) {
    const bucketId = priceMatch[1].toUpperCase()
    const bucket = BUCKETS.find(b => b.id === bucketId)
    if (!bucket) { msgs.push({ role: "agent", text: `Bucket \\\`${bucketId}\\\` not found.`, timestamp: Date.now() }); return msgs }
    const trend = bucket.history.length > 1 ? ((bucket.price - bucket.history[0]) / bucket.history[0] * 100).toFixed(1) : "0"
    msgs.push({ role: "agent", text: `📈 **${bucket.id}** — Price: **$${bucket.price.toFixed(2)}** (${(bucket.price * 100).toFixed(0)}%)\n  • 24h Change: **${+trend >= 0 ? "+" : ""}${trend}%**\n  • Students: ${bucket.studentCount} · Holders: ${bucket.holders}\n  • Volume: $${bucket.volume24h.toLocaleString()}`, timestamp: Date.now() })
    return msgs
  }
  if (lower.includes("settle")) {
    const bucketMatch = userInput.match(/settle\s+(\S+)/i)
    const bucketId = bucketMatch ? bucketMatch[1].toUpperCase() : (erc8004 && identities.has(erc8004) ? identities.get(erc8004)!.bucketId : null)
    const bucket = bucketId ? BUCKETS.find(b => b.id === bucketId) : null
    if (!bucket) { msgs.push({ role: "agent", text: "No bucket specified to settle.", timestamp: Date.now() }); return msgs }
    const resolves = Math.random() > 0.4
    const payout = resolves ? 1.0 : 0
    msgs.push({ role: "agent", text: `⚖️ **Settlement Triggered** for **${bucket.id}**\n  • Resolution: **${resolves ? "YES ✓" : "NO ✗"}**\n  • Payout per share: **$${payout.toFixed(2)}**\n  • x402 Distribution: ✅ **Complete**\n\n${resolves ? "🎉 All holders receive payout." : "💸 Contract expired worthless."}`, timestamp: Date.now() })
    return msgs
  }
  if (lower.includes("register") || lower.includes("identity")) {
    const erc = generateERC8004()
    msgs.push({ role: "agent", text: `🔗 **ERC-8004 Identity Created**: \\\`${erc}\\\`\n\nYour on-chain credential identity is now active. Share this with bucket oracles to receive attestations.`, timestamp: Date.now() })
    return msgs
  }

  // Try credential intake as fallback
  const creds = extractCredentials(userInput)
  if (creds && creds.university) {
    const bucket = findBucket(creds.program, creds.specialization, "Ontario", creds.gradYear, creds.coopCount > 0)
    const erc = generateERC8004()
    msgs.push({ role: "agent", text: `📡 Receiving credentials from **${creds.name} ${creds.university}**...\n\n🔍 Requesting attestations:\n  • ${creds.university} Registrar — verifying degree\n  • ${creds.employer ? creds.employer + " —" : "Employer"} verifying work history\n  • GitHub Agent — verifying commit history`, timestamp: Date.now() })
    msgs.push({ role: "agent", text: `✅ All attestations received. Bundling into **ERC-8004** credential identity...\n\n🔗 Identity: \\\`${erc}\\\``, timestamp: Date.now() })
    if (bucket) {
      msgs.push({ role: "agent", text: `📋 You are in bucket **${bucket.id}**\n\n  • Current Price: **$${bucket.price.toFixed(2)}** (${(bucket.price * 100).toFixed(0)}% implied probability)\n  • Your cohort: **${bucket.studentCount} students**\n  • 24h Volume: **$${bucket.volume24h.toLocaleString()}**\n  • Active holders: **${bucket.holders}**\n  • Resolution: **$${bucket.label.split("$")[1]}** by **${bucket.gradYear}**\n\n💡 **Want to invest in your own bucket?** You get a **20% discount** as a participant.\n  Type \`invest $X\` to buy shares in yourself.`, timestamp: Date.now() })
      identities.set(erc, { erc8004: erc, bucketId: bucket.id, positions: [] })
    }
    return msgs
  }

  msgs.push({ role: "agent", text: "I didn't understand that. Try:\n• *\"hi i'm a mcmaster student graduating 2028, rf specialization, one co-op\"*\n• *\"show me buckets\"*\n• *\"buy $100 of ELECENG_RF_Ontario_2028_COOP\"*\n• *\"what do you do?\"*\n• *\"register identity\"*", timestamp: Date.now() })
  return msgs
}

export function getBucketData(): Bucket[] {
  return BUCKETS
}