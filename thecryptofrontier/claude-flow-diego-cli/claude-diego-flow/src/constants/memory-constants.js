/**
 * Constantes compartilhadas para o sistema de memória
 * Extraído para evitar dependências circulares e erros de inicialização
 */
// Sistema de IDs hierárquico para organização de memórias
export const MemoryNamespaces = {
    GLOBAL: 'guardian',
    AGENT: (name) => `agent:${name.toLowerCase().replace(/\s+/g, '-')}`,
    PROJECT: (name) => `project:${name}`,
    TEAM: (name) => `team:${name}`,
    WORKFLOW: (name) => `workflow:${name}`
};
