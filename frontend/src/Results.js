// Results.js
import React from 'react';
import './Results.css';

const Results = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const formatUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  };

  const truncateDescription = (description, maxLength = 160) => {
    if (!description) return '';
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...' 
      : description;
  };

  return (
    <div className="search-results">
      {data.map((result, index) => (
        <div key={index} className="search-result-item">
          <div className="result-header">
            <div className="result-url">
              <span className="result-domain">{formatUrl(result.link)}</span>
            </div>
            <div className="result-actions">
              <button className="result-action-btn" title="More options">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="result-content">
            <h3 className="result-title">
              <a 
                href={result.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="result-link"
              >
                {result.title}
              </a>
            </h3>
            
            <p className="result-description">
              {truncateDescription(result.description)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Results;