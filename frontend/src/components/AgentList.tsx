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
  const [usingBlockchainData, setUsingBlockchainData] = useState(true);
  const [showMockData, setShowMockData] = useState(false);
  const [mockAgentsData, setMockAgentsData] = useState<Agent[]>([]);
  const [chainAgentsData, setChainAgentsData] = useState<Agent[]>([]);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        
        // Load both data sources in parallel
        const [mockData, chainAgents] = await Promise.all([
          fetchAgents(),
          fetchAgentsFromChain(connection)
        ]);
        
        // Store both data sources
        setMockAgentsData(mockData || []);
        setChainAgentsData(chainAgents || []);
        
        // Determine which data to show
        if (!showMockData && chainAgents && chainAgents.length > 0) {
          setAgents(chainAgents);
          setUsingBlockchainData(true);
        } else {
          setAgents(mockData);
          setUsingBlockchainData(false);
          if (!showMockData && (!chainAgents || chainAgents.length === 0)) {
            setError('No blockchain agents found. Showing mock data instead.');
          }
        }
        
      } catch (err) {
        console.error('Error fetching agents:', err);
        
        // Try loading mock data as fallback
        try {
          const mockData = await fetchAgents();
          setMockAgentsData(mockData);
          setAgents(mockData);
          setUsingBlockchainData(false);
          setError('Could not load blockchain data. Showing mock agents instead.');
        } catch (mockErr) {
          setError('Failed to load agents. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, [connection, showMockData]);

  // Toggle between blockchain and mock data
  const toggleDataSource = () => {
    setShowMockData(!showMockData);
    
    if (showMockData) {
      // Switching to blockchain data
      if (chainAgentsData.length > 0) {
        setAgents(chainAgentsData);
        setUsingBlockchainData(true);
        setError(null);
      } else {
        // No blockchain data available
        setError('No blockchain agents found. Try registering an agent first.');
      }
    } else {
      // Switching to mock data
      setAgents(mockAgentsData);
      setUsingBlockchainData(false);
      setError(null);
    }
  };

  const handleUseAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowEndpoint(false); // Starting with endpoint hidden until payment
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
        <div className="flex items-center justify-between pb-8">
          <h2 className="text-2xl font-semibold text-white">Available Agents</h2>
          
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center bg-darkGray/60 backdrop-blur-sm rounded-full border border-gray/30 overflow-hidden cursor-pointer"
              onClick={toggleDataSource}
            >
              <div 
                className={`px-3 py-1.5 text-sm transition-colors ${usingBlockchainData ? 'bg-purple text-white' : 'text-lightGray hover:text-white'}`}
              >
                Blockchain
              </div>
              <div 
                className={`px-3 py-1.5 text-sm transition-colors ${!usingBlockchainData ? 'bg-blue text-white' : 'text-lightGray hover:text-white'}`}
              >
                Mock
              </div>
            </div>
            
            <div className="text-sm text-lightGray bg-darkGray/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray/30">
              Showing all agents
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-amber-900/20 border border-amber-500/30 rounded-md">
            <p className="text-sm text-amber-400">ⓘ {error}</p>
          </div>
        )}
        
        {usingBlockchainData ? (
          <div className="mb-6 p-3 bg-green-900/20 border border-green-500/30 rounded-md text-center">
            <p className="text-sm text-green-400">✓ Showing real agents from the Solana blockchain</p>
          </div>
        ) : (
          <div className="mb-6 p-3 bg-blue-900/20 border border-blue-500/30 rounded-md text-center">
            <p className="text-sm text-blue-400">ⓘ Showing mock agent data for demonstration</p>
          </div>
        )}
      </div>
      
      {agents.length === 0 ? (
        <div className="card-solana p-12 text-center relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-36 h-36 bg-purple/20 rounded-full blur-3xl opacity-50"></div>
          <div className="relative z-10">
            <div className="mb-6 text-blue">
              <SearchIcon className="w-16 h-16 mx-auto opacity-70" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-white">No Agents Found</h3>
            <p className="text-lightGray">
              {usingBlockchainData 
                ? "No AI agents are currently available on the blockchain. Try registering one!" 
                : "No mock AI agents are available for demonstration."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentCard 
              key={agent.id} 
              agent={agent} 
              onUse={handleUseAgent} 
            />
          ))}
        </div>
      )}

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