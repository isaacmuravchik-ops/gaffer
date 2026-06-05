import { useState, useEffect, useRef, useCallback } from 'react';
import staticPlayers from '../data/players';

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
    defender:   ['defender', 'back', 'centre-back', 'centre back', 'full back', 'wing back', 'wing-back'],
    midfielder: ['midfielder', 'midfield', 'pivot', 'anchor'],
    winger:     ['winger', 'wide', 'midfielder', 'forward'],
    striker:    ['striker', 'forward', 'centre-forward', 'centre forward', 'winger'],
  };
  const fits = (matches[family] || []).some((t) => pos.includes(t));
  return fits ? null : playerPosition;
}

// Client-side search: name matches ranked first, then club/nationality
function searchLocal(q) {
  if (!q) return [];
  const lower = q.toLowerCase();
  const nameHits = [], otherHits = [];
  for (const p of staticPlayers) {
    if (p.name.toLowerCase().includes(lower)) nameHits.push(p);
    else if (p.club.toLowerCase().includes(lower) || p.nationality.toLowerCase().includes(lower)) otherHits.push(p);
  }
  return [...nameHits, ...otherHits].slice(0, 20);
}

export default function PlayerSearch({ slot, currentPlayer, onSelect, onRemove, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    function handleClick(e) { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); }
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  const tryApiFallback = useCallback(async (q) => {
    // Only hit the API for longer queries where local has no hits
    if (q.length < 3) return;
    setApiLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      // Merge API results, deduplicating by name
      setResults((prev) => {
        const existing = new Set(prev.map((p) => p.name.toLowerCase()));
        const fresh = data.filter((p) => !existing.has(p.name.toLowerCase()));
        return [...prev, ...fresh].slice(0, 20);
      });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setApiLoading(false);
    }
  }, []);

  function handleInput(e) {
    const val = e.target.value;
    setQuery(val);
    setApiError(null);

    // Always search local instantly
    const localResults = searchLocal(val);
    setResults(localResults);

    // If local returns fewer than 5 results, try the API after a delay
    clearTimeout(debounceRef.current);
    if (val.length >= 3 && localResults.length < 5) {
      debounceRef.current = setTimeout(() => tryApiFallback(val), 400);
    }
  }

  const openLeft = slot.x > 55;
  const panelStyle = {
    top: `calc(${slot.y}% - 20px)`,
    ...(openLeft
      ? { right: `calc(${100 - slot.x}% + 28px)` }
      : { left: `calc(${slot.x}% + 28px)` }),
  };

  const showEmpty = !apiLoading && results.length === 0 && query.length >= 1;

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
        placeholder="Name, club, or nationality…"
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
        {apiLoading && <p className="ps-status">Searching more…</p>}
        {apiError && <p className="ps-status ps-status--error">{apiError}</p>}
        {showEmpty && <p className="ps-status">No players found</p>}
        {results.map((player) => {
          const mismatch = positionMismatch(slot.role, player.position);
          return (
            <button key={player.id} className="ps-result" onClick={() => onSelect(player)}>
              {player.photoUrl && (
                <img className="ps-photo" src={player.photoUrl} alt="" loading="lazy" />
              )}
              <div className="ps-result-info">
                <span className="ps-result-name">{player.name}</span>
                <span className="ps-result-meta">{player.club}</span>
                {mismatch && <span className="ps-mismatch">Plays as {mismatch}</span>}
              </div>
              <span className="ps-pos-badge">{player.position}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
