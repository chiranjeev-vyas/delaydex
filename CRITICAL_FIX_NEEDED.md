# 🚨 CRITICAL: Contract Address Update Required!

## ⚠️ Issue Found

Your `apps/web/.env.local` file still has the **OLD contract address**:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xE11cC24728ECDCA1ED07E2343De723F92057A868
```

This is the **WRONG** address! It's the old contract that used MockERC20/USDC.

## ✅ Fix Required

**Update `apps/web/.env.local`** with the **NEW contract address**:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xB2c57af2E5cD688d782061d438b7C26adb1a160E
```

## 📝 Complete .env.local File

Your `apps/web/.env.local` should have:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xB2c57af2E5cD688d782061d438b7C26adb1a160E
NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_MONAD_CHAIN_ID=10143
NEXT_PUBLIC_MONAD_EXPLORER_URL=https://testnet.monadexplorer.com
NEXT_PUBLIC_BACKEND_URL=http://localhost:4500
```

## 🔄 After Updating

1. **Save the file**
2. **Restart frontend dev server**:
   ```bash
   # Stop current server (Ctrl+C)
   cd apps/web
   pnpm dev
   ```
3. **Hard refresh browser**: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

## ✅ Verify It's Fixed

1. Open browser console (F12)
2. Type: `process.env.NEXT_PUBLIC_CONTRACT_ADDRESS`
3. Should show: `0xB2c57af2E5cD688d782061d438b7C26adb1a160E`
4. When placing a bet, MetaMask should show address starting with `0xB2c57...`

---

## 📋 Quick Verification Commands

```bash
# Check current contract address
grep NEXT_PUBLIC_CONTRACT_ADDRESS apps/web/.env.local

# Should show:
# NEXT_PUBLIC_CONTRACT_ADDRESS=0xB2c57af2E5cD688d782061d438b7C26adb1a160E
```

**After fixing this, you can proceed with manual testing!**

