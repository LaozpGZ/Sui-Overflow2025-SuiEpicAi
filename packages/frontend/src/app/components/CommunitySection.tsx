import React from 'react';

// Community section with links to Telegram, GitHub, and Twitter
const CommunitySection = () => (
  <section className="w-full max-w-4xl mx-auto mb-16 text-center px-4">
    <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
      Join Our Community
    </h2>
    <div className="flex flex-wrap justify-center gap-6">
      <a href="https://t.me/suiepicai" target="_blank" rel="noopener noreferrer" 
         className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
        <span>Telegram</span>
      </a>
      <a href="https://github.com/LaozpGZ/Sui-Overflow2025-SuiEpicAi" target="_blank" rel="noopener noreferrer"
         className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
        <span>GitHub</span>
      </a>
      <a href="#" target="_blank" rel="noopener noreferrer"
         className="flex items-center gap-2 px-6 py-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors">
        <span>Twitter</span>
      </a>
    </div>
  </section>
);

export default CommunitySection; 