// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {DelayMarket} from "../src/DelayMarket.sol";
import {DelayToken} from "../src/DelayToken.sol";

contract AddSampleBets is Script {
    function run() external {
        vm.startBroadcast();
        
        address contractAddress = vm.envAddress("CONTRACT_ADDRESS");
        DelayMarket market = DelayMarket(contractAddress);
        
        address tokenAddress = market.paymentToken();
        DelayToken token = DelayToken(tokenAddress);
        
        // Mint tokens if needed
        uint256 deployerBalance = token.balanceOf(msg.sender);
        if (deployerBalance < 100000e18) {
            token.mint(msg.sender, 100000e18);
        }
        
        // Approve token spending
        token.approve(contractAddress, type(uint256).max);
        
        // Add bets to existing markets
        bytes32 ai101 = market.computeMarketId("AI101", "DEL", "BOM", "AI", "2025-02-15T08:00:00Z");
        bytes32 e205 = market.computeMarketId("6E205", "BOM", "DEL", "6E", "2025-02-15T10:30:00Z");
        
        // Add sample bets to AI101
        _placeBet(market, ai101, DelayMarket.DelayOutcome.OnTime, DelayMarket.BetPosition.Yes, 100e18);
        _placeBet(market, ai101, DelayMarket.DelayOutcome.OnTime, DelayMarket.BetPosition.No, 150e18);
        _placeBet(market, ai101, DelayMarket.DelayOutcome.DelayedShort, DelayMarket.BetPosition.Yes, 80e18);
        _placeBet(market, ai101, DelayMarket.DelayOutcome.DelayedShort, DelayMarket.BetPosition.No, 120e18);
        _placeBet(market, ai101, DelayMarket.DelayOutcome.DelayedLong, DelayMarket.BetPosition.Yes, 30e18);
        _placeBet(market, ai101, DelayMarket.DelayOutcome.DelayedLong, DelayMarket.BetPosition.No, 200e18);
        
        // Add sample bets to 6E205
        _placeBet(market, e205, DelayMarket.DelayOutcome.OnTime, DelayMarket.BetPosition.Yes, 120e18);
        _placeBet(market, e205, DelayMarket.DelayOutcome.OnTime, DelayMarket.BetPosition.No, 180e18);
        _placeBet(market, e205, DelayMarket.DelayOutcome.DelayedShort, DelayMarket.BetPosition.Yes, 90e18);
        _placeBet(market, e205, DelayMarket.DelayOutcome.DelayedShort, DelayMarket.BetPosition.No, 110e18);
        _placeBet(market, e205, DelayMarket.DelayOutcome.DelayedLong, DelayMarket.BetPosition.Yes, 40e18);
        _placeBet(market, e205, DelayMarket.DelayOutcome.DelayedLong, DelayMarket.BetPosition.No, 160e18);
        
        vm.stopBroadcast();
    }
    
    function _placeBet(
        DelayMarket market,
        bytes32 marketId,
        DelayMarket.DelayOutcome outcome,
        DelayMarket.BetPosition position,
        uint256 shares
    ) internal {
        // Get current price from market
        uint256 pricePerShare = market.getPrice(marketId, outcome, position);
        if (pricePerShare == 0) {
            pricePerShare = 5e17; // Default 50% if no price
        }
        
        try market.placeBet(marketId, outcome, position, shares, pricePerShare) {
            // Bet placed successfully
        } catch {
            // Ignore errors
        }
    }
}

