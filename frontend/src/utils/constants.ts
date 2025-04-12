import { clusterApiUrl } from '@solana/web3.js';

// Solana connection endpoint
export const CONNECTION_ENDPOINT = clusterApiUrl('devnet');

// API endpoints
export const API_BASE_URL = '/api';  // This would be replaced with actual backend URL in production
export const ESCROW_API_ENDPOINT = `${API_BASE_URL}/escrow`; 