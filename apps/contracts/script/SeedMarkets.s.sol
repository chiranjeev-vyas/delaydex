// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {DelayMarket} from "../src/DelayMarket.sol";

contract SeedMarkets is Script {
    function run() external {
        address contractAddress = vm.envAddress("CONTRACT_ADDRESS");
        DelayMarket market = DelayMarket(contractAddress);

        console.log("Seeding markets on contract:", contractAddress);

        // Popular Indian routes
        _createMarket(market, "AI101", "DEL", "BOM", "AI", "2025-02-15T08:00:00Z"); // Delhi-Mumbai Air India
        _createMarket(market, "6E205", "BOM", "DEL", "6E", "2025-02-15T10:30:00Z"); // Mumbai-Delhi IndiGo
        _createMarket(market, "UK801", "DEL", "BLR", "UK", "2025-02-16T09:15:00Z"); // Delhi-Bangalore Vistara
        _createMarket(market, "SG301", "BOM", "BLR", "SG", "2025-02-16T11:45:00Z"); // Mumbai-Bangalore SpiceJet
        _createMarket(market, "AI401", "DEL", "HYD", "AI", "2025-02-17T07:30:00Z"); // Delhi-Hyderabad Air India
        _createMarket(market, "6E501", "BOM", "MAA", "6E", "2025-02-17T13:20:00Z"); // Mumbai-Chennai IndiGo
        _createMarket(market, "UK701", "DEL", "CCU", "UK", "2025-02-18T06:00:00Z"); // Delhi-Kolkata Vistara
        _createMarket(market, "SG201", "BOM", "GOI", "SG", "2025-02-18T14:30:00Z"); // Mumbai-Goa SpiceJet

        // International routes
        _createMarket(market, "EK501", "DEL", "DXB", "EK", "2025-02-19T02:30:00Z"); // Delhi-Dubai Emirates
        _createMarket(market, "BA138", "BOM", "LHR", "BA", "2025-02-19T23:45:00Z"); // Mumbai-London British Airways
        _createMarket(market, "AI173", "DEL", "JFK", "AI", "2025-02-20T01:15:00Z"); // Delhi-New York Air India
        _createMarket(market, "SQ401", "BOM", "SIN", "SQ", "2025-02-20T08:00:00Z"); // Mumbai-Singapore Singapore Airlines
        _createMarket(market, "EK201", "DEL", "DXB", "EK", "2025-02-21T03:00:00Z"); // Delhi-Dubai Emirates
        _createMarket(market, "QF301", "BOM", "SYD", "QF", "2025-02-21T20:30:00Z"); // Mumbai-Sydney Qantas

        console.log("✅ All markets seeded successfully!");
    }

    function _createMarket(
        DelayMarket market,
        string memory flightNumber,
        string memory originCode,
        string memory destinationCode,
        string memory airlineCode,
        string memory scheduledDeparture
    ) internal {
        try market.openMarket(flightNumber, originCode, destinationCode, airlineCode, scheduledDeparture) returns (bytes32 marketId) {
            console.log("Created market:", flightNumber, originCode, destinationCode, marketId);
        } catch {
            console.log("Market already exists or error:", flightNumber);
        }
    }
}

