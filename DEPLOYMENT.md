# Deployment Guide - DelayDex

## Quick Deployment Steps

### 1. Deploy Smart Contract to Monad Testnet

```bash
cd apps/contracts

# Set environment variables
export MONAD_RPC_URL=https://testnet-rpc.monad.xyz
export PRIVATE_KEY=0xYOUR_PRIVATE_KEY
export PAYMENT_TOKEN_ADDRESS=0xYOUR_TOKEN_ADDRESS  # Deploy MockERC20 first if needed

# Deploy
forge script script/DeployDelayMarket.s.sol \
  --rpc-url $MONAD_RPC_URL \
  --broadcast \
  --verify
```

### 2. Update Environment Variables

**Frontend** (`apps/web/.env.local`):
```bash
NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_MONAD_CHAIN_ID=10143
NEXT_PUBLIC_MONAD_EXPLORER_URL=https://testnet.monadexplorer.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

**Backend** (`apps/backend/.env`):
```bash
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_CHAIN_ID=10143
MONAD_EXPLORER_URL=https://testnet.monadexplorer.com
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
AVIATION_EDGE_API_KEY=your_api_key
PORT=4500
```

### 3. Deploy Frontend

**Vercel:**
```bash
cd apps/web
vercel deploy
```

**Or build locally:**
```bash
cd apps/web
pnpm build
pnpm start
```

### 4. Deploy Backend

**Render/Railway:**
- Connect GitHub repo
- Set environment variables
- Deploy from `apps/backend` directory

**Or run locally:**
```bash
cd apps/backend
bun install
bun run start
```

## Testing

1. Connect wallet to Monad Testnet
2. Create a test market
3. Place bets on outcomes
4. Test market resolution (via backend)

## Notes

- Make sure you have MON tokens for gas
- Contract address must be set in both frontend and backend
- Backend needs private key with MON tokens for resolving markets

