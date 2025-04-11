"use client";

import React, { ReactNode } from 'react';
import Navbar from './Navbar';

type PageLayoutProps = {
  children: ReactNode;
  title?: ReactNode;
  description?: string;
  showHeader?: boolean;
};

export default function PageLayout({ 
  children, 
  title, 
  description, 
  showHeader = true 
}: PageLayoutProps) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen font-[family-name:var(--font-geist-sans)]">
        {showHeader && (title || description) && (
          <header className="pt-12 pb-12 md:pt-16 md:pb-16">
            <div className="container-responsive text-center">
              {title && (
                <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-lightGray max-w-2xl mx-auto">{description}</p>
              )}
            </div>
          </header>
        )}
        
        <main className="flex-1">
          {children}
        </main>
        
        <footer className="mt-16 pt-8 border-t border-gray/30 text-center text-lightGray text-sm pb-8">
          <p>AI Agent Marketplace powered by <span className="text-purple">Solana</span></p>
          <p className="mt-2">© 2025 AI Agent Marketplace</p>
        </footer>
      </div>
    </>
  );
} 