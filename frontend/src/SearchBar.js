import React from 'react';

const SearchBar = ({ query, setQuery, onSearch }) => {
  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSearch()}
      />
      <button onClick={onSearch}>Search</button>
    </div>
  );
};

export default SearchBar;
