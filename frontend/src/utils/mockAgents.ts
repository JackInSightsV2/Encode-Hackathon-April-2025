import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface Agent {
  id: string;
  name: string;
  description: string;
  endpointUrl: string;
  price: number; // in lamports
  owner: string;
  totalCalls: number;
}

// Mock owner addresses
const owners = [
  'FVMnDAAqsKLQSPPrGa37zJjgzuwxSQW8PVENJBD7JvgH',
  '9KPCSLuZmngkBnAoVnzYaLzEqGKKnMCwTy6MhWsKmjbN',
  '3zLYxS5dndPPh1DUV9eK7xPuP4uXQbVQnWQVMyV28mW2',
  '4oHCCQGKvmxjjhLCv1P9DNKHhYKvFRJmcY8D3oBK2GBe',
];

// Generate mock agent data
export const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'CodeReviewer AI',
    description: 'An AI agent that reviews your code and provides feedback on best practices, potential bugs, and performance improvements.',
    endpointUrl: 'https://api.example.com/codereview',
    price: 0.05 * LAMPORTS_PER_SOL, // 0.05 SOL in lamports
    owner: owners[0],
    totalCalls: 42,
  },
  {
    id: '2',
    name: 'Text Summarizer',
    description: 'Summarizes long articles, papers, or documents into concise summaries while preserving the key information.',
    endpointUrl: 'https://api.example.com/summarize',
    price: 0.02 * LAMPORTS_PER_SOL, // 0.02 SOL in lamports
    owner: owners[1],
    totalCalls: 127,
  },
  {
    id: '3',
    name: 'Image Generator',
    description: 'Creates unique images based on text descriptions. Perfect for designers, content creators, and artists.',
    endpointUrl: 'https://api.example.com/generate-image',
    price: 0.1 * LAMPORTS_PER_SOL, // 0.1 SOL in lamports
    owner: owners[2],
    totalCalls: 89,
  },
  {
    id: '4',
    name: 'Language Translator',
    description: 'Translates text between over 50 languages with high accuracy and preservation of context.',
    endpointUrl: 'https://api.example.com/translate',
    price: 0.03 * LAMPORTS_PER_SOL, // 0.03 SOL in lamports
    owner: owners[3],
    totalCalls: 205,
  },
  {
    id: '5',
    name: 'Data Analyzer',
    description: 'Analyzes datasets to identify patterns, trends, and insights. Great for businesses and researchers.',
    endpointUrl: 'https://api.example.com/analyze-data',
    price: 0.08 * LAMPORTS_PER_SOL, // 0.08 SOL in lamports
    owner: owners[0],
    totalCalls: 63,
  },
  {
    id: '6',
    name: 'Content Writer',
    description: 'Generates high-quality, engaging content for blogs, articles, and marketing materials on any topic.',
    endpointUrl: 'https://api.example.com/write-content',
    price: 0.04 * LAMPORTS_PER_SOL, // 0.04 SOL in lamports
    owner: owners[1],
    totalCalls: 158,
  },
];

/**
 * Simulates fetching agents from the blockchain
 * This would be replaced with actual Solana program calls later
 */
export async function fetchAgents(): Promise<Agent[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockAgents;
}

/**
 * Simulates fetching an agent by ID
 */
export async function fetchAgentById(id: string): Promise<Agent | undefined> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockAgents.find(agent => agent.id === id);
}

/**
 * Simulates fetching agents owned by a specific wallet address
 */
export async function fetchAgentsByOwner(ownerAddress: string): Promise<Agent[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockAgents.filter(agent => agent.owner === ownerAddress);
} 