"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';
import { solToLamports } from '../utils/solana';

type AgentFormData = {
  name: string;
  description: string;
  endpointUrl: string;
  price: number;
};

export default function AgentForm() {
  const { publicKey, connected } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AgentFormData>({
    defaultValues: {
      name: '',
      description: '',
      endpointUrl: '',
      price: 0.1,
    },
  });

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

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Register Your AI Agent</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Agent Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Agent Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            className={`w-full px-3 py-2 border rounded-md ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="e.g., CodeReviewer AI"
            {...register('name', { required: 'Agent name is required' })}
            disabled={isSubmitting || !connected}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={4}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Describe what your AI agent does..."
            {...register('description', {
              required: 'Description is required',
              minLength: {
                value: 20,
                message: 'Description should be at least 20 characters',
              },
            })}
            disabled={isSubmitting || !connected}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>
        
        {/* Endpoint URL */}
        <div>
          <label htmlFor="endpointUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Endpoint URL <span className="text-red-500">*</span>
            <span className="ml-1 text-xs text-gray-500">(users will see this after payment)</span>
          </label>
          <input
            id="endpointUrl"
            type="url"
            className={`w-full px-3 py-2 border rounded-md ${
              errors.endpointUrl ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="https://your-api-endpoint.com/api"
            {...register('endpointUrl', {
              required: 'Endpoint URL is required',
              pattern: {
                value: /^https?:\/\/.+/,
                message: 'Enter a valid URL starting with http:// or https://',
              },
            })}
            disabled={isSubmitting || !connected}
          />
          {errors.endpointUrl && (
            <p className="mt-1 text-xs text-red-500">{errors.endpointUrl.message}</p>
          )}
        </div>
        
        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price (SOL) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="price"
              type="number"
              step="0.01"
              min="0.01"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 pr-16`}
              placeholder="0.1"
              {...register('price', {
                required: 'Price is required',
                min: {
                  value: 0.01,
                  message: 'Price must be at least 0.01 SOL',
                },
                valueAsNumber: true,
              })}
              disabled={isSubmitting || !connected}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500">SOL</span>
            </div>
          </div>
          {errors.price && (
            <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>
          )}
        </div>
        
        {/* Submit Button */}
        <div className="pt-4">
          {!connected ? (
            <div className="text-center text-amber-600 mb-4 p-2 bg-amber-50 rounded-md">
              Please connect your wallet to register an agent
            </div>
          ) : null}
          
          <button
            type="submit"
            className={`w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md 
              ${
                isSubmitting || !connected
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            disabled={isSubmitting || !connected}
          >
            {isSubmitting ? 'Registering...' : 'Register Agent'}
          </button>
        </div>
      </form>
    </div>
  );
} 