"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchAgentsByOwner, Agent } from '@/utils/mockAgents';
import MyAgentCard from './MyAgentCard';
import AgentModal from './AgentModal';
import toast from 'react-hot-toast';
import Link from 'next/link';
import WalletConnectButton from './WalletConnectButton';

export default function MyAgentsList() {
  const { connected, publicKey } = useWallet();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showEndpoint, setShowEndpoint] = useState(false);

  useEffect(() => {
    const loadMyAgents = async () => {
      if (!connected || !publicKey) {
        setAgents([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchAgentsByOwner(publicKey.toString());
        setAgents(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching my agents:', err);
        setError('Failed to load your agents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadMyAgents();
  }, [connected, publicKey]);

  const handleEditAgent = (agent: Agent) => {
    // For demo purposes, we'll just show a toast message
    // In a real app, this would navigate to an edit form or show a modal
    toast.success(`Edit agent: ${agent.name}`);
  };

  const handleDeleteAgent = (agent: Agent) => {
    // For demo purposes, we'll just remove the agent from the list
    // In a real app, this would call a blockchain transaction
    setAgents(agents.filter(a => a.id !== agent.id));
    toast.success(`Deleted agent: ${agent.name}`);
  };

  if (!connected) {
    return (
      <div className="card-solana p-12 text-center">
        <div className="mb-6 text-purple">
          <WalletIcon className="w-16 h-16 mx-auto opacity-50" />
        </div>
        <h3 className="text-xl font-semibold mb-4 text-white">Connect Your Wallet</h3>
        <p className="text-lightGray mb-6">Connect your Solana wallet to view your registered agents</p>
        <div className="flex justify-center">
          <WalletConnectButton />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card-solana p-12 text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple border-r-transparent"></div>
        <p className="mt-6 text-lightGray">Loading your agents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-solana p-12 text-center">
        <div className="text-red mb-4">
          <ErrorIcon className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">Something went wrong</h3>
        <p className="text-lightGray mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-solana-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="card-solana p-12 text-center relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-36 h-36 bg-purple/20 rounded-full blur-3xl opacity-50"></div>
        <div className="relative z-10">
          <div className="mb-6 text-green">
            <PlusIcon className="w-16 h-16 mx-auto opacity-70" />
          </div>
          <h3 className="text-xl font-semibold mb-4 text-white">No Agents Found</h3>
          <p className="text-lightGray mb-6">You haven't registered any agents yet. Create your first AI agent to start earning SOL.</p>
          <Link 
            href="/register" 
            className="bg-gradient-to-r from-purple to-blue text-white font-medium rounded-lg px-6 py-3 shadow-solana hover:shadow-lg transition-all duration-200"
          >
            Register Your First Agent
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <MyAgentCard 
            key={agent.id} 
            agent={agent} 
            onEdit={handleEditAgent}
            onDelete={handleDeleteAgent}
          />
        ))}
      </div>
    </div>
  );
}

function WalletIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  );
}

function ErrorIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function PlusIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
} 