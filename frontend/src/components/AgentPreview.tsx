"use client";

import { formatSol } from '@/utils/solana';

type AgentPreviewProps = {
  name: string;
  description: string;
  endpointUrl: string;
  price: number;
  showEndpoint?: boolean;
};

export default function AgentPreview({
  name,
  description,
  endpointUrl,
  price,
  showEndpoint = false,
}: AgentPreviewProps) {
  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{name}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 mr-1">Price:</span>
            <span className="font-semibold text-blue-600">{formatSol(price)} SOL</span>
          </div>
        </div>
        
        {showEndpoint && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-700 mb-1">Endpoint URL:</p>
            <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
              {endpointUrl}
            </p>
          </div>
        )}
        
        {!showEndpoint && (
          <button 
            className="mt-4 w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Use Agent
          </button>
        )}
      </div>
    </div>
  );
} 