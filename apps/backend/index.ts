import { createWalletClient, createPublicClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";

// Monad testnet configuration
const MONAD_RPC_URL = process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz";
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as `0x${string}` | undefined;
const AVIATION_EDGE_API_KEY = process.env.AVIATION_EDGE_API_KEY || "2be650-5dfb75";

// Monad testnet chain config
const monadTestnet = {
  id: parseInt(process.env.MONAD_CHAIN_ID || "10143"),
  name: "Monad Testnet",
  network: "monad-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: [MONAD_RPC_URL],
    },
    public: {
      http: [MONAD_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: process.env.MONAD_EXPLORER_URL || "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
};

console.log("🔧 DelayDex Backend Configuration:");
console.log(`  Monad RPC: ${MONAD_RPC_URL ? "✅ Set" : "❌ Missing"}`);
console.log(`  Private Key: ${PRIVATE_KEY ? "✅ Set" : "❌ Missing"}`);
console.log(`  Contract Address: ${CONTRACT_ADDRESS || "❌ Not set"}`);
console.log(`  Aviation API: ${AVIATION_EDGE_API_KEY ? "✅ Set" : "❌ Missing"}`);
console.log("");

const contractAbi = parseAbi([
  "function closeMarket(bytes32 marketId, uint8 outcome) external",
]);

const account = PRIVATE_KEY ? privateKeyToAccount(PRIVATE_KEY) : null;

const walletClient = account
  ? createWalletClient({
      account,
      chain: monadTestnet,
      transport: http(MONAD_RPC_URL),
    })
  : null;

const server = Bun.serve({
  port: process.env.PORT || 4500,
  async fetch(req) {
    const url = new URL(req.url);

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (url.pathname === "/health" && req.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "ok",
          timestamp: new Date().toISOString(),
          service: "delaydex-backend",
          chain: "Monad Testnet",
        }),
        { headers }
      );
    }

    if (url.pathname === "/resolve" && req.method === "GET") {
      try {
        const marketId = url.searchParams.get("marketId");
        const originCode = url.searchParams.get("originCode");
        const dateTime = url.searchParams.get("date");
        const airlineCode = url.searchParams.get("airlineCode");
        const flightNumber = url.searchParams.get("flightNumber");

        if (!marketId || !originCode || !dateTime || !airlineCode || !flightNumber) {
          return new Response(
            JSON.stringify({
              error: "Missing required parameters",
              required: ["marketId", "originCode", "date", "airlineCode", "flightNumber"],
            }),
            { status: 400, headers }
          );
        }

        const date = dateTime.split("T")[0].split(" ")[0];
        const scheduledDateTime = new Date(dateTime.replace(" ", "T"));

        const aviationEdgeUrl = `https://aviation-edge.com/v2/public/flightsHistory?key=${AVIATION_EDGE_API_KEY}&code=${originCode}&type=departure&date_from=${date}&airline_iata=${airlineCode}&flight_num=${flightNumber}`;

        console.log(`Fetching flight data: ${aviationEdgeUrl}`);

        const response = await fetch(aviationEdgeUrl, {
          headers: {
            accept: "application/json",
          },
        });

        if (!response.ok) {
          return new Response(
            JSON.stringify({
              error: "Aviation Edge API error",
              status: response.status,
              statusText: response.statusText,
            }),
            { status: response.status, headers }
          );
        }

        const flightData = await response.json();

        let matchedFlight = null;
        let outcome = 0; // 0 = PENDING, 1 = ON_TIME, 2 = DELAYED_SHORT, 3 = DELAYED_LONG, 4 = CANCELLED

        if (Array.isArray(flightData) && flightData.length > 0) {
          matchedFlight = flightData.find((flight: any) => {
            const flightScheduledTime = new Date(
              flight.departure?.scheduledTime?.replace("t", "T") || ""
            );
            const timeDiff = Math.abs(
              flightScheduledTime.getTime() - scheduledDateTime.getTime()
            );
            return timeDiff < 5 * 60 * 1000;
          });

          if (matchedFlight) {
            const departure = matchedFlight.departure;
            const delayMinutes = departure?.delay || 0;

            if (matchedFlight.status === "cancelled") {
              outcome = 4; // CANCELLED
            } else if (delayMinutes >= 120) {
              outcome = 3; // DELAYED_LONG
            } else if (delayMinutes >= 30) {
              outcome = 2; // DELAYED_SHORT
            } else {
              outcome = 1; // ON_TIME
            }
          }
        }

        if (!matchedFlight) {
          outcome = 2; // Default to delayed if not found
        }

        let txHash = null;

        if (walletClient && CONTRACT_ADDRESS) {
          try {
            console.log(
              `Submitting outcome ${outcome} to Monad Testnet for market ${marketId}`
            );

            const hash = await walletClient.writeContract({
              address: CONTRACT_ADDRESS,
              abi: contractAbi,
              functionName: "closeMarket",
              args: [marketId as `0x${string}`, outcome],
            });

            txHash = hash;
            console.log(`Transaction submitted: ${hash}`);
          } catch (error) {
            console.error("Blockchain submission error:", error);
            return new Response(
              JSON.stringify({
                error: "Blockchain submission failed",
                message: error instanceof Error ? error.message : "Unknown error",
                marketId,
                outcome,
                flight: matchedFlight,
              }),
              { status: 500, headers }
            );
          }
        } else {
          console.warn("Blockchain client not configured, skipping submission");
        }

        return new Response(
          JSON.stringify({
            marketId,
            flight: matchedFlight,
            outcome,
            blockchain: {
              chain: "Monad Testnet",
              txHash,
              submitted: !!txHash,
            },
          }),
          { status: 200, headers }
        );
      } catch (error) {
        console.error("Error:", error);
        return new Response(
          JSON.stringify({
            error: "Internal server error",
            message: error instanceof Error ? error.message : "Unknown error",
          }),
          { status: 500, headers }
        );
      }
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers,
    });
  },
});

console.log(`🚀 DelayDex backend running at http://localhost:${server.port}`);
console.log(`📡 Resolve endpoint: http://localhost:${server.port}/resolve`);
console.log(`💼 Wallet configured: ${!!account}`);
console.log(`⛓️  Chain: Monad Testnet`);

