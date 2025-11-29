"use client";

import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { monadTestnet } from "@/lib/wagmi";

export function ChainWarning() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected) return null;

  const isWrongChain = chainId !== monadTestnet.id;

  if (!isWrongChain) return null;

  return (
    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <p className="text-yellow-400 font-semibold">Wrong Network</p>
            <p className="text-yellow-300/80 text-sm">
              Please switch to Monad Testnet to use DelayDex
            </p>
          </div>
        </div>
        <button
          onClick={() => switchChain({ chainId: monadTestnet.id })}
          disabled={isPending}
          className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Switching..." : "Switch Network"}
        </button>
      </div>
    </div>
  );
}

