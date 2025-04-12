import { LAMPORTS_PER_SOL } from '@solana/web3.js';

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
  return sol * LAMPORTS_PER_SOL;
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

/**
 * Format SOL with appropriate decimals
 */
export function formatSol(sol: number): string {
  return sol.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 9,
  });
}

/**
 * Format lamports as SOL with appropriate decimals
 */
export function formatLamportsAsSol(lamports: number): string {
  return formatSol(lamportsToSol(lamports));
}

/**
 * Shorten a Solana address for display
 */
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
} 