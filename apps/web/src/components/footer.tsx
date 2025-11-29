"use client";

import { checkBackendHealth } from "@/lib/api";
import { useEffect, useState } from "react";

export function Footer() {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    checkBackendHealth().then(setBackendOnline);
    const interval = setInterval(() => {
      checkBackendHealth().then(setBackendOnline);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-slate-900/50 border-t border-slate-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-400">
            <p>Built on <span className="text-blue-400 font-semibold">Monad Testnet</span></p>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://monad.xyz" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
              Monad
            </a>
            <a href="https://testnet.monadexplorer.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
              Explorer
            </a>
            {backendOnline !== null && (
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className={backendOnline ? 'text-green-400' : 'text-red-400'}>
                  Backend {backendOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

