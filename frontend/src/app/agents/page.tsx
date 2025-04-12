import AgentList from '@/components/AgentList';
import PageLayout from '@/components/PageLayout';

export default function AgentsPage() {
  return (
    <PageLayout
      title={<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple via-blue to-green">Browse AI Agents</span>}
      description="Find and use AI agents from the marketplace"
    >
      <main className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between pb-8">
            <h2 className="text-2xl font-semibold text-white">Available Agents</h2>
            
            {/* Could add filters or search here in the future */}
            <div className="text-sm text-lightGray bg-darkGray/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray/30">
              Showing all agents
            </div>
          </div>
          
          <AgentList />
        </div>
      </main>
    </PageLayout>
  );
} 