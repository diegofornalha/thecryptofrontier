# 🔍 Public vs Authenticated - Qual usar?

## 📋 Diferença entre os Roles:

### Public
- **Para quem**: Qualquer pessoa SEM login/token
- **Quando usar**: APIs abertas, conteúdo público
- **Segurança**: ⚠️ BAIXA - qualquer um pode acessar

### Authenticated  
- **Para quem**: Apenas usuários com token/login
- **Quando usar**: APIs protegidas, conteúdo privado
- **Segurança**: ✅ ALTA - só acessa quem tem credenciais

## 🤔 Por que sugeri Authenticated?

1. **Você está usando um API Token**
   - Tokens são credenciais de autenticação
   - API Tokens usam o role Authenticated

2. **Segurança do blog**
   - Criar posts deve ser protegido
   - Não queremos que qualquer pessoa crie posts

## ✅ Mas você PODE usar Public se:

1. **Quiser API totalmente aberta**
   - Qualquer um pode criar posts
   - Sem necessidade de token
   - ⚠️ Risco de spam/abuso

2. **Para testar rapidamente**
   - Configure Public primeiro
   - Teste se funciona
   - Depois mude para Authenticated

## 🎯 Recomendação:

### Para produção (seguro):
```
Role: Authenticated
- find ✅
- findOne ✅ 
- create ✅
```

### Para teste rápido:
```
Role: Public
- find ✅
- findOne ✅
- create ✅
```

## 💡 Teste com Public primeiro!

Se quiser testar mais rápido:
1. Configure permissões em **Public**
2. Teste sem token:
   ```bash
   curl -X POST https://ale-blog.agentesintegrados.com/api/posts \
     -H "Content-Type: application/json" \
     -d '{"data":{"title":"Teste"}}'
   ```
3. Se funcionar, depois configure em Authenticated

## ⚠️ Importante:

- **Public + create** = qualquer um pode criar posts
- **Authenticated + create** = só com token pode criar
- Para blog, normalmente queremos Authenticated
- Mas para testar, Public é mais fácil!