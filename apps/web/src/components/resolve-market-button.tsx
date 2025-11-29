"use client";

import { useState, useEffect } from "react";
import { resolveMarket, checkBackendHealth, type ResolveMarketResponse } from "@/lib/api";

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
  const [result, setResult] = useState<{ success: boolean; data?: ResolveMarketResponse; error?: string } | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(true); // Default to true, will be updated by health check

  useEffect(() => {
    checkBackendHealth().then((online) => setBackendOnline(online ?? false));
    const interval = setInterval(() => {
      checkBackendHealth().then((online) => setBackendOnline(online ?? false));
    }, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async () => {
    setIsResolving(true);
    setResult(null);

    try {
      const data = await resolveMarket({
        marketId,
        originCode,
        airlineCode,
        flightNumber,
        date: scheduledDeparture,
      });

      setResult({
        success: true,
        data,
      });

      // Auto-refresh after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 3000);
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

  if (!backendOnline) {
    return (
      <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
        <p className="text-yellow-400 text-sm">
          ⚠️ Backend offline. Please start the backend server.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={handleResolve}
          disabled={isResolving || !backendOnline}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isResolving ? "Resolving..." : "Resolve Market"}
        </button>
        {backendOnline && (
          <span className="text-xs text-green-400 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
            Backend Online
          </span>
        )}
      </div>

      {result && (
        <div className={`mt-3 p-3 rounded-lg ${
          result.success 
            ? "bg-green-500/20 border border-green-500/50" 
            : "bg-red-500/20 border border-red-500/50"
        }`}>
          {result.success && result.data ? (
            <div>
              <p className="text-green-400 font-semibold text-sm">
                ✅ Market Resolved: {outcomeNames[result.data.outcome]}
              </p>
              {result.data.blockchain.txHash && (
                <p className="text-xs text-gray-400 mt-1">
                  TX: {result.data.blockchain.txHash.slice(0, 10)}...
                </p>
              )}
              {result.data.flight && (
                <p className="text-xs text-gray-400 mt-1">
                  Delay: {result.data.flight.departure?.delay || 0} minutes
                </p>
              )}
            </div>
          ) : (
            <p className="text-red-400 text-sm">❌ {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}

