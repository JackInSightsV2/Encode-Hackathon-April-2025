"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import {
  authenticateWallet,
  getWalletDetails,
  depositFunds,
  type WalletDetails as ApiWalletDetails
} from '@/utils/api';
import PageLayout from '@/components/PageLayout';
import { LIVE_ESCROW_API_URL } from '@/utils/constants';

export default function WalletPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<ApiWalletDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(1);
  const [isDepositing, setIsDepositing] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');

  // Check if API is available
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${LIVE_ESCROW_API_URL}/test`, {
          signal: controller.signal,
          mode: 'cors',
          cache: 'no-cache',
        }).catch((err) => {
          console.error('Fetch error during API check:', err);
          return null;
        });
        
        clearTimeout(timeoutId);
        
        if (response && response.ok) {
          console.log('Live API is available');
          setApiStatus('online');
          setUseMockData(false);
        } else {
          console.log('Live API is not available, using mock data');
          setApiStatus('offline');
          setUseMockData(true);
        }
      } catch (error) {
        console.error('Error checking API status:', error);
        setApiStatus('offline');
        setUseMockData(true);
      }
    };
    
    checkApiStatus();
  }, []);

  useEffect(() => {
    // Redirect to home if not connected
    if (!connected || !publicKey) {
      router.push('/');
      return;
    }

    // Function to authenticate and get wallet data
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Step 1: Authenticate with wallet address
        const authResponse = await authenticateWallet(publicKey.toString());
        setSessionId(authResponse.session_id);
        
        // Step 2: Get wallet balance and transaction history using the session ID
        const walletDetails = await getWalletDetails(authResponse.session_id, useMockData);
        setWalletData(walletDetails);
      } catch (err) {
        console.error('Failed to fetch wallet data:', err);
        setError('Failed to load wallet data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [publicKey, connected, router, useMockData]);

  // Handle deposit
  const handleDeposit = async () => {
    if (!sessionId || depositAmount <= 0) return;
    
    try {
      setIsDepositing(true);
      setError(null);
      
      const updatedBalance = await depositFunds(sessionId, depositAmount, useMockData);
      
      // Refresh wallet data to include the new transaction
      const walletDetails = await getWalletDetails(sessionId, useMockData);
      setWalletData(walletDetails);
    } catch (err) {
      console.error('Failed to deposit funds:', err);
      setError('Failed to deposit funds. Please try again later.');
    } finally {
      setIsDepositing(false);
    }
  };

  // Toggle data source
  const toggleDataSource = () => {
    // Only inform user if live API is not available when trying to use it
    if (useMockData && apiStatus === 'offline') {
      setError('Live API is not available. Using mock data instead.');
      return;
    }
    
    // Otherwise allow toggling between mock and live data
    setUseMockData(!useMockData);
  };

  // Format date string to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric' 
    });
  };

  const walletContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-pulse text-blue">Loading wallet data...</div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="lg:col-span-1">
          <div className="bg-darkGray rounded-xl p-6 border border-purple/20 shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium text-lightGray">Current Balance</h2>
              <div 
                className={`flex items-center gap-2 text-sm ${apiStatus === 'offline' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} 
                onClick={toggleDataSource}
              >
                <span className={useMockData ? "text-yellow" : "text-green"}>
                  {useMockData ? "Using Mock Data" : "Using Live Data"}
                </span>
                <div className={`w-10 h-5 rounded-full transition-colors ${useMockData ? 'bg-yellow/20' : 'bg-green/20'} relative`}>
                  <div 
                    className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${useMockData ? 'left-0.5 bg-yellow' : 'left-5.5 bg-green'}`}
                  ></div>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-2 rounded-lg text-sm mb-3">
                {error}
              </div>
            )}
            
            <div className="text-4xl font-bold gradient-text">
              {walletData?.balance.toFixed(2)} SOL
            </div>
            <p className="text-sm text-lightGray mt-2">
              Wallet ID: {publicKey?.toString().substring(0, 12)}...
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex gap-2">
                <input 
                  type="number" 
                  min="1" 
                  step="1" 
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="flex-1 bg-gray/10 border border-gray/20 rounded-md px-3 py-2 text-white"
                  placeholder="Amount"
                />
                <button 
                  className="bg-blue hover:bg-blue/80 text-white font-medium py-2 px-4 rounded-md transition"
                  onClick={handleDeposit}
                  disabled={isDepositing}
                >
                  {isDepositing ? 'Processing...' : 'Deposit'}
                </button>
              </div>
              <p className="text-xs text-lightGray">
                {useMockData 
                  ? "Using mock data for demonstration" 
                  : "Connected to escrow API on port 8001"}
              </p>
              {apiStatus === 'online' && !useMockData && (
                <p className="text-xs text-green font-semibold">
                  ● Live API connection is active
                </p>
              )}
              {apiStatus === 'offline' && (
                <p className="text-xs text-yellow">
                  ● Live API is not available
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Transaction History */}
        <div className="lg:col-span-2">
          <div className="bg-darkGray rounded-xl p-6 border border-purple/20 shadow-lg">
            <h2 className="text-lg font-medium text-lightGray mb-4">Transaction History</h2>
            
            {walletData?.transactions?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray/20">
                      <th className="text-left py-3 px-2 text-lightGray font-medium">Date</th>
                      <th className="text-left py-3 px-2 text-lightGray font-medium">Type</th>
                      <th className="text-right py-3 px-2 text-lightGray font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {walletData.transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-gray/10 hover:bg-gray/5">
                        <td className="py-3 px-2 text-sm">{formatDate(tx.timestamp)}</td>
                        <td className="py-3 px-2">
                          <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                            tx.type === 'deposit' 
                              ? 'bg-green/10 text-green' 
                              : 'bg-yellow/10 text-yellow'
                          }`}>
                            {tx.type === 'deposit' ? 'Deposit' : 'Spent'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-medium">
                          <span className={tx.type === 'deposit' ? 'text-green' : 'text-yellow'}>
                            {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toFixed(2)} SOL
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-lightGray">
                No transactions found.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageLayout
      title={<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple via-blue to-green">Wallet</span>}
      description="Manage your funds and view transaction history"
    >
      <main className="container-responsive py-12">
        {walletContent()}
      </main>
    </PageLayout>
  );
} 