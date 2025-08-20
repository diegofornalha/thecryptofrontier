/**
 * Mem0 tool handlers - Local implementation
 */
import { config } from '../../config/index.js';
import { successResponse } from '../../utils.js';
// Interface não utilizada removida
// Cliente HTTP simples para o mem0-bridge
async function callMem0Bridge(endpoint, method = 'GET', body) {
    const baseUrl = config.mem0.baseUrl || 'http://localhost:3002';
    const url = `${baseUrl}${endpoint}`;
    const options = {
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
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Erro ao conectar com mem0-bridge: ${errorMessage}`);
    }
}
export async function handleAddMemory(params) {
    const response = await callMem0Bridge('/memories', 'POST', {
        content: params.content,
        user_id: params.user_id,
        metadata: params.metadata,
        tags: params.tags,
        category: params.category
    });
    return successResponse(response.data, 'Memória adicionada com sucesso');
}
export async function handleSearchMemory(params) {
    var _a, _b, _c;
    const queryParams = new URLSearchParams({
        query: params.query,
        user_id: params.user_id,
        limit: ((_a = params.limit) === null || _a === void 0 ? void 0 : _a.toString()) || '10'
    });
    if (params.filters) {
        queryParams.append('filters', JSON.stringify(params.filters));
    }
    const response = await callMem0Bridge(`/memories/search?${queryParams}`, 'GET');
    return successResponse(response.data, `Encontradas ${((_c = (_b = response.data) === null || _b === void 0 ? void 0 : _b.results) === null || _c === void 0 ? void 0 : _c.length) || 0} memórias`);
}
export async function handleListMemories(params) {
    var _a, _b, _c;
    const queryParams = new URLSearchParams({
        user_id: params.user_id,
        limit: ((_a = params.limit) === null || _a === void 0 ? void 0 : _a.toString()) || '50'
    });
    const response = await callMem0Bridge(`/memories?${queryParams}`, 'GET');
    return successResponse(response.data, `Listadas ${((_c = (_b = response.data) === null || _b === void 0 ? void 0 : _b.memories) === null || _c === void 0 ? void 0 : _c.length) || 0} memórias`);
}
export async function handleDeleteMemories(params) {
    const endpoint = params.memory_id
        ? `/memories/${params.memory_id}?user_id=${params.user_id}`
        : `/memories?user_id=${params.user_id}`;
    const response = await callMem0Bridge(endpoint, 'DELETE');
    return successResponse(response.data, params.memory_id
        ? 'Memória deletada com sucesso'
        : 'Todas as memórias do usuário foram deletadas');
}
