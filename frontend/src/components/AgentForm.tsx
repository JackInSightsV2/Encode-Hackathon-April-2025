"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';
import { formatSolDisplay } from '@/utils/solanaFormatters';
import { solToLamports } from '@/utils/solana';
import WalletConnectButton from './WalletConnectButton';
import Tooltip from './Tooltip';

type AgentFormData = {
  name: string;
  description: string;
  endpointUrl: string;
  price: number;
};

export default function AgentForm() {
  const { publicKey, connected } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
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

  const onSubmit = async (data: AgentFormData) => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate price in lamports
      const priceInLamports = solToLamports(data.price);
      
      // For now, we'll just log the data and simulate success
      console.log('Agent registration data:', {
        ...data,
        priceInLamports,
        owner: publicKey.toString(),
      });

      // TODO: Call the Anchor program to register the agent
      // This will be implemented when we set up the Anchor client
      
      // Simulate successful transaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Agent registered successfully!');
      reset();
    } catch (error) {
      console.error('Error registering agent:', error);
      toast.error('Failed to register agent. Please try again.');
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
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 relative ${
                  isSubmitting
                    ? 'btn-solana-disabled'
                    : 'bg-gradient-to-r from-purple to-blue text-white shadow-solana hover:shadow-lg'
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </span>
                ) : (
                  'Register Agent'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 relative z-10">
            <h2 className="text-2xl font-bold mb-6 text-center gradient-text">Agent Preview</h2>
            
            <div className="card-solana p-6 group hover:scale-[1.01] transition-transform duration-300 relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-purple/20 rounded-full blur-xl"></div>
              
              <div className="flex justify-between items-start mb-3 relative z-10">
                <h3 className="text-xl font-semibold text-white">
                  {formValues.name || "Your Agent Name"}
                </h3>
                <span className="bg-blue/20 text-blue px-2 py-0.5 rounded-full text-xs">Your Agent</span>
              </div>
              
              <div className="mb-4 relative z-10">
                <p className="text-lightGray">
                  {formValues.description || "Your agent description will appear here. Make sure to write a clear and compelling description that explains what your agent does and why users would want to use it."}
                </p>
              </div>
              
              <div className="flex justify-between items-center mt-auto relative z-10">
                <div className="flex items-center">
                  <span className="text-sm text-lightGray mr-1">Price:</span>
                  <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple to-blue">
                    {formValues.price ? formatSolDisplay(formValues.price) : "0.1 SOL"}
                  </span>
                </div>
                
                <div className="text-xs text-lightGray">
                  <span>Used: 0 times</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray/30 relative z-10">
                <button
                  className="w-full py-2.5 px-4 rounded-lg font-medium text-sm bg-gradient-to-r from-green to-teal text-black shadow-md"
                >
                  Use Agent
                </button>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                onClick={() => setPreviewMode(false)}
                className="w-full py-3 px-4 btn-solana-secondary"
              >
                Back to Editing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
} 