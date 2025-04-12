"use client";

import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { fetchAgents, Agent } from '@/utils/mockAgents';
import { fetchAgentsFromChain } from '@/utils/transactions';
import AgentCard from './AgentCard';
import AgentModal from './AgentModal';

export default function AgentList() {
  const { connection } = useConnection();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showEndpoint, setShowEndpoint] = useState(false);

  useEffect(() => {
    const loadAgents = async () => {
      setLoading(true);
      try {
        const blockchainAgents = await fetchAgentsFromChain(connection);
        if (blockchainAgents && blockchainAgents.length > 0) {
          setAgents(blockchainAgents);
          setError(null);
        } else {
          const mockData = await fetchAgents();
          setAgents(mockData);
          setError('No blockchain agents found, showing mock data instead.');
        }
      } catch (err) {
        console.error('Failed to fetch agents:', err);
        const mockData = await fetchAgents();
        setAgents(mockData);
        setError('Failed to fetch blockchain agents, showing mock data.');
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, [connection]);

  const handleUseAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowEndpoint(false);
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

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white pb-8">Available Agents</h2>
        {error && <div className="mb-6 p-3 bg-amber-900/20 border border-amber-500/30 rounded-md text-amber-400">ⓘ {error}</div>}
      </div>

      {agents.length === 0 ? (
        <div className="card-solana p-12 text-center relative overflow-hidden">
          <h3 className="text-xl font-semibold mb-4 text-white">No Agents Found</h3>
          <p className="text-lightGray">No AI agents are currently available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onUse={handleUseAgent} />
          ))}
        </div>
      )}

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
