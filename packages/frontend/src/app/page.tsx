import React from 'react';
import NetworkSupportChecker from './components/NetworkSupportChecker';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import FAQSection from './components/FAQSection';
import CommunitySection from './components/CommunitySection';
// Assuming WalletConnect component might be available or will be implemented here or in a shared location
// import WalletConnectButton from './components/WalletConnectButton'; // Placeholder for wallet connect UI

// Homepage composed of modular sections for clarity and maintainability
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-gradient-to-b from-white to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      {/* Network support checker for dApp compatibility */}
      <NetworkSupportChecker />
      {/* Hero section with main title and call-to-action */}
      <HeroSection />
      {/* Features section with three main features */}
      <FeaturesSection />
      {/* How it works section for onboarding and advanced features */}
      <HowItWorksSection />
      {/* FAQ section for common questions */}
      <FAQSection />
      {/* Community section with social links */}
      <CommunitySection />
    </div>
  );
}
