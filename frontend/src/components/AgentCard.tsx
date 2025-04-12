"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { formatLamportsAsSol } from '@/utils/solanaFormatters';
import { Agent } from '@/utils/mockAgents';
import { hasUserPaid } from '@/utils/transactions';
import StatusIndicator from './StatusIndicator';
import toast from 'react-hot-toast';

type AgentCardProps = {
  agent: Agent;
  onUse?: (agent: Agent) => void;
};

export default function AgentCard({ agent, onUse }: AgentCardProps) {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  
  // Check if the current user is the owner of this agent
  const isOwner = publicKey && agent.owner === publicKey.toString();
  
  // Format price as SOL
  const formattedPrice = formatLamportsAsSol(agent.price);
  
  // Truncate description if it's too long
  const shortDescription = agent.description.length > 120 
    ? `${agent.description.substring(0, 120)}...` 
    : agent.description;
  
  // Determine if this is a blockchain agent (Solana public keys are 32-44 characters)
  const isBlockchainAgent = agent.id.length >= 32;
  
  // Check if user has already paid for this agent
  useEffect(() => {
    if (connected && publicKey) {
      const checkPaymentStatus = async () => {
        try {
          const paid = await hasUserPaid(agent.id, publicKey, connection);
          setHasPaid(paid);
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      };
      
      checkPaymentStatus();
    }
  }, [agent.id, connected, publicKey, connection]);
  
  const handleUseClick = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // We'll handle actual payment in the modal
      if (onUse) {
        onUse(agent);
      }
    } catch (error) {
      console.error('Error preparing agent:', error);
      toast.error('Failed to prepare agent. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Determine button style based on conditions
  const getButtonStyle = () => {
    if (isLoading) {
      return 'btn-solana-disabled';
    }
    
    if (!connected) {
      return 'bg-darkGray text-lightGray cursor-not-allowed';
    }
    
    if (hasPaid || isOwner) {
      return 'bg-gradient-to-r from-green to-teal text-black shadow-md hover:shadow-lg hover:from-green-dark hover:to-teal';
    }
    
    return 'bg-gradient-to-r from-purple to-blue text-white shadow-md hover:shadow-lg hover:from-purple-dark hover:to-blue-dark';
  };
  
  return (
    <div className={`bg-darkGray border ${isBlockchainAgent ? 'border-green/20' : 'border-gray/60'} hover:border-purple transition-all duration-300 rounded-xl shadow-md overflow-hidden flex flex-col h-full hover:shadow-solana hover:scale-[1.02]`}>
      <div className="p-6 flex-grow relative">
        {/* Purple glow effect in top-left corner */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-purple/20 rounded-full blur-xl"></div>
        
        <div className="flex justify-between items-start mb-3 relative z-10">
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
            {isBlockchainAgent && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-700/20">
                Chain
              </span>
            )}
          </div>
          {isOwner && (
            <StatusIndicator status="info" text="Your Agent" size="sm" />
          )}
        </div>
        
        <div className="mb-4 h-20 overflow-hidden relative z-10">
          <p className="text-lightGray">{shortDescription}</p>
        </div>
        
        <div className="flex justify-between items-center mt-auto relative z-10">
          <div className="flex items-center">
            <span className="text-sm text-lightGray mr-1">Price:</span>
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple to-blue">{formattedPrice}</span>
          </div>
          
          <div className="text-xs text-lightGray flex items-center">
            {hasPaid && !isOwner && (
              <StatusIndicator status="success" text="Purchased" size="sm" className="mr-2" />
            )}
            <span>Used: {agent.totalCalls} times</span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray/30 p-4 relative">
        {/* Blue glow effect in bottom-right corner */}
        <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-blue/20 rounded-full blur-xl"></div>
        
        <button
          onClick={handleUseClick}
          disabled={isLoading || !connected}
          className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm focus:outline-none transition-all duration-200 relative z-10 ${getButtonStyle()}`}
        >
          {isLoading 
            ? <span className="flex items-center justify-center"><LoadingSpinner /> Processing...</span> 
            : !connected 
              ? 'Connect Wallet to Use' 
              : hasPaid || isOwner 
                ? 'Use Agent' 
                : `Pay ${formattedPrice} to Use`
          }
        </button>
        
        {isBlockchainAgent && (
          <div className="mt-2 text-center">
            <span className="text-xs font-mono text-gray-500 truncate block">{agent.id.substring(0, 8)}...{agent.id.substring(agent.id.length - 8)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
} 