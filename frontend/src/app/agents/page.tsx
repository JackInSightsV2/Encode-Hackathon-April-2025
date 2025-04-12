import AgentList from '@/components/AgentList';
import PageLayout from '@/components/PageLayout';

export default function AgentsPage() {
  return (
    <PageLayout
      title={<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple via-blue to-green">Browse AI Agents</span>}
      description="Browse AI agents from the blockchain or try demo agents"
    >
      <main className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <AgentList />
        </div>
      </main>
    </PageLayout>
  );
} 