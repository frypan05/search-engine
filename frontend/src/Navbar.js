import React from 'react';
import './Navbar.css'; // <-- import the CSS file

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="left-items">
        <a href="/about" className="title-link">About</a>
        <a href="/store" className="title-link">Store</a>
      </div>
      <div className="right-items">
        <a href="/gmail" className="right-link">Gmail</a>
        <a href="/images" className="right-link">Images</a>
        <button className="signin-button">Sign in</button>
      </div>
    </nav>
  );
};

export default Navbar;
