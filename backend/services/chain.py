from __future__ import annotations

import hashlib
import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
DEPLOYMENTS = ROOT / "backend" / "generated" / "deployments.json"
ARTIFACTS = ROOT / "contracts" / "artifacts"


@dataclass
class ChainResult:
    tx_hash: str
    token_id: int | None = None


def local_hash(seed: str) -> str:
    return "0x" + hashlib.sha256(seed.encode("utf-8")).hexdigest()


def _load_deployments() -> dict[str, Any]:
    if not DEPLOYMENTS.exists():
        return {}
    return json.loads(DEPLOYMENTS.read_text(encoding="utf-8"))


def _load_abi(contract_name: str) -> list[dict[str, Any]]:
    artifact = ARTIFACTS / f"{contract_name}.json"
    if not artifact.exists():
        return []
    return json.loads(artifact.read_text(encoding="utf-8")).get("abi", [])


def _web3():
    from web3 import Web3

    rpc_url = os.getenv("CHAIN_RPC_URL", "http://127.0.0.1:8545")
    return Web3(Web3.HTTPProvider(rpc_url))


def _account(w3: Any) -> str | None:
    private_key = os.getenv("CHAIN_PRIVATE_KEY")
    if private_key:
        return w3.eth.account.from_key(private_key).address

    try:
        index = int(os.getenv("CHAIN_DEFAULT_ACCOUNT", "0"))
        return w3.eth.accounts[index]
    except Exception:
        return None


def _transact(contract: Any, fn_name: str, *args: Any) -> str | None:
    try:
        w3 = _web3()
        if not w3.is_connected():
            return None
        sender = _account(w3)
        if not sender:
            return None
        tx_hash = getattr(contract.functions, fn_name)(*args).transact({"from": sender})
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=30)
        return receipt.transactionHash.hex()
    except Exception:
        return None


def _contract(contract_name: str):
    deployments = _load_deployments()
    address = deployments.get(contract_name)
    abi = _load_abi(contract_name)
    if not address or not abi:
        return None

    try:
        w3 = _web3()
        if not w3.is_connected():
            return None
        return w3.eth.contract(address=address, abi=abi)
    except Exception:
        return None


def mint_attestation(wallet: str, token_uri: str, seed: str) -> ChainResult:
    contract = _contract("ERC8004")
    if contract:
        recipient = wallet
        try:
            w3 = _web3()
            if not w3.is_address(recipient):
                recipient = _account(w3) or recipient
        except Exception:
            pass
        tx_hash = _transact(contract, "mintAttestation", recipient, token_uri)
        if tx_hash:
            return ChainResult(tx_hash=tx_hash)

    return ChainResult(tx_hash=local_hash(f"attestation:{seed}"))


def execute_trade(buyer: str, bucket_id: str, amount: float) -> ChainResult:
    contract = _contract("X402")
    units = int(amount * 1_000_000)
    if contract:
        account = buyer
        try:
            w3 = _web3()
            if not w3.is_address(account):
                account = _account(w3) or account
        except Exception:
            pass
        deployments = _load_deployments()
        usdc = _contract("MockUSDC")
        x402_address = deployments.get("X402")
        if usdc and x402_address:
            _transact(usdc, "approve", x402_address, units)
        tx_hash = _transact(contract, "executeTrade", account, bucket_id, units)
        if tx_hash:
            return ChainResult(tx_hash=tx_hash)

    return ChainResult(tx_hash=local_hash(f"trade:{buyer}:{bucket_id}:{amount}"))
