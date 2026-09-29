import type { Sleeve } from "../shared/schema";

export type Instrument = {
  symbol: string;
  name: string;
  sleeve: Sleeve;
  tags: string[];
  beta: "high" | "medium" | "low";
};

/**
 * Curated Bitcoin-adjacent + optional AI/infra universe.
 * Marks are illustrative — this is not a live price feed.
 */
export const UNIVERSE: Instrument[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    sleeve: "core",
    tags: ["bitcoin", "btc", "hard-money", "reserve", "digital-gold", "sovereign", "inflation", "default"],
    beta: "medium",
  },
  {
    symbol: "IBIT",
    name: "iShares Bitcoin Trust",
    sleeve: "etf",
    tags: ["bitcoin", "etf", "institutional", "blackrock", "tradfi", "retirement", "default"],
    beta: "medium",
  },
  {
    symbol: "FBTC",
    name: "Fidelity Wise Origin Bitcoin",
    sleeve: "etf",
    tags: ["bitcoin", "etf", "institutional", "fidelity", "tradfi"],
    beta: "medium",
  },
  {
    symbol: "MSTR",
    name: "Strategy (MicroStrategy)",
    sleeve: "equity",
    tags: ["bitcoin", "treasury", "saylor", "leverage", "corporate", "beta"],
    beta: "high",
  },
  {
    symbol: "MARA",
    name: "MARA Holdings",
    sleeve: "equity",
    tags: ["miner", "hashrate", "energy", "bitcoin", "beta"],
    beta: "high",
  },
  {
    symbol: "RIOT",
    name: "Riot Platforms",
    sleeve: "equity",
    tags: ["miner", "hashrate", "energy", "bitcoin", "texas"],
    beta: "high",
  },
  {
    symbol: "CLSK",
    name: "CleanSpark",
    sleeve: "equity",
    tags: ["miner", "hashrate", "energy", "bitcoin"],
    beta: "high",
  },
  {
    symbol: "IREN",
    name: "Iris Energy",
    sleeve: "equity",
    tags: ["miner", "ai", "datacenter", "energy", "gpu", "compute", "bitcoin"],
    beta: "high",
  },
  {
    symbol: "CIFR",
    name: "Cipher Mining",
    sleeve: "equity",
    tags: ["miner", "hashrate", "energy", "bitcoin", "hpc"],
    beta: "high",
  },
  {
    symbol: "HUT",
    name: "Hut 8",
    sleeve: "equity",
    tags: ["miner", "ai", "datacenter", "energy", "bitcoin"],
    beta: "high",
  },
  {
    symbol: "COIN",
    name: "Coinbase",
    sleeve: "equity",
    tags: ["exchange", "custody", "etf", "liquidity", "regulation", "bitcoin"],
    beta: "high",
  },
  {
    symbol: "GLXY",
    name: "Galaxy Digital",
    sleeve: "equity",
    tags: ["exchange", "treasury", "institutional", "bitcoin", "otc"],
    beta: "high",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA",
    sleeve: "ai",
    tags: ["ai", "gpu", "datacenter", "compute", "inference", "chip"],
    beta: "high",
  },
  {
    symbol: "AVGO",
    name: "Broadcom",
    sleeve: "ai",
    tags: ["ai", "chip", "datacenter", "networking", "custom-silicon"],
    beta: "medium",
  },
  {
    symbol: "TSM",
    name: "TSMC",
    sleeve: "ai",
    tags: ["ai", "chip", "foundry", "semiconductor"],
    beta: "medium",
  },
  {
    symbol: "SMCI",
    name: "Super Micro Computer",
    sleeve: "ai",
    tags: ["ai", "server", "datacenter", "gpu", "infra"],
    beta: "high",
  },
  {
    symbol: "VRT",
    name: "Vertiv",
    sleeve: "ai",
    tags: ["ai", "datacenter", "cooling", "power", "infra"],
    beta: "medium",
  },
  {
    symbol: "EQIX",
    name: "Equinix",
    sleeve: "ai",
    tags: ["datacenter", "colocation", "infra", "ai"],
    beta: "low",
  },
  {
    symbol: "CEG",
    name: "Constellation Energy",
    sleeve: "ai",
    tags: ["energy", "nuclear", "power", "ai", "datacenter"],
    beta: "medium",
  },
  {
    symbol: "VST",
    name: "Vistra",
    sleeve: "ai",
    tags: ["energy", "power", "ai", "datacenter"],
    beta: "medium",
  },
  {
    symbol: "USDC",
    name: "USD Coin (cash sleeve)",
    sleeve: "risk",
    tags: ["cash", "stable", "risk-off", "dry-powder"],
    beta: "low",
  },
];

export const UNIVERSE_BY_SYMBOL = Object.fromEntries(
  UNIVERSE.map((i) => [i.symbol, i]),
) as Record<string, Instrument>;

export const PAPER_DISCLAIMER =
  "PAPER SIMULATION ONLY. Not investment advice. No live orders, brokerage, or custody. Marks are illustrative.";
