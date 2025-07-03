import React from 'react';

const Results = ({ data }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      {data.length === 0 ? (
        <p>No results found.</p>
      ) : (
        data.map(item => (
          <div key={item.id} style={{ marginBottom: '10px' }}>
            <h4>{item.title}</h4>
            <p>{item.description}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Results;
