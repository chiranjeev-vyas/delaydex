# 🚀 Quick Deploy Guide - DelayDex

## Abhi Kya Chahiye (Right Now)

### ✅ Already Have:
- ✅ Contract code ready
- ✅ Deployment script ready
- ✅ Frontend & Backend running

### ❌ Need to Install:
1. **Foundry** (Smart contract deployment tool)
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

### ❌ Need to Get:
1. **Private Key** - Apne wallet ka private key
2. **MON Testnet Tokens** - Gas fees ke liye
   - Monad Discord/Telegram se faucet request karo
   - Ya kisi se transfer karao

## 🎯 3 Simple Steps

### Step 1: Foundry Install (5 minutes)
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
forge --version  # Verify
```

### Step 2: Get MON Tokens (10-30 minutes)
- Monad testnet faucet se request
- Ya team member se transfer

### Step 3: Deploy (2 minutes)
```bash
cd apps/contracts
export PRIVATE_KEY=0xYOUR_KEY
forge script script/DeployDelayMarket.s.sol \
  --rpc-url https://testnet-rpc.monad.xyz \
  --broadcast \
  --private-key $PRIVATE_KEY
```

## 📝 After Deployment

1. Contract address copy karo (output se)
2. `apps/web/.env.local` mein update karo
3. `apps/backend/.env` create karo
4. Restart services

## ⏱️ Total Time: ~20-40 minutes

- Foundry install: 5 min
- MON tokens: 10-30 min (faucet wait)
- Deploy: 2 min
- Setup: 3 min

