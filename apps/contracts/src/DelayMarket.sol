// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title DelayMarket
 * @notice Decentralized prediction market for flight delays
 * @dev Users can bet on flight outcomes with YES/NO positions
 */
contract DelayMarket {
    enum DelayOutcome {
        Pending,
        OnTime,
        DelayedShort,
        DelayedLong,
        Cancelled
    }

    enum BetPosition {
        Yes,
        No
    }

    struct FlightMarket {
        string flightNumber;
        string originCode;
        string destinationCode;
        string airlineCode;
        string scheduledDeparture;
        DelayOutcome finalOutcome;
        uint256 onTimeYes;
        uint256 onTimeNo;
        uint256 delayedShortYes;
        uint256 delayedShortNo;
        uint256 delayedLongYes;
        uint256 delayedLongNo;
        uint256 cancelledYes;
        uint256 cancelledNo;
    }

    mapping(bytes32 => mapping(address => mapping(DelayOutcome => mapping(BetPosition => uint256)))) public userBets;
    mapping(bytes32 => FlightMarket) public markets;
    mapping(bytes32 => mapping(address => bool)) public claimed;
    mapping(address => bool) public resolvers;

    bytes32[] public marketIds;
    address public owner;
    address public paymentToken;

    event MarketOpened(bytes32 indexed marketId, string flightNumber);
    event MarketClosed(bytes32 indexed marketId, DelayOutcome outcome);
    event BetPlaced(
        bytes32 indexed marketId,
        address indexed bettor,
        DelayOutcome outcome,
        BetPosition position,
        uint256 shares,
        uint256 cost,
        uint256 price
    );
    event BetSold(
        bytes32 indexed marketId,
        address indexed bettor,
        DelayOutcome outcome,
        BetPosition position,
        uint256 shares,
        uint256 payout,
        uint256 price
    );
    event WinningsClaimed(bytes32 indexed marketId, address indexed winner, uint256 amount);

    constructor(address _paymentToken) {
        owner = msg.sender;
        resolvers[msg.sender] = true;
        paymentToken = _paymentToken;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyResolver() {
        require(resolvers[msg.sender], "Not a resolver");
        _;
    }

    modifier isActive(bytes32 marketId) {
        require(markets[marketId].finalOutcome == DelayOutcome.Pending, "Market closed");
        _;
    }

    function addResolver(address resolver) external onlyOwner {
        resolvers[resolver] = true;
    }

    function removeResolver(address resolver) external onlyOwner {
        resolvers[resolver] = false;
    }

    function computeMarketId(
        string memory flightNumber,
        string memory originCode,
        string memory destinationCode,
        string memory airlineCode,
        string memory scheduledDeparture
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(flightNumber, originCode, destinationCode, airlineCode, scheduledDeparture));
    }

    function openMarket(
        string memory flightNumber,
        string memory originCode,
        string memory destinationCode,
        string memory airlineCode,
        string memory scheduledDeparture
    ) external returns (bytes32) {
        bytes32 marketId = computeMarketId(flightNumber, originCode, destinationCode, airlineCode, scheduledDeparture);
        require(bytes(markets[marketId].flightNumber).length == 0, "Market exists");

        markets[marketId] = FlightMarket({
            flightNumber: flightNumber,
            originCode: originCode,
            destinationCode: destinationCode,
            airlineCode: airlineCode,
            scheduledDeparture: scheduledDeparture,
            finalOutcome: DelayOutcome.Pending,
            onTimeYes: 0,
            onTimeNo: 0,
            delayedShortYes: 0,
            delayedShortNo: 0,
            delayedLongYes: 0,
            delayedLongNo: 0,
            cancelledYes: 0,
            cancelledNo: 0
        });

        marketIds.push(marketId);
        emit MarketOpened(marketId, flightNumber);
        return marketId;
    }

    function placeBet(
        bytes32 marketId,
        DelayOutcome outcome,
        BetPosition position,
        uint256 shares,
        uint256 pricePerShare
    ) external isActive(marketId) {
        require(outcome != DelayOutcome.Pending, "Invalid outcome");
        require(shares > 0, "Shares must be > 0");
        require(pricePerShare > 0 && pricePerShare < 1e18, "Invalid price");

        uint256 cost = (shares * pricePerShare) / 1e18;
        require(cost > 0, "Cost too small");
        require(IERC20(paymentToken).transferFrom(msg.sender, address(this), cost), "Transfer failed");

        FlightMarket storage market = markets[marketId];
        _updateMarketShares(market, outcome, position, _getMarketShares(market, outcome, position) + shares);

        userBets[marketId][msg.sender][outcome][position] += shares;

        emit BetPlaced(marketId, msg.sender, outcome, position, shares, cost, pricePerShare);
    }

    function sellBet(
        bytes32 marketId,
        DelayOutcome outcome,
        BetPosition position,
        uint256 shares,
        uint256 pricePerShare
    ) external isActive(marketId) {
        require(outcome != DelayOutcome.Pending, "Invalid outcome");
        require(shares > 0, "Shares must be > 0");
        require(pricePerShare > 0 && pricePerShare < 1e18, "Invalid price");
        require(userBets[marketId][msg.sender][outcome][position] >= shares, "Insufficient shares");

        uint256 payout = (shares * pricePerShare) / 1e18;
        require(payout > 0, "Payout too small");
        require(IERC20(paymentToken).balanceOf(address(this)) >= payout, "Insufficient liquidity");

        FlightMarket storage market = markets[marketId];
        _updateMarketShares(market, outcome, position, _getMarketShares(market, outcome, position) - shares);

        userBets[marketId][msg.sender][outcome][position] -= shares;
        require(IERC20(paymentToken).transfer(msg.sender, payout), "Transfer failed");

        emit BetSold(marketId, msg.sender, outcome, position, shares, payout, pricePerShare);
    }

    function closeMarket(bytes32 marketId, DelayOutcome outcome) external onlyResolver {
        FlightMarket storage market = markets[marketId];
        require(market.finalOutcome == DelayOutcome.Pending, "Already closed");
        require(outcome != DelayOutcome.Pending, "Invalid outcome");

        market.finalOutcome = outcome;
        emit MarketClosed(marketId, outcome);
    }

    function claimWinnings(bytes32 marketId) external {
        FlightMarket storage market = markets[marketId];
        require(market.finalOutcome != DelayOutcome.Pending, "Market not closed");
        require(!claimed[marketId][msg.sender], "Already claimed");

        uint256 totalWinnings = 0;

        uint256 yesShares = userBets[marketId][msg.sender][market.finalOutcome][BetPosition.Yes];
        if (yesShares > 0) {
            totalWinnings += yesShares;
            userBets[marketId][msg.sender][market.finalOutcome][BetPosition.Yes] = 0;
        }

        DelayOutcome[4] memory allOutcomes = [
            DelayOutcome.OnTime,
            DelayOutcome.DelayedShort,
            DelayOutcome.DelayedLong,
            DelayOutcome.Cancelled
        ];

        for (uint256 i = 0; i < 4; i++) {
            if (allOutcomes[i] != market.finalOutcome) {
                uint256 noShares = userBets[marketId][msg.sender][allOutcomes[i]][BetPosition.No];
                if (noShares > 0) {
                    totalWinnings += noShares;
                    userBets[marketId][msg.sender][allOutcomes[i]][BetPosition.No] = 0;
                }
            }
        }

        require(totalWinnings > 0, "No winnings");
        claimed[marketId][msg.sender] = true;
        require(IERC20(paymentToken).transfer(msg.sender, totalWinnings), "Transfer failed");
        emit WinningsClaimed(marketId, msg.sender, totalWinnings);
    }

    function getPrice(bytes32 marketId, DelayOutcome outcome, BetPosition position) public view returns (uint256) {
        if (outcome == DelayOutcome.Pending) return 0;

        FlightMarket storage market = markets[marketId];
        uint256 yesShares = _getMarketShares(market, outcome, BetPosition.Yes);
        uint256 noShares = _getMarketShares(market, outcome, BetPosition.No);
        uint256 total = yesShares + noShares;

        if (total == 0) {
            return 500000000000000000; // 0.5 * 1e18
        }

        if (position == BetPosition.Yes) {
            return (yesShares * 1e18) / total;
        } else {
            return (noShares * 1e18) / total;
        }
    }

    function _getMarketShares(FlightMarket storage market, DelayOutcome outcome, BetPosition position) internal view returns (uint256) {
        if (outcome == DelayOutcome.OnTime) {
            return position == BetPosition.Yes ? market.onTimeYes : market.onTimeNo;
        } else if (outcome == DelayOutcome.DelayedShort) {
            return position == BetPosition.Yes ? market.delayedShortYes : market.delayedShortNo;
        } else if (outcome == DelayOutcome.DelayedLong) {
            return position == BetPosition.Yes ? market.delayedLongYes : market.delayedLongNo;
        } else if (outcome == DelayOutcome.Cancelled) {
            return position == BetPosition.Yes ? market.cancelledYes : market.cancelledNo;
        }
        return 0;
    }

    function _updateMarketShares(FlightMarket storage market, DelayOutcome outcome, BetPosition position, uint256 newShares) internal {
        if (outcome == DelayOutcome.OnTime) {
            if (position == BetPosition.Yes) market.onTimeYes = newShares;
            else market.onTimeNo = newShares;
        } else if (outcome == DelayOutcome.DelayedShort) {
            if (position == BetPosition.Yes) market.delayedShortYes = newShares;
            else market.delayedShortNo = newShares;
        } else if (outcome == DelayOutcome.DelayedLong) {
            if (position == BetPosition.Yes) market.delayedLongYes = newShares;
            else market.delayedLongNo = newShares;
        } else if (outcome == DelayOutcome.Cancelled) {
            if (position == BetPosition.Yes) market.cancelledYes = newShares;
            else market.cancelledNo = newShares;
        }
    }

    struct MarketData {
        bytes32 marketId;
        string flightNumber;
        string originCode;
        string destinationCode;
        string airlineCode;
        string scheduledDeparture;
        DelayOutcome finalOutcome;
        OutcomeData onTime;
        OutcomeData delayedShort;
        OutcomeData delayedLong;
        OutcomeData cancelled;
    }

    struct OutcomeData {
        uint256 yesShares;
        uint256 noShares;
        uint256 yesPrice;
        uint256 noPrice;
    }

    function getMarketData(bytes32 marketId) external view returns (MarketData memory) {
        require(bytes(markets[marketId].flightNumber).length > 0, "Market not found");
        FlightMarket storage market = markets[marketId];

        return MarketData({
            marketId: marketId,
            flightNumber: market.flightNumber,
            originCode: market.originCode,
            destinationCode: market.destinationCode,
            airlineCode: market.airlineCode,
            scheduledDeparture: market.scheduledDeparture,
            finalOutcome: market.finalOutcome,
            onTime: _getOutcomeData(market, DelayOutcome.OnTime),
            delayedShort: _getOutcomeData(market, DelayOutcome.DelayedShort),
            delayedLong: _getOutcomeData(market, DelayOutcome.DelayedLong),
            cancelled: _getOutcomeData(market, DelayOutcome.Cancelled)
        });
    }

    function getAllMarkets() external view returns (MarketData[] memory) {
        MarketData[] memory allMarkets = new MarketData[](marketIds.length);
        for (uint256 i = 0; i < marketIds.length; i++) {
            allMarkets[i] = this.getMarketData(marketIds[i]);
        }
        return allMarkets;
    }

    function _getOutcomeData(FlightMarket storage market, DelayOutcome outcome) internal view returns (OutcomeData memory) {
        uint256 yesShares = _getMarketShares(market, outcome, BetPosition.Yes);
        uint256 noShares = _getMarketShares(market, outcome, BetPosition.No);
        uint256 total = yesShares + noShares;

        uint256 yesPrice;
        uint256 noPrice;

        if (total == 0) {
            yesPrice = 500000000000000000;
            noPrice = 500000000000000000;
        } else {
            yesPrice = (yesShares * 1e18) / total;
            noPrice = (noShares * 1e18) / total;
        }

        return OutcomeData({
            yesShares: yesShares,
            noShares: noShares,
            yesPrice: yesPrice,
            noPrice: noPrice
        });
    }

    function getMarketCount() external view returns (uint256) {
        return marketIds.length;
    }

    function getUserBet(bytes32 marketId, address user, DelayOutcome outcome, BetPosition position) external view returns (uint256) {
        return userBets[marketId][user][outcome][position];
    }
}

