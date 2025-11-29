"use client";

import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId } from "wagmi";
import { DELAY_MARKET_CONTRACT_ADDRESS, DELAY_MARKET_ABI } from "@/lib/contract";
import { monadTestnet } from "@/lib/wagmi";

export function ClaimWinningsDialog({ marketId, onClose }: { marketId: string; onClose: () => void }) {
  const chainId = useChainId();
  const marketIdBytes = marketId.startsWith("0x") ? marketId as `0x${string}` : `0x${marketId}` as `0x${string}`;

  // Get market data to check if user has winnings
  const { data: marketData } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getMarketData",
    args: [marketIdBytes],
    query: {
      enabled: !!marketId && marketId.length > 0,
    },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleClaim = () => {
    if (chainId !== monadTestnet.id) {
      alert("Please switch to Monad Testnet to claim winnings");
      return;
    }

    // CRITICAL: Force Monad Testnet
    writeContract({
      address: DELAY_MARKET_CONTRACT_ADDRESS,
      abi: DELAY_MARKET_ABI,
      functionName: "claimWinnings",
      args: [marketIdBytes],
      chainId: monadTestnet.id, // FORCE Monad Testnet - DO NOT REMOVE
    });
  };

  if (isSuccess) {
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 2000);
  }

  const canClaim = marketData && (marketData as any).finalOutcome !== 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Claim Winnings</h2>

        <div className="space-y-4">
          {!canClaim ? (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
              <p className="text-yellow-400 text-sm">
                This market hasn't been resolved yet. You can only claim winnings after the market is closed.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Market Status</p>
                <p className="text-white font-semibold">
                  {marketData && (marketData as any).finalOutcome === 1 && "On Time"}
                  {marketData && (marketData as any).finalOutcome === 2 && "Delayed Short"}
                  {marketData && (marketData as any).finalOutcome === 3 && "Delayed Long"}
                  {marketData && (marketData as any).finalOutcome === 4 && "Cancelled"}
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Claim Your Winnings</p>
                <p className="text-2xl font-bold text-green-400">
                  DELAY Tokens
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  * Amount depends on your winning positions
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClaim}
                  disabled={isPending || isConfirming}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-cyan-600 text-white rounded-lg hover:from-green-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending || isConfirming
                    ? "Claiming..."
                    : isSuccess
                    ? "Claimed!"
                    : "Claim Winnings"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

