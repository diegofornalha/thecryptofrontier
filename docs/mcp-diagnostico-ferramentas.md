# Diagnóstico MCP - Apenas Uma Ferramenta Visível

## Problema Identificado

O MCP estava mostrando apenas a ferramenta `test_memory` ao invés de todas as ferramentas registradas.

## Causa Raiz

O arquivo `run.sh` estava executando o servidor simplificado (`simple-mcp-server.js`) ao invés do servidor principal (`index.js`).

### Arquivo Incorreto: `/claude-flow-diego/mcp-diego-tools/run.sh`
```bash
# Estava assim:
exec node build/simple-mcp-server.js

# Deveria ser:
exec node build/index.js
```

O `simple-mcp-server.ts` é um servidor de teste que registra apenas uma ferramenta básica para debug.

## Ferramentas Registradas no Sistema

O arquivo `/claude-flow-diego/mcp-diego-tools/src/core/factory.ts` registra 13 ferramentas:

### Ferramentas Puppeteer (5)
1. `puppeteer_navigate` - Navegar para uma URL
2. `puppeteer_screenshot` - Tirar screenshot da página
3. `puppeteer_click` - Clicar em um elemento
4. `puppeteer_type` - Digitar texto em um elemento
5. `puppeteer_get_content` - Obter conteúdo HTML da página

### Ferramentas Mem0 (4)
6. `mem0_add_memory` - Adicionar memória ao Mem0
7. `mem0_search_memory` - Buscar memórias no Mem0
8. `mem0_list_memories` - Listar todas memórias de um usuário
9. `mem0_delete_memories` - Deletar memórias do Mem0

### Ferramentas Guardian (4)
10. `guardian_analyze` - Analisar organização do projeto
11. `guardian_status` - Status do serviço Guardian
12. `guardian_history` - Histórico de análises
13. `guardian_health` - Verificar saúde do serviço

## Solução Aplicada

### 1. Correção do run.sh
Alterado para executar o servidor principal com todas as ferramentas.

### 2. Configuração do Claude Desktop
Criado script `/scripts/setup-claude-mcp.sh` que:
- Configura o `diego-tools` no Claude Desktop
- Mantém o `desktop-commander` existente
- Define variáveis de ambiente apropriadas

### 3. Nova Configuração
```json
{
  "mcpServers": {
    "diego-tools": {
      "command": "bash",
      "args": ["/home/strapi/thecryptofrontier/claude-flow-diego/mcp-diego-tools/run.sh"],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "INFO"
      }
    },
    "desktop-commander": {
      "command": "npx",
      "args": [
        "-y",
        "@smithery/cli@latest",
        "run",
        "@wonderwhy-er/desktop-commander",
        "--key",
        "8f573867-52c3-46bb-993e-fb65291459b2"
      ]
    }
  }
}
```

## Próximos Passos

1. **Reiniciar Claude Desktop** - Necessário para carregar a nova configuração
2. **Verificar Ferramentas** - Após reiniciar, todas as 13 ferramentas devem aparecer
3. **Corrigir Erros de Build** - Há erros TypeScript no `mcp-http-bridge.ts` que precisam ser resolvidos

## Comandos de Verificação

```bash
# Testar servidor diretamente
cd /home/strapi/thecryptofrontier/claude-flow-diego/mcp-diego-tools
./run.sh

# Ver configuração atual
cat ~/.config/Claude/claude_desktop_config.json | jq

# Reconfigurar se necessário
/home/strapi/thecryptofrontier/scripts/setup-claude-mcp.sh
```

## Status Final

✅ Problema identificado: Servidor errado sendo executado
✅ Correção aplicada: `run.sh` atualizado
✅ Configuração criada: Claude Desktop configurado com diego-tools
⚠️ Pendente: Reiniciar Claude Desktop para aplicar mudanças