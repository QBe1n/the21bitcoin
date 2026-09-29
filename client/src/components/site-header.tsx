import { Link, useLocation } from "wouter";
import { Github, Twitter } from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Ownership" },
  { href: "/belief", label: "Belief" },
];

export function SiteHeader() {
  const [location] = useLocation();

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20">
      <div className="mx-auto max-w-[1400px] px-6 h-14 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={28} />
          <div className="mono font-bold tracking-tight">
            the<span className="text-primary">21</span>bitcoin
          </div>
          <span className="mono text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:inline border-l border-border pl-3">
            Ownership Tracker
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1 ml-4">
          {NAV.map((item) => {
            const active = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-sm border",
                  active
                    ? "text-primary border-primary/40 bg-primary/10"
                    : "text-muted-foreground border-transparent hover:text-foreground",
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/belief"
            className="sm:hidden mono text-[10px] uppercase tracking-widest text-primary"
            data-testid="nav-belief-mobile"
          >
            Belief
          </Link>
          <a
            href="https://mempool.space"
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hidden md:inline"
          >
            mempool
          </a>
          <a
            href="https://twitter.com/QBe1n"
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            aria-label="Twitter"
          >
            <Twitter className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://github.com/QBe1n/the21bitcoin"
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            aria-label="GitHub"
          >
            <Github className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/30 relative z-10">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Logo size={20} />
            <span className="mono text-xs text-muted-foreground">
              the21bitcoin.com — built for Bitcoiners, by Bitcoiners
            </span>
          </div>
          <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Data from Arkham, Bitbo, BitcoinTreasuries.net, mempool.space, and SEC filings.
            Not financial advice. Paper portfolios are simulations only.
          </div>
        </div>
      </div>
    </footer>
  );
}
