# ⏰ LAST 10 MINUTES - FINAL CHECKLIST

## ✅ CRITICAL - Do These NOW:

### 1. ✅ Contract Address (DONE)
- File: `apps/web/.env.local`
- Value: `NEXT_PUBLIC_CONTRACT_ADDRESS=0xB2c57af2E5cD688d782061d438b7C26adb1a160E`
- ✅ Already fixed!

### 2. 🔄 Restart Frontend (DO THIS NOW!)
```bash
# Terminal 1 - Frontend
cd apps/web
# Press Ctrl+C to stop
pnpm dev
```

### 3. 🔄 Start Backend (DO THIS NOW!)
```bash
# Terminal 2 - Backend  
cd apps/backend
bun run dev
```

### 4. 🌐 MetaMask Setup (CRITICAL!)
- Open MetaMask
- Click network dropdown (top)
- Select "Monad Testnet"
- If not there, add manually:
  - Network Name: `Monad Testnet`
  - RPC URL: `https://testnet-rpc.monad.xyz`
  - Chain ID: `10143`
  - Currency: `MON`
  - Explorer: `https://testnet.monadexplorer.com`

### 5. 🔄 Browser Actions
- Go to: `http://localhost:3000`
- Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R`)
- Open console (F12) - check for errors

## ✅ Quick Test (2 minutes):

1. ✅ Connect wallet → Should show "Monad Testnet" with green dot
2. ✅ Go to /markets → Should see flight markets
3. ✅ Click "Place Bet" → Should show "Approve Tokens" or "Place Bet"
4. ✅ Click button → MetaMask should show "Monad Testnet" (NOT Base Sepolia)
5. ✅ Transaction address should be: `0xB2c57...` (starts with B2c57)

## 🚨 If Still Going to Base Sepolia:

1. **MetaMask manually switch karo** - Top par "Monad Testnet" dikhna chahiye
2. **Browser close karo** - Completely close and reopen
3. **Clear cache** - DevTools → Application → Clear storage
4. **Reconnect wallet** - Disconnect and connect again

## ✅ What's Already Fixed:

- ✅ Contract address updated
- ✅ All transactions force Monad Testnet
- ✅ Markets created (~10-16 markets)
- ✅ Sample betting data added
- ✅ Chain switching enforced
- ✅ Triple verification before transactions

## 🎯 Final Status:

**Code is READY!** Just need to:
1. Restart frontend
2. Switch MetaMask to Monad Testnet
3. Test one transaction

**YOU GOT THIS! 🚀**

