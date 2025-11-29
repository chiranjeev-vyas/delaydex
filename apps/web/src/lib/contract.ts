// Monad testnet contract address
// IMPORTANT: Make sure apps/web/.env.local has NEXT_PUBLIC_CONTRACT_ADDRESS=0xB2c57af2E5cD688d782061d438b7C26adb1a160E
export const DELAY_MARKET_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) || "0x0000000000000000000000000000000000000000";

// Warn if using old contract address (only log, don't show error in UI - let the component handle it)
if (typeof window !== 'undefined' && DELAY_MARKET_CONTRACT_ADDRESS === "0xE11cC24728ECDCA1ED07E2343De723F92057A868") {
  console.error("❌ WRONG CONTRACT ADDRESS! Using old contract. Please update .env.local with new address: 0xB2c57af2E5cD688d782061d438b7C26adb1a160E");
}

// Contract ABI
export const DELAY_MARKET_ABI = [
  {
    inputs: [
      { internalType: "string", name: "flightNumber", type: "string" },
      { internalType: "string", name: "originCode", type: "string" },
      { internalType: "string", name: "destinationCode", type: "string" },
      { internalType: "string", name: "airlineCode", type: "string" },
      { internalType: "string", name: "scheduledDeparture", type: "string" },
    ],
    name: "openMarket",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "marketId", type: "bytes32" },
      { internalType: "uint8", name: "outcome", type: "uint8" },
      { internalType: "uint8", name: "position", type: "uint8" },
      { internalType: "uint256", name: "shares", type: "uint256" },
      { internalType: "uint256", name: "pricePerShare", type: "uint256" },
    ],
    name: "placeBet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "marketId", type: "bytes32" },
      { internalType: "uint8", name: "outcome", type: "uint8" },
      { internalType: "uint8", name: "position", type: "uint8" },
      { internalType: "uint256", name: "shares", type: "uint256" },
      { internalType: "uint256", name: "pricePerShare", type: "uint256" },
    ],
    name: "sellBet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "marketId", type: "bytes32" }],
    name: "claimWinnings",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "marketId", type: "bytes32" }],
    name: "getMarketData",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "marketId", type: "bytes32" },
          { internalType: "string", name: "flightNumber", type: "string" },
          { internalType: "string", name: "originCode", type: "string" },
          { internalType: "string", name: "destinationCode", type: "string" },
          { internalType: "string", name: "airlineCode", type: "string" },
          { internalType: "string", name: "scheduledDeparture", type: "string" },
          { internalType: "uint8", name: "finalOutcome", type: "uint8" },
          {
            components: [
              { internalType: "uint256", name: "yesShares", type: "uint256" },
              { internalType: "uint256", name: "noShares", type: "uint256" },
              { internalType: "uint256", name: "yesPrice", type: "uint256" },
              { internalType: "uint256", name: "noPrice", type: "uint256" },
            ],
            internalType: "struct DelayMarket.OutcomeData",
            name: "onTime",
            type: "tuple",
          },
          {
            components: [
              { internalType: "uint256", name: "yesShares", type: "uint256" },
              { internalType: "uint256", name: "noShares", type: "uint256" },
              { internalType: "uint256", name: "yesPrice", type: "uint256" },
              { internalType: "uint256", name: "noPrice", type: "uint256" },
            ],
            internalType: "struct DelayMarket.OutcomeData",
            name: "delayedShort",
            type: "tuple",
          },
          {
            components: [
              { internalType: "uint256", name: "yesShares", type: "uint256" },
              { internalType: "uint256", name: "noShares", type: "uint256" },
              { internalType: "uint256", name: "yesPrice", type: "uint256" },
              { internalType: "uint256", name: "noPrice", type: "uint256" },
            ],
            internalType: "struct DelayMarket.OutcomeData",
            name: "delayedLong",
            type: "tuple",
          },
          {
            components: [
              { internalType: "uint256", name: "yesShares", type: "uint256" },
              { internalType: "uint256", name: "noShares", type: "uint256" },
              { internalType: "uint256", name: "yesPrice", type: "uint256" },
              { internalType: "uint256", name: "noPrice", type: "uint256" },
            ],
            internalType: "struct DelayMarket.OutcomeData",
            name: "cancelled",
            type: "tuple",
          },
        ],
        internalType: "struct DelayMarket.MarketData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllMarkets",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "marketId", type: "bytes32" },
          { internalType: "string", name: "flightNumber", type: "string" },
          { internalType: "string", name: "originCode", type: "string" },
          { internalType: "string", name: "destinationCode", type: "string" },
          { internalType: "string", name: "airlineCode", type: "string" },
          { internalType: "string", name: "scheduledDeparture", type: "string" },
          { internalType: "uint8", name: "finalOutcome", type: "uint8" },
          {
            components: [
              { internalType: "uint256", name: "yesShares", type: "uint256" },
              { internalType: "uint256", name: "noShares", type: "uint256" },
              { internalType: "uint256", name: "yesPrice", type: "uint256" },
              { internalType: "uint256", name: "noPrice", type: "uint256" },
            ],
            internalType: "struct DelayMarket.OutcomeData",
            name: "onTime",
            type: "tuple",
          },
          {
            components: [
              { internalType: "uint256", name: "yesShares", type: "uint256" },
              { internalType: "uint256", name: "noShares", type: "uint256" },
              { internalType: "uint256", name: "yesPrice", type: "uint256" },
              { internalType: "uint256", name: "noPrice", type: "uint256" },
            ],
            internalType: "struct DelayMarket.OutcomeData",
            name: "delayedShort",
            type: "tuple",
          },
          {
            components: [
              { internalType: "uint256", name: "yesShares", type: "uint256" },
              { internalType: "uint256", name: "noShares", type: "uint256" },
              { internalType: "uint256", name: "yesPrice", type: "uint256" },
              { internalType: "uint256", name: "noPrice", type: "uint256" },
            ],
            internalType: "struct DelayMarket.OutcomeData",
            name: "delayedLong",
            type: "tuple",
          },
          {
            components: [
              { internalType: "uint256", name: "yesShares", type: "uint256" },
              { internalType: "uint256", name: "noShares", type: "uint256" },
              { internalType: "uint256", name: "yesPrice", type: "uint256" },
              { internalType: "uint256", name: "noPrice", type: "uint256" },
            ],
            internalType: "struct DelayMarket.OutcomeData",
            name: "cancelled",
            type: "tuple",
          },
        ],
        internalType: "struct DelayMarket.MarketData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "marketId", type: "bytes32" },
      { internalType: "uint8", name: "outcome", type: "uint8" },
      { internalType: "uint8", name: "position", type: "uint8" },
    ],
    name: "getPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paymentToken",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ERC20 ABI for token operations
export const ERC20_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

