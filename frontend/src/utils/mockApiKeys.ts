// Types for API keys
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed: Date | null;
  usageCount: number;
}

// Initialize mock data for API keys
let mockApiKeys: ApiKey[] = [];

// Try to load from localStorage on initialization
if (typeof window !== 'undefined') {
  try {
    const storedKeys = localStorage.getItem('apiKeys');
    if (storedKeys) {
      // Parse and convert string dates back to Date objects
      mockApiKeys = JSON.parse(storedKeys, (key, value) => {
        if (key === 'createdAt' || key === 'lastUsed') {
          return value ? new Date(value) : null;
        }
        return value;
      });
    } else {
      // Initialize with default data if nothing in localStorage
      mockApiKeys = [
        {
          id: '1',
          name: 'Development',
          key: 'sk_test_51abcdefghijklmnopqrstuvwxyz',
          createdAt: new Date('2023-10-15'),
          lastUsed: new Date('2023-11-20'),
          usageCount: 127
        },
        {
          id: '2',
          name: 'Production',
          key: 'sk_live_51abcdefghijklmnopqrstuvwxyz',
          createdAt: new Date('2023-11-01'),
          lastUsed: new Date('2023-11-25'),
          usageCount: 384
        },
        {
          id: '3',
          name: 'Testing',
          key: 'sk_test_51uvwxyzabcdefghijklmnopqrst',
          createdAt: new Date('2023-09-05'),
          lastUsed: null,
          usageCount: 0
        }
      ];
      // Store initial data in localStorage
      saveToLocalStorage();
    }
  } catch (error) {
    console.error('Error loading API keys from localStorage:', error);
  }
}

// Helper function to save to localStorage
function saveToLocalStorage() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('apiKeys', JSON.stringify(mockApiKeys));
  }
}

/**
 * Simulates fetching API keys for a user
 * This would be replaced with actual backend API calls
 */
export async function fetchApiKeys(): Promise<ApiKey[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockApiKeys;
}

/**
 * Simulates creating a new API key
 */
export async function createApiKey(name: string): Promise<ApiKey> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate random key
  const randomKey = 'sk_' + (Math.random() + 1).toString(36).substring(2, 15) + (Math.random() + 1).toString(36).substring(2, 15);
  
  const newKey: ApiKey = {
    id: (mockApiKeys.length + 1).toString(),
    name,
    key: randomKey,
    createdAt: new Date(),
    lastUsed: null,
    usageCount: 0
  };
  
  mockApiKeys.push(newKey);
  saveToLocalStorage();
  return newKey;
}

/**
 * Simulates deleting an API key
 */
export async function deleteApiKey(id: string): Promise<boolean> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockApiKeys.findIndex(key => key.id === id);
  if (index !== -1) {
    mockApiKeys.splice(index, 1);
    saveToLocalStorage();
    return true;
  }
  return false;
} 