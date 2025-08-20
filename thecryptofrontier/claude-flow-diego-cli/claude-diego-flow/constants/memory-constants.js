"use strict";
/**
 * Constantes compartilhadas para o sistema de memória
 * Extraído para evitar dependências circulares e erros de inicialização
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryNamespaces = void 0;
// Sistema de IDs hierárquico para organização de memórias
exports.MemoryNamespaces = {
    GLOBAL: 'guardian',
    AGENT: (name) => `agent:${name.toLowerCase().replace(/\s+/g, '-')}`,
    PROJECT: (name) => `project:${name}`,
    TEAM: (name) => `team:${name}`,
    WORKFLOW: (name) => `workflow:${name}`
};
