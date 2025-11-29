"use client";

import { useAccount, useReadContract } from "wagmi";
import { DELAY_MARKET_CONTRACT_ADDRESS, DELAY_MARKET_ABI } from "@/lib/contract";
import { ConnectButton } from "@/components/connect-button";
import { ChainWarning } from "@/components/chain-warning";
import { ClaimWinningsDialog } from "@/components/claim-winnings-dialog";
import { useState, useMemo } from "react";
import { formatEther } from "viem";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

interface MarketData {
  flightNumber: string;
  airlineCode: string;
  originCode: string;
  destinationCode: string;
  scheduledDeparture: bigint;
  finalOutcome: number;
  isOpen: boolean;
  totalYesShares: bigint;
  totalNoShares: bigint;
}

interface UserBet {
  marketId: string;
  marketData: MarketData;
  outcome: number;
  position: number;
  shares: bigint;
  pricePerShare: bigint;
  totalCost: bigint;
  isWinning: boolean;
  canClaim: boolean;
  potentialWinnings: bigint;
}

const outcomeNames: Record<number, string> = {
  0: "Pending",
  1: "On Time",
  2: "30+ min delay",
  3: "120+ min delay",
  4: "Cancelled",
};

const positionNames: Record<number, string> = {
  0: "Yes",
  1: "No",
};

export default function MyBetsPage() {
  const { address, isConnected } = useAccount();
  const [claimMarket, setClaimMarket] = useState<string | null>(null);

  // Get all markets
  const { data: allMarkets, isLoading: marketsLoading } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getAllMarkets",
    query: {
      enabled: !!DELAY_MARKET_CONTRACT_ADDRESS && DELAY_MARKET_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && !!address,
      refetchInterval: 10000,
    },
  });

  // Get user's bets for each market
  const userBets = useMemo(() => {
    if (!allMarkets || !address || !Array.isArray(allMarkets)) return [];

    const bets: UserBet[] = [];

    allMarkets.forEach((market: any) => {
      const marketId = market.marketId as string;
      const marketData = market.marketData as MarketData;

      // Check all outcomes and positions for user bets
      for (let outcome = 1; outcome <= 3; outcome++) {
        for (let position = 0; position <= 1; position++) {
          // We need to check if user has shares in this outcome/position
          // Since we don't have a direct getUserBets function, we'll need to check shares
          // For now, let's create a placeholder that shows all markets where user might have bets
          // In a real implementation, you'd need a contract function to get user's specific bets
        }
      }
    });

    return bets;
  }, [allMarkets, address]);

  // For now, let's show a message that this feature needs contract support
  // We'll create a UI that shows markets where user can potentially have bets

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-4">My Bets</h1>
            <p className="text-slate-400 mb-8">Connect your wallet to view your bets</p>
            <ConnectButton />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Bets</h1>
          <p className="text-slate-400">View your active bets and track your winnings</p>
        </div>

        <ChainWarning />

        {marketsLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 mt-4">Loading your bets...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allMarkets && Array.isArray(allMarkets) && allMarkets.length > 0 ? (
              <MarketsWithUserBets
                markets={allMarkets}
                userAddress={address!}
                onClaim={(marketId) => setClaimMarket(marketId)}
              />
            ) : (
              <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700">
                <p className="text-slate-400 text-lg">No markets found</p>
                <Link
                  href="/markets"
                  className="text-blue-400 hover:text-blue-300 mt-4 inline-block"
                >
                  Browse markets →
                </Link>
              </div>
            )}
          </div>
        )}

        {claimMarket && (
          <ClaimWinningsDialog
            marketId={claimMarket}
            onClose={() => setClaimMarket(null)}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}

function MarketsWithUserBets({
  markets,
  userAddress,
  onClaim,
}: {
  markets: any[];
  userAddress: `0x${string}`;
  onClaim: (marketId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {markets.map((market: any, index: number) => {
        // getAllMarkets returns markets directly with properties, not nested in marketData
        const marketId = market.marketId || "";
        const marketData: MarketData = {
          flightNumber: market.flightNumber || "",
          airlineCode: market.airlineCode || "",
          originCode: market.originCode || "",
          destinationCode: market.destinationCode || "",
          scheduledDeparture: market.scheduledDeparture 
            ? (typeof market.scheduledDeparture === 'string' 
                ? BigInt(market.scheduledDeparture) 
                : BigInt(String(market.scheduledDeparture)))
            : 0n,
          finalOutcome: market.finalOutcome !== undefined ? Number(market.finalOutcome) : 0,
          isOpen: (market.finalOutcome === 0 || market.finalOutcome === undefined),
          totalYesShares: 0n,
          totalNoShares: 0n,
        };
        
        return (
          <UserBetCard
            key={marketId || index}
            marketId={marketId}
            marketData={marketData}
            userAddress={userAddress}
            onClaim={onClaim}
          />
        );
      })}
    </div>
  );
}

function UserBetCard({
  marketId,
  marketData,
  userAddress,
  onClaim,
}: {
  marketId: string;
  marketData: MarketData;
  userAddress: `0x${string}`;
  onClaim: (marketId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  // Get user's bets for this market using getUserBet
  const marketIdBytes = marketId.startsWith("0x") ? marketId as `0x${string}` : `0x${marketId}` as `0x${string}`;
  
  const { data: userYesShares1 } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getUserBet",
    args: [marketIdBytes, userAddress, 1, 0], // outcome 1, position 0 (Yes)
    query: {
      enabled: !!marketId && !!userAddress,
    },
  });

  const { data: userNoShares1 } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getUserBet",
    args: [marketIdBytes, userAddress, 1, 1], // outcome 1, position 1 (No)
    query: {
      enabled: !!marketId && !!userAddress,
    },
  });

  const { data: userYesShares2 } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getUserBet",
    args: [marketIdBytes, userAddress, 2, 0], // outcome 2, position 0 (Yes)
    query: {
      enabled: !!marketId && !!userAddress,
    },
  });

  const { data: userNoShares2 } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getUserBet",
    args: [marketIdBytes, userAddress, 2, 1], // outcome 2, position 1 (No)
    query: {
      enabled: !!marketId && !!userAddress,
    },
  });

  const { data: userYesShares3 } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getUserBet",
    args: [marketIdBytes, userAddress, 3, 0], // outcome 3, position 0 (Yes)
    query: {
      enabled: !!marketId && !!userAddress,
    },
  });

  const { data: userNoShares3 } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getUserBet",
    args: [marketIdBytes, userAddress, 3, 1], // outcome 3, position 1 (No)
    query: {
      enabled: !!marketId && !!userAddress,
    },
  });

  // Collect all user bets
  const userBets: Array<{
    outcome: number;
    position: number;
    shares: bigint;
  }> = [];

  if (userYesShares1 && userYesShares1 > 0n) {
    userBets.push({ outcome: 1, position: 0, shares: userYesShares1 as bigint });
  }
  if (userNoShares1 && userNoShares1 > 0n) {
    userBets.push({ outcome: 1, position: 1, shares: userNoShares1 as bigint });
  }
  if (userYesShares2 && userYesShares2 > 0n) {
    userBets.push({ outcome: 2, position: 0, shares: userYesShares2 as bigint });
  }
  if (userNoShares2 && userNoShares2 > 0n) {
    userBets.push({ outcome: 2, position: 1, shares: userNoShares2 as bigint });
  }
  if (userYesShares3 && userYesShares3 > 0n) {
    userBets.push({ outcome: 3, position: 0, shares: userYesShares3 as bigint });
  }
  if (userNoShares3 && userNoShares3 > 0n) {
    userBets.push({ outcome: 3, position: 1, shares: userNoShares3 as bigint });
  }

  // If no bets, don't show this card
  if (userBets.length === 0) return null;

  // Handle scheduledDeparture - it might be a string timestamp or bigint
  let scheduledDate: Date;
  try {
    if (typeof marketData.scheduledDeparture === 'string') {
      // Try parsing as ISO string first
      scheduledDate = new Date(marketData.scheduledDeparture);
      if (isNaN(scheduledDate.getTime())) {
        // If that fails, try as Unix timestamp
        scheduledDate = new Date(Number(marketData.scheduledDeparture) * 1000);
      }
    } else {
      scheduledDate = new Date(Number(marketData.scheduledDeparture) * 1000);
    }
  } catch {
    scheduledDate = new Date();
  }
  
  const isResolved = marketData.finalOutcome !== 0 && marketData.finalOutcome !== undefined;
  const isOpen = !isResolved;

  // Calculate win/loss for each bet
  const betsWithStatus = userBets.map((bet) => {
    let isWinning = false;
    let canWin = false;

    if (isResolved) {
      // Market is resolved
      if (bet.outcome === marketData.finalOutcome && bet.position === 0) {
        // User bet YES on the winning outcome
        isWinning = true;
      } else if (bet.outcome !== marketData.finalOutcome && bet.position === 1) {
        // User bet NO on a losing outcome
        isWinning = true;
      }
    } else {
      // Market is still open
      canWin = true;
    }

    return {
      ...bet,
      isWinning,
      canWin,
    };
  });

  const hasWinningBets = betsWithStatus.some((bet) => bet.isWinning);
  const canClaimWinnings = isResolved && hasWinningBets;

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-white">
                {marketData.airlineCode} {marketData.flightNumber}
              </h3>
              <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-700 text-slate-300">
                {marketData.originCode} → {marketData.destinationCode}
              </span>
              {isResolved ? (
                <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/50">
                  Resolved
                </span>
              ) : (
                <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/50">
                  Active
                </span>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-400">
                Scheduled: {scheduledDate.toLocaleString()}
              </p>
              {/* Result Date */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">📅 Result Date:</span>
                <span className="text-xs font-semibold text-cyan-400">
                  {isResolved 
                    ? `Resolved on ${scheduledDate.toLocaleDateString()}`
                    : scheduledDate.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })
                  }
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-400">Your Bets</p>
              <p className="text-lg font-bold text-white">{userBets.length}</p>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-slate-700 p-4 space-y-4">
          {/* Market Status */}
          <div className="bg-slate-700/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Market Status:</span>
              <span
                className={`text-sm font-semibold ${
                  isResolved
                    ? "text-purple-300"
                    : isOpen
                    ? "text-green-300"
                    : "text-yellow-300"
                }`}
              >
                {isResolved
                  ? `Resolved: ${outcomeNames[marketData.finalOutcome]}`
                  : isOpen
                  ? "Open for Betting"
                  : "Closed"}
              </span>
            </div>
            {/* Result Date Info */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-600">
              <span className="text-xs text-slate-400">📅 Result Date:</span>
              <span className="text-xs font-semibold text-cyan-400">
                {isResolved 
                  ? `Resolved on ${scheduledDate.toLocaleDateString()}`
                  : scheduledDate.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })
                }
              </span>
            </div>
            {isResolved && (
              <p className="text-xs text-slate-400 pt-2 border-t border-slate-600">
                Final Outcome: {outcomeNames[marketData.finalOutcome]}
              </p>
            )}
            {!isResolved && (
              <p className="text-xs text-slate-500 pt-1">
                ⏳ Market will resolve after flight departure
              </p>
            )}
          </div>

          {/* User Bets */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-300">Your Bets:</h4>
            {betsWithStatus.map((bet, index) => (
              <div
                key={index}
                className={`bg-slate-700/30 rounded-lg p-3 border ${
                  bet.isWinning
                    ? "border-green-500/50 bg-green-500/10"
                    : bet.canWin
                    ? "border-blue-500/50 bg-blue-500/10"
                    : "border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        bet.position === 0
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {positionNames[bet.position]} on {outcomeNames[bet.outcome]}
                    </span>
                    {bet.isWinning && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/50">
                        🎉 Winner!
                      </span>
                    )}
                    {bet.canWin && !isResolved && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/50">
                        Pending
                      </span>
                    )}
                    {!bet.isWinning && !bet.canWin && isResolved && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/50">
                        Lost
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300">
                      {formatEther(bet.shares)} shares
                    </p>
                  </div>
                </div>
                {bet.isWinning && (
                  <p className="text-xs text-green-300 mt-1">
                    ✅ You won! Claim your winnings below.
                  </p>
                )}
                {bet.canWin && !isResolved && (
                  <p className="text-xs text-blue-300 mt-1">
                    ⏳ Waiting for market resolution...
                  </p>
                )}
                {!bet.isWinning && !bet.canWin && isResolved && (
                  <p className="text-xs text-red-300 mt-1">
                    ❌ This bet did not win.
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Claim Button */}
          {canClaimWinnings && (
            <button
              onClick={() => onClaim(marketId)}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all"
            >
              🎉 Claim Winnings
            </button>
          )}
        </div>
      )}
    </div>
  );
}

