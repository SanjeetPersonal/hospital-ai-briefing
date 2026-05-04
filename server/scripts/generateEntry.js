// generateEntry.js - Generate daily entry based on collected data

import { fetchHealthcareAINews } from './collectData.js';
import { readEntries, writeEntries } from '../data/dataManager.js';

const TOPIC_RULES = [
  { tag: 'documentation', keywords: ['documentation', 'note', 'scribe', 'ambient', 'chart'] },
  { tag: 'patient flow', keywords: ['patient flow', 'throughput', 'queue', 'discharge', 'scheduling'] },
  { tag: 'revenue cycle', keywords: ['revenue', 'claim', 'coding', 'denial', 'billing'] },
  { tag: 'bed management', keywords: ['bed', 'capacity', 'admission', 'occupancy'] },
  { tag: 'policy', keywords: ['policy', 'regulation', 'governance', 'cms', 'fda'] },
  { tag: 'clinical decision support', keywords: ['clinical decision', 'diagnosis', 'triage', 'risk', 'alert'] }
];

export async function generateDailyEntry() {
  const articles = await fetchHealthcareAINews();
  const entries = readEntries();
  const today = new Date().toISOString().split('T')[0];
  const existing = entries.find(e => e.date === today);

  if (!existing) {
    const newEntry = generateEntry(articles);
    entries.push(newEntry);
    writeEntries(entries);
    console.log('New entry created for', today);
  } else {
    console.log('Entry already exists for', today);
  }
}

function generateEntry(articles) {
  const today = new Date().toISOString().split('T')[0];

  if (articles.length === 0) {
    return {
      date: today,
      summary: "Little changed in hospital AI workflow adoption today.",
      overview: "No significant new source material was found in the past 24 hours. The archive still records the day so the notebook remains complete and future weekly summaries can distinguish true quiet periods from missing data.",
      keyDevelopments: [],
      tags: TOPIC_RULES.map(rule => rule.tag),
      challengeLog: {
        biggestStoppingPoint: "Integration remains the biggest stopping point when no new adoption evidence is available.",
        items: [
          "Trust still depends on source quality and clinician review.",
          "Workflow fit still determines whether pilots become routine use.",
          "Scaling still depends on repeatable deployment across units and sites."
        ]
      }
    };
  }

  const summary = `New developments in ${articles.length} areas of hospital AI.`;
  const overview = `Today's source set points to hospital AI activity across workflow operations. The most important items are listed first, then grouped with stable topic tags so the day can be compared with the rest of the archive.`;
  const keyDevelopments = articles.slice(0, 5).map(a => a.title);
  const tags = inferTags(articles);
  const challengeLog = {
    biggestStoppingPoint: inferBiggestStoppingPoint(articles),
    items: [
      "Trust needs evidence that AI outputs are accurate, auditable, and reviewed by accountable teams.",
      "Integration with EHR, staffing, routing, revenue, and governance systems remains the practical test.",
      "Workflow fit decides whether a tool saves time inside care delivery or creates another side process."
    ]
  };

  return {
    date: today,
    summary,
    overview,
    keyDevelopments,
    tags,
    challengeLog
  };
}

function inferTags(articles) {
  const text = articles.map(article => `${article.title} ${article.description || ''}`).join(' ').toLowerCase();
  const tags = TOPIC_RULES
    .filter(rule => rule.keywords.some(keyword => text.includes(keyword)))
    .map(rule => rule.tag);

  return tags.length > 0 ? tags : ['clinical decision support'];
}

function inferBiggestStoppingPoint(articles) {
  const text = articles.map(article => `${article.title} ${article.description || ''}`).join(' ').toLowerCase();

  if (text.includes('trust') || text.includes('accuracy') || text.includes('safety')) {
    return "Trust is the biggest stopping point today because the source set emphasizes accuracy, safety, or clinician confidence.";
  }

  if (text.includes('workflow') || text.includes('clinician') || text.includes('nurse')) {
    return "Workflow fit is the biggest stopping point today because adoption depends on whether clinical teams can use the tool without extra friction.";
  }

  if (text.includes('scale') || text.includes('enterprise') || text.includes('deployment')) {
    return "Scaling is the biggest stopping point today because the signal is moving from pilot activity toward repeatable deployment.";
  }

  return "Integration is the biggest stopping point today because hospital AI value depends on connecting outputs to operational systems of record.";
}
