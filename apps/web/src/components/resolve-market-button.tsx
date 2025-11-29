"use client";

import { useState } from "react";
import { DELAY_MARKET_CONTRACT_ADDRESS, DELAY_MARKET_ABI } from "@/lib/contract";

interface ResolveMarketButtonProps {
  marketId: string;
  flightNumber: string;
  originCode: string;
  destinationCode: string;
  airlineCode: string;
  scheduledDeparture: string;
}

export function ResolveMarketButton({
  marketId,
  flightNumber,
  originCode,
  airlineCode,
  scheduledDeparture,
}: ResolveMarketButtonProps) {
  const [isResolving, setIsResolving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4500";

  const handleResolve = async () => {
    setIsResolving(true);
    setResult(null);

    try {
      const marketIdBytes = marketId.startsWith("0x") 
        ? marketId 
        : `0x${marketId}`;

      const params = new URLSearchParams({
        marketId: marketIdBytes,
        originCode,
        airlineCode,
        flightNumber,
        date: scheduledDeparture,
      });

      const response = await fetch(`${backendUrl}/resolve?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          outcome: data.outcome,
          flight: data.flight,
          txHash: data.blockchain?.txHash,
        });
      } else {
        setResult({
          success: false,
          error: data.error || "Failed to resolve market",
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsResolving(false);
    }
  };

  const outcomeNames: { [key: number]: string } = {
    1: "On Time",
    2: "Delayed Short (30-119 min)",
    3: "Delayed Long (120+ min)",
    4: "Cancelled",
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleResolve}
        disabled={isResolving}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isResolving ? "Resolving..." : "Resolve Market (Backend)"}
      </button>

      {result && (
        <div className={`mt-3 p-3 rounded-lg ${
          result.success 
            ? "bg-green-500/20 border border-green-500/50" 
            : "bg-red-500/20 border border-red-500/50"
        }`}>
          {result.success ? (
            <div>
              <p className="text-green-400 font-semibold text-sm">
                Market Resolved: {outcomeNames[result.outcome]}
              </p>
              {result.txHash && (
                <p className="text-xs text-gray-400 mt-1">
                  TX: {result.txHash.slice(0, 10)}...
                </p>
              )}
              {result.flight && (
                <p className="text-xs text-gray-400 mt-1">
                  Delay: {result.flight.departure?.delay || 0} minutes
                </p>
              )}
            </div>
          ) : (
            <p className="text-red-400 text-sm">{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}

