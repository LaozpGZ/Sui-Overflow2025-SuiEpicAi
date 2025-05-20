import React from 'react';

interface SortBarProps {
  sort: string;
  onSortChange: (sort: string) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
}

const sortOptions = [
  { label: 'New', value: 'new' },
  { label: 'Trending🔥', value: 'trending' },
  { label: 'Market Cap', value: 'marketcap' },
  { label: 'Price ↑', value: 'price-asc' },
  { label: 'Price ↓', value: 'price-desc' },
];

const filterOptions = [
  { label: 'All', value: '' },
  { label: 'AI', value: 'ai' },
  { label: 'DeFi', value: 'defi' },
  { label: 'NFT', value: 'nft' },
  // 可根据实际业务继续扩展
];

const SortBar: React.FC<SortBarProps> = ({ sort, onSortChange, filter, onFilterChange }) => {
  return (
    <div className="flex gap-2 items-center">
      <select
        className="px-3 py-1 rounded-lg bg-white/80 border border-gray-200 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        value={sort}
        onChange={e => onSortChange(e.target.value)}
      >
        {sortOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <select
        className="px-3 py-1 rounded-lg bg-white/80 border border-gray-200 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        value={filter}
        onChange={e => onFilterChange(e.target.value)}
      >
        {filterOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <button className="ml-2 px-2 py-1 rounded border text-gray-500 hover:bg-gray-100 transition bg-white/80 shadow">
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4v16h16"/></svg>
      </button>
    </div>
  );
};

export default SortBar;
