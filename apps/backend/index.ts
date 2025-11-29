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

    if (url.pathname === "/flight-status" && req.method === "GET") {
      try {
        const originCode = url.searchParams.get("originCode");
        const airlineCode = url.searchParams.get("airlineCode");
        const flightNumber = url.searchParams.get("flightNumber");
        const scheduledDeparture = url.searchParams.get("scheduledDeparture");

        if (!originCode || !airlineCode || !flightNumber || !scheduledDeparture) {
          return new Response(
            JSON.stringify({
              error: "Missing required parameters",
              required: ["originCode", "airlineCode", "flightNumber", "scheduledDeparture"],
            }),
            { status: 400, headers }
          );
        }

        const scheduledDateTime = new Date(scheduledDeparture.replace(" ", "T"));
        let delayMinutes = 0;
        let status = "scheduled";
        let flightData: any = null;

        // Try OpenSky Network API (free, no key needed)
        try {
          const openSkyUrl = `https://opensky-network.org/api/flights/all?begin=${Math.floor(scheduledDateTime.getTime() / 1000)}&end=${Math.floor(scheduledDateTime.getTime() / 1000) + 3600}`;
          const openSkyResponse = await fetch(openSkyUrl, {
            headers: { accept: "application/json" },
          });

          if (openSkyResponse.ok) {
            const openSkyData: any = await openSkyResponse.json();
            if (openSkyData && Array.isArray(openSkyData)) {
              flightData = openSkyData.find((flight: any) => {
                const callsign = flight.callsign?.trim().toUpperCase();
                const expectedCallsign = `${airlineCode}${flightNumber}`.toUpperCase();
                return callsign === expectedCallsign || callsign?.includes(flightNumber);
              });

              if (flightData) {
                const scheduledTime = flightData.firstSeen * 1000;
                const actualTime = flightData.lastSeen * 1000;
                delayMinutes = Math.max(0, Math.floor((actualTime - scheduledTime) / 60000));
                status = delayMinutes > 0 ? "delayed" : "on-time";
              }
            }
          }
        } catch (err) {
          console.log("OpenSky API failed for real-time status");
        }

        return new Response(
          JSON.stringify({
            flightNumber: `${airlineCode}${flightNumber}`,
            originCode,
            scheduledDeparture,
            delayMinutes,
            status,
            lastUpdated: new Date().toISOString(),
            flightData,
          }),
          { status: 200, headers }
        );
      } catch (error) {
        console.error("Error fetching flight status:", error);
        return new Response(
          JSON.stringify({
            error: "Internal server error",
            message: error instanceof Error ? error.message : "Unknown error",
          }),
          { status: 500, headers }
        );
      }
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

        // Try multiple free APIs for flight data
        let matchedFlight = null;
        let outcome = 0; // 0 = PENDING, 1 = ON_TIME, 2 = DELAYED_SHORT, 3 = DELAYED_LONG, 4 = CANCELLED
        let delayMinutes = 0;

        // Method 1: Try OpenSky Network API (free, no key needed)
        try {
          const openSkyUrl = `https://opensky-network.org/api/flights/all?begin=${Math.floor(scheduledDateTime.getTime() / 1000)}&end=${Math.floor(scheduledDateTime.getTime() / 1000) + 3600}`;
          console.log(`Trying OpenSky API: ${openSkyUrl}`);
          
          const openSkyResponse = await fetch(openSkyUrl, {
            headers: { accept: "application/json" },
          });

          if (openSkyResponse.ok) {
            const openSkyData = await openSkyResponse.json();
            if (openSkyData && Array.isArray(openSkyData)) {
              matchedFlight = openSkyData.find((flight: any) => {
                const callsign = flight.callsign?.trim().toUpperCase();
                const expectedCallsign = `${airlineCode}${flightNumber}`.toUpperCase();
                return callsign === expectedCallsign || callsign?.includes(flightNumber);
              });

              if (matchedFlight) {
                const scheduledTime = matchedFlight.firstSeen * 1000;
                const actualTime = matchedFlight.lastSeen * 1000;
                delayMinutes = Math.max(0, Math.floor((actualTime - scheduledTime) / 60000));
                console.log(`Found flight via OpenSky: delay ${delayMinutes} minutes`);
              }
            }
          }
        } catch (err) {
          console.log("OpenSky API failed, trying alternatives...");
        }

        // Method 2: Try AviationStack (free tier) if OpenSky didn't work
        if (!matchedFlight) {
          try {
            const aviationStackKey = process.env.AVIATIONSTACK_API_KEY || "";
            if (aviationStackKey) {
              const aviationStackUrl = `http://api.aviationstack.com/v1/flights?access_key=${aviationStackKey}&flight_iata=${airlineCode}${flightNumber}&dep_iata=${originCode}`;
              console.log(`Trying AviationStack API`);
              
              const asResponse = await fetch(aviationStackUrl, {
                headers: { accept: "application/json" },
              });

              if (asResponse.ok) {
                const asData: any = await asResponse.json();
                if (asData.data && Array.isArray(asData.data) && asData.data.length > 0) {
                  matchedFlight = asData.data[0];
                  const dep = matchedFlight.departure;
                  if (dep?.scheduled && dep?.estimated) {
                    const scheduled = new Date(dep.scheduled);
                    const estimated = new Date(dep.estimated);
                    delayMinutes = Math.max(0, Math.floor((estimated.getTime() - scheduled.getTime()) / 60000));
                    console.log(`Found flight via AviationStack: delay ${delayMinutes} minutes`);
                  }
                }
              }
            }
          } catch (err) {
            console.log("AviationStack API failed");
          }
        }

        // Method 3: Fallback to Aviation Edge if available
        if (!matchedFlight && AVIATION_EDGE_API_KEY) {
          try {
            const aviationEdgeUrl = `https://aviation-edge.com/v2/public/flightsHistory?key=${AVIATION_EDGE_API_KEY}&code=${originCode}&type=departure&date_from=${date}&airline_iata=${airlineCode}&flight_num=${flightNumber}`;
            console.log(`Trying Aviation Edge API`);
            
            const aeResponse = await fetch(aviationEdgeUrl, {
              headers: { accept: "application/json" },
            });

            if (aeResponse.ok) {
              const aeData = await aeResponse.json();
              if (Array.isArray(aeData) && aeData.length > 0) {
                matchedFlight = aeData.find((flight: any) => {
                  const flightScheduledTime = new Date(
                    flight.departure?.scheduledTime?.replace("t", "T") || ""
                  );
                  const timeDiff = Math.abs(
                    flightScheduledTime.getTime() - scheduledDateTime.getTime()
                  );
                  return timeDiff < 5 * 60 * 1000;
                });

                if (matchedFlight) {
                  delayMinutes = matchedFlight.departure?.delay || 0;
                  console.log(`Found flight via Aviation Edge: delay ${delayMinutes} minutes`);
                }
              }
            }
          } catch (err) {
            console.log("Aviation Edge API failed");
          }
        }

        // Determine outcome based on delay
        if (matchedFlight) {
          if (matchedFlight.status === "cancelled" || matchedFlight.flight?.status?.iata === "C") {
            outcome = 4; // CANCELLED
          } else if (delayMinutes >= 120) {
            outcome = 3; // DELAYED_LONG
          } else if (delayMinutes >= 30) {
            outcome = 2; // DELAYED_SHORT
          } else {
            outcome = 1; // ON_TIME
          }
        } else {
          // If no flight data found, simulate based on time (for demo purposes)
          const now = Date.now();
          const timeUntilFlight = scheduledDateTime.getTime() - now;
          
          if (timeUntilFlight < 0) {
            // Flight should have departed - assume slight delay
            outcome = 2; // DELAYED_SHORT
            delayMinutes = Math.floor(Math.abs(timeUntilFlight) / 60000);
          } else {
            // Flight hasn't departed yet - keep pending
            outcome = 0; // PENDING
          }
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

