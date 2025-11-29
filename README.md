# DelayDex - Flight Delay Prediction Markets

A decentralized prediction market platform for betting on flight delays, built on Monad Testnet. Users can create markets, place bets, and claim winnings using the custom $DELAY ERC-20 token.

## 🚀 Features

- **Flight Delay Prediction Markets**: Create and bet on flight delay outcomes
- **Custom ERC-20 Token**: All bets use $DELAY token (ERC-20 standard)
- **Real-time Flight Tracking**: Integration with Aviation Edge API for flight status
- **AMM-based Pricing**: Automatic market maker for dynamic odds
- **Win/Loss Tracking**: View your positions and track winnings
- **Monad Testnet**: Fully deployed on Monad Testnet

## 💰 $DELAY Token

**Important**: All betting and winnings use our custom ERC-20 token **$DELAY**.

- **Token Name**: DelayDex Token
- **Token Symbol**: DELAY
- **Standard**: ERC-20
- **Network**: Monad Testnet

You need $DELAY tokens to:
- Place bets on flight markets
- Receive winnings (paid in $DELAY tokens)

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Bun runtime (for backend)
- Foundry (for smart contracts)
- MetaMask wallet with Monad Testnet configured
- MON testnet tokens (for gas fees)
- $DELAY tokens (for betting)

## 🏗️ Architecture

This is a monorepo built with:
- **Smart Contracts**: Solidity + Foundry (apps/contracts)
- **Backend**: Bun.js + Viem (apps/backend)
- **Frontend**: Next.js 14 + Wagmi + Tailwind CSS (apps/web)

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Install Foundry (if not already installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install forge-std
cd apps/contracts
forge install foundry-rs/forge-std
```

## 🔧 Environment Setup

### Frontend (apps/web/.env.local)

```env
# Monad Testnet Configuration
NEXT_PUBLIC_MONAD_CHAIN_ID=10143
NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_MONAD_EXPLORER_URL=https://testnet.monadexplorer.com

# Contract Addresses
NEXT_PUBLIC_CONTRACT_ADDRESS=0xB2c57af2E5cD688d782061d438b7C26adb1a160E
NEXT_PUBLIC_DELAY_TOKEN_ADDRESS=0xYOUR_DELAY_TOKEN_ADDRESS

# Optional: WalletConnect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

### Backend (apps/backend/.env)

```env
# Monad Testnet RPC
MONAD_RPC_URL=https://testnet-rpc.monad.xyz

# Private Key (for market resolution)
PRIVATE_KEY=your_private_key

# Contract Address
CONTRACT_ADDRESS=0xB2c57af2E5cD688d782061d438b7C26adb1a160E

# Aviation Edge API Key
AVIATION_EDGE_API_KEY=your_api_key
```

## 🚀 Deployment

### 1. Deploy $DELAY Token

```bash
cd apps/contracts
forge script script/DeployDelayToken.s.sol \
  --rpc-url https://testnet-rpc.monad.xyz \
  --broadcast \
  --private-key $PRIVATE_KEY
```

Save the deployed token address and update `NEXT_PUBLIC_DELAY_TOKEN_ADDRESS` in frontend `.env.local`.

### 2. Deploy DelayMarket Contract

```bash
cd apps/contracts
forge script script/DeployDelayMarketWithToken.s.sol \
  --rpc-url https://testnet-rpc.monad.xyz \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --sig "run(address)" 0xYOUR_DELAY_TOKEN_ADDRESS
```

Save the deployed contract address and update `NEXT_PUBLIC_CONTRACT_ADDRESS` in frontend `.env.local` and `CONTRACT_ADDRESS` in backend `.env`.

### 3. Seed Markets (Optional)

```bash
cd apps/contracts
forge script script/SeedMarkets.s.sol \
  --rpc-url https://testnet-rpc.monad.xyz \
  --broadcast \
  --private-key $PRIVATE_KEY
```

### 4. Mint $DELAY Tokens to Users

```bash
cd apps/contracts
forge script script/MintTokensToUser.s.sol \
  --rpc-url https://testnet-rpc.monad.xyz \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --sig "run(address,address,uint256)" 0xTOKEN_ADDRESS 0xUSER_ADDRESS 10000
```

## 🎮 Usage

### Start Development Servers

```bash
# Terminal 1: Backend
cd apps/backend
bun install
bun run dev

# Terminal 2: Frontend
cd apps/web
pnpm install
pnpm dev
```

Visit `http://localhost:3000` to access the dApp.

### Connect Wallet

1. Install MetaMask extension
2. Add Monad Testnet network:
   - Network Name: Monad Testnet
   - RPC URL: https://testnet-rpc.monad.xyz
   - Chain ID: 10143
   - Currency Symbol: MON
   - Block Explorer: https://testnet.monadexplorer.com
3. Connect wallet in the dApp
4. Ensure you have MON tokens for gas and $DELAY tokens for betting

### Place a Bet

1. Navigate to Markets page
2. Select a flight market
3. Choose outcome (On Time, 30+ min delay, 120+ min delay)
4. Choose position (Yes/No)
5. Enter shares amount
6. Approve $DELAY token spending (first time only)
7. Place bet

### Claim Winnings

1. Go to Markets page
2. Find resolved markets where you have winning bets
3. Click "Claim Winnings"
4. Confirm transaction
5. Receive $DELAY tokens

## 📊 Contract Addresses (Monad Testnet)

### DelayMarket Contract
```
0xB2c57af2E5cD688d782061d438b7C26adb1a160E
```

### $DELAY Token Contract
```
0xYOUR_DELAY_TOKEN_ADDRESS
```
*(Update with your deployed token address)*

**Explorer Links:**
- [DelayMarket on Monad Explorer](https://testnet.monadexplorer.com/address/0xB2c57af2E5cD688d782061d438b7C26adb1a160E)
- [$DELAY Token on Monad Explorer](https://testnet.monadexplorer.com/address/0xYOUR_DELAY_TOKEN_ADDRESS)

## 🧪 Testing

```bash
# Run smart contract tests
cd apps/contracts
forge test

# Type check frontend
cd apps/web
pnpm type-check

# Lint
pnpm lint
```

## 📁 Project Structure

```
delaydex/
├── apps/
│   ├── contracts/          # Solidity smart contracts
│   │   ├── src/
│   │   │   ├── DelayMarket.sol      # Main prediction market contract
│   │   │   └── DelayToken.sol       # ERC-20 token contract
│   │   ├── script/        # Deployment scripts
│   │   └── test/          # Foundry tests
│   ├── backend/           # Bun.js backend API
│   │   └── index.ts       # Main server file
│   └── web/               # Next.js frontend
│       └── src/
│           ├── app/       # Next.js app router pages
│           ├── components/ # React components
│           └── lib/       # Utilities and configs
├── package.json
└── README.md
```

## 🔐 Security Notes

- **Never commit private keys or `.env` files**
- Use testnet tokens only
- Contracts are deployed on Monad Testnet (not mainnet)
- Always verify contract addresses before transactions

## 🛠️ Tech Stack

- **Blockchain**: Monad Testnet
- **Smart Contracts**: Solidity 0.8.20, Foundry
- **Frontend**: Next.js 14, React, Wagmi, Viem, Tailwind CSS
- **Backend**: Bun.js, Viem
- **APIs**: Aviation Edge, OpenSky Network, AviationStack

## 📝 License

MIT

## 🤝 Contributing

This is a hackathon project. For questions or issues, please open an issue on GitHub.

## 🔗 Links

- **GitHub**: https://github.com/chiranjeev-vyas/delaydex
- **Monad Testnet Explorer**: https://testnet.monadexplorer.com
- **Monad Testnet RPC**: https://testnet-rpc.monad.xyz

---

**Built for Monad Hackathon** 🚀
