'use client';

import React, { useState, useEffect } from 'react';
import SearchInput from './SearchInput';
import SortAndFilter from './SortAndFilter';
import AgentList from './AgentList';
import AgentPagination from './AgentPagination';
import { fetchAgentList } from './api';
import { Agent } from '@/app/agent-list/types';
import { notification } from '../helpers/notification';
import { ArrowDownAZ, ArrowUpZA } from 'lucide-react';
import { nanoid } from 'nanoid';

function Page() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('new');
  const [filter, setFilter] = useState('');

  // Sort and filter options
  const sortOptions = [
    { id: nanoid(), label: 'Newest', value: 'new', icon: <ArrowDownAZ className="h-4 w-4" /> },
    { id: nanoid(), label: 'Trending', value: 'trending', icon: <ArrowUpZA className="h-4 w-4" /> },
    { id: nanoid(), label: 'Price Asc', value: 'price-asc', icon: <ArrowDownAZ className="h-4 w-4" /> },
    { id: nanoid(), label: 'Price Desc', value: 'price-desc', icon: <ArrowUpZA className="h-4 w-4" /> },
  ];
  const filterCategories = [
    {
      id: 'desc',
      name: 'Description',
      options: [
        { id: nanoid(), label: 'Contains AI', value: 'ai' },
        { id: nanoid(), label: 'Contains Agent', value: 'agent' },
      ],
    },
  ];

  // Load agent list
  const loadAgents = async () => {
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
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
        setError((err as { message: string }).message);
      } else {
        setError('Failed to load agents.');
      }
      setAgents([]);
    }
  };

  // Listen to page/search/sort/filter changes
  useEffect(() => {
    loadAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, sort, filter]);

  // Search on enter or button
  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  // Sort change
  const handleSortChange = (value: string) => {
    setSort(value);
    setPage(1);
  };

  // Filter change
  const handleFilterChange = (filters: Record<string, string[]>) => {
    // Only handle description filter
    const descFilters = filters['desc'] || [];
    setFilter(descFilters.join(' '));
    setPage(1);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Agent List</h1>
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <SearchInput
          placeholder="Search agents..."
          onSearch={handleSearch}
        />
        <SortAndFilter
          sortOptions={sortOptions}
          filterCategories={filterCategories}
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
        />
      </div>
      {error && (() => { notification.error(null, error); return null; })()}
      <AgentList agents={agents.slice((page-1)*pageSize, page*pageSize)} />
      <AgentPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

export default Page;