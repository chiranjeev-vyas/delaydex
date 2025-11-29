"use client";

import Link from "next/link";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "./connect-button";
import { monadTestnet } from "@/lib/wagmi";

export function Navbar() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectChain = chainId === monadTestnet.id;

  return (
    <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">✈️</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                DelayDex
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                href="/markets"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Markets
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isConnected && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${isCorrectChain ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span className="text-xs text-gray-400">
                  {isCorrectChain ? 'Monad Testnet' : 'Wrong Network'}
                </span>
              </div>
            )}
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}

