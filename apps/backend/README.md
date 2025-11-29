# DelayDex Backend

Backend resolver service for DelayDex prediction markets on Monad testnet.

## Setup

1. Install dependencies:
```bash
bun install
```

2. Create `.env` file:
```bash
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_CHAIN_ID=10143
MONAD_EXPLORER_URL=https://testnet-explorer.monad.xyz
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
AVIATION_EDGE_API_KEY=your_api_key
PORT=4500
```

3. Run:
```bash
bun run dev
```

## Endpoints

- `GET /health` - Health check
- `GET /resolve?marketId=...&originCode=...&date=...&airlineCode=...&flightNumber=...` - Resolve a market

