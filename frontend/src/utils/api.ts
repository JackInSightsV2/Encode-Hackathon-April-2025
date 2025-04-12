import { API_BASE_URL, ESCROW_API_ENDPOINT } from './constants';

/**
 * API service for escrow-related operations
 */

// Type definitions
export interface AuthResponse {
  session_id: string;
  expires_at: string;
}

export interface BalanceResponse {
  user_id: string;
  balance: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'deposit' | 'spend';
  timestamp: string;
}

export interface WalletDetails {
  user_id: string;
  balance: number;
  transactions: Transaction[];
}

/**
 * Authenticate a user with their wallet address
 * @param walletAddress The user's Solana wallet address
 */
export async function authenticateWallet(walletAddress: string): Promise<AuthResponse> {
  // In a real implementation, this would communicate with the auth backend
  // For now, we'll just use a dummy implementation
  
  console.log(`Authenticating wallet: ${walletAddress}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a dummy session ID based on the wallet address
  return {
    session_id: `session-${walletAddress.substring(0, 8)}`,
    expires_at: new Date(Date.now() + 86400000).toISOString() // 24 hours from now
  };
}

/**
 * Get wallet balance using session ID
 * @param sessionId The authenticated session ID
 */
export async function getWalletBalance(sessionId: string): Promise<BalanceResponse> {
  // In a real implementation, this would call the escrow_api.py endpoint
  console.log(`Getting balance for session: ${sessionId}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Return dummy balance
  return {
    user_id: sessionId.replace('session-', ''),
    balance: 25.75
  };
}

/**
 * Get full wallet details including transaction history
 * @param sessionId The authenticated session ID
 */
export async function getWalletDetails(sessionId: string): Promise<WalletDetails> {
  console.log(`Getting wallet details for session: ${sessionId}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate some dummy transactions
  const now = Date.now();
  const transactions: Transaction[] = [
    { 
      id: '1', 
      amount: 10.0, 
      type: 'deposit', 
      timestamp: new Date(now - 86400000 * 2).toISOString() 
    },
    { 
      id: '2', 
      amount: 15.5, 
      type: 'deposit', 
      timestamp: new Date(now - 86400000).toISOString() 
    },
    { 
      id: '3', 
      amount: 0.25, 
      type: 'spend', 
      timestamp: new Date(now - 3600000).toISOString() 
    },
    { 
      id: '4', 
      amount: 0.5, 
      type: 'spend', 
      timestamp: new Date().toISOString() 
    }
  ];
  
  // Return dummy wallet details
  return {
    user_id: sessionId.replace('session-', ''),
    balance: 25.75,
    transactions
  };
}

/**
 * Deposit funds into the escrow account
 * @param sessionId The authenticated session ID
 * @param amount Amount to deposit
 */
export async function depositFunds(sessionId: string, amount: number): Promise<BalanceResponse> {
  console.log(`Depositing ${amount} for session: ${sessionId}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return updated dummy balance
  return {
    user_id: sessionId.replace('session-', ''),
    balance: 25.75 + amount
  };
} 