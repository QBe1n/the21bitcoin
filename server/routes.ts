import type { Express } from "express";
import type { Server } from "http";
import { HOLDERS } from "./data";

// In-memory daily snapshot of network stats (cron-populated).
// In production this would be a DB row — we keep it simple for MVP.
let cachedStats = {
  btcPrice: 73866,
  blockHeight: 893_421,
  mined: 19_845_000,
  lastUpdated: new Date().toISOString(),
};

async function refreshStats() {
  try {
    // mempool.space — block height
    const heightRes = await fetch("https://mempool.space/api/blocks/tip/height");
    const height = parseInt(await heightRes.text(), 10);

    // CoinGecko — BTC price
    const priceRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    );
    const priceJson = (await priceRes.json()) as { bitcoin?: { usd: number } };
    const price = priceJson?.bitcoin?.usd;

    // Circulating supply estimate: genesis block + 50 BTC halvings
    // After 3 halvings (block 630k+) subsidy is 6.25, after 4th (840k) subsidy is 3.125
    // Simple approximation: 19.85M at block 893k, adding ~450 BTC/day
    const mined = Math.min(
      19_845_000 + Math.max(0, (height - 893_421) * 3.125),
      21_000_000
    );

    cachedStats = {
      btcPrice: price || cachedStats.btcPrice,
      blockHeight: isNaN(height) ? cachedStats.blockHeight : height,
      mined: Math.round(mined),
      lastUpdated: new Date().toISOString(),
    };
  } catch (e) {
    console.warn("[stats] refresh failed:", (e as Error).message);
  }
}

// Simple daily cron: refresh on boot + every 24h
refreshStats();
setInterval(refreshStats, 24 * 60 * 60 * 1000);

// News cache per entity (keyed by holder id, populated on demand)
const newsCache: Record<string, { items: NewsItem[]; fetchedAt: number }> = {};
type NewsItem = { title: string; url: string; source: string; date?: string };

async function fetchNews(query: string): Promise<NewsItem[]> {
  // Lightweight DuckDuckGo HTML news endpoint (no key required)
  // Returns empty array on failure — UI handles gracefully.
  try {
    const res = await fetch(
      `https://duckduckgo.com/html/?q=${encodeURIComponent(query + " bitcoin 2026")}`,
      { headers: { "User-Agent": "Mozilla/5.0 the21bitcoin" } }
    );
    const html = await res.text();
    const items: NewsItem[] = [];
    const regex = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    let m;
    while ((m = regex.exec(html)) !== null && items.length < 5) {
      const url = decodeURIComponent(m[1].replace(/^\/\/duckduckgo\.com\/l\/\?uddg=/, "").split("&")[0]);
      const title = m[2].replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/<[^>]+>/g, "");
      try {
        const host = new URL(url).hostname.replace(/^www\./, "");
        items.push({ title, url, source: host });
      } catch {}
    }
    return items;
  } catch {
    return [];
  }
}

export async function registerRoutes(httpServer: Server, app: Express) {
  app.get("/api/stats", (_req, res) => {
    res.json(cachedStats);
  });

  app.get("/api/holders", (_req, res) => {
    // Sort by BTC descending
    const sorted = [...HOLDERS].sort((a, b) => b.btc - a.btc);
    res.json(sorted);
  });

  app.get("/api/holders/:id", (req, res) => {
    const h = HOLDERS.find((x) => x.id === req.params.id);
    if (!h) return res.status(404).json({ error: "not found" });
    res.json(h);
  });

  app.get("/api/holders/:id/news", async (req, res) => {
    const h = HOLDERS.find((x) => x.id === req.params.id);
    if (!h) return res.status(404).json({ error: "not found" });
    const cached = newsCache[h.id];
    const fresh = cached && Date.now() - cached.fetchedAt < 6 * 60 * 60 * 1000;
    if (fresh) return res.json(cached.items);
    const items = await fetchNews(h.name);
    newsCache[h.id] = { items, fetchedAt: Date.now() };
    res.json(items);
  });

  app.post("/api/refresh", async (_req, res) => {
    await refreshStats();
    res.json(cachedStats);
  });
}
