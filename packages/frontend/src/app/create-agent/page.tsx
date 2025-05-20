import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CreateAgentForm from '../components/CreateAgentForm';

export default function CreateAgent() {
  return (
    <div className="min-h-screen w-full bg-[#0a1833]">
      <nav className="h-20 w-full flex justify-center items-center text-white text-2xl font-semibold">
        <Image src="/logo.svg" alt="Sui Epic AI Logo" width={40} height={40} />
      </nav>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-transparent p-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-6">Create New Agent</h1>
          <CreateAgentForm />
        </div>
      </div>
    </div>
  );
} 