import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const entriesFile = path.join(__dirname, 'entries.json');
const summariesFile = path.join(__dirname, 'summaries.json');

export function readEntries() {
  if (fs.existsSync(entriesFile)) {
    return JSON.parse(fs.readFileSync(entriesFile, 'utf8'));
  }
  return [];
}

export function writeEntries(entries) {
  fs.writeFileSync(entriesFile, JSON.stringify(entries, null, 2));
}

export function readSummaries() {
  if (fs.existsSync(summariesFile)) {
    return JSON.parse(fs.readFileSync(summariesFile, 'utf8'));
  }
  return [];
}

export function writeSummaries(summaries) {
  fs.writeFileSync(summariesFile, JSON.stringify(summaries, null, 2));
}