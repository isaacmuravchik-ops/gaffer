# GAFFER — Fantasy XI

Build a starting eleven from real footballers, then let Claude scout the side, generate an opponent, and simulate the match. Styled like a vintage matchday programme.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- An [Anthropic API key](https://console.anthropic.com) (for the AI features)

---

## First-time setup

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

## Environment variables

Create `server/.env` (already gitignored):

```
PORT=3001
ANTHROPIC_API_KEY=sk-ant-...
THESPORTSDB_KEY=
```

`THESPORTSDB_KEY` can be left blank — the free public key is used automatically. Only needed if you upgrade to a paid TheSportsDB plan.

---

## Running locally

Open **two terminals** from the repo root:

**Terminal 1 — backend**
```bash
cd server
npm run dev
```
Runs on `http://localhost:3001`. Uses nodemon so it restarts on file changes.

**Terminal 2 — frontend**
```bash
cd client
npm run dev
```
Runs on `http://localhost:5173`. The Vite dev server proxies all `/api` requests to the backend automatically.

Open **http://localhost:5173** in your browser.

---

## How it works

1. **Build your XI** — click any jersey slot and search for a player by name, club, or nationality
2. **Scout My XI** — Claude analyses your lineup and returns a rated scout report
3. **Generate Opponent** — Claude invents a rival team with a full XI and tactical style
4. **Simulate Match** — Claude plays out the match and returns a scoreline, event timeline, and man of the match

All three AI features require `ANTHROPIC_API_KEY` to be set.

---

## Project structure

```
gaffer/
├── client/          Vite + React frontend
│   └── src/
│       ├── components/   Pitch, JerseySlot, PlayerSearch, result screens
│       ├── data/         formations.js, players.js (static dataset)
│       └── App.jsx       main app + view switching
├── server/
│   ├── index.js     Express backend — player search proxy + Claude API calls
│   └── .env         secrets (never committed)
├── CLAUDE.md        AI assistant context and build roadmap
└── README.md        this file
```

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| AI | Claude API (`claude-sonnet-4-6`) |
| Player data | Bundled static dataset + TheSportsDB fallback |
