"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import Tooltip from './Tooltip';

export default function WalletConnectButton() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);

  const handleConnect = () => {
    setVisible(true);
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

  // Wallet info/status element
  const walletInfo = connected && publicKey ? (
    <div className="flex items-center">
      <Tooltip text="Copy address to clipboard">
        <button 
          onClick={handleCopy}
          className="mr-2 bg-darkGray/80 backdrop-blur-sm text-white border border-gray/60 hover:border-purple rounded-lg px-3 py-1.5 text-sm transition-all duration-200 hover:shadow-solana"
        >
          {copied ? (
            <span className="flex items-center">
              <CheckIcon className="w-4 h-4 mr-1 text-green" />
              Copied!
            </span>
          ) : (
            <span className="flex items-center">
              <WalletIcon className="w-4 h-4 mr-1.5 text-purple" />
              {formattedAddress}
            </span>
          )}
        </button>
      </Tooltip>
      <button 
        onClick={handleDisconnect}
        className="bg-darkGray/80 backdrop-blur-sm border border-red/60 hover:border-red text-white text-sm py-1.5 px-3 rounded-lg transition-all duration-200 hover:shadow-sm"
      >
        Disconnect
      </button>
    </div>
  ) : (
    <button 
      onClick={handleConnect}
      className="relative overflow-hidden bg-gradient-to-r from-purple to-blue text-white font-medium rounded-lg px-5 py-2.5 shadow-solana transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-light focus:ring-opacity-50 group"
    >
      {/* Animated glow effect */}
      <span className="absolute w-24 h-24 -top-10 -left-10 bg-white/20 rounded-full blur-xl group-hover:animate-pulse"></span>
      
      <span className="relative z-10 flex items-center justify-center">
        <WalletIcon className="w-5 h-5 mr-2" />
        Connect Wallet
      </span>
    </button>
  );

  return (
    <div className="flex justify-center items-center">
      {walletInfo}
    </div>
  );
}

function WalletIcon(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      {...props}
    >
      <path d="M2.273 5.625A4.483 4.483 0 0 1 5.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 3H5.25a3 3 0 0 0-2.977 2.625ZM2.273 8.625A4.483 4.483 0 0 1 5.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 6H5.25a3 3 0 0 0-2.977 2.625ZM5.25 9a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3H15a.75.75 0 0 0-.75.75 2.25 2.25 0 0 1-4.5 0A.75.75 0 0 0 9 9H5.25Z" />
    </svg>
  );
}

function CheckIcon(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      {...props}
    >
      <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" />
    </svg>
  );
} 