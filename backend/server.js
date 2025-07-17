const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();


console.log('Environment variables loaded:');
console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? 'Set' : 'Not set');
console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? 'Set' : 'Not set');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
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
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

const searchRouter = require('./api/search'); // correct path
app.use('/', searchRouter); // or app.use('/api', searchRouter);


// Passport GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:3001/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('GitHub Profile:', profile);
    // Create user object from GitHub profile
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
    console.log('Google Profile:', profile);
    // Create user object from Google profile
    const user = {
      id: profile.id,
      login: profile.emails[0].value.split('@')[0], // Use email prefix as login
      name: profile.displayName,
      email: profile.emails[0].value,
      avatar_url: profile.photos[0].value,
      html_url: null, // Google doesn't have a profile URL like GitHub
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

// Serialize/Deserialize user for session
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

// GitHub Auth Routes
app.get('/auth/github',
  passport.authenticate('github', {
    scope: ['user:email', 'read:user']
  })
);

app.get('/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/auth/failure',
    session: true
  }),
  (req, res) => {
    try {
      console.log('GitHub Auth Success - User:', req.user);
      
      // Successful authentication - redirect to frontend with user data
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const userDataEncoded = encodeURIComponent(JSON.stringify(req.user));
      
      res.redirect(`${frontendUrl}/?auth=success&user=${userDataEncoded}`);
    } catch (error) {
      console.error('GitHub Callback Error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/?auth=error`);
    }
  }
);

// Google Auth Routes
app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure',
    session: true
  }),
  (req, res) => {
    try {
      console.log('Google Auth Success - User:', req.user);
      console.log('Session ID:', req.sessionID);
      console.log('Is Authenticated:', req.isAuthenticated());
      
      // Successful authentication - redirect to frontend with user data
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const userDataEncoded = encodeURIComponent(JSON.stringify(req.user));
      
      res.redirect(`${frontendUrl}/?auth=success&user=${userDataEncoded}`);
    } catch (error) {
      console.error('Google Callback Error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/?auth=error`);
    }
  }
);

app.get('/auth/failure', (req, res) => {
  console.log('Auth Failure');
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

// Get current user
app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Check authentication status
app.get('/auth/status', (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? req.user : null
  });
});

// Your existing search route
app.get('/search', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  const axios = require('axios');

  const options = {
    method: 'GET',
    url: `https://google-search3.p.rapidapi.com/api/v1/search/q=${encodeURIComponent(query)}`,
    headers: {
      'X-User-Agent': 'desktop',
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'google-search3.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);

    const results = (response.data.results || []).slice(0, 5).map((item) => ({
      title: item.title,
      link: item.link,
      description: item.description
    }));

    res.json(results);
  } catch (error) {
    console.error('Search API Error:', error.message);
    res.status(500).json({ error: 'Google Search failed via RapidAPI' });
  }
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GitHub OAuth configured: ${!!process.env.GITHUB_CLIENT_ID}`);
  console.log(`Google OAuth configured: ${!!process.env.GOOGLE_CLIENT_ID}`);
});

module.exports = app;