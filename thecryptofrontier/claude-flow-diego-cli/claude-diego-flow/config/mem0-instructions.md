# Instruções Personalizadas para o Especialista Mem0

## Instruções do Usuário

<!-- 
Adicione suas instruções personalizadas aqui. O especialista mem0 seguirá estas diretrizes ao processar comandos e gerenciar memórias.

Exemplos de instruções que você pode adicionar:
- Políticas de retenção de memórias
- Categorias personalizadas
- Regras de limpeza automática
- Formatos de resposta preferidos
- Integrações específicas
-->

### Políticas de Memória

1. **Retenção de Dados**
   - Manter memórias importantes indefinidamente
   - Memórias temporárias devem ser limpas após 30 dias
   - Logs de debug devem ser removidos após 7 dias

2. **Categorização Automática**
   - Memórias sobre configuração devem ir para categoria "config"
   - Memórias sobre erros devem ir para categoria "errors"
   - Memórias sobre deployments devem ir para categoria "deploy"

3. **Priorização**
   - Memórias marcadas como "critical" têm prioridade máxima
   - Memórias de produção têm prioridade sobre desenvolvimento
   - Memórias com tags de segurança devem ser protegidas

### Comportamento do Especialista

1. **Respostas**
   - Sempre responder em português brasileiro
   - Ser conciso mas completo nas explicações
   - Incluir exemplos quando relevante

2. **Monitoramento**
   - Alertar imediatamente sobre problemas críticos
   - Gerar relatórios semanais automaticamente
   - Fazer backup diário às 2h da manhã

3. **Integrações**
   - Sincronizar com Guardian a cada 5 minutos
   - Compartilhar memórias relevantes com outros especialistas
   - Notificar sobre mudanças importantes

### Sistema de Roteamento de Memórias

O Guardian agora implementa um sistema inteligente de roteamento que analisa o conteúdo de cada memória e a direciona automaticamente para o agente especialista apropriado:

1. **Como funciona**
   - O Guardian analisa palavras-chave e contexto de cada memória
   - Compara com padrões definidos para cada especialista
   - Roteia automaticamente para o agente mais apropriado
   - Registra a decisão de roteamento nos metadados

2. **Agentes e seus domínios**
   - **Docker Specialist**: Docker, containers, compose, imagens, volumes, networks
   - **Strapi Specialist**: CMS, content-types, APIs, webhooks, controllers, models
   - **NextJS Specialist**: Frontend, React, componentes, SSR/SSG, páginas, rotas
   - **Cleanup Specialist**: Limpeza, manutenção, otimização, cache, temporários
   - **Claude Code Specialist**: CLI, MCP, ferramentas, automação, scripts
   - **Mem0 Specialist**: Memórias gerais, coordenação, sistema, padrão

3. **Metadados de roteamento**
   Cada memória salva inclui informações de roteamento:
   ```json
   {
     "routing": {
       "targetAgent": "docker-specialist",
       "reason": "Roteia memórias relacionadas a Docker e containerização",
       "confidence": 0.85,
       "matchedRule": "docker-routing"
     }
   }
   ```

4. **Prioridades de roteamento**
   - **Prioridade 1**: Docker, Strapi, NextJS (especialistas principais)
   - **Prioridade 2**: Cleanup, Claude Code (especialistas secundários)
   - **Prioridade 3**: Mem0 (sistema de memória)
   - **Prioridade 5**: Geral/Coordenação (padrão)

5. **Configuração de roteamento**
   - Arquivo: `/config/guardian-memory-routing.json`
   - Estratégia de conflito: maior prioridade vence
   - Confiança mínima: 70% de correspondência
   - Análise case-insensitive

### Regras Customizadas

<!-- Adicione suas próprias regras aqui -->

### Tags Especiais

- `#important` - Nunca deletar
- `#temp` - Deletar após 24h
- `#shared` - Compartilhar com todos os agentes
- `#private` - Não compartilhar
- `#backup` - Incluir em todos os backups

### Comandos Personalizados

<!-- 
Você pode definir comandos personalizados que o especialista reconhecerá:

Exemplo:
- "relatório semanal" - Gera relatório detalhado da semana
- "limpeza agressiva" - Remove todas as memórias temporárias
- "backup completo" - Faz backup incluindo logs
-->

---

**Nota**: Este arquivo é carregado automaticamente pelo especialista mem0 ao iniciar. Mudanças aqui serão aplicadas no próximo restart do container.