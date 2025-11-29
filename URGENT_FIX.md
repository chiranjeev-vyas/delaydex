# 🚨 URGENT FIX - Contract Address Issue

## Problem
Your frontend is still using the **OLD contract address**:
- ❌ Old: `0xE11cC24728ECDCA1ED07E2343De723F92057A868` (USDC/MockERC20)
- ✅ New: `0xB2c57af2E5cD688d782061d438b7C26adb1a160E` (DELAY token)

## ✅ IMMEDIATE FIX

### Step 1: Update `.env.local` File

Open `apps/web/.env.local` and make sure it has:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xB2c57af2E5cD688d782061d438b7C26adb1a160E
NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_MONAD_CHAIN_ID=10143
NEXT_PUBLIC_MONAD_EXPLORER_URL=https://testnet.monadexplorer.com
NEXT_PUBLIC_BACKEND_URL=http://localhost:4500
```

### Step 2: STOP and RESTART Dev Server

```bash
# Press Ctrl+C to stop the current dev server
# Then:
cd apps/web
rm -rf .next  # Clear Next.js cache
pnpm dev
```

### Step 3: Hard Refresh Browser

- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### Step 4: Verify Contract Address

1. Open browser console (F12)
2. Type: `process.env.NEXT_PUBLIC_CONTRACT_ADDRESS`
3. Should show: `0xB2c57af2E5cD688d782061d438b7C26adb1a160E`

## ⚠️ If Still Not Working

1. **Check if file exists**: `apps/web/.env.local`
2. **Check file contents**: Make sure no typos
3. **Restart terminal**: Close and reopen terminal
4. **Clear browser cache**: Clear all site data for localhost:3000

## 🔍 Verify It's Fixed

After restart, when you click "Place Bet":
- The contract address in MetaMask should be: `0xB2c57...a160E` (starts with B2c57)
- NOT: `0xE11cC...7A868` (starts with E11cC)

