"use client";

import { useAccount, useReadContract } from "wagmi";
import { DELAY_MARKET_CONTRACT_ADDRESS, DELAY_MARKET_ABI } from "@/lib/contract";
import { ConnectButton } from "@/components/connect-button";
import { ChainWarning } from "@/components/chain-warning";
import { CreateMarketDialog } from "@/components/create-market-dialog";
import { BetDialog } from "@/components/bet-dialog";
import { ClaimWinningsDialog } from "@/components/claim-winnings-dialog";
import { ResolveMarketButton } from "@/components/resolve-market-button";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { formatEther } from "viem";

// My Bets Section Component
function MyBetsSection({ markets }: { markets: any }) {
  const { address } = useAccount();
  const [expandedMarkets, setExpandedMarkets] = useState<Set<string>>(new Set());
  const [claimMarket, setClaimMarket] = useState<string | null>(null);

  // Get all markets where user has bets - ALWAYS call hooks, conditionally render
  const marketsWithBets = useMemo(() => {
    if (!address || !markets || !Array.isArray(markets)) return [];
    const marketsWithUserBets: any[] = [];
    
    markets.forEach((market: any) => {
      const marketId = market.marketId || "";
      const marketIdBytes = marketId.startsWith("0x") ? marketId : `0x${marketId}`;
      
      marketsWithUserBets.push({
        ...market,
        marketIdBytes,
      });
    });
    
    return marketsWithUserBets;
  }, [markets, address]);

  // Conditionally render AFTER all hooks are called
  if (!address || !markets || !Array.isArray(markets) || marketsWithBets.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl p-6 border border-blue-500/30">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🎯</span>
          My Active Bets
        </h2>
        <p className="text-slate-300 mb-4">View your positions and track your winnings</p>
        
        <div className="space-y-3">
          {marketsWithBets.map((market: any) => (
            <UserBetCard
              key={market.marketId}
              market={market}
              userAddress={address}
              expanded={expandedMarkets.has(market.marketId)}
              onToggle={() => {
                const newExpanded = new Set(expandedMarkets);
                if (newExpanded.has(market.marketId)) {
                  newExpanded.delete(market.marketId);
                } else {
                  newExpanded.add(market.marketId);
                }
                setExpandedMarkets(newExpanded);
              }}
              onClaim={(marketId) => setClaimMarket(marketId)}
            />
          ))}
        </div>
      </div>

      {claimMarket && (
        <ClaimWinningsDialog
          marketId={claimMarket}
          onClose={() => setClaimMarket(null)}
        />
      )}
    </div>
  );
}

// User Bet Card Component
function UserBetCard({
  market,
  userAddress,
  expanded,
  onToggle,
  onClaim,
}: {
  market: any;
  userAddress: `0x${string}`;
  expanded: boolean;
  onToggle: () => void;
  onClaim: (marketId: string) => void;
}) {
  const marketIdBytes = market.marketIdBytes as `0x${string}`;
  
  // Get user's bets for all outcomes and positions
  const { data: userYesShares1 } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getUserBet",
    args: [marketIdBytes, userAddress, 1, 0],
    query: { enabled: !!marketIdBytes && !!userAddress },
  });
  
  const { data: userNoShares1 } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getUserBet",
    args: [marketIdBytes, userAddress, 1, 1],
    query: { enabled: !!marketIdBytes && !!userAddress },
  });
  
  const { data: userYesShares2 } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getUserBet",
    args: [marketIdBytes, userAddress, 2, 0],
    query: { enabled: !!marketIdBytes && !!userAddress },
  });
  
  const { data: userNoShares2 } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getUserBet",
    args: [marketIdBytes, userAddress, 2, 1],
    query: { enabled: !!marketIdBytes && !!userAddress },
  });
  
  const { data: userYesShares3 } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getUserBet",
    args: [marketIdBytes, userAddress, 3, 0],
    query: { enabled: !!marketIdBytes && !!userAddress },
  });
  
  const { data: userNoShares3 } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getUserBet",
    args: [marketIdBytes, userAddress, 3, 1],
    query: { enabled: !!marketIdBytes && !!userAddress },
  });

  // Collect all user bets
  const userBets: Array<{ outcome: number; position: number; shares: bigint }> = [];
  
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

  // Don't show if no bets
  if (userBets.length === 0) return null;

  const outcomeNames: Record<number, string> = {
    1: "On Time",
    2: "30+ min delay",
    3: "120+ min delay",
  };
  
  const positionNames: Record<number, string> = {
    0: "Yes",
    1: "No",
  };

  const isResolved = market.finalOutcome !== 0;
  const scheduledDate = market.scheduledDeparture 
    ? (typeof market.scheduledDeparture === 'string'
        ? new Date(market.scheduledDeparture)
        : new Date(Number(market.scheduledDeparture) * 1000))
    : new Date();

  // Calculate win/loss
  const betsWithStatus = userBets.map((bet) => {
    let isWinning = false;
    if (isResolved) {
      if (bet.outcome === market.finalOutcome && bet.position === 0) {
        isWinning = true;
      } else if (bet.outcome !== market.finalOutcome && bet.position === 1) {
        isWinning = true;
      }
    }
    return { ...bet, isWinning };
  });

  const hasWinningBets = betsWithStatus.some((bet) => bet.isWinning);
  const canClaim = isResolved && hasWinningBets;

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-white">
                {market.airlineCode} {market.flightNumber}
              </span>
              <span className="px-2 py-1 rounded text-xs bg-slate-700 text-slate-300">
                {market.originCode} → {market.destinationCode}
              </span>
              {isResolved ? (
                <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300 border border-purple-500/50">
                  Resolved
                </span>
              ) : (
                <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-300 border border-green-500/50">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {userBets.length} position{userBets.length > 1 ? 's' : ''} • Result: {scheduledDate.toLocaleString()}
            </p>
          </div>
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-700 p-4 space-y-3">
          {betsWithStatus.map((bet, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                bet.isWinning
                  ? "bg-green-500/10 border-green-500/50"
                  : "bg-slate-700/30 border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    bet.position === 0 ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
                  }`}>
                    {positionNames[bet.position]} on {outcomeNames[bet.outcome]}
                  </span>
                  {bet.isWinning && (
                    <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-300 border border-green-500/50">
                      🎉 Winner!
                    </span>
                  )}
                </div>
                <span className="text-sm text-white font-semibold">
                  {formatEther(bet.shares)} shares
                </span>
              </div>
            </div>
          ))}
          
          {canClaim && (
            <button
              onClick={() => onClaim(market.marketId)}
              className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all"
            >
              🎉 Claim Winnings
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function MarketsPage() {
  const { isConnected } = useAccount();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [claimMarket, setClaimMarket] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: markets, isLoading, error, refetch } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getAllMarkets",
    query: {
      // Enable even if not connected - markets are public data
      enabled: DELAY_MARKET_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 10000,
      retry: false,
    },
  });

  useEffect(() => {
    // Auto-refresh markets every 10 seconds (markets are public data)
    const interval = setInterval(() => {
      if (DELAY_MARKET_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
        refetch();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!markets || !Array.isArray(markets)) {
      return { activePools: 0, totalLiquidity: 0, coverageDemand: 0, avgRisk: 0 };
    }

    // Count all markets that are still pending (not resolved)
    const activePools = markets.filter((m: any) => {
      // Market is active if finalOutcome is 0 (Pending)
      return m.finalOutcome === 0 || m.finalOutcome === undefined;
    }).length;

    let totalLiquidity = 0;
    markets.forEach((m: any) => {
      const onTime = Number(m.onTime.yesShares) + Number(m.onTime.noShares);
      const delayed30 = Number(m.delayedShort.yesShares) + Number(m.delayedShort.noShares);
      const delayed120 = Number(m.delayedLong.yesShares) + Number(m.delayedLong.noShares);
      totalLiquidity += (onTime + delayed30 + delayed120) / 1e18;
    });

    const coverageDemand = totalLiquidity;
    const avgRisk = markets.length > 0 ? 40.97 : 0;

    return { activePools, totalLiquidity, coverageDemand, avgRisk };
  }, [markets]);

  // Filter markets
  const filteredMarkets = useMemo(() => {
    if (!markets || !Array.isArray(markets)) return [];
    
    let filtered = markets;
    
    if (filter !== "all") {
      filtered = markets.filter((m: any) => {
        if (filter === "on-time") return m.finalOutcome === 1;
        if (filter === "delayed-30") return m.finalOutcome === 2;
        if (filter === "delayed-120") return m.finalOutcome === 3;
        return true;
      });
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((m: any) => 
        m.flightNumber.toLowerCase().includes(query) ||
        m.originCode.toLowerCase().includes(query) ||
        m.destinationCode.toLowerCase().includes(query) ||
        m.airlineCode.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [markets, filter, searchQuery]);

  const calculateLiquidity = (market: any) => {
    const onTime = Number(market.onTime.yesShares) + Number(market.onTime.noShares);
    const delayed30 = Number(market.delayedShort.yesShares) + Number(market.delayedShort.noShares);
    const delayed120 = Number(market.delayedLong.yesShares) + Number(market.delayedLong.noShares);
    return (onTime + delayed30 + delayed120) / 1e18;
  };

  const getOutcomeName = (outcome: number) => {
    if (outcome === 1) return "On Time";
    if (outcome === 2) return "Delayed 30+";
    if (outcome === 3) return "Delayed 120+";
    return "Pending";
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">✈️</div>
          <h1 className="text-5xl font-bold text-white mb-4">Flight Markets</h1>
          <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
            Bet on flight delays. Pick a flight and start trading!
          </p>
          {/* $DELAY Token Info */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl p-4 border border-blue-500/30 max-w-2xl mx-auto mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">💰</span>
              <p className="text-lg font-semibold text-white">Betting with $DELAY Token</p>
            </div>
            <p className="text-sm text-gray-300">
              All bets and winnings use our custom ERC-20 token: <span className="font-bold text-cyan-400">$DELAY</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              You need $DELAY tokens to place bets. Get tokens from the faucet or mint them if you're the contract owner.
            </p>
          </div>
          {isConnected && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg"
            >
              <span className="text-xl">+</span>
              Create New Market
            </button>
          )}
        </div>

        <ChainWarning />

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="text-3xl mb-2">✈️</div>
            <p className="text-3xl font-bold text-white mb-1">{metrics.activePools}</p>
            <p className="text-sm text-gray-400">Pools active within next 48h</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="text-3xl mb-2">💧</div>
            <p className="text-3xl font-bold text-white mb-1">${metrics.totalLiquidity.toFixed(0)}</p>
            <p className="text-sm text-gray-400">Total liquidity locked in DELAY</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="text-3xl mb-2">🛡️</div>
            <p className="text-3xl font-bold text-white mb-1">${metrics.coverageDemand.toFixed(0)}</p>
            <p className="text-sm text-gray-400">Coverage demand policy requests</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="text-3xl mb-2">⚖️</div>
            <p className="text-3xl font-bold text-white mb-1">{metrics.avgRisk.toFixed(2)}%</p>
            <p className="text-sm text-gray-400">Avg. risk quote implied probability</p>
          </div>
        </div>

        {/* My Bets Section - Only show if connected */}
        {isConnected && (
          <MyBetsSection markets={markets} />
        )}

        {/* Search and Filter Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-2">Search Flights</h2>
          <p className="text-sm text-gray-400 mb-4">Filter by outcome type or search for specific flights</p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex flex-wrap gap-2 flex-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                All triggers
              </button>
              <button
                onClick={() => setFilter("on-time")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "on-time"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                On Time
              </button>
              <button
                onClick={() => setFilter("delayed-30")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "delayed-30"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                30+ min delay
              </button>
              <button
                onClick={() => setFilter("delayed-120")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "delayed-120"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                120+ min delay
              </button>
            </div>
            <input
              type="text"
              placeholder="Search flight, route, or airline"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none flex-1 max-w-md"
            />
          </div>
        </div>

        {/* Markets List */}
        {DELAY_MARKET_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Contract Not Deployed</h2>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              The DelayMarket contract address is not set. Please deploy the contract first and set the <code className="bg-slate-700 px-2 py-1 rounded">NEXT_PUBLIC_CONTRACT_ADDRESS</code> environment variable.
            </p>
            <div className="bg-slate-800/50 rounded-lg p-6 max-w-2xl mx-auto text-left">
              <p className="text-white font-semibold mb-2">Quick Setup:</p>
              <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                <li>Deploy the contract: <code className="bg-slate-700 px-2 py-1 rounded">cd apps/contracts && forge script script/DeployDelayMarket.s.sol --rpc-url https://testnet-rpc.monad.xyz --broadcast</code></li>
                <li>Create <code className="bg-slate-700 px-2 py-1 rounded">apps/web/.env.local</code> with: <code className="bg-slate-700 px-2 py-1 rounded">NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_ADDRESS</code></li>
                <li>Restart the frontend server</li>
              </ol>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading Markets</h2>
            <p className="text-gray-400 mb-2">
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Contract Address: {DELAY_MARKET_CONTRACT_ADDRESS}
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading markets...</p>
          </div>
        ) : filteredMarkets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarkets.map((market: any, index: number) => {
              const liquidity = calculateLiquidity(market);
              const marketIdBytes = market.marketId.startsWith("0x") 
                ? market.marketId 
                : `0x${market.marketId}`;

              return (
                <div
                  key={index}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all"
                >
                  {/* Flight Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-semibold">
                          {market.airlineCode}
                        </span>
                        <span className="text-2xl font-bold text-white">{market.flightNumber}</span>
                      </div>
                      {/* Result Date / Settlement Date */}
                      <div className="mt-2 p-2 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">📅 Result Date:</span>
                          <span className="text-sm font-semibold text-cyan-400">
                            {(() => {
                              try {
                                const scheduledTime = market.scheduledDeparture 
                                  ? (typeof market.scheduledDeparture === 'string' 
                                      ? new Date(market.scheduledDeparture) 
                                      : new Date(Number(market.scheduledDeparture) * 1000))
                                  : null;
                                if (scheduledTime && !isNaN(scheduledTime.getTime())) {
                                  // Show date and time
                                  return scheduledTime.toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  });
                                }
                                return "TBD";
                              } catch {
                                return "TBD";
                              }
                            })()}
                          </span>
                        </div>
                        {market.finalOutcome === 0 && (
                          <p className="text-xs text-slate-500 mt-1">
                            Market resolves after flight departure
                          </p>
                        )}
                      </div>
                      <p className="text-gray-300 font-medium">
                        {market.originCode} → {market.destinationCode}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(market.scheduledDeparture).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400 mb-1">Liquidity</p>
                      <p className="text-lg font-bold text-white">${liquidity.toFixed(0)}</p>
                    </div>
                  </div>

                  {/* Resolution Status */}
                  {market.finalOutcome !== 0 && (
                    <div className="mb-4">
                      <div className="inline-block px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-lg">
                        <p className="text-sm font-semibold text-green-400">
                          Resolved {getOutcomeName(market.finalOutcome)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Outcome Cards */}
                  <div className="space-y-3 mb-4">
                    {/* On Time */}
                    <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-semibold text-white">On Time</p>
                        <span className="text-xs text-gray-400">{market.finalOutcome !== 0 ? "Resolved" : "Active"}</span>
                      </div>
                      {Number(market.onTime.yesShares) + Number(market.onTime.noShares) > 0 ? (
                        <>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-green-400">
                              YES {Number(market.onTime.yesPrice) / 1e16}%
                            </span>
                            <span className="text-gray-400">
                              NO {Number(market.onTime.noPrice) / 1e16}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>YES: {Math.round(Number(market.onTime.yesShares) / 1e18)}</span>
                            <span>NO: {Math.round(Number(market.onTime.noShares) / 1e18)}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Total: {Math.round((Number(market.onTime.yesShares) + Number(market.onTime.noShares)) / 1e18)} shares
                          </p>
                        </>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-xs text-gray-500 mb-2">No positions yet</p>
                          {isConnected && market.finalOutcome === 0 && (
                            <button
                              onClick={() => setSelectedMarket(marketIdBytes)}
                              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Place first order
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 30+ min delay */}
                    <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-semibold text-white">30+ min delay</p>
                        <span className="text-xs text-gray-400">{market.finalOutcome !== 0 ? "Resolved" : "Active"}</span>
                      </div>
                      {Number(market.delayedShort.yesShares) + Number(market.delayedShort.noShares) > 0 ? (
                        <>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-green-400">
                              YES {Number(market.delayedShort.yesPrice) / 1e16}%
                            </span>
                            <span className="text-gray-400">
                              NO {Number(market.delayedShort.noPrice) / 1e16}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>YES: {Math.round(Number(market.delayedShort.yesShares) / 1e18)}</span>
                            <span>NO: {Math.round(Number(market.delayedShort.noShares) / 1e18)}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Total: {Math.round((Number(market.delayedShort.yesShares) + Number(market.delayedShort.noShares)) / 1e18)} shares
                          </p>
                        </>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-xs text-gray-500 mb-2">No positions yet</p>
                          {isConnected && market.finalOutcome === 0 && (
                            <button
                              onClick={() => setSelectedMarket(marketIdBytes)}
                              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Place first order
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 120+ min delay */}
                    <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-semibold text-white">120+ min delay</p>
                        <span className="text-xs text-gray-400">{market.finalOutcome !== 0 ? "Resolved" : "Active"}</span>
                      </div>
                      {Number(market.delayedLong.yesShares) + Number(market.delayedLong.noShares) > 0 ? (
                        <>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-green-400">
                              YES {Number(market.delayedLong.yesPrice) / 1e16}%
                            </span>
                            <span className="text-gray-400">
                              NO {Number(market.delayedLong.noPrice) / 1e16}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>YES: {Math.round(Number(market.delayedLong.yesShares) / 1e18)}</span>
                            <span>NO: {Math.round(Number(market.delayedLong.noShares) / 1e18)}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Total: {Math.round((Number(market.delayedLong.yesShares) + Number(market.delayedLong.noShares)) / 1e18)} shares
                          </p>
                        </>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-xs text-gray-500 mb-2">No positions yet</p>
                          {isConnected && market.finalOutcome === 0 && (
                            <button
                              onClick={() => setSelectedMarket(marketIdBytes)}
                              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Place first order
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 mt-4">
                    {market.finalOutcome === 0 && isConnected && (
                      <button
                        onClick={() => setSelectedMarket(marketIdBytes)}
                        className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold"
                      >
                        Place Bet
                      </button>
                    )}
                    {market.finalOutcome !== 0 && isConnected && (
                      <button
                        onClick={() => setClaimMarket(marketIdBytes)}
                        className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-cyan-600 text-white rounded-lg hover:from-green-700 hover:to-cyan-700 transition-all font-semibold"
                      >
                        Claim Winnings
                      </button>
                    )}
                    {market.finalOutcome === 0 && (
                      <ResolveMarketButton
                        marketId={marketIdBytes}
                        flightNumber={market.flightNumber}
                        originCode={market.originCode}
                        destinationCode={market.destinationCode}
                        airlineCode={market.airlineCode}
                        scheduledDeparture={market.scheduledDeparture}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            {!isConnected ? (
              <>
                <div className="text-6xl mb-4">🔌</div>
                <p className="text-white text-lg font-semibold mb-2">Connect Your Wallet</p>
                <p className="text-gray-400 text-sm mb-4">
                  Please connect your wallet to view and create markets
                </p>
                <ConnectButton />
              </>
            ) : (
              <>
                <p className="text-white text-lg font-semibold mb-2">No markets found</p>
                <p className="text-gray-400 text-sm mb-4">
                  Create the first market to get started!
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
                >
                  + Create New Market
                </button>
              </>
            )}
          </div>
        )}

        {/* Dialogs */}
        {showCreate && <CreateMarketDialog onClose={() => setShowCreate(false)} />}
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
    </div>
  );
}
