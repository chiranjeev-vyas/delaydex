"use client";

import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { monadTestnet } from "@/lib/wagmi";
import Link from "next/link";

interface BetSuccessPopupProps {
  txHash: `0x${string}` | undefined;
  onClose: () => void;
  marketId: string;
  outcome: string;
  position: string;
  shares: string;
  cost: string;
}

export function BetSuccessPopup({
  txHash,
  onClose,
  marketId,
  outcome,
  position,
  shares,
  cost,
}: BetSuccessPopupProps) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (txHash) {
      setShow(true);
    }
  }, [txHash]);

  useEffect(() => {
    if (isSuccess) {
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation
  };

  const copyTxHash = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const explorerUrl = txHash
    ? `${monadTestnet.blockExplorers.default.url}/tx/${txHash}`
    : "#";

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full p-6 transform transition-all duration-300 ${
          show ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            {isConfirming ? (
              <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : isSuccess ? (
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {/* Animated rings */}
            {isSuccess && (
              <>
                <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping"></div>
                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-pulse"></div>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-white mb-2">
          {isConfirming
            ? "Processing Your Bet..."
            : isSuccess
            ? "🎉 Bet Placed Successfully!"
            : "Submitting Transaction..."}
        </h2>

        {/* Status Message */}
        <p className="text-center text-slate-300 mb-6">
          {isConfirming
            ? "Waiting for blockchain confirmation..."
            : isSuccess
            ? "Your bet has been confirmed on the blockchain!"
            : "Please wait..."}
        </p>

        {/* Bet Details Card */}
        {isSuccess && (
          <div className="bg-slate-700/50 rounded-xl p-4 mb-4 border border-slate-600">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Outcome:</span>
                <span className="text-white font-semibold">{outcome}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Position:</span>
                <span
                  className={`font-semibold ${
                    position === "Yes" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {position}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Shares:</span>
                <span className="text-white font-semibold">{shares}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Cost:</span>
                <span className="text-white font-semibold">{cost} DELAY</span>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Hash */}
        {txHash && (
          <div className="bg-slate-700/30 rounded-lg p-3 mb-4 border border-slate-600">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 mb-1">Transaction Hash:</p>
                <p className="text-sm text-slate-300 font-mono truncate">
                  {txHash}
                </p>
              </div>
              <button
                onClick={copyTxHash}
                className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm transition-colors flex-shrink-0"
                title="Copy transaction hash"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {txHash && (
            <Link
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all text-center"
            >
              View on Explorer
            </Link>
          )}
          {isSuccess && (
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          )}
        </div>

        {/* Progress indicator */}
        {isConfirming && (
          <div className="mt-4">
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse"></div>
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">
              This may take a few seconds...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

