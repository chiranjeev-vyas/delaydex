// API client for backend communication

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4500";

export interface ResolveMarketParams {
  marketId: string;
  originCode: string;
  airlineCode: string;
  flightNumber: string;
  date: string;
}

export interface ResolveMarketResponse {
  marketId: string;
  flight: any;
  outcome: number;
  blockchain: {
    chain: string;
    txHash: string | null;
    submitted: boolean;
  };
}

export async function resolveMarket(params: ResolveMarketParams): Promise<ResolveMarketResponse> {
  const marketIdBytes = params.marketId.startsWith("0x") 
    ? params.marketId 
    : `0x${params.marketId}`;

  const urlParams = new URLSearchParams({
    marketId: marketIdBytes,
    originCode: params.originCode,
    airlineCode: params.airlineCode,
    flightNumber: params.flightNumber,
    date: params.date,
  });

  const response = await fetch(`${BACKEND_URL}/resolve?${urlParams.toString()}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to resolve market" }));
    throw new Error(error.error || "Failed to resolve market");
  }

  return response.json();
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

