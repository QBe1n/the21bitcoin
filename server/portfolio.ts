import {
  portfolioSchema,
  type Portfolio,
  type PortfolioPosition,
  type Sleeve,
} from "../shared/schema";
import { PAPER_DISCLAIMER, UNIVERSE, UNIVERSE_BY_SYMBOL, type Instrument } from "./universe";

const THEME_KEYWORDS: Record<string, string[]> = {
  bitcoin: [
    "bitcoin",
    "btc",
    "sats",
    "satoshi",
    "orange",
    "hard money",
    "digital gold",
    "reserve asset",
    "21 million",
    "21m",
  ],
  miner: [
    "miner",
    "miners",
    "mining",
    "hashrate",
    "hash rate",
    "difficulty",
    "asic",
    "block subsidy",
  ],
  etf: [
    "etf",
    "etfs",
    "ibit",
    "blackrock",
    "fidelity",
    "institutional",
    "spot etf",
    "tradfi",
    "401k",
    "retirement",
  ],
  treasury: [
    "treasury",
    "saylor",
    "strategy",
    "mstr",
    "microstrategy",
    "corporate",
    "balance sheet",
  ],
  ai: [
    "ai",
    "gpu",
    "gpus",
    "nvidia",
    "datacenter",
    "data center",
    "compute",
    "inference",
    "training",
    "llm",
    "chip",
    "chips",
    "hpc",
  ],
  energy: [
    "energy",
    "power",
    "nuclear",
    "electricity",
    "stranded",
    "grid",
    "watt",
    "megawatt",
  ],
  exchange: [
    "exchange",
    "coinbase",
    "custody",
    "liquidity",
    "onramp",
    "broker",
  ],
  sovereign: [
    "nation",
    "nations",
    "sovereign",
    "government",
    "governments",
    "state",
    "states",
    "country",
    "strategic reserve",
    "el salvador",
  ],
  inflation: [
    "inflation",
    "fiat",
    "dollar",
    "debasement",
    "devalue",
    "print",
    "money printer",
    "usd crash",
    "currency",
  ],
  bear: [
    "bear",
    "crash",
    "dump",
    "overvalued",
    "correction",
    "risk-off",
    "recession",
    "drawdown",
    "bubble",
  ],
  bull: ["bull", "moon", "supercycle", "breakout", "ath", "all-time high"],
};

function detectThemes(belief: string): Set<string> {
  const lower = belief.toLowerCase();
  const themes = new Set<string>();
  for (const [theme, words] of Object.entries(THEME_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) themes.add(theme);
  }
  // Bitcoin-first default when the belief is generic / unclassified
  if (themes.size === 0) themes.add("bitcoin");
  if (!themes.has("bear") && !themes.has("ai") && !themes.has("miner")) {
    themes.add("bitcoin");
  }
  return themes;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function scoreInstrument(inst: Instrument, themes: Set<string>, rand: () => number): number {
  let score = 0.15 + rand() * 0.08;
  if (inst.symbol === "BTC") score += 1.4;
  if (inst.tags.includes("default") && themes.has("bitcoin")) score += 0.6;

  const tagHits = inst.tags.filter((t) => themes.has(t)).length;
  score += tagHits * 0.85;

  if (themes.has("miner") && inst.tags.includes("miner")) score += 1.1;
  if (themes.has("ai") && inst.tags.includes("ai")) score += 1.2;
  if (themes.has("etf") && inst.sleeve === "etf") score += 0.9;
  if (themes.has("treasury") && inst.symbol === "MSTR") score += 1.3;
  if (themes.has("exchange") && inst.tags.includes("exchange")) score += 0.8;
  if (themes.has("energy") && inst.tags.includes("energy")) score += 0.7;
  if (themes.has("sovereign") && (inst.symbol === "BTC" || inst.symbol === "IBIT")) score += 0.7;
  if (themes.has("inflation") && (inst.sleeve === "core" || inst.sleeve === "etf")) score += 0.5;

  if (themes.has("bear")) {
    if (inst.beta === "high") score *= 0.45;
    if (inst.sleeve === "risk") score += 2.2;
    if (inst.symbol === "BTC") score += 0.3;
  }
  if (themes.has("bull") && inst.beta === "high") score += 0.35;

  // Keep USDC out unless risk-off or we later force a sleeve
  if (inst.sleeve === "risk" && !themes.has("bear")) score *= 0.15;

  return score;
}

function normalizeWeights(
  scored: { inst: Instrument; score: number }[],
): { inst: Instrument; weightPct: number }[] {
  const sum = scored.reduce((a, x) => a + x.score, 0);
  const raw = scored.map((x) => ({
    inst: x.inst,
    bp: Math.max(1, Math.round((x.score / sum) * 10000)),
  }));
  let bpSum = raw.reduce((a, x) => a + x.bp, 0);
  // Adjust the largest line so total is exactly 100.00
  raw.sort((a, b) => b.bp - a.bp);
  raw[0].bp += 10000 - bpSum;
  if (raw[0].bp < 1) {
    raw[0].bp = 1;
    bpSum = raw.reduce((a, x) => a + x.bp, 0);
    raw[raw.length - 1].bp += 10000 - bpSum;
  }
  return raw.map((x) => ({ inst: x.inst, weightPct: x.bp / 100 }));
}

function rationaleFor(inst: Instrument, belief: string, themes: Set<string>): string {
  const clipped = belief.trim().replace(/\s+/g, " ").slice(0, 72);
  if (inst.symbol === "BTC") {
    return `Spot BTC is the cleanest expression of “${clipped}”.`;
  }
  if (inst.symbol === "IBIT" || inst.symbol === "FBTC") {
    return `TradFi wrapper — same BTC thesis, brokerage / IRA accessible.`;
  }
  if (inst.symbol === "MSTR") {
    return `Levered corporate BTC treasury — high-beta proxy for the belief.`;
  }
  if (inst.sleeve === "equity" && inst.tags.includes("miner")) {
    if (themes.has("ai")) {
      return `Miner with optional HPC / AI pivot — energy + hashrate torque.`;
    }
    return `Hashrate equity — operational leverage to the BTC price path.`;
  }
  if (inst.sleeve === "ai") {
    return `AI / infra line — included because the belief names compute or power.`;
  }
  if (inst.sleeve === "risk") {
    return `Dry powder / USDC sleeve — paper risk budget, not a trade.`;
  }
  if (inst.symbol === "COIN" || inst.symbol === "GLXY") {
    return `On-ramp / custody volume — benefits if the belief drives flows.`;
  }
  return `Satellite sleeve around the stated belief.`;
}

function applyBtcFloor(
  weighted: { inst: Instrument; weightPct: number }[],
  floorPct: number,
): { inst: Instrument; weightPct: number }[] {
  const btc = weighted.find((w) => w.inst.symbol === "BTC");
  if (!btc || btc.weightPct + 1e-9 >= floorPct) return weighted;
  const others = weighted.filter((w) => w.inst.symbol !== "BTC");
  if (others.length === 0) return weighted;
  const othersSum = others.reduce((a, x) => a + x.weightPct, 0);
  const remain = 100 - floorPct;
  return normalizeWeights([
    { inst: btc.inst, score: floorPct },
    ...others.map((o) => ({
      inst: o.inst,
      score: othersSum <= 0 ? remain / others.length : (o.weightPct / othersSum) * remain,
    })),
  ]);
}

function thesisFor(belief: string, themes: Set<string>, mode: Portfolio["mode"]): string {
  const bits: string[] = [];
  bits.push(`Paper book expressing: “${belief.trim()}”.`);
  if (themes.has("ai") && (themes.has("bitcoin") || themes.has("miner"))) {
    bits.push("Mixes BTC beta with energy / HPC names that sit on the same power stack.");
  } else if (themes.has("miner")) {
    bits.push("Overweights hashrate equities against a BTC core.");
  } else if (themes.has("etf") || themes.has("sovereign")) {
    bits.push("Prefers spot BTC and spot-ETF wrappers over miner torque.");
  } else if (themes.has("treasury")) {
    bits.push("Uses Strategy as the leveraged corporate-treasury expression.");
  } else {
    bits.push("Defaults to Bitcoin-adjacent expression: spot, ETF, and selective equity.");
  }
  if (themes.has("bear")) {
    bits.push("Risk-off tilt: smaller high-beta sleeves, explicit USDC cash.");
  }
  bits.push(mode === "llm" ? "Constructed by model, constrained to the curated universe." : "Constructed by the offline rules engine.");
  return bits.join(" ");
}

export function buildHeuristicPortfolio(belief: string, seed = 0): Portfolio {
  const themes = detectThemes(belief);
  const rand = mulberry32(2026 + seed * 97 + belief.length * 13);
  const scored = UNIVERSE.map((inst) => ({
    inst,
    score: scoreInstrument(inst, themes, rand),
  }))
    .filter((x) => x.score > 0.35)
    .sort((a, b) => b.score - a.score);

  const targetCount = themes.has("ai") || themes.has("miner") ? 7 : 6;
  let picked = scored.slice(0, targetCount);

  // Always keep BTC in the book
  if (!picked.some((p) => p.inst.symbol === "BTC")) {
    const btc = scored.find((p) => p.inst.symbol === "BTC") ?? {
      inst: UNIVERSE_BY_SYMBOL.BTC,
      score: 2,
    };
    picked = [btc, ...picked.filter((p) => p.inst.symbol !== "BTC")].slice(0, targetCount);
  }

  // Cash sleeve only when the belief is explicitly risk-off
  if (themes.has("bear") && !picked.some((p) => p.inst.sleeve === "risk")) {
    picked = [...picked.slice(0, Math.max(3, targetCount - 1)), { inst: UNIVERSE_BY_SYMBOL.USDC, score: 1.6 }];
  }

  // Deduplicate
  const seen = new Set<string>();
  picked = picked.filter((p) => {
    if (seen.has(p.inst.symbol)) return false;
    seen.add(p.inst.symbol);
    return true;
  });

  let weighted = normalizeWeights(picked);
  weighted = applyBtcFloor(weighted, 12);
  const positions: PortfolioPosition[] = weighted.map(({ inst, weightPct }) => ({
    symbol: inst.symbol,
    name: inst.name,
    weightPct,
    rationale: rationaleFor(inst, belief, themes),
    sleeve: inst.sleeve,
  }));

  return portfolioSchema.parse({
    thesis: thesisFor(belief, themes, "heuristic"),
    asOf: new Date().toISOString().slice(0, 10),
    mode: "heuristic",
    paper: true,
    disclaimer: PAPER_DISCLAIMER,
    belief: belief.trim(),
    positions,
  });
}

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("no JSON object in model output");
  }
  return JSON.parse(trimmed.slice(start, end + 1));
}

function coerceLlmPortfolio(raw: unknown, belief: string): Portfolio {
  const obj = raw as {
    thesis?: string;
    positions?: Array<{
      symbol?: string;
      name?: string;
      weightPct?: number;
      rationale?: string;
      sleeve?: string;
    }>;
  };
  if (!obj || !Array.isArray(obj.positions) || obj.positions.length < 3) {
    throw new Error("model returned too few positions");
  }

  const mapped: { inst: Instrument; weight: number; rationale: string }[] = [];
  for (const p of obj.positions) {
    const symbol = String(p.symbol ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const inst = UNIVERSE_BY_SYMBOL[symbol];
    if (!inst) continue;
    const weight = Number(p.weightPct);
    if (!Number.isFinite(weight) || weight <= 0) continue;
    mapped.push({
      inst,
      weight,
      rationale: String(p.rationale ?? "").slice(0, 280) || rationaleFor(inst, belief, detectThemes(belief)),
    });
  }
  if (mapped.length < 3) throw new Error("model symbols not in universe");
  if (!mapped.some((m) => m.inst.symbol === "BTC")) {
    mapped.unshift({
      inst: UNIVERSE_BY_SYMBOL.BTC,
      weight: 20,
      rationale: rationaleFor(UNIVERSE_BY_SYMBOL.BTC, belief, detectThemes(belief)),
    });
  }

  const unique = new Map<string, (typeof mapped)[number]>();
  for (const m of mapped) unique.set(m.inst.symbol, m);
  const list = Array.from(unique.values()).slice(0, 8);
  const weighted = applyBtcFloor(
    normalizeWeights(list.map((m) => ({ inst: m.inst, score: m.weight }))),
    12,
  );
  const rationaleBySymbol = Object.fromEntries(list.map((m) => [m.inst.symbol, m.rationale]));

  return portfolioSchema.parse({
    thesis: String(obj.thesis ?? "").slice(0, 800) || thesisFor(belief, detectThemes(belief), "llm"),
    asOf: new Date().toISOString().slice(0, 10),
    mode: "llm",
    paper: true,
    disclaimer: PAPER_DISCLAIMER,
    belief: belief.trim(),
    positions: weighted.map(({ inst, weightPct }) => ({
      symbol: inst.symbol,
      name: inst.name,
      weightPct,
      rationale: rationaleBySymbol[inst.symbol] ?? rationaleFor(inst, belief, detectThemes(belief)),
      sleeve: inst.sleeve as Sleeve,
    })),
  });
}

async function buildLlmPortfolio(belief: string, seed: number): Promise<Portfolio> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("no key");

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const universeLines = UNIVERSE.map(
    (i) => `${i.symbol} | ${i.name} | sleeve=${i.sleeve} | tags=${i.tags.join(",")}`,
  ).join("\n");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4 + (seed % 5) * 0.05,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You construct PAPER (simulated) Bitcoin-adjacent portfolios. Never claim this is advice or a live order. Return JSON only.",
          },
          {
            role: "user",
            content: `User belief:\n"""${belief}"""\n\nCurated universe (prefer these symbols; do not invent tickers):\n${universeLines}\n\nReturn JSON:\n{\n  "thesis": "1-3 sentences explaining how the paper book expresses the belief",\n  "positions": [{ "symbol": "BTC", "name": "Bitcoin", "weightPct": 30, "rationale": "short reason", "sleeve": "core" }]\n}\n\nRules:\n- 5 to 8 positions\n- weights > 0 and conceptually sum to 100\n- default to Bitcoin-adjacent expression (BTC, IBIT/FBTC, miners, Strategy/MSTR) unless the belief clearly points at AI/datacenter/energy\n- respect the belief; if it names AI, include relevant AI/infra names from the universe\n- optional USDC risk sleeve when the belief is cautious or two-sided\n- sleeve must be one of: core, equity, etf, ai, risk\n- rationale max 140 chars, no live price claims`,
          },
        ],
      }),
    });
    if (!res.ok) {
      throw new Error(`openai ${res.status}`);
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("empty model content");
    return coerceLlmPortfolio(extractJsonObject(content), belief);
  } finally {
    clearTimeout(timer);
  }
}

export async function constructPortfolio(belief: string, seed = 0): Promise<Portfolio> {
  if (process.env.OPENAI_API_KEY) {
    try {
      return await buildLlmPortfolio(belief, seed);
    } catch (err) {
      console.warn("[portfolio] LLM failed, using heuristic:", (err as Error).message);
    }
  }
  return buildHeuristicPortfolio(belief, seed);
}
