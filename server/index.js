import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateDailyEntry } from './scripts/generateEntry.js';
import { generateWeeklySummary } from './scripts/generateWeekly.js';
import { readEntries, readSummaries } from './data/dataManager.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the built React app
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// API endpoints
app.get('/api/entries', (req, res) => {
  try {
    const entries = readEntries();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

app.get('/api/entries/latest', (req, res) => {
  try {
    const entries = readEntries();
    const latest = entries[entries.length - 1];
    res.json(latest || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch latest entry' });
  }
});

app.get('/api/summaries', (req, res) => {
  try {
    const summaries = readSummaries();
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
});

app.get('/api/summaries/latest', (req, res) => {
  try {
    const summaries = readSummaries();
    const latest = summaries[summaries.length - 1];
    res.json(latest || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch latest summary' });
  }
});

// Manual trigger endpoints for testing
app.post('/api/generate-entry', async (req, res) => {
  try {
    await generateDailyEntry();
    res.json({ message: 'Daily entry generated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate entry' });
  }
});

app.post('/api/generate-summary', async (req, res) => {
  try {
    await generateWeeklySummary();
    res.json({ message: 'Weekly summary generated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Schedule daily entry generation at 6 AM
cron.schedule('0 6 * * *', async () => {
  console.log('Running daily entry generation');
  try {
    await generateDailyEntry();
  } catch (error) {
    console.error('Error in daily entry generation:', error);
  }
});

// Schedule weekly summary on Sundays at 7 AM
cron.schedule('0 7 * * 0', async () => {
  console.log('Running weekly summary generation');
  try {
    await generateWeeklySummary();
  } catch (error) {
    console.error('Error in weekly summary generation:', error);
  }
});

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
