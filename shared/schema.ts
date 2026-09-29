import { z } from "zod";

// Holder categories
export const categories = [
  "satoshi",
  "government",
  "etf",
  "company",
  "miner",
  "exchange",
  "individual",
  "lost",
] as const;
export type Category = (typeof categories)[number];

export const holderSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(categories),
  country: z.string().optional(),
  ticker: z.string().optional(),
  btc: z.number(),
  sourceUrl: z.string(),
  sourceName: z.string(),
  asOf: z.string(), // YYYY-MM-DD
  logo: z.string().optional(), // emoji or short code
  notes: z.string().optional(),
  wallets: z.array(z.string()).optional(),
});
export type Holder = z.infer<typeof holderSchema>;

export const statsSchema = z.object({
  btcPrice: z.number(),
  blockHeight: z.number(),
  mined: z.number(),
  lastUpdated: z.string(),
});
export type Stats = z.infer<typeof statsSchema>;

// Paper portfolio — belief → simulated book (no live orders)
export const sleeves = ["core", "equity", "etf", "ai", "risk"] as const;
export type Sleeve = (typeof sleeves)[number];

export const portfolioPositionSchema = z.object({
  symbol: z.string().min(1).max(16),
  name: z.string().min(1).max(80),
  weightPct: z.number().gt(0).lte(100),
  rationale: z.string().min(1).max(280),
  sleeve: z.enum(sleeves),
});
export type PortfolioPosition = z.infer<typeof portfolioPositionSchema>;

export const portfolioSchema = z.object({
  thesis: z.string().min(1).max(800),
  asOf: z.string(),
  mode: z.enum(["llm", "heuristic"]),
  paper: z.literal(true),
  disclaimer: z.string(),
  belief: z.string(),
  positions: z.array(portfolioPositionSchema).min(3).max(12),
});
export type Portfolio = z.infer<typeof portfolioSchema>;

export const portfolioRequestSchema = z.object({
  belief: z.string().trim().min(8, "Belief is too short").max(800, "Belief is too long"),
  seed: z.number().int().min(0).max(1_000_000).optional(),
});
export type PortfolioRequest = z.infer<typeof portfolioRequestSchema>;
