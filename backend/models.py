from pydantic import BaseModel, Field


class CredentialRequest(BaseModel):
    student_name: str = Field(default="Mihir S.")
    institution: str
    program: str
    course: str
    wallet: str = Field(default="0x7a3f9c2b9aA1F19c")


class CredentialResponse(BaseModel):
    status: str
    nft_hash: str
    token_id: int | None = None
    tx_hash: str | None = None
    agent_summary: str


class MintContractRequest(BaseModel):
    skill: str
    salary: int
    year: str
    industry: str
    region: str
    wallet: str = Field(default="0x7a3f9c2b9aA1F19c")


class MintContractResponse(BaseModel):
    status: str
    symbol: str
    probability: int
    price: float
    nft_hash: str
    tx_hash: str | None = None
    token_id: int | None = None
    agent_summary: str


class BuySharesRequest(BaseModel):
    bucket_id: str
    usdc_amount: float = Field(gt=0)
    buyer: str = Field(default="0x7a3f9c2b9aA1F19c")


class BuySharesResponse(BaseModel):
    status: str
    tx_hash: str
    shares: float
    settlement_id: str
    agent_summary: str


class WalletTransaction(BaseModel):
    type: str
    desc: str
    amount: str
    time: str
    hash: str


class WalletResponse(BaseModel):
    balance: str
    delta_24h: str
    address: str
    transactions: list[WalletTransaction]
from pydantic import BaseModel, Field


class CredentialRequest(BaseModel):
    student_name: str = Field(default="Mihir S.")
    institution: str
    program: str
    course: str
    wallet: str = Field(default="0x7a3f9c2b9aA1F19c")


class CredentialResponse(BaseModel):
    status: str
    nft_hash: str
    token_id: int | None = None
    tx_hash: str | None = None
    agent_summary: str


class MintContractRequest(BaseModel):
    skill: str
    salary: int
    year: str
    industry: str
    region: str
    wallet: str = Field(default="0x7a3f9c2b9aA1F19c")


class MintContractResponse(BaseModel):
    status: str
    symbol: str
    probability: int
    price: float
    nft_hash: str
    tx_hash: str | None = None
    token_id: int | None = None
    agent_summary: str


class BuySharesRequest(BaseModel):
    bucket_id: str
    usdc_amount: float = Field(gt=0)
    buyer: str = Field(default="0x7a3f9c2b9aA1F19c")


class BuySharesResponse(BaseModel):
    status: str
    tx_hash: str
    shares: float
    settlement_id: str
    agent_summary: str


class WalletTransaction(BaseModel):
    type: str
    desc: str
    amount: str
    time: str
    hash: str


class WalletResponse(BaseModel):
    balance: str
    delta_24h: str
    address: str
    transactions: list[WalletTransaction]
