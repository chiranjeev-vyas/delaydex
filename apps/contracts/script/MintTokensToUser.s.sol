// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {DelayMarket} from "../src/DelayMarket.sol";
import {DelayToken} from "../src/DelayToken.sol";

contract MintTokensToUser is Script {
    function run() external {
        vm.startBroadcast();
        
        // Get token address from env or from contract
        address tokenAddress;
        try vm.envAddress("DELAY_TOKEN_ADDRESS") returns (address envToken) {
            tokenAddress = envToken;
        } catch {
            // Fallback: get from contract
            address contractAddress = vm.envAddress("CONTRACT_ADDRESS");
            DelayMarket market = DelayMarket(contractAddress);
            tokenAddress = market.paymentToken();
        }
        
        DelayToken token = DelayToken(tokenAddress);
        
        // Get user address from env or use deployer
        address userAddress;
        try vm.envAddress("USER_ADDRESS") returns (address user) {
            userAddress = user;
        } catch {
            userAddress = msg.sender;
        }
        
        // Mint tokens to user
        uint256 amount = 10000e18; // 10,000 tokens
        token.mint(userAddress, amount);
        
        console.log("Minted", amount / 1e18, "tokens to", userAddress);
        
        vm.stopBroadcast();
    }
}

