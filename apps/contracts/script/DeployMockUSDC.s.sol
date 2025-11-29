// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";

contract DeployMockUSDCScript is Script {
    function run() public {
        vm.startBroadcast();

        // Deploy Mock USDC token
        MockERC20 usdc = new MockERC20("USD Coin", "USDC", 1000000); // 1M USDC

        console.log("Mock USDC deployed at:", address(usdc));
        console.log("Name:", usdc.name());
        console.log("Symbol:", usdc.symbol());
        console.log("Total Supply:", usdc.totalSupply());
        
        vm.stopBroadcast();
    }
}

