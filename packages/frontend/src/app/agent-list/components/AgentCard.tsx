import React from 'react';
import { Agent } from '../types';

interface AgentCardProps {
  agent: Agent;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  // If image is an empty string, pass null to avoid warning
  const imgSrc = agent.image && agent.image.trim() !== '' ? agent.image : null;
  return (
    <div className="rounded-xl border-2 border-transparent hover:border-blue-400 transition p-4 bg-white shadow-sm flex flex-col">
      {imgSrc && (
        <img
          src={imgSrc}
          alt={agent.name}
          className="w-full h-40 object-cover rounded-lg mb-4"
        />
      )}
      <div className="font-bold text-lg mb-1">{agent.name}</div>
      <div className="text-sm text-gray-500 mb-1">{agent.symbol}</div>
      <div className="text-blue-600 font-bold text-md mb-2">${agent.price}</div>
      <div className="text-xs text-gray-400 truncate">{agent.description}</div>
    </div>
  );
};

export default AgentCard;
