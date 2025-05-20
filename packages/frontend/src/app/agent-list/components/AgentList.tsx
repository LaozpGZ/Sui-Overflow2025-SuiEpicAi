import React from 'react';
import { Agent } from '../types';
import AgentCard from './AgentCard';

interface AgentListProps {
  agents: Agent[];
  loading?: boolean;
}

const AgentList: React.FC<AgentListProps> = ({ agents, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-6 w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 bg-gray-100 animate-pulse h-64" />
        ))}
      </div>
    );
  }
  if (!agents || agents.length === 0) {
    return (
      <div className="flex flex-col items-start py-24 text-gray-400 animate-pulse w-full">
        <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-4">
          <circle cx="12" cy="12" r="10" strokeDasharray="4 2" />
          <path d="M8 12h8M12 8v8" />
        </svg>
        <div className="text-xl font-semibold">No agents found</div>
        <div className="text-sm mt-2">Please try adjusting your search or filter.</div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-4 gap-6 w-full">
      {agents.map(agent => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
};

export default AgentList;
