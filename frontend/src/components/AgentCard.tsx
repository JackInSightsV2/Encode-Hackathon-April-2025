"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { lamportsToSol, formatSol, shortenAddress } from '@/utils/solana';
import { Agent } from '@/utils/mockAgents';
import { hasUserPaid } from '@/utils/transactions';
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
  const formattedPrice = formatSol(lamportsToSol(agent.price));
  
  // Truncate description if it's too long
  const shortDescription = agent.description.length > 120 
    ? `${agent.description.substring(0, 120)}...` 
    : agent.description;
  
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
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-800">{agent.name}</h3>
          {isOwner && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Your Agent
            </span>
          )}
        </div>
        
        <p className="text-gray-600 mt-2 mb-4">{shortDescription}</p>
        
        <div className="flex justify-between items-center mt-auto">
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-1">Price:</span>
            <span className="font-semibold text-blue-600">{formattedPrice} SOL</span>
          </div>
          
          <div className="text-xs text-gray-500 flex items-center">
            {hasPaid && !isOwner && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded mr-2">
                Purchased
              </span>
            )}
            <span>Used: {agent.totalCalls} times</span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-100 p-4">
        <button
          onClick={handleUseClick}
          disabled={isLoading || !connected}
          className={`w-full py-2 px-4 rounded-md font-medium text-sm focus:outline-none ${
            isLoading
              ? 'bg-gray-300 cursor-not-allowed'
              : connected
              ? hasPaid || isOwner
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Processing...' : 
           !connected ? 'Connect Wallet to Use' :
           hasPaid || isOwner ? 'Use Agent' : `Pay ${formattedPrice} SOL to Use`}
        </button>
      </div>
    </div>
  );
} 