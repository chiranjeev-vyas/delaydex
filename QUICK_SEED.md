# Quick Market Seeding

Abhi sirf 2 markets dikh rahi hain. 7 aur markets add karne ke liye:

## Option 1: Foundry Script (Recommended)

```bash
cd apps/contracts
export PRIVATE_KEY=0xe34bb573375732771086f87bb207cd17e3c086e39d833cd885fc2276e8e149fd
export CONTRACT_ADDRESS=0xE11cC24728ECDCA1ED07E2343De723F92057A868
export MONAD_RPC_URL=https://testnet-rpc.monad.xyz

forge script script/SeedMarkets.s.sol \
  --rpc-url $MONAD_RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY
```

## Option 2: Use the shell script

```bash
export PRIVATE_KEY=0xe34bb573375732771086f87bb207cd17e3c086e39d833cd885fc2276e8e149fd
export CONTRACT_ADDRESS=0xE11cC24728ECDCA1ED07E2343De723F92057A868
./seed-markets.sh
```

Yeh 9 markets create karega (2 already hain, to 7 nayi add hongi).

