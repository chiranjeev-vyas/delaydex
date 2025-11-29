// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {DelayMarket} from "../src/DelayMarket.sol";
import {DelayToken} from "../src/DelayToken.sol";

contract DeployDelayMarketWithTokenScript is Script {
    function run() public {
        vm.startBroadcast();

        // Option 1: Deploy new DELAY token if not provided
        // Option 2: Use existing token address from env
        address tokenAddress;
        
        try vm.envAddress("DELAY_TOKEN_ADDRESS") returns (address envToken) {
            tokenAddress = envToken;
            console.log("Using existing DELAY token from env:", tokenAddress);
        } catch {
            // Deploy new DELAY token
            console.log("Deploying new DELAY token...");
            uint256 initialSupply = 1000000; // 1,000,000 DELAY tokens
            DelayToken delayToken = new DelayToken(initialSupply);
            tokenAddress = address(delayToken);
            console.log("DELAY Token deployed at:", tokenAddress);
        }

        // Deploy DelayMarket with DELAY token
        DelayMarket market = new DelayMarket(tokenAddress);

        console.log("DelayMarket deployed at:", address(market));
        console.log("Payment token (DELAY):", tokenAddress);
        
        vm.stopBroadcast();
    }
}

