import React, { useRef, useState, useEffect } from 'react';
import { FaMicrophone, FaCamera } from 'react-icons/fa';
import './SearchBar.css';

function SearchBar({ query, setQuery, onSearch }) {
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const [inputValue, setInputValue] = useState(query || '');

  // Update input value when query prop changes
  useEffect(() => {
    setInputValue(query || '');
  }, [query]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setQuery(value); // Sync with parent
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setQuery(transcript);
        onSearch(transcript);
      };
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    }
    recognitionRef.current.start();
  };

  const handleImageIconClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      alert(`Image "${file.name}" uploaded`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search LeetSniff..."
        className="search-input"
        autoComplete="off"
      />
      <button type="button" onClick={handleVoiceSearch} className="icon-btn" title="Voice Search">
        <FaMicrophone size={20} />
      </button>
      <button type="button" onClick={handleImageIconClick} className="icon-btn" title="Search by Image">
        <FaCamera size={20} />
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
    </form>
  );
}

export default React.memo(SearchBar);