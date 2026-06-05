import JerseySlot from './JerseySlot';
import PlayerSearch from './PlayerSearch';

export default function Pitch({ slots, players, selectedIdx, onSlotClick, onPlayerSelect, onPlayerRemove, onSearchClose }) {
  return (
    <div className="pitch-wrap">
      <div className="pitch">
        {/* Pitch markings */}
        <svg className="pitch-lines" viewBox="0 0 100 130" preserveAspectRatio="none" aria-hidden="true">
          {/* Outer border */}
          <rect x="2" y="2" width="96" height="126" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
          {/* Halfway line */}
          <line x1="2" y1="65" x2="98" y2="65" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
          {/* Centre circle */}
          <circle cx="50" cy="65" r="12" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
          <circle cx="50" cy="65" r="0.8" fill="rgba(255,255,255,0.3)" />
          {/* Attacking penalty box (top) */}
          <rect x="22" y="2" width="56" height="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
          {/* Attacking 6-yard box */}
          <rect x="34" y="2" width="32" height="8" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
          {/* Attacking penalty spot */}
          <circle cx="50" cy="16" r="0.8" fill="rgba(255,255,255,0.3)" />
          {/* Attacking penalty arc */}
          <path d="M 36 22 A 12 12 0 0 1 64 22" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
          {/* Defensive penalty box (bottom) */}
          <rect x="22" y="108" width="56" height="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
          {/* Defensive 6-yard box */}
          <rect x="34" y="120" width="32" height="8" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
          {/* Defensive penalty spot */}
          <circle cx="50" cy="114" r="0.8" fill="rgba(255,255,255,0.3)" />
          {/* Defensive penalty arc */}
          <path d="M 36 108 A 12 12 0 0 0 64 108" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
          {/* Goals */}
          <rect x="38" y="0" width="24" height="2.5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" />
          <rect x="38" y="127.5" width="24" height="2.5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" />
        </svg>

        {/* Player slots */}
        {slots.map((slot, i) => (
          <JerseySlot
            key={i}
            slot={slot}
            player={players[i] || null}
            selected={selectedIdx === i}
            onClick={() => onSlotClick(i)}
          />
        ))}

        {/* Player search overlay */}
        {selectedIdx !== null && (
          <PlayerSearch
            slot={slots[selectedIdx]}
            currentPlayer={players[selectedIdx] || null}
            onSelect={(player) => onPlayerSelect(selectedIdx, player)}
            onRemove={() => onPlayerRemove(selectedIdx)}
            onClose={onSearchClose}
          />
        )}
      </div>
    </div>
  );
}
