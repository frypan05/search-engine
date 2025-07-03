const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

const data = require('./data'); // your sample data

app.use(cors());

// Search endpoint
app.get('/search', (req, res) => {
  const query = req.query.q?.toLowerCase();
  if (!query) return res.status(400).json({ error: 'No query provided' });

  const results = data.filter(item =>
    item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
  );

  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

