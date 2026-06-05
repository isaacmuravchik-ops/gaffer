import { useState } from 'react';
import Pitch from './components/Pitch';
import FormationPicker from './components/FormationPicker';
import formations from './data/formations';
import './App.css';

const DEFAULT_FORMATION = '4-3-3';

export default function App() {
  const [formationId, setFormationId] = useState(DEFAULT_FORMATION);
  const [players, setPlayers] = useState({});
  const [selectedIdx, setSelectedIdx] = useState(null);

  const formation = formations.find((f) => f.id === formationId);

  function handleFormationChange(id) {
    setFormationId(id);
    setSelectedIdx(null);
  }

  function handleSlotClick(idx) {
    setSelectedIdx((prev) => (prev === idx ? null : idx));
  }

  const filledCount = Object.keys(players).length;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-rule" />
        <div className="header-inner">
          <span className="header-kicker">Build Your</span>
          <h1 className="header-title">GAFFER</h1>
          <span className="header-sub">Fantasy XI · Scouting Desk · Match Engine</span>
        </div>
        <div className="header-rule" />
      </header>

      <main className="board-layout">
        <section className="board-pitch">
          <Pitch
            slots={formation.slots}
            players={players}
            selectedIdx={selectedIdx}
            onSlotClick={handleSlotClick}
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
            />
          </div>

          <div className="rail-section">
            <FormationPicker current={formationId} onChange={handleFormationChange} />
          </div>

          <div className="rail-section rail-section--status">
            <span className="status-badge">
              {filledCount}/11 players
            </span>
          </div>

          <div className="rail-actions">
            <button className="action-btn action-btn--primary" disabled={filledCount < 11}>
              Scout My XI
            </button>
            <button className="action-btn" disabled={filledCount < 11}>
              Generate Opponent
            </button>
            <button className="action-btn" disabled={filledCount < 11}>
              Simulate Match
            </button>
          </div>

          {selectedIdx !== null && (
            <div className="slot-info">
              <p className="slot-info-label">
                Selected: <strong>{formation.slots[selectedIdx].role}</strong>
              </p>
              <p className="slot-info-hint">Player search coming in Phase 2</p>
            </div>
          )}
        </aside>
      </main>

      <footer className="app-footer">
        <span>GAFFER · {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
