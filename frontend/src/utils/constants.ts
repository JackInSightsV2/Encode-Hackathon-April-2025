import { clusterApiUrl } from '@solana/web3.js';

// Solana connection endpoint
export const CONNECTION_ENDPOINT = clusterApiUrl('devnet');

// API endpoints
// Use environment variables with fallbacks for local development
export const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8000';
export const ESCROW_API_URL = process.env.NEXT_PUBLIC_ESCROW_API_URL || 'http://localhost:8001';
export const GATEWAY_API_URL = process.env.NEXT_PUBLIC_GATEWAY_API_URL || 'http://localhost:8002';

// Legacy constants maintained for backward compatibility
export const API_BASE_URL = '/api';
export const ESCROW_API_ENDPOINT = `${API_BASE_URL}/escrow`;
export const LIVE_ESCROW_API_URL = ESCROW_API_URL; 