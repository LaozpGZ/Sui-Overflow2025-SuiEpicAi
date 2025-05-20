import React, { useState } from 'react';
import { z } from 'zod';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const searchSchema = z
  .string()
  .max(50, { message: 'Search must be at most 50 characters.' })
  .regex(/^[a-zA-Z0-9\s]*$/, { message: 'Only letters, numbers, and spaces are allowed.' });

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="relative w-72">
      <input
        type="text"
        className={`w-full pl-10 pr-4 py-2 rounded-lg bg-white/80 border border-gray-200 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition placeholder-gray-400 ${error ? 'border-red-400' : ''}`}
        placeholder="Search agents..."
        value={value}
        onChange={handleChange}
      />
      <span className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </span>
      {error && <div className="text-xs text-red-500 mt-1 ml-1">{error}</div>}
    </div>
  );
};

export default SearchBar; 