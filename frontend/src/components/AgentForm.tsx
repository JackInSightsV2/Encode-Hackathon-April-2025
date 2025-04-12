"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';
import { formatSolDisplay } from '@/utils/solanaFormatters';
import { solToLamports } from '@/utils/solana';
import { registerAgentOnChain } from '@/utils/transactions';
import { PROGRAM_ID } from '@/utils/programIDL';
import WalletConnectButton from './WalletConnectButton';
import Tooltip from './Tooltip';

type AgentFormData = {
  name: string;
  description: string;
  endpointUrl: string;
  price: number;
};

export default function AgentForm() {
  const { publicKey, connected, wallet, connecting } = useWallet();
  const { connection } = useConnection();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<AgentFormData>({
    defaultValues: {
      name: '',
      description: '',
      endpointUrl: '',
      price: 0.1,
    },
    mode: 'onChange'
  });

  // Watch form values for the preview
  const formValues = watch();

  // Check wallet status on component mount
  useEffect(() => {
    if (connecting) {
      console.log("Wallet is connecting...");
    } else if (connected) {
      console.log("Wallet connected:", publicKey?.toString());
    } else {
      console.log("Wallet not connected");
    }
  }, [connecting, connected, publicKey]);

  const onSubmit = async (data: AgentFormData) => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!publicKey) {
      toast.error('Public key not available. Please reconnect your wallet.');
      return;
    }

    if (!wallet) {
      toast.error('Wallet adapter not found. Please reconnect your wallet.');
      return;
    }

    // Verify the wallet has required signing methods
    if (!wallet.adapter?.signTransaction || typeof wallet.adapter?.signTransaction !== 'function') {
      toast.error('Wallet cannot sign transactions. Please use a compatible wallet.');
      console.error('Wallet missing signing methods:', wallet.adapter);
      return;
    }

    // Log wallet status for debugging
    console.log('Wallet connection status:', {
      connected,
      wallet: wallet.adapter?.name,
      publicKey: publicKey.toString(),
      hasSignTransaction: !!wallet.adapter?.signTransaction,
    });

    setIsSubmitting(true);
    setDebugInfo(null);

    try {
      // Log the data for debugging
      console.log('Agent registration data:', {
        ...data,
        owner: publicKey.toString(),
      });

      setDebugInfo(`Attempting to register agent with: 
        Name: ${data.name}
        Description: ${data.description}
        Endpoint: ${data.endpointUrl}
        Price: ${data.price} SOL
        Wallet: ${publicKey.toString().slice(0, 8)}...
        Program ID: ${PROGRAM_ID.toString()}
        Network: Solana Devnet
      `);

      // Call the Anchor program to register the agent
      const agentPublicKey = await registerAgentOnChain(
        data.name,
        data.description,
        data.endpointUrl,
        data.price,
        wallet,
        connection
      );
      
      if (agentPublicKey) {
        setTxSignature(agentPublicKey);
        toast.success('Agent registered successfully!');
        reset();
      } else {
        toast.error('Failed to register agent. Please check your wallet connection and try again.');
        setDebugInfo(prevDebug => prevDebug + '\n\nFailed to register agent - null result returned from transaction.');
      }
    } catch (error) {
      console.error('Error registering agent:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to register agent: ';
      
      if (error instanceof Error) {
        errorMessage += error.message;
        
        // Check for specific error types
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds in your wallet to cover transaction fees.';
        } else if (error.message.includes('User rejected')) {
          errorMessage = 'Transaction was rejected in wallet.';
        } else if (error.message.includes('Signature verification failed')) {
          errorMessage = 'Signature verification failed. Your wallet may be locked.';
        } else if (error.message.includes('wallet adapter not found')) {
          errorMessage = 'Wallet adapter not found. Try refreshing the page and reconnecting.';
        } else if (error.message.includes('not connected')) {
          errorMessage = 'Wallet disconnected. Please reconnect your wallet and try again.';
        }
      } else {
        errorMessage += 'Unknown error occurred';
      }
      
      setDebugInfo(`Error details: ${error instanceof Error ? error.message : String(error)}`);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle preview mode
  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {!connected ? (
        <div className="card-solana p-8 mb-8 text-center">
          <h3 className="text-xl font-medium mb-4 text-white">Connect Your Wallet</h3>
          <p className="text-lightGray mb-6">You need to connect your Solana wallet to register an AI agent</p>
          <div className="flex justify-center">
            <WalletConnectButton />
          </div>
        </div>
      ) : null}
      
      <div className="card-solana overflow-hidden relative">
        {/* Glow effects */}
        <div className="absolute -top-20 -left-20 w-36 h-36 bg-purple/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-20 -right-20 w-36 h-36 bg-blue/20 rounded-full blur-3xl opacity-50"></div>
      
        {/* Tabs */}
        <div className="flex border-b border-gray/30">
          <button
            onClick={() => setPreviewMode(false)}
            className={`flex-1 py-3 text-center transition-colors ${
              !previewMode ? 'text-purple border-b-2 border-purple' : 'text-lightGray hover:text-white'
            }`}
          >
            Create
          </button>
          <button
            onClick={() => setPreviewMode(true)}
            disabled={!isValid}
            className={`flex-1 py-3 text-center transition-colors ${
              previewMode ? 'text-purple border-b-2 border-purple' : `${isValid ? 'text-lightGray hover:text-white' : 'text-gray/40 cursor-not-allowed'}`
            }`}
          >
            Preview
          </button>
        </div>
      
        {!previewMode ? (
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 relative z-10">
            <h2 className="text-2xl font-bold mb-6 text-center gradient-text">Register Your AI Agent</h2>

            {/* Wallet Status */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm">
                <span className="text-lightGray mr-2">Wallet:</span>
                {connected ? (
                  <span className="text-green-400">Connected ✓</span>
                ) : connecting ? (
                  <span className="text-amber-400">Connecting...</span>
                ) : (
                  <span className="text-red-400">Not Connected ✗</span>
                )}
              </div>
              {connected && publicKey && (
                <div className="text-xs text-lightGray">
                  {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-6)}
                </div>
              )}
            </div>
            
            {/* Agent Name */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="name" className="block text-sm font-medium text-white">
                  Agent Name <span className="text-red">*</span>
                </label>
                <span className="text-xs text-lightGray">Max 50 characters</span>
              </div>
              <input
                id="name"
                type="text"
                className={`input-solana w-full ${
                  errors.name ? 'border-red' : ''
                }`}
                placeholder="e.g., CodeReviewer AI"
                maxLength={50}
                {...register('name', { required: 'Agent name is required' })}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red">{errors.name.message}</p>
              )}
            </div>
            
            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="description" className="block text-sm font-medium text-white">
                  Description <span className="text-red">*</span>
                </label>
                <span className="text-xs text-lightGray">Min 20 characters</span>
              </div>
              <textarea
                id="description"
                rows={4}
                className={`input-solana w-full ${
                  errors.description ? 'border-red' : ''
                }`}
                placeholder="Describe what your AI agent does..."
                {...register('description', {
                  required: 'Description is required',
                  minLength: {
                    value: 20,
                    message: 'Description should be at least 20 characters',
                  },
                })}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red">{errors.description.message}</p>
              )}
            </div>
            
            {/* Endpoint URL */}
            <div>
              <div className="flex items-center mb-1">
                <label htmlFor="endpointUrl" className="block text-sm font-medium text-white">
                  Endpoint URL <span className="text-red">*</span>
                </label>
                <Tooltip text="Users will only see this after payment" position="right">
                  <span className="ml-1 cursor-help text-lightGray">
                    <InfoIcon className="w-4 h-4 inline" />
                  </span>
                </Tooltip>
              </div>
              <input
                id="endpointUrl"
                type="url"
                className={`input-solana w-full ${
                  errors.endpointUrl ? 'border-red' : ''
                }`}
                placeholder="https://your-api-endpoint.com/api"
                {...register('endpointUrl', {
                  required: 'Endpoint URL is required',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Enter a valid URL starting with http:// or https://',
                  },
                })}
                disabled={isSubmitting}
              />
              {errors.endpointUrl && (
                <p className="mt-1 text-xs text-red">{errors.endpointUrl.message}</p>
              )}
            </div>
            
            {/* Price */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="price" className="block text-sm font-medium text-white">
                  Price (SOL) <span className="text-red">*</span>
                </label>
                <span className="text-xs text-lightGray">Min 0.01 SOL</span>
              </div>
              <div className="relative">
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`input-solana w-full pr-16 ${
                    errors.price ? 'border-red' : ''
                  }`}
                  placeholder="0.1"
                  {...register('price', {
                    required: 'Price is required',
                    min: {
                      value: 0.01,
                      message: 'Price must be at least 0.01 SOL',
                    },
                    valueAsNumber: true,
                  })}
                  disabled={isSubmitting}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-purple">SOL</span>
                </div>
              </div>
              {errors.price && (
                <p className="mt-1 text-xs text-red">{errors.price.message}</p>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !connected || !isValid}
                className={`w-full py-3 rounded-lg bg-gradient-to-r from-purple to-blue hover:from-purple-dark hover:to-blue-dark text-white font-medium transition-all ${
                  (isSubmitting || !connected || !isValid) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                    Registering...
                  </span>
                ) : !connected ? (
                  'Connect Wallet to Register'
                ) : (
                  'Register Agent'
                )}
              </button>
            </div>

            {/* Debug Information */}
            {debugInfo && (
              <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
                <h4 className="text-xs font-mono text-gray-400 mb-1">Debug Info:</h4>
                <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">{debugInfo}</pre>
              </div>
            )}
          </form>
        ) : (
          <div className="p-8 space-y-6 relative z-10">
            <h2 className="text-2xl font-bold mb-6 text-center">Agent Preview</h2>
            
            <div className="bg-darkGray border border-gray/60 rounded-xl overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white">{formValues.name || 'Agent Name'}</h3>
                  <div className="px-2 py-1 bg-purple/20 rounded text-xs text-purple">Preview</div>
                </div>
                
                <div className="mb-6">
                  <p className="text-lightGray">
                    {formValues.description || 'Your agent description will appear here...'}
                  </p>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-lightGray mr-1">Price:</span>
                    <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple to-blue">
                      {formValues.price ? formValues.price.toFixed(2) : '0.00'} SOL
                    </span>
                  </div>
                  
                  <div className="text-xs text-lightGray">
                    Used: 0 times
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray/30 p-4">
                <button
                  disabled
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium opacity-50 cursor-not-allowed"
                >
                  Preview Only
                </button>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={togglePreview}
                className="text-purple hover:text-white transition-colors"
              >
                Back to Edit
              </button>
            </div>
          </div>
        )}
      </div>
      
      {txSignature && (
        <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-md">
          <h3 className="text-lg font-medium text-green-400 mb-2">Agent Registered Successfully!</h3>
          <p className="text-sm text-lightGray mb-2">
            Your agent has been registered on the Solana blockchain.
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-white">Agent ID:</span>
            <code className="bg-darkGray p-1 rounded text-xs">{txSignature}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(txSignature);
                toast.success('Agent ID copied to clipboard');
              }}
              className="p-1 text-purple hover:text-white"
            >
              <CopyIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CopyIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
} 