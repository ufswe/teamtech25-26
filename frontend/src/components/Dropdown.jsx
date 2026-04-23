import "./Dropdown.css"
import { useState, useRef, useEffect } from 'react';

export default function Dropdown({ label, value, onChange, options = [], placeholder }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const containerRef = useRef(null);

  // Sync display text when value changes externally
  useEffect(() => {
    if (!value) setQuery('');
    else {
      const match = options.find(o => o.value === value);
      if (match) setQuery(match.label);
    }
  }, [value, options]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        // Revert query to selected label if user typed something invalid
        const match = options.find(o => o.value === value);
        setQuery(match ? match.label : '');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [value, options]);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );
  const visibleOptions = filtered.slice(0, visibleCount);

  const handleSelect = (option) => {
    onChange(option.value);
    setQuery(option.label);
    setOpen(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    onChange(null); // clear selection while typing
    setOpen(true);
    setVisibleCount(10);
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Backspace") return;
    if (!value) return;
    const match = options.find(o => o.value === value);
    if (match && query === match.label) {
      e.preventDefault();
      setQuery("");
      onChange(null);
      setVisibleCount(10);
      setOpen(true);
    }
  };

  const handleScroll = (e) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    if (nearBottom) {
      setVisibleCount((prev) => Math.min(prev + 10, filtered.length));
    }
  };

  return (
    <div className="dropdown-wrapper" ref={containerRef}>
      {label && <label className="dropdown-label">{label}</label>}
      <div className="dropdown-input-container">
        <input
          type="text"
          className="dropdown-search-input"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && (
        <ul className="dropdown-list" onScroll={handleScroll}>
          {visibleOptions.length > 0 ? (
            visibleOptions.map(option => (
              <li
                key={option.value}
                className={`dropdown-item ${option.value === value ? 'selected' : ''}`}
                onMouseDown={() => handleSelect(option)}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="dropdown-item no-results">No airports found</li>
          )}
        </ul>
      )}
    </div>
  );
}
