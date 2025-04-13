import { ApiKey } from './mockApiKeys';
import { AUTH_API_URL } from './constants';

// Use the centralized API URL from constants
const API_URL = AUTH_API_URL;

interface ApiKeyResponse {
  name: string;
  key: string;
  created_at: string;
  last_used: string | null;
  use_count: number;
}

// Authenticate user with wallet address
export async function authenticateWallet(walletAddress: string): Promise<string> {
  try {
    console.log(`Authenticating wallet at ${API_URL}/auth`);
    
    const response = await fetch(`${API_URL}/auth`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: walletAddress
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to authenticate: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.session_id;
  } catch (error) {
    console.error('Error authenticating wallet:', error);
    throw error;
  }
}

export async function fetchRealApiKeys(walletAddress: string): Promise<ApiKey[]> {
  try {
    // First authenticate the wallet
    await authenticateWallet(walletAddress);
    
    console.log(`Connecting to auth server at ${API_URL}/apikeys/${walletAddress}`);
    
    const response = await fetch(`${API_URL}/apikeys/${walletAddress}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch API keys: ${response.statusText}`);
    }
    
    const data: ApiKeyResponse[] = await response.json();
    return data.map(key => ({
      id: key.key, // Using the key as the id
      name: key.name,
      key: key.key,
      createdAt: new Date(key.created_at),
      lastUsed: key.last_used ? new Date(key.last_used) : null,
      usageCount: key.use_count
    }));
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error connecting to auth server:', error);
      throw new Error(`Cannot connect to auth server at ${API_URL}. Make sure the server is running.`);
    }
    console.error('Error fetching API keys:', error);
    throw error;
  }
}

export async function createRealApiKey(walletAddress: string, name: string): Promise<ApiKey> {
  try {
    // First authenticate the wallet
    await authenticateWallet(walletAddress);
    
    const response = await fetch(`${API_URL}/apikeys/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: walletAddress,
        name: name
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create API key: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      id: data.key,
      name: name,
      key: data.key,
      createdAt: new Date(),
      lastUsed: null,
      usageCount: 0
    };
  } catch (error) {
    console.error('Error creating API key:', error);
    throw error;
  }
}

export async function deleteRealApiKey(walletAddress: string, key: string): Promise<boolean> {
  try {
    // First authenticate the wallet
    await authenticateWallet(walletAddress);
    
    const response = await fetch(`${API_URL}/apikeys/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: walletAddress,
        key: key
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete API key: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting API key:', error);
    throw error;
  }
} 