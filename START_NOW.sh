#!/bin/bash
echo "🚀 Starting DelayDex..."
echo ""

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend already running on http://localhost:3000"
else
    echo "⚠️  Frontend not running. Start it:"
    echo "   cd apps/web && pnpm dev"
fi

echo ""
echo "📋 Quick Checklist:"
echo "1. ✅ Contract address: 0xB2c57af2E5cD688d782061d438b7C26adb1a160E"
echo "2. 🔄 MetaMask: Switch to Monad Testnet (Chain ID: 10143)"
echo "3. 🔄 Browser: Hard refresh (Ctrl+Shift+R)"
echo "4. ✅ Test: Place a bet - should go to Monad Testnet"
echo ""
echo "🎯 YOU'RE READY! Good luck! 🚀"
