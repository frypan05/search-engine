// Footer.js
import React from 'react';

function Footer() {
  return (
    <footer style={{
      width: '100%',
      backgroundColor: '#202124',
      color: '#9aa0a6',
      padding: '15px 30px',
      fontSize: '14px',
      display: 'flex',
      justifyContent: 'space-between',
      position: 'relative',
      bottom: 0,
    }}>
      <div>
        <a href="/privacy" style={{ color: '#9aa0a6', marginRight: '20px', textDecoration: 'none' }}>Privacy</a>
        <a href="/terms" style={{ color: '#9aa0a6', marginRight: '20px', textDecoration: 'none' }}>Terms</a>
        <a href="/help" style={{ color: '#9aa0a6', textDecoration: 'none' }}>Help</a>
      </div>
      
    </footer>
  );
}

export default Footer;
