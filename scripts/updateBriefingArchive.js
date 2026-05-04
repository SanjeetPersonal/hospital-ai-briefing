import fs from 'node:fs';
import path from 'node:path';

const TOPIC_RULES = [
  { tag: 'documentation', keywords: ['documentation', 'note', 'scribe', 'ambient', 'chart'] },
  { tag: 'patient flow', keywords: ['patient flow', 'throughput', 'queue', 'discharge', 'scheduling'] },
  { tag: 'revenue cycle', keywords: ['revenue', 'claim', 'coding', 'denial', 'billing'] },
  { tag: 'bed management', keywords: ['bed', 'capacity', 'admission', 'occupancy'] },
  { tag: 'policy', keywords: ['policy', 'regulation', 'governance', 'cms', 'fda'] },
  { tag: 'clinical decision support', keywords: ['clinical decision', 'diagnosis', 'triage', 'risk', 'alert'] }
];

const CHALLENGES = ['trust', 'integration', 'workflow fit', 'scaling'];
const DATA_TARGETS = ['public/data', 'server/data'];

const today = new Date().toISOString().slice(0, 10);

async function main() {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    throw new Error('NEWS_API_KEY is required to update the briefing archive.');
  }

  const entries = readJson('public/data/entries.json', []);
  const summaries = readJson('public/data/summaries.json', []);

  if (!entries.some(entry => entry.date === today)) {
    const articles = await fetchHospitalAiNews(apiKey);
    entries.push(buildDailyEntry(articles));
    entries.sort((a, b) => a.date.localeCompare(b.date));
  }

  const weeklySummary = buildWeeklySummary(entries);
  const existingSummaryIndex = summaries.findIndex(summary => summary.week === weeklySummary.week);

  if (existingSummaryIndex >= 0) {
    summaries[existingSummaryIndex] = weeklySummary;
  } else {
    summaries.push(weeklySummary);
  }

  summaries.sort((a, b) => a.week.localeCompare(b.week));

  writeDataFile('entries.json', entries);
  writeDataFile('summaries.json', summaries);
}

async function fetchHospitalAiNews(apiKey) {
  const query = [
    '"hospital AI"',
    '"healthcare AI"',
    '"clinical AI"',
    '"AI scribe"',
    '"hospital workflow"',
    '"revenue cycle AI"',
    '"bed management AI"'
  ].join(' OR ');
  const url = new URL('https://newsapi.org/v2/everything');

  url.searchParams.set('q', query);
  url.searchParams.set('from', today);
  url.searchParams.set('sortBy', 'publishedAt');
  url.searchParams.set('language', 'en');
  url.searchParams.set('pageSize', '20');
  url.searchParams.set('apiKey', apiKey);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`NewsAPI request failed with ${response.status}`);
  }

  const data = await response.json();
  return (data.articles || [])
    .filter(article => {
      const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
      return ['hospital', 'healthcare', 'clinical', 'medical', 'patient', 'ehr'].some(term => text.includes(term));
    })
    .map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source?.name,
      publishedAt: article.publishedAt
    }));
}

function buildDailyEntry(articles) {
  if (articles.length === 0) {
    return {
      date: today,
      summary: 'Little changed in hospital AI workflow adoption today.',
      overview: 'No significant new source material was found in the daily collection window. The archive still records the day so weekly summaries can distinguish true quiet periods from missing data.',
      keyDevelopments: [],
      tags: TOPIC_RULES.map(rule => rule.tag),
      challengeLog: {
        biggestStoppingPoint: 'Integration remains the biggest stopping point when no new adoption evidence is available.',
        items: [
          'Trust still depends on source quality, auditability, and clinician review.',
          'Workflow fit still determines whether pilots become routine use.',
          'Scaling still depends on repeatable deployment across units and sites.'
        ]
      }
    };
  }

  return {
    date: today,
    summary: `Collected ${articles.length} current hospital AI workflow signal${articles.length === 1 ? '' : 's'} today.`,
    overview: 'The strongest items are listed first so the briefing works for quick scanning, while stable tags and blocker notes keep the archive comparable over time.',
    keyDevelopments: articles.slice(0, 5).map(article => formatDevelopment(article)),
    tags: inferTags(articles),
    challengeLog: {
      biggestStoppingPoint: inferBiggestStoppingPoint(articles),
      items: [
        'Trust needs evidence that AI outputs are accurate, auditable, and reviewed by accountable teams.',
        'Integration with EHR, staffing, routing, revenue, and governance systems remains the practical test.',
        'Workflow fit decides whether a tool saves time inside care delivery or creates another side process.'
      ]
    }
  };
}

function buildWeeklySummary(entries) {
  const week = getWeekNumber(new Date());
  const now = new Date();
  const last7Days = entries.filter(entry => {
    const entryDate = new Date(`${entry.date}T00:00:00Z`);
    const diff = (now - entryDate) / 86400000;
    return diff >= 0 && diff <= 7;
  });
  const themes = [...new Set(last7Days.flatMap(entry => entry.tags || []))];
  const changedEntries = last7Days.filter(entry => (entry.keyDevelopments || []).length > 0);

  return {
    week,
    overview: 'This weekly summary rolls up patterns, repeated themes, and adoption blockers from the last seven days instead of repeating each daily entry.',
    patterns: [
      changedEntries.length > 0
        ? `${changedEntries.length} of the last ${last7Days.length} entries recorded material new developments.`
        : 'The last seven days show a low-change pattern, which is useful context rather than missing data.',
      themes.length > 0
        ? `The most visible topic areas were ${themes.slice(0, 4).join(', ')}.`
        : 'No dominant topic tag repeated across the available entries.',
      summarizeChallenges(last7Days)
    ],
    themes,
    importantChanges: changedEntries.map(entry => entry.summary),
    watchlist: [
      'Check whether repeated blockers are moving from integration risk into measurable deployment progress.',
      'Look for proof that the strongest topic signals are changing daily operations, not just creating pilot activity.'
    ]
  };
}

function inferTags(articles) {
  const text = articles.map(article => `${article.title || ''} ${article.description || ''}`).join(' ').toLowerCase();
  const tags = TOPIC_RULES
    .filter(rule => rule.keywords.some(keyword => text.includes(keyword)))
    .map(rule => rule.tag);

  return tags.length > 0 ? tags : ['clinical decision support'];
}

function inferBiggestStoppingPoint(articles) {
  const text = articles.map(article => `${article.title || ''} ${article.description || ''}`).join(' ').toLowerCase();

  if (text.includes('trust') || text.includes('accuracy') || text.includes('safety')) {
    return 'Trust is the biggest stopping point today because the source set emphasizes accuracy, safety, or clinician confidence.';
  }

  if (text.includes('workflow') || text.includes('clinician') || text.includes('nurse')) {
    return 'Workflow fit is the biggest stopping point today because adoption depends on whether care teams can use the tool without extra friction.';
  }

  if (text.includes('scale') || text.includes('enterprise') || text.includes('deployment')) {
    return 'Scaling is the biggest stopping point today because the signal is moving from pilot activity toward repeatable deployment.';
  }

  return 'Integration is the biggest stopping point today because hospital AI value depends on connecting outputs to operational systems of record.';
}

function summarizeChallenges(entries) {
  const text = entries
    .map(entry => {
      const challengeLog = entry.challengeLog;
      if (!challengeLog) return '';
      if (typeof challengeLog === 'string') return challengeLog;
      return [challengeLog.biggestStoppingPoint, challengeLog.summary, ...(challengeLog.items || [])].join(' ');
    })
    .join(' ')
    .toLowerCase();
  const top = CHALLENGES
    .map(challenge => ({ challenge, count: text.split(challenge).length - 1 }))
    .sort((a, b) => b.count - a.count)[0];

  return top && top.count > 0
    ? `${top.challenge} was the most repeated adoption blocker in the challenge log.`
    : 'Challenge logging needs more source material before a dominant blocker can be identified.';
}

function formatDevelopment(article) {
  const source = article.source ? ` (${article.source})` : '';
  return `${article.title}${source}`;
}

function getWeekNumber(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeDataFile(fileName, data) {
  for (const target of DATA_TARGETS) {
    fs.mkdirSync(target, { recursive: true });
    fs.writeFileSync(path.join(target, fileName), `${JSON.stringify(data, null, 2)}\n`);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
