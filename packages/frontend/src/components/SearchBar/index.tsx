import React, { useState, useRef } from 'react';
import { z } from 'zod';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
}

const searchSchema = z
  .string()
  .max(50, { message: 'Search must be at most 50 characters.' })
  .regex(/^[a-zA-Z0-9\s]*$/, { message: 'Only letters, numbers, and spaces are allowed.' });

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSearch }) => {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const result = searchSchema.safeParse(val);
    if (!result.success) {
      setError(result.error.errors[0].message);
    } else {
      setError(null);
      onChange(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !error && onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-72">
      <input
        ref={inputRef}
        type="text"
        className={`w-full pl-10 pr-8 py-2 rounded-lg bg-white/80 border border-gray-200 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition placeholder-gray-400 ${error ? 'border-red-400' : ''}`}
        placeholder="Search agents..."
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <span className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </span>
      {value && (
        <button
          type="button"
          className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
          onClick={handleClear}
          tabIndex={-1}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      )}
      {error && <div className="text-xs text-red-500 mt-1 ml-1">{error}</div>}
    </div>
  );
};

export default SearchBar;
