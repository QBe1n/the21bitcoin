export const TOTAL_SUPPLY = 21_000_000;

export function fmtBtc(n: number, digits = 0): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: digits });
}

export function fmtUsd(n: number, compact = true): string {
  if (compact && n >= 1_000_000_000) return "$" + (n / 1e9).toFixed(2) + "B";
  if (compact && n >= 1_000_000) return "$" + (n / 1e6).toFixed(1) + "M";
  if (compact && n >= 1_000) return "$" + (n / 1e3).toFixed(1) + "K";
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function pctOf21m(btc: number): string {
  return ((btc / TOTAL_SUPPLY) * 100).toFixed(3) + "%";
}

export function nextHalvingBlock(currentHeight: number): number {
  // halvings every 210,000 blocks. Next halving after current height:
  const nextHalvingNum = Math.floor(currentHeight / 210_000) + 1;
  return nextHalvingNum * 210_000;
}

export function blocksUntilHalving(currentHeight: number): number {
  return nextHalvingBlock(currentHeight) - currentHeight;
}

export function estimateHalvingDate(currentHeight: number): Date {
  // ~10 min per block
  const minutes = blocksUntilHalving(currentHeight) * 10;
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export const CATEGORY_META: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  satoshi:    { label: "Satoshi",    color: "#F7931A", icon: "₿" },
  government: { label: "Governments", color: "#EF4444", icon: "🏛️" },
  etf:        { label: "ETFs",        color: "#3B82F6", icon: "📊" },
  company:    { label: "Companies",   color: "#10B981", icon: "🏢" },
  miner:      { label: "Miners",      color: "#F59E0B", icon: "⛏️" },
  exchange:   { label: "Exchanges",   color: "#8B5CF6", icon: "🔁" },
  individual: { label: "Individuals", color: "#EC4899", icon: "👤" },
  lost:       { label: "Lost",        color: "#6B7280", icon: "💀" },
};
