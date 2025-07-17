const express = require('express');
const axios = require('axios');
const https = require('https');
const router = express.Router();

router.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing search query' });

  const options = {
    method: 'GET',
    url: 'https://google-search74.p.rapidapi.com/',
    params: {
      query: query,
      limit: 5,
      related_keywords: 'true'
    },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'google-search74.p.rapidapi.com'
    },
    httpsAgent: new https.Agent({ rejectUnauthorized: false }) // optional for local dev
  };

  try {
    const response = await axios.request(options);
    const items = response.data.results || [];

    const results = items.slice(0, 5).map(item => ({
      title: item.title,
      link: item.url,
      description: item.description
    }));

    res.json(results);
  } catch (error) {
    console.error('RapidAPI Google Search error:', error.response?.status, error.message);
    res.status(500).json({ error: 'Google Search failed via RapidAPI' });
  }
});

module.exports = router;