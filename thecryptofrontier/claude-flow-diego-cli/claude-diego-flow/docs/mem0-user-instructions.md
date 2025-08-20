# 📝 Instruções Personalizadas do Usuário - Especialista Mem0

## Visão Geral

O Especialista Mem0 agora suporta **instruções personalizadas do usuário** que ficam armazenadas na própria memória do sistema. Isso permite que você configure comportamentos específicos que serão seguidos automaticamente pelo especialista.

## 🚀 Como Funciona

As instruções são:
- ✅ Armazenadas permanentemente na memória do Mem0
- ✅ Carregadas automaticamente quando o especialista inicia
- ✅ Aplicadas em todos os comandos processados
- ✅ Podem ser atualizadas a qualquer momento
- ✅ Específicas para o especialista Mem0

## 📋 Comandos Disponíveis

### 1. Definir Instruções

#### Via CLI/Guardian:
```bash
# Definir novas instruções
./guardian "mem0: definir instruções: 
- Sempre responder em português brasileiro
- Priorizar memórias de produção sobre desenvolvimento
- Fazer backup automático diariamente às 2h
- Alertar quando memórias ultrapassarem 10MB
- Categorizar automaticamente por palavras-chave"

# Ou diretamente
npx tsx src/agents/mem0-specialist-agent.ts "definir instruções: [suas instruções]"
```

#### Via API HTTP:
```bash
curl -X POST http://localhost:3006/instructions \
  -H "Content-Type: application/json" \
  -d '{
    "instructions": "- Sempre responder em português\n- Priorizar memórias críticas\n- Backup diário às 2h"
  }'
```

### 2. Ver Instruções Atuais

#### Via CLI/Guardian:
```bash
# Ver instruções configuradas
./guardian "mem0: ver instruções"
```

#### Via API HTTP:
```bash
curl http://localhost:3006/instructions
```

### 3. Remover Instruções

#### Via CLI/Guardian:
```bash
# Limpar todas as instruções
./guardian "mem0: remover instruções"
```

#### Via API HTTP:
```bash
curl -X DELETE http://localhost:3006/instructions
```

## 📚 Exemplos de Instruções

### Exemplo 1: Política de Retenção
```text
definir instruções:
- Manter memórias com tag #important indefinidamente
- Deletar memórias temporárias após 30 dias
- Arquivar memórias antigas em backup mensal
- Nunca deletar memórias de produção
```

### Exemplo 2: Comportamento de Resposta
```text
definir instruções:
- Sempre responder em português brasileiro
- Incluir estatísticas resumidas em cada resposta
- Alertar sobre uso de memória acima de 80%
- Formatar respostas em Markdown
```

### Exemplo 3: Automação
```text
definir instruções:
- Fazer backup completo todos os dias às 2h
- Executar limpeza de memórias temporárias às 3h
- Gerar relatório semanal às segundas 9h
- Sincronizar com Guardian a cada 5 minutos
- Notificar sobre erros críticos imediatamente
```

### Exemplo 4: Categorização e Tags
```text
definir instruções:
- Categorizar memórias com "docker" como "infrastructure"
- Categorizar memórias com "error" ou "bug" como "issues"
- Adicionar tag #critical em memórias com "production"
- Adicionar tag #temp em memórias de debug
- Compartilhar memórias com tag #shared com todos agentes
```

## 🔧 Instruções Avançadas

### Priorização de Memórias
```text
Prioridades de memória:
1. Critical: Nunca deletar, backup duplo
2. Production: Manter por 1 ano mínimo
3. Development: Manter por 90 dias
4. Debug/Temp: Deletar após 7 dias
```

### Regras de Limpeza
```text
Executar limpeza quando:
- Espaço usado > 1GB
- Memórias duplicadas detectadas
- Memórias sem categoria > 100
- Memórias antigas sem acesso > 180 dias
```

### Integrações
```text
Integrar com outros agentes:
- Compartilhar erros críticos com Docker Specialist
- Enviar configs para Strapi Specialist
- Sincronizar deploys com CI/CD Specialist
```

## 🔐 Instruções de Segurança

```text
Segurança e privacidade:
- Nunca expor tokens ou senhas em logs
- Criptografar memórias com tag #sensitive
- Fazer audit log de todos os acessos
- Alertar sobre tentativas de acesso não autorizado
```

## 💡 Dicas

1. **Seja específico**: Instruções claras produzem melhores resultados
2. **Use tags**: Facilita a automação e categorização
3. **Defina horários**: Para tarefas automáticas
4. **Estabeleça limites**: Para evitar crescimento descontrolado
5. **Teste primeiro**: Valide as instruções antes de aplicar em produção

## 🔄 Ciclo de Vida

1. **Definição**: Instruções são salvas na memória
2. **Carregamento**: Ao iniciar, o especialista carrega as instruções
3. **Aplicação**: Todo comando é processado considerando as instruções
4. **Atualização**: Podem ser modificadas a qualquer momento
5. **Persistência**: Sobrevivem a reinicializações do container

## ⚠️ Limitações

- Instruções muito complexas podem afetar performance
- Algumas ações podem requerer permissões especiais
- Conflitos entre instruções devem ser evitados
- O especialista valida a viabilidade das instruções

## 🎯 Casos de Uso

### Para Desenvolvimento
```text
- Categorizar por branch/feature
- Limpar memórias de testes diariamente
- Priorizar erros de build
```

### Para Produção
```text
- Backup a cada mudança crítica
- Alertas imediatos de problemas
- Retenção estendida de logs
```

### Para Análise
```text
- Gerar relatórios detalhados
- Agrupar por padrões
- Estatísticas automáticas
```

## 📊 Monitoramento

As instruções aplicadas são logadas e você pode verificar:
- Quais instruções estão ativas
- Quando foram aplicadas
- Resultados das automações
- Conflitos ou erros

---

**Nota**: As instruções personalizadas tornam o Especialista Mem0 adaptável às suas necessidades específicas, automatizando tarefas repetitivas e garantindo consistência no gerenciamento de memórias.