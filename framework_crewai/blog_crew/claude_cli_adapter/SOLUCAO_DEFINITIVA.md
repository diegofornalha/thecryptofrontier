# 🎯 Solução Definitiva - Configurar Permissões no Strapi

## ✅ Descobrimos o Problema!

As permissões para o content-type "Post" não estão configuradas. Baseado na estrutura do seu Strapi, aqui estão as opções:

## 🔧 Opção 1: Via Painel Admin (Mais Fácil)

### Se você vê "Settings → Roles":
1. Vá em **Settings → Roles**
2. Clique em **Authenticated**
3. Procure por **Post** na lista
4. Marque: find, findOne, create
5. Salve

### Se você vê "Settings → API Tokens":
1. Vá em **Settings → API Tokens**
2. Encontre o token que termina em `...753cd`
3. Clique em **Edit** ou no ícone de lápis
4. Na seção de permissões:
   - Encontre **Post**
   - Marque: Read, Create
5. Salve

## 🔧 Opção 2: Via API (Se o painel não mostrar)

Criei um script para configurar via API:

```bash
cd /home/strapi/thecryptofrontier/framework_crewai/blog_crew/claude_cli_adapter
python3 configure_permissions_api.py
```

## 📝 O que procurar no Painel Admin:

Possíveis localizações:
- **Settings → Roles**
- **Settings → API Tokens → Edit Token**
- **Settings → Permissions**
- **Configurações → Funções**
- **Configurações → Tokens de API**

## 🎯 Como Saber se Funcionou:

Execute:
```bash
curl -H "Authorization: Bearer ab8697c0e78c05e854a8c9015eb8d014de93f3e04204362662276ef77d2a16fe670a7fd06da6df76c985a9cea62e5e831c5d655a4f7409d8e7067723e197df9087d8dadbd1df381c2f7b04f9e8c7eb77cb84c8a44bb7941a2f034272ad9635f377580a78febb90fe2ef9eddfcebe577183dade06167a0abbf5f60d80683753cd" https://ale-blog.agentesintegrados.com/api/posts
```

Se retornar `{"data": [], "meta": {...}}` ao invés de 404, funcionou!

## 🚀 Publicar o Artigo:

```bash
python3 publish_to_strapi.py
```

## 💡 Dica:

Se não encontrar "Users & Permissions", procure por:
- "Roles" 
- "Funções"
- "API Tokens"
- "Permissões"

O importante é encontrar onde configurar permissões para o content-type "Post"!