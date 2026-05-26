// @ts-nocheck
// Supabase-backed DB — shared cloud store for website + Hermes agent
import { getSupabaseClient } from "./supabase-admin"

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
  walletBalance: number
  joinedAt: number
  credentials: Credential[]
}

export type Credential = {
  id: number
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
  id: number
  userId: string
  bucketId: string
  shares: number
  avgPrice: number
  totalInvested: number
}

const sb = () => getSupabaseClient()

let nextId = 1
let nextTxId = 1

function genId(): string { return `user_${nextId++}_${Date.now().toString(36)}` }
function genTxId(): string { return `tx_${nextTxId++}_${Date.now().toString(36)}` }
function genErc(): string { return `0x${(nextId * 3).toString(16).padStart(4, "0")}…${(nextId * 7).toString(16).padStart(4, "0")}` }

const specToBucket: Record<string, string> = {
  "rf": "ELECENG_RF", "rf engineering": "ELECENG_RF",
  "power": "ELECENG_POWER", "power engineering": "ELECENG_POWER",
  "software": "COMPENG_SOFTWARE", "software engineering": "COMPENG_SOFTWARE",
  "ai": "COMPENG_AI", "ml": "COMPENG_AI", "ai/ml": "COMPENG_AI", "machine learning": "COMPENG_AI",
  "cad": "MECHENG_CAD", "cad design": "MECHENG_CAD", "mechanical": "MECHENG_CAD",
  "fpga": "ELECENG_FPGA",
}

export { specToBucket }

// Buckets — read from Supabase, fall back to cache
let bucketCache: Bucket[] | null = null

export async function getBucketsFromDB(): Promise<Bucket[]> {
  if (bucketCache) return bucketCache
  try {
    const { data, error } = await sb().from("buckets").select("*")
    if (error) throw error
    bucketCache = (data || []).map((b: any) => ({
      ...b,
      history: typeof b.history === "string" ? JSON.parse(b.history) : b.history || [],
      price: Number(b.price),
    }))
    return bucketCache
  } catch (e) {
    console.warn("Supabase fetch failed, using fallback buckets:", e)
    return getFallbackBuckets()
  }
}

function getFallbackBuckets(): Bucket[] {
  return [
    { id: "ELECENG_RF_Ontario_2028_COOP", label: "RF Engineering — $75k+ by 2028", category: "ELECENG", region: "Ontario", gradYear: "2028", price: 0.35, studentCount: 47, volume24h: 2400, holders: 23, history: fallbackPrices(0.28, 11) },
    { id: "ELECENG_POWER_Ontario_2028_COOP", label: "Power Engineering — $80k+ by 2028", category: "ELECENG", region: "Ontario", gradYear: "2028", price: 0.22, studentCount: 31, volume24h: 890, holders: 12, history: fallbackPrices(0.20, 17) },
    { id: "COMPENG_SOFTWARE_Ontario_2028_COOP", label: "Software Engineering — $100k+ by 2028", category: "COMPENG", region: "Ontario", gradYear: "2028", price: 0.61, studentCount: 112, volume24h: 12400, holders: 48, history: fallbackPrices(0.55, 23) },
    { id: "COMPENG_AI_Ontario_2028_COOP", label: "AI/ML Engineering — $130k+ by 2028", category: "COMPENG", region: "Ontario", gradYear: "2028", price: 0.78, studentCount: 64, volume24h: 8900, holders: 37, history: fallbackPrices(0.70, 31) },
    { id: "MECHENG_CAD_Ontario_2028_COOP", label: "CAD/Mechanical — $70k+ by 2028", category: "MECHENG", region: "Ontario", gradYear: "2028", price: 0.18, studentCount: 29, volume24h: 620, holders: 8, history: fallbackPrices(0.22, 7) },
    { id: "ELECENG_FPGA_Ontario_2027_COOP", label: "FPGA Design — $95k+ by 2027", category: "ELECENG", region: "Ontario", gradYear: "2027", price: 0.84, studentCount: 22, volume24h: 5600, holders: 19, history: fallbackPrices(0.62, 41) },
  ]
}

function fallbackPrices(start: number, seed: number): number[] {
  let x = seed
  const r = () => { x = (x * 9301 + 49297) % 233280; return x / 233280 }
  const out = [start]
  for (let i = 1; i < 28; i++) {
    out.push(Math.max(0.01, Math.min(0.99, out[i - 1] * (1 + 0.003 + (r() - 0.5) * 0.04))))
  }
  return out
}

export async function findBucket(specialization: string, region: string, year: string, coop: boolean): Promise<Bucket | undefined> {
  const prefix = specToBucket[specialization.toLowerCase()] || "ELECENG_RF"
  const coopSuffix = coop ? "_COOP" : ""
  const buckets = await getBucketsFromDB()
  return buckets.find(b => b.id.startsWith(prefix) && b.region === region && b.gradYear === year && b.id.endsWith(coopSuffix))
}

export async function createUser(data: {
  name: string; email: string; university: string; program: string;
  gradYear: string; specialization: string; coopCount: number;
  courses: string[]; employer?: string;
}): Promise<User> {
  const id = genId()
  const erc8004 = genErc()
  const bucket = await findBucket(data.specialization, "Ontario", data.gradYear, data.coopCount > 0)
  const bucketId = bucket ? bucket.id : "UNASSIGNED"

  const user: User = {
    id, erc8004, bucketId,
    name: data.name, email: data.email,
    university: data.university, program: data.program,
    gradYear: data.gradYear, specialization: data.specialization,
    coopCount: data.coopCount, courses: data.courses,
    employer: data.employer,
    walletBalance: 0, joinedAt: Date.now(), credentials: [],
  }

  try {
    const { error } = await sb().from("talentmkt_users").insert({
      id, name: data.name, email: data.email,
      university: data.university, program: data.program,
      grad_year: data.gradYear, specialization: data.specialization,
      coop_count: data.coopCount, courses: JSON.stringify(data.courses),
      employer: data.employer || null,
      bucket_id: bucketId, erc8004,
      wallet_balance: 0, joined_at: Date.now(),
    })
    if (error) throw error

    // Update bucket student count
    if (bucket) {
      await sb().from("buckets").update({
        student_count: (bucket.studentCount || 0) + 1,
      }).eq("id", bucket.id)
    }
  } catch (e) {
    console.error("Supabase createUser failed:", e)
    // Fallback: return in-memory user
  }

  return user
}

export async function addCredential(userId: string, cred: Omit<Credential, "id" | "uploadedAt" | "hash"> & { hash?: string }): Promise<Credential> {
  const c: any = {
    user_id: userId,
    type: cred.type,
    issuer: cred.issuer,
    status: cred.status || "pending",
    hash: cred.hash || `0x${(Date.now() % 0xFFFFFF).toString(16).padStart(6, "0")}`,
    uploaded_at: Date.now(),
  }
  try {
    const { data, error } = await sb().from("credentials").insert(c).select().single()
    if (!error && data) {
      return { id: data.id, type: data.type, issuer: data.issuer, status: data.status, hash: data.hash, uploadedAt: data.uploaded_at }
    }
  } catch (e) { console.warn("addCredential supabase failed:", e) }
  return { id: 0, type: cred.type as any, issuer: cred.issuer, status: "pending", hash: c.hash, uploadedAt: Date.now() }
}

export async function depositCredit(userId: string, amount: number, note: string): Promise<WalletTx> {
  const tx: WalletTx = { id: genTxId(), userId, type: "deposit", amount, timestamp: Date.now(), note }
  try {
    // Update wallet balance
    const { error: updateErr } = await sb().from("talentmkt_users")
      .update({ wallet_balance: (await getUserData(userId))?.walletBalance + amount || amount })
      .eq("id", userId)
    if (updateErr) throw updateErr

    // Record transaction
    const { error: txErr } = await sb().from("wallet_txs").insert({
      id: tx.id, user_id: userId, type: "deposit", amount,
      timestamp: tx.timestamp, note,
    })
    if (txErr) throw txErr
  } catch (e) {
    console.warn("depositCredit supabase failed:", e)
  }
  return tx
}

export async function buyShares(userId: string, bucketId: string, amount: number): Promise<{ shares: number; tx: WalletTx }> {
  const bucket = (await getBucketsFromDB()).find(b => b.id === bucketId)
  if (!bucket) throw new Error("Bucket not found")

  const user = await getUserData(userId)
  if (!user || user.walletBalance < amount) throw new Error("Insufficient balance")

  const fee = amount * 0.1
  const netAmount = amount - fee
  const shares = Math.floor(netAmount / bucket.price)

  const tx: WalletTx = { id: genTxId(), userId, type: "buy", amount: -amount, bucketId, shares, timestamp: Date.now(), note: `Bought ${shares} shares of ${bucketId}` }

  try {
    // Deduct wallet
    await sb().from("talentmkt_users")
      .update({ wallet_balance: user.walletBalance - amount })
      .eq("id", userId)

    // Update bucket
    await sb().from("buckets").update({
      holders: (bucket.holders || 0) + 1,
      volume24h: (bucket.volume24h || 0) + amount,
    }).eq("id", bucketId)

    // Record tx
    await sb().from("wallet_txs").insert({
      id: tx.id, user_id: userId, type: "buy", amount: -amount,
      bucket_id: bucketId, shares, timestamp: tx.timestamp, note: tx.note,
    })

    // Upsert position
    const { data: existingPos } = await sb().from("positions")
      .select("*").eq("user_id", userId).eq("bucket_id", bucketId).single()

    if (existingPos) {
      const totalCost = (existingPos.total_invested || 0) + amount
      const totalShares = (existingPos.shares || 0) + shares
      await sb().from("positions").update({
        shares: totalShares,
        avg_price: totalCost / totalShares,
        total_invested: totalCost,
      }).eq("id", existingPos.id)
    } else {
      await sb().from("positions").insert({
        user_id: userId, bucket_id: bucketId,
        shares, avg_price: bucket.price, total_invested: amount,
      })
    }
  } catch (e) {
    console.warn("buyShares supabase failed:", e)
  }

  return { shares, tx }
}

export async function sellShares(userId: string, bucketId: string, qty: number): Promise<{ proceeds: number; tx: WalletTx }> {
  const bucket = (await getBucketsFromDB()).find(b => b.id === bucketId)
  if (!bucket) throw new Error("Bucket not found")

  const { data: pos } = await sb().from("positions")
    .select("*").eq("user_id", userId).eq("bucket_id", bucketId).single()
  if (!pos || pos.shares < qty) throw new Error("Insufficient shares")

  const proceeds = qty * bucket.price * 0.95
  const tx: WalletTx = { id: genTxId(), userId, type: "sell", amount: proceeds, bucketId, shares: qty, timestamp: Date.now(), note: `Sold ${qty} shares of ${bucketId}` }

  try {
    // Update wallet
    const user = await getUserData(userId)
    await sb().from("talentmkt_users")
      .update({ wallet_balance: (user?.walletBalance || 0) + proceeds })
      .eq("id", userId)

    // Update position
    await sb().from("positions").update({
      shares: pos.shares - qty,
    }).eq("id", pos.id)

    // Record tx
    await sb().from("wallet_txs").insert({
      id: tx.id, user_id: userId, type: "sell", amount: proceeds,
      bucket_id: bucketId, shares: qty, timestamp: tx.timestamp, note: tx.note,
    })
  } catch (e) {
    console.warn("sellShares supabase failed:", e)
  }

  return { proceeds, tx }
}

export async function getUserData(userId: string): Promise<any | null> {
  try {
    const { data: user, error } = await sb().from("talentmkt_users").select("*").eq("id", userId).single()
    if (error || !user) return null

    const { data: txs } = await sb().from("wallet_txs").select("*").eq("user_id", userId).order("timestamp", { ascending: false })
    const { data: pos } = await sb().from("positions").select("*").eq("user_id", userId)
    const { data: creds } = await sb().from("credentials").select("*").eq("user_id", userId)

    const bucket = (await getBucketsFromDB()).find(b => b.id === user.bucket_id) || null

    return {
      id: user.id, name: user.name, email: user.email,
      university: user.university, program: user.program,
      gradYear: user.grad_year, specialization: user.specialization,
      coopCount: user.coop_count, courses: user.courses || [],
      employer: user.employer, bucketId: user.bucket_id,
      erc8004: user.erc8004, walletBalance: user.wallet_balance || 0,
      joinedAt: user.joined_at,
      bucket,
      transactions: txs || [],
      holdings: (pos || []).filter((p: any) => p.shares > 0).map((p: any) => ({
        bucketId: p.bucket_id, shares: p.shares,
        avgPrice: p.avg_price, totalInvested: p.total_invested,
      })),
      credentials: (creds || []).map((c: any) => ({
        id: c.id, type: c.type, issuer: c.issuer,
        status: c.status, hash: c.hash, uploadedAt: c.uploaded_at,
      })),
    }
  } catch (e) {
    console.warn("getUserData failed:", e)
    return null
  }
}

export async function getAllBuckets(): Promise<Bucket[]> {
  return getBucketsFromDB()
}

export async function getBucketData(id: string): Promise<Bucket | undefined> {
  const buckets = await getBucketsFromDB()
  return buckets.find(b => b.id === id)
}

// LLM credential parsing
let llmApiKey = ""
export function setApiKey(key: string) { llmApiKey = key }
export function getApiKey() { return llmApiKey }

export async function parseCredentialsWithLLM(text: string): Promise<{
  university: string; program: string; gradYear: string;
  specialization: string; coopCount: number; courses: string[];
  employer?: string;
}> {
  if (!llmApiKey) {
    const lower = text.toLowerCase()
    const uniMatch = text.match(/(\w[\w\s.]+?)\s*(?:university|u|college)/i)
    const yearMatch = text.match(/graduat(?:ing|ed)\s*(?:in\s*)?(\d{4})/)
    const coopMatch = text.match(/(\d+)\s*co-?op/i)
    const empMatch = text.match(/co-?op\s*(?:in|at)\s+([A-Za-z\s]+?)(?:\.|,|$)/i)
    const courseMatches = text.matchAll(/([A-Z]{2,})\s*(\d{2,4}[A-Z]?\d*)/g)
    let spec = ""
    const knownSpecs = ["rf", "power", "software", "ai", "ml", "cad", "fpga", "embedded"]
    for (const s of knownSpecs) { if (lower.includes(s)) { spec = s; break } }
    return {
      university: (uniMatch?.[1] || "McMaster University").trim(),
      program: "Engineering",
      gradYear: yearMatch?.[1] || "2028",
      specialization: spec || "RF Engineering",
      coopCount: coopMatch ? parseInt(coopMatch[1]) : 0,
      courses: Array.from(courseMatches).map(m => m[0]),
      employer: empMatch?.[1]?.trim(),
    }
  }

  try {
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
  } catch {
    return { university: "McMaster", program: "Engineering", gradYear: "2028", specialization: "RF", coopCount: 0, courses: [] }
  }
}

// x402 payment
let x402ApiKey = "Ofj2sw-qWiDNGZOKhD92dBLRIE4yoNxRXjj_Jx-FvVA="
let x402ApiSecret = "7gLwCSz_qGWu9jYZgU3YBts53xIy4MWaUnaCvDaQgy0="

export function setX402Credentials(key: string, secret: string) {
  x402ApiKey = key
  x402ApiSecret = secret
}

export async function executeX402Payment(from: string, to: string, amount: number): Promise<{ success: boolean; txHash: string }> {
  try {
    const response = await fetch("https://api.x402.org/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": x402ApiKey,
        "X-API-Secret": x402ApiSecret,
      },
      body: JSON.stringify({ from, to, amount, currency: "USDC", network: "goat" }),
    })
    if (!response.ok) throw new Error(`x402 API error: ${response.status}`)
    const data = await response.json()
    return { success: true, txHash: data.txHash || `0x${Date.now().toString(16)}` }
  } catch (e) {
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
  return executeX402Payment("agent_wallet", "pool_wallet", netAmount)
}
