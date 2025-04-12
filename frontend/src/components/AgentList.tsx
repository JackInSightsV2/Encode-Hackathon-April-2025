"use client";

import { useState, useEffect } from 'react';
import { fetchAgents, Agent } from '@/utils/mockAgents';
import AgentCard from './AgentCard';
import AgentModal from './AgentModal';

export default function AgentList() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showEndpoint, setShowEndpoint] = useState(false);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        const data = await fetchAgents();
        setAgents(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching agents:', err);
        setError('Failed to load agents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

  const handleUseAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    // In a real implementation, we would now check if the user has already paid
    // For now, we'll simulate showing the endpoint after "payment"
    setShowEndpoint(true);
  };

  const handleCloseModal = () => {
    setSelectedAgent(null);
    setShowEndpoint(false);
  };

  if (loading) {
    return (
      <div className="card-solana p-12 text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple border-r-transparent"></div>
        <p className="mt-6 text-lightGray">Loading agents...</p>
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
          <div className="mb-6 text-blue">
            <SearchIcon className="w-16 h-16 mx-auto opacity-70" />
          </div>
          <h3 className="text-xl font-semibold mb-4 text-white">No Agents Found</h3>
          <p className="text-lightGray">No AI agents are currently available in the marketplace.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <AgentCard 
            key={agent.id} 
            agent={agent} 
            onUse={handleUseAgent} 
          />
        ))}
      </div>

      {/* Modal for showing agent details and endpoint after "payment" */}
      {selectedAgent && (
        <AgentModal
          agent={selectedAgent}
          showEndpoint={showEndpoint}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

function ErrorIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function SearchIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
} 