import { API_BASE_URL, ESCROW_API_ENDPOINT, ESCROW_API_URL } from './constants';

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
  user_id?: string;
  amount: number;
  type: 'deposit' | 'spent';
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
    session_id: walletAddress, // Use wallet address as session ID for simplicity
    expires_at: new Date(Date.now() + 86400000).toISOString() // 24 hours from now
  };
}

/**
 * Get wallet balance using session ID
 * @param sessionId The authenticated session ID
 * @param useMockData Whether to use mock data or live API
 */
export async function getWalletBalance(
  sessionId: string, 
  useMockData: boolean = false
): Promise<BalanceResponse> {
  if (useMockData) {
    // Return mock data
    console.log(`Getting mock balance for session: ${sessionId}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return dummy balance
    return {
      user_id: sessionId,
      balance: 25.75
    };
  } else {
    // Call live API
    console.log(`Getting live balance for wallet: ${sessionId}`);
    
    try {
      const response = await fetch(`${ESCROW_API_URL}/balance/${sessionId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        cache: 'no-cache',
      });
      
      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText);
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }
}

/**
 * Get full wallet details including transaction history
 * @param sessionId The authenticated session ID
 * @param useMockData Whether to use mock data or live API
 */
export async function getWalletDetails(
  sessionId: string,
  useMockData: boolean = false
): Promise<WalletDetails> {
  if (useMockData) {
    console.log(`Getting mock wallet details for session: ${sessionId}`);
    
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
        type: 'spent', 
        timestamp: new Date(now - 3600000).toISOString() 
      },
      { 
        id: '4', 
        amount: 0.5, 
        type: 'spent', 
        timestamp: new Date().toISOString() 
      }
    ];
    
    // Return dummy wallet details
    return {
      user_id: sessionId,
      balance: 25.75,
      transactions
    };
  } else {
    // Call live API
    console.log(`Getting live wallet details for wallet: ${sessionId}`);
    
    try {
      const url = `${ESCROW_API_URL}/wallet/${sessionId}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        cache: 'no-cache',
      });
      
      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching wallet details:', error);
      // Fall back to mock data on error if needed
      if (!useMockData) {
        console.log('Falling back to mock data due to API error');
        return getWalletDetails(sessionId, true);
      }
      throw error;
    }
  }
}

/**
 * Deposit funds into the escrow account
 * @param sessionId The authenticated session ID
 * @param amount Amount to deposit
 * @param useMockData Whether to use mock data or live API
 */
export async function depositFunds(
  sessionId: string, 
  amount: number,
  useMockData: boolean = false
): Promise<BalanceResponse> {
  if (useMockData) {
    console.log(`Depositing mock ${amount} for session: ${sessionId}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return updated dummy balance
    return {
      user_id: sessionId,
      balance: 25.75 + amount
    };
  } else {
    // Call live API
    console.log(`Depositing live ${amount} for wallet: ${sessionId}`);
    
    try {
      const url = `${ESCROW_API_URL}/deposit`;
      console.log('POSTing to URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-User-ID': sessionId
        },
        mode: 'cors',
        cache: 'no-cache',
        body: JSON.stringify({ amount })
      });
      
      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      return data;
    } catch (error) {
      console.error('Error depositing funds:', error);
      // Fall back to mock data on error if needed
      if (!useMockData) {
        console.log('Falling back to mock data due to API error');
        return depositFunds(sessionId, amount, true);
      }
      throw error;
    }
  }
} 