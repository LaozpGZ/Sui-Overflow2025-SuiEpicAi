'use client';
import React from 'react';
import AgentCard from "./AgentCard";

interface AgentCardProps {
  image: string;
  name: string;
  price: string | number;
  description: string;
}

interface AgentListProps {
  agents: AgentCardProps[];
}

const AgentList: React.FC<AgentListProps> = ({ agents }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {agents.map((agent, index) => (
        <AgentCard
          key={index}
          image={agent.image}
          name={agent.name}
          price={agent.price}
          description={agent.description}
        />
      ))}
    </div>
  );
};

export default AgentList; 