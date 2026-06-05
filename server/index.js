import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ── Player search cache (in-memory, keyed by lowercase query) ──────────────
const searchCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCached(key) {
  const entry = searchCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) { searchCache.delete(key); return null; }
  return entry.data;
}

function setCache(key, data) {
  searchCache.set(key, { data, ts: Date.now() });
}

// TheSportsDB free key; set THESPORTSDB_KEY in .env for a paid key
const SPORTSDB_KEY = process.env.THESPORTSDB_KEY || "3";

// TheSportsDB sometimes double-encodes accented chars (Mbappé → MbappÃ©).
// Re-encode as Latin-1 bytes then decode as UTF-8 to recover the original.
function fixEncoding(str) {
  if (!str) return str;
  try { return decodeURIComponent(escape(str)); } catch { return str; }
}

// Normalize TheSportsDB player to our shape
function normalizePlayer(p) {
  return {
    id: p.idPlayer,
    name: fixEncoding(p.strPlayer),
    position: fixEncoding(p.strPosition) || "Unknown",
    club: fixEncoding(p.strTeam) || "Unknown",
    nationality: fixEncoding(p.strNationality) || "",
    photoUrl: p.strThumb || p.strCutout || null,
  };
}

// ── GET /api/players/search?q=<name>&role=<role> ───────────────────────────
app.get("/api/players/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (q.length < 2) return res.json([]);

  const cacheKey = q.toLowerCase();
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const url = `https://www.thesportsdb.com/api/v1/json/${SPORTSDB_KEY}/searchplayers.php?p=${encodeURIComponent(q)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TheSportsDB returned ${response.status}`);
    const data = await response.json();

    const players = (data.player || []).slice(0, 10).map(normalizePlayer);
    setCache(cacheKey, players);
    res.json(players);
  } catch (err) {
    console.error("Player search error:", err.message);
    res.status(502).json({ error: "Player search unavailable" });
  }
});

// ── GET /api/health ────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "GAFFER backend is running" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`GAFFER backend on http://localhost:${PORT}`));
