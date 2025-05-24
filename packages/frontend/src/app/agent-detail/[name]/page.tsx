import AgentDetailClient from './AgentDetailClient';

// This function dynamically fetches agent names for static export from the backend API.
export async function generateStaticParams() {
  // Always include a test param for local development
  const staticTestParams = [{ name: 'SuiTestBot_2' }];
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_API || 'http://38.54.24.5/api';
  try {
    const res = await fetch(`${baseUrl}/agents?page=1&page_size=1000`);
    const data = await res.json();
    const dynamicParams = (data.agents || []).map((agent: { agent_name: string }) => ({
      name: agent.agent_name,
    }));
    // Merge and deduplicate params
    const allParams = [...staticTestParams, ...dynamicParams].filter(
      (v, i, a) => a.findIndex(t => t.name === v.name) === i
    );
    return allParams;
  } catch {
    // If fetch fails, fallback to static test param
    return staticTestParams;
  }
}

// This must be a synchronous function, not async!
export default function AgentDetailPage({ params }: { params: { name: string } }) {
  const { name } = params;
  return <AgentDetailClient name={name} />;
} 