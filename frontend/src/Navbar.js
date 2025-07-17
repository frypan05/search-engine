// src/Navbar.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const location = useLocation(); // 👈 detects route change
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null); // clear if not found
    }
  }, [location]); // 👈 re-run on route change

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="left-items">
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/store" className="nav-link">Store</Link>
      </div>

      <div className="right-items">
        {user ? (
          <>
            <img
              src={user.avatar_url}
              alt="profile"
              style={{ width: '30px', borderRadius: '50%', marginRight: '10px' }}
            />
            <span style={{ color: '#fff', marginRight: '10px' }}>
              {user.name || user.login}
            </span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          <Link to="/signin" className="signin-button">Sign In</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
