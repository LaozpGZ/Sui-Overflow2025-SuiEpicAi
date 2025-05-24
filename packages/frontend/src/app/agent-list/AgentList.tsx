'use client';
import React from 'react';
import Image from 'next/image';

interface Agent {
  id: string;
  name: string;
  symbol: string;
  price: string;
  description: string;
  image: string;
}

interface AgentListProps {
  agents: Agent[];
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

const AgentList: React.FC<AgentListProps> = ({ agents, page, totalPages, onPageChange }) => {
  const hasData = agents && agents.length > 0;
  const disablePrev = page <= 1 || totalPages === 0;
  const disableNext = page >= totalPages || totalPages === 0;

  return (
    <div className="w-full">
      {hasData ? (
        <>
          <div className="grid grid-cols-4 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="rounded-xl border-2 border-transparent hover:border-blue-400 transition p-4 bg-white shadow-sm flex flex-col"
              >
                <Image
                  src={agent.image}
                  alt={agent.name}
                  width={320}
                  height={160}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <div className="font-bold text-lg mb-1">{agent.name}</div>
                <div className="text-sm text-gray-500 mb-1">{agent.symbol}</div>
                <div className="text-blue-600 font-bold text-md mb-2">${agent.price}</div>
                <div className="text-xs text-gray-400 truncate">{agent.description}</div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          <div className="flex justify-center items-center mt-8 gap-2">
            <button
              className="px-2 py-1 rounded disabled:opacity-50"
              onClick={() => onPageChange && onPageChange(page - 1)}
              disabled={disablePrev}
            >
              {'<'}
            </button>
            <span className="mx-2">{page} / {totalPages}</span>
            <button
              className="px-2 py-1 rounded disabled:opacity-50"
              onClick={() => onPageChange && onPageChange(page + 1)}
              disabled={disableNext}
            >
              {'>'}
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-start py-24 text-gray-400 animate-pulse">
          <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-4">
            <circle cx="12" cy="12" r="10" strokeDasharray="4 2" />
            <path d="M8 12h8M12 8v8" />
          </svg>
          <div className="text-xl font-semibold">No agents found</div>
          <div className="text-sm mt-2">Please try adjusting your search or filter.</div>
        </div>
      )}
    </div>
  );
};

export default AgentList; 