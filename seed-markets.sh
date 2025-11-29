#!/bin/bash

# Script to seed sample flight markets on Monad Testnet
# Usage: ./seed-markets.sh

echo "🌱 Seeding sample flight markets..."
echo ""

cd apps/contracts

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable not set"
    echo "Please set it: export PRIVATE_KEY=0xYOUR_PRIVATE_KEY"
    exit 1
fi

# Check if CONTRACT_ADDRESS is set
if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ Error: CONTRACT_ADDRESS environment variable not set"
    echo "Please set it: export CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS"
    exit 1
fi

export MONAD_RPC_URL=${MONAD_RPC_URL:-"https://testnet-rpc.monad.xyz"}

echo "📋 Markets to create:"
echo "  1. AI101 - Delhi → Mumbai"
echo "  2. 6E205 - Mumbai → Delhi"
echo "  3. UK801 - Delhi → Bangalore"
echo "  4. SG301 - Mumbai → Bangalore"
echo "  5. AI401 - Delhi → Hyderabad"
echo "  6. 6E501 - Mumbai → Chennai"
echo "  7. UK701 - Delhi → Kolkata"
echo "  8. EK501 - Delhi → Dubai"
echo "  9. BA138 - Mumbai → London"
echo ""

echo "🚀 Starting market creation..."
echo ""

# Run the seed script
forge script script/SeedMarkets.s.sol \
  --rpc-url $MONAD_RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY

echo ""
echo "✅ Market seeding complete!"
echo "Refresh your frontend to see the new markets."

