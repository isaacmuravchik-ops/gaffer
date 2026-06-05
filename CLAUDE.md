# CLAUDE.md — GAFFER

Standing context for this project. Read this first, then read `GAFFER-project-design.docx`
(or its markdown copy) in the repo root for the full spec.

## What this project is

**GAFFER** is a web app where the user builds a starting eleven from real, searchable
footballers on a tactics board, then uses the Claude API to scout the side, generate an
opponent, and simulate the match. It's styled like a vintage matchday programme.

## Tech stack

- **Frontend:** React + Vite (in `client/`)
- **Backend:** Node + Express (in `server/`) — a thin proxy that holds all secret keys,
  calls the Claude API and a football data API, validates, and caches.
- **Football data:** Start on TheSportsDB (free, CORS-friendly), normalized behind the
  backend so it can be swapped for API-Football later without touching the frontend.
- **AI:** Claude API (the design doc specifies a Sonnet model — confirm the current model
  string from the docs when wiring this up in Phase 3).

## Repo structure

```
gaffer/
├── client/        Vite + React frontend
├── server/        Express backend proxy
│   ├── index.js   entry point (currently just an /api/health endpoint)
│   └── .env       secrets — NEVER commit (ANTHROPIC_API_KEY, THESPORTSDB_KEY, PORT)
├── .gitignore     ignores node_modules/, .env, dist/
└── CLAUDE.md       this file
```

## Hard rules / conventions

- **Secrets never touch the browser.** The Claude key, football-API key, and any cache
  credentials live only in `server/.env`. The frontend only ever calls our own backend.
- **`server/package.json` uses `"type": "module"`** so the backend uses ES `import` syntax.
- **Claude always returns typed JSON** against a fixed schema per feature; the UI renders it.
  Never parse raw prose. (See design doc §8.2 for the schemas.)
- **Dev setup:** frontend on Vite (`localhost:5173`), backend on `localhost:3001`. The Vite
  config proxies `/api` → `http://localhost:3001`.
- **Commit and push to GitHub after completing each phase** — clean rollback points and a
  visible build history.

## Build roadmap (from the design doc)

- **Phase 0 · Scaffold — ✅ DONE.** Vite React app + Express proxy + env placeholders +
  `.gitignore` + Vite dev proxy + git initialized. Both servers boot; `/api/health` returns OK.
- **Phase 1 · Board — ✅ DONE.** Pitch rendered with SVG markings, 16 formations as slot/coordinate
  maps, clickable jersey slots (empty = dashed white, selected = gold). Right rail has club name
  input, formation chips, and disabled action buttons. Player search wiring deferred to Phase 2.
- **Phase 2 · Real players.** Backend player search + autocomplete UI + position validation.
- **Phase 3 · AI core.** Scout, opponent, and match-sim features with robust JSON parsing,
  retries, and prompt caching. (See doc §8.4 for the JSON-truncation fix.)
- **Phase 4 · Polish + new features.** Chemistry radar, tactics sliders, live match ticker,
  difficulty dial.
- **Phase 5 · Persistence.** Save/share cards, budget mode, tournament bracket.
- **Phase 6 · Ship.** Deploy, monitoring, cost alerts.

## Design system (quick reference — full detail in doc §7)

Vintage matchday-programme look: warm newsprint paper `#F2E9D4`, ink `#211B14`,
stamp red `#B8352A`, pitch green `#1F4A32`, gold `#C98A2B`. Display type Anton, labels
Oswald, body Newsreader. One clear action per screen. Avoid generic AI UI — it should
feel printed.

## Where we left off

Phase 1 is complete. The immediate next task is **Phase 2: real players** — backend player
search endpoint (`GET /api/players/search?q=&role=`), TheSportsDB integration, autocomplete
overlay on slot click, and position-mismatch hint.
