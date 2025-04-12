"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { fetchAgentById, Agent } from '@/utils/mockAgents';
import { formatSol, lamportsToSol, shortenAddress } from '@/utils/solana';
import { invokeAgent, hasUserPaid, fetchAgentsFromChain } from '@/utils/transactions';
import toast from 'react-hot-toast';
import { PublicKey } from '@solana/web3.js';

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { publicKey, connected, signTransaction, wallet } = useWallet();
  const { connection } = useConnection();
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showEndpoint, setShowEndpoint] = useState(false);
  const [copied, setCopied] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  // Get the agent ID from the URL params
  const agentId = Array.isArray(params.id) ? params.id[0] : params.id;

  // First try to fetch from blockchain, fallback to mock data
  useEffect(() => {
    const loadAgent = async () => {
      if (!agentId) {
        toast.error('Invalid agent ID');
        router.push('/agents');
        return;
      }

      try {
        setLoading(true);
        
        // Try to get agents from blockchain first
        const chainAgents = await fetchAgentsFromChain(connection);
        
        let agentData: Agent | null = null;
        
        // If we have blockchain agents, find the one matching our ID
        if (chainAgents && chainAgents.length > 0) {
          const foundAgent = chainAgents.find(a => a.id === agentId);
          if (foundAgent) {
            agentData = foundAgent;
            console.log('Found agent on blockchain:', foundAgent);
          }
        }
        
        // If not found on blockchain, try mock data
        if (!agentData) {
          const mockAgent = await fetchAgentById(agentId);
          if (mockAgent) {
            agentData = mockAgent;
            console.log('Using mock agent data:', mockAgent);
          }
        }
        
        if (agentData) {
          setAgent(agentData);
        } else {
          toast.error('Agent not found');
          router.push('/agents');
        }
      } catch (error) {
        console.error('Error loading agent:', error);
        toast.error('Failed to load agent details');
      } finally {
        setLoading(false);
      }
    };

    loadAgent();
  }, [agentId, router, connection]);

  // Check if user has already paid for this agent
  useEffect(() => {
    if (connected && publicKey && agent) {
      const checkPaymentStatus = async () => {
        try {
          const paid = await hasUserPaid(agent.id, publicKey, connection);
          setHasPaid(paid);
          setShowEndpoint(paid);
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      };
      
      checkPaymentStatus();
    }
  }, [agent, connected, publicKey, connection]);

  // Check if the current user is the owner of this agent
  const isOwner = publicKey && agent?.owner === publicKey.toString();

  const handlePayment = async () => {
    if (!connected || !publicKey || !wallet || !agent) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);

    try {
      // Invoke the agent with payment using real blockchain call
      const success = await invokeAgent(
        agent,
        wallet,
        connection,
        inputText || undefined
      );

      if (success) {
        setHasPaid(true);
        setShowEndpoint(true);
        
        // Display success message with confetti
        toast.success('Payment successful! You now have access to this agent.');
      }
    } catch (error) {
      console.error('Error during payment:', error);
      toast.error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyEndpoint = () => {
    if (!agent) return;
    
    navigator.clipboard.writeText(agent.endpointUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Endpoint URL copied to clipboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
        <div className="max-w-4xl mx-auto py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading agent details...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
        <div className="max-w-4xl mx-auto py-20 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Agent Not Found</h2>
          <p className="text-gray-600 mb-8">The agent you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/agents" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Agents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <Link 
              href="/agents" 
              className="text-blue-600 hover:underline inline-flex items-center mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Agents
            </Link>
            <h1 className="text-3xl font-bold">{agent.name}</h1>
          </div>
          
          {isOwner && (
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
              You own this agent
            </span>
          )}
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600 whitespace-pre-line">{agent.description}</p>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Owner:</span>
                  <span className="font-mono text-sm">{shortenAddress(agent.owner, 6)}</span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Total Calls:</span>
                  <span>{agent.totalCalls}</span>
                </div>
              </div>
            </div>
            
            {(showEndpoint || hasPaid || isOwner) && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold">Endpoint URL</h2>
                  <div className="inline-flex items-center">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">
                      {isOwner ? 'Owner Access' : 'Purchased'}
                    </span>
                    {copied ? (
                      <span className="text-green-600 text-xs">Copied!</span>
                    ) : (
                      <button
                        onClick={copyEndpoint}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-100 p-3 rounded break-all font-mono text-sm mb-4">
                  {agent.endpointUrl}
                </div>
                
                <p className="text-sm text-gray-500 mb-4">
                  You can now use this endpoint to access the AI agent's services.
                </p>
                
                {inputText && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Input provided:</h3>
                    <div className="bg-gray-100 p-3 rounded text-sm font-mono break-words">
                      {inputText}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-semibold">Price</span>
                <span className="text-xl font-bold text-blue-600">{formatSol(lamportsToSol(agent.price))} SOL</span>
              </div>
              
              {!hasPaid && !isOwner && (
                <>
                  <div className="mb-4">
                    <label htmlFor="agent-input" className="block text-sm font-medium text-gray-700 mb-1">
                      Input (Optional)
                    </label>
                    <textarea
                      id="agent-input"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter any additional input for the agent..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      disabled={isProcessing}
                    ></textarea>
                  </div>
                  
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing || !connected}
                    className={`w-full py-3 px-4 rounded-md font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isProcessing
                        ? 'bg-gray-300 cursor-not-allowed'
                        : connected
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : !connected ? 'Connect Wallet to Pay' : `Pay ${formatSol(lamportsToSol(agent.price))} SOL`}
                  </button>
                  
                  {!connected && (
                    <p className="mt-2 text-sm text-amber-600 text-center">
                      Please connect your wallet to pay for this agent.
                    </p>
                  )}
                </>
              )}
              
              {(hasPaid || isOwner) && (
                <div className="text-center">
                  <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md">
                    {isOwner ? 'You own this agent' : 'You have purchased this agent'}
                  </div>
                  <p className="text-sm text-gray-600">
                    You can use the endpoint URL shown on the left to access this agent's services.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 