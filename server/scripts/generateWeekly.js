// generateWeekly.js - Generate weekly summary

import { readEntries, readSummaries, writeSummaries } from '../data/dataManager.js';

export async function generateWeeklySummary() {
  const entries = readEntries();
  const summaries = readSummaries();
  const now = new Date();
  const week = getWeekNumber(now);
  const existing = summaries.find(s => s.week === week);

  if (!existing) {
    const newSummary = generateWeekly(entries);
    summaries.push(newSummary);
    writeSummaries(summaries);
    console.log('New weekly summary created for', week);
  } else {
    console.log('Summary already exists for', week);
  }
}

function generateWeekly(entries) {
  const now = new Date();
  const week = getWeekNumber(now);
  const last7Days = entries.filter(e => {
    const entryDate = new Date(e.date);
    const diff = (now - entryDate) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  const themes = [...new Set(last7Days.flatMap(e => e.tags || []))];
  const entriesWithChanges = last7Days.filter(e => (e.keyDevelopments || []).length > 0);
  const repeatedChallenges = summarizeChallenges(last7Days);
  const patterns = [
    entriesWithChanges.length > 0
      ? `${entriesWithChanges.length} of the last ${last7Days.length} entries recorded material new developments.`
      : "The last seven days show a low-change pattern, which is useful context rather than missing data.",
    themes.length > 0
      ? `The most visible topic areas were ${themes.slice(0, 4).join(', ')}.`
      : "No dominant topic tag repeated across the available entries.",
    repeatedChallenges
  ];
  const importantChanges = entriesWithChanges.map(e => e.summary);

  return {
    week,
    overview: "This weekly summary rolls up patterns, repeated themes, and adoption blockers from the last seven days instead of repeating each daily entry.",
    patterns,
    themes,
    importantChanges,
    watchlist: [
      "Check whether repeated blockers are moving from integration risk into measurable deployment progress.",
      "Look for proof that the strongest topic signals are changing daily operations, not just creating pilot activity."
    ]
  };
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

  const counts = ['trust', 'integration', 'workflow fit', 'scaling'].map(challenge => ({
    challenge,
    count: text.split(challenge).length - 1
  }));
  const topChallenge = counts.sort((a, b) => b.count - a.count)[0];

  return topChallenge && topChallenge.count > 0
    ? `${topChallenge.challenge} was the most repeated adoption blocker in the challenge log.`
    : "Challenge logging needs more source material before a dominant blocker can be identified.";
}

function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${weekNo}`;
}
