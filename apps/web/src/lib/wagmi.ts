import { createConfig, http } from 'wagmi';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';
import { defineChain } from 'viem';

// Monad Testnet chain definition
export const monadTestnet = defineChain({
  id: parseInt(process.env.NEXT_PUBLIC_MONAD_CHAIN_ID || '10143'),
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: process.env.NEXT_PUBLIC_MONAD_EXPLORER_URL || 'https://testnet.monadexplorer.com',
    },
  },
  testnet: true,
});

const connectors = [
  injected(),
  metaMask(),
];

// Only add WalletConnect if project ID is provided
// Note: WalletConnect connector may have type issues with latest wagmi versions
// If you encounter errors, you can remove this block
try {
  if (process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
    connectors.push(
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
      }) as any // Type assertion to avoid compatibility issues
    );
  }
} catch (e) {
  // WalletConnect not available, continue without it
  console.warn("WalletConnect connector not available:", e);
}

export const wagmiConfig = createConfig({
  chains: [monadTestnet], // ONLY Monad Testnet - no other chains allowed
  connectors,
  transports: {
    [monadTestnet.id]: http(),
  },
  ssr: false,
  // Force default chain
  multiInjectedProviderDiscovery: false,
});

// Export helper to ensure we're always on Monad Testnet
export function ensureMonadTestnet() {
  if (typeof window !== 'undefined') {
    console.log('Ensuring Monad Testnet is selected. Chain ID:', monadTestnet.id);
  }
  return monadTestnet;
}

