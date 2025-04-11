import AgentForm from '@/components/AgentForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold">Register AI Agent</h1>
          <p className="text-gray-600 mt-2">
            Add your AI agent to the marketplace
          </p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
        >
          Back to Home
        </Link>
      </header>

      <main>
        <AgentForm />
      </main>
    </div>
  );
} 