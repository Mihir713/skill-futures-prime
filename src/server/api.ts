"use server"

import { createServerFn } from "@tanstack/react-start"
import { createUser, addCredential, depositCredit, buyShares, sellShares, getUserData, getAllBuckets, setApiKey, parseCredentialsWithLLM, simulateX402Payment } from "./db"

export const signup = createServerFn({ method: "POST" })
  .handler(async (ctx: { data: { name: string; email: string; university: string; program: string; gradYear: string; specialization: string; coopCount: number; courses: string[]; employer?: string } }) => {
    const { data } = ctx
    const user = createUser(data)
    addCredential(user.id, { type: "degree", issuer: data.university, status: "pending", hash: `0x${Date.now().toString(16)}` })
    if (data.employer) {
      addCredential(user.id, { type: "employment", issuer: data.employer, status: "pending" })
    }
    return { userId: user.id, erc8004: user.erc8004, bucketId: user.bucketId }
  })

export const agentDeposit = createServerFn({ method: "POST" })
  .handler(async (ctx: { data: { userId: string; amount: number; prompt: string } }) => {
    const { userId, amount, prompt } = ctx.data
    if (amount <= 0 || amount > 10000) throw new Error("Invalid amount")
    if (prompt.length < 3) throw new Error("Agent requires a prompt to process deposits")
    // x402 payment — agent keeps 10% fee, 90% goes to user wallet
    const fee = amount * 0.1
    const netAmount = amount - fee
    const x402 = await simulateX402Payment(userId, netAmount)
    if (!x402.success) throw new Error("x402 payment failed")
    const tx = depositCredit(userId, netAmount, `Agent deposit: "${prompt.slice(0, 50)}" — fee: $${fee.toFixed(2)} — tx: ${x402.txHash}`)
    return { balance: getUserData(userId)?.walletBalance, tx, x402Tx: x402.txHash, fee }
  })

export const agentBuy = createServerFn({ method: "POST" })
  .handler(async (ctx: { data: { userId: string; bucketId: string; amount: number } }) => {
    const result = buyShares(ctx.data.userId, ctx.data.bucketId, ctx.data.amount)
    const user = getUserData(ctx.data.userId)
    return { ...result, balance: user?.walletBalance }
  })

export const agentSell = createServerFn({ method: "POST" })
  .handler(async (ctx: { data: { userId: string; bucketId: string; qty: number } }) => {
    const result = sellShares(ctx.data.userId, ctx.data.bucketId, ctx.data.qty)
    const user = getUserData(ctx.data.userId)
    return { ...result, balance: user?.walletBalance }
  })

export const getUser = createServerFn({ method: "GET" })
  .handler(async (ctx: { data: { userId: string } }) => {
    return getUserData(ctx.data.userId)
  })

export const getBuckets = createServerFn({ method: "GET" })
  .handler(async () => {
    return getAllBuckets().map(b => ({
      id: b.id, label: b.label, category: b.category, region: b.region,
      gradYear: b.gradYear, price: b.price, studentCount: b.studentCount,
      volume24h: b.volume24h, holders: b.holders, history: b.history,
    }))
  })

export const configureApiKey = createServerFn({ method: "POST" })
  .handler(async (ctx: { data: { apiKey: string } }) => {
    setApiKey(ctx.data.apiKey)
    return { success: true }
  })

export const parseCredentials = createServerFn({ method: "POST" })
  .handler(async (ctx: { data: { text: string } }) => {
    return await parseCredentialsWithLLM(ctx.data.text)
  })