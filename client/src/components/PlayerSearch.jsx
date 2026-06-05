import { useState, useEffect, useRef, useCallback } from 'react';

// Map slot roles to broad position families for mismatch detection
const ROLE_FAMILY = {
  GK: 'goalkeeper',
  CB: 'defender', RB: 'defender', LB: 'defender',
  RWB: 'defender', LWB: 'defender',
  DM: 'midfielder', CM: 'midfielder', AM: 'midfielder',
  CAM: 'midfielder', RAM: 'midfielder', LAM: 'midfielder',
  RM: 'midfielder', LM: 'midfielder',
  RW: 'winger', LW: 'winger',
  ST: 'striker', CF: 'striker', F9: 'striker',
};

function positionMismatch(role, playerPosition) {
  if (!playerPosition) return null;
  const family = ROLE_FAMILY[role];
  const pos = playerPosition.toLowerCase();
  if (!family) return null;

  const matches = {
    goalkeeper: ['goalkeeper', 'keeper'],
    defender: ['defender', 'back', 'centre back', 'full back', 'wing back'],
    midfielder: ['midfielder', 'midfield', 'pivot', 'anchor'],
    winger: ['winger', 'wide', 'midfielder', 'forward'],
    striker: ['striker', 'forward', 'centre forward', 'winger'],
  };

  const allowed = matches[family] || [];
  const fits = allowed.some((term) => pos.includes(term));
  return fits ? null : playerPosition;
}

export default function PlayerSearch({ slot, currentPlayer, onSelect, onRemove, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const debounceRef = useRef(null);

  // Auto-focus the input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape or click outside
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  const search = useCallback(async (q) => {
    if (q.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data);
    } catch {
      setError('Search unavailable — is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInput(e) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 250);
  }

  // Position the panel: left half of pitch → open right; right half → open left
  const openLeft = slot.x > 55;
  const panelStyle = {
    top: `calc(${slot.y}% - 20px)`,
    ...(openLeft
      ? { right: `calc(${100 - slot.x}% + 28px)` }
      : { left: `calc(${slot.x}% + 28px)` }),
  };

  return (
    <div className="player-search-panel" style={panelStyle} ref={panelRef}>
      <div className="ps-header">
        <span className="ps-role-badge">{slot.role}</span>
        <button className="ps-close" onClick={onClose} aria-label="Close search">✕</button>
      </div>

      <input
        ref={inputRef}
        className="ps-input"
        type="text"
        placeholder="Search player…"
        value={query}
        onChange={handleInput}
        autoComplete="off"
      />

      {currentPlayer && (
        <div className="ps-current">
          <span className="ps-current-name">{currentPlayer.name}</span>
          <button className="ps-remove" onClick={onRemove}>Remove</button>
        </div>
      )}

      <div className="ps-results">
        {loading && <p className="ps-status">Searching…</p>}
        {error && <p className="ps-status ps-status--error">{error}</p>}
        {!loading && !error && results.length === 0 && query.length >= 2 && (
          <p className="ps-status">No players found</p>
        )}
        {results.map((player) => {
          const mismatch = positionMismatch(slot.role, player.position);
          return (
            <button
              key={player.id}
              className="ps-result"
              onClick={() => onSelect(player)}
            >
              {player.photoUrl && (
                <img className="ps-photo" src={player.photoUrl} alt="" loading="lazy" />
              )}
              <div className="ps-result-info">
                <span className="ps-result-name">{player.name}</span>
                <span className="ps-result-meta">{player.club}</span>
                {mismatch && (
                  <span className="ps-mismatch">Plays as {mismatch}</span>
                )}
              </div>
              <span className="ps-pos-badge">{player.position}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
