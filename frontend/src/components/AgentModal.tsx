"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Agent } from '@/utils/mockAgents';
import { formatSol, lamportsToSol } from '@/utils/solana';
import { invokeAgent, hasUserPaid } from '@/utils/transactions';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import Link from 'next/link';

type AgentModalProps = {
  agent: Agent;
  showEndpoint: boolean;
  onClose: () => void;
};

export default function AgentModal({ agent, showEndpoint: initialShowEndpoint, onClose }: AgentModalProps) {
  const { publicKey, connected, wallet } = useWallet();
  const { connection } = useConnection();
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEndpoint, setShowEndpoint] = useState(initialShowEndpoint);
  const [inputText, setInputText] = useState('');
  const [hasPaid, setHasPaid] = useState(false);
  const [agentResponse, setAgentResponse] = useState<string | null>(null);
  const [isRevealingEndpoint, setIsRevealingEndpoint] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  // Check if the user has already paid for this agent
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (connected && publicKey) {
        try {
          const paid = await hasUserPaid(agent.id, publicKey, connection);
          setHasPaid(paid);
          setShowEndpoint(paid || initialShowEndpoint);
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }
    };

    checkPaymentStatus();
  }, [agent.id, connected, publicKey, connection, initialShowEndpoint]);

  const copyEndpoint = () => {
    navigator.clipboard.writeText(agent.endpointUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Endpoint URL copied to clipboard');
  };

  const triggerConfetti = () => {
    // Trigger confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const simulateAgentResponse = async (input: string) => {
    // Simulate a delay for API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Generate a mock response based on the agent type and input
    let response = '';
    
    if (agent.name.toLowerCase().includes('code')) {
      response = `Code analysis complete. Found 3 potential improvements:\n\n1. Consider adding more error handling\n2. Functions could be optimized for better performance\n3. Some variables could be more descriptively named`;
    } else if (agent.name.toLowerCase().includes('summarize')) {
      response = `Summary of the text:\nThe main points include key information about the subject matter, important considerations for implementation, and potential future directions. The author emphasizes the importance of careful planning and thorough testing.`;
    } else if (agent.name.toLowerCase().includes('image')) {
      response = `Image generated successfully! View it at: https://example.com/generated-image/123456\n\nThe image incorporates all the elements you requested in your prompt.`;
    } else if (agent.name.toLowerCase().includes('translat')) {
      response = `Translation complete!\n\nOriginal: "${input}"\nTranslated: "${input} (translated version)"`;
    } else {
      response = `Thank you for your request. I've processed your input: "${input}" and generated the appropriate response based on your needs.`;
    }
    
    return response;
  };

  const handlePayment = async () => {
    if (!connected || !publicKey || !wallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);

    try {
      // Invoke the agent with payment using real blockchain transaction
      const success = await invokeAgent(
        agent,
        wallet,
        connection,
        inputText || undefined
      );

      if (success) {
        setHasPaid(true);
        
        // If there's input, simulate getting a response from the agent
        if (inputText.trim()) {
          const response = await simulateAgentResponse(inputText);
          setAgentResponse(response);
        }
        
        // Animate the endpoint reveal
        setIsRevealingEndpoint(true);
        setTimeout(() => {
          setShowEndpoint(true);
          triggerConfetti();
        }, 500);
      }
    } catch (error) {
      console.error('Error during payment:', error);
      toast.error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-darkGray rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray/30">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-white">{agent.name}</h3>
            <button
              onClick={onClose}
              className="text-lightGray hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-lightGray mt-4">{agent.description}</p>
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-lightGray">Price:</span>
              <span className="font-semibold text-purple">{formatSol(lamportsToSol(agent.price))} SOL</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-lightGray">Used:</span>
              <span className="text-sm text-white">{agent.totalCalls} times</span>
            </div>
          </div>
          
          {!showEndpoint && !hasPaid && (
            <div className="mt-6">
              <div className="mb-4">
                <label htmlFor="agent-input" className="block text-sm font-medium text-white mb-1">
                  Input (Optional)
                </label>
                <textarea
                  id="agent-input"
                  rows={3}
                  className="w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple"
                  placeholder="Enter any additional input for the agent..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isProcessing}
                ></textarea>
              </div>
              
              <button
                onClick={handlePayment}
                disabled={isProcessing || !connected}
                className={`w-full py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-purple ${
                  isProcessing
                    ? 'bg-gray-700 cursor-not-allowed'
                    : connected
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isProcessing 
                  ? 'Processing Blockchain Transaction...' 
                  : connected 
                  ? `Pay ${formatSol(lamportsToSol(agent.price))} SOL to Use` 
                  : 'Connect Wallet to Pay'}
              </button>
              
              {!connected && (
                <p className="mt-2 text-sm text-amber-500">
                  Please connect your wallet to pay for this agent.
                </p>
              )}
            </div>
          )}
          
          {agentResponse && (
            <div className="mt-6 p-4 bg-gray-800 rounded-md">
              <h4 className="font-medium text-white mb-2">Agent Response</h4>
              <div className="bg-gray-900 p-3 rounded border border-gray-700 text-sm text-lightGray whitespace-pre-line">
                {agentResponse}
              </div>
            </div>
          )}
          
          {(showEndpoint || hasPaid) && (
            <div className={`mt-6 p-4 bg-gray-800 rounded-md transition-all duration-500 ${isRevealingEndpoint ? 'scale-105' : 'scale-100'}`}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-white">Endpoint URL</h4>
                <div className="inline-flex items-center">
                  <span className="bg-green-900 text-green-400 text-xs font-medium px-2.5 py-0.5 rounded mr-2">
                    Unlocked
                  </span>
                  {copied ? (
                    <span className="text-green-400 text-xs">Copied!</span>
                  ) : (
                    <button
                      onClick={copyEndpoint}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-gray-900 p-3 rounded break-all font-mono text-sm text-lightGray">
                {agent.endpointUrl}
              </div>
              <p className="mt-3 text-xs text-gray-400">
                <Link href="/api-keys" className="text-blue-400 hover:text-blue-300 underline">
                  Check your API Keys page for endpoint URL to use this API.
                </Link>
              </p>
              {inputText && !agentResponse && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-white mb-1">Input provided:</h5>
                  <div className="bg-gray-900 p-2 rounded text-xs font-mono break-words text-lightGray">
                    {inputText}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 