from __future__ import annotations

import asyncio
from datetime import UTC, datetime

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from backend.models import (
    BuySharesRequest,
    BuySharesResponse,
    CredentialRequest,
    CredentialResponse,
    MintContractRequest,
    MintContractResponse,
    WalletResponse,
    WalletTransaction,
)
from backend.services import chain, hermes
from backend.services.store import DEFAULT_WALLET, add_transaction, market_events, wallet_transactions


app = FastAPI(title="talent.mkt Hermes API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _probability(request: MintContractRequest) -> int:
    base = 0.55
    salary_factor = max(-0.35, min(0.25, (90 - request.salary) / 200))
    industry_boost = {
        "Semiconductors": 0.10,
        "Defense Tech": 0.12,
        "Quant Finance": 0.06,
        "Robotics": 0.05,
        "AI Infrastructure": 0.18,
        "Aerospace": 0.04,
    }.get(request.industry, 0)
    region_boost = {"North America": 0.06, "EU": 0.02, "UK": 0.01, "APAC": 0.04, "Global": 0.05}.get(
        request.region, 0
    )
    skill_boost = {"RF Engineering": 0.10, "FPGA Design": 0.14, "Embedded Systems": 0.07, "AI / ML": 0.22}.get(
        request.skill, 0.05
    )
    year_penalty = (int(request.year) - 2026) * -0.012
    return round(max(0.05, min(0.97, base + salary_factor + industry_boost + region_boost + skill_boost + year_penalty)) * 100)


def _symbol(skill: str, year: str) -> str:
    slug = "".join(part[0] for part in skill.replace("/", " ").split() if part).upper()
    return f"{slug}-{year}"


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "skill-futures-hermes-api"}


@app.post("/verify_credentials", response_model=CredentialResponse)
async def verify_credentials(request: CredentialRequest) -> CredentialResponse:
    seed = f"{request.student_name}:{request.institution}:{request.program}:{request.course}"
    nft_hash = chain.local_hash(seed)
    result = chain.mint_attestation(request.wallet, f"ipfs://skill-futures/{nft_hash[2:18]}", seed)
    summary = hermes.verify_credentials(request)
    add_transaction(
        WalletTransaction(
            type="in",
            desc=f"Credential · {request.course}",
            amount="+NFT",
            time="now",
            hash=result.tx_hash[:10] + "..." + result.tx_hash[-4:],
        )
    )
    return CredentialResponse(
        status="verified",
        nft_hash=nft_hash,
        token_id=result.token_id,
        tx_hash=result.tx_hash,
        agent_summary=summary,
    )


@app.post("/mint_contract", response_model=MintContractResponse)
async def mint_contract(request: MintContractRequest) -> MintContractResponse:
    probability = _probability(request)
    price = round(probability / 100, 2)
    symbol = _symbol(request.skill, request.year)
    seed = f"{symbol}:{request.salary}:{request.industry}:{request.region}"
    nft_hash = chain.local_hash(seed)
    result = chain.mint_attestation(request.wallet, f"ipfs://skill-futures/{symbol.lower()}", seed)
    summary = hermes.summarize_mint(request, probability)
    add_transaction(
        WalletTransaction(
            type="out",
            desc=f"Mint · {symbol}",
            amount="$0.00",
            time="now",
            hash=result.tx_hash[:10] + "..." + result.tx_hash[-4:],
        )
    )
    return MintContractResponse(
        status="minted",
        symbol=symbol,
        probability=probability,
        price=price,
        nft_hash=nft_hash,
        tx_hash=result.tx_hash,
        token_id=result.token_id,
        agent_summary=summary,
    )


@app.post("/buy_shares", response_model=BuySharesResponse)
async def buy_shares(request: BuySharesRequest) -> BuySharesResponse:
    shares = round(request.usdc_amount / 0.72, 2)
    result = chain.execute_trade(request.buyer, request.bucket_id, request.usdc_amount)
    summary = hermes.summarize_trade(request, shares)
    settlement_id = "X402-" + result.tx_hash[2:8].upper()
    add_transaction(
        WalletTransaction(
            type="out",
            desc=f"Buy · {request.bucket_id} ({shares:.2f} ct)",
            amount="$0.00",
            time="now",
            hash=result.tx_hash[:10] + "..." + result.tx_hash[-4:],
        )
    )
    return BuySharesResponse(
        status="settled",
        tx_hash=result.tx_hash,
        shares=shares,
        settlement_id=settlement_id,
        agent_summary=summary,
    )


@app.get("/wallet", response_model=WalletResponse)
async def wallet() -> WalletResponse:
    return WalletResponse(balance="$0.00", delta_24h="$0.00 · 24h", address=DEFAULT_WALLET, transactions=wallet_transactions)


@app.websocket("/market_updates")
async def market_updates(websocket: WebSocket) -> None:
    await websocket.accept()
    index = 0
    while True:
        event = market_events[index % len(market_events)] | {"time": datetime.now(UTC).isoformat()}
        await websocket.send_json(event)
        index += 1
        await asyncio.sleep(5)
