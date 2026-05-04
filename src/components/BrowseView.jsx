import React, { useState, useMemo, memo } from 'react';
import DailyEntry from './DailyEntry';
import WeeklySummary from './WeeklySummary';

function challengeMatches(entry, selectedChallenge) {
  if (!selectedChallenge) return true;
  const challengeLog = entry.challengeLog;
  const challengeText = typeof challengeLog === 'string'
    ? challengeLog
    : [
        challengeLog?.biggestStoppingPoint,
        challengeLog?.summary,
        ...(challengeLog?.items || [])
      ].filter(Boolean).join(' ');

  return challengeText.toLowerCase().includes(selectedChallenge.toLowerCase());
}

const BrowseView = memo(({ entries, summaries, challengeTypes = [] }) => {
  const [filter, setFilter] = useState('all'); // all, entries, summaries
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState('');

  const allTags = useMemo(() => {
    const tags = new Set();
    entries.forEach(entry => (entry.tags || []).forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [entries]);

  const filteredItems = useMemo(() => {
    let items = [];
    if (filter === 'all' || filter === 'entries') {
      items = [...entries];
    }
    if (filter === 'all' || filter === 'summaries') {
      items = [...items, ...summaries.map(s => ({ ...s, type: 'summary' }))];
    }

    if (selectedTag) {
      items = items.filter(item => {
        if (item.type === 'summary') {
          return (item.themes || []).includes(selectedTag);
        }
        return (item.tags || []).includes(selectedTag);
      });
    }

    if (selectedChallenge) {
      items = items.filter(item => item.type !== 'summary' && challengeMatches(item, selectedChallenge));
    }

    items.sort((a, b) => {
      const dateA = a.type === 'summary' ? a.week : a.date;
      const dateB = b.type === 'summary' ? b.week : b.date;
      return dateB.localeCompare(dateA);
    });

    return items;
  }, [entries, summaries, filter, selectedTag, selectedChallenge]);

  return (
    <div className="browse-view">
      <section className="browse-intro">
        <h2>Browse Archive</h2>
        <p>Move through the notebook by day, topic, or adoption blocker.</p>
      </section>

      <div className="content browse-controls">
        <div className="control-group">
          <label htmlFor="entry-filter">Show</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="entries">Daily Entries</option>
            <option value="summaries">Weekly Summaries</option>
          </select>
        </div>

        <div className="control-group">
          <label>Topic</label>
          <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}>
            <option value="">All Topics</option>
            {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
          </select>
        </div>

        <div className="control-group">
          <label>Challenge</label>
          <select value={selectedChallenge} onChange={(e) => setSelectedChallenge(e.target.value)}>
            <option value="">All Challenges</option>
            {challengeTypes.map(challenge => <option key={challenge} value={challenge}>{challenge}</option>)}
          </select>
        </div>
      </div>

      <div className="browse-results">
        {filteredItems.length === 0 ? (
          <p>No items match the current filters.</p>
        ) : (
          filteredItems.map((item, index) => (
            <div key={index} className="content browse-item">
              {item.type === 'summary' ? (
                <WeeklySummary summary={item} />
              ) : (
                <DailyEntry entry={item} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default BrowseView;
