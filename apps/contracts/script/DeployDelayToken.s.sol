// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {DelayToken} from "../src/DelayToken.sol";

contract DeployDelayTokenScript is Script {
    function run() public {
        vm.startBroadcast();

        // Deploy DELAY token with 1 million initial supply
        uint256 initialSupply = 1000000; // 1,000,000 DELAY tokens
        DelayToken delayToken = new DelayToken(initialSupply);

        console.log("DELAY Token deployed at:", address(delayToken));
        console.log("Token Name:", delayToken.name());
        console.log("Token Symbol:", delayToken.symbol());
        console.log("Initial Supply:", initialSupply, "DELAY");
        console.log("Total Supply (wei):", delayToken.totalSupply());
        
        vm.stopBroadcast();
    }
}

