import AgentDetailClient from './AgentDetailClient';

export const dynamic = 'force-dynamic';

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  // Await the params Promise to get the dynamic route parameter
  const { name } = await params;
  return <AgentDetailClient name={name} />;
} 