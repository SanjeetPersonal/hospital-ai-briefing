// collectData.js - Fetch latest healthcare AI news from NewsAPI

import axios from 'axios';

const BASE_URL = 'https://newsapi.org/v2/everything';

export async function fetchHealthcareAINews() {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    console.error('NEWS_API_KEY is not configured.');
    return [];
  }

  const query = 'hospital AI OR healthcare AI OR medical AI';
  const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const url = `${BASE_URL}?q=${encodeURIComponent(query)}&from=${from}&sortBy=publishedAt&apiKey=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.status === 'ok') {
      return data.articles.filter(article => {
        const text = (article.title + ' ' + (article.description || '')).toLowerCase();
        return text.includes('hospital') || text.includes('healthcare') || text.includes('medical');
      }).map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt
      }));
    } else {
      console.error('NewsAPI error:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching news:', error.message);
    if (error.response && error.response.status === 401) {
      console.error('NewsAPI authorization failed. Check NEWS_API_KEY in server/.env.');
    }
    return [];
  }
}
