# 🧪 Manual Testing Checklist - DelayDex

## ✅ Pre-Deployment Checks

### 1. Environment Variables Setup
- [ ] **Frontend** (`apps/web/.env.local`):
  ```bash
  NEXT_PUBLIC_CONTRACT_ADDRESS=0xB2c57af2E5cD688d782061d438b7C26adb1a160E
  NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
  NEXT_PUBLIC_MONAD_CHAIN_ID=10143
  NEXT_PUBLIC_MONAD_EXPLORER_URL=https://testnet.monadexplorer.com
  NEXT_PUBLIC_BACKEND_URL=http://localhost:4500
  ```

- [ ] **Backend** (`apps/backend/.env`):
  ```bash
  MONAD_RPC_URL=https://testnet-rpc.monad.xyz
  MONAD_CHAIN_ID=10143
  PRIVATE_KEY=0xYOUR_PRIVATE_KEY
  CONTRACT_ADDRESS=0xB2c57af2E5cD688d782061d438b7C26adb1a160E
  AVIATION_EDGE_API_KEY=your_api_key
  PORT=4500
  ```

### 2. MetaMask Setup
- [ ] Monad Testnet added to MetaMask:
  - Network Name: `Monad Testnet`
  - RPC URL: `https://testnet-rpc.monad.xyz`
  - Chain ID: `10143`
  - Currency Symbol: `MON`
  - Block Explorer: `https://testnet.monadexplorer.com`

- [ ] Wallet has MON tokens for gas
- [ ] Wallet has DELAY tokens (mint using `./mint-tokens.sh YOUR_ADDRESS`)

---

## 🚀 Start Services

### Step 1: Start Backend
```bash
cd apps/backend
bun run dev
```
- [ ] Backend starts without errors
- [ ] See "Backend server running on port 4500"
- [ ] Visit `http://localhost:4500/health` - should return `{"status":"ok"}`

### Step 2: Start Frontend
```bash
cd apps/web
pnpm dev
```
- [ ] Frontend starts without errors
- [ ] Visit `http://localhost:3000` - page loads
- [ ] No console errors in browser (F12 → Console)

---

## 🔌 Wallet Connection Tests

### Test 1: Connect Wallet
- [ ] Click "Connect Wallet" button
- [ ] MetaMask popup appears
- [ ] Select account and approve
- [ ] Wallet address displays in navbar
- [ ] Green dot shows "Monad Testnet" (not yellow/red)

### Test 2: Wrong Network Warning
- [ ] Switch MetaMask to a different network (e.g., Base Sepolia)
- [ ] Yellow warning appears: "Wrong Network"
- [ ] Click "Switch Network" button
- [ ] MetaMask prompts to switch to Monad Testnet
- [ ] After switching, warning disappears

### Test 3: Disconnect Wallet
- [ ] Click wallet address dropdown
- [ ] Click "Disconnect"
- [ ] Wallet disconnects
- [ ] "Connect Wallet" button appears again

---

## 📊 Markets Page Tests

### Test 4: View Markets
- [ ] Navigate to `/markets`
- [ ] Markets list loads (if markets exist)
- [ ] Each market shows:
  - Flight number, route, date
  - On Time, 30+ delay, 120+ delay sections
  - YES/NO percentages and shares
  - "Place Bet" button

### Test 5: No Markets State
- [ ] If no markets exist, see "No markets found"
- [ ] "Create New Market" button is visible
- [ ] No errors in console

### Test 6: Market Filtering
- [ ] Use search bar to filter markets
- [ ] Filter by "Active" / "Resolved"
- [ ] Filters work correctly

---

## 💰 Token Balance Display

### Test 7: Check Token Balance
- [ ] Connect wallet
- [ ] On markets page, see "Your Token Balance: X DELAY"
- [ ] Balance is correct (should be 10,000 if you minted)
- [ ] Shows "✓ Monad Testnet" in green

---

## 🎲 Betting Tests

### Test 8: Place a Bet (First Time - Needs Approval)
- [ ] Click "Place Bet" on any market
- [ ] Dialog opens
- [ ] Select outcome (e.g., "30+ min delay")
- [ ] Select position (Yes/No)
- [ ] Enter shares (e.g., "10")
- [ ] See "Current Price" and "Estimated Cost"
- [ ] Click "Approve Tokens" (if first time)
- [ ] MetaMask popup appears for approval
- [ ] Approve transaction
- [ ] After approval, "Place Bet" button appears
- [ ] Click "Place Bet"
- [ ] MetaMask popup appears (should show Monad Testnet, NOT Base Sepolia)
- [ ] Transaction address should be: `0xB2c57...a160E` (NEW contract)
- [ ] Confirm transaction
- [ ] See "Placing..." then "Placed!"
- [ ] Dialog closes automatically
- [ ] Page refreshes
- [ ] Your bet appears in market data

### Test 9: Place a Bet (After Approval)
- [ ] Place another bet (no approval needed)
- [ ] Directly shows "Place Bet" button
- [ ] Transaction goes through smoothly

### Test 10: Insufficient Balance
- [ ] Try to place bet with more shares than balance
- [ ] Error message: "Insufficient token balance"
- [ ] Bet is not placed

### Test 11: Wrong Network During Bet
- [ ] Switch MetaMask to wrong network
- [ ] Try to place bet
- [ ] Error: "Please switch to Monad Testnet"
- [ ] Or auto-switch prompt appears

---

## 🏗️ Create Market Tests

### Test 12: Create New Market
- [ ] Click "Create New Market" button
- [ ] Dialog opens
- [ ] Fill in:
  - Flight Number: `TEST123`
  - Origin: `DEL`
  - Destination: `BOM`
  - Airline: `AI`
  - Scheduled Departure: `2025-02-20T10:00:00Z`
- [ ] Click "Create Market"
- [ ] MetaMask popup appears (Monad Testnet)
- [ ] Confirm transaction
- [ ] See "Creating..." then "Created!"
- [ ] Dialog closes
- [ ] Page refreshes
- [ ] New market appears in list

---

## 🎯 Market Resolution Tests

### Test 13: Resolve Market (Backend Required)
- [ ] Ensure backend is running
- [ ] Find a market that hasn't been resolved
- [ ] Click "Resolve Market" button
- [ ] See "Resolving..." status
- [ ] Backend fetches flight data
- [ ] Transaction submitted to blockchain
- [ ] See success message with:
  - Outcome (On Time / Delayed Short / Delayed Long)
  - Transaction hash
- [ ] Market status changes to "Resolved"
- [ ] Can no longer place bets on resolved market

### Test 14: Backend Offline
- [ ] Stop backend server
- [ ] Try to resolve market
- [ ] See warning: "⚠️ Backend offline"
- [ ] Button is disabled

---

## 💵 Claim Winnings Tests

### Test 15: Claim Winnings
- [ ] Find a resolved market where you have winning bets
- [ ] Click "Claim Winnings" button
- [ ] Dialog opens showing estimated winnings
- [ ] Click "Claim"
- [ ] MetaMask popup appears (Monad Testnet)
- [ ] Confirm transaction
- [ ] See "Claiming..." then "Claimed!"
- [ ] Dialog closes
- [ ] Page refreshes
- [ ] DELAY tokens received in wallet
- [ ] Balance increases

### Test 16: No Winnings to Claim
- [ ] Try to claim on market where you have no winning positions
- [ ] Appropriate message shown
- [ ] Cannot claim

---

## 🔄 Real-time Updates

### Test 17: Price Updates
- [ ] Open markets page
- [ ] Place a bet
- [ ] Watch prices update automatically (every 5-10 seconds)
- [ ] YES/NO percentages change
- [ ] Share counts update

### Test 18: Market Refresh
- [ ] Markets auto-refresh every 10 seconds
- [ ] New markets appear automatically
- [ ] Resolved markets update status

---

## 🐛 Error Handling Tests

### Test 19: Contract Address Not Set
- [ ] Remove `NEXT_PUBLIC_CONTRACT_ADDRESS` from `.env.local`
- [ ] Restart frontend
- [ ] See error message: "Contract address not configured"
- [ ] Instructions shown on how to fix

### Test 20: Network Errors
- [ ] Disconnect internet
- [ ] Try to place bet
- [ ] Appropriate error message shown
- [ ] No crashes

### Test 21: Transaction Rejection
- [ ] Place bet
- [ ] In MetaMask, click "Reject"
- [ ] Transaction cancelled gracefully
- [ ] No errors in console
- [ ] Can try again

---

## 📱 UI/UX Tests

### Test 22: Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768px width)
- [ ] Test on mobile (375px width)
- [ ] All elements visible and usable
- [ ] No horizontal scrolling

### Test 23: Loading States
- [ ] All buttons show loading states ("Placing...", "Creating...", etc.)
- [ ] Buttons disabled during transactions
- [ ] Clear feedback to user

### Test 24: Navigation
- [ ] Click "Home" - goes to homepage
- [ ] Click "Markets" - goes to markets page
- [ ] Logo click - goes to homepage
- [ ] Footer links work

---

## 🔍 Console Checks

### Test 25: Browser Console
- [ ] Open DevTools (F12)
- [ ] Check Console tab
- [ ] No red errors
- [ ] Only expected logs (bet details, etc.)
- [ ] No warnings about missing dependencies

### Test 26: Network Tab
- [ ] Check Network tab in DevTools
- [ ] API calls to backend succeed (200 status)
- [ ] RPC calls to Monad succeed
- [ ] No failed requests

---

## ✅ Final Verification

### Test 27: End-to-End Flow
1. [ ] Connect wallet
2. [ ] Create a new market
3. [ ] Place a YES bet on "30+ min delay"
4. [ ] Place a NO bet on "On Time" (different user or different outcome)
5. [ ] Resolve market via backend
6. [ ] Claim winnings
7. [ ] Verify tokens received

### Test 28: Multiple Markets
- [ ] Create 3-5 markets
- [ ] All display correctly
- [ ] Can place bets on each
- [ ] No performance issues

---

## 🚨 Critical Issues to Watch For

- [ ] **Wrong Contract Address**: Transaction shows `0xE11cC...` instead of `0xB2c57...`
- [ ] **Wrong Network**: Transactions going to Base Sepolia or other networks
- [ ] **Missing Tokens**: Can't place bets due to no DELAY tokens
- [ ] **Backend Not Running**: Resolution fails silently
- [ ] **Type Errors**: Red errors in browser console
- [ ] **Broken UI**: Buttons not working, dialogs not opening

---

## 📝 Notes

- If any test fails, note the error message and steps to reproduce
- Check browser console for detailed error messages
- Verify environment variables are set correctly
- Ensure MetaMask is on Monad Testnet
- Make sure you have both MON (gas) and DELAY (betting) tokens

---

## ✅ Ready for Submission Checklist

- [ ] All tests pass
- [ ] No console errors
- [ ] Contract address is correct (new one)
- [ ] All transactions go to Monad Testnet
- [ ] Backend is running and accessible
- [ ] Frontend builds without errors (`pnpm build`)
- [ ] All features work as expected

**If all above are checked ✅, you're ready to submit!** 🎉

