import type { Holder } from "@shared/schema";
import { CATEGORY_META, TOTAL_SUPPLY, fmtBtc, pctOf21m } from "@/lib/format";

const CATEGORY_ORDER = [
  "satoshi",
  "government",
  "etf",
  "company",
  "miner",
  "exchange",
  "individual",
  "lost",
] as const;

export function SupplyBar({
  holders,
  mined,
}: {
  holders: Holder[];
  mined: number;
}) {
  // Sum BTC by category
  const byCat = holders.reduce<Record<string, number>>((acc, h) => {
    acc[h.category] = (acc[h.category] || 0) + h.btc;
    return acc;
  }, {});

  const tracked = Object.values(byCat).reduce((a, b) => a + b, 0);
  const untracked = Math.max(0, mined - tracked);
  const notYetMined = TOTAL_SUPPLY - mined;

  const segments = [
    ...CATEGORY_ORDER.filter((c) => byCat[c]).map((c) => ({
      key: c,
      label: CATEGORY_META[c].label,
      color: CATEGORY_META[c].color,
      btc: byCat[c],
    })),
    { key: "untracked", label: "Other / Circulating", color: "#44403c", btc: untracked },
    { key: "unmined", label: "Not Yet Mined", color: "#1c1917", btc: notYetMined },
  ];

  return (
    <div data-testid="supply-bar">
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="mono text-xs uppercase tracking-widest text-muted-foreground">
            21M Supply Distribution
          </span>
        </div>
        <span className="mono text-xs text-muted-foreground">
          {fmtBtc(tracked)} BTC tracked ({pctOf21m(tracked)})
        </span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-12 w-full overflow-hidden rounded-sm border border-border">
        {segments.map((seg) => {
          const width = (seg.btc / TOTAL_SUPPLY) * 100;
          if (width < 0.1) return null;
          return (
            <div
              key={seg.key}
              className="relative group transition-all hover:brightness-125"
              style={{ width: `${width}%`, backgroundColor: seg.color }}
              title={`${seg.label}: ${fmtBtc(seg.btc)} BTC (${pctOf21m(seg.btc)})`}
              data-testid={`segment-${seg.key}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-4 lg:grid-cols-5">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
              style={{ backgroundColor: seg.color }}
            />
            <span className="mono text-[11px] uppercase tracking-wide text-muted-foreground">
              {seg.label}
            </span>
            <span className="mono text-[11px] text-foreground ml-auto">
              {pctOf21m(seg.btc)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
