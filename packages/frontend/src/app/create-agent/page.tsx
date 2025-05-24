import React from 'react';
import CreateAgentForm from '~~/components/CreateAgentForm';

export default function CreateAgent() {
  return (
    <div className="min-h-screen w-full bg-[#0a1833]">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto bg-transparent p-6">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-4">Create New Agent</h1>
          <CreateAgentForm />
        </div>
      </div>
    </div>
  );
} 