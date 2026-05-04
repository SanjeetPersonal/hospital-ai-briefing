// collectData.js - Fetch latest healthcare AI news from NewsAPI

const API_KEY = process.env.NEWS_API_KEY || 'YOUR_API_KEY_HERE'; // Replace with actual key

const BASE_URL = 'https://newsapi.org/v2/everything';

async function fetchHealthcareAINews() {

  const query = 'hospital AI OR healthcare AI OR medical AI';

  const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Last 24 hours

  const url = `${BASE_URL}?q=${encodeURIComponent(query)}&from=${from}&sortBy=publishedAt&apiKey=${API_KEY}`;

  try {

    const response = await fetch(url);

    const data = await response.json();

    if (data.status === 'ok') {

      return data.articles.filter(article => {

        // Filter for relevance: check if title or description contains keywords

        const text = (article.title + ' ' + article.description).toLowerCase();

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

    console.error('Error fetching news:', error);

    return [];

  }

}

export default fetchHealthcareAINews;