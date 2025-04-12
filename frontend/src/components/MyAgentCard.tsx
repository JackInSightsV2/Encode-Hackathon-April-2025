"use client";

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { lamportsToSol, formatSol, shortenAddress } from '@/utils/solana';
import { Agent } from '@/utils/mockAgents';
import toast from 'react-hot-toast';

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-800">{agent.name}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Your Agent
          </span>
        </div>
        
        <p className="text-gray-600 mt-2 mb-4">{agent.description}</p>
        
        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Price:</span>
            <span className="font-semibold text-blue-600">{formattedPrice} SOL</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Endpoint:</span>
            <span className="font-mono text-xs text-gray-800 truncate max-w-[180px]">{agent.endpointUrl}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Total Calls:</span>
            <span className="font-semibold text-gray-800">{agent.totalCalls}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Total Earnings:</span>
            <span className="font-semibold text-green-600">{formattedEarnings} SOL</span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-100 p-4">
        <div className="flex gap-2">
          <button
            onClick={handleEditClick}
            disabled={isLoading || !connected}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm focus:outline-none ${
              isLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Edit Agent
          </button>
          
          <button
            onClick={handleDeleteClick}
            disabled={isLoading || !connected}
            className={`py-2 px-4 rounded-md font-medium text-sm focus:outline-none ${
              isLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
            }`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
} 