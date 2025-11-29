"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { DELAY_MARKET_CONTRACT_ADDRESS, DELAY_MARKET_ABI } from "@/lib/contract";
import { parseEther, formatEther } from "viem";

type Outcome = 0 | 1 | 2 | 3 | 4; // Pending, OnTime, DelayedShort, DelayedLong, Cancelled
type Position = 0 | 1; // Yes, No

export function BetDialog({ marketId, onClose }: { marketId: string; onClose: () => void }) {
  const [outcome, setOutcome] = useState<Outcome>(1);
  const [position, setPosition] = useState<Position>(0);
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("0.5");

  const marketIdBytes = marketId.startsWith("0x") ? marketId as `0x${string}` : `0x${marketId}` as `0x${string}`;

  const { data: marketPrice } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getPrice",
    args: [marketIdBytes, outcome, position],
    query: {
      enabled: !!marketId && marketId.length > 0,
    },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const outcomeNames = ["", "On Time", "Delayed Short", "Delayed Long", "Cancelled"];
  const positionNames = ["Yes", "No"];

  const handleBet = () => {
    if (!shares || parseFloat(shares) <= 0) {
      alert("Please enter valid shares");
      return;
    }

    const sharesWei = parseEther(shares);
    const priceWei = marketPrice || parseEther(price);

    writeContract({
      address: DELAY_MARKET_CONTRACT_ADDRESS,
      abi: DELAY_MARKET_ABI,
      functionName: "placeBet",
      args: [marketIdBytes, outcome, position, sharesWei, priceWei],
    });
  };

  if (isSuccess) {
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 2000);
  }

  const currentPrice = marketPrice ? Number(formatEther(marketPrice)) * 100 : parseFloat(price) * 100;
  const cost = shares ? (parseFloat(shares) * currentPrice) / 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Place Bet</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Outcome
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(Number(e.target.value) as Outcome)}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value={1}>On Time</option>
              <option value={2}>Delayed Short (30-119 min)</option>
              <option value={3}>Delayed Long (120+ min)</option>
              <option value={4}>Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Position
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPosition(0)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  position === 0
                    ? "bg-green-600 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setPosition(1)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  position === 1
                    ? "bg-red-600 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                No
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Shares
            </label>
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="100"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Current Price:</span>
              <span className="text-white font-semibold">{currentPrice.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Estimated Cost:</span>
              <span className="text-white font-semibold">{cost.toFixed(4)} tokens</span>
            </div>
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
              onClick={handleBet}
              disabled={isPending || isConfirming || !shares}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending || isConfirming
                ? "Placing..."
                : isSuccess
                ? "Placed!"
                : "Place Bet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

