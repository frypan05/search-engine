import React, { useRef } from 'react';
import { FaMicrophone, FaCamera } from 'react-icons/fa';

function SearchBar({ query, setQuery, onSearch }) {
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

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
        setQuery(transcript);
        onSearch(); // Auto-search
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    }

    recognitionRef.current.start();
  };

  const handleImageIconClick = () => {
    fileInputRef.current.click(); // Trigger hidden file input
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      alert(`Image "${file.name}" uploaded (you can implement search logic here)`);
      // TODO: Send the image to your backend for actual image search
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: '30px',
      padding: '10px 20px',
      maxWidth: '600px',
      width: '100%',
      boxShadow: '0 1px 6px rgba(32, 33, 36, 0.28)',
    }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        placeholder="Search LeetSniff..."
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          fontSize: '18px',
          padding: '10px',
          borderRadius: '30px',
        }}
      />

      {/* Voice Search Icon */}
      <button
        onClick={handleVoiceSearch}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginLeft: '10px',
        }}
        title="Voice Search"
      >
        <FaMicrophone size={20} color="#555" />
      </button>

      {/* Image Search Icon */}
      <button
        onClick={handleImageIconClick}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginLeft: '10px',
        }}
        title="Search by Image"
      >
        <FaCamera size={20} color="#555" />
      </button>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default SearchBar;
