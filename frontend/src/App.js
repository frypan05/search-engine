import React, { useState } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import Results from './Results';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const res = await axios.get(`http://localhost:5000/search?q=${query}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Simple Search Engine</h2>
      <SearchBar query={query} setQuery={setQuery} onSearch={handleSearch} />
      <Results data={results} />
    </div>
  );
}

export default App;
