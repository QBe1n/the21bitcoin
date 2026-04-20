import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Holder } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { CATEGORY_META, fmtBtc, fmtDate, fmtUsd, pctOf21m } from "@/lib/format";
import { ExternalLink, Newspaper } from "lucide-react";

type NewsItem = { title: string; url: string; source: string };

export function HolderDetail({
  holder,
  btcPrice,
  onClose,
}: {
  holder: Holder | null;
  btcPrice: number;
  onClose: () => void;
}) {
  const { data: news = [], isLoading: newsLoading } = useQuery<NewsItem[]>({
    queryKey: ["/api/holders", holder?.id, "news"],
    enabled: !!holder,
  });

  if (!holder) return null;

  const meta = CATEGORY_META[holder.category];
  const value = holder.btc * btcPrice;

  return (
    <Sheet open={!!holder} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-y-auto"
        data-testid="sheet-holder-detail"
      >
        <SheetHeader className="text-left">
          <div className="flex items-center gap-2 mb-3">
            <Badge
              variant="outline"
              className="mono text-[10px] uppercase tracking-wider"
              style={{ borderColor: meta.color, color: meta.color }}
            >
              {meta.label}
            </Badge>
            {holder.ticker && (
              <Badge variant="secondary" className="mono text-[10px]">
                {holder.ticker}
              </Badge>
            )}
            {holder.country && (
              <span className="text-sm text-muted-foreground">{holder.country}</span>
            )}
          </div>
          <SheetTitle className="text-xl font-semibold">
            <span className="mr-2" aria-hidden>
              {holder.logo}
            </span>
            {holder.name}
          </SheetTitle>
        </SheetHeader>

        {/* Key stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-md border border-border bg-card p-4">
            <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
              BTC
            </div>
            <div className="mono text-xl font-bold text-primary mt-1 tabular-nums">
              {fmtBtc(holder.btc)}
            </div>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
              USD Value
            </div>
            <div className="mono text-xl font-bold mt-1 tabular-nums">
              {fmtUsd(value)}
            </div>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
              % of 21M
            </div>
            <div className="mono text-xl font-bold mt-1 tabular-nums">
              {pctOf21m(holder.btc)}
            </div>
          </div>
        </div>

        {/* Notes */}
        {holder.notes && (
          <div className="mt-6">
            <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Context
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{holder.notes}</p>
          </div>
        )}

        {/* Wallets */}
        {holder.wallets && holder.wallets.length > 0 && (
          <div className="mt-6">
            <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Known Addresses
            </div>
            <div className="space-y-1.5">
              {holder.wallets.map((w) => (
                <a
                  key={w}
                  href={`https://mempool.space/address/${w}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono text-xs block truncate text-primary hover:underline"
                >
                  {w}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Source */}
        <div className="mt-6 rounded-md border border-border bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Source
              </div>
              <a
                href={holder.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-0.5"
                data-testid="link-source"
              >
                {holder.sourceName}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="text-right">
              <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                As of
              </div>
              <div className="mono text-sm mt-0.5">{fmtDate(holder.asOf)}</div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* News feed */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Newspaper className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Recent News
            </span>
          </div>
          {newsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-md bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : news.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent news found.</p>
          ) : (
            <ul className="space-y-2">
              {news.map((n, i) => (
                <li
                  key={i}
                  className="rounded-md border border-border bg-card p-3 hover-elevate"
                >
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                    data-testid={`link-news-${i}`}
                  >
                    <div className="text-sm text-foreground line-clamp-2 leading-snug">
                      {n.title}
                    </div>
                    <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1.5">
                      {n.source}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
