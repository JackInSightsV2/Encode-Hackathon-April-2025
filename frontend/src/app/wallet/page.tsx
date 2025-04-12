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

export default function WalletPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<ApiWalletDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(1);
  const [isDepositing, setIsDepositing] = useState(false);

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
        
        // Step 1: Authenticate with wallet address
        const authResponse = await authenticateWallet(publicKey.toString());
        setSessionId(authResponse.session_id);
        
        // Step 2: Get wallet balance and transaction history using the session ID
        const walletDetails = await getWalletDetails(authResponse.session_id);
        setWalletData(walletDetails);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch wallet data:', err);
        setError('Failed to load wallet data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [publicKey, connected, router]);

  // Handle deposit
  const handleDeposit = async () => {
    if (!sessionId || depositAmount <= 0) return;
    
    try {
      setIsDepositing(true);
      const updatedBalance = await depositFunds(sessionId, depositAmount);
      
      // Update the local wallet data with the new balance
      if (walletData) {
        const now = new Date().toISOString();
        setWalletData({
          ...walletData,
          balance: updatedBalance.balance,
          transactions: [
            {
              id: `deposit-${now}`,
              amount: depositAmount,
              type: 'deposit',
              timestamp: now
            },
            ...walletData.transactions
          ]
        });
      }
    } catch (err) {
      console.error('Failed to deposit funds:', err);
      setError('Failed to deposit funds. Please try again later.');
    } finally {
      setIsDepositing(false);
    }
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

    if (error) {
      return (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
          <p className="font-medium">Error: {error}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="lg:col-span-1">
          <div className="bg-darkGray rounded-xl p-6 border border-purple/20 shadow-lg">
            <h2 className="text-lg font-medium text-lightGray mb-2">Current Balance</h2>
            <div className="text-4xl font-bold gradient-text">
              ${walletData?.balance.toFixed(2)}
            </div>
            <p className="text-sm text-lightGray mt-2">
              Session ID: {sessionId}
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
                Note: This is using dummy data for demonstration
              </p>
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
                            {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
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