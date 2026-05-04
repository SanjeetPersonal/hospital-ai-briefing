import { useState, useEffect, memo } from 'react';
import DailyEntry from './components/DailyEntry';
import WeeklySummary from './components/WeeklySummary';
import BrowseView from './components/BrowseView';
import './App.css'

const TOPIC_TAGS = [
  'documentation',
  'patient flow',
  'revenue cycle',
  'bed management',
  'policy',
  'clinical decision support'
];

const CHALLENGE_TYPES = ['trust', 'integration', 'workflow fit', 'scaling'];

async function fetchJsonWithFallback(apiPath, staticPath) {
  const apiResponse = await fetch(apiPath);
  if (apiResponse.ok) return apiResponse.json();

  const staticResponse = await fetch(staticPath);
  if (staticResponse.ok) return staticResponse.json();

  throw new Error(`Unable to load ${apiPath}`);
}

function byNewestDate(a, b) {
  return new Date(b.date) - new Date(a.date);
}

const App = memo(() => {
  const [entries, setEntries] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [view, setView] = useState('latest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [entriesRes, summariesRes] = await Promise.all([
          fetchJsonWithFallback('/api/entries', '/data/entries.json'),
          fetchJsonWithFallback('/api/summaries', '/data/summaries.json')
        ]);
        setEntries([...entriesRes].sort(byNewestDate));
        setSummaries([...summariesRes].sort((a, b) => b.week.localeCompare(a.week)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const latestEntry = entries[0];
  const latestSummary = summaries[0];

  if (loading) {
    return (
      <div className="App">
        <header>
          <h1>Hospital AI Briefing</h1>
          <p>Collecting today&apos;s workflow signals...</p>
        </header>
        <main>
          <div className="content loading">
            <p>Loading latest updates...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <header>
        <div className="header-content">
          <div className="header-text">
            <p className="eyebrow">Living research notebook</p>
            <h1>Hospital AI Briefing</h1>
            <p>Daily software and AI workflow updates, organized by adoption signal and blocker.</p>
          </div>
          <nav>
            <button className={view === 'latest' ? 'active' : ''} onClick={() => setView('latest')}>Today</button>
            <button className={view === 'weekly' ? 'active' : ''} onClick={() => setView('weekly')}>Week</button>
            <button className={view === 'browse' ? 'active' : ''} onClick={() => setView('browse')}>Browse</button>
          </nav>
        </div>
      </header>
      <main>
        {error && <div className="content error">Error: {error}</div>}
        {view === 'latest' && (
          <>
            <section className="briefing-grid">
              <div className="content primary-brief">
                <DailyEntry entry={latestEntry} />
              </div>
              <aside className="content notebook-rules">
                <h2>Briefing Rules</h2>
                <ul>
                  <li>Create one dated entry every day, even when little changed.</li>
                  <li>Use the same structure so days can be compared quickly.</li>
                  <li>Keep topic tags consistent across the archive.</li>
                  <li>Always name the biggest adoption blocker.</li>
                  <li>Put the most important signal first, then supporting detail.</li>
                </ul>
              </aside>
            </section>
            <section className="content taxonomy">
              <div>
                <h2>Tracked Topics</h2>
                <div className="tags">
                  {TOPIC_TAGS.map(tag => <span key={tag} className="tag topic-tag">{tag}</span>)}
                </div>
              </div>
              <div>
                <h2>Challenge Log</h2>
                <div className="tags">
                  {CHALLENGE_TYPES.map(challenge => <span key={challenge} className="tag challenge-tag">{challenge}</span>)}
                </div>
              </div>
            </section>
          </>
        )}
        {view === 'weekly' && (
          <div className="content">
            <WeeklySummary summary={latestSummary} />
          </div>
        )}
        {view === 'browse' && (
          <BrowseView entries={entries} summaries={summaries} challengeTypes={CHALLENGE_TYPES} />
        )}
      </main>
      <footer>
        <p>Hospital AI Briefing keeps the archive complete, comparable, and focused on workflow adoption.</p>
      </footer>
    </div>
  );
});

export default App;
