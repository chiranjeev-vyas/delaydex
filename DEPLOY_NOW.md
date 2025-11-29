# 🚀 Contract Deployment - Ready to Deploy!

## Steps:

### 1. Install Foundry (if not installed)
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
forge --version
```

### 2. Get MON Tokens from Faucet
- Use your faucet to get MON testnet tokens
- Make sure wallet has enough for gas (~0.1 MON should be enough)

### 3. Share Private Key
- Once you have tokens, share your private key
- Format: `0x...` (should start with 0x)

### 4. I'll Deploy for You
Once you provide:
- ✅ Private key
- ✅ Confirmation that you have MON tokens

I'll run:
```bash
cd apps/contracts
export PRIVATE_KEY=0xYOUR_KEY
forge script script/DeployDelayMarket.s.sol \
  --rpc-url https://testnet-rpc.monad.xyz \
  --broadcast \
  --private-key $PRIVATE_KEY
```

### 5. After Deployment
- I'll update the contract address in `.env` files
- Restart services
- Test everything!

## ⚠️ Security Note
- Private key ko share karne se pehle make sure:
  - It's a testnet wallet (not mainnet!)
  - You're comfortable sharing it
  - After deployment, you can rotate it if needed

