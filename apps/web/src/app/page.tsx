"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { ConnectButton } from "@/components/connect-button";
import { ChainWarning } from "@/components/chain-warning";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <section className="flex items-center justify-center min-h-screen py-12 px-4">
        <div className="w-full max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="text-6xl mb-4">✈️</div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Welcome to DelayDex
            </h1>
            <p className="text-xl text-gray-300 max-w-xl mx-auto">
              Decentralized prediction markets for flight delays. Bet on flight outcomes and turn travel uncertainty into opportunity.
            </p>
          </div>

          <ChainWarning />

          {!isConnected && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-gray-400 mb-6">Connect to Monad Testnet to get started</p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>
          )}

          {isConnected && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-700">
              <div className="flex items-center justify-center gap-2 text-sm text-green-400 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                Wallet Connected
              </div>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/markets"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
            >
              View Markets
            </Link>
            <Link
              href="/markets?create=true"
              className="px-8 py-4 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-all border border-slate-600"
            >
              Create Market
            </Link>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">Live Markets</h3>
              <p className="text-gray-300">Bet on real flights with live odds</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-xl font-bold text-white mb-2">Real-Time</h3>
              <p className="text-gray-300">Prices update based on market demand</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-white mb-2">Win Big</h3>
              <p className="text-gray-300">Predict correctly and earn rewards</p>
            </div>
          </div>

          <div className="text-sm text-gray-400 mt-8">
            <p>Built on Monad Testnet</p>
          </div>
        </div>
      </section>
    </main>
  );
}

