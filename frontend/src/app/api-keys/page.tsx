"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import PageLayout from '@/components/PageLayout';
import { ApiKey, fetchApiKeys, createApiKey, deleteApiKey } from '@/utils/mockApiKeys';
import toast from 'react-hot-toast';

export default function ApiKeysPage() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCopiedId, setShowCopiedId] = useState<string | null>(null);
  
  // API endpoint that users will use
  const apiEndpoint = 'https://api.aiagentmarketplace.com/v1';
  
  // Load API keys on component mount
  useEffect(() => {
    // Redirect if not connected
    if (!connected) {
      router.push('/');
      return;
    }
    
    const loadApiKeys = async () => {
      try {
        setLoading(true);
        const keys = await fetchApiKeys();
        setApiKeys(keys);
      } catch (error) {
        console.error('Error loading API keys:', error);
        toast.error('Failed to load API keys');
      } finally {
        setLoading(false);
      }
    };
    
    loadApiKeys();
  }, [connected, router]);
  
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for your API key');
      return;
    }
    
    try {
      setCreating(true);
      const newKey = await createApiKey(newKeyName);
      setApiKeys([...apiKeys, newKey]);
      setNewKeyName('');
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    } finally {
      setCreating(false);
    }
  };
  
  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }
    
    try {
      const success = await deleteApiKey(id);
      if (success) {
        setApiKeys(apiKeys.filter(key => key.id !== id));
        toast.success('API key deleted successfully');
      } else {
        toast.error('Failed to delete API key');
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };
  
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setShowCopiedId(id);
    setTimeout(() => setShowCopiedId(null), 2000);
  };
  
  if (!connected) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <PageLayout 
      title="API Keys"
      description="Manage your API keys to integrate with the AI Agent Marketplace"
    >
      <div className="container-responsive py-8">
        {/* API Endpoint Info */}
        <div className="mb-10 p-6 bg-darkGray/50 border border-purple/30 rounded-lg">
          <h2 className="text-xl font-bold mb-4">API Endpoint</h2>
          <p className="mb-4 text-lightGray">
            Use the following base URL for all API requests:
          </p>
          <div className="flex items-center">
            <code className="bg-black/50 px-4 py-3 rounded-l-md flex-1 font-mono text-sm overflow-auto">
              {apiEndpoint}
            </code>
            <button
              onClick={() => copyToClipboard(apiEndpoint, 'endpoint')}
              className="bg-purple/80 hover:bg-purple px-4 py-3 rounded-r-md text-white"
            >
              {showCopiedId === 'endpoint' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="mt-4 text-sm text-lightGray">
            Include your API key in the header of each request: <code className="bg-black/50 px-2 py-1 rounded">Authorization: Bearer YOUR_API_KEY</code>
          </p>
          <p className="mt-4 text-sm text-lightGray">
            You must also include the agent endpoint URL in a header for each request: <code className="bg-black/50 px-2 py-1 rounded">URL: AGENT_ENDPOINT_URL</code>
          </p>
          <div className="mt-6 p-4 bg-black/30 rounded-md border border-gray/40">
            <h3 className="text-sm font-semibold text-white mb-2">Example API Request</h3>
            <pre className="overflow-x-auto text-xs text-lightGray font-mono">
{`fetch("${apiEndpoint}/invoke", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY",
    "URL": "https://api.example.com/agent-endpoint"
  },
  body: JSON.stringify({
    input: "Your input for the agent"
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}
            </pre>
          </div>
        </div>
        
        {/* API Keys List */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Your API Keys</h2>
            <form onSubmit={handleCreateKey} className="flex gap-2">
              <input
                type="text"
                placeholder="New key name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="bg-darkGray/50 border border-gray/30 rounded-l-md px-4 py-2 focus:outline-none focus:border-purple/60"
              />
              <button
                type="submit"
                disabled={creating}
                className="bg-purple/80 hover:bg-purple px-4 py-2 rounded-r-md text-white disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Key'}
              </button>
            </form>
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple"></div>
              <p className="mt-2 text-lightGray">Loading your API keys...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-10 border border-gray/20 rounded-lg">
              <p className="text-lightGray">You don't have any API keys yet</p>
              <p className="mt-2 text-sm text-gray-400">Create one to start using the API</p>
            </div>
          ) : (
            <div className="border border-gray/20 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-darkGray/70">
                    <th className="px-6 py-3 text-left text-xs font-medium text-lightGray uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-lightGray uppercase tracking-wider">API Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-lightGray uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-lightGray uppercase tracking-wider">Last Used</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-lightGray uppercase tracking-wider">Usage</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-lightGray uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray/20">
                  {apiKeys.map((apiKey) => (
                    <tr key={apiKey.id} className="hover:bg-darkGray/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {apiKey.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <span className="font-mono">
                            {apiKey.key.substring(0, 10)}...
                          </span>
                          <button
                            onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                            className="ml-2 text-purple hover:text-purple/80"
                          >
                            {showCopiedId === apiKey.id ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-lightGray">
                        {apiKey.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-lightGray">
                        {apiKey.lastUsed ? apiKey.lastUsed.toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-lightGray">
                        {apiKey.usageCount} calls
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleDeleteKey(apiKey.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* API Documentation Link */}
        <div className="p-6 bg-darkGray/50 border border-gray/30 rounded-lg text-center">
          <h2 className="text-lg font-bold mb-2">Need help?</h2>
          <p className="text-lightGray mb-4">Check our API documentation for detailed guides and examples</p>
          <button className="px-6 py-3 bg-blue/80 hover:bg-blue text-white rounded-md transition-colors">
            View API Documentation
          </button>
        </div>
      </div>
    </PageLayout>
  );
} 