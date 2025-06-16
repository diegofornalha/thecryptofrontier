# 🎯 Instruções Finais para Publicar no Strapi

## ⚠️ Importante: Configurar ROLE, não usuário!

### 📍 Passos Exatos no Strapi Admin:

1. **Acesse**: https://ale-blog.agentesintegrados.com/admin

2. **Navegue para**:
   ```
   Settings → Users & Permissions Plugin → Roles
   ```

3. **Clique em**: **Authenticated** (NÃO em um usuário específico!)

4. **Encontre**: **Post** na lista de Application

5. **Marque as permissões**:
   - ✅ find
   - ✅ findOne
   - ✅ create
   - ✅ update (opcional)
   - ✅ delete (opcional)

6. **Clique em**: **Save** (canto superior direito)

## 🔍 Como Verificar se Funcionou:

Execute este comando:
```bash
curl -H "Authorization: Bearer ab8697c0e78c05e854a8c9015eb8d014de93f3e04204362662276ef77d2a16fe670a7fd06da6df76c985a9cea62e5e831c5d655a4f7409d8e7067723e197df9087d8dadbd1df381c2f7b04f9e8c7eb77cb84c8a44bb7941a2f034272ad9635f377580a78febb90fe2ef9eddfcebe577183dade06167a0abbf5f60d80683753cd" https://ale-blog.agentesintegrados.com/api/posts
```

Deve retornar:
```json
{
  "data": [],
  "meta": {...}
}
```

## 🚀 Publicar o Artigo:

Após configurar as permissões:
```bash
cd /home/strapi/thecryptofrontier/framework_crewai/blog_crew/claude_cli_adapter
python3 publish_to_strapi.py
```

## 📝 Artigo Pronto:

**Título**: DeFi Yield Farming em 2025: Como o Mercado de $129 Bilhões Está Revolucionando as Finanças

**Conteúdo**: 
- 1.037 palavras
- SEO otimizado
- Dados reais e atualizados
- Pronto para publicação!

## ❌ Erro Comum:

Configurar permissões no usuário (diegofornalha) ao invés do role (Authenticated) não funciona para API Tokens!

## ✅ Resumo:

1. API Token está funcionando ✅
2. Artigo está pronto ✅
3. Só falta: Configurar permissões no role **Authenticated** ⚠️

---

**Após configurar, o artigo será publicado automaticamente!** 🎉