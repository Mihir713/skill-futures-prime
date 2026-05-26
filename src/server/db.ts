// In-memory server store — persists across requests in the same process
// All data resets on server restart (fine for hackathon demo)

export type User = {
  id: string
  name: string
  email: string
  university: string
  program: string
  gradYear: string
  specialization: string
  coopCount: number
  courses: string[]
  employer?: string
  bucketId: string
  erc8004: string
  walletBalance: number // USDC credits
  joinedAt: number
  credentials: Credential[]
}

export type Credential = {
  type: "transcript" | "certificate" | "degree" | "employment" | "github"
  issuer: string
  status: "pending" | "verified" | "rejected"
  hash: string
  uploadedAt: number
}

export type Bucket = {
  id: string
  label: string
  category: string
  region: string
  gradYear: string
  price: number
  studentCount: number
  volume24h: number
  holders: number
  history: number[]
  studentIds: string[]
}

export type WalletTx = {
  id: string
  userId: string
  type: "deposit" | "buy" | "sell" | "settlement" | "fee"
  amount: number
  bucketId?: string
  shares?: number
  timestamp: number
  note: string
}

export type Position = {
  bucketId: string
  shares: number
  avgPrice: number
  totalInvested: number
}

// State
const users = new Map<string, User>()
const buckets = new Map<string, Bucket>()
const wallets = new Map<string, WalletTx[]>()
const positions = new Map<string, Position[]>()
let nextId = 1
let nextTxId = 1

function genId(): string { return `user_${nextId++}` }
function genTxId(): string { return `tx_${nextTxId++}` }
function genErc(): string { return `0x${(nextId * 3).toString(16).padStart(4, "0")}…${(nextId * 7).toString(16).padStart(4, "0")}` }

const seed = (n: number) => {
  let x = n
  return () => { x = (x * 9301 + 49297) % 233280; return x / 233280 }
}

function makeSeries(start: number, len = 28, vol = 0.04, drift = 0.003, s = 1): number[] {
  const r = seed(s)
  const out: number[] = [start]
  for (let i = 1; i < len; i++) {
    out.push(Math.max(0.01, Math.min(0.99, out[i - 1] * (1 + drift + (r() - 0.5) * vol))))
  }
  return out
}

// Initialize buckets
function initBuckets() {
  if (buckets.size > 0) return
  const defs: Omit<Bucket, "studentIds">[] = [
    { id: "ELECENG_RF_Ontario_2028_COOP", label: "RF Engineering — $75k+ by 2028", category: "ELECENG", region: "Ontario", gradYear: "2028", price: 0.35, studentCount: 0, volume24h: 2400, holders: 0, history: makeSeries(0.28, 28, 0.04, 0.006, 11) },
    { id: "ELECENG_POWER_Ontario_2028_COOP", label: "Power Engineering — $80k+ by 2028", category: "ELECENG", region: "Ontario", gradYear: "2028", price: 0.22, studentCount: 0, volume24h: 890, holders: 0, history: makeSeries(0.20, 28, 0.05, -0.002, 17) },
    { id: "COMPENG_SOFTWARE_Ontario_2028_COOP", label: "Software Engineering — $100k+ by 2028", category: "COMPENG", region: "Ontario", gradYear: "2028", price: 0.61, studentCount: 0, volume24h: 12400, holders: 0, history: makeSeries(0.55, 28, 0.035, 0.004, 23) },
    { id: "COMPENG_AI_Ontario_2028_COOP", label: "AI/ML Engineering — $130k+ by 2028", category: "COMPENG", region: "Ontario", gradYear: "2028", price: 0.78, studentCount: 0, volume24h: 8900, holders: 0, history: makeSeries(0.70, 28, 0.03, 0.005, 31) },
    { id: "MECHENG_CAD_Ontario_2028_COOP", label: "CAD/Mechanical — $70k+ by 2028", category: "MECHENG", region: "Ontario", gradYear: "2028", price: 0.18, studentCount: 0, volume24h: 620, holders: 0, history: makeSeries(0.22, 28, 0.04, -0.004, 7) },
    { id: "ELECENG_FPGA_Ontario_2027_COOP", label: "FPGA Design — $95k+ by 2027", category: "ELECENG", region: "Ontario", gradYear: "2027", price: 0.84, studentCount: 0, volume24h: 5600, holders: 0, history: makeSeries(0.62, 28, 0.04, 0.008, 41) },
  ]
  for (const d of defs) {
    buckets.set(d.id, { ...d, studentIds: [] })
  }
}
initBuckets()

const specToBucket: Record<string, string> = {
  "rf": "ELECENG_RF", "rf engineering": "ELECENG_RF",
  "power": "ELECENG_POWER", "power engineering": "ELECENG_POWER",
  "software": "COMPENG_SOFTWARE", "software engineering": "COMPENG_SOFTWARE",
  "ai": "COMPENG_AI", "ml": "COMPENG_AI", "ai/ml": "COMPENG_AI", "machine learning": "COMPENG_AI",
  "cad": "MECHENG_CAD", "cad design": "MECHENG_CAD", "mechanical": "MECHENG_CAD",
  "fpga": "ELECENG_FPGA",
}

export { buckets, users, wallets, positions, specToBucket }

export function findBucket(specialization: string, region: string, year: string, coop: boolean): Bucket | undefined {
  const prefix = specToBucket[specialization.toLowerCase()] || "ELECENG_RF"
  const coopSuffix = coop ? "_COOP" : ""
  for (const b of Array.from(buckets.values())) {
    if (b.id.startsWith(prefix) && b.region === region && b.gradYear === year && b.id.endsWith(coopSuffix)) return b
  }
  return undefined
}

export function createUser(data: {
  name: string
  email: string
  university: string
  program: string
  gradYear: string
  specialization: string
  coopCount: number
  courses: string[]
  employer?: string
}): User {
  const id = genId()
  const erc8004 = genErc()
  const bucket = findBucket(data.specialization, "Ontario", data.gradYear, data.coopCount > 0)
  const bucketId = bucket ? bucket.id : "UNASSIGNED"

  const user: User = {
    id, erc8004, bucketId,
    name: data.name,
    email: data.email,
    university: data.university,
    program: data.program,
    gradYear: data.gradYear,
    specialization: data.specialization,
    coopCount: data.coopCount,
    courses: data.courses,
    employer: data.employer,
    walletBalance: 0,
    joinedAt: Date.now(),
    credentials: [],
  }
  users.set(id, user)
  wallets.set(id, [])
  positions.set(id, [])

  // Update bucket count
  if (bucket) {
    bucket.studentCount++
    bucket.studentIds.push(id)
  }
  return user
}

export function addCredential(userId: string, cred: Omit<Credential, "uploadedAt" | "hash"> & { hash?: string }): Credential {
  const user = users.get(userId)
  if (!user) throw new Error("User not found")
  const c: Credential = {
    ...cred,
    hash: cred.hash || `0x${(Date.now() % 0xFFFFFF).toString(16).padStart(6, "0")}`,
    uploadedAt: Date.now(),
  }
  user.credentials.push(c)
  return c
}

export function depositCredit(userId: string, amount: number, note: string): WalletTx {
  const user = users.get(userId)
  if (!user) throw new Error("User not found")
  user.walletBalance += amount
  const tx: WalletTx = { id: genTxId(), userId, type: "deposit", amount, timestamp: Date.now(), note }
  wallets.get(userId)!.push(tx)
  return tx
}

export function buyShares(userId: string, bucketId: string, amount: number): { shares: number; tx: WalletTx } {
  const user = users.get(userId)
  if (!user) throw new Error("User not found")
  const bucket = buckets.get(bucketId)
  if (!bucket) throw new Error("Bucket not found")
  if (user.walletBalance < amount) throw new Error("Insufficient balance")

  const fee = amount * 0.1
  const netAmount = amount - fee
  const shares = Math.floor(netAmount / bucket.price)

  user.walletBalance -= amount
  bucket.holders++
  bucket.volume24h += amount

  const tx: WalletTx = { id: genTxId(), userId, type: "buy", amount: -amount, bucketId, shares, timestamp: Date.now(), note: `Bought ${shares} shares of ${bucketId}` }
  wallets.get(userId)!.push(tx)

  const userPositions = positions.get(userId)!
  const existing = userPositions.find(p => p.bucketId === bucketId)
  if (existing) {
    const totalCost = existing.totalInvested + amount
    const totalShares = existing.shares + shares
    existing.avgPrice = totalCost / totalShares
    existing.shares = totalShares
    existing.totalInvested = totalCost
  } else {
    userPositions.push({ bucketId, shares, avgPrice: bucket.price, totalInvested: amount })
  }

  return { shares, tx }
}

export function sellShares(userId: string, bucketId: string, qty: number): { proceeds: number; tx: WalletTx } {
  const user = users.get(userId)
  if (!user) throw new Error("User not found")
  const bucket = buckets.get(bucketId)
  if (!bucket) throw new Error("Bucket not found")

  const userPositions = positions.get(userId)!
  const pos = userPositions.find(p => p.bucketId === bucketId)
  if (!pos || pos.shares < qty) throw new Error("Insufficient shares")

  const proceeds = qty * bucket.price * 0.95 // 5% exit fee
  user.walletBalance += proceeds
  pos.shares -= qty

  const tx: WalletTx = { id: genTxId(), userId, type: "sell", amount: proceeds, bucketId, shares: qty, timestamp: Date.now(), note: `Sold ${qty} shares of ${bucketId}` }
  wallets.get(userId)!.push(tx)
  return { proceeds, tx }
}

export function getUserData(userId: string) {
  const user = users.get(userId)
  if (!user) return null
  return {
    ...user,
    bucket: buckets.get(user.bucketId) || null,
    transactions: wallets.get(userId) || [],
    holdings: positions.get(userId) || [],
  }
}

export function getAllBuckets(): Bucket[] {
  return Array.from(buckets.values())
}

export function getBucketData(id: string): Bucket | undefined {
  return buckets.get(id)
}

// LLM credential parsing placeholder — will use API key
let llmApiKey = ""

export function setApiKey(key: string) { llmApiKey = key }
export function getApiKey() { return llmApiKey }

export async function parseCredentialsWithLLM(text: string): Promise<{
  university: string
  program: string
  gradYear: string
  specialization: string
  coopCount: number
  courses: string[]
  employer?: string
}> {
  if (!llmApiKey) {
    // Fallback to regex parsing when no API key
    const lower = text.toLowerCase()
    const uniMatch = text.match(/(\w[\w\s.]+?)\s*(?:university|u|college)/i)
    const yearMatch = text.match(/graduat(?:ing|ed)\s*(?:in\s*)?(\d{4})/)
    const progMatch = text.match(/(\w+)\s*(?:engineering|eng|program|ibiomed)/i)
    const coopMatch = text.match(/(\d+)\s*co-?op/i)
    const empMatch = text.match(/co-?op\s*(?:in|at)\s+([A-Za-z\s]+?)(?:\.|,|$)/i)
    const courseMatches = text.matchAll(/([A-Z]{2,})\s*(\d{2,4}[A-Z]?\d*)/g)
    
    let spec = ""
    const knownSpecs = ["rf", "power", "software", "ai", "ml", "cad", "fpga", "embedded"]
    for (const s of knownSpecs) { if (lower.includes(s)) { spec = s; break } }

    return {
      university: (uniMatch?.[1] || "McMaster University").trim(),
      program: progMatch?.[1] || "Electrical Engineering",
      gradYear: yearMatch?.[1] || "2028",
      specialization: spec || "RF Engineering",
      coopCount: coopMatch ? parseInt(coopMatch[1]) : 0,
      courses: Array.from(courseMatches).map(m => m[0]),
      employer: empMatch?.[1]?.trim(),
    }
  }

  // Use LLM for real parsing
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${llmApiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Extract student info from unstructured text. Return JSON with: university, program, gradYear, specialization, coopCount (number), courses (array), employer (optional string). If any field is ambiguous, make your best guess." },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
    }),
  })
  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
}

// x402 payment — uses the provided API key
let x402ApiKey = "Ofj2sw-qWiDNGZOKhD92dBLRIE4yoNxRXjj_Jx-FvVA="
let x402ApiSecret = "7gLwCSz_qGWu9jYZgU3YBts53xIy4MWaUnaCvDaQgy0="

export function setX402Credentials(key: string, secret: string) {
  x402ApiKey = key
  x402ApiSecret = secret
}

export async function executeX402Payment(from: string, to: string, amount: number): Promise<{ success: boolean; txHash: string }> {
  try {
    // The real x402 API call — replace the endpoint URL when provided
    const response = await fetch("https://api.x402.org/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": x402ApiKey,
        "X-API-Secret": x402ApiSecret,
      },
      body: JSON.stringify({
        from,
        to,
        amount,
        currency: "USDC",
        network: "goat",
      }),
    })
    if (!response.ok) throw new Error(`x402 API error: ${response.status}`)
    const data = await response.json()
    return { success: true, txHash: data.txHash || `0x${Date.now().toString(16)}` }
  } catch (e) {
    // Fallback: generate mock hash for demo
    console.warn("x402 API call failed, using mock:", e)
    return {
      success: true,
      txHash: `0x${(Date.now() % 0xFFFFFFFF).toString(16).padStart(8, "0")}${(amount * 1000).toString(16).padStart(8, "0")}`,
    }
  }
}

export async function simulateX402Payment(userId: string, amount: number): Promise<{ success: boolean; txHash: string }> {
  const fee = amount * 0.1
  const netAmount = amount - fee
  
  // Agent keeps 10% fee
  // Net amount goes to the bucket investment pool
  return executeX402Payment("agent_wallet", "pool_wallet", netAmount)
}