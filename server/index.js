import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ── Anthropic client ───────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-6";

// Strip markdown fences and extract the outermost { … } JSON block
function extractJSON(text) {
  const stripped = text.replace(/^```[a-z]*\n?/gm, "").replace(/^```$/gm, "");
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in response");
  return stripped.slice(start, end + 1);
}

// Call Claude with a cacheable system prompt. Retries once with an explicit
// correction message if the first response doesn't parse as JSON.
async function callClaude(systemText, userText, maxTokens = 1024) {
  const system = [{ type: "text", text: systemText, cache_control: { type: "ephemeral" } }];

  const first = await anthropic.messages.create({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: "user", content: userText }] });
  const firstText = first.content[0].text;

  try {
    return JSON.parse(extractJSON(firstText));
  } catch {
    // Show Claude its broken output and ask for a fix
    const retry = await anthropic.messages.create({
      model: MODEL, max_tokens: maxTokens, system,
      messages: [
        { role: "user", content: userText },
        { role: "assistant", content: firstText },
        { role: "user", content: "Your previous response was not valid JSON. Return only the JSON object — no markdown, no extra text." },
      ],
    });
    return JSON.parse(extractJSON(retry.content[0].text));
  }
}

// Format the lineup for a prompt
function formatLineup(slots, players, clubName, formation) {
  const name = clubName || "My XI";
  const lines = slots.map((slot, i) => {
    const p = players[i];
    return p
      ? `${slot.role}: ${p.name} (${p.position}, ${p.club})`
      : `${slot.role}: [empty]`;
  });
  return `Club: ${name}\nFormation: ${formation}\n\n${lines.join("\n")}`;
}

// ── System prompts (cached by Claude — fixed per feature) ─────────────────
const SCOUT_SYSTEM = `You are a sharp-eyed football scout writing concise match-day intelligence reports for a manager's dossier. Your analysis is direct, specific, and opinionated. Respond with only valid JSON — no markdown, no explanation, no prose outside the JSON object.`;

const OPPONENT_SYSTEM = `You are a football pundit conjuring a convincing rival team for a fantasy match. Make the opponent tactically interesting and give players plausible names. Respond with only valid JSON — no markdown, no explanation, no prose outside the JSON object.`;

const MATCH_SYSTEM = `You are a football match commentator generating a vivid but concise match simulation. Keep event text short and punchy (under 12 words each). Respond with only valid JSON — no markdown, no explanation, no prose outside the JSON object.`;

// ── POST /api/scout ────────────────────────────────────────────────────────
app.post("/api/scout", async (req, res) => {
  const { slots, players, clubName, formation } = req.body;
  if (!slots || !players) return res.status(400).json({ error: "Missing lineup" });

  const lineup = formatLineup(slots, players, clubName, formation);

  const userPrompt = `Analyse this starting eleven and return a scout report.

${lineup}

Return this exact JSON schema (no other text):
{
  "overallRating": <number 1–10, one decimal place>,
  "style": <string, e.g. "High-press, attacking">,
  "summary": <string, 2 sentences max>,
  "strengths": [<string>, <string>, <string>],
  "weaknesses": [<string>, <string>],
  "keyPlayer": <string, player name>,
  "prospects": <string, one sentence>
}`;

  try {
    const data = await callClaude(SCOUT_SYSTEM, userPrompt, 700);
    res.json(data);
  } catch (err) {
    console.error("Scout error:", err.message);
    res.status(502).json({ error: err.message });
  }
});

// ── POST /api/opponent ─────────────────────────────────────────────────────
app.post("/api/opponent", async (req, res) => {
  const { slots, players, clubName, formation } = req.body;
  if (!slots || !players) return res.status(400).json({ error: "Missing lineup" });

  const lineup = formatLineup(slots, players, clubName, formation);

  const userPrompt = `Generate a balanced, interesting opponent for this XI.

${lineup}

Return this exact JSON schema (no other text):
{
  "teamName": <string>,
  "formation": <string, e.g. "4-4-2">,
  "style": <string, e.g. "Counter-attacking, disciplined">,
  "players": [
    { "role": <string>, "name": <string> }
  ],
  "threat": <string, main tactical threat, one sentence>
}
The players array must contain exactly 11 entries covering GK, defenders, midfielders, forwards matching the formation.`;

  try {
    const data = await callClaude(OPPONENT_SYSTEM, userPrompt, 900);
    res.json(data);
  } catch (err) {
    console.error("Opponent error:", err.message);
    res.status(502).json({ error: err.message });
  }
});

// ── POST /api/match ────────────────────────────────────────────────────────
app.post("/api/match", async (req, res) => {
  const { slots, players, clubName, formation, opponent } = req.body;
  if (!slots || !players) return res.status(400).json({ error: "Missing lineup" });

  const lineup = formatLineup(slots, players, clubName, formation);
  const awayTeam = opponent
    ? `${opponent.teamName} (${opponent.formation}) — ${opponent.style}\n${opponent.players.map((p) => `${p.role}: ${p.name}`).join(", ")}`
    : "A balanced rival XI generated for this match";

  const userPrompt = `Simulate a football match between these two teams.

HOME — ${lineup}

AWAY — ${awayTeam}

Return this exact JSON schema (no other text):
{
  "homeTeam": <string, home club name>,
  "awayTeam": <string, away club name>,
  "homeScore": <number>,
  "awayScore": <number>,
  "events": [
    { "minute": <number>, "team": "home" | "away", "type": "goal" | "yellow" | "red" | "sub", "text": <string, under 12 words> }
  ],
  "manOfTheMatch": <string, player name>,
  "summary": <string, 2 sentences>
}
The events array must have 5–8 entries. Make the result feel earned and plausible.`;

  try {
    const data = await callClaude(MATCH_SYSTEM, userPrompt, 1200);
    res.json(data);
  } catch (err) {
    console.error("Match error:", err.message);
    res.status(502).json({ error: err.message });
  }
});

// ── Player search cache ────────────────────────────────────────────────────
const searchCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCached(key) {
  const entry = searchCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) { searchCache.delete(key); return null; }
  return entry.data;
}
function setCache(key, data) { searchCache.set(key, { data, ts: Date.now() }); }

const SPORTSDB_KEY = process.env.THESPORTSDB_KEY || "3";

function fixEncoding(str) {
  if (!str) return str;
  try { return decodeURIComponent(escape(str)); } catch { return str; }
}

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

// ── GET /api/players/search ────────────────────────────────────────────────
app.get("/api/players/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (q.length < 1) return res.json([]);

  const cacheKey = q.toLowerCase();
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const url = `https://www.thesportsdb.com/api/v1/json/${SPORTSDB_KEY}/searchplayers.php?p=${encodeURIComponent(q)}`;
    const response = await fetch(url);
    if (response.status === 429) throw new Error("Rate limited by TheSportsDB — try again in a few minutes");
    if (!response.ok) throw new Error(`TheSportsDB returned ${response.status}`);
    const data = await response.json();

    const players = (data.player || [])
      .filter((p) => p.strSport?.toLowerCase() === "soccer")
      .slice(0, 20)
      .map(normalizePlayer);
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
