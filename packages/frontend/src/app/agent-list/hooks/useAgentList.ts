import { useEffect, useMemo, useState } from 'react';
import { Agent } from '../types';

export interface UseAgentListOptions {
  pageSize?: number;
  apiFetch?: (params: { search: string; sort: string; filter: string; page: number; pageSize: number }) => Promise<{ agents: Agent[]; total: number }>;
}

const mockAgents: Agent[] = Array.from({ length: 120 }).map((_, i) => ({
  id: String(i),
  name: `Agent ${i + 1}`,
  symbol: 'Sagentcoin',
  price: '0.00067',
  description: 'Placeholder/Placeholder/Placeholder/Placeholder/Placeholder/Placeholder/Placeholder/Placeholder/Placeholder/Placeholder...',
  image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=400&h=400&facepad=2',
}));

export function useAgentList({ pageSize = 12, apiFetch }: UseAgentListOptions = {}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('new');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        if (apiFetch) {
          const res = await apiFetch({ search, sort, filter, page, pageSize });
          if (!cancelled) {
            setAgents(res.agents);
            setTotal(res.total);
          }
        } else {
          // mock fallback
          let filtered = mockAgents;
          if (search) {
            filtered = filtered.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
          }
          if (sort === 'trending') {
            filtered = [...filtered].reverse();
          } else if (sort === 'price-asc') {
            filtered = [...filtered].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          } else if (sort === 'price-desc') {
            filtered = [...filtered].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          }
          if (filter) {
            filtered = filtered.filter(a => a.description.toLowerCase().includes(filter.toLowerCase()));
          }
          const total = filtered.length;
          const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
          if (!cancelled) {
            setAgents(paged);
            setTotal(total);
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to fetch agents');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [search, sort, filter, page, pageSize, apiFetch]);

  // 页码重置优化
  useEffect(() => {
    if (agents.length === 0 && page !== 1 && total > 0) {
      setPage(1);
    }
  }, [agents.length, page, total]);

  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);

  return {
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
  };
}
