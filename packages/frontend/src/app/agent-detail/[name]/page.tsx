'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAgentDetail, AgentDetail } from '@/components/agentService';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useSharesBalance } from '@/hooks/useSharesBalance';
import { useRouter } from 'next/navigation';
import TradeForm from '@/components/TradeForm';

export default function AgentDetailPage({ params }: { params: { name: string } }) {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const walletAddress = currentAccount?.address;
  const isWalletConnected = !!walletAddress;
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell' | null>(null);
  
  // Decode agent name from URL
  const agentName = decodeURIComponent(params.name);
  
  // Get user's shares balance
  const { formattedBalance, isLoading: balanceLoading } = useSharesBalance(
    agent?.subject_address || ''
  );
  
  // Handle Buy button click - opens the buy modal
  const handleBuy = () => {
    if (!agent?.subject_address) return;
    setTradeMode('buy');
  };
  
  // Handle Sell button click - opens the sell modal
  const handleSell = () => {
    if (!agent?.subject_address) return;
    setTradeMode('sell');
  };
  
  // Handle closing the trade form
  const handleCloseTradeForm = () => {
    setTradeMode(null);
  };
  
  // Handle trade completion
  const handleTradeComplete = () => {
    setTradeMode(null);
    // Refresh balance after successful trade
    // This assumes useSharesBalance has a way to refresh
  };
  
  // Load Agent details
  useEffect(() => {
    const loadAgentDetail = async () => {
      setLoading(true);
      try {
        const data = await fetchAgentDetail(agentName);
        setAgent(data);
        setError('');
      } catch (err) {
        console.error('Error loading agent detail:', err);
        setError('Failed to load agent details. Please try again later.');
        setAgent(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadAgentDetail();
  }, [agentName]);
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error || !agent) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">Agent Detail</h1>
          <Link href="/search-agent">
            <button className="bg-gray-200 px-4 py-2 rounded-lg text-black">
              Back to Search
            </button>
          </Link>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Agent not found'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Agent Detail</h1>
        <div className="flex items-center gap-4">
          <Link href="/search-agent">
            <button className="bg-gray-200 px-4 py-2 rounded-lg text-black">
              Back to Search
            </button>
          </Link>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">{agent.agent_name}</h2>
            
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Subject Address</div>
              <div className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                {agent.subject_address}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Bio</div>
              <div className="text-sm bg-gray-100 p-2 rounded whitespace-pre-wrap">
                {agent.bio || 'No bio available'}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500 mb-1">Invite URL</div>
              <a 
                href={agent.invite_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline break-all block"
              >
                {agent.invite_url}
              </a>
            </div>
          </div>
          
          <div className="flex flex-col justify-center items-center">
            {!isWalletConnected ? (
              <div className="text-center p-6 bg-yellow-50 rounded-lg">
                <p className="mb-4">Connect your wallet to trade shares</p>
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="mb-4">You currently have {formattedBalance} shares of this agent</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleBuy}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                  >
                    Buy Shares
                  </button>
                  <button
                    onClick={handleSell}
                    disabled={parseFloat(formattedBalance) <= 0}
                    className={`px-6 py-2 rounded-lg ${
                      parseFloat(formattedBalance) > 0
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Sell Shares
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {tradeMode && agent && (
        <TradeForm
          mode={tradeMode}
          share={{
            subject_address: agent.subject_address,
            shares_amount: formattedBalance
          }}
          userAddress={walletAddress || ''}
          onClose={handleCloseTradeForm}
          onComplete={handleTradeComplete}
        />
      )}
    </div>
  );
} 