"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId, useAccount, useSwitchChain } from "wagmi";
import { DELAY_MARKET_CONTRACT_ADDRESS, DELAY_MARKET_ABI, ERC20_ABI } from "@/lib/contract";
import { parseEther, formatEther, maxUint256 } from "viem";
import { monadTestnet } from "@/lib/wagmi";

type Outcome = 0 | 1 | 2 | 3 | 4; // Pending, OnTime, DelayedShort, DelayedLong, Cancelled
type Position = 0 | 1; // Yes, No

export function BetDialog({ marketId, onClose }: { marketId: string; onClose: () => void }) {
  const [outcome, setOutcome] = useState<Outcome>(1);
  const [position, setPosition] = useState<Position>(0);
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("0.5");
  const [error, setError] = useState("");
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const chainId = useChainId();
  const { address, chain } = useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  
  // Get actual chain from account (more reliable) - this is the REAL chain from MetaMask
  const actualChainId = chain?.id || chainId;
  
  // CRITICAL: Block UI if wrong chain
  const isWrongChain = actualChainId ? actualChainId !== monadTestnet.id : false;

  const marketIdBytes = marketId.startsWith("0x") ? marketId as `0x${string}` : `0x${marketId}` as `0x${string}`;

  // Get payment token address
  const { data: paymentTokenAddress } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "paymentToken",
  });

  const { data: marketPrice } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getPrice",
    args: [marketIdBytes, outcome, position],
    query: {
      enabled: !!marketId && marketId.length > 0,
    },
  });

  // Get token balance
  const { data: tokenBalance } = useReadContract({
    address: paymentTokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!paymentTokenAddress && !!address,
    },
  });

  // Get token allowance
  const { data: tokenAllowance } = useReadContract({
    address: paymentTokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && DELAY_MARKET_CONTRACT_ADDRESS ? [address, DELAY_MARKET_CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: !!paymentTokenAddress && !!address && !!DELAY_MARKET_CONTRACT_ADDRESS,
    },
  });

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { writeContract: writeApprove, data: approveHash, isPending: isApprovingTx, error: approveError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const { isLoading: isApprovingConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Check if approval is needed
  useEffect(() => {
    if (shares && marketPrice && tokenAllowance !== undefined) {
      const sharesWei = parseEther(shares);
      const priceWei = marketPrice;
      const cost = (sharesWei * priceWei) / parseEther("1");
      setNeedsApproval(tokenAllowance < cost);
    }
  }, [shares, marketPrice, tokenAllowance]);

  // Reset approval state when approve succeeds
  useEffect(() => {
    if (isApproveSuccess) {
      setIsApproving(false);
      setNeedsApproval(false);
    }
  }, [isApproveSuccess]);

  // Display writeContract errors
  useEffect(() => {
    if (writeError) {
      setError(writeError.message || "Transaction failed. Please check your wallet and try again.");
    }
  }, [writeError]);

  // Display approve errors
  useEffect(() => {
    if (approveError) {
      setError(approveError.message || "Approval failed. Please try again.");
      setIsApproving(false);
    }
  }, [approveError]);

  const outcomeNames = ["", "On Time", "Delayed Short", "Delayed Long", "Cancelled"];
  const positionNames = ["Yes", "No"];

  const handleApprove = async () => {
    if (!paymentTokenAddress || !DELAY_MARKET_CONTRACT_ADDRESS) {
      setError("Token address not found");
      return;
    }

    setIsApproving(true);
    setError("");

    try {
      if (!paymentTokenAddress || !DELAY_MARKET_CONTRACT_ADDRESS) {
        setError("Token or contract address not found");
        setIsApproving(false);
        return;
      }

      // Check and switch chain if needed before approval
      if (chainId !== monadTestnet.id) {
        try {
          await switchChain({ chainId: monadTestnet.id });
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err: any) {
          setError("Failed to switch to Monad Testnet. Please switch manually in your wallet.");
          setIsApproving(false);
          return;
        }
      }

      // CRITICAL: Force Monad Testnet for approval
      writeApprove({
        address: paymentTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [DELAY_MARKET_CONTRACT_ADDRESS, maxUint256],
        chainId: monadTestnet.id, // FORCE Monad Testnet
      });
    } catch (err: any) {
      setError(err?.message || "Approval failed. Please try again.");
      setIsApproving(false);
      console.error("Error approving tokens:", err);
    }
  };

  const handleBet = async () => {
    console.log("Place Bet button clicked");
    setError("");

    if (!shares || parseFloat(shares) <= 0) {
      setError("Please enter valid shares");
      return;
    }

    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    // HARD FIX: Check chain from window.ethereum directly (most reliable) - FRESH CHECK
    let currentChainId: number | null = null;
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        // Force fresh chain check
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        currentChainId = parseInt(chainIdHex, 16);
        console.log("🔍 FRESH Direct chain check from MetaMask:", currentChainId, "Required:", monadTestnet.id);
        
        // Also check from wagmi for comparison
        console.log("🔍 Wagmi chain check:", actualChainId || chainId);
      }
    } catch (err) {
      console.error("Failed to get chain from window.ethereum:", err);
    }

    // Fallback to wagmi chain if window.ethereum check failed
    if (currentChainId === null) {
      currentChainId = actualChainId || chainId || null;
      console.log("🔍 Using wagmi chain as fallback:", currentChainId);
    }

    // HARD BLOCK: If wrong chain, STOP IMMEDIATELY
    if (!currentChainId || currentChainId !== monadTestnet.id) {
      const errorMsg = `❌❌❌ TRANSACTION BLOCKED! ❌❌❌\n\nYou're on Chain ID: ${currentChainId || 'unknown'}\nRequired: Monad Testnet (Chain ID: 10143)\n\n⚠️ Please switch to Monad Testnet in MetaMask NOW!\n\nAfter switching, refresh this page (F5) and try again.`;
      console.error("❌❌❌ HARD BLOCK - Wrong chain:", currentChainId, "Required:", monadTestnet.id);
      setError(errorMsg);
      alert(errorMsg);
      return; // Don't try auto-switch, just block
    }
    
    console.log("✅ Chain verified - proceeding with transaction");

    const sharesWei = parseEther(shares);
    const priceWei = marketPrice || parseEther(price);
    const cost = (sharesWei * priceWei) / parseEther("1");

    console.log("Bet details:", {
      sharesWei: sharesWei.toString(),
      priceWei: priceWei.toString(),
      cost: cost.toString(),
      tokenBalance: tokenBalance?.toString(),
      tokenAllowance: tokenAllowance?.toString(),
      contractAddress: DELAY_MARKET_CONTRACT_ADDRESS,
    });

    // Check balance
    if (tokenBalance !== undefined && tokenBalance < cost) {
      setError(`Insufficient token balance. You need ${formatEther(cost)} tokens but have ${formatEther(tokenBalance)}`);
      return;
    }

    // Check approval
    if (tokenAllowance !== undefined && tokenAllowance < cost) {
      console.log("Approval needed. Current allowance:", tokenAllowance.toString(), "Cost:", cost.toString());
      setError("Please approve token spending first");
      setNeedsApproval(true);
      return;
    }

    // Validate contract address
    if (!DELAY_MARKET_CONTRACT_ADDRESS || DELAY_MARKET_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setError("Contract address not configured. Please check your environment variables.");
      return;
    }
    
    // Double check contract address is correct
    if (DELAY_MARKET_CONTRACT_ADDRESS === "0xE11cC24728ECDCA1ED07E2343De723F92057A868") {
      setError("❌ WRONG CONTRACT ADDRESS! Please update apps/web/.env.local with: NEXT_PUBLIC_CONTRACT_ADDRESS=0xB2c57af2E5cD688d782061d438b7C26adb1a160E and restart the dev server (Ctrl+C then pnpm dev).");
      console.error("Current contract address:", DELAY_MARKET_CONTRACT_ADDRESS);
      console.error("Expected contract address: 0xB2c57af2E5cD688d782061d438b7C26adb1a160E");
      return;
    }

    console.log("✅✅✅ All chain checks passed - proceeding with transaction");
    
    try {
      // HARD FIX: One more direct check right before transaction
      if (window.ethereum) {
        const preTxChainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        const preTxChainId = parseInt(preTxChainIdHex, 16);
        if (preTxChainId !== monadTestnet.id) {
          throw new Error(`❌ PRE-TRANSACTION CHECK FAILED! Chain ID: ${preTxChainId}, Required: ${monadTestnet.id}. Please switch to Monad Testnet in MetaMask.`);
        }
      }

      // CRITICAL: Force Monad Testnet with explicit chainId
      console.log("🚀 Sending transaction - FORCING Chain ID:", monadTestnet.id);
      console.log("Contract:", DELAY_MARKET_CONTRACT_ADDRESS);
      console.log("Args:", { marketId: marketIdBytes, outcome, position, shares: sharesWei.toString(), price: priceWei.toString() });
      
      writeContract({
        address: DELAY_MARKET_CONTRACT_ADDRESS,
        abi: DELAY_MARKET_ABI,
        functionName: "placeBet",
        args: [marketIdBytes, outcome, position, sharesWei, priceWei],
        chainId: monadTestnet.id, // FORCE Monad Testnet - CRITICAL
      });
      
      console.log("✅ writeContract called - should go to Monad Testnet");
    } catch (err: any) {
      console.error("❌ Transaction error:", err);
      const errorMsg = err?.message || "Transaction failed. Please ensure you're on Monad Testnet.";
      setError(errorMsg);
      if (errorMsg.includes("chain") || errorMsg.includes("network")) {
        alert("❌ " + errorMsg + "\n\nPlease switch to Monad Testnet in MetaMask and try again.");
      }
    }
  };

  if (isSuccess) {
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 2000);
  }

  const currentPrice = marketPrice ? Number(formatEther(marketPrice)) * 100 : parseFloat(price) * 100;
  const cost = shares ? (parseFloat(shares) * currentPrice) / 100 : 0;
  const hasInsufficientBalance = tokenBalance !== undefined && shares ? (parseEther(shares) * (marketPrice || parseEther(price))) / parseEther("1") > tokenBalance : false;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Place Bet</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {isWrongChain && (
          <div className="mb-4 p-4 bg-red-500/30 border-2 border-red-500 rounded-lg">
            <div className="flex items-center gap-2 text-red-200 mb-2">
              <span className="text-2xl">🚨</span>
              <div>
                <p className="font-bold text-red-100">WRONG NETWORK DETECTED!</p>
                <p className="text-sm">Current: Chain {actualChainId} | Required: Monad Testnet (10143)</p>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  await switchChain({ chainId: monadTestnet.id });
                  alert("✅ Switched! Please wait 3 seconds and refresh the page.");
                  setTimeout(() => window.location.reload(), 3000);
                } catch (err) {
                  alert("❌ Auto-switch failed. Please MANUALLY switch to Monad Testnet in MetaMask!");
                }
              }}
              disabled={isSwitchingChain}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 text-sm"
            >
              {isSwitchingChain ? "Switching..." : "🚨 SWITCH TO MONAD TESTNET NOW"}
            </button>
            <p className="text-xs text-red-300 mt-2 text-center">
              ⚠️ Transactions are BLOCKED until you switch to Monad Testnet
            </p>
          </div>
        )}

        {tokenBalance !== undefined && (
          <div className="mb-4 p-3 bg-slate-700/50 rounded-lg text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Your Token Balance:</span>
              <span className="font-semibold text-white">{formatEther(tokenBalance)} DELAY</span>
            </div>
            <div className="flex justify-between text-gray-400 text-xs mt-1">
              <span>Network:</span>
              <span className={chainId === monadTestnet.id ? "text-green-400" : "text-red-400"}>
                {chainId === monadTestnet.id ? "✓ Monad Testnet" : `✗ Chain ID: ${chainId || "Unknown"}`}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Outcome
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setOutcome(1)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  outcome === 1
                    ? "bg-green-600 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                On Time
              </button>
              <button
                type="button"
                onClick={() => setOutcome(2)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  outcome === 2
                    ? "bg-yellow-600 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                30+ min delay
              </button>
              <button
                type="button"
                onClick={() => setOutcome(3)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  outcome === 3
                    ? "bg-orange-600 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                120+ min delay
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Position
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPosition(0)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  position === 0
                    ? "bg-green-600 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setPosition(1)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  position === 1
                    ? "bg-red-600 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                No
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Shares
            </label>
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="100"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Current Price:</span>
              <span className="text-white font-semibold">{currentPrice.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Estimated Cost:</span>
              <span className="text-white font-semibold">{cost.toFixed(4)} tokens</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            {needsApproval && !isApproveSuccess ? (
              <button
                onClick={handleApprove}
                disabled={isApproving || isApprovingTx || isApprovingConfirming}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApproving || isApprovingTx || isApprovingConfirming
                  ? "Approving..."
                  : "Approve Tokens"}
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isWrongChain) {
                    alert("❌ WRONG NETWORK!\n\nYou're on chain " + actualChainId + "\nPlease switch to Monad Testnet (10143) in MetaMask FIRST!");
                    return;
                  }
                  console.log("Button clicked, disabled:", isPending || isConfirming || !shares || hasInsufficientBalance || isSwitchingChain || isWrongChain);
                  handleBet();
                }}
                disabled={isPending || isConfirming || !shares || hasInsufficientBalance || isSwitchingChain || isWrongChain}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWrongChain
                  ? "❌ Switch Network First"
                  : isSwitchingChain
                  ? "Switching Network..."
                  : isPending || isConfirming
                  ? "Placing..."
                  : isSuccess
                  ? "Placed!"
                  : "Place Bet"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

