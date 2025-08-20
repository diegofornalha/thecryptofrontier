/**
 * Mock implementation do Mem0 para demonstração
 * Em produção, substituir por uma solução real de memória persistente
 */

export class MemoryClient {
  private memories: Map<string, any[]> = new Map();

  async update_project(data: { custom_instructions: string }) {
    console.log('📝 Atualizando instruções do projeto:', data.custom_instructions.substring(0, 100) + '...');
    return true;
  }

  async add(messages: any[], options: { user_id: string; metadata: any }) {
    const userId = options.user_id;
    if (!this.memories.has(userId)) {
      this.memories.set(userId, []);
    }
    
    const memory = {
      messages,
      metadata: options.metadata,
      memory: messages[0].content,
      timestamp: new Date().toISOString()
    };
    
    this.memories.get(userId)!.push(memory);
    console.log(`✅ Memória adicionada para ${userId}:`, memory.memory.substring(0, 100));
    return { id: Date.now().toString() };
  }

  async search(options: { query: string; user_id: string; limit?: number; filter?: any }) {
    const userMemories = this.memories.get(options.user_id) || [];
    const filtered = options.filter 
      ? userMemories.filter(m => m.metadata?.type === options.filter.type)
      : userMemories;
    
    // Simulação simples de busca
    const results = filtered
      .filter(m => m.memory.toLowerCase().includes(options.query.toLowerCase()))
      .slice(0, options.limit || 10);
    
    return { results };
  }

  async get_all(options: { user_id: string; page?: number; page_size?: number }) {
    const userMemories = this.memories.get(options.user_id) || [];
    const page = options.page || 1;
    const pageSize = options.page_size || 100;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      results: userMemories.slice(start, end)
    };
  }
}

// Armazenamento simulado para demonstração
const mockStorage = new Map<string, any>();

export const mockMem0Storage = {
  save: (key: string, data: any) => {
    mockStorage.set(key, data);
    console.log(`💾 Dados salvos em mock storage: ${key}`);
  },
  
  load: (key: string) => {
    return mockStorage.get(key);
  },
  
  listAll: () => {
    return Array.from(mockStorage.entries());
  }
};