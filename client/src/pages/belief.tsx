import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { Portfolio, Sleeve } from "@shared/schema";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Ticker } from "@/components/ticker";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, RefreshCw, RotateCcw, Sparkles } from "lucide-react";

const EXAMPLES = [
  "Bitcoin becomes the global reserve asset this decade.",
  "AI data centers will need cheap energy — miners win both ways.",
  "Nation-states keep stacking BTC; ETFs are the on-ramp.",
  "The dollar devalues and corporate treasuries copy Strategy.",
  "Risk-off: BTC is overextended, keep dry powder.",
];

const SLEEVE_META: Record<Sleeve, { label: string; color: string }> = {
  core: { label: "Core", color: "#F7931A" },
  etf: { label: "ETF", color: "#3B82F6" },
  equity: { label: "Equity", color: "#10B981" },
  ai: { label: "AI / Infra", color: "#8B5CF6" },
  risk: { label: "Risk", color: "#6B7280" },
};

const NOTIONAL = 10_000;

function fmtUsd(n: number): string {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function Belief() {
  const [belief, setBelief] = useState("");
  const [seed, setSeed] = useState(0);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: { belief: string; seed: number }) => {
      const res = await apiRequest("POST", "/api/portfolio", payload);
      return (await res.json()) as Portfolio;
    },
    onSuccess: (data) => {
      setPortfolio(data);
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Construct failed");
    },
  });

  const submit = (nextSeed = seed) => {
    const text = belief.trim();
    if (text.length < 8) {
      setError("Type a belief of at least a sentence.");
      return;
    }
    setSeed(nextSeed);
    mutation.mutate({ belief: text, seed: nextSeed });
  };

  const total = useMemo(
    () => (portfolio ? portfolio.positions.reduce((a, p) => a + p.weightPct, 0) : 0),
    [portfolio],
  );

  return (
    <div className="min-h-screen relative">
      <SiteHeader />
      <Ticker />

      <section className="mx-auto max-w-[1400px] px-6 py-10 relative z-10">
        <div className="rounded-md border border-primary/40 bg-primary/5 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="mono text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
            Paper / not investment advice
          </span>
          <span className="text-xs text-muted-foreground">
            Simulated book only. No brokerage, no live orders, no wallet connect. Marks are illustrative.
          </span>
        </div>

        <div className="mt-10 max-w-3xl">
          <div className="mono text-[10px] uppercase tracking-[0.25em] text-primary mb-4">
            // Express the thesis
          </div>
          <h1 className="font-mono text-4xl md:text-5xl font-bold leading-[1.05] tracking-tight">
            What do you <span className="text-primary glow-orange">believe</span>?
          </h1>
          <p className="mt-5 max-w-xl text-sm md:text-base text-muted-foreground leading-relaxed">
            Social investing fails at closing the gap between a world-view and the tickers that
            express it. Type a belief. We construct a diversified paper portfolio around it —
            Bitcoin-first, unless your thesis points elsewhere.
          </p>
        </div>

        <form
          className="mt-8 max-w-3xl"
          onSubmit={(e) => {
            e.preventDefault();
            submit(0);
          }}
        >
          <label htmlFor="belief" className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Belief
          </label>
          <Textarea
            id="belief"
            value={belief}
            onChange={(e) => setBelief(e.target.value)}
            placeholder="e.g. AI data centers will bid up stranded energy — bitcoin miners become the power trade."
            className="mt-2 min-h-[120px] mono text-sm resize-y"
            maxLength={800}
            data-testid="input-belief"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setBelief(ex)}
                className="mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                data-testid={`example-${ex.slice(0, 16).replace(/\s/g, "-").toLowerCase()}`}
              >
                {ex}
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="mono text-[11px] uppercase tracking-wider"
              data-testid="btn-construct"
            >
              {mutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Construct paper book
            </Button>
            {portfolio && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() => submit(seed + 1)}
                  className="mono text-[11px] uppercase tracking-wider"
                  data-testid="btn-regenerate"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={mutation.isPending}
                  onClick={() => {
                    setPortfolio(null);
                    setError(null);
                    setSeed(0);
                  }}
                  className="mono text-[11px] uppercase tracking-wider"
                  data-testid="btn-reset"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Tweak belief
                </Button>
              </>
            )}
            <span className="mono text-[10px] text-muted-foreground">
              {belief.trim().length}/800
            </span>
          </div>
          {error && (
            <p className="mt-3 mono text-xs text-destructive" data-testid="belief-error">
              {error}
            </p>
          )}
        </form>

        {mutation.isPending && (
          <div className="mt-12 max-w-3xl rounded-md border border-border bg-card p-6" data-testid="belief-loading">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary ticker-tick" />
              <span className="mono text-[10px] uppercase tracking-widest text-primary">
                Constructing paper book
              </span>
            </div>
            <p className="mt-3 mono text-sm text-muted-foreground">
              Mapping belief → universe → weights. No orders sent.
            </p>
          </div>
        )}

        {portfolio && !mutation.isPending && (
          <div className="mt-12" data-testid="belief-portfolio">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="mono text-[10px] uppercase tracking-widest text-primary">
                {portfolio.mode === "llm" ? "Model book" : "Heuristic book"}
              </span>
              <span className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                as of {portfolio.asOf}
              </span>
              <span className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                notional {fmtUsd(NOTIONAL)} paper
              </span>
              <span
                className={`mono text-[10px] uppercase tracking-widest ${
                  Math.abs(total - 100) < 0.05 ? "text-primary" : "text-destructive"
                }`}
              >
                total {total.toFixed(2)}%
              </span>
            </div>

            <p className="max-w-3xl text-sm text-muted-foreground leading-relaxed mb-6">
              {portfolio.thesis}
            </p>

            <div className="h-2 rounded-full bg-muted overflow-hidden flex mb-8">
              {portfolio.positions.map((p) => (
                <div
                  key={p.symbol}
                  title={`${p.symbol} ${p.weightPct}%`}
                  style={{
                    width: `${p.weightPct}%`,
                    backgroundColor: SLEEVE_META[p.sleeve].color,
                  }}
                />
              ))}
            </div>

            <div className="rounded-md border border-border bg-card overflow-hidden">
              <div className="hidden md:grid grid-cols-[auto_90px_1fr_100px_110px_1.4fr] items-center gap-4 px-4 py-3 border-b border-border bg-muted/30">
                <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground w-6">#</div>
                <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">Symbol</div>
                <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">Name</div>
                <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">Sleeve</div>
                <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground text-right">
                  Weight
                </div>
                <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Rationale
                </div>
              </div>

              {portfolio.positions.map((p, idx) => {
                const sleeve = SLEEVE_META[p.sleeve];
                const dollars = (NOTIONAL * p.weightPct) / 100;
                return (
                  <div
                    key={p.symbol}
                    className="grid grid-cols-1 md:grid-cols-[auto_90px_1fr_100px_110px_1.4fr] items-start md:items-center gap-2 md:gap-4 px-4 py-4 border-b border-border last:border-b-0"
                    data-testid={`pos-${p.symbol}`}
                  >
                    <div className="mono text-xs text-muted-foreground tabular-nums w-6 hidden md:block">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div className="mono text-sm font-bold text-primary">{p.symbol}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="mono text-[10px] text-muted-foreground mt-0.5">
                        {fmtUsd(dollars)} notional
                      </div>
                    </div>
                    <div>
                      <span
                        className="mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded border"
                        style={{ color: sleeve.color, borderColor: sleeve.color }}
                      >
                        {sleeve.label}
                      </span>
                    </div>
                    <div className="md:text-right">
                      <div className="mono text-sm font-semibold tabular-nums">{p.weightPct.toFixed(2)}%</div>
                      <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full"
                          style={{ width: `${p.weightPct}%`, backgroundColor: sleeve.color }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{p.rationale}</div>
                  </div>
                );
              })}
            </div>

            <p className="mt-6 mono text-[10px] uppercase tracking-widest text-muted-foreground max-w-3xl">
              {portfolio.disclaimer}
            </p>
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
