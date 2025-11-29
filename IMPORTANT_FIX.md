# ⚠️ IMPORTANT: Fix Base Sepolia Issue

## Problem
Your wallet is trying to send transactions to **Base Sepolia** instead of **Monad Testnet**. This is happening because:

1. Your MetaMask wallet is currently on Base Sepolia network
2. The contract address in `.env.local` might be the old one

## ✅ Solution

### Step 1: Update Contract Address
Edit `apps/web/.env.local` and make sure it has:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xB2c57af2E5cD688d782061d438b7C26adb1a160E
NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_MONAD_CHAIN_ID=10143
NEXT_PUBLIC_MONAD_EXPLORER_URL=https://testnet.monadexplorer.com
```

### Step 2: Add Monad Testnet to MetaMask

1. Open MetaMask
2. Click the network dropdown (top left)
3. Click "Add Network" or "Add a network manually"
4. Enter these details:
   - **Network Name**: Monad Testnet
   - **RPC URL**: https://testnet-rpc.monad.xyz
   - **Chain ID**: 10143
   - **Currency Symbol**: MON
   - **Block Explorer**: https://testnet.monadexplorer.com

### Step 3: Switch to Monad Testnet

1. In MetaMask, select "Monad Testnet" from the network dropdown
2. Make sure you see "Monad Testnet" at the top of MetaMask

### Step 4: Restart Frontend

```bash
cd apps/web
# Stop the dev server (Ctrl+C)
# Then restart
pnpm dev
```

### Step 5: Clear Browser Cache

1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

## 🔍 Verify

After these steps:
- MetaMask should show "Monad Testnet" at the top
- The dApp should show "Monad Testnet" with a green dot
- When you click "Place Bet", it should prompt on Monad Testnet, NOT Base Sepolia

## ❌ Old Contract Address (DO NOT USE)
- `0xE11cC24728ECDCA1ED07E2343De723F92057A868` - This is the OLD contract

## ✅ New Contract Address (USE THIS)
- `0xB2c57af2E5cD688d782061d438b7C26adb1a160E` - This is the NEW contract with DELAY token

