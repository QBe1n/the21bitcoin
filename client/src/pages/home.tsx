import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { Holder, Stats } from "@shared/schema";
import { Ticker } from "@/components/ticker";
import { SupplyBar } from "@/components/supply-bar";
import { HolderDetail } from "@/components/holder-detail";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_META,
  fmtBtc,
  fmtUsd,
  pctOf21m,
  TOTAL_SUPPLY,
} from "@/lib/format";
import { Search, ExternalLink, ArrowRight } from "lucide-react";
import { Link } from "wouter";

type CategoryFilter = keyof typeof CATEGORY_META | "all";

const FILTERS: { key: CategoryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "satoshi", label: "Satoshi" },
  { key: "government", label: "Governments" },
  { key: "etf", label: "ETFs" },
  { key: "company", label: "Companies" },
  { key: "miner", label: "Miners" },
  { key: "exchange", label: "Exchanges" },
  { key: "individual", label: "Individuals" },
  { key: "lost", label: "Lost" },
];

export default function Home() {
  const { data: holders = [] } = useQuery<Holder[]>({
    queryKey: ["/api/holders"],
  });
  const { data: stats } = useQuery<Stats>({ queryKey: ["/api/stats"] });

  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const btcPrice = stats?.btcPrice ?? 0;
  const mined = stats?.mined ?? 19_845_000;

  const filtered = useMemo(() => {
    return holders.filter((h) => {
      if (filter !== "all" && h.category !== filter) return false;
      if (query && !`${h.name} ${h.ticker ?? ""} ${h.country ?? ""}`.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [holders, filter, query]);

  const selected = holders.find((h) => h.id === selectedId) ?? null;

  // Category totals for sidebar-like summary
  const catTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    holders.forEach((h) => {
      totals[h.category] = (totals[h.category] || 0) + h.btc;
    });
    return totals;
  }, [holders]);

  return (
    <div className="min-h-screen relative">
      <SiteHeader />
      <Ticker />

      {/* Hero */}
      <section className="mx-auto max-w-[1400px] px-6 py-12 relative z-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,1fr] items-end">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.25em] text-primary mb-4">
              // Who owns the 21,000,000
            </div>
            <h1 className="font-mono text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.05] tracking-tight">
              The <span className="text-primary glow-orange">21,000,000</span>
              <br />
              <span className="text-muted-foreground">are not</span>
              <br />
              distributed equally.
            </h1>
            <p className="mt-6 max-w-lg text-sm md:text-base text-muted-foreground leading-relaxed">
              A live distribution map of every major Bitcoin holder on Earth — from Satoshi's untouched million,
              to BlackRock's IBIT, to the 6,000 BTC El Salvador DCA'd under a volcano. Updated daily from on-chain
              data, SEC filings, and government disclosures.
            </p>
            <Button asChild className="mt-6 mono text-[11px] uppercase tracking-wider">
              <Link href="/belief" data-testid="cta-belief">
                What do you believe?
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {/* Big number card */}
          <div className="rounded-md border border-border bg-card p-6 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
            <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Mined / Total Supply
            </div>
            <div className="mono text-3xl md:text-4xl font-bold text-primary glow-orange mt-2 tabular-nums">
              {fmtBtc(mined)}
              <span className="text-muted-foreground"> / 21,000,000</span>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${(mined / TOTAL_SUPPLY) * 100}%` }}
              />
            </div>
            <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
              {((mined / TOTAL_SUPPLY) * 100).toFixed(3)}% issued
            </div>
          </div>
        </div>

        {/* Supply bar */}
        <div className="mt-12">
          <SupplyBar holders={holders} mined={mined} />
        </div>
      </section>

      {/* Category summary strip */}
      <section className="mx-auto max-w-[1400px] px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-px rounded-md border border-border bg-border overflow-hidden">
          {Object.entries(CATEGORY_META).map(([key, meta]) => {
            const total = catTotals[key] || 0;
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(active ? "all" : (key as CategoryFilter))}
                className={`p-4 text-left transition-colors bg-card hover:bg-accent ${
                  active ? "bg-accent" : ""
                }`}
                data-testid={`cat-${key}`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-sm"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {meta.label}
                  </span>
                </div>
                <div className="mono text-lg font-bold mt-1.5 tabular-nums">
                  {fmtBtc(total)}
                </div>
                <div className="mono text-[10px] text-muted-foreground mt-0.5">
                  {pctOf21m(total)}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filters + search */}
      <section className="mx-auto max-w-[1400px] px-6 mt-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => (
              <Button
                key={f.key}
                size="sm"
                variant={filter === f.key ? "default" : "outline"}
                onClick={() => setFilter(f.key)}
                className="mono text-[11px] uppercase tracking-wider h-8"
                data-testid={`filter-${f.key}`}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <div className="md:ml-auto relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search holders, tickers…"
              className="pl-9 mono text-sm h-9"
              data-testid="input-search"
            />
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="mx-auto max-w-[1400px] px-6 mt-6 pb-20 relative z-10">
        <div className="rounded-md border border-border bg-card overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_120px_130px_110px_110px] items-center gap-4 px-4 py-3 border-b border-border bg-muted/30">
            <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground w-6">
              #
            </div>
            <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Holder
            </div>
            <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground text-right">
              BTC
            </div>
            <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground text-right hidden md:block">
              USD Value
            </div>
            <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground text-right hidden md:block">
              % of 21M
            </div>
            <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground text-right">
              Source
            </div>
          </div>

          {/* Rows */}
          {filtered.map((h, idx) => {
            const meta = CATEGORY_META[h.category];
            const value = h.btc * btcPrice;
            return (
              <div
                key={h.id}
                onClick={() => setSelectedId(h.id)}
                className="grid grid-cols-[auto_1fr_120px_130px_110px_110px] items-center gap-4 px-4 py-4 border-b border-border last:border-b-0 hover-elevate cursor-pointer"
                data-testid={`row-${h.id}`}
              >
                <div className="mono text-xs text-muted-foreground tabular-nums w-6">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg flex-shrink-0" aria-hidden>
                      {h.logo}
                    </span>
                    <span className="font-medium truncate">{h.name}</span>
                    {h.ticker && (
                      <span className="mono text-[10px] uppercase px-1.5 py-0.5 rounded border border-border text-muted-foreground flex-shrink-0">
                        {h.ticker}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span
                      className="inline-flex items-center gap-1 mono text-[10px] uppercase tracking-widest"
                      style={{ color: meta.color }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-sm"
                        style={{ backgroundColor: meta.color }}
                      />
                      {meta.label}
                    </span>
                    {h.country && <span>{h.country}</span>}
                  </div>
                </div>
                <div className="mono text-right text-primary font-semibold tabular-nums">
                  {fmtBtc(h.btc)}
                </div>
                <div className="mono text-right text-sm text-foreground tabular-nums hidden md:block">
                  {fmtUsd(value)}
                </div>
                <div className="mono text-right text-sm text-muted-foreground tabular-nums hidden md:block">
                  {pctOf21m(h.btc)}
                </div>
                <div className="text-right">
                  <a
                    href={h.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary"
                    data-testid={`source-${h.id}`}
                  >
                    {h.sourceName.split(" ")[0]}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-4 py-16 text-center">
              <p className="mono text-sm text-muted-foreground">
                No holders match your filters.
              </p>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />

      <HolderDetail
        holder={selected}
        btcPrice={btcPrice}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
