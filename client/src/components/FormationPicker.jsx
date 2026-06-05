import formations from '../data/formations';

export default function FormationPicker({ current, onChange }) {
  return (
    <div className="formation-picker">
      <p className="picker-label">Formation</p>
      <div className="picker-chips">
        {formations.map((f) => (
          <button
            key={f.id}
            className={`chip ${current === f.id ? 'chip--active' : ''}`}
            onClick={() => onChange(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
