// App.js
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';
import Results from './Results';
import Navbar from './Navbar';
import Footer from './Footer';
import SignIn from './SignIn';
import AboutPage from './pages/About';
import SignUp from './SignUp';
import Dashboard from './pages/Dashboard';
import './App.css';

function HomePage({ query, setQuery, onSearch, isLoading, error, results }) {
  return (
    
    <div className="home-container">
      <div className="search-content">
        <h1 className="logo">
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
        <SearchBar query={query} setQuery={setQuery} onSearch={onSearch} />
        {isLoading && <div className="loading-indicator">Searching...</div>}
        {error && <div className="error-message">{error}</div>}
        <Results data={results} />
      </div>
    </div>
  );
}

function useAuthFromUrl() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const authParam = urlParams.get('auth');
    const userParam = urlParams.get('user');

    if (authParam === 'success' && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        setUser(userData);
        setAuthStatus('success');
        localStorage.setItem('user', JSON.stringify(userData));

        setTimeout(() => {
          window.history.replaceState({}, document.title, '/');
        }, 100);
      } catch (error) {
        setAuthStatus('error');
        setTimeout(() => {
          window.history.replaceState({}, document.title, '/');
        }, 100);
      }
    } else if (authParam === 'error') {
      setAuthStatus('error');
      setTimeout(() => {
        window.history.replaceState({}, document.title, '/');
      }, 100);
    }
  }, [location]);

  return { user, authStatus };
}

function AppContent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  const { user: urlUser, authStatus } = useAuthFromUrl();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem('user');
    }
    setIsUserLoaded(true);
  }, []);

  useEffect(() => {
    if (urlUser) setCurrentUser(urlUser);
  }, [urlUser]);

  useEffect(() => {
    if (authStatus === 'success') {
      setError(null);
    } else if (authStatus === 'error') {
      setError('Authentication failed. Please try again.');
    }
  }, [authStatus]);

  useEffect(() => {
    if (!currentUser && isUserLoaded) {
      axios.get('http://localhost:3001/auth/user', { withCredentials: true })
        .then(res => {
          if (res.data?.user) {
            setCurrentUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {});
    }
  }, [currentUser, isUserLoaded]);

  const handleSearch = useCallback(async (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.get(`http://localhost:3001/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(res.data);
    } catch {
      setError('Failed to fetch results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleLogout = useCallback(async () => {
    try {
      await axios.post('http://localhost:3001/auth/logout', {}, { withCredentials: true });
    } catch {}
    setCurrentUser(null);
    localStorage.removeItem('user');
  }, []);

  return (
    <div className="App">
      <Navbar githubUser={currentUser} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              query={query}
              setQuery={setQuery}
              onSearch={handleSearch}
              isLoading={isLoading}
              error={error}
              results={results}
            />
          }
        />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
