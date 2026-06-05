const EVENT_ICONS = { goal: '⚽', yellow: '🟨', red: '🟥', sub: '🔄' };

export default function MatchReport({ data, onBack }) {
  const homeWin = data.homeScore > data.awayScore;
  const awayWin = data.awayScore > data.homeScore;
  const draw = data.homeScore === data.awayScore;

  return (
    <div className="result-screen">
      <button className="result-back" onClick={onBack}>← Back to Board</button>

      <div className="result-header">
        <span className="result-kicker">Match Report</span>
      </div>

      {/* Scoreboard */}
      <div className="scoreboard">
        <div className={`scoreboard-team ${homeWin ? 'scoreboard-team--winner' : ''}`}>
          <span className="scoreboard-name">{data.homeTeam}</span>
        </div>
        <div className="scoreboard-score">
          <span className={homeWin ? 'score--winner' : ''}>{data.homeScore}</span>
          <span className="score-sep">–</span>
          <span className={awayWin ? 'score--winner' : ''}>{data.awayScore}</span>
        </div>
        <div className={`scoreboard-team scoreboard-team--away ${awayWin ? 'scoreboard-team--winner' : ''}`}>
          <span className="scoreboard-name">{data.awayTeam}</span>
        </div>
      </div>

      {draw && <p className="draw-label">Draw</p>}

      {/* Event timeline */}
      <div className="match-timeline">
        <p className="timeline-label">Match Events</p>
        {data.events.map((ev, i) => (
          <div key={i} className={`timeline-event timeline-event--${ev.team}`}>
            <span className="ev-minute">{ev.minute}'</span>
            <span className="ev-icon">{EVENT_ICONS[ev.type] || '•'}</span>
            <span className="ev-text">{ev.text}</span>
          </div>
        ))}
      </div>

      {/* MOTM */}
      <div className="motm">
        <span className="motm-label">Man of the Match</span>
        <span className="motm-name">{data.manOfTheMatch}</span>
      </div>

      {/* Summary */}
      <p className="match-summary">{data.summary}</p>
    </div>
  );
}
