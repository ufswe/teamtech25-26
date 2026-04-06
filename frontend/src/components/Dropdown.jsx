import "./Dropdown.css"
import { useState, useRef, useEffect } from 'react';

export default function Dropdown({ label, value, onChange, options = [], placeholder }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Sync display text when value changes externally
  useEffect(() => {
    if (!value) setQuery('');
    else {
      const match = options.find(o => o.value === value);
      if (match) setQuery(match.label);
    }
  }, [value]);

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

  const handleSelect = (option) => {
    onChange(option.value);
    setQuery(option.label);
    setOpen(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    onChange(null); // clear selection while typing
    setOpen(true);
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
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && (
        <ul className="dropdown-list">
          {filtered.length > 0 ? (
            filtered.map(option => (
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