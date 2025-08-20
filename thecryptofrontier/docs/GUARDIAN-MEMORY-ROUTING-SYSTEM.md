# Sistema de Roteamento de Memórias do Guardian

## Visão Geral

O Guardian agora implementa um sistema inteligente de roteamento de memórias que analisa automaticamente o conteúdo de cada memória e a direciona para o agente especialista mais apropriado.

## Como Funciona

### 1. Análise de Conteúdo
- Quando uma memória é criada, o Guardian extrai palavras-chave de:
  - Nome da tarefa (`taskName`)
  - Tipo de memória (`type`)
  - Requisição do usuário (`context.userRequest`)
  - Especialistas envolvidos (`context.specialists`)
  - Decisões e razões (`context.decision`, `context.reason`)
  - Metadados adicionais

### 2. Correspondência de Padrões
- O sistema compara o conteúdo extraído com padrões predefinidos
- Cada agente tem uma lista de palavras-chave associadas
- A análise é case-insensitive para maior flexibilidade

### 3. Cálculo de Confiança
- Se pelo menos um padrão corresponde, a memória é considerada
- Confiança base: 70%
- Cada padrão adicional aumenta a confiança em 30%
- Máximo de 100% de confiança

### 4. Resolução de Conflitos
- Quando múltiplos agentes correspondem, o sistema usa prioridades:
  - Prioridade 1: Docker, Strapi, NextJS (especialistas principais)
  - Prioridade 2: Cleanup, Claude Code
  - Prioridade 3: Mem0
  - Prioridade 5: Geral/Coordenação

## Agentes e Domínios

### Docker Specialist
**Palavras-chave**: docker, container, compose, dockerfile, imagem, build, volume, network, registry, swarm, kubernetes, k8s

### Strapi Specialist  
**Palavras-chave**: strapi, cms, content-type, collection, api, webhook, plugin, middleware, controller, service, model, admin, graphql, rest

### NextJS Specialist
**Palavras-chave**: next, nextjs, react, frontend, component, page, route, ssr, ssg, tailwind, css, jsx, tsx, vercel, app router, pages router

### Cleanup Specialist
**Palavras-chave**: cleanup, limpeza, clean, remove, delete, manutenção, maintenance, optimization, otimização, garbage, trash, cache, temp, temporary

### Claude Code Specialist
**Palavras-chave**: claude, code, cli, mcp, ferramenta, tool, automation, automação, script, workflow

### Mem0 Specialist
**Palavras-chave**: mem0, memory, memória, remember, lembrar, save, salvar, persist, storage, database, vector, embedding, qdrant, redis

## Metadados de Roteamento

Cada memória salva inclui informações detalhadas sobre o roteamento:

```json
{
  "routing": {
    "targetAgent": "docker-specialist",
    "reason": "Roteia memórias relacionadas a Docker e containerização",
    "confidence": 0.85,
    "matchedRule": "docker-routing",
    "allMatches": [
      {
        "rule": "docker-routing",
        "confidence": 0.85
      }
    ]
  }
}
```

## Arquivos de Configuração

### 1. Configuração de Roteamento
**Arquivo**: `/claude-flow-diego-cli/claude-diego-flow/config/guardian-memory-routing.json`

Contém todas as regras de roteamento, padrões e configurações do sistema.

### 2. Sistema de Memória Atualizado
**Arquivo**: `/claude-flow-diego-cli/claude-diego-flow/core/guardian-memory-system.js`

Integra o roteador e adiciona metadados de roteamento a cada memória.

### 3. Roteador de Memórias
**Arquivo**: `/claude-flow-diego-cli/claude-diego-flow/core/guardian-memory-router.js`

Implementa a lógica de análise e decisão de roteamento.

## Exemplo de Uso

```javascript
// Quando o Guardian salva uma memória
const memory = {
  type: 'task_start',
  taskName: 'Build Docker image for production',
  context: {
    userRequest: 'Criar imagem docker otimizada',
    specialists: ['docker-specialist']
  }
};

// O sistema automaticamente:
// 1. Analisa o conteúdo
// 2. Identifica palavras "docker", "image", "build"
// 3. Roteia para docker-specialist com 100% de confiança
// 4. Adiciona metadados de roteamento
// 5. Notifica o agente alvo (futuro)
```

## Benefícios

1. **Organização Automática**: Memórias são automaticamente categorizadas
2. **Especialização**: Cada agente recebe apenas memórias relevantes
3. **Rastreabilidade**: Decisões de roteamento são registradas
4. **Flexibilidade**: Fácil adicionar novos agentes ou modificar regras
5. **Performance**: Agentes processam apenas dados relevantes

## Próximos Passos

1. Implementar notificação ativa para agentes alvo
2. Adicionar análise semântica com IA para melhor precisão
3. Dashboard para visualizar estatísticas de roteamento
4. Sistema de feedback para melhorar regras automaticamente
5. Suporte para roteamento multi-agente (memória relevante para múltiplos especialistas)

## Manutenção

### Adicionar Novo Agente
1. Editar `/config/guardian-memory-routing.json`
2. Adicionar nova regra com ID, nome, padrões e prioridade
3. Reiniciar o Guardian

### Modificar Padrões
1. Localizar a regra no arquivo de configuração
2. Adicionar/remover palavras-chave no array `patterns`
3. Ajustar prioridade se necessário
4. Salvar e reiniciar

### Monitorar Roteamento
- Logs mostram decisões de roteamento em tempo real
- Metadados nas memórias registram histórico
- Script de teste disponível em `/tests/test-memory-routing.js`