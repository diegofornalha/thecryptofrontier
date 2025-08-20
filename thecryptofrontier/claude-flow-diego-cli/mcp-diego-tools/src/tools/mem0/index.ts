/**
 * Mem0 tool handlers - Local implementation
 */

import { config } from '../../config/index.js';
import { successResponse } from '../../utils.js';
import { 
  AddMemoryParams, 
  SearchMemoryParams, 
  ListMemoriesParams, 
  DeleteMemoriesParams 
} from '../../core/types.js';

// Interface não utilizada removida

// Cliente HTTP simples para o mem0-bridge
async function callMem0Bridge(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
  const baseUrl = config.mem0.baseUrl || 'http://localhost:3002';
  const url = `${baseUrl}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Erro ao conectar com mem0-bridge: ${errorMessage}`);
  }
}

export async function handleAddMemory(params: AddMemoryParams) {
  const response = await callMem0Bridge('/memories', 'POST', {
    content: params.content,
    user_id: params.user_id,
    metadata: params.metadata,
    tags: params.tags,
    category: params.category
  });
  
  return successResponse(response.data, 'Memória adicionada com sucesso');
}

export async function handleSearchMemory(params: SearchMemoryParams) {
  const queryParams = new URLSearchParams({
    query: params.query,
    user_id: params.user_id,
    limit: params.limit?.toString() || '10'
  });
  
  if (params.filters) {
    queryParams.append('filters', JSON.stringify(params.filters));
  }
  
  const response = await callMem0Bridge(`/memories/search?${queryParams}`, 'GET');
  
  return successResponse(
    response.data, 
    `Encontradas ${response.data?.results?.length || 0} memórias`
  );
}

export async function handleListMemories(params: ListMemoriesParams) {
  const queryParams = new URLSearchParams({
    user_id: params.user_id,
    limit: params.limit?.toString() || '50'
  });
  
  const response = await callMem0Bridge(`/memories?${queryParams}`, 'GET');
  
  return successResponse(
    response.data,
    `Listadas ${response.data?.memories?.length || 0} memórias`
  );
}

export async function handleDeleteMemories(params: DeleteMemoriesParams) {
  const endpoint = params.memory_id 
    ? `/memories/${params.memory_id}?user_id=${params.user_id}`
    : `/memories?user_id=${params.user_id}`;
    
  const response = await callMem0Bridge(endpoint, 'DELETE');
  
  return successResponse(
    response.data,
    params.memory_id 
      ? 'Memória deletada com sucesso'
      : 'Todas as memórias do usuário foram deletadas'
  );
}