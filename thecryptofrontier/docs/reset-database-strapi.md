# 🗄️ Reset de Banco de Dados - Strapi

Documentação completa para resetar os bancos de dados do projeto The Crypto Frontier.

## 📋 **Visão Geral**

Este documento descreve o processo completo para limpar/resetar os bancos de dados do Strapi, incluindo tanto o ambiente de **produção** quanto o de **desenvolvimento/preview**.

### **🏗️ Arquitetura dos Bancos**

### **Variáveis de Ambiente**

#### **Frontend - Estrutura de Ambientes**
```bash
# .env (base - configurações comuns)
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-SFGD9XKTLD
REDIS_HOST=redis
REDIS_PORT=6379

# .env.preview (desenvolvimento/preview)
NEXT_PUBLIC_STRAPI_URL=https://ale-blog-preview.agentesintegrados.com
NEXT_PUBLIC_STRAPI_API_TOKEN=[preview_token]
# Algolia desenvolvimento, etc.

# .env.production (produção)
NEXT_PUBLIC_STRAPI_URL=https://ale-blog.agentesintegrados.com
NEXT_PUBLIC_STRAPI_API_TOKEN=[production_token]
NODE_ENV=production
PORT=3000
```

#### **Mapeamento de Ambientes**
```
🟡 PREVIEW/DESENVOLVIMENTO
├── Frontend: .env.preview
├── Strapi: ale-blog-preview.agentesintegrados.com (porta 1340)
├── PostgreSQL: postgres-strapi-dev
└── Uso: Testes e desenvolvimento

🟢 PRODUÇÃO
├── Frontend: .env.production  
├── Strapi: ale-blog.agentesintegrados.com (porta 1339)
├── PostgreSQL: ale-blog-postgres
└── Uso: Site público
```

---

## ⚠️ **AVISOS IMPORTANTES**

- **🔥 ATENÇÃO**: Este processo remove **TODOS** os dados dos bancos
- **📝 Posts**: Todos os artigos serão apagados
- **👤 Usuários**: Administradores serão removidos  
- **⚙️ Configurações**: Todas as configurações personalizadas serão perdidas
- **🔄 Irreversível**: Não há como desfazer após a execução

---

## 🛠️ **Processo de Reset**

### **1️⃣ Identificar Containers Ativos**

```bash
# Verificar containers do Strapi rodando
docker ps | grep strapi

# Verificar containers do PostgreSQL
docker ps | grep postgres
```

**Resultado esperado:**
- `ale-blog-strapi-v5` (produção)
- `strapi-v5-dev-preview` (desenvolvimento)
- `ale-blog-postgres` (banco produção)
- `postgres-strapi-dev` (banco desenvolvimento)

### **2️⃣ Parar Containers Strapi**

```bash
# Parar ambos os containers Strapi para evitar conflitos
docker stop ale-blog-strapi-v5 strapi-v5-dev-preview
```

**Por que parar?**
- Evita conflitos durante limpeza do banco
- Previne corrupção de dados
- Garante que nenhuma transação esteja em andamento

### **3️⃣ Reset do Banco de PRODUÇÃO**

```bash
# Conectar no PostgreSQL de produção e limpar todas as tabelas
docker exec -i ale-blog-postgres psql -U strapi -d strapi -c "
DO \$\$ 
DECLARE r RECORD; 
BEGIN 
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP 
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE'; 
    END LOOP; 
END \$\$;"
```

**O que faz:**
- Conecta no banco `strapi` como usuário `strapi`
- Lista todas as tabelas do schema `public`
- Remove cada tabela com `CASCADE` (remove dependências)
- Processo dinâmico que funciona independente do número de tabelas

### **4️⃣ Reset do Banco de DESENVOLVIMENTO**

```bash
# Conectar no PostgreSQL de desenvolvimento e limpar todas as tabelas
docker exec -i postgres-strapi-dev psql -U strapi_dev -d strapi_dev -c "
DO \$\$ 
DECLARE r RECORD; 
BEGIN 
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP 
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE'; 
    END LOOP; 
END \$\$;"
```

**Diferenças:**
- Container: `postgres-strapi-dev`
- Usuário: `strapi_dev`
- Database: `strapi_dev`

### **5️⃣ Reiniciar Containers Strapi**

```bash
# Reiniciar ambos os containers
docker start ale-blog-strapi-v5 strapi-v5-dev-preview
```

**O que acontece:**
- Strapi detecta banco vazio
- Recria automaticamente todas as tabelas
- Reinicializa estrutura do banco
- Sistema fica pronto para novos dados

### **6️⃣ Verificar Funcionamento**

```bash
# Verificar se containers estão saudáveis
docker ps | grep strapi

# Testar APIs (devem retornar 0 posts)
curl -s https://ale-blog.agentesintegrados.com/api/posts | jq '.data | length'
curl -s https://ale-blog-preview.agentesintegrados.com/api/posts | jq '.data | length'

# Verificar logs para erros
docker logs ale-blog-strapi-v5 --tail=10
docker logs strapi-v5-dev-preview --tail=10
```

---

## 🎯 **Script Automatizado**

### **Reset Completo (Produção + Desenvolvimento)**

```bash
#!/bin/bash

echo "🔥 INICIANDO RESET COMPLETO DOS BANCOS DE DADOS"
echo "⚠️  ATENÇÃO: Todos os dados serão perdidos!"
read -p "Tem certeza? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operação cancelada"
    exit 1
fi

echo "1️⃣ Parando containers Strapi..."
docker stop ale-blog-strapi-v5 strapi-v5-dev-preview

echo "2️⃣ Limpando banco de PRODUÇÃO..."
docker exec -i ale-blog-postgres psql -U strapi -d strapi -c "
DO \$\$ 
DECLARE r RECORD; 
BEGIN 
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP 
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE'; 
    END LOOP; 
END \$\$;"

echo "3️⃣ Limpando banco de DESENVOLVIMENTO..."
docker exec -i postgres-strapi-dev psql -U strapi_dev -d strapi_dev -c "
DO \$\$ 
DECLARE r RECORD; 
BEGIN 
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP 
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE'; 
    END LOOP; 
END \$\$;"

echo "4️⃣ Reiniciando containers Strapi..."
docker start ale-blog-strapi-v5 strapi-v5-dev-preview

echo "5️⃣ Aguardando inicialização..."
sleep 30

echo "6️⃣ Verificando status..."
docker ps | grep strapi

echo "✅ RESET CONCLUÍDO COM SUCESSO!"
echo "🌐 URLs para reconfiguração:"
echo "   - Produção: https://ale-blog.agentesintegrados.com/admin"
echo "   - Preview: https://ale-blog-preview.agentesintegrados.com/admin"
```

### **Reset Apenas Produção**

```bash
#!/bin/bash

echo "🔥 RESET BANCO DE PRODUÇÃO"
read -p "Confirma reset do banco de produção? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

docker stop ale-blog-strapi-v5
docker exec -i ale-blog-postgres psql -U strapi -d strapi -c "
DO \$\$ 
DECLARE r RECORD; 
BEGIN 
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP 
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE'; 
    END LOOP; 
END \$\$;"
docker start ale-blog-strapi-v5

echo "✅ Banco de produção resetado!"
```

### **Reset Apenas Desenvolvimento**

```bash
#!/bin/bash

echo "🔥 RESET BANCO DE DESENVOLVIMENTO"
read -p "Confirma reset do banco de desenvolvimento? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

docker stop strapi-v5-dev-preview
docker exec -i postgres-strapi-dev psql -U strapi_dev -d strapi_dev -c "
DO \$\$ 
DECLARE r RECORD; 
BEGIN 
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP 
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE'; 
    END LOOP; 
END \$\$;"
docker start strapi-v5-dev-preview

echo "✅ Banco de desenvolvimento resetado!"
```

---

## 🔄 **Pós-Reset: Primeiros Passos**

### **1. Acessar Painel Admin**
- **Produção**: https://ale-blog.agentesintegrados.com/admin
- **Preview**: https://ale-blog-preview.agentesintegrados.com/admin

### **2. Criar Primeiro Usuário Admin**
- Acesse a URL do admin
- Preencha dados do super usuário
- Definir senha segura

### **3. Configurar Content Types**
- Verificar se Content Type `Post` existe
- Configurar campos necessários:
  - `title` (Text)
  - `content` (Rich Text)
  - `slug` (UID)
  - `publishedAt` (DateTime)
  - `locale` (Internationalization)

### **4. Configurar Internacionalização**
- Ativar plugin i18n
- Configurar locales:
  - `en` (English)
  - `pt-BR` (Português)
  - `es` (Español)

### **5. Configurar Permissões**
- Roles & Permissions
- Permitir acesso público à API:
  - `Post` → `find`
  - `Post` → `findOne`

---

## 🐛 **Troubleshooting**

### **Container não inicia após reset**

```bash
# Verificar logs detalhados
docker logs ale-blog-strapi-v5 --tail=50

# Verificar conexão com banco
docker exec ale-blog-postgres pg_isready -U strapi

# Reiniciar forçado
docker restart ale-blog-strapi-v5
```

### **Erro de permissão no PostgreSQL**

```bash
# Verificar usuários do banco
docker exec -i ale-blog-postgres psql -U strapi -d strapi -c "\du"

# Recriar usuário se necessário
docker exec -i ale-blog-postgres psql -U postgres -c "
CREATE USER strapi WITH PASSWORD 'strapi123';
GRANT ALL PRIVILEGES ON DATABASE strapi TO strapi;
"
```

### **API retorna 403 após reset**

1. Acessar `/admin`
2. Settings → Roles & Permissions
3. Public role → Post → Marcar `find` e `findOne`
4. Salvar

### **Frontend não mostra posts**

```bash
# Verificar se API retorna dados
curl https://ale-blog.agentesintegrados.com/api/posts

# Verificar logs do frontend
docker logs thecryptofrontier-frontend --tail=20

# Forçar rebuild do frontend se necessário
docker restart thecryptofrontier-frontend
```

---

## 📚 **Comandos Úteis**

### **Monitoramento**
```bash
# Status de todos os containers
docker ps | grep -E "(strapi|postgres|frontend)"

# Logs em tempo real
docker logs -f ale-blog-strapi-v5

# Uso de recursos
docker stats ale-blog-strapi-v5 ale-blog-postgres
```

### **Backup antes do Reset**
```bash
# Backup do banco de produção
docker exec ale-blog-postgres pg_dump -U strapi strapi > backup_prod_$(date +%Y%m%d_%H%M%S).sql

# Backup do banco de desenvolvimento  
docker exec postgres-strapi-dev pg_dump -U strapi_dev strapi_dev > backup_dev_$(date +%Y%m%d_%H%M%S).sql
```

### **Restaurar do Backup**
```bash
# Restaurar produção
docker exec -i ale-blog-postgres psql -U strapi -d strapi < backup_prod_20240706_220000.sql

# Restaurar desenvolvimento
docker exec -i postgres-strapi-dev psql -U strapi_dev -d strapi_dev < backup_dev_20240706_220000.sql
```

---

## 📅 **Histórico de Execuções**

| Data | Ambiente | Motivo | Executado por | Status |
|------|----------|---------|---------------|---------|
| 2024-07-06 22:00 | Produção + Dev | Limpeza geral | Claude Agent | ✅ Sucesso |

---

## 🔗 **Links Relacionados**

- [Documentação Strapi v5](https://docs.strapi.io/dev-docs/migration-guides/v4-to-v5)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)

---

**📝 Documento criado em: 06/07/2024**
**🔄 Última atualização: 06/07/2024**
**👤 Criado por: Claude Agent** 