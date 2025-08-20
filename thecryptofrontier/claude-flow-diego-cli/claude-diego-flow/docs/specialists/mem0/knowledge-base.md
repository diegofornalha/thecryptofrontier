# Documentação do Especialista Mem0

## 📋 Informações Básicas
- **Nome do Especialista**: Mem0 Specialist
- **ID**: mem0-specialist
- **Documentação Base**: https://docs.mem0.ai
- **Versão**: 1.0.0

## 🎯 Propósito
O Mem0 Specialist é responsável por gerenciar todo o sistema de memórias persistentes do projeto. Ele mantém, organiza e otimiza as memórias compartilhadas entre todos os agentes, garantindo que o conhecimento seja preservado e facilmente acessível.

## 🔧 Capacidades
- Gerenciamento completo de memórias (CRUD)
- Busca semântica e contextual
- Categorização e organização automática
- Monitoramento de saúde dos serviços
- Backup e restauração de dados
- Análise e estatísticas de uso
- Interface simplificada para outros agentes
- Limpeza e manutenção automática
- Sincronização entre agentes

## 📚 Base de Conhecimento

### Conceitos Fundamentais

1. **Sistema Mem0**
   - **Definição**: Plataforma de memória persistente que permite aos agentes armazenar e recuperar contexto
   - **Componentes**:
     - Qdrant: Vector database para busca semântica
     - PostgreSQL: Armazenamento de metadados
     - Redis: Cache e sessões
     - Mem0 API: Interface REST
     - Mem0 Bridge: Integração MCP
   - **Melhores práticas**:
     - Categorizar todas as memórias
     - Usar tags descritivas
     - Limpar memórias antigas regularmente
     - Fazer backups periódicos

2. **Memórias**
   - **Definição**: Unidades de conhecimento armazenadas no sistema
   - **Propriedades**:
     - content: Conteúdo textual
     - user_id: Identificador do agente/usuário
     - category: Categoria da memória
     - tags: Etiquetas para busca
     - metadata: Dados adicionais
   - **Tipos**:
     - Conversação: Diálogos e contexto
     - Conhecimento técnico: Informações específicas
     - Configurações: Preferências e settings
     - Logs: Registros de atividades

3. **Namespaces**
   - **Definição**: Espaços isolados para diferentes contextos
   - **Padrões**:
     - `agent/{agent-id}`: Memórias específicas de agentes
     - `user/{user-id}`: Memórias de usuários
     - `shared`: Memórias compartilhadas
     - `system`: Memórias do sistema

### Padrões e Práticas

- **Categorização**: Sempre categorizar memórias para facilitar busca e organização
- **Tagging**: Usar tags consistentes e descritivas
- **Limpeza**: Executar limpeza mensal de memórias antigas
- **Backup**: Realizar backups semanais automáticos
- **Monitoramento**: Verificar saúde dos serviços diariamente

### Casos de Uso Comuns

1. **Armazenar Contexto de Conversa**
   ```typescript
   await mem0Service.saveConversationContext({
     agentId: 'docker-specialist',
     userMessage: 'Como otimizar meu Dockerfile?',
     agentResponse: 'Aqui estão as recomendações...'
   });
   ```

2. **Buscar Conhecimento Relacionado**
   ```typescript
   const knowledge = await mem0Service.findRelatedKnowledge('docker optimization');
   ```

3. **Compartilhar Memória entre Agentes**
   ```typescript
   await mem0Service.shareMemoryBetweenAgents({
     fromAgent: 'docker-specialist',
     toAgent: 'devops-specialist',
     memoryId: 'mem-123',
     reason: 'Conhecimento relevante sobre CI/CD'
   });
   ```

## 🛠️ Ferramentas e Integrações

- **MCP Client**: Comunicação com serviços externos
- **Mem0 Bridge API**: Interface REST para operações de memória
- **Docker CLI**: Monitoramento de containers
- **PostgreSQL Client**: Operações diretas no banco
- **Redis CLI**: Gerenciamento de cache

## 📊 Métricas de Sucesso

- **Taxa de Hit de Cache**: > 80% das buscas devem usar cache
- **Tempo de Resposta**: < 100ms para buscas simples
- **Disponibilidade**: > 99.9% uptime dos serviços
- **Uso de Memória**: < 80% da capacidade total
- **Backups Bem-sucedidos**: 100% dos backups agendados

## 🔍 Troubleshooting

### Serviços não estão rodando
- **Sintomas**: Erro ao conectar com Mem0
- **Causa**: Containers parados
- **Solução**: 
  ```bash
  cd /home/strapi/thecryptofrontier
  docker-compose -f infrastructure-docker/docker-yml/docker-compose.mem0.yml up -d
  ```

### Memórias não são encontradas
- **Sintomas**: Buscas retornam vazias
- **Causa**: Índices não atualizados ou query incorreta
- **Solução**:
  1. Verificar se Qdrant está rodando
  2. Reindexar memórias se necessário
  3. Ajustar query de busca

### Alto uso de disco
- **Sintomas**: Aviso de disco cheio
- **Causa**: Muitas memórias antigas ou backups acumulados
- **Solução**:
  1. Executar limpeza de memórias antigas
  2. Remover backups antigos
  3. Compactar dados se possível

### Falha no backup
- **Sintomas**: Backup não completa
- **Causa**: Falta de espaço ou permissões
- **Solução**:
  1. Verificar espaço em disco
  2. Verificar permissões do diretório
  3. Executar backup manual

## 📖 Recursos Adicionais

- [Documentação Oficial Mem0](https://docs.mem0.ai)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Redis Best Practices](https://redis.io/docs/manual/)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)

## 🔄 Histórico de Aprendizado

- **2024-01-15**: Implementado sistema de categorização automática baseado em conteúdo
- **2024-01-16**: Adicionado monitoramento de saúde com alertas proativos
- **2024-01-17**: Criado serviço auxiliar para integração simplificada
- **2024-01-18**: Implementado backup incremental para otimizar espaço