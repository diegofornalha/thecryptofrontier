import axios from 'axios';
import { BaseTool } from '../tool-interface';
export class DirectMem0API extends BaseTool {
    constructor() {
        super();
        this.name = 'DirectMem0API';
        this.description = 'Acesso direto à API Mem0 para gerenciamento de memória';
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
    async execute(params) {
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
    async addMemory(data) {
        var _a;
        try {
            const response = await this.client.post('/memories/', data);
            return {
                success: true,
                memory: response.data,
                message: 'Memória adicionada com sucesso'
            };
        }
        catch (error) {
            return {
                success: false,
                error: ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message
            };
        }
    }
    async searchMemories(params) {
        var _a, _b;
        try {
            const response = await this.client.post('/memories/search/', {
                query: params.query,
                limit: params.limit || 10,
                user_id: params.user_id
            });
            return {
                success: true,
                memories: response.data.results || [],
                count: ((_a = response.data.results) === null || _a === void 0 ? void 0 : _a.length) || 0
            };
        }
        catch (error) {
            return {
                success: false,
                error: ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message
            };
        }
    }
    async listMemories(params) {
        var _a;
        try {
            const queryParams = new URLSearchParams();
            if (params.user_id)
                queryParams.append('user_id', params.user_id);
            if (params.limit)
                queryParams.append('limit', params.limit.toString());
            if (params.offset)
                queryParams.append('offset', params.offset.toString());
            const response = await this.client.get(`/memories/?${queryParams.toString()}`);
            return {
                success: true,
                memories: response.data.results || [],
                total: response.data.count || 0
            };
        }
        catch (error) {
            return {
                success: false,
                error: ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message
            };
        }
    }
    async getMemory(params) {
        var _a;
        try {
            const response = await this.client.get(`/memories/${params.memory_id}/`);
            return {
                success: true,
                memory: response.data
            };
        }
        catch (error) {
            return {
                success: false,
                error: ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message
            };
        }
    }
    async deleteMemory(params) {
        var _a;
        try {
            await this.client.delete(`/memories/${params.memory_id}/`);
            return {
                success: true,
                message: 'Memória deletada com sucesso'
            };
        }
        catch (error) {
            return {
                success: false,
                error: ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message
            };
        }
    }
}
// Classe wrapper para compatibilidade com agentes existentes
export class Mem0MemoryTool extends DirectMem0API {
    async add(messages, userId, agentId, metadata) {
        return this.execute({
            action: 'add',
            messages,
            user_id: userId,
            agent_id: agentId,
            metadata
        });
    }
    async search(query, userId, limit) {
        return this.execute({
            action: 'search',
            query,
            user_id: userId,
            limit
        });
    }
    async list(userId, limit) {
        return this.execute({
            action: 'list',
            user_id: userId,
            limit
        });
    }
    async delete(memoryId) {
        return this.execute({
            action: 'delete',
            memory_id: memoryId
        });
    }
}
