"use client";

import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import { monadTestnet } from "@/lib/wagmi";
import { useState } from "react";

export function ConnectButton() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const [showDropdown, setShowDropdown] = useState(false);

  const isCorrectChain = chainId === monadTestnet.id;

  if (isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg"
        >
          <div className={`w-2 h-2 rounded-full ${isCorrectChain ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
          <span className="text-sm">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            ></div>
            <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-xl border border-slate-700 z-20">
              <div className="p-4 border-b border-slate-700">
                <p className="text-sm text-gray-400 mb-1">Connected</p>
                <p className="text-white font-mono text-sm">{address}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${isCorrectChain ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  <p className={`text-xs ${isCorrectChain ? 'text-green-400' : 'text-yellow-400'}`}>
                    {isCorrectChain ? 'Monad Testnet' : 'Wrong Network'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-3 text-left text-red-400 hover:bg-slate-700 transition-colors rounded-b-xl"
              >
                Disconnect Wallet
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  const availableConnectors = connectors.filter(
    (c) => c.id === "injected" || c.id === "metaMask" || c.id === "io.metamask"
  );

  return (
    <div className="flex flex-col gap-2">
      {availableConnectors.length > 0 ? (
        availableConnectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect({ connector, chainId: monadTestnet.id })}
            disabled={isPending}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Connect Wallet
              </>
            )}
          </button>
        ))
      ) : (
        <div className="px-6 py-3 bg-slate-700 text-gray-400 rounded-xl text-center">
          No wallet found. Please install MetaMask or another Web3 wallet.
        </div>
      )}
    </div>
  );
}


