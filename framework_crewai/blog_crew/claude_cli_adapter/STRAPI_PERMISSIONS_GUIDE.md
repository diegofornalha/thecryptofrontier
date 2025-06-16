# 🔧 Guia: Como Configurar Permissões no Strapi v5

## ⚠️ PROBLEMA ATUAL
- Todos os endpoints retornam 405 (Method Not Allowed)
- Isso significa que as permissões NÃO estão configuradas

## 📋 PASSO A PASSO VISUAL

### 1️⃣ Acesse o Painel Admin
```
https://ale-blog.agentesintegrados.com/admin
```

### 2️⃣ Navegue até as Permissões
```
Menu lateral → Settings → Users & Permissions → Roles
```

### 3️⃣ Clique no Role "Public"
- Procure por "Public" (não "Publico")
- Clique para editar

### 4️⃣ Encontre o Content-Type "Post"
Na seção de permissões, procure por:
- **Application** ou **API**
- Depois procure **Post** (ou o nome do seu content-type)

### 5️⃣ Marque as Permissões
Marque os checkboxes:
- ✅ **find** - Listar posts
- ✅ **findOne** - Ver um post
- ✅ **create** - Criar posts
- ❌ **update** - NÃO marque (segurança)
- ❌ **delete** - NÃO marque (segurança)

### 6️⃣ IMPORTANTE: Clique em SAVE
- Procure o botão **SAVE** (geralmente azul)
- Clique e aguarde confirmação
- Se aparecer "Policy Failed", veja abaixo

## 🚨 Se Aparecer "Policy Failed"

### Possíveis Causas:
1. **Política de Segurança**: O Strapi pode ter uma policy que impede criar posts publicamente
2. **Configuração do Server**: Pode haver restrições no servidor
3. **Versão do Strapi**: Algumas versões têm bugs com permissões

### Soluções:

#### Opção 1: Use Authenticated ao invés de Public
1. Vá em Roles → **Authenticated**
2. Marque as mesmas permissões
3. Use o API Token que você já tem

#### Opção 2: Verifique Policies Customizadas
1. No servidor, veja se existe: `/api/post/policies/`
2. Pode haver código bloqueando criação pública

#### Opção 3: Use o Admin API
```javascript
// Em vez de /api/posts, use:
POST https://ale-blog.agentesintegrados.com/content-manager/collection-types/api::post.post
```

## 🔍 Como Verificar se Funcionou

Execute este comando:
```bash
curl -X POST https://ale-blog.agentesintegrados.com/api/posts \
  -H "Content-Type: application/json" \
  -d '{"data":{"title":"Teste","content":"Teste"}}' \
  -v
```

### Resultados Esperados:
- ✅ **201 Created** = Sucesso!
- ❌ **405** = Permissões não salvas
- ❌ **403** = Permissões negadas
- ❌ **401** = Precisa autenticação

## 💡 Alternativa: Criar via Admin UI

Se a API continuar bloqueada, você pode:
1. Usar o webhook para receber os dados
2. Criar manualmente no admin
3. Ou implementar uma solução server-side

## 📝 Próximos Passos

1. **Tente configurar as permissões novamente**
2. **Se falhar, me avise qual erro aparece**
3. **Podemos tentar outras abordagens**:
   - Usar o Admin API diretamente
   - Criar um plugin customizado
   - Implementar via banco de dados