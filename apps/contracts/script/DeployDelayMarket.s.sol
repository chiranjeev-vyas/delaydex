// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {DelayMarket} from "../src/DelayMarket.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";

contract DeployDelayMarketScript is Script {
    function run() public {
        vm.startBroadcast();

        // Option 1: Deploy new Mock USDC if PAYMENT_TOKEN_ADDRESS not set
        // Option 2: Use existing token address from env
        address tokenAddress;
        
        try vm.envAddress("PAYMENT_TOKEN_ADDRESS") returns (address envToken) {
            tokenAddress = envToken;
            console.log("Using existing token from env:", tokenAddress);
        } catch {
            // Deploy Mock USDC
            console.log("Deploying new Mock USDC...");
            MockERC20 usdc = new MockERC20("USD Coin", "USDC", 1000000);
            tokenAddress = address(usdc);
            console.log("Mock USDC deployed at:", tokenAddress);
        }

        DelayMarket market = new DelayMarket(tokenAddress);

        console.log("DelayMarket deployed at:", address(market));
        console.log("Payment token (USDC):", tokenAddress);
        
        vm.stopBroadcast();
    }
}

