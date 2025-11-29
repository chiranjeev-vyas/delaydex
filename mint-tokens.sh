#!/bin/bash

# Script to mint DELAY tokens to your wallet
# Usage: ./mint-tokens.sh YOUR_WALLET_ADDRESS

if [ -z "$1" ]; then
    echo "Usage: ./mint-tokens.sh YOUR_WALLET_ADDRESS"
    echo "Example: ./mint-tokens.sh 0x1234567890123456789012345678901234567890"
    exit 1
fi

USER_ADDRESS=$1
PRIVATE_KEY=${PRIVATE_KEY:-"0xe34bb573375732771086f87bb207cd17e3c086e39d833cd885fc2276e8e149fd"}
CONTRACT_ADDRESS=${CONTRACT_ADDRESS:-"0xB2c57af2E5cD688d782061d438b7C26adb1a160E"}
DELAY_TOKEN_ADDRESS=${DELAY_TOKEN_ADDRESS:-"0xf519c7BF476715775b50e3080d965C6dBC034483"}
MONAD_RPC_URL=${MONAD_RPC_URL:-"https://testnet-rpc.monad.xyz"}

echo "Minting DELAY tokens to: $USER_ADDRESS"
echo "DelayMarket Contract: $CONTRACT_ADDRESS"
echo "DELAY Token: $DELAY_TOKEN_ADDRESS"

cd apps/contracts

export PRIVATE_KEY=$PRIVATE_KEY
export CONTRACT_ADDRESS=$CONTRACT_ADDRESS
export DELAY_TOKEN_ADDRESS=$DELAY_TOKEN_ADDRESS
export USER_ADDRESS=$USER_ADDRESS
export MONAD_RPC_URL=$MONAD_RPC_URL

forge script script/MintTokensToUser.s.sol \
  --rpc-url $MONAD_RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY

echo ""
echo "✅ DELAY tokens minted! Check your wallet balance."

