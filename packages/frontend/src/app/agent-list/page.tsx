'use client';

import React from 'react';
import AgentList from './components/AgentList';
import SearchBar from './components/SearchBar';
import SortBar from './components/SortBar';
import Pagination from './components/Pagination';
import { useAgentList } from './hooks/useAgentList';

function Page() {
  const {
    agents,
    page,
    setPage,
    totalPages,
    search,
    setSearch,
    sort,
    setSort,
    filter,
    setFilter,
    loading,
    error,
  } = useAgentList();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Agent list</h1>
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <SearchBar
          value={search}
          onChange={v => { setSearch(v); setPage(1); }}
          onSearch={() => setPage(1)}
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
      <AgentList agents={agents} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} loading={loading} />
    </div>
  );
}

export default Page;