# 🚀 Docker MCP - Guia de Início Rápido

## Instalação em 3 Passos

### 1️⃣ Configure o ambiente
```bash
cd /root/.claude/docker-mcp
./setup.sh
```

### 2️⃣ Adicione ao Claude
```bash
claude mcp add docker-mcp -s user -- python3 /root/.claude/docker-mcp/run.py
```

### 3️⃣ Teste
No Claude, digite:
```
Liste todos os containers Docker
```

## ✅ Pronto! Agora você pode:

### 🐳 Criar containers simples
```
Crie um nginx na porta 8080
```

### 📦 Deploy com Docker Compose
```
Faça deploy de WordPress com MySQL
```

### 📊 Monitorar containers
```
Mostre os logs do container [nome]
```

### 🔍 Listar recursos
```
Liste todos os containers
```

## 💡 Comandos Úteis para Claude

| O que você quer | O que dizer ao Claude |
|----------------|----------------------|
| Servidor web | "Crie um nginx na porta 3000" |
| Banco de dados | "Crie um PostgreSQL com senha segura" |
| Aplicação completa | "Deploy WordPress com banco de dados" |
| Ver logs | "Mostre logs do container X" |
| Debugar | "Meu container X não funciona, ajude" |
| Limpar | "Remova containers parados" |

## 🆘 Problemas?

1. **Docker não encontrado**: Instale o Docker Desktop
2. **Permissão negada**: No Linux, adicione seu usuário ao grupo docker
3. **Erro no MCP**: Verifique com `claude mcp list`

## 📚 Próximos Passos

- Leia [DOCKER-MCP-DOCS.md](./DOCKER-MCP-DOCS.md) para documentação completa
- Veja [EXEMPLOS.md](./EXEMPLOS.md) para casos de uso avançados
- Execute `./setup.sh` novamente se precisar reinstalar

---
**Versão**: 0.1.0 | **Suporte**: GitHub Issues