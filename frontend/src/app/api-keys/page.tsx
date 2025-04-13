"use client";

import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import PageLayout from '@/components/PageLayout';
import { ApiKey, fetchApiKeys, createApiKey, deleteApiKey } from '@/utils/mockApiKeys';
import { fetchRealApiKeys, createRealApiKey, deleteRealApiKey } from '@/utils/apiKeyService';
import toast from 'react-hot-toast';
import { Switch } from '@headlessui/react';
import { Dialog, Transition } from '@headlessui/react';

export default function ApiKeysPage() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCopiedId, setShowCopiedId] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');
  
  // API endpoint that users will use
  const apiEndpoint = 'https://api.aiagentmarketplace.com/v1';
  
  // Check API status on component mount
  useEffect(() => {
    // Only check API status if wallet is connected
    if (!connected || !publicKey) {
      return;
    }
    
    // Import API URL from apiKeyService
    const API_URL = 'http://localhost:8000';
    
    const checkApiStatus = async () => {
      try {
        // First try a simple health check to see if the server is responding at all
        try {
          const response = await fetch(`${API_URL}/`, {
            method: 'GET',
            mode: 'no-cors',  // This will allow the request to proceed even with CORS issues
            headers: { 
              'Accept': 'application/json'
            }
          });
          
          // With no-cors, we can't actually read the response, but if we get here without an exception
          // it means the server is probably running
          console.log('Auth service is reachable. CORS may still be blocking.');
          
          // Try authenticating through the proper service
          import('../../utils/apiKeyService').then(async (apiKeyService) => {
            try {
              await apiKeyService.authenticateWallet(publicKey.toString());
              // If we get here, authentication succeeded
              setApiStatus('online');
              console.log('Auth API is fully functional');
            } catch (authError: any) {
              console.error('Auth API responded but authentication failed:', authError);
              // Even though authentication failed, the server is online
              // This could be due to a real auth failure or CORS
              if (authError.message && authError.message.includes('CORS')) {
                console.warn('CORS policy is preventing proper communication');
              }
              setApiStatus('offline');
              if (!useMockData) {
                toast.error('Auth API is unreachable due to CORS or server error. Using mock data.');
                setUseMockData(true);
              }
            }
          });
        } catch (error) {
          console.error('Failed to reach auth service:', error);
          setApiStatus('offline');
          if (!useMockData) {
            toast.error('Auth service unreachable. Using mock data instead.');
            setUseMockData(true);
          }
        }
      } catch (error) {
        console.error('Error in API status check:', error);
        setApiStatus('offline');
        if (!useMockData) {
          toast.error('API check failed. Using mock data.');
          setUseMockData(true);
        }
      }
    };
    
    checkApiStatus();
  }, [connected, publicKey, useMockData]);
  
  // Define loadApiKeys function
  const loadApiKeys = async () => {
    try {
      setLoading(true);
      let keys: ApiKey[];
      
      if (useMockData) {
        keys = await fetchApiKeys();
      } else {
        // If the API is known to be offline, prevent attempting to use live data
        if (apiStatus === 'offline') {
          toast.error('Live API is unavailable. Using mock data instead.');
          setUseMockData(true);
          keys = await fetchApiKeys();
          setLoading(false);
          return;
        }
        
        if (!publicKey) {
          toast.error('Wallet not connected');
          setLoading(false);
          return;
        }
        
        try {
          keys = await fetchRealApiKeys(publicKey.toString());
          // If we successfully get keys, ensure API status is set to online
          setApiStatus('online');
        } catch (error) {
          console.error('Error fetching real API keys:', error);
          
          // If this was our first attempt to use live data, let's check the API status again
          if (apiStatus === 'unknown' || apiStatus === 'online') {
            setApiStatus('offline');
            toast.error('Connection error with auth server. Switching to mock data.');
            setUseMockData(true);
            // Get mock data instead
            keys = await fetchApiKeys();
          } else {
            // If the API was already marked as offline, don't show another error
            keys = await fetchApiKeys();
          }
        }
      }
      
      setApiKeys(keys);
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };
  
  // Load API keys on component mount or when toggle changes
  useEffect(() => {
    // Redirect if not connected
    if (!connected) {
      router.push('/');
      return;
    }
    
    loadApiKeys();
  }, [connected, router, useMockData, publicKey]);
  
  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for your API key');
      return;
    }
    
    try {
      setCreating(true);
      let newKey: ApiKey;
      
      if (useMockData) {
        newKey = await createApiKey(newKeyName);
      } else {
        if (!publicKey) {
          toast.error('Wallet not connected');
          return;
        }
        newKey = await createRealApiKey(publicKey.toString(), newKeyName);
      }
      
      setApiKeys([...apiKeys, newKey]);
      setNewKeyName('');
      toast.success('API key created successfully');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    } finally {
      setCreating(false);
    }
  };
  
  const handleDeleteKey = async (id: string, key: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }
    
    try {
      let success: boolean;
      
      if (useMockData) {
        success = await deleteApiKey(id);
      } else {
        if (!publicKey) {
          toast.error('Wallet not connected');
          return;
        }
        success = await deleteRealApiKey(publicKey.toString(), key);
      }
      
      if (success) {
        setApiKeys(apiKeys.filter(apiKey => apiKey.id !== id));
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
        {/* Data Source Toggle and API Status */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center">
            {apiStatus === 'online' && (
              <span className="flex items-center text-sm text-green-400">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Live API is available
              </span>
            )}
            {apiStatus === 'offline' && (
              <div className="flex items-center">
                <span className="flex items-center text-sm text-yellow-400">
                  <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                  Live API is unavailable
                </span>
                <button
                  onClick={() => {
                    setApiStatus('unknown');
                    
                    // Import API URL from apiKeyService
                    const API_URL = 'http://localhost:8000';
                    
                    const checkApiStatus = async () => {
                      try {
                        // First try a simple health check
                        const response = await fetch(`${API_URL}/`, {
                          method: 'GET',
                          mode: 'no-cors',
                          headers: { 
                            'Accept': 'application/json'
                          }
                        });
                        
                        // Try authenticating through the proper service
                        import('../../utils/apiKeyService').then(async (apiKeyService) => {
                          try {
                            await apiKeyService.authenticateWallet(publicKey?.toString() || 'test');
                            // If we get here, authentication succeeded
                            setApiStatus('online');
                            toast.success('Live API is now available');
                          } catch (error: any) {
                            console.error('Auth API responded but authentication failed:', error);
                            setApiStatus('offline');
                            toast.error('Live API is still unavailable (CORS or server error)');
                          }
                        });
                      } catch (error) {
                        console.error('Error checking API status:', error);
                        setApiStatus('offline');
                        toast.error('Live API is still unavailable');
                      }
                    };
                    
                    checkApiStatus();
                  }}
                  className="ml-3 text-xs text-yellow-400 hover:text-yellow-300 underline"
                >
                  Refresh
                </button>
              </div>
            )}
            {apiStatus === 'unknown' && (
              <span className="flex items-center text-sm text-gray-400">
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                Checking API status...
              </span>
            )}
          </div>
          <div className="flex items-center">
            <span className={`mr-3 text-sm font-medium ${!useMockData ? 'text-white' : 'text-gray-400'}`}>Live Data</span>
            <Switch
              checked={useMockData}
              onChange={() => {
                // Allow switching to mock data always
                // Only allow switching to live data if API is not offline
                if (useMockData || apiStatus !== 'offline') {
                  setUseMockData(!useMockData);
                } else {
                  toast.error('Live API is unavailable. Cannot switch to live data.');
                }
              }}
              className={`${
                useMockData ? 'bg-purple' : 'bg-gray/30'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple/30 ${apiStatus === 'offline' && !useMockData ? 'opacity-50' : ''}`}
            >
              <span
                className={`${
                  useMockData ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
            <span className={`ml-3 text-sm font-medium ${useMockData ? 'text-white' : 'text-gray-400'}`}>Mock Data</span>
          </div>
        </div>
        
        {/* API Endpoint Info */}
        <div className="mb-10 p-6 bg-darkGray/50 border border-purple/30 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-white">API Endpoint</h2>
          <p className="mb-4 text-gray-300">
            Use the following base URL for all API requests:
          </p>
          <div className="flex items-center">
            <code className="bg-black/50 px-4 py-3 rounded-l-md flex-1 font-mono text-sm overflow-auto text-gray-200">
              {apiEndpoint}
            </code>
            <button
              onClick={() => copyToClipboard(apiEndpoint, 'endpoint')}
              className="bg-purple/80 hover:bg-purple px-4 py-3 rounded-r-md text-white"
            >
              {showCopiedId === 'endpoint' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-300">
            Include your API key in the header of each request: <code className="bg-black/50 px-2 py-1 rounded text-gray-200">Authorization: Bearer YOUR_API_KEY</code>
          </p>
          <p className="mt-4 text-sm text-gray-300">
            You must also include the agent endpoint URL in a header for each request: <code className="bg-black/50 px-2 py-1 rounded text-gray-200">URL: AGENT_ENDPOINT_URL</code>
          </p>
          <div className="mt-6 p-4 bg-black/40 rounded-md border border-gray/40">
            <h3 className="text-sm font-semibold text-white mb-2">Example API Request</h3>
            <pre 
              className="overflow-x-auto text-xs font-mono whitespace-pre p-4 bg-black/20 rounded"
              dangerouslySetInnerHTML={{
                __html: `<span class="text-blue-400">fetch</span><span class="text-gray-400">(</span><span class="text-green-400">"${apiEndpoint}/invoke"</span><span class="text-gray-400">,</span> <span class="text-gray-400">{</span>
    <span class="text-purple-400">method</span><span class="text-gray-400">:</span> <span class="text-green-400">"POST"</span><span class="text-gray-400">,</span>
    <span class="text-purple-400">headers</span><span class="text-gray-400">:</span> <span class="text-gray-400">{</span>
      <span class="text-purple-400">"Content-Type"</span><span class="text-gray-400">:</span> <span class="text-green-400">"application/json"</span><span class="text-gray-400">,</span>
      <span class="text-purple-400">"Authorization"</span><span class="text-gray-400">:</span> <span class="text-green-400">"Bearer YOUR_API_KEY"</span><span class="text-gray-400">,</span>
      <span class="text-purple-400">"URL"</span><span class="text-gray-400">:</span> <span class="text-green-400">"https://api.example.com/agent-endpoint"</span>
    <span class="text-gray-400">},</span>
    <span class="text-purple-400">body</span><span class="text-gray-400">:</span> <span class="text-blue-400">JSON.stringify</span><span class="text-gray-400">({</span> 
      <span class="text-purple-400">input</span><span class="text-gray-400">:</span> <span class="text-green-400">"Your input for the agent"</span>
    <span class="text-gray-400">})</span>
  <span class="text-gray-400">})</span>
  <span class="text-gray-400">.</span><span class="text-yellow-400">then</span><span class="text-gray-400">(</span><span class="text-orange-400">response</span> <span class="text-gray-400">=></span> <span class="text-orange-400">response</span><span class="text-gray-400">.</span><span class="text-blue-400">json</span><span class="text-gray-400">())</span>
  <span class="text-gray-400">.</span><span class="text-yellow-400">then</span><span class="text-gray-400">(</span><span class="text-orange-400">data</span> <span class="text-gray-400">=></span> <span class="text-blue-400">console.log</span><span class="text-gray-400">(</span><span class="text-orange-400">data</span><span class="text-gray-400">))</span>
  <span class="text-gray-400">.</span><span class="text-yellow-400">catch</span><span class="text-gray-400">(</span><span class="text-orange-400">error</span> <span class="text-gray-400">=></span> <span class="text-blue-400">console.error</span><span class="text-gray-400">(</span><span class="text-green-400">'Error:'</span><span class="text-gray-400">,</span> <span class="text-orange-400">error</span><span class="text-gray-400">));</span>`
              }}
            />
          </div>
        </div>
        
        {/* API Keys List */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Your API Keys</h2>
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-purple/80 hover:bg-purple px-4 py-2 rounded-md text-white font-medium transition-colors"
            >
              Create New API Key
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple"></div>
              <p className="mt-2 text-gray-300">Loading your API keys...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-10 border border-gray/20 rounded-lg bg-darkGray/30">
              <p className="text-white font-medium">You don't have any API keys yet</p>
              <p className="mt-2 text-sm text-gray-400">Click the button below to create your first API key</p>
              <button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="mt-6 px-6 py-3 bg-purple/80 hover:bg-purple text-white rounded-md transition-colors font-medium"
              >
                Create API Key
              </button>
            </div>
          ) : (
            <div className="border border-gray/20 rounded-lg overflow-hidden bg-darkGray/30">
              <table className="w-full">
                <thead>
                  <tr className="bg-darkGray/70">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">API Key</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Last Used</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Usage</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
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
                          onClick={() => handleDeleteKey(apiKey.id, apiKey.key)}
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
        
        {/* Data Source Information */}
        {!useMockData && (
          <div className="mb-6 p-4 bg-purple/10 border border-purple/30 rounded-lg">
            <p className="text-sm text-lightGray">
              <span className="font-bold text-purple">Live Mode:</span> API keys are being managed through your blockchain wallet 
              {publicKey && <span className="font-mono ml-1 text-xs">({publicKey.toString().substring(0, 4)}...{publicKey.toString().substring(publicKey.toString().length - 4)})</span>}
            </p>
            <p className="mt-2 text-xs text-lightGray">
              Make sure the auth server is running at <span className="font-mono text-white">http://localhost:8000</span>
            </p>
            <div className="mt-3 flex items-center">
              <button 
                onClick={() => loadApiKeys()} 
                className="text-sm text-purple hover:text-purple/80 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Connection
              </button>
            </div>
          </div>
        )}
        
        {/* API Documentation Link */}
        <div className="p-6 bg-darkGray/50 border border-gray/30 rounded-lg text-center">
          <h2 className="text-lg font-bold mb-2 text-white">Need help?</h2>
          <p className="text-gray-300 mb-4">Check our API documentation for detailed guides and examples</p>
          <button className="px-6 py-3 bg-blue/80 hover:bg-blue text-white rounded-md transition-colors font-medium">
            View API Documentation
          </button>
        </div>
        
        {/* Debug Info */}
        <div className="mt-8 p-4 bg-black/30 border border-gray/10 rounded-md text-xs text-gray-400 font-mono">
          <details>
            <summary className="cursor-pointer hover:text-gray-300">Debug Information</summary>
            <div className="mt-2 space-y-1 pl-2">
              <div>API Status: <span className={apiStatus === 'online' ? "text-green-400" : apiStatus === 'offline' ? "text-yellow-400" : "text-gray-400"}>{apiStatus}</span></div>
              <div>Data Source: {useMockData ? "Mock Data" : "Live Data"}</div>
              <div>Wallet Connected: {connected ? "Yes" : "No"}</div>
              {publicKey && (
                <div>Wallet Address: {publicKey.toString()}</div>
              )}
              <div>API Endpoint: <span className="text-purple">http://localhost:8000/auth</span></div>
              
              {apiStatus === 'offline' && (
                <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-500/20 rounded">
                  <p className="text-yellow-500 font-bold mb-1">CORS Troubleshooting:</p>
                  <ul className="list-disc pl-4 text-yellow-500/80 space-y-1">
                    <li>Make sure the auth server is running on port 8000</li>
                    <li>Verify that CORS is enabled in the FastAPI backend</li>
                    <li>Check that <code>allow_origins=["*"]</code> or <code>allow_origins=["http://localhost:3000"]</code> is set</li>
                    <li>The auth.py endpoint may need to have proper CORS headers</li>
                  </ul>
                  <div className="mt-2 p-2 bg-black/40 rounded font-mono text-2xs">
                    <p className="text-green-400 mb-1"># Command to run auth server with proper CORS:</p>
                    <code className="text-white">cd backend/app/auth && python auth.py</code>
                  </div>
                </div>
              )}
              
              <div className="pt-2">
                <button 
                  onClick={() => {
                    setApiStatus('unknown');
                    setUseMockData(false);
                    
                    // Import API URL from apiKeyService
                    const API_URL = 'http://localhost:8000';
                    
                    // Set a timeout to catch hanging requests
                    setTimeout(() => {
                      if (apiStatus === 'unknown') {
                        setApiStatus('offline');
                        setUseMockData(true);
                        toast.error('API check timed out. Using mock data.');
                      }
                    }, 5000);
                    
                    // Force API check
                    const checkApiStatus = async () => {
                      try {
                        // First try a simple health check
                        try {
                          console.log('Checking API health at', `${API_URL}/`);
                          
                          // Use no-cors mode to bypass CORS restrictions for the check
                          const response = await fetch(`${API_URL}/`, {
                            method: 'GET',
                            mode: 'no-cors',
                            headers: { 
                              'Accept': 'application/json'
                            }
                          });
                          
                          console.log('Server responded to health check');
                          
                          // Now try the auth endpoint through the proper service
                          import('../../utils/apiKeyService').then(async (apiKeyService) => {
                            try {
                              console.log('Trying authentication with wallet', publicKey?.toString() || 'test');
                              await apiKeyService.authenticateWallet(publicKey?.toString() || 'test');
                              
                              // If we get here without error, authentication worked
                              console.log('Authentication successful');
                              setApiStatus('online');
                              toast.success('API connection successful');
                            } catch (error: any) {
                              console.error('Auth failed:', error);
                              setApiStatus('offline');
                              setUseMockData(true);
                              
                              // Provide more detailed error feedback
                              if (error.message && error.message.includes('CORS')) {
                                toast.error('Authentication failed due to CORS policy restrictions');
                              } else {
                                toast.error('Authentication failed: ' + error.message);
                              }
                            }
                          });
                        } catch (error) {
                          console.error('Health check failed:', error);
                          setApiStatus('offline');
                          setUseMockData(true);
                          toast.error('Server health check failed');
                        }
                      } catch (error) {
                        console.error('API check failed:', error);
                        setApiStatus('offline');
                        setUseMockData(true);
                        toast.error('API check failed');
                      }
                    };
                    
                    checkApiStatus();
                  }}
                  className="px-2 py-1 bg-purple/20 hover:bg-purple/40 text-purple rounded"
                >
                  Force API Check
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* Create API Key Dialog */}
      <Transition appear show={isCreateDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsCreateDialogOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-darkGray p-6 text-left align-middle shadow-xl transition-all border border-purple/30 font-sans">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white"
                  >
                    Create New API Key
                  </Dialog.Title>
                  <div className="mt-4">
                    <div className="mb-4">
                      <label htmlFor="apiKeyName" className="block text-sm font-medium text-gray-300 mb-2">
                        API Key Name
                      </label>
                      <input
                        type="text"
                        id="apiKeyName"
                        placeholder="e.g. Development, Production, Testing"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="w-full bg-black/30 border border-gray/30 rounded-md px-4 py-2 focus:outline-none focus:border-purple/60 text-white font-sans"
                      />
                      <p className="mt-1 text-xs text-gray-400 font-sans">
                        Choose a descriptive name to help you identify this key later
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray/30 bg-black/30 px-4 py-2 text-sm font-medium text-white hover:bg-black/50 focus:outline-none transition-colors font-sans"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-purple px-4 py-2 text-sm font-medium text-white hover:bg-purple/80 focus:outline-none disabled:opacity-50 transition-colors font-sans"
                      onClick={handleCreateKey}
                      disabled={creating || !newKeyName.trim()}
                    >
                      {creating ? 'Creating...' : 'Create Key'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </PageLayout>
  );
} 