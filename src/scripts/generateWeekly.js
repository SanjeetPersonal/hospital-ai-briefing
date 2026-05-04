// generateWeekly.js - Generate weekly summary

import fs from 'fs';

import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const entriesFile = path.join(__dirname, '../data/entries.json');

const summariesFile = path.join(__dirname, '../data/summaries.json');

function loadEntries() {

  if (fs.existsSync(entriesFile)) {

    return JSON.parse(fs.readFileSync(entriesFile, 'utf8'));

  }

  return [];

}

function loadSummaries() {

  if (fs.existsSync(summariesFile)) {

    return JSON.parse(fs.readFileSync(summariesFile, 'utf8'));

  }

  return [];

}

function saveSummaries(summaries) {

  fs.writeFileSync(summariesFile, JSON.stringify(summaries, null, 2));

}

function getWeekNumber(date) {

  const d = new Date(date);

  d.setHours(0, 0, 0, 0);

  d.setDate(d.getDate() + 4 - (d.getDay() || 7));

  const yearStart = new Date(d.getFullYear(), 0, 1);

  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

  return `${d.getFullYear()}-W${weekNo}`;

}

function generateWeeklySummary(entries) {

  const now = new Date();

  const week = getWeekNumber(now);

  const last7Days = entries.filter(e => {

    const entryDate = new Date(e.date);

    const diff = (now - entryDate) / (1000 * 60 * 60 * 24);

    return diff <= 7;

  });

  const patterns = last7Days.flatMap(e => e.keyDevelopments).filter(d => d).slice(0, 3); // Top patterns

  const themes = [...new Set(last7Days.flatMap(e => e.tags))];

  const importantChanges = last7Days.filter(e => e.keyDevelopments.length > 0).map(e => e.summary);

  return {

    week,

    patterns,

    themes,

    importantChanges

  };

}

function main() {

  const entries = loadEntries();

  const summaries = loadSummaries();

  const now = new Date();

  const week = getWeekNumber(now);

  const existing = summaries.find(s => s.week === week);

  if (!existing) {

    const newSummary = generateWeeklySummary(entries);

    summaries.push(newSummary);

    saveSummaries(summaries);

    console.log('New weekly summary created for', week);

  } else {

    console.log('Summary already exists for', week);

  }

}

main();