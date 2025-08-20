# 🚀 Guia de Atualização do Strapi V5

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Backup](#backup)
3. [Verificação da Versão Atual](#verificação-da-versão-atual)
4. [Atualização](#atualização)
5. [Reconstrução dos Containers](#reconstrução-dos-containers)
6. [Verificação Final](#verificação-final)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

Antes de começar, certifique-se de que:
- ✅ Você tem acesso SSH ao servidor
- ✅ Docker e Docker Compose estão instalados
- ✅ Você tem permissões para executar comandos Docker
- ✅ Os containers estão funcionando corretamente

---

## 💾 Backup

### 1. Backup do Banco de Dados

```bash
# Backup da produção
docker exec ale-blog-postgres pg_dump -U strapi strapi > backup-producao-$(date +%Y%m%d_%H%M%S).sql

# Backup do desenvolvimento
docker exec postgres-strapi-dev pg_dump -U strapi_dev strapi_dev > backup-dev-$(date +%Y%m%d_%H%M%S).sql
```

### 2. Backup do Código

```bash
# Backup do código fonte
cd /home/strapi/thecryptofrontier
tar -czf backup-strapi-v5-$(date +%Y%m%d_%H%M%S).tar.gz strapi-v5-new/
```

---

## 🔍 Verificação da Versão Atual

### 1. Verificar versão no package.json

```bash
cd /home/strapi/thecryptofrontier/strapi-v5-new
cat package.json | grep -A 5 -B 5 "@strapi/strapi"
```

### 2. Verificar containers em execução

```bash
docker ps --filter "name=strapi" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

---

## 🆙 Atualização

### 1. Navegue até o diretório do projeto

```bash
cd /home/strapi/thecryptofrontier/strapi-v5-new
```

### 2. Opção A: Atualização Automática (Recomendada)

```bash
# Verificar se há atualizações disponíveis
npx @strapi/upgrade latest --dry

# Aplicar a atualização
npx @strapi/upgrade latest
```

### 3. Opção B: Atualização Manual

```bash
# Atualizar pacotes principais do Strapi
npm update @strapi/strapi @strapi/plugin-users-permissions @strapi/plugin-cloud

# Ou atualizar tudo
npm update
```

### 4. Verificar se a atualização foi aplicada

```bash
cat package.json | grep -A 3 -B 3 "@strapi/strapi"
```

---

## 🔄 Reconstrução dos Containers

### 1. Atualizar Container de Produção

```bash
# Parar o container de produção
docker compose -f docker-compose.yml down

# Reconstruir e iniciar
docker compose -f docker-compose.yml up -d --build
```

### 2. Atualizar Container de Desenvolvimento

```bash
# Parar o container de desenvolvimento
docker compose -f docker-compose.dev.yml down

# Reconstruir e iniciar
docker compose -f docker-compose.dev.yml up -d --build
```

### 3. Aguardar Inicialização

```bash
# Aguardar containers ficarem saudáveis
sleep 30
docker ps --filter "name=strapi" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

---

## ✅ Verificação Final

### 1. Verificar Status dos Containers

```bash
docker ps --filter "name=strapi" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**Resultado esperado:**
```
NAMES                   STATUS                    PORTS
strapi-v5-dev-preview   Up X minutes (healthy)    0.0.0.0:1340->1337/tcp
postgres-strapi-dev     Up X minutes (healthy)    0.0.0.0:5434->5432/tcp
ale-blog-strapi-v5      Up X minutes (healthy)    0.0.0.0:1339->1337/tcp
```

### 2. Testar URLs

```bash
# Testar produção
curl -I https://ale-blog.agentesintegrados.com/admin

# Testar desenvolvimento
curl -I https://ale-blog-preview.agentesintegrados.com/admin
```

**Resultado esperado:**
```
HTTP/2 200 
x-powered-by: Strapi <strapi.io>
```

### 3. Verificar Logs

```bash
# Logs da produção
docker logs ale-blog-strapi-v5 --tail=10

# Logs do desenvolvimento
docker logs strapi-v5-dev-preview --tail=10
```

---

## 🛠️ Troubleshooting

### Container não inicia

```bash
# Verificar logs detalhados
docker logs [nome-do-container] --follow

# Verificar se as portas estão livres
netstat -tlnp | grep :1339
netstat -tlnp | grep :1340
```

### Erro de permissão

```bash
# Corrigir permissões
sudo chown -R strapi:strapi /home/strapi/thecryptofrontier/strapi-v5-new
```

### Problemas de banco de dados

```bash
# Verificar conexão com banco
docker exec ale-blog-postgres psql -U strapi -d strapi -c "SELECT version();"
docker exec postgres-strapi-dev psql -U strapi_dev -d strapi_dev -c "SELECT version();"
```

### Rollback (se necessário)

```bash
# Parar containers
docker compose -f docker-compose.yml down
docker compose -f docker-compose.dev.yml down

# Restaurar backup do código
cd /home/strapi/thecryptofrontier
tar -xzf backup-strapi-v5-[timestamp].tar.gz

# Restaurar backup do banco
docker exec ale-blog-postgres psql -U strapi -d strapi < backup-producao-[timestamp].sql
```

---

## 🎯 Configurações Específicas

### URLs do Ambiente

| Ambiente | Container | URL |
|----------|-----------|-----|
| **Produção** | `ale-blog-strapi-v5` | https://ale-blog.agentesintegrados.com/ |
| **Preview/Dev** | `strapi-v5-dev-preview` | https://ale-blog-preview.agentesintegrados.com/ |

### Portas

| Serviço | Porta Externa | Porta Interna |
|---------|---------------|---------------|
| Strapi Produção | 1339 | 1337 |
| Strapi Desenvolvimento | 1340 | 1337 |
| PostgreSQL Produção | - | 5432 |
| PostgreSQL Desenvolvimento | 5434 | 5432 |

---

## 📝 Notas Importantes

1. **Sempre faça backup** antes de atualizar
2. **Teste primeiro no ambiente de desenvolvimento**
3. **Verifique os logs** após a atualização
4. **Mantenha os containers saudáveis** (status healthy)
5. **Para atualizações major**, consulte o changelog oficial

---

## 🔗 Links Úteis

- [Strapi Documentation](https://docs.strapi.io/)
- [Strapi Releases](https://github.com/strapi/strapi/releases)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

## 📅 Histórico de Atualizações

| Data | Versão Anterior | Versão Nova | Notas |
|------|-----------------|-------------|-------|
| 2025-07-06 | 5.16.0 | 5.17.0 | Adicionados campos condicionais no content-manager |

---

**⚠️ Lembre-se:** Sempre teste em ambiente de desenvolvimento antes de aplicar em produção! 