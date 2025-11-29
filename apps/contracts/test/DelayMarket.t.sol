// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {DelayMarket} from "../src/DelayMarket.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";

contract DelayMarketTest is Test {
    DelayMarket public market;
    MockERC20 public token;

    address public owner;
    address public user1;
    address public user2;

    bytes32 public marketId;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        token = new MockERC20("Test Token", "TEST", 1000000);
        market = new DelayMarket(address(token));

        token.mint(user1, 10000 ether);
        token.mint(user2, 10000 ether);

        marketId = market.openMarket("AA100", "JFK", "LAX", "AA", "2024-12-25T10:00:00");
    }

    function testOpenMarket() public {
        bytes32 newMarketId = market.openMarket("UA200", "LAX", "ORD", "UA", "2024-12-26T15:30:00");
        DelayMarket.MarketData memory data = market.getMarketData(newMarketId);

        assertEq(data.flightNumber, "UA200");
        assertEq(data.originCode, "LAX");
        assertEq(data.destinationCode, "ORD");
    }

    function testPlaceYesBet() public {
        uint256 shares = 100 ether;
        uint256 price = 0.30 ether;

        vm.startPrank(user1);
        token.approve(address(market), 30 ether);
        market.placeBet(
            marketId,
            DelayMarket.DelayOutcome.OnTime,
            DelayMarket.BetPosition.Yes,
            shares,
            price
        );
        vm.stopPrank();

        uint256 userBet = market.getUserBet(marketId, user1, DelayMarket.DelayOutcome.OnTime, DelayMarket.BetPosition.Yes);
        assertEq(userBet, shares, "User should have 100 YES shares");
    }

    function testPlaceNoBet() public {
        uint256 shares = 50 ether;
        uint256 price = 0.70 ether;

        vm.startPrank(user1);
        token.approve(address(market), 35 ether);
        market.placeBet(
            marketId,
            DelayMarket.DelayOutcome.OnTime,
            DelayMarket.BetPosition.No,
            shares,
            price
        );
        vm.stopPrank();

        uint256 userBet = market.getUserBet(marketId, user1, DelayMarket.DelayOutcome.OnTime, DelayMarket.BetPosition.No);
        assertEq(userBet, shares, "User should have 50 NO shares");
    }

    function testSellBet() public {
        uint256 shares = 100 ether;
        uint256 buyPrice = 0.25 ether;
        uint256 sellPrice = 0.30 ether;

        vm.startPrank(user1);
        token.approve(address(market), 25 ether);
        market.placeBet(
            marketId,
            DelayMarket.DelayOutcome.OnTime,
            DelayMarket.BetPosition.Yes,
            shares,
            buyPrice
        );

        uint256 sharesToSell = 50 ether;
        uint256 balanceBefore = token.balanceOf(user1);
        market.sellBet(
            marketId,
            DelayMarket.DelayOutcome.OnTime,
            DelayMarket.BetPosition.Yes,
            sharesToSell,
            sellPrice
        );
        uint256 balanceAfter = token.balanceOf(user1);
        vm.stopPrank();

        assertEq(balanceAfter - balanceBefore, 15 ether, "Should receive 15 tokens");
        assertEq(
            market.getUserBet(marketId, user1, DelayMarket.DelayOutcome.OnTime, DelayMarket.BetPosition.Yes),
            50 ether,
            "Should have 50 shares left"
        );
    }

    function testClaimWinningsYes() public {
        uint256 shares = 100 ether;
        uint256 price = 0.30 ether;

        vm.startPrank(user1);
        token.approve(address(market), 30 ether);
        market.placeBet(
            marketId,
            DelayMarket.DelayOutcome.OnTime,
            DelayMarket.BetPosition.Yes,
            shares,
            price
        );
        vm.stopPrank();

        market.closeMarket(marketId, DelayMarket.DelayOutcome.OnTime);

        uint256 balanceBefore = token.balanceOf(user1);
        vm.prank(user1);
        market.claimWinnings(marketId);
        uint256 balanceAfter = token.balanceOf(user1);

        assertEq(balanceAfter - balanceBefore, shares, "Should win $100");
    }

    function testClaimWinningsNo() public {
        uint256 shares = 50 ether;
        uint256 price = 0.70 ether;

        vm.startPrank(user1);
        token.approve(address(market), 35 ether);
        market.placeBet(
            marketId,
            DelayMarket.DelayOutcome.OnTime,
            DelayMarket.BetPosition.No,
            shares,
            price
        );
        vm.stopPrank();

        market.closeMarket(marketId, DelayMarket.DelayOutcome.DelayedShort);

        uint256 balanceBefore = token.balanceOf(user1);
        vm.prank(user1);
        market.claimWinnings(marketId);
        uint256 balanceAfter = token.balanceOf(user1);

        assertEq(balanceAfter - balanceBefore, shares, "Should win $50");
    }

    function testGetPrice() public {
        uint256 yesPrice = market.getPrice(marketId, DelayMarket.DelayOutcome.OnTime, DelayMarket.BetPosition.Yes);
        uint256 noPrice = market.getPrice(marketId, DelayMarket.DelayOutcome.OnTime, DelayMarket.BetPosition.No);

        assertEq(yesPrice, 0.5 ether, "Initial YES price should be 50%");
        assertEq(noPrice, 0.5 ether, "Initial NO price should be 50%");
    }

    function testCannotBetAfterClose() public {
        market.closeMarket(marketId, DelayMarket.DelayOutcome.OnTime);

        vm.startPrank(user1);
        token.approve(address(market), 30 ether);
        vm.expectRevert("Market closed");
        market.placeBet(
            marketId,
            DelayMarket.DelayOutcome.OnTime,
            DelayMarket.BetPosition.Yes,
            100 ether,
            0.30 ether
        );
        vm.stopPrank();
    }

    function testGetAllMarkets() public {
        market.openMarket("DL456", "ATL", "MIA", "DL", "2024-12-30T14:00:00");

        DelayMarket.MarketData[] memory markets = market.getAllMarkets();
        assertEq(markets.length, 2, "Should have 2 markets");
        assertEq(markets[0].flightNumber, "AA100");
        assertEq(markets[1].flightNumber, "DL456");
    }
}

