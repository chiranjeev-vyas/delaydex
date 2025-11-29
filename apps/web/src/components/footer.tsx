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
    <footer className="bg-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            <p>Built on <a href="https://monad.xyz" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 transition-colors font-medium">Monad Testnet</a></p>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://testnet.monadexplorer.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
              Monad Explorer
            </a>
            {backendOnline !== null && (
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2.5 h-2.5 rounded-full ${backendOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={backendOnline ? 'text-green-500 font-medium' : 'text-red-500'}>
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

