# Healthcare Notion

Daily Hospital AI Briefing System

## Prerequisites

- **Node.js**: Download and install from [nodejs.org](https://nodejs.org/en/download/) (LTS version recommended)

## Overview

This app collects the latest software and AI developments in hospital workflows and presents them in a readable daily update format, with weekly summaries.

## Features

- Daily entries with summary, overview, key developments, tags, and challenge log
- Weekly summaries highlighting patterns and important changes
- Browse by day, topic, and challenge

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   cd server && npm install
   ```

2. Set up environment: Edit `server/.env` and add your NewsAPI key:
   ```
   NEWS_API_KEY=your_key_from_newsapi.org
   PORT=3001
   ```

3. Start the app (one command):
   ```bash
   npm start
   ```
   
   The app will:
   - Build the React frontend
   - Start the backend server on port 3001
   - Serve everything at http://localhost:3001

## Manual Entry Generation

To force a new daily entry without waiting for the daily scheduler, send a POST request:

```bash
curl -X POST http://localhost:3001/api/generate-entry
```

To generate the weekly summary manually:

```bash
curl -X POST http://localhost:3001/api/generate-summary
```

## Development Mode

For development with hot reloading:

```bash
npm run dev
```

This starts Vite dev server on port 5173 with proxy to backend (if backend is running on 3001).

## Get a NewsAPI Key

1. Visit [newsapi.org](https://newsapi.org/)
2. Sign up for a free account
3. Copy your API key
4. Add it to `server/.env`

Without an API key, the app will still run but won't fetch news data.

## Data Collection

The backend automatically runs daily entry generation at 6 AM and weekly summaries on Sundays at 7 AM.

For manual triggers, use POST /api/generate-entry and /api/generate-summary.

## Deployment

Build frontend with `npm run build`, then deploy server to a platform like Heroku or Vercel.