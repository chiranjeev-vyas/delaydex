"use client";

import { useEffect, useState, useRef } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { DELAY_MARKET_CONTRACT_ADDRESS, DELAY_MARKET_ABI } from "@/lib/contract";
import { useReadContract } from "wagmi";

const SAMPLE_FLIGHTS = [
  { flightNumber: "AI101", originCode: "DEL", destinationCode: "BOM", airlineCode: "AI", scheduledDeparture: "2025-02-15T08:00:00Z" },
  { flightNumber: "6E205", originCode: "BOM", destinationCode: "DEL", airlineCode: "6E", scheduledDeparture: "2025-02-15T10:30:00Z" },
  { flightNumber: "UK801", originCode: "DEL", destinationCode: "BLR", airlineCode: "UK", scheduledDeparture: "2025-02-16T09:15:00Z" },
  { flightNumber: "SG301", originCode: "BOM", destinationCode: "BLR", airlineCode: "SG", scheduledDeparture: "2025-02-16T11:45:00Z" },
  { flightNumber: "AI401", originCode: "DEL", destinationCode: "HYD", airlineCode: "AI", scheduledDeparture: "2025-02-17T07:30:00Z" },
  { flightNumber: "6E501", originCode: "BOM", destinationCode: "MAA", airlineCode: "6E", scheduledDeparture: "2025-02-17T13:20:00Z" },
  { flightNumber: "UK701", originCode: "DEL", destinationCode: "CCU", airlineCode: "UK", scheduledDeparture: "2025-02-18T06:00:00Z" },
  { flightNumber: "SG201", originCode: "BOM", destinationCode: "GOI", airlineCode: "SG", scheduledDeparture: "2025-02-18T14:30:00Z" },
  { flightNumber: "EK501", originCode: "DEL", destinationCode: "DXB", airlineCode: "EK", scheduledDeparture: "2025-02-19T02:30:00Z" },
  { flightNumber: "BA138", originCode: "BOM", destinationCode: "LHR", airlineCode: "BA", scheduledDeparture: "2025-02-19T23:45:00Z" },
  { flightNumber: "AI173", originCode: "DEL", destinationCode: "JFK", airlineCode: "AI", scheduledDeparture: "2025-02-20T01:15:00Z" },
  { flightNumber: "SQ401", originCode: "BOM", destinationCode: "SIN", airlineCode: "SQ", scheduledDeparture: "2025-02-20T08:00:00Z" },
];

export function useAutoSeedMarkets() {
  const { isConnected } = useAccount();
  const [seedingInProgress, setSeedingInProgress] = useState(false);
  const currentIndexRef = useRef(0);
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: hash || undefined,
  });

  const { data: existingMarkets, refetch } = useReadContract({
    address: DELAY_MARKET_CONTRACT_ADDRESS,
    abi: DELAY_MARKET_ABI,
    functionName: "getAllMarkets",
    query: {
      enabled: isConnected && DELAY_MARKET_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
    },
  });

  // Check if markets need seeding
  useEffect(() => {
    if (
      isConnected &&
      !seedingInProgress &&
      existingMarkets &&
      Array.isArray(existingMarkets) &&
      existingMarkets.length < SAMPLE_FLIGHTS.length
    ) {
      // Find which markets are missing
      const existingFlightKeys = new Set(
        existingMarkets.map((m: any) => 
          `${m.airlineCode}${m.flightNumber}-${m.originCode}-${m.destinationCode}`
        )
      );

      const missingFlights = SAMPLE_FLIGHTS.filter(
        (flight) => !existingFlightKeys.has(`${flight.airlineCode}${flight.flightNumber}-${flight.originCode}-${flight.destinationCode}`)
      );

      if (missingFlights.length > 0) {
        setSeedingInProgress(true);
        currentIndexRef.current = 0;
        const firstMissing = missingFlights[0];
        writeContract({
          address: DELAY_MARKET_CONTRACT_ADDRESS,
          abi: DELAY_MARKET_ABI,
          functionName: "openMarket",
          args: [
            firstMissing.flightNumber,
            firstMissing.originCode,
            firstMissing.destinationCode,
            firstMissing.airlineCode,
            firstMissing.scheduledDeparture,
          ],
        });
      }
    }
  }, [isConnected, seedingInProgress, existingMarkets, writeContract]);

  // Continue seeding after each success
  useEffect(() => {
    if (isSuccess && seedingInProgress) {
      currentIndexRef.current += 1;
      
      if (currentIndexRef.current < SAMPLE_FLIGHTS.length) {
        // Wait a bit then seed next
        setTimeout(() => {
          const nextFlight = SAMPLE_FLIGHTS[currentIndexRef.current];
          writeContract({
            address: DELAY_MARKET_CONTRACT_ADDRESS,
            abi: DELAY_MARKET_ABI,
            functionName: "openMarket",
            args: [
              nextFlight.flightNumber,
              nextFlight.originCode,
              nextFlight.destinationCode,
              nextFlight.airlineCode,
              nextFlight.scheduledDeparture,
            ],
          });
        }, 2000);
      } else {
        // All done
        setSeedingInProgress(false);
        currentIndexRef.current = 0;
        setTimeout(() => {
          refetch();
        }, 1000);
      }
    }
  }, [isSuccess, seedingInProgress, writeContract, refetch]);

  return { seedingInProgress };
}

