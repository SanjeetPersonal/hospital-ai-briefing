import React from 'react';

function WeeklySummary({ summary }) {
  if (!summary) return <p>No weekly summary available.</p>;

  const patterns = summary.patterns || [];
  const themes = summary.themes || [];
  const importantChanges = summary.importantChanges || [];
  const watchlist = summary.watchlist || [];

  return (
    <article className="weekly-summary">
      <header className="summary-header">
        <p className="eyebrow">Seven-day rollup</p>
        <h2>Weekly Summary - {summary.week}</h2>
        <p>{summary.overview || "Patterns, repeated themes, and changes that need more attention."}</p>
      </header>

      {patterns.length > 0 && (
        <section className="summary-patterns">
          <h3>Repeated Patterns</h3>
          <ul>
            {patterns.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </section>
      )}

      {themes.length > 0 && (
        <section className="summary-themes">
          <h3>Key Themes</h3>
          <div className="tags">
            {themes.map((t, i) => <span key={i} className="tag topic-tag">{t}</span>)}
          </div>
        </section>
      )}

      {importantChanges.length > 0 && (
        <section className="summary-changes">
          <h3>Most Important Changes</h3>
          <ul>
            {importantChanges.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </section>
      )}

      {watchlist.length > 0 && (
        <section className="summary-watchlist">
          <h3>Needs More Attention</h3>
          <ul>
            {watchlist.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </section>
      )}
    </article>
  );
}

export default WeeklySummary;
