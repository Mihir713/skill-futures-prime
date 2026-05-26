const HERMES_API_BASE = import.meta.env.VITE_HERMES_API_BASE ?? "http://127.0.0.1:8000";

type JsonRecord = Record<string, unknown>;

async function postToHermes<T>(path: string, payload: JsonRecord): Promise<T> {
  const response = await fetch(`${HERMES_API_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Hermes agent request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export type HermesCredentialResponse = {
  status: string;
  nft_hash: string;
  tx_hash: string | null;
  agent_summary: string;
};

export type HermesMintResponse = {
  status: string;
  symbol: string;
  probability: number;
  price: number;
  nft_hash: string;
  tx_hash: string | null;
  agent_summary: string;
};

export type HermesWalletResponse = {
  balance: string;
  delta_24h: string;
  address: string;
  transactions: Array<{
    type: string;
    desc: string;
    amount: string;
    time: string;
    hash: string;
  }>;
};

export function connectHermesIdentity() {
  return postToHermes<HermesCredentialResponse>("/verify_credentials", {
    institution: "McMaster",
    program: "iBiomed",
    course: "ELECENG 2FH4",
  });
}

export function mintHermesContract(payload: {
  skill: string;
  salary: number;
  year: string;
  industry: string;
  region: string;
}) {
  return postToHermes<HermesMintResponse>("/mint_contract", payload);
}

export async function getHermesWallet(): Promise<HermesWalletResponse> {
  const response = await fetch(`${HERMES_API_BASE}/wallet`);
  if (!response.ok) {
    throw new Error(`Hermes wallet request failed: ${response.status}`);
  }
  return response.json() as Promise<HermesWalletResponse>;
}
