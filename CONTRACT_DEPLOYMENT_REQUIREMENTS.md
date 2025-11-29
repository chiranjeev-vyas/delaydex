# Contract Deployment Requirements - DelayDex

## 📋 Checklist - Kya Chahiye

### 1. **Foundry Installation** ⚠️ (Currently Missing)
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify installation
forge --version
```

### 2. **Monad Testnet Wallet Setup**
- ✅ **Wallet Address**: Ek wallet address chahiye
- ✅ **Private Key**: Wallet ka private key (0x... format mein)
- ✅ **MON Testnet Tokens**: Gas fees ke liye MON tokens chahiye

**MON Tokens kaise mile:**
- Monad Testnet Faucet se request karo
- Ya kisi se transfer karao

### 3. **Environment Variables**
Deployment ke time yeh set karna hoga:

```bash
export PRIVATE_KEY=0xYOUR_PRIVATE_KEY
export MONAD_RPC_URL=https://testnet-rpc.monad.xyz
# Optional: Agar pehle se token deployed hai
export PAYMENT_TOKEN_ADDRESS=0xYOUR_TOKEN_ADDRESS
```

### 4. **Network Access**
- ✅ Internet connection
- ✅ Monad Testnet RPC accessible hona chahiye

## 🚀 Step-by-Step Deployment

### Step 1: Foundry Install Karo
```bash
# macOS/Linux
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify
forge --version
```

### Step 2: MON Testnet Tokens Le Lo
- Monad Discord mein faucet request karo
- Ya testnet explorer se check karo

### Step 3: Private Key Ready Karo
- Wallet se private key export karo
- **⚠️ IMPORTANT**: Private key ko secure rakho, kisi ko share mat karo

### Step 4: Deploy Contract
```bash
cd apps/contracts

# Environment variables set karo
export PRIVATE_KEY=0xYOUR_PRIVATE_KEY
export MONAD_RPC_URL=https://testnet-rpc.monad.xyz

# Deploy
forge script script/DeployDelayMarket.s.sol \
  --rpc-url $MONAD_RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY

# Output mein contract address milega
```

### Step 5: Contract Address Note Karo
Deployment ke baad output mein yeh dikhega:
```
DelayMarket deployed at: 0x...
Payment token (USDC): 0x...
```

### Step 6: Update Environment Files
- Frontend: `apps/web/.env.local` mein `NEXT_PUBLIC_CONTRACT_ADDRESS` update karo
- Backend: `apps/backend/.env` create karo with contract address

## 📝 Quick Reference

**Minimum Requirements:**
1. ✅ Foundry installed
2. ✅ Private key (with MON tokens)
3. ✅ Internet connection
4. ✅ Monad testnet RPC access

**Optional:**
- Existing payment token address (agar nahi hai to automatically deploy hoga)

## ⚠️ Important Notes

1. **Private Key Security**: 
   - Private key ko kabhi bhi commit mat karo
   - `.env` files ko `.gitignore` mein rakho

2. **Gas Fees**:
   - Deployment ke liye MON tokens chahiye
   - Estimated: ~0.01-0.1 MON (testnet)

3. **Network**:
   - Monad Testnet RPC: `https://testnet-rpc.monad.xyz`
   - Chain ID: `10143`

## 🔍 Current Status Check

```bash
# Foundry check
forge --version

# Wallet balance check (after connecting)
# MetaMask ya wallet mein Monad Testnet add karo
# Check balance
```

## 🆘 Troubleshooting

**Issue**: Foundry not found
- **Solution**: `foundryup` run karo

**Issue**: Insufficient funds
- **Solution**: MON testnet tokens request karo

**Issue**: RPC connection failed
- **Solution**: Internet check karo, RPC URL verify karo

