# 🚀 Quick Start Guide

## 1. Update Contract Address (CRITICAL!)

Edit `apps/web/.env.local`:
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xB2c57af2E5cD688d782061d438b7C26adb1a160E
```

## 2. Start Backend
```bash
cd apps/backend
bun run dev
```
✅ Should see: "Backend server running on port 4500"

## 3. Start Frontend
```bash
cd apps/web
pnpm dev
```
✅ Should see: "Ready on http://localhost:3000"

## 4. Open Browser
- Go to: http://localhost:3000
- Connect MetaMask (must be on Monad Testnet)
- You should see your DELAY token balance

## 5. Test Betting
- Go to /markets
- Click "Place Bet"
- Approve tokens (first time)
- Place a bet
- ✅ Transaction should go to: 0xB2c57... (NEW contract)

## ✅ Ready to Test!

Follow `MANUAL_TESTING_CHECKLIST.md` for complete testing guide.
