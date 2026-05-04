import React from 'react';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

function getChallengeText(challengeLog) {
  if (!challengeLog) return 'No blocker recorded.';
  if (typeof challengeLog === 'string') return challengeLog;
  return challengeLog.biggestStoppingPoint || challengeLog.summary || 'No blocker recorded.';
}

function getChallengeItems(challengeLog) {
  if (!challengeLog || typeof challengeLog === 'string') return [];
  return challengeLog.items || [];
}

function DailyEntry({ entry }) {
  if (!entry) return <p>No entry available for today.</p>;

  const developments = entry.keyDevelopments || [];
  const tags = entry.tags || [];
  const challengeText = getChallengeText(entry.challengeLog);
  const challengeItems = getChallengeItems(entry.challengeLog);

  return (
    <article className="daily-entry">
      <header className="entry-header">
        <p className="eyebrow">Newest daily entry</p>
        <h2>{dateFormatter.format(new Date(entry.date))}</h2>
        <div className="entry-summary">
          <span>What changed today?</span>
          <h3>{entry.summary}</h3>
        </div>
      </header>
      
      <section className="entry-overview">
        <h4>Overview</h4>
        <p>{entry.overview}</p>
      </section>

      {developments.length > 0 ? (
        <section className="entry-developments">
          <h4>Key Developments</h4>
          <ul>
            {developments.map((dev, i) => <li key={i}>{dev}</li>)}
          </ul>
        </section>
      ) : (
        <section className="entry-developments quiet-section">
          <h4>Key Developments</h4>
          <p>No material new development was captured for this date.</p>
        </section>
      )}

      <section className="entry-tags">
        <h4>Topics</h4>
        <div className="tags">
          {tags.length > 0 ? (
            tags.map((tag, i) => <span key={i} className="tag topic-tag">{tag}</span>)
          ) : (
            <span className="tag muted-tag">no new topic signal</span>
          )}
        </div>
      </section>

      <section className="entry-challenges">
        <h4>Biggest Stopping Point</h4>
        <p>{challengeText}</p>
        {challengeItems.length > 0 && (
          <ul>
            {challengeItems.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        )}
      </section>
    </article>
  );
}

export default DailyEntry;
