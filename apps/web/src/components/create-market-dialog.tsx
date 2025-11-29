"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { DELAY_MARKET_CONTRACT_ADDRESS, DELAY_MARKET_ABI } from "@/lib/contract";

export function CreateMarketDialog({ onClose }: { onClose: () => void }) {
  const [flightNumber, setFlightNumber] = useState("");
  const [originCode, setOriginCode] = useState("");
  const [destinationCode, setDestinationCode] = useState("");
  const [airlineCode, setAirlineCode] = useState("");
  const [scheduledDeparture, setScheduledDeparture] = useState("");

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightNumber || !originCode || !destinationCode || !airlineCode || !scheduledDeparture) {
      alert("Please fill all fields");
      return;
    }

    writeContract({
      address: DELAY_MARKET_CONTRACT_ADDRESS,
      abi: DELAY_MARKET_ABI,
      functionName: "openMarket",
      args: [flightNumber, originCode, destinationCode, airlineCode, scheduledDeparture],
    });
  };

  if (isSuccess) {
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 2000);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Market</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Flight Number
            </label>
            <input
              type="text"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
              placeholder="AA100"
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Origin Code
              </label>
              <input
                type="text"
                value={originCode}
                onChange={(e) => setOriginCode(e.target.value.toUpperCase())}
                placeholder="JFK"
                maxLength={3}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Destination Code
              </label>
              <input
                type="text"
                value={destinationCode}
                onChange={(e) => setDestinationCode(e.target.value.toUpperCase())}
                placeholder="LAX"
                maxLength={3}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Airline Code
            </label>
            <input
              type="text"
              value={airlineCode}
              onChange={(e) => setAirlineCode(e.target.value.toUpperCase())}
              placeholder="AA"
              maxLength={2}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Scheduled Departure
            </label>
            <input
              type="datetime-local"
              value={scheduledDeparture}
              onChange={(e) => setScheduledDeparture(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              required
            />
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
              type="submit"
              disabled={isPending || isConfirming}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending || isConfirming
                ? "Creating..."
                : isSuccess
                ? "Created!"
                : "Create Market"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

