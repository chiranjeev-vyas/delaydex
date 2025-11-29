"use client";

import { useAccount, useReadContract } from "wagmi";
import { DELAY_MARKET_CONTRACT_ADDRESS, DELAY_MARKET_ABI } from "@/lib/contract";
import { ConnectButton } from "@/components/connect-button";
import { ChainWarning } from "@/components/chain-warning";
import { CreateMarketDialog } from "@/components/create-market-dialog";
import { BetDialog } from "@/components/bet-dialog";
import { ClaimWinningsDialog } from "@/components/claim-winnings-dialog";
import { ResolveMarketButton } from "@/components/resolve-market-button";
import { useMarketPrices } from "@/hooks/use-market-prices";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function MarketsPage() {
  const { isConnected } = useAccount();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [claimMarket, setClaimMarket] = useState<string | null>(null);

  const { data: markets, isLoading, refetch } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getAllMarkets",
    query: {
      enabled: isConnected && DELAY_MARKET_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 10000, // Refresh every 10 seconds
    },
  });

  // Auto-refresh markets
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        refetch();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isConnected, refetch]);


  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Markets</h1>
          <div className="flex gap-4 items-center">
            <ConnectButton />
            {isConnected && (
              <button
                onClick={() => setShowCreate(!showCreate)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showCreate ? "Cancel" : "Create Market"}
              </button>
            )}
          </div>
        </div>

        <ChainWarning />

        {showCreate && <CreateMarketDialog onClose={() => setShowCreate(false)} />}

        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading markets...</p>
          </div>
        ) : markets && Array.isArray(markets) && markets.length > 0 ? (
          <div className="grid gap-6">
            {markets.map((market: any, index: number) => (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {market.flightNumber}
                    </h3>
                    <p className="text-gray-400">
                      {market.originCode} → {market.destinationCode}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {market.scheduledDeparture}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        market.finalOutcome === 0
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {market.finalOutcome === 0 ? "Active" : "Resolved"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-4">
                  <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg p-4 border border-slate-600/50 hover:border-blue-500/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-400">On Time</p>
                      <span className="text-xs text-green-400">✓</span>
                    </div>
                    <p className="text-xl font-bold text-white mb-1">
                      {Number(market.onTime.yesPrice) / 1e16}%
                    </p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Yes: {Number(market.onTime.yesShares) / 1e18}</span>
                      <span>No: {Number(market.onTime.noShares) / 1e18}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg p-4 border border-slate-600/50 hover:border-yellow-500/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-400">Delayed Short</p>
                      <span className="text-xs text-yellow-400">⏱</span>
                    </div>
                    <p className="text-xl font-bold text-white mb-1">
                      {Number(market.delayedShort.yesPrice) / 1e16}%
                    </p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Yes: {Number(market.delayedShort.yesShares) / 1e18}</span>
                      <span>No: {Number(market.delayedShort.noShares) / 1e18}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg p-4 border border-slate-600/50 hover:border-orange-500/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-400">Delayed Long</p>
                      <span className="text-xs text-orange-400">⚠</span>
                    </div>
                    <p className="text-xl font-bold text-white mb-1">
                      {Number(market.delayedLong.yesPrice) / 1e16}%
                    </p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Yes: {Number(market.delayedLong.yesShares) / 1e18}</span>
                      <span>No: {Number(market.delayedLong.noShares) / 1e18}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg p-4 border border-slate-600/50 hover:border-red-500/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-400">Cancelled</p>
                      <span className="text-xs text-red-400">✕</span>
                    </div>
                    <p className="text-xl font-bold text-white mb-1">
                      {Number(market.cancelled.yesPrice) / 1e16}%
                    </p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Yes: {Number(market.cancelled.yesShares) / 1e18}</span>
                      <span>No: {Number(market.cancelled.noShares) / 1e18}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <div className="flex justify-end gap-3">
                    {market.finalOutcome === 0 && isConnected && (
                      <button
                        onClick={() => setSelectedMarket(market.marketId as string)}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all"
                      >
                        Place Bet
                      </button>
                    )}
                    {market.finalOutcome !== 0 && isConnected && (
                      <button
                        onClick={() => setClaimMarket(market.marketId as string)}
                        className="px-6 py-2 bg-gradient-to-r from-green-600 to-cyan-600 text-white rounded-lg hover:from-green-700 hover:to-cyan-700 transition-all"
                      >
                        Claim Winnings
                      </button>
                    )}
                  </div>
                  
                  {market.finalOutcome === 0 && (
                    <ResolveMarketButton
                      marketId={market.marketId as string}
                      flightNumber={market.flightNumber}
                      originCode={market.originCode}
                      destinationCode={market.destinationCode}
                      airlineCode={market.airlineCode}
                      scheduledDeparture={market.scheduledDeparture}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No markets found</p>
            <p className="text-gray-500 text-sm mt-2">
              Create the first market to get started!
            </p>
          </div>
        )}

        {selectedMarket && (
          <BetDialog
            marketId={selectedMarket}
            onClose={() => setSelectedMarket(null)}
          />
        )}

        {claimMarket && (
          <ClaimWinningsDialog
            marketId={claimMarket}
            onClose={() => setClaimMarket(null)}
          />
        )}
      </div>
    </main>
  );
}

