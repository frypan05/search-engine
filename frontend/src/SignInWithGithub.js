// SignInWithGithub.js
import React from 'react';

const SignInWithGithub = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3001/auth/github/callback';
  };

  return (
    <button onClick={handleLogin}>
      Sign in with GitHub
    </button>
  );
};

export default SignInWithGithub;