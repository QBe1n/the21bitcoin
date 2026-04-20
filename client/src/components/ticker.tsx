import { useQuery } from "@tanstack/react-query";
import type { Stats } from "@shared/schema";
import {
  blocksUntilHalving,
  estimateHalvingDate,
  fmtBtc,
  fmtUsd,
  TOTAL_SUPPLY,
} from "@/lib/format";
import { useEffect, useState } from "react";

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  return { days, hours, mins };
}

export function Ticker() {
  const { data } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    refetchInterval: 60_000,
  });

  const stats = data ?? {
    btcPrice: 0,
    blockHeight: 0,
    mined: 0,
    lastUpdated: "",
  };

  const halvingDate = estimateHalvingDate(stats.blockHeight || 893_421);
  const { days, hours, mins } = useCountdown(halvingDate);
  const remaining = blocksUntilHalving(stats.blockHeight || 893_421);

  const items = [
    {
      label: "BTC / USD",
      value: stats.btcPrice ? `$${stats.btcPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "—",
      accent: true,
    },
    {
      label: "Block Height",
      value: stats.blockHeight ? stats.blockHeight.toLocaleString("en-US") : "—",
    },
    {
      label: "Mined",
      value: `${fmtBtc(stats.mined)} / ${fmtBtc(TOTAL_SUPPLY)}`,
    },
    {
      label: "Next Halving",
      value: remaining > 0 ? `${days}d ${hours}h ${mins}m` : "HALVING",
    },
    {
      label: "Blocks to Halving",
      value: remaining.toLocaleString("en-US"),
    },
    {
      label: "Market Cap",
      value: fmtUsd(stats.btcPrice * stats.mined),
    },
  ];

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm relative z-10">
      <div className="mx-auto max-w-[1400px] px-6 py-2.5">
        <div className="flex items-center gap-4 overflow-x-auto">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-primary ticker-tick" />
            <span className="mono text-[10px] uppercase tracking-widest text-primary font-semibold">
              LIVE
            </span>
          </div>
          {items.map((it, i) => (
            <div
              key={i}
              className="flex items-baseline gap-2 flex-shrink-0 pl-4 border-l border-border"
              data-testid={`ticker-${it.label.replace(/\s/g, "-").toLowerCase()}`}
            >
              <span className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {it.label}
              </span>
              <span
                className={`mono text-sm font-semibold tabular-nums ${
                  it.accent ? "text-primary" : "text-foreground"
                }`}
              >
                {it.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
