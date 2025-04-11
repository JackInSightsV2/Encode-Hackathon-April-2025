"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import Tooltip from './Tooltip';

export default function WalletConnectButton() {
  const { publicKey, connected, disconnect, connect, wallet, wallets } = useWallet();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);

  const handleConnect = () => {
    if (!wallet) {
      setVisible(true); // Open the wallet modal for selection
    } else {
      connect().catch((error) => {
        console.error(error);
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleCopy = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  // Format wallet address for display (shortened)
  const formattedAddress = publicKey 
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : '';

  // If wallet is not connected, show connect button
  if (!connected) {
    return (
      <button 
        onClick={handleConnect}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition-colors"
      >
        Connect Wallet
      </button>
    );
  }

  // If wallet is connected, show address and disconnect button
  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <button 
          onClick={handleCopy}
          className="bg-gray-800 text-white px-4 py-2 rounded-l-md flex items-center hover:bg-gray-700 transition-colors"
        >
          <span>{formattedAddress}</span>
        </button>
        
        {copied && (
          <Tooltip text="Copied!" position="bottom">
            <span></span>
          </Tooltip>
        )}
      </div>
      
      <button 
        onClick={handleDisconnect}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-r-md transition-colors"
      >
        Disconnect
      </button>
    </div>
  );
} 