# Guardian Cleanup Service - Serviço de Limpeza Automática

## 🎯 Problema Identificado

O Claude Code frequentemente cria arquivos de teste temporários durante o desenvolvimento e não os remove após concluir as tarefas. Isso resulta em:

- Arquivos `test-*.js` e `test-*.ts` espalhados pelo projeto
- Arquivos na raiz que deveriam estar em pastas específicas
- Arquivos temporários `.bak`, `.tmp` que se acumulam
- Desorganização geral do projeto

## 🛡️ Solução: Guardian Cleanup Service

O Guardian agora possui um serviço integrado de limpeza automática que:

### 1. **Detecção Inteligente**
- Identifica arquivos de teste por padrões:
  - `test-*.js`, `test-*.ts`, `test*.py`
  - `*-test.js`, `*-test.ts`
  - `temp-*.js`, `tmp-*.ts`
- Localiza arquivos temporários:
  - `*.tmp`, `*.temp`, `*.bak`
  - Arquivos específicos como `processed_articles.json`

### 2. **Categorização Automática**
- **Arquivar**: Arquivos de teste na raiz ou com mais de 7 dias
- **Deletar**: Arquivos muito antigos (>30 dias) ou vazios
- **Manter**: Arquivos com TODOs, IMPORTANT ou FIXME

### 3. **Exclusões Inteligentes**
- Ignora diretórios legítimos de teste (`/tests/`, `/test/`, `/__tests__/`)
- Exclui `node_modules`, `venv`, `.git`, `dist`, `build`
- Não toca em arquivos de bibliotecas Python (`site-packages`)

## 📋 Como Usar

### Verificar Sugestões de Limpeza
```bash
curl http://localhost:3003/cleanup/suggestions
```

### Executar Limpeza (Dry Run)
```bash
curl -X POST http://localhost:3003/cleanup/execute \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}'
```

### Executar Limpeza Real
```bash
curl -X POST http://localhost:3003/cleanup/execute \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false}'
```

### Limpar Padrões Específicos
```bash
curl -X POST http://localhost:3003/cleanup/execute \
  -H "Content-Type: application/json" \
  -d '{
    "dryRun": false,
    "patterns": ["**/test-puppeteer*.js", "**/*.bak"]
  }'
```

## 🤖 Funcionamento Automático

- **Verificação Diária**: O serviço executa automaticamente a cada 24 horas
- **Modo Seguro**: Por padrão, opera em "dry run" para evitar deleções acidentais
- **Arquivamento**: Arquivos importantes são movidos para `/archived-tests/`
- **Logs**: Todas as ações são registradas para auditoria

## 📂 Estrutura de Arquivamento

Arquivos movidos mantêm sua estrutura original:
```
/archived-tests/
├── test-puppeteer.js         # Da raiz
├── test-browserless.js       # Da raiz
└── claude-flow-diego/
    └── src/
        └── test-memory.ts    # Mantém estrutura
```

## ⚙️ Configuração

O serviço pode ser configurado através de variáveis de ambiente:

- `PROJECT_PATH`: Diretório raiz do projeto (padrão: `/workspace`)
- `CLEANUP_INTERVAL`: Intervalo em horas (padrão: 24)
- `CLEANUP_DRY_RUN`: Se deve executar em modo seguro (padrão: true)

## 🔍 Status Atual

Com base na última verificação:
- 77 arquivos de teste encontrados
- 2 arquivos na raiz que devem ser movidos
- 4 arquivos temporários para deletar
- Maioria dos arquivos são de bibliotecas Python (ignorados)

## 🚀 Próximas Melhorias

1. **Notificações**: Enviar relatório após cada limpeza
2. **Configuração por Projeto**: Permitir `.cleanupignore` customizado
3. **Análise de Padrões**: Detectar novos padrões de arquivos temporários
4. **Integração com Git**: Não limpar arquivos não commitados

## 💡 Dicas para Desenvolvedores

1. Use o padrão `/tests/` ou `/test/` para testes permanentes
2. Arquivos de teste temporários devem ser prefixados com `temp-` ou `tmp-`
3. Sempre remova arquivos de teste após uso
4. Use `.gitignore` para evitar commit de arquivos temporários

---

**Guardian Cleanup Service** - Mantendo seu projeto organizado automaticamente! 🧹