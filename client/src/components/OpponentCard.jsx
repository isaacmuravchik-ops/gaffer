export default function OpponentCard({ data, onBack }) {
  // Split players into lines by rough role grouping for a teamsheet look
  const gk = data.players.filter(p => p.role === 'GK');
  const defs = data.players.filter(p => ['CB','RB','LB','RWB','LWB','SW'].includes(p.role));
  const mids = data.players.filter(p => ['DM','CM','AM','CAM','RAM','LAM','RM','LM'].includes(p.role));
  const fwds = data.players.filter(p => ['ST','CF','F9','RW','LW','SS'].includes(p.role));
  // Fallback: any unmatched players go in the middle group
  const matched = new Set([...gk, ...defs, ...mids, ...fwds].map(p => p.name));
  const rest = data.players.filter(p => !matched.has(p.name));
  const midsPlusMisc = [...mids, ...rest];

  const Row = ({ players }) =>
    players.length ? (
      <div className="teamsheet-row">
        {players.map((p, i) => (
          <div key={i} className="teamsheet-player">
            <span className="teamsheet-role">{p.role}</span>
            <span className="teamsheet-name">{p.name}</span>
          </div>
        ))}
      </div>
    ) : null;

  return (
    <div className="result-screen">
      <button className="result-back" onClick={onBack}>← Back to Board</button>

      <div className="result-header">
        <span className="result-kicker">The Opposition</span>
        <h2 className="result-title">{data.teamName}</h2>
      </div>

      <div className="opponent-meta">
        <span className="opponent-formation">{data.formation}</span>
        <span className="opponent-divider">·</span>
        <span className="opponent-style">{data.style}</span>
      </div>

      <div className="teamsheet">
        <p className="teamsheet-label">Starting XI</p>
        <Row players={fwds} />
        <Row players={midsPlusMisc} />
        <Row players={defs} />
        <Row players={gk} />
      </div>

      <div className="opponent-threat">
        <span className="threat-label">Main Threat</span>
        <span className="threat-text">{data.threat}</span>
      </div>
    </div>
  );
}
