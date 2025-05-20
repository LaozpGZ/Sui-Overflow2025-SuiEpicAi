import React from 'react';

// Section explaining how to get started and advanced features
const HowItWorksSection = () => (
  <section className="w-full max-w-4xl mx-auto mb-16 px-4" id="learn-more">
    <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
      How to Get Started
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Getting Started Steps */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">Getting Started</h3>
        <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
          <li>Connect your Sui wallet</li>
          <li>Browse existing AI agents</li>
          <li>Purchase agent shares or join communities</li>
          <li>Create your own AI agent</li>
        </ol>
      </div>
      {/* Advanced Features */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">Advanced Features</h3>
        <ul className="space-y-3 text-gray-700 dark:text-gray-300">
          <li>✨ Customize agent behaviors and strategies</li>
          <li>📈 Participate in agent share trading</li>
          <li>🤝 Join active community discussions</li>
          <li>🎯 Earn tokenized incentive rewards</li>
        </ul>
      </div>
    </div>
  </section>
);

export default HowItWorksSection; 