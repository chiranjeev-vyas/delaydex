// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {DelayMarket} from "../src/DelayMarket.sol";
import {DelayToken} from "../src/DelayToken.sol";

contract SeedMarketsWithData is Script {
    function run() external {
        vm.startBroadcast();
        
        address contractAddress = vm.envAddress("CONTRACT_ADDRESS");
        DelayMarket market = DelayMarket(contractAddress);
        
        address tokenAddress = market.paymentToken();
        DelayToken token = DelayToken(tokenAddress);
        
        // Mint tokens to deployer if needed
        uint256 deployerBalance = token.balanceOf(msg.sender);
        if (deployerBalance < 100000e18) {
            token.mint(msg.sender, 100000e18);
        }
        
        // Approve token spending
        token.approve(contractAddress, type(uint256).max);
        
        // Create markets and add sample bets
        _createAndSeedMarket(market, token, "AF1019", "FRA", "CDG", "AF", "2025-11-03T07:05:00.000Z");
        _createAndSeedMarket(market, token, "TK3242", "IST", "EZE", "TK", "2025-11-21T12:10:00.000Z");
        _createAndSeedMarket(market, token, "AA6677", "JFK", "LAX", "AA", "2025-11-29T12:10:00.000Z");
        
        vm.stopBroadcast();
    }
    
    function _createAndSeedMarket(
        DelayMarket market,
        DelayToken token,
        string memory flightNumber,
        string memory originCode,
        string memory destinationCode,
        string memory airlineCode,
        string memory scheduledDeparture
    ) internal {
        bytes32 marketId;
        
        // Try to create market (might already exist)
        try market.openMarket(flightNumber, originCode, destinationCode, airlineCode, scheduledDeparture) returns (bytes32 id) {
            marketId = id;
        } catch {
            // Market exists, compute ID
            marketId = market.computeMarketId(flightNumber, originCode, destinationCode, airlineCode, scheduledDeparture);
        }
        
        // Add sample bets to populate data
        // Market 1: AF1019 - Add bets like in screenshot
        if (keccak256(bytes(flightNumber)) == keccak256(bytes("AF1019"))) {
            // On Time: YES 276, NO 483 (prices will auto-calculate)
            _placeBet(market, marketId, DelayMarket.DelayOutcome.OnTime, DelayMarket.BetPosition.Yes, 276e18);
            _placeBet(market, marketId, DelayMarket.DelayOutcome.OnTime, DelayMarket.BetPosition.No, 483e18);
            
            // 30+ delay: YES 70, NO 25
            _placeBet(market, marketId, DelayMarket.DelayOutcome.DelayedShort, DelayMarket.BetPosition.Yes, 70e18);
            _placeBet(market, marketId, DelayMarket.DelayOutcome.DelayedShort, DelayMarket.BetPosition.No, 25e18);
            
            // 120+ delay: YES 50, NO 2070
            _placeBet(market, marketId, DelayMarket.DelayOutcome.DelayedLong, DelayMarket.BetPosition.Yes, 50e18);
            _placeBet(market, marketId, DelayMarket.DelayOutcome.DelayedLong, DelayMarket.BetPosition.No, 2070e18);
        }
        
        // Market 3: AA6677 - Add bets
        if (keccak256(bytes(flightNumber)) == keccak256(bytes("AA6677"))) {
            // On Time: YES 67, NO 345
            _placeBet(market, marketId, DelayMarket.DelayOutcome.OnTime, DelayMarket.BetPosition.Yes, 67e18);
            _placeBet(market, marketId, DelayMarket.DelayOutcome.OnTime, DelayMarket.BetPosition.No, 345e18);
            
            // 30+ delay: YES 120, NO 30
            _placeBet(market, marketId, DelayMarket.DelayOutcome.DelayedShort, DelayMarket.BetPosition.Yes, 120e18);
            _placeBet(market, marketId, DelayMarket.DelayOutcome.DelayedShort, DelayMarket.BetPosition.No, 30e18);
            
            // 120+ delay: YES 10, NO 120
            _placeBet(market, marketId, DelayMarket.DelayOutcome.DelayedLong, DelayMarket.BetPosition.Yes, 10e18);
            _placeBet(market, marketId, DelayMarket.DelayOutcome.DelayedLong, DelayMarket.BetPosition.No, 120e18);
        }
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
            // Ignore errors (might be market closed or other issues)
        }
    }
}

