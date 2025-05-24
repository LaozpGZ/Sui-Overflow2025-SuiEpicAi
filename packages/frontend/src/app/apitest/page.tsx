'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { fetchAgents, searchAgentByName, Agent } from '@/components/agentService';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import React from 'react';

function EnvVarsPanel() {
  // Only show environment variables starting with NEXT_PUBLIC_
  const envVars = Object.entries({
    NEXT_PUBLIC_SERVER_API: process.env.NEXT_PUBLIC_SERVER_API,
    NEXT_PUBLIC_AI_FRAME_API: process.env.NEXT_PUBLIC_AI_FRAME_API,
    NEXT_PUBLIC_SUI_NETWORK: process.env.NEXT_PUBLIC_SUI_NETWORK,
    NEXT_PUBLIC_TESTNET_PACKAGE_ID: process.env.NEXT_PUBLIC_TESTNET_PACKAGE_ID,
    NEXT_PUBLIC_TESTNET_SHARES_TRADING_OBJECT_ID: process.env.NEXT_PUBLIC_TESTNET_SHARES_TRADING_OBJECT_ID,
    NEXT_PUBLIC_MAINNET_PACKAGE_ID: process.env.NEXT_PUBLIC_MAINNET_PACKAGE_ID,
    NEXT_PUBLIC_MAINNET_SHARES_TRADING_OBJECT_ID: process.env.NEXT_PUBLIC_MAINNET_SHARES_TRADING_OBJECT_ID,
    NEXT_PUBLIC_DEVNET_PACKAGE_ID: process.env.NEXT_PUBLIC_DEVNET_PACKAGE_ID,
    NEXT_PUBLIC_DEVNET_SHARES_TRADING_OBJECT_ID: process.env.NEXT_PUBLIC_DEVNET_SHARES_TRADING_OBJECT_ID,
    NEXT_PUBLIC_LOCALNET_CONTRACT_PACKAGE_ID: process.env.NEXT_PUBLIC_LOCALNET_CONTRACT_PACKAGE_ID,
  });

  return (
    <div className="mb-8 p-6 bg-gray-100 rounded-xl shadow">
      <h2 className="text-lg font-bold mb-2 text-blue-800 flex items-center gap-2">
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9 9h6v6H9z"/></svg>
        Environment Variables Panel (NEXT_PUBLIC_*)
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left px-2 py-1">Variable</th>
              <th className="text-left px-2 py-1">Value</th>
            </tr>
          </thead>
          <tbody>
            {envVars.map(([key, value]) => (
              <tr key={key}>
                <td className="font-mono px-2 py-1 text-blue-900">{key}</td>
                <td className="font-mono px-2 py-1 text-gray-700 break-all">{value || <span className="text-red-500">Not set</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApiTestPanel() {
  const API_BASE = process.env.NEXT_PUBLIC_SERVER_API || 'https://38.54.24.5/api';
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  // Example parameters
  const testUser = '0x1234567890abcdef';
  const testChain = 'sui';
  const testAgentName = 'test-agent';

  // 1. Signature verification
  const verifySignature = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/verify-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge: 'test-challenge',
          chat_id: 'test-chat',
          signature: 'test-signature',
          user: testUser,
          chain_type: testChain,
        }),
      });
      setResult(await res.json());
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message?: unknown }).message === 'string') {
        setResult({ error: (e as { message: string }).message });
      } else {
        setResult({ error: String(e) });
      }
    }
    setLoading(false);
  };

  // 2. Get agent list
  const getAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/agents?page=1&page_size=5`);
      setResult(await res.json());
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message?: unknown }).message === 'string') {
        setResult({ error: (e as { message: string }).message });
      } else {
        setResult({ error: String(e) });
      }
    }
    setLoading(false);
  };

  // 3. Get agent by name
  const getAgentByName = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/agents/${testAgentName}`);
      setResult(await res.json());
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message?: unknown }).message === 'string') {
        setResult({ error: (e as { message: string }).message });
      } else {
        setResult({ error: String(e) });
      }
    }
    setLoading(false);
  };

  // 4. Get agent detail
  const getAgentDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/agent/detail/${testAgentName}`);
      setResult(await res.json());
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message?: unknown }).message === 'string') {
        setResult({ error: (e as { message: string }).message });
      } else {
        setResult({ error: String(e) });
      }
    }
    setLoading(false);
  };

  // 5. Get user shares
  const getUserShares = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/${testUser}/shares/${testChain}`);
      setResult(await res.json());
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message?: unknown }).message === 'string') {
        setResult({ error: (e as { message: string }).message });
      } else {
        setResult({ error: String(e) });
      }
    }
    setLoading(false);
  };

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow mb-12">
      <h1 className="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2">
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9 9h6v6H9z"/></svg>
        API Test Panel
      </h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <button onClick={verifySignature} disabled={loading} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 disabled:opacity-50 transition">Verify Signature</button>
        <button onClick={getAgents} disabled={loading} className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 disabled:opacity-50 transition">Get Agent List</button>
        <button onClick={getAgentByName} disabled={loading} className="px-4 py-2 rounded-lg bg-indigo-500 text-white font-semibold shadow hover:bg-indigo-600 disabled:opacity-50 transition">Get Agent By Name</button>
        <button onClick={getAgentDetail} disabled={loading} className="px-4 py-2 rounded-lg bg-purple-500 text-white font-semibold shadow hover:bg-purple-600 disabled:opacity-50 transition">Get Agent Detail</button>
        <button onClick={getUserShares} disabled={loading} className="px-4 py-2 rounded-lg bg-pink-500 text-white font-semibold shadow hover:bg-pink-600 disabled:opacity-50 transition">Get User Shares</button>
      </div>
      <div className="bg-gray-900 rounded-xl p-6 text-white font-mono text-sm overflow-x-auto min-h-[200px]">
        {loading ? <span className="animate-pulse">Loading...</span> : <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>}
      </div>
      <div className="mt-4 text-xs text-gray-500">
        <div>Test User: <span className="font-mono">{testUser}</span></div>
        <div>Test Chain: <span className="font-mono">{testChain}</span></div>
        <div>Test Agent Name: <span className="font-mono">{testAgentName}</span></div>
      </div>
    </div>
  );
}

function AgentSearchPanel() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Load agents with pagination
  const loadAgents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAgents(page, pageSize);
      setAgents(data.agents);
      setTotalPages(Math.ceil(data.total / pageSize) || 1);
      setError('');
    } catch (err) {
      console.error('Error loading agents:', err);
      setError('Failed to load agents. Please try again later.');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  // Search for a specific agent
  const handleSearch = async (_e: React.FormEvent) => {
    _e.preventDefault();
    
    if (!searchTerm.trim()) {
      loadAgents();
      return;
    }
    
    setLoading(true);
    try {
      const results = await searchAgentByName(searchTerm);
      setAgents(results);
      setTotalPages(1); // Reset pagination for search results
      setError('');
    } catch {
      setError('Agent not found or error occurred during search.');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  // Load agents when component mounts or page/searchTerm changes
  useEffect(() => {
    if (!searchTerm) {
      loadAgents();
    }
  }, [page, searchTerm, loadAgents]);

  // Handle page navigation
  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Format date string to be more readable
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Search Agents</h1>
        <Link href="/">
          <button className="bg-gray-200 px-4 py-2 rounded-lg text-black">
            Back to Home
          </button>
        </Link>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by agent name"
          className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              loadAgents();
            }}
            className="bg-gray-200 text-black px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            Clear
          </button>
        )}
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading Message */}
      {loading && <LoadingSpinner />}

      {/* Agents Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agent Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agents.length > 0 ? (
              agents.map((agent, index) => (
                <tr key={`${agent.agent_name}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link href={`/agent-detail/${encodeURIComponent(agent.agent_name)}`} className="text-blue-600 hover:underline">
                      {agent.agent_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {agent.subject_address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(agent.created_at)}
                  </td>
                </tr>
              ))
            ) : !loading && (
              <tr>
                <td colSpan={3} className="px-6 py-4">
                  <EmptyState />
                  <div className="text-center text-gray-500 mt-2">
                    {searchTerm ? `No agents found for "${searchTerm}"` : "No agents available"}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!searchTerm && (
        <div className="flex justify-between items-center mt-4">
          <div>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className={`px-4 py-2 rounded-lg ${
                page <= 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className={`px-4 py-2 rounded-lg ${
                page >= totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApiTestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <EnvVarsPanel />
      <ApiTestPanel />
      <div className="my-8 border-t border-gray-200" />
      <AgentSearchPanel />
    </div>
  );
}
