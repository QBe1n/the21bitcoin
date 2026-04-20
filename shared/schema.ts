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
