/**
 * Utility functions for formatting SOL and lamport values
 */

// Constants
export const LAMPORTS_PER_SOL = 1_000_000_000;

/**
 * Convert lamports to SOL
 * @param lamports - Amount in lamports
 * @returns Amount in SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

/**
 * Convert SOL to lamports
 * @param sol - Amount in SOL
 * @returns Amount in lamports
 */
export function solToLamports(sol: number): number {
  return sol * LAMPORTS_PER_SOL;
}

/**
 * Format a SOL amount with appropriate precision
 * @param sol - Amount in SOL
 * @param options - Formatting options
 * @returns Formatted string
 */
export function formatSol(
  sol: number, 
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    includeSymbol?: boolean;
  } = {}
): string {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 4,
    includeSymbol = true
  } = options;

  const formattedValue = new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(sol);

  return includeSymbol ? `${formattedValue} SOL` : formattedValue;
}

/**
 * Format a lamport amount as SOL
 * @param lamports - Amount in lamports
 * @param options - Formatting options
 * @returns Formatted string
 */
export function formatLamportsAsSol(
  lamports: number,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    includeSymbol?: boolean;
  } = {}
): string {
  return formatSol(lamportsToSol(lamports), options);
}

/**
 * Format a SOL amount for display - intelligent formatting
 * based on the amount (smaller amounts show more decimal places)
 * @param sol - Amount in SOL
 * @returns Formatted string
 */
export function formatSolDisplay(sol: number): string {
  // For very small amounts, show more decimals
  if (sol < 0.001) {
    return formatSol(sol, { maximumFractionDigits: 6 });
  }
  
  // For small amounts
  if (sol < 0.01) {
    return formatSol(sol, { maximumFractionDigits: 5 });
  }
  
  // For medium amounts
  if (sol < 1) {
    return formatSol(sol, { maximumFractionDigits: 4 });
  }
  
  // For larger amounts
  return formatSol(sol, { maximumFractionDigits: 2 });
} 