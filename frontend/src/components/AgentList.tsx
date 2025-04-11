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
      <div className="w-full py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading agents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-20 text-center">
        <div className="text-red-500 mb-2">⚠️</div>
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="w-full py-20 text-center">
        <p className="text-gray-600">No agents found.</p>
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