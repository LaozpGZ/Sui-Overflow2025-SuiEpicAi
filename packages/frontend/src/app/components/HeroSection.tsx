import React from 'react';
import CustomConnectButton from './CustomConnectButton';

// Hero section with title, description, and call-to-action buttons
const HeroSection = () => (
  <section className="text-center mb-16">
    <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
      Welcome to SuiEpicAi
    </h1>
    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
      An AI-powered blockchain agent platform that integrates AI chat, social interaction, and tokenized incentives, empowering users to create, discover, and trade AI agents for smarter blockchain operations.
    </p>
    {/* Call to Action: Connect Wallet and Learn More */}
    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
      <CustomConnectButton />
      <a href="#learn-more" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
        Learn More →
      </a>
    </div>
  </section>
);

export default HeroSection; 