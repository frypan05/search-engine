import React from 'react';

const Results = ({ data }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      {data.length === 0 ? (
        <p>Search the Web!</p>
      ) : (
        data.map((item, index) => (
          <div key={index} style={{ marginBottom: '20px' }}>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#4e9af1',
                textDecoration: 'none',
              }}
            >
              {item.title}
            </a>
            <p style={{ color: '#bbb', marginTop: '5px' }}>{item.description}</p>
            <p style={{ fontSize: '14px', color: '#888' }}>{item.link}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Results;
