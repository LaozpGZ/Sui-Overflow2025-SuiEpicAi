import React from 'react';

// Features section with three main feature cards
const FeaturesSection = () => (
  <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-16">
    {/* Feature 1: Create AI Agent */}
    <div className="flex flex-col items-center p-8 border rounded-xl shadow-lg bg-white dark:bg-gray-800 dark:border-gray-700 transform hover:scale-105 transition-all duration-200">
      <div className="text-4xl mb-4">🤖</div>
      <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Create AI Agent</h3>
      <p className="text-gray-600 dark:text-gray-300">Define and train your exclusive AI agent with specific blockchain operation capabilities.</p>
    </div>
    {/* Feature 2: Discover & Interact */}
    <div className="flex flex-col items-center p-8 border rounded-xl shadow-lg bg-white dark:bg-gray-800 dark:border-gray-700 transform hover:scale-105 transition-all duration-200">
      <div className="text-4xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Discover & Interact</h3>
      <p className="text-gray-600 dark:text-gray-300">Browse AI agents on the platform, explore their unique features through chat and community interaction.</p>
    </div>
    {/* Feature 3: Trade & Incentivize */}
    <div className="flex flex-col items-center p-8 border rounded-xl shadow-lg bg-white dark:bg-gray-800 dark:border-gray-700 transform hover:scale-105 transition-all duration-200">
      <div className="text-4xl mb-4">💎</div>
      <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Trade & Incentivize</h3>
      <p className="text-gray-600 dark:text-gray-300">Participate in agent share trading and earn tokenized incentives.</p>
    </div>
  </section>
);

export default FeaturesSection; 