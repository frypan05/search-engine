const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
require('dotenv').config();

console.log('Environment variables loaded:');
console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? 'Set' : 'Not set');
console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? 'Set' : 'Not set');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
console.log('RAPIDAPI_KEY:', process.env.RAPIDAPI_KEY ? `Set (${process.env.RAPIDAPI_KEY.substring(0, 10)}...)` : 'Not set');
console.log('PORT:', process.env.PORT);

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:3001/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = {
      id: profile.id,
      login: profile.username,
      name: profile.displayName,
      email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
      avatar_url: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
      html_url: profile.profileUrl,
      bio: profile._json.bio,
      location: profile._json.location,
      public_repos: profile._json.public_repos,
      followers: profile._json.followers,
      following: profile._json.following,
      created_at: profile._json.created_at,
      provider: 'github',
      accessToken: accessToken
    };
    return done(null, user);
  } catch (error) {
    console.error('GitHub Strategy Error:', error);
    return done(error, null);
  }
}));

// Passport Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3001/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = {
      id: profile.id,
      login: profile.emails[0].value.split('@')[0],
      name: profile.displayName,
      email: profile.emails[0].value,
      avatar_url: profile.photos[0].value,
      html_url: null,
      bio: null,
      location: null,
      verified_email: profile.emails[0].verified,
      given_name: profile.name.givenName,
      family_name: profile.name.familyName,
      locale: profile._json.locale,
      provider: 'google',
      accessToken: accessToken
    };
    return done(null, user);
  } catch (error) {
    console.error('Google Strategy Error:', error);
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'OAuth Server Running with GitHub and Google' });
});

// API Key Test Route
app.get('/test-api', async (req, res) => {
  const testQuery = 'test';
  
  if (!process.env.RAPIDAPI_KEY) {
    return res.json({ error: 'RAPIDAPI_KEY not set' });
  }
  
  const tests = [
    {
      name: 'google-search74',
      url: 'https://google-search74.p.rapidapi.com/',
      params: { query: testQuery, limit: 5 },
      host: 'google-search74.p.rapidapi.com'
    },
    {
      name: 'google-search3',
      url: 'https://google-search3.p.rapidapi.com/api/v1/search',
      params: { q: testQuery, num: 5 },
      host: 'google-search3.p.rapidapi.com'
    }
  ];
  
  const results = {};
  
  for (const test of tests) {
    try {
      const response = await axios.get(test.url, {
        params: test.params,
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': test.host
        },
        timeout: 10000
      });
      
      results[test.name] = {
        status: response.status,
        success: true,
        dataKeys: Object.keys(response.data),
        resultCount: response.data.results?.length || 0
      };
    } catch (error) {
      results[test.name] = {
        status: error.response?.status || 'No response',
        success: false,
        error: error.message,
        details: error.response?.data || 'No error details'
      };
    }
  }
  
  res.json(results);
});

// GitHub Auth Routes
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email', 'read:user'] }));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/auth/failure', session: true }), (req, res) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const userDataEncoded = encodeURIComponent(JSON.stringify(req.user));
    res.redirect(`${frontendUrl}/?auth=success&user=${userDataEncoded}`);
  } catch (error) {
    console.error('GitHub Callback Error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/?auth=error`);
  }
});

// Google Auth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/auth/failure', session: true }), (req, res) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const userDataEncoded = encodeURIComponent(JSON.stringify(req.user));
    res.redirect(`${frontendUrl}/?auth=success&user=${userDataEncoded}`);
  } catch (error) {
    console.error('Google Callback Error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/?auth=error`);
  }
});

app.get('/auth/failure', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendUrl}/?auth=error`);
});

app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ error: 'Session destruction failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
});

app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.get('/auth/status', (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? req.user : null
  });
});

// ENHANCED SEARCH ROUTE WITH MULTIPLE FALLBACKS
app.get('/search', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  console.log(`\n🔍 SEARCH REQUEST: "${query}"`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

  // Check if API key is configured
  if (!process.env.RAPIDAPI_KEY) {
    console.log('❌ RAPIDAPI_KEY not configured');
    return res.json([
      {
        title: `${query} - Configuration Error`,
        link: '#',
        description: 'RapidAPI key not configured. Please set RAPIDAPI_KEY in your .env file.'
      }
    ]);
  }

  // Search strategies with different approaches
  const searchStrategies = [
    {
      name: 'google-search74-basic',
      config: {
        method: 'GET',
        url: 'https://google-search74.p.rapidapi.com/',
        params: { query: query, limit: 10 },
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'google-search74.p.rapidapi.com'
        },
        timeout: 15000
      }
    },
    {
      name: 'google-search3-basic',
      config: {
        method: 'GET',
        url: 'https://google-search3.p.rapidapi.com/api/v1/search',
        params: { q: query, num: 10 },
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'google-search3.p.rapidapi.com'
        },
        timeout: 15000
      }
    },
    {
      name: 'google-search74-leetcode',
      config: {
        method: 'GET',
        url: 'https://google-search74.p.rapidapi.com/',
        params: { query: `${query} leetcode`, limit: 10 },
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'google-search74.p.rapidapi.com'
        },
        timeout: 15000
      }
    }
  ];

  // Try each strategy
  for (const strategy of searchStrategies) {
    try {
      console.log(`\n🔄 Trying: ${strategy.name}`);
      console.log(`🌐 URL: ${strategy.config.url}`);
      console.log(`📝 Params:`, strategy.config.params);

      const response = await axios.request(strategy.config);
      
      console.log(`✅ ${strategy.name} - Status: ${response.status}`);
      console.log(`📊 Response keys:`, Object.keys(response.data));
      
      if (response.data && response.data.results) {
        const results = response.data.results.slice(0, 10).map(item => ({
          title: item.title || 'No title',
          link: item.url || item.link || '#',
          description: item.description || 'No description available'
        }));

        console.log(`🎉 ${strategy.name} - Found ${results.length} results`);
        
        if (results.length > 0) {
          console.log(`🔗 First result: ${results[0].title}`);
          return res.json(results);
        }
      } else {
        console.log(`❌ ${strategy.name} - No results array in response`);
        console.log(`📄 Full response:`, JSON.stringify(response.data, null, 2));
      }

    } catch (error) {
      console.error(`❌ ${strategy.name} - Error:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        code: error.code
      });

      if (error.response?.data) {
        console.log(`📄 Error response:`, JSON.stringify(error.response.data, null, 2));
      }
    }
  }

  // All strategies failed - return helpful mock results
  console.log(`\n❌ ALL SEARCH STRATEGIES FAILED`);
  console.log(`🔄 Returning mock results for development...`);

  const mockResults = [
    {
      title: `${query} - LeetCode`,
      link: `https://leetcode.com/problems/${query.toLowerCase().replace(/\s+/g, '-')}/`,
      description: `Find and solve the ${query} problem on LeetCode. Practice coding interviews with this algorithm challenge.`
    },
    {
      title: `${query} - GeeksforGeeks`,
      link: `https://www.geeksforgeeks.org/${query.toLowerCase().replace(/\s+/g, '-')}/`,
      description: `Learn about ${query} with detailed explanations, examples, and code implementations on GeeksforGeeks.`
    },
    {
      title: `${query} - HackerRank`,
      link: `https://www.hackerrank.com/challenges/${query.toLowerCase().replace(/\s+/g, '-')}/`,
      description: `Practice ${query} programming challenges and improve your coding skills on HackerRank.`
    },
    {
      title: `${query} - Stack Overflow`,
      link: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`,
      description: `Find answers and discussions about ${query} on Stack Overflow community.`
    },
    {
      title: `${query} - GitHub`,
      link: `https://github.com/search?q=${encodeURIComponent(query)}&type=code`,
      description: `Browse code examples and implementations related to ${query} on GitHub.`
    }
  ];

  res.json(mockResults);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🔧 GitHub OAuth: ${!!process.env.GITHUB_CLIENT_ID ? 'Configured' : 'Not configured'}`);
  console.log(`🔧 Google OAuth: ${!!process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}`);
  console.log(`🔧 RapidAPI: ${!!process.env.RAPIDAPI_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  /test-api    - Test RapidAPI connection`);
  console.log(`   GET  /search?q=   - Search functionality`);
  console.log(`   GET  /auth/github - GitHub OAuth`);
  console.log(`   GET  /auth/google - Google OAuth`);
  console.log(`\n💡 To test API: curl http://localhost:${PORT}/test-api`);
});

module.exports = app;