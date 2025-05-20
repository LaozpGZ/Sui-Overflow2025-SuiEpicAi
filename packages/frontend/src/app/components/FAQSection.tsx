import React from 'react';

// FAQ section with common questions and answers
const FAQSection = () => (
  <section className="w-full max-w-4xl mx-auto mb-16 px-4">
    <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
      Frequently Asked Questions
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* FAQ 1 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Can I try without a wallet?</h3>
        <p className="text-gray-600 dark:text-gray-400">Currently, connecting a Sui wallet is required. We are developing a wallet-free experience, so stay tuned.</p>
      </div>
      {/* FAQ 2 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">How do I earn token incentives?</h3>
        <p className="text-gray-600 dark:text-gray-400">You can earn token incentives by creating high-quality AI agents, participating in share trading, and engaging with the community.</p>
      </div>
    </div>
  </section>
);

export default FAQSection; 