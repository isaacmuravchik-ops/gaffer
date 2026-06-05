export default function ScoutReport({ data, clubName, onBack }) {
  return (
    <div className="result-screen">
      <button className="result-back" onClick={onBack}>← Back to Board</button>

      <div className="result-header">
        <span className="result-kicker">Scout Report</span>
        <h2 className="result-title">{clubName || 'My XI'}</h2>
      </div>

      <div className="scout-hero">
        <div className="scout-rating">
          <span className="scout-rating-number">{data.overallRating}</span>
          <span className="scout-rating-label">/ 10</span>
        </div>
        <span className="scout-style-tag">{data.style}</span>
      </div>

      <p className="scout-summary">{data.summary}</p>

      <div className="scout-columns">
        <div className="scout-col">
          <p className="scout-col-label">Strengths</p>
          <ul className="scout-list scout-list--strengths">
            {data.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        <div className="scout-col">
          <p className="scout-col-label">Weaknesses</p>
          <ul className="scout-list scout-list--weaknesses">
            {data.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      </div>

      <div className="scout-footer">
        <div className="scout-stat">
          <span className="scout-stat-label">Key Player</span>
          <span className="scout-stat-value">{data.keyPlayer}</span>
        </div>
        <div className="scout-stat">
          <span className="scout-stat-label">Prospects</span>
          <span className="scout-stat-value">{data.prospects}</span>
        </div>
      </div>
    </div>
  );
}
