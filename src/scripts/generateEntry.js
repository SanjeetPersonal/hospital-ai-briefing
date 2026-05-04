// generateEntry.js - Generate daily entry based on collected data

import fetchHealthcareAINews from './collectData.js';

import fs from 'fs';

import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const entriesFile = path.join(__dirname, '../data/entries.json');

function loadEntries() {

  if (fs.existsSync(entriesFile)) {

    return JSON.parse(fs.readFileSync(entriesFile, 'utf8'));

  }

  return [];

}

function saveEntries(entries) {

  fs.writeFileSync(entriesFile, JSON.stringify(entries, null, 2));

}

function generateEntry(articles) {

  const today = new Date().toISOString().split('T')[0];

  if (articles.length === 0) {

    return {

      date: today,

      summary: "Little changed in hospital AI developments today.",

      overview: "No significant new articles or updates were found in the past 24 hours.",

      keyDevelopments: [],

      tags: [],

      challengeLog: "No new challenges identified."

    };

  }

  const summary = `New developments in ${articles.length} areas of hospital AI.`;

  const overview = `Key articles highlight advancements in AI applications for healthcare workflows.`;

  const keyDevelopments = articles.slice(0, 5).map(a => a.title); // Top 5

  const tags = ['patient flow', 'clinical decision support']; // Placeholder

  const challengeLog = "Integration with existing hospital systems remains a key barrier.";

  return {

    date: today,

    summary,

    overview,

    keyDevelopments,

    tags,

    challengeLog

  };

}

async function main() {

  const articles = await fetchHealthcareAINews();

  const entries = loadEntries();

  const today = new Date().toISOString().split('T')[0];

  const existing = entries.find(e => e.date === today);

  if (!existing) {

    const newEntry = generateEntry(articles);

    entries.push(newEntry);

    saveEntries(entries);

    console.log('New entry created for', today);

  } else {

    console.log('Entry already exists for', today);

  }

}

main();