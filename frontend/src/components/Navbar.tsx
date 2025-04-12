"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import WalletConnectButton from './WalletConnectButton';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { connected } = useWallet();
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Browse Agents', path: '/agents' },
    { name: 'My Agents', path: '/my-agents' },
    { name: 'Register', path: '/register' },
  ];
  
  // Add API Keys link if wallet is connected
  const displayLinks = connected 
    ? [...navLinks, { name: 'API Keys', path: '/api-keys' }]
    : navLinks;
  
  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 font-[family-name:var(--font-geist-sans)] ${
      isScrolled 
        ? 'py-3 glass shadow-md' 
        : 'py-5 bg-transparent'
    }`}>
      <div className="container-responsive flex justify-between items-center">
        {/* Logo and title */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 overflow-hidden">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple via-blue to-green blur-sm opacity-70"></div>
            <span className="relative z-10 flex items-center justify-center w-full h-full bg-black rounded-full text-white font-bold text-lg">
              AI
            </span>
          </div>
          <span className="font-bold text-lg hidden sm:inline-block gradient-text">AI Agent Marketplace</span>
        </Link>
        
        {/* Navigation links - hide on mobile */}
        <div className="hidden md:flex items-center space-x-6">
          {displayLinks.map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              className={`relative text-sm font-semibold transition-colors group ${
                pathname === link.path ? 'gradient-text' : 'text-lightGray hover:text-white'
              }`}
            >
              {link.name}
              <span className={`absolute left-0 bottom-0 w-full h-0.5 transition-transform duration-200 transform ${
                pathname === link.path 
                  ? 'scale-x-100 bg-gradient-to-r from-purple via-blue to-green' 
                  : 'scale-x-0 bg-blue group-hover:scale-x-100'
              }`} />
            </Link>
          ))}
        </div>
        
        {/* Wallet connect */}
        <WalletConnectButton />
      </div>
      
      {/* Mobile navigation - slide down when menu button is clicked */}
      <div className="md:hidden pt-4 pb-2 px-4 flex overflow-x-auto gap-4 border-t border-gray/20 mt-3">
        {displayLinks.map((link) => (
          <Link 
            key={link.path} 
            href={link.path}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
              pathname === link.path 
                ? 'bg-darkGray border border-purple/50 gradient-text' 
                : 'text-lightGray hover:bg-darkGray/50 hover:text-white'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
} 