"use client";

import { useReadContract } from "wagmi";
import { DELAY_MARKET_CONTRACT_ADDRESS, DELAY_MARKET_ABI } from "@/lib/contract";
import { useEffect, useState } from "react";

export function useMarketPrices(marketId: string | null, enabled: boolean = true) {
  const [prices, setPrices] = useState<any>(null);

  const marketIdBytes = marketId && marketId.startsWith("0x") 
    ? marketId as `0x${string}` 
    : marketId ? `0x${marketId}` as `0x${string}` : null;

  const { data: marketData, refetch } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getMarketData",
    args: marketIdBytes ? [marketIdBytes] : undefined,
    query: {
      enabled: enabled && !!marketIdBytes,
      refetchInterval: 5000, // Poll every 5 seconds
    },
  });

  useEffect(() => {
    if (marketData) {
      setPrices(marketData);
    }
  }, [marketData]);

  useEffect(() => {
    if (enabled && marketIdBytes) {
      const interval = setInterval(() => {
        refetch();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [enabled, marketIdBytes, refetch]);

  return { prices, refetch };
}

