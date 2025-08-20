import axios, { AxiosInstance } from 'axios';
import { BaseTool } from '../tool-interface';

interface MemoryMessage {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  user_id?: string;
  agent_id?: string;
  run_id?: string;
  metadata?: Record<string, any>;
}

interface Memory {
  id: string;
  memory: string;
  hash: string;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export class DirectMem0API extends BaseTool {
  name = 'DirectMem0API';
  description = 'Acesso direto à API Mem0 para gerenciamento de memória';
  private client: AxiosInstance;
  
  constructor() {
    super();
    const apiKey = process.env.MEM0_API_KEY;
    const baseURL = process.env.MEM0_BASE_URL || 'https://api.mem0.ai/v1';
    
    if (!apiKey) {
      throw new Error('MEM0_API_KEY não configurada');
    }
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }
  
  async execute(params: any): Promise<any> {
    const { action, ...data } = params;
    
    switch (action) {
      case 'add':
        return this.addMemory(data);
      case 'search':
        return this.searchMemories(data);
      case 'list':
        return this.listMemories(data);
      case 'delete':
        return this.deleteMemory(data);
      case 'get':
        return this.getMemory(data);
      default:
        throw new Error(`Ação não suportada: ${action}`);
    }
  }
  
  private async addMemory(data: MemoryMessage): Promise<any> {
    try {
      const response = await this.client.post('/memories/', data);
      return {
        success: true,
        memory: response.data,
        message: 'Memória adicionada com sucesso'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
  
  private async searchMemories(params: { query: string; limit?: number; user_id?: string }): Promise<any> {
    try {
      const response = await this.client.post('/memories/search/', {
        query: params.query,
        limit: params.limit || 10,
        user_id: params.user_id
      });
      
      return {
        success: true,
        memories: response.data.results || [],
        count: response.data.results?.length || 0
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
  
  private async listMemories(params: { user_id?: string; limit?: number; offset?: number }): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      if (params.user_id) queryParams.append('user_id', params.user_id);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      
      const response = await this.client.get(`/memories/?${queryParams.toString()}`);
      
      return {
        success: true,
        memories: response.data.results || [],
        total: response.data.count || 0
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
  
  private async getMemory(params: { memory_id: string }): Promise<any> {
    try {
      const response = await this.client.get(`/memories/${params.memory_id}/`);
      
      return {
        success: true,
        memory: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
  
  private async deleteMemory(params: { memory_id: string }): Promise<any> {
    try {
      await this.client.delete(`/memories/${params.memory_id}/`);
      
      return {
        success: true,
        message: 'Memória deletada com sucesso'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
}

// Classe wrapper para compatibilidade com agentes existentes
export class Mem0MemoryTool extends DirectMem0API {
  async add(messages: any[], userId?: string, agentId?: string, metadata?: any) {
    return this.execute({
      action: 'add',
      messages,
      user_id: userId,
      agent_id: agentId,
      metadata
    });
  }
  
  async search(query: string, userId?: string, limit?: number) {
    return this.execute({
      action: 'search',
      query,
      user_id: userId,
      limit
    });
  }
  
  async list(userId?: string, limit?: number) {
    return this.execute({
      action: 'list',
      user_id: userId,
      limit
    });
  }
  
  async delete(memoryId: string) {
    return this.execute({
      action: 'delete',
      memory_id: memoryId
    });
  }
}