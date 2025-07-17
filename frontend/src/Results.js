import React from 'react';

const Results = ({ data }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      {data.map((item, index) => (
        <div key={item.id || index} style={{ marginBottom: '10px' }}>
          <h4>{item.title}</h4>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
};

export default Results;