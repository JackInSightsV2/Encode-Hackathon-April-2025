import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface Agent {
  id: string;
  name: string;
  description: string;
  endpointUrl: string;
  price: number; // in lamports
  owner: string;
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
    id: 'Dd5nNzqryaECX3S8WWYXUaQy9CeXrp4fXpSvSwoWQTRH',
    name: 'Code Reviewer',
    description: 'Reviews Code for API Agents',
    endpointUrl: 'https://api.example.com/codereview',
    price: 0.01 * LAMPORTS_PER_SOL, // 0.01 SOL in lamports
    owner: owners[0],
  },
  {
    id: 'JDHe31aHfjLVemV72W9BKfJ5e722uaMMNGQisRiiSqVC',
    name: 'Programs in Pain',
    description: 'Creates Images of Programmers feeling frustratrated at code.',
    endpointUrl: 'https://api.example.com/pain',
    price: 0.01 * LAMPORTS_PER_SOL, // 0.01 SOL in lamports
    owner: owners[1],
  },
  {
    id: 'GLawTo6WinYMkuKDvbreJ1c8XR1YkusfA1GZ763cGBqH',
    name: 'Jokes API',
    description: 'Used to pull Jokes from the API Endpoint',
    endpointUrl: 'https://api.example.com/jokes',
    price: 0.01 * LAMPORTS_PER_SOL, // 0.01 SOL in lamports
    owner: owners[2],
  },
  {
    id: 'HFGLKrytbuYkaAUozUjyQGUnWCdtNgcPb2HvvcFYFyUB',
    name: 'Agentic AI - Website Builder',
    description: 'With a single prompt; creates a web developer team to make and deploy a website.',
    endpointUrl: 'https://api.example.com/builder',
    price: 0.01 * LAMPORTS_PER_SOL, // 0.01 SOL in lamports
    owner: owners[3],
  }
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