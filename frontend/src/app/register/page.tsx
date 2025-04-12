import AgentForm from '@/components/AgentForm';
import PageLayout from '@/components/PageLayout';

export default function RegisterPage() {
  return (
    <PageLayout 
      title="Register AI Agent" 
      description="Add your AI agent to the marketplace and start earning SOL"
    >
      <main className="max-w-4xl mx-auto px-4 pb-20">
        <AgentForm />
      </main>
    </PageLayout>
  );
} 