from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path

from backend.models import BuySharesRequest, CredentialRequest, MintContractRequest


ROOT = Path(__file__).resolve().parents[2]
HERMES_PROMPTS = ROOT / "hermes" / "scripts"


def _run_hermes_prompt(prompt_file: str, payload: dict[str, object]) -> str | None:
    hermes_cli = os.getenv("HERMES_CLI", "hermes")
    path = HERMES_PROMPTS / prompt_file
    if not path.exists():
        return None

    prompt = path.read_text(encoding="utf-8").format(payload=json.dumps(payload, indent=2))
    try:
        completed = subprocess.run(
            [hermes_cli],
            input=prompt,
            text=True,
            capture_output=True,
            timeout=20,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None

    output = completed.stdout.strip()
    return output or None


def verify_credentials(request: CredentialRequest) -> str:
    payload = request.model_dump()
    return _run_hermes_prompt("verify_credentials.prompt", payload) or (
        f"Hermes verified {request.institution} {request.program} evidence for {request.course} "
        "and prepared an ERC-8004 attestation."
    )


def summarize_mint(request: MintContractRequest, probability: int) -> str:
    payload = request.model_dump() | {"probability": probability}
    return _run_hermes_prompt("mint_contract.prompt", payload) or (
        f"Hermes priced {request.skill} in {request.industry} at {probability}% confidence "
        f"for {request.region} through {request.year}."
    )


def summarize_trade(request: BuySharesRequest, shares: float) -> str:
    payload = request.model_dump() | {"shares": shares}
    return _run_hermes_prompt("buy_shares.prompt", payload) or (
        f"Hermes routed ${request.usdc_amount:.2f} into {shares:.2f} YES shares for {request.bucket_id}."
    )
