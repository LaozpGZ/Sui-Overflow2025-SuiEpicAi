'use client';

import React, { useState, useEffect } from 'react';
import AgentList from './components/AgentList';
import SearchBar from './components/SearchBar';
import SortBar from './components/SortBar';
import Pagination from './components/Pagination';
import { fetchAgentList } from './api';
import { Agent } from './types';

function Page() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('new');
  const [filter, setFilter] = useState('');

  // Load agent list
  const loadAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Only use fetchAgentList, backend does not support search/sort/filter yet
      const data = await fetchAgentList(page, pageSize);
      let result = data.agents.map(a => ({
        id: a.subject_address,
        name: a.agent_name,
        symbol: '', // Not provided by backend
        price: '',  // Not provided by backend
        description: a.bio || '',
        image: a.image || '',
      }));
      // Frontend simulate search, filter, sort
      if (search) {
        result = result.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
      }
      if (filter) {
        result = result.filter(a => a.description.toLowerCase().includes(filter.toLowerCase()));
      }
      if (sort === 'trending') {
        result = [...result].reverse();
      } else if (sort === 'price-asc') {
        result = [...result].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      } else if (sort === 'price-desc') {
        result = [...result].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      }
      setAgents(result);
      setTotalPages(Math.max(1, Math.ceil(result.length / pageSize)));
    } catch (err: any) {
      setError(err.message || 'Failed to load agents.');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  // Listen to page/search/sort/filter changes
  useEffect(() => {
    loadAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, sort, filter]);

  // Search on enter or button
  const handleSearch = () => {
    setPage(1);
    loadAgents();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Agent list</h1>
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <SearchBar
          value={search}
          onChange={v => { setSearch(v); setPage(1); }}
          onSearch={handleSearch}
        />
        <SortBar
          sort={sort}
          onSortChange={v => { setSort(v); setPage(1); }}
          filter={filter}
          onFilterChange={v => { setFilter(v); setPage(1); }}
        />
      </div>
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      <AgentList agents={agents.slice((page-1)*pageSize, page*pageSize)} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} loading={loading} />
    </div>
  );
}

export default Page;