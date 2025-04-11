import Image from "next/image";
import Link from "next/link";
import WalletConnectButton from "../components/WalletConnectButton";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen font-[family-name:var(--font-geist-sans)]">
        <header className="flex flex-col items-center mb-16 pt-16 md:pt-24">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple via-blue to-green">AI Agent Marketplace</span>
          </h1>
          <p className="text-lightGray mb-8 text-center max-w-2xl mx-auto px-4">
            A decentralized platform for AI agents powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple to-blue">Solana</span>
          </p>
          
          <div className="w-full max-w-md mx-auto flex justify-center">
            <Link 
              href="/agents" 
              className="btn-solana-primary"
            >
              Get Started
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple via-blue to-green">Welcome to the AI Agent Marketplace</h2>
            <p className="text-lightGray max-w-2xl mx-auto mb-8">
              Browse and use AI agents, or register your own to earn Solana. 
              Connect your wallet to get started.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/agents" 
                className="relative group btn-solana-primary overflow-visible"
              >
                <span className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-purple to-blue opacity-0 blur-md group-hover:opacity-70 transition-opacity duration-300"></span>
                <span className="relative z-10">Browse Agents</span>
              </Link>
              <Link 
                href="/my-agents" 
                className="relative group overflow-visible bg-gradient-to-r from-green to-teal text-black font-medium rounded-lg px-6 py-3 shadow-solana hover:shadow-lg transition-all duration-200"
              >
                <span className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-green to-teal opacity-0 blur-md group-hover:opacity-70 transition-opacity duration-300"></span>
                <span className="relative z-10">My Agents</span>
              </Link>
              <Link 
                href="/register" 
                className="relative group btn-solana-secondary overflow-visible"
              >
                <span className="absolute -inset-0.5 rounded-lg bg-purple opacity-0 blur-md group-hover:opacity-30 transition-opacity duration-300"></span>
                <span className="relative z-10">Register Your Agent</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="card-solana p-6 group hover:scale-[1.03] transition-transform duration-300">
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-purple/20 rounded-full blur-xl"></div>
              <div className="flex items-center justify-center w-12 h-12 bg-purple/10 text-purple rounded-full mb-4 group-hover:bg-purple/20 transition-colors relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white relative z-10">Register AI Agents</h3>
              <p className="text-lightGray relative z-10">
                Register your AI agents and set your own price in SOL. Monetize your AI endpoints with Solana's blockchain.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-solana p-6 group hover:scale-[1.03] transition-transform duration-300">
              <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-green/20 rounded-full blur-xl"></div>
              <div className="flex items-center justify-center w-12 h-12 bg-green/10 text-green rounded-full mb-4 group-hover:bg-green/20 transition-colors relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white relative z-10">Earn SOL</h3>
              <p className="text-lightGray relative z-10">
                Get paid in SOL every time someone uses your AI agent. Secure, transparent, and instant payments.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-solana p-6 group hover:scale-[1.03] transition-transform duration-300">
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue/20 rounded-full blur-xl"></div>
              <div className="flex items-center justify-center w-12 h-12 bg-blue/10 text-blue rounded-full mb-4 group-hover:bg-blue/20 transition-colors relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white relative z-10">Discover AI Agents</h3>
              <p className="text-lightGray relative z-10">
                Browse and use AI agents created by the community. Find the perfect AI solution for your needs.
              </p>
            </div>
          </div>
        </main>

        <footer className="mt-16 pt-8 border-t border-gray/30 text-center text-lightGray text-sm pb-8">
          <p>AI Agent Marketplace powered by <span className="text-purple">Solana</span></p>
          <p className="mt-2">© 2025 AI Agent Marketplace</p>
        </footer>
      </div>
    </>
  );
}
