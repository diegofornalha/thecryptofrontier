/**
 * Constantes compartilhadas para o sistema de memória
 * Extraído para evitar dependências circulares e erros de inicialização
 */

// Sistema de IDs hierárquico para organização de memórias
export const MemoryNamespaces = {
  GLOBAL: 'guardian',
  AGENT: (name: string) => `agent:${name.toLowerCase().replace(/\s+/g, '-')}`,
  PROJECT: (name: string) => `project:${name}`,
  TEAM: (name: string) => `team:${name}`,
  WORKFLOW: (name: string) => `workflow:${name}`
} as const;