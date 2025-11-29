# Deployment Checklist - DelayDex

## ✅ Completed
- [x] Smart contracts written and tested
- [x] Frontend UI complete with markets page
- [x] Backend API with real-time flight tracking
- [x] Auto-seeding markets functionality
- [x] Wallet connection and chain switching
- [x] Betting, claiming, and resolution UI
- [x] All code pushed to GitHub

## ⏳ Remaining Tasks

### 1. Deploy Smart Contract (REQUIRED)
```bash
cd apps/contracts

# Set your private key (with MON testnet tokens)
export PRIVATE_KEY=0xYOUR_PRIVATE_KEY
export MONAD_RPC_URL=https://testnet-rpc.monad.xyz

# Deploy contract
forge script script/DeployDelayMarket.s.sol \
  --rpc-url $MONAD_RPC_URL \
  --broadcast \
  --verify

# Note the deployed contract address from output
```

### 2. Update Frontend Environment
```bash
# Edit apps/web/.env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_ADDRESS
```

### 3. Update Backend Environment
```bash
# Create apps/backend/.env
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_CHAIN_ID=10143
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
CONTRACT_ADDRESS=0xYOUR_DEPLOYED_ADDRESS
PORT=4500
```

### 4. Restart Services
```bash
# Restart frontend
cd apps/web && pnpm dev

# Restart backend  
cd apps/backend && bun run dev
```

### 5. Test Everything
- [ ] Connect wallet to Monad Testnet
- [ ] Verify markets auto-seed
- [ ] Create a new market
- [ ] Place a bet
- [ ] Resolve a market (via backend)
- [ ] Claim winnings

## 🚀 Quick Commands

**Check current status:**
```bash
# Check contract address in frontend
grep CONTRACT_ADDRESS apps/web/.env.local

# Check if backend .env exists
ls apps/backend/.env
```

**Deploy contract:**
```bash
cd apps/contracts
forge script script/DeployDelayMarket.s.sol --rpc-url https://testnet-rpc.monad.xyz --broadcast
```

**Get MON testnet tokens:**
- Visit Monad testnet faucet
- Add tokens to your wallet
