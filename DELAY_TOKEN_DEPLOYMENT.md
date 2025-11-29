# 🪙 DELAY Token Deployment - Complete!

## ✅ Successfully Deployed

### DELAY Token Contract
- **Address**: `0xf519c7BF476715775b50e3080d965C6dBC034483`
- **Name**: DelayDex Token
- **Symbol**: DELAY
- **Decimals**: 18
- **Initial Supply**: 1,000,000 DELAY tokens

### DelayMarket Contract (with DELAY token)
- **Address**: `0xB2c57af2E5cD688d782061d438b7C26adb1a160E`
- **Payment Token**: DELAY (`0xf519c7BF476715775b50e3080d965C6dBC034483`)

## 📝 Next Steps

### 1. Update Frontend Environment
Edit `apps/web/.env.local`:
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xB2c57af2E5cD688d782061d438b7C26adb1a160E
```

### 2. Update Backend Environment
Edit `apps/backend/.env`:
```bash
CONTRACT_ADDRESS=0xB2c57af2E5cD688d782061d438b7C26adb1a160E
```

### 3. Mint DELAY Tokens to Your Wallet
```bash
cd delaydex
./mint-tokens.sh YOUR_WALLET_ADDRESS
```

Or manually:
```bash
cd apps/contracts
export PRIVATE_KEY=0xe34bb573375732771086f87bb207cd17e3c086e39d833cd885fc2276e8e149fd
export DELAY_TOKEN_ADDRESS=0xf519c7BF476715775b50e3080d965C6dBC034483
export USER_ADDRESS=YOUR_WALLET_ADDRESS
export MONAD_RPC_URL=https://testnet-rpc.monad.xyz

forge script script/MintTokensToUser.s.sol \
  --rpc-url $MONAD_RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY
```

### 4. Seed Markets (Optional)
```bash
cd apps/contracts
export PRIVATE_KEY=0xe34bb573375732771086f87bb207cd17e3c086e39d833cd885fc2276e8e149fd
export CONTRACT_ADDRESS=0xB2c57af2E5cD688d782061d438b7C26adb1a160E
export MONAD_RPC_URL=https://testnet-rpc.monad.xyz

forge script script/SeedMarkets.s.sol \
  --rpc-url $MONAD_RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY
```

## 🎯 How to Use

1. **Get DELAY Tokens**: Run the mint script above
2. **Approve Tokens**: When placing your first bet, click "Approve Tokens"
3. **Place Bets**: Use DELAY tokens to bet on flight delays
4. **Claim Winnings**: Receive DELAY tokens as winnings

## 📊 Token Details

- **Token Standard**: ERC20
- **Network**: Monad Testnet (Chain ID: 10143)
- **Explorer**: https://testnet.monadexplorer.com

## ⚠️ Important Notes

- The old contract (`0xE11cC24728ECDCA1ED07E2343De723F92057A868`) used MockERC20/USDC
- The new contract (`0xB2c57af2E5cD688d782061d438b7C26adb1a160E`) uses DELAY token
- Make sure to update both frontend and backend environment variables!

