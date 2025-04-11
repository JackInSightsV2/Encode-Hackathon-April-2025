import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import ClientWalletProvider from "../components/ClientWalletProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Agent Marketplace | Solana",
  description: "A marketplace for AI agents on Solana",
  manifest: "/manifest.json",
  themeColor: "#9945FF", // Solana purple
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AI Agent Marketplace",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <meta name="application-name" content="AI Agent Marketplace" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AI Agent Marketplace" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#9945FF" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <Script src="/sw.js" strategy="afterInteractive" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-black text-white`}
      >
        {/* Background gradients/effects */}
        <div className="fixed inset-0 z-[-1] overflow-hidden">
          {/* Top-left purple glow */}
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple/20 rounded-full blur-3xl opacity-60"></div>
          
          {/* Bottom-right blue glow */}
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue/20 rounded-full blur-3xl opacity-60"></div>
          
          {/* Center green accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green/10 rounded-full blur-3xl opacity-30"></div>
          
          {/* Subtle grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-20" 
            style={{ 
              backgroundImage: 'linear-gradient(to right, #333333 1px, transparent 1px), linear-gradient(to bottom, #333333 1px, transparent 1px)',
              backgroundSize: '40px 40px' 
            }}
          ></div>
        </div>
        
        <ClientWalletProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </ClientWalletProvider>
        
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#141414',
              color: '#FFFFFF',
              borderRadius: '0.5rem',
              border: '1px solid #9945FF',
              boxShadow: '0 4px 14px rgba(153, 69, 255, 0.2)',
            },
            success: {
              iconTheme: {
                primary: '#14F195',
                secondary: '#000000',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF4557',
                secondary: '#FFFFFF',
              },
            },
          }} 
        />
      </body>
    </html>
  );
}
