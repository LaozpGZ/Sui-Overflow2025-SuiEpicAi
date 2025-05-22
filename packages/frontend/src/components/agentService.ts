// Import API configuration
import { API_CONFIG } from '@/config/api';

// API base URL
const API_BASE_URL = API_CONFIG.SERVER_API;

// Interface for Agent data
export interface Agent {
  agent_name: string;
  subject_address: string;
  created_at: string;
}

// Interface for detailed Agent data
export interface AgentDetail {
  agent_name: string;
  subject_address: string;
  bio: string;
  invite_url: string;
  created_at: string;
}

// Interface for paginated response
export interface PaginatedResponse {
  agents: Agent[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * Fetch agents with pagination
 * @param page Current page number
 * @param pageSize Number of items per page
 * @returns Promise with paginated agents data
 */
export async function fetchAgents(
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/agents?page=${page}&page_size=${pageSize}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      agents: data.agents || [],
      total: data.total || 0,
      page: data.page || page,
      page_size: data.page_size || pageSize,
    };
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
}

/**
 * Search for a specific agent by name
 * @param agentName The name of the agent to search for
 * @returns Promise with agent data
 */
export async function searchAgentByName(agentName: string): Promise<Agent[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/agents/${encodeURIComponent(agentName)}`
    );

    if (!response.ok) {
      throw new Error(`Agent not found: ${response.status}`);
    }

    const data = await response.json();
    // Handle both single object and array responses
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Error searching for agent:', error);
    throw error;
  }
}

/**
 * Fetch detailed information about a specific agent
 * @param agentName The name of the agent to fetch details for
 * @returns Promise with detailed agent data
 */
export async function fetchAgentDetail(agentName: string): Promise<AgentDetail> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/agent/detail/${encodeURIComponent(agentName)}`
    );

    if (!response.ok) {
      throw new Error(`Agent detail not found: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching agent detail:', error);
    throw error;
  }
} 