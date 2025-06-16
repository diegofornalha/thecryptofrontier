# 🎯 Solução Final - Permissões Strapi

## 📋 O Problema

O Strapi usa um sistema de permissões baseado em **Roles** (ACL - Access Control List):
- **Public**: Acesso sem autenticação
- **Authenticated**: Acesso com JWT token (login de usuário)
- **API Tokens**: Têm suas próprias configurações

## ❌ Por que não está funcionando

1. GET /api/posts retorna 404 = Permissão "find" não está habilitada
2. POST /api/posts retorna 405 = Permissão "create" não está habilitada
3. API Token está válido mas sem as permissões corretas

## ✅ SOLUÇÃO NO PAINEL ADMIN

### Opção 1: Configurar no API Token (Mais Provável)

1. **Acesse o Painel Admin**
   ```
   https://ale-blog.agentesintegrados.com/admin
   ```

2. **Vá para API Tokens**
   ```
   Settings → API Tokens
   ```

3. **Edite o token** que termina em `...defb`

4. **Configure as permissões**:
   - Encontre o content-type **Post**
   - Marque as permissões:
     - ✅ Read (ou find)
     - ✅ Create
     - ✅ Update (opcional)
     - ✅ Delete (opcional)

5. **Salve**

### Opção 2: Configurar nos Roles

1. **Vá para Roles**
   ```
   Settings → Users & Permissions Plugin → Roles
   ```

2. **Configure AMBOS os roles**:
   
   **Para "Public":**
   - Clique em Public
   - Encontre Post
   - Marque: find, findOne
   
   **Para "Authenticated":**
   - Clique em Authenticated
   - Encontre Post
   - Marque: find, findOne, create, update

3. **Salve cada role**

## 🔍 Como Verificar se Funcionou

Execute este comando:
```bash
curl -X POST \
  -H "Authorization: Bearer 87e5f7e4c6917d39415f669f077cafa528e26c3aff065206805c82daa7e6ede2941bb783992ab6a8fc0f31f45b239dce9915b8a161d41ff312529464da6f9501218cb15b375253cfad94df96fb61286ca4e96558dfc37d36bbdb58214fd7bf76dcec1c61a3c7c1d9d00d541dc14c7d158463432f252708b9b421a02f65e0defb" \
  -H "Content-Type: application/json" \
  -d '{"data":{"title":"Teste","status":"published"}}' \
  https://ale-blog.agentesintegrados.com/api/posts
```

Se retornar algo diferente de 404 ou 405, funcionou!

## 🚀 Publicar o Artigo

Após configurar as permissões:
```bash
cd /home/strapi/thecryptofrontier/framework_crewai/blog_crew/claude_cli_adapter
python3 publish_to_strapi.py
```

## 💡 Dica Final

Se não encontrar as opções acima, procure por:
- "Permissions" / "Permissões"
- "Access Control" / "Controle de Acesso"
- "API Settings" / "Configurações da API"

O importante é encontrar onde marcar **"create"** ou **"Create entries"** para o content-type **Post**!

---

**Artigo pronto para publicação assim que as permissões forem configuradas!** 🎉