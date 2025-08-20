# 🛠️ Scripts de Reset - Banco de Dados Strapi

Coleção de scripts para gerenciar e resetar os bancos de dados do projeto The Crypto Frontier.

## 📁 **Scripts Disponíveis**

### **🔥 Reset Completo**
```bash
./scripts/reset-database-complete.sh
```
- **Função**: Reseta TODOS os bancos (produção + desenvolvimento)
- **Uso**: Limpeza completa do sistema
- **⚠️ CUIDADO**: Remove todos os dados de ambos os ambientes

### **🟢 Reset Produção**
```bash
./scripts/reset-database-production.sh
```
- **Função**: Reseta APENAS o banco de produção
- **Uso**: Limpeza do ambiente live
- **⚠️ CUIDADO**: Remove todos os posts do site

### **🟡 Reset Desenvolvimento**
```bash
./scripts/reset-database-development.sh
```
- **Função**: Reseta APENAS o banco de desenvolvimento/preview
- **Uso**: Limpeza do ambiente de testes
- **💡 SEGURO**: Não afeta produção

### **💾 Backup**
```bash
./scripts/backup-database.sh
```
- **Função**: Cria backup dos bancos antes de resetar
- **Uso**: Segurança antes de mudanças
- **📁 Saída**: Arquivos `.sql` na pasta `backups/`

---

## 🚀 **Como Usar**

### **1. Backup Antes do Reset (RECOMENDADO)**

```bash
# Sempre faça backup primeiro!
./scripts/backup-database.sh
```

### **2. Escolher Tipo de Reset**

```bash
# Opção A: Reset completo (produção + desenvolvimento)
./scripts/reset-database-complete.sh

# Opção B: Apenas produção
./scripts/reset-database-production.sh

# Opção C: Apenas desenvolvimento
./scripts/reset-database-development.sh
```

### **3. Reconfigurar Strapi**

Após o reset, acesse:
- **Produção**: https://ale-blog.agentesintegrados.com/admin
- **Preview**: https://ale-blog-preview.agentesintegrados.com/admin

---

## 📊 **Arquitetura dos Bancos**

```
🏗️ INFRAESTRUTURA

📊 PRODUÇÃO (ale-blog.agentesintegrados.com)
├── Strapi: ale-blog-strapi-v5 (porta 1339)
├── PostgreSQL: ale-blog-postgres
└── Site: thecryptofrontier.agentesintegrados.com

📊 DESENVOLVIMENTO (ale-blog-preview.agentesintegrados.com)
├── Strapi: strapi-v5-dev-preview (porta 1340)
├── PostgreSQL: postgres-strapi-dev (porta 5434)
└── Uso: Testes e desenvolvimento
```

---

## 🔄 **Fluxo de Reset**

```
1. 💾 BACKUP
   └── backup-database.sh

2. 🔥 RESET
   ├── reset-database-complete.sh (tudo)
   ├── reset-database-production.sh (só produção)
   └── reset-database-development.sh (só desenvolvimento)

3. ⚙️ RECONFIGURAÇÃO
   ├── Acessar /admin
   ├── Criar usuário admin
   ├── Configurar Content Types
   ├── Definir permissões
   └── Configurar i18n (en, pt-BR, es)
```

---

## 🛡️ **Segurança e Validações**

### **✅ Validações Automáticas**
- Confirmação manual antes de executar
- Verificação de containers ativos
- Teste de APIs após reset
- Relatório de status completo

### **⚠️ Avisos de Segurança**
- **IRREVERSÍVEL**: Dados deletados não podem ser recuperados
- **CONFIRMAÇÂO MANUAL**: Todos os scripts pedem confirmação
- **BACKUP RECOMENDADO**: Sempre fazer backup antes

### **🔍 Verificações Pós-Reset**
- Status dos containers Docker
- Resposta das APIs
- Contagem de posts (deve ser 0)
- URLs de acesso admin

---

## 📚 **Comandos de Emergência**

### **Verificar Status**
```bash
# Status dos containers
docker ps | grep -E "(strapi|postgres)"

# Logs em tempo real
docker logs -f ale-blog-strapi-v5
docker logs -f strapi-v5-dev-preview

# Testar APIs
curl https://ale-blog.agentesintegrados.com/api/posts
curl https://ale-blog-preview.agentesintegrados.com/api/posts
```

### **Forçar Reinicialização**
```bash
# Reiniciar produção
docker restart ale-blog-strapi-v5

# Reiniciar desenvolvimento
docker restart strapi-v5-dev-preview

# Reiniciar bancos
docker restart ale-blog-postgres postgres-strapi-dev
```

### **Restaurar do Backup**
```bash
# Parar Strapi primeiro
docker stop ale-blog-strapi-v5

# Restaurar banco de produção
docker exec -i ale-blog-postgres psql -U strapi -d strapi < backups/backup_production_YYYYMMDD_HHMMSS.sql

# Reiniciar Strapi
docker start ale-blog-strapi-v5
```

---

## 🐛 **Troubleshooting**

### **Container não inicia**
```bash
# Verificar logs detalhados
docker logs ale-blog-strapi-v5 --tail=50

# Verificar saúde do banco
docker exec ale-blog-postgres pg_isready -U strapi

# Reiniciar forçado
docker restart ale-blog-strapi-v5
```

### **Erro de permissão PostgreSQL**
```bash
# Verificar usuários
docker exec -i ale-blog-postgres psql -U strapi -d strapi -c "\du"

# Recriar usuário se necessário
docker exec -i ale-blog-postgres psql -U postgres -c "
CREATE USER strapi WITH PASSWORD 'strapi123';
GRANT ALL PRIVILEGES ON DATABASE strapi TO strapi;
"
```

### **API retorna 403**
1. Acessar painel admin
2. Settings → Roles & Permissions
3. Public role → Post → Marcar `find` e `findOne`
4. Salvar alterações

---

## 📅 **Histórico de Execuções**

| Data | Script | Ambiente | Status | Observações |
|------|--------|----------|--------|-------------|
| 2024-07-06 | reset-complete | Prod + Dev | ✅ Sucesso | Limpeza inicial |

---

## 🔗 **Links Úteis**

- 📖 [Documentação Completa](../docs/reset-database-strapi.md)
- 🌐 [Painel Admin Produção](https://ale-blog.agentesintegrados.com/admin)
- 🧪 [Painel Admin Preview](https://ale-blog-preview.agentesintegrados.com/admin)
- 🚀 [Site Frontend](https://thecryptofrontier.agentesintegrados.com/)

---

**📝 Criado em: 06/07/2024**  
**👤 Autor: Claude Agent**  
**🔄 Última atualização: 06/07/2024** 