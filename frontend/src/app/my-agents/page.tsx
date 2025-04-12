import MyAgentsList from '@/components/MyAgentsList';
import PageLayout from '@/components/PageLayout';

export default function MyAgentsPage() {
  return (
    <PageLayout
      title={<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple via-blue to-green">My Registered Agents</span>}
      description="Manage and monitor your registered AI agents"
    >
      <main className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between pb-8">
            <h2 className="text-2xl font-semibold text-white">Your Agents</h2>
            
            <div className="text-sm text-lightGray bg-darkGray/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray/30">
              Monitor performance and usage
            </div>
          </div>
          
          <MyAgentsList />
        </div>
      </main>
    </PageLayout>
  );
} 