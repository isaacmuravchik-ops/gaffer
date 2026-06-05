import { useState } from 'react';
import Pitch from './components/Pitch';
import FormationPicker from './components/FormationPicker';
import ScoutReport from './components/ScoutReport';
import OpponentCard from './components/OpponentCard';
import MatchReport from './components/MatchReport';
import formations from './data/formations';
import './App.css';

const DEFAULT_FORMATION = '4-3-3';

const LOADING_MESSAGES = {
  scout:    'Reading the dossier…',
  opponent: 'Conjuring a rival…',
  match:    'Playing out the match…',
};

export default function App() {
  const [formationId, setFormationId] = useState(DEFAULT_FORMATION);
  const [players, setPlayers] = useState({});
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [clubName, setClubName] = useState('');

  // AI state
  const [view, setView] = useState('board'); // 'board' | 'scout' | 'opponent' | 'match'
  const [loading, setLoading] = useState(null); // null | 'scout' | 'opponent' | 'match'
  const [error, setError] = useState(null);
  const [scoutData, setScoutData] = useState(null);
  const [opponentData, setOpponentData] = useState(null);
  const [matchData, setMatchData] = useState(null);

  const formation = formations.find((f) => f.id === formationId);
  const filledCount = Object.keys(players).length;

  // Build the lineup payload the backend expects
  function buildPayload() {
    return {
      slots: formation.slots,
      players,
      clubName: clubName || 'My XI',
      formation: formation.label,
    };
  }

  async function callAI(endpoint, extraBody = {}) {
    const key = endpoint; // 'scout' | 'opponent' | 'match'
    setLoading(key);
    setError(null);
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...buildPayload(), ...extraBody }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI request failed');
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(null);
    }
  }

  async function handleScout() {
    const data = await callAI('scout');
    if (data) { setScoutData(data); setView('scout'); }
  }

  async function handleOpponent() {
    const data = await callAI('opponent');
    if (data) { setOpponentData(data); setView('opponent'); }
  }

  async function handleMatch() {
    const data = await callAI('match', { opponent: opponentData });
    if (data) { setMatchData(data); setView('match'); }
  }

  function handleSlotClick(idx) {
    setSelectedIdx((prev) => (prev === idx ? null : idx));
  }

  function handlePlayerSelect(idx, player) {
    setPlayers((prev) => ({ ...prev, [idx]: player }));
    setSelectedIdx(null);
  }

  function handlePlayerRemove(idx) {
    setPlayers((prev) => { const n = { ...prev }; delete n[idx]; return n; });
    setSelectedIdx(null);
  }

  // ── Result screens ─────────────────────────────────────────────────────
  if (view === 'scout' && scoutData) {
    return (
      <div className="app">
        <AppHeader />
        <ScoutReport data={scoutData} clubName={clubName || 'My XI'} onBack={() => setView('board')} />
        <AppFooter />
      </div>
    );
  }

  if (view === 'opponent' && opponentData) {
    return (
      <div className="app">
        <AppHeader />
        <OpponentCard data={opponentData} onBack={() => setView('board')} />
        <AppFooter />
      </div>
    );
  }

  if (view === 'match' && matchData) {
    return (
      <div className="app">
        <AppHeader />
        <MatchReport data={matchData} onBack={() => setView('board')} />
        <AppFooter />
      </div>
    );
  }

  // ── Board ──────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <AppHeader />

      <main className="board-layout">
        <section className="board-pitch">
          <Pitch
            slots={formation.slots}
            players={players}
            selectedIdx={selectedIdx}
            onSlotClick={handleSlotClick}
            onPlayerSelect={handlePlayerSelect}
            onPlayerRemove={handlePlayerRemove}
            onSearchClose={() => setSelectedIdx(null)}
          />
        </section>

        <aside className="board-rail">
          <div className="rail-section">
            <p className="rail-label">Club Name</p>
            <input
              className="club-input"
              type="text"
              placeholder="My United XI"
              maxLength={30}
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
            />
          </div>

          <div className="rail-section">
            <FormationPicker current={formationId} onChange={(id) => { setFormationId(id); setSelectedIdx(null); }} />
          </div>

          <div className="rail-section rail-section--status">
            <span className="status-badge">{filledCount}/11 players</span>
          </div>

          {error && <p className="rail-error">{error}</p>}

          <div className="rail-actions">
            <button
              className="action-btn action-btn--primary"
              disabled={filledCount < 11 || loading != null}
              onClick={handleScout}
            >
              {loading === 'scout' ? LOADING_MESSAGES.scout : 'Scout My XI'}
            </button>
            <button
              className="action-btn"
              disabled={filledCount < 11 || loading != null}
              onClick={handleOpponent}
            >
              {loading === 'opponent' ? LOADING_MESSAGES.opponent : 'Generate Opponent'}
            </button>
            <button
              className="action-btn"
              disabled={filledCount < 11 || loading != null}
              onClick={handleMatch}
            >
              {loading === 'match' ? LOADING_MESSAGES.match : 'Simulate Match'}
            </button>
          </div>

          {/* Quick-access to previous results */}
          {(scoutData || opponentData || matchData) && (
            <div className="rail-results">
              <p className="rail-label">Previous Results</p>
              {scoutData && <button className="result-link" onClick={() => setView('scout')}>Scout Report →</button>}
              {opponentData && <button className="result-link" onClick={() => setView('opponent')}>Opposition →</button>}
              {matchData && <button className="result-link" onClick={() => setView('match')}>Match Report →</button>}
            </div>
          )}
        </aside>
      </main>

      <AppFooter />
    </div>
  );
}

function AppHeader() {
  return (
    <header className="app-header">
      <div className="header-rule" />
      <div className="header-inner">
        <span className="header-kicker">Build Your</span>
        <h1 className="header-title">GAFFER</h1>
        <span className="header-sub">Fantasy XI · Scouting Desk · Match Engine</span>
      </div>
      <div className="header-rule" />
    </header>
  );
}

function AppFooter() {
  return (
    <footer className="app-footer">
      <span>GAFFER · {new Date().getFullYear()}</span>
    </footer>
  );
}
