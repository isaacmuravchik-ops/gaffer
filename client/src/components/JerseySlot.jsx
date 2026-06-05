export default function JerseySlot({ slot, player, selected, onClick }) {
  const filled = Boolean(player);

  return (
    <button
      className={`jersey-slot ${filled ? 'filled' : 'empty'} ${selected ? 'selected' : ''}`}
      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
      onClick={() => onClick(slot)}
      aria-label={player ? `${slot.role}: ${player.name}` : `Empty ${slot.role} slot`}
    >
      <span className="jersey-icon" aria-hidden="true">
        {filled ? (
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8 10 L4 18 L10 20 L10 36 L30 36 L30 20 L36 18 L32 10 L26 13 C24 8 16 8 14 13 Z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8 10 L4 18 L10 20 L10 36 L30 36 L30 20 L36 18 L32 10 L26 13 C24 8 16 8 14 13 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
          </svg>
        )}
      </span>
      {filled && <span className="slot-name">{player.name.split(' ').pop()}</span>}
      <span className="slot-role">{slot.role}</span>
    </button>
  );
}
