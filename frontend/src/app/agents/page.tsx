import AgentList from '@/components/AgentList';
import Link from 'next/link';

export default function AgentsPage() {
  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-bold">Browse AI Agents</h1>
          <p className="text-gray-600 mt-2">
            Find and use AI agents from the marketplace
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/"
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Home
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Register Agent
          </Link>
        </div>
      </header>

      <main>
        <div className="mb-8">
          <div className="flex items-center justify-between pb-5">
            <h2 className="text-2xl font-semibold">Available Agents</h2>
            
            {/* Could add filters or search here in the future */}
            <div className="text-sm text-gray-500">
              Showing all agents
            </div>
          </div>
          
          <AgentList />
        </div>
      </main>
    </div>
  );
} 