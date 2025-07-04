import React, { useState } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import Results from './Results';
import Navbar from './Navbar';
import Footer from './Footer';


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
    <div
    style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#282c34', // dark background
      color: 'white',
    }}
  >
      <Navbar />

      <div style={{
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      textAlign: 'center',
      padding: '40px',
      transform: 'translateY(-80px)', // shift upward
  }}
>
<h1 style={{ fontSize: '64px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
  <span style={{ color: '#4285F4' }}>L</span>
  <span style={{ color: '#DB4437' }}>e</span>
  <span style={{ color: '#F4B400' }}>e</span>
  <span style={{ color: '#4285F4' }}>t</span>
  <span style={{ color: '#0F9D58' }}>S</span>
  <span style={{ color: '#DB4437' }}>n</span>
  <span style={{ color: '#F4B400' }}>i</span>
  <span style={{ color: '#0F9D58' }}>f</span>
  <span style={{ color: '#4285F4' }}>f</span>
</h1>

  <SearchBar query={query} setQuery={setQuery} onSearch={handleSearch} />
  <Results data={results} />
  </div>
  <Footer />
    </div>
  );
}



export default App;
