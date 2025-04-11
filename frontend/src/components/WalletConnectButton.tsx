"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';

export default function WalletConnectButton() {
  const { publicKey, connected } = useWallet();
  const [copied, setCopied] = useState(false);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <WalletMultiButton className="mb-4" />
      
      {connected && publicKey && (
        <div className="mt-2 flex items-center">
          <div className="text-sm text-gray-600">
            Connected as:{' '}
            <span 
              className="font-mono bg-gray-100 p-1 rounded cursor-pointer hover:bg-gray-200"
              onClick={copyAddress}
              title="Click to copy"
            >
              {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}
            </span>
            {copied && (
              <span className="ml-2 text-xs text-green-600 animate-fade-in">
                Copied!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 