# DelayDex - Flight Delay Prediction Markets ✈️

> Decentralized prediction markets for flight delays on Monad testnet

DelayDex is a decentralized prediction market platform where users can bet on flight delays and cancellations. Built with Next.js, Bun.js, Solidity, and deployed on Monad testnet.

## 🎯 Features

- **Live Flight Markets**: Bet on real flights with dynamic odds
- **Real-Time Pricing**: Market-based pricing that updates based on demand
- **Decentralized Resolution**: Automated flight status verification via backend oracle
- **Monad Testnet**: Fast, low-cost transactions on Monad blockchain
- **Auto Chain Switching**: Automatically prompts users to switch to Monad testnet

## 🏗️ Architecture

This is a fullstack monorepo with three main components:

```
delaydex/
├── apps/
│   ├── contracts/     # Solidity smart contracts (Foundry)
│   ├── backend/       # Backend resolver service (Bun.js)
│   └── web/           # Frontend application (Next.js)
├── package.json       # Root package.json
└── turbo.json         # Turborepo configuration
```

### Components

1. **Smart Contracts** (`apps/contracts/`)
   - Solidity contracts for prediction markets
   - Market-based pricing mechanism
   - Deployed on Monad testnet
   - Built with Foundry

2. **Backend Resolver** (`apps/backend/`)
   - Bun.js REST API
   - Fetches real-time flight data from Aviation Edge API
   - Resolves markets on-chain
   - Dockerized for easy deployment

3. **Frontend** (`apps/web/`)
   - Next.js 14 with App Router
   - Wagmi + Viem for blockchain interactions
   - Tailwind CSS + shadcn/ui components

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and PNPM
- Bun (for backend)
- Foundry (for contracts)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/chiranjeev-vyas/delaydex.git
   cd delaydex
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - See `apps/backend/README.md` for backend
   - See `apps/web/.env.local.example` for frontend (create this file)

### Development

Run all services in development mode:

```bash
pnpm dev
```

Or run individually:

```bash
# Frontend (port 3000)
cd apps/web && pnpm dev

# Backend (port 4500)
cd apps/backend && bun run dev

# Smart contracts
cd apps/contracts && forge test
```

## 📦 Deployment

### Smart Contracts

1. Deploy to Monad testnet:
   ```bash
   cd apps/contracts
   forge script script/DeployDelayMarket.s.sol --rpc-url $MONAD_RPC_URL --broadcast --verify
   ```

2. Update contract address in:
   - `apps/backend/.env`
   - `apps/web/.env.local`

### Backend

1. Set environment variables in `apps/backend/.env`
2. Deploy to your preferred hosting (Render, Railway, etc.)
3. Update frontend with backend URL

### Frontend

1. Set environment variables in `apps/web/.env.local`
2. Build:
   ```bash
   cd apps/web
   pnpm build
   ```
3. Deploy to Vercel, Netlify, or your preferred platform

## 🔧 Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Blockchain**: Wagmi v2 + Viem
- **State**: React Query

### Backend

- **Runtime**: Bun.js
- **Language**: TypeScript
- **Blockchain**: Viem
- **API**: Aviation Edge (flight data)

### Smart Contracts

- **Language**: Solidity 0.8.20
- **Framework**: Foundry
- **Chain**: Monad Testnet

## 📋 Project Structure

```
delaydex/
├── apps/
│   ├── contracts/          # Smart contracts
│   │   ├── src/
│   │   │   ├── DelayMarket.sol
│   │   │   └── mocks/
│   │   ├── script/        # Deployment scripts
│   │   ├── test/          # Contract tests
│   │   └── foundry.toml
│   │
│   ├── backend/           # Backend resolver
│   │   ├── index.ts       # Main server
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── web/               # Frontend app
│       ├── src/
│       │   ├── app/       # Next.js pages
│       │   ├── components/ # UI components
│       │   ├── lib/       # Utilities
│       └── package.json
│
├── package.json           # Root package.json
└── turbo.json            # Turborepo config
```

## 🎮 How It Works

### 1. Create a Market

Users can create prediction markets for specific flights:

- Enter flight details (airline, flight number, date, departure airport)
- Market automatically created on Monad testnet
- Initial shares minted based on market curve

### 2. Trade Shares

Users bet on outcomes by buying/selling shares:

- **On Time**: Flight departs within 15 minutes of scheduled time
- **Delayed Short**: Flight delayed by 30-119 minutes
- **Delayed Long**: Flight delayed by 120+ minutes
- **Cancelled**: Flight is cancelled
- Prices adjust automatically based on demand

### 3. Market Resolution

After flight departure:

- Backend fetches actual flight status from Aviation Edge API
- Compares actual vs scheduled departure time
- Submits resolution transaction to blockchain
- Winners can claim their payouts

### 4. Claim Winnings

If your prediction was correct:

- Redeem your winning shares
- Receive payment tokens
- Profit! 💰

## 📊 Smart Contract Details

### Key Functions

```solidity
// Create a new flight market
function openMarket(
    string flightNumber,
    string originCode,
    string destinationCode,
    string airlineCode,
    string scheduledDeparture
) external returns (bytes32 marketId)

// Place a bet
function placeBet(
    bytes32 marketId,
    uint8 outcome,
    uint8 position,
    uint256 shares,
    uint256 pricePerShare
) external

// Close market (resolver only)
function closeMarket(
    bytes32 marketId,
    uint8 outcome
) external

// Claim winnings
function claimWinnings(bytes32 marketId) external
```

## 🔑 Environment Setup

### Backend Environment Variables

Create `apps/backend/.env`:

```bash
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_CHAIN_ID=10143
MONAD_EXPLORER_URL=https://testnet-explorer.monad.xyz
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
AVIATION_EDGE_API_KEY=your_api_key
PORT=4500
```

### Frontend Environment Variables

Create `apps/web/.env.local`:

```bash
NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_MONAD_CHAIN_ID=10143
NEXT_PUBLIC_MONAD_EXPLORER_URL=https://testnet-explorer.monad.xyz
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
NEXT_PUBLIC_BACKEND_URL=http://localhost:4500
```

## 🧪 Testing

### Smart Contracts

```bash
cd apps/contracts
forge test
forge test -vvv  # Verbose output
```

### Local Testing Flow

1. Start backend:
   ```bash
   cd apps/backend
   bun run dev
   ```

2. Start frontend:
   ```bash
   cd apps/web
   pnpm dev
   ```

3. Connect wallet and create a test market
4. Place bets for different outcomes
5. Resolve market via backend API
6. Claim winnings

## 📚 Available Scripts

### Root

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm type-check` - Type check all packages

### Frontend (`apps/web`)

- `pnpm dev` - Start Next.js dev server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Lint code

### Backend (`apps/backend`)

- `bun run dev` - Start with hot reload
- `bun run start` - Start production server

### Contracts (`apps/contracts`)

- `forge build` - Compile contracts
- `forge test` - Run tests
- `forge script script/DeployDelayMarket.s.sol --rpc-url $MONAD_RPC_URL --broadcast` - Deploy to Monad testnet

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Wrong network" error

- **Solution**: Make sure you're connected to Monad testnet. The app will auto-prompt to switch.

**Issue**: Backend can't resolve markets

- **Solution**: Check that PRIVATE_KEY is set and wallet has MON tokens for gas.

**Issue**: Flight data not found

- **Solution**: Ensure flight details are correct and flight has actually departed.

**Issue**: Transaction fails

- **Solution**: Check you have sufficient payment tokens and the market hasn't been closed yet.

## 📄 License

MIT License - see LICENSE file for details

## 💡 Inspiration

Ever been anxious about your flight being delayed? Why not make money from that anxiety! DelayDex lets you bet on flight outcomes, turning travel stress into potential profit.

---

Made with ❤️ for Monad Hackathon. Safe travels! ✈️
