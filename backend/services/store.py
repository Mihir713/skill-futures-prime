from backend.models import WalletTransaction


DEFAULT_WALLET = "0x7a3f9c2b9aA1F19c"

wallet_transactions: list[WalletTransaction] = [
    WalletTransaction(type="in", desc="Settlement · INTERN-2024", amount="$0.00", time="2h", hash="0x9af4...2c11"),
    WalletTransaction(type="out", desc="Mint · RFE-2028", amount="$0.00", time="5h", hash="0x71b2...ee08"),
    WalletTransaction(type="in", desc="Sale · FPGA-2027 (200 ct)", amount="$0.00", time="1d", hash="0x4c0a...1ff7"),
    WalletTransaction(type="out", desc="Mint · AIML-2030", amount="$0.00", time="2d", hash="0xa12c...77b0"),
    WalletTransaction(type="in", desc="Settlement · GPA-3.7-2025", amount="$0.00", time="4d", hash="0xeec1...aa42"),
]


market_events = [
    {
        "tag": "HERMES",
        "text": "RF engineering demand remains bid across Ontario semiconductor roles.",
        "symbol": "RFE-2028",
        "delta": 0.6,
    },
    {
        "tag": "CRON",
        "text": "x402 settlement liquidity crossed the demo alert threshold.",
        "symbol": "FPGA-2027",
        "delta": 1.1,
    },
    {
        "tag": "ORACLE",
        "text": "Credential attestations improved confidence for embedded systems buckets.",
        "symbol": "EMB-2028",
        "delta": 0.4,
    },
]


def add_transaction(transaction: WalletTransaction) -> None:
    wallet_transactions.insert(0, transaction)
