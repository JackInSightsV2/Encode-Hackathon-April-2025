"use client";

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { lamportsToSol, formatSol, shortenAddress } from '@/utils/solana';
import { Agent } from '@/utils/mockAgents';
import toast from 'react-hot-toast';
import Link from 'next/link';

type MyAgentCardProps = {
  agent: Agent;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agent: Agent) => void;
};

export default function MyAgentCard({ agent, onEdit, onDelete }: MyAgentCardProps) {
  const { connected, publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate earnings (for demo purposes)
  const earnings = agent.totalCalls * agent.price;
  const formattedEarnings = formatSol(lamportsToSol(earnings));
  
  // Format price as SOL
  const formattedPrice = formatSol(lamportsToSol(agent.price));
  
  const handleEditClick = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (onEdit) {
        onEdit(agent);
      }
    } catch (error) {
      console.error('Error editing agent:', error);
      toast.error('Failed to edit agent. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteClick = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (window.confirm('Are you sure you want to delete this agent?')) {
        if (onDelete) {
          onDelete(agent);
        }
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="card-solana overflow-hidden flex flex-col h-full bg-gray-900 rounded-xl border border-gray-800">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-green-400">Chain</span>
            <span className="h-2 w-2 rounded-full bg-white"></span>
            <span className="text-xs text-white">Your Agent</span>
          </div>
        </div>
        
        <p className="text-gray-400 mt-2 mb-4 text-sm">{agent.description}</p>
        
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Price:</span>
            <span className="font-semibold text-green-400">{formattedPrice} SOL</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Used:</span>
            <span className="text-sm text-gray-400">{agent.totalCalls} times</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 p-4">
        <Link href="/api-keys">
          <button
            disabled={isLoading || !connected}
            className="w-full py-2 px-4 rounded-md font-medium text-sm focus:outline-none bg-green-500 text-black hover:bg-green-400 disabled:bg-gray-500 disabled:text-gray-300"
          >
            Use Agent
          </button>
        </Link>
        
        <div className="text-center text-gray-500 text-xs mt-2">
          {shortenAddress(agent.id, 8)}
        </div>
      </div>
    </div>
  );
} 