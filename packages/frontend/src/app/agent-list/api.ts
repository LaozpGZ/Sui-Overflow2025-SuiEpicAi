import { API_CONFIG } from '@/config/api';

export interface AgentApiItem {
  agent_name: string;
  subject_address: string;
  created_at: string;
  bio?: string;
  image?: string;
}

export interface AgentListApiResponse {
  agents: AgentApiItem[];
  total: number;
  page: number;
  page_size: number;
}

export async function fetchAgentList(page = 1, pageSize = 12): Promise<AgentListApiResponse> {
  try {
    const res = await fetch(`${API_CONFIG.SERVER_API}/agents?page=${page}&page_size=${pageSize}`);
    const data = await res.json();
    if (data.code === 403 || data.success === false) {
      throw new Error(data.error || data.msg || 'Permission denied');
    }
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return data;
  } catch (e) {
    console.error('fetchAgentList error:', e);
    throw e instanceof Error ? e : new Error(JSON.stringify(e));
  }
} 