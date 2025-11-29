// Monad testnet contract address
export const DELAY_MARKET_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}` || "0x0000000000000000000000000000000000000000";

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
] as const;

