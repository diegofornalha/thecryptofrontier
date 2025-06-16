# 🔧 Solução para Publicar no Strapi

## ✅ O que descobrimos:

1. **Content-Type existe**: `api::post.post`
2. **Endpoint correto**: `/api/posts` (plural)
3. **Token Full Access**: Funcionando corretamente
4. **Campos disponíveis**:
   - title (obrigatório)
   - slug
   - content
   - excerpt
   - status
   - tags
   - categories
   - seo (component)
   - author (relation)

## ❌ Problema Atual:

O endpoint `/api/posts` retorna 404, indicando que as **permissões da API não estão habilitadas**.

## 🎯 Solução - Passos no Strapi Admin:

### 1. Acessar Permissões
```
Settings → Users & Permissions Plugin → Roles
```

### 2. Configurar Role "Authenticated"
Como está usando API Token, configure o role **Authenticated**:

1. Clique em **Authenticated**
2. Encontre **Post** na lista de permissões
3. Marque as seguintes permissões:
   - ✅ find
   - ✅ findOne  
   - ✅ create
   - ✅ update (opcional)
   - ✅ delete (opcional)

### 3. Salvar Configurações
Clique em **Save** no canto superior direito

## 📝 Após Configurar:

Execute novamente:
```bash
python3 publish_to_strapi.py
```

## 🔍 Como Verificar se Funcionou:

1. Teste GET primeiro:
```bash
curl -H "Authorization: Bearer SEU_TOKEN" https://ale-blog.agentesintegrados.com/api/posts
```

Deve retornar:
```json
{
  "data": [],
  "meta": {...}
}
```

2. Se GET funcionar, o POST também funcionará!

## 💡 Dica Extra:

Se ainda retornar 404 após configurar permissões:
- Verifique se salvou as alterações
- Tente reiniciar o Strapi
- Confirme que está editando o role correto (Authenticated para API Tokens)

## 📊 Status do Artigo:

**Título**: DeFi Yield Farming em 2025: Como o Mercado de $129 Bilhões Está Revolucionando as Finanças

**Pronto para publicação** assim que as permissões forem habilitadas! 🚀