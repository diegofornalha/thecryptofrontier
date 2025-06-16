# 🔍 Single Types vs Collection Types

## 📋 Diferença Importante:

### Collection Types
- **Múltiplos registros** (posts, artigos, produtos)
- Permissões: find, findOne, **create**, update, delete
- Exemplo: Blog posts, Produtos, Usuários

### Single Types
- **Apenas 1 registro** (homepage, about, configurações)
- Permissões: find, update (NÃO tem create!)
- Exemplo: Homepage, Sobre Nós, Configurações Globais

## ❌ Por que não consegue marcar:

**Single Types não têm "create"** porque:
- Já existe apenas 1 instância
- Você só pode atualizar, não criar novo
- Por isso algumas opções ficam desabilitadas

## ✅ O que você precisa:

**"Post" deve ser um Collection Type**, não Single Type!

### Verifique:
1. No painel de permissões, procure por:
   - **Application** ou **API**
   - Depois procure **"Post"** ou **"Posts"**
   - Deve estar em **Collection Types**, não em Single Types

### Se Post está como Single Type:
- Foi configurado errado no Content-Type Builder
- Single Type só permite 1 post (não serve para blog!)
- Precisa ser recriado como Collection Type

## 🎯 Solução:

1. **Procure "Post" em Collection Types** (não em Single Types)
2. Se não encontrar, pode estar com outro nome:
   - Articles
   - Blogs
   - Contents
   - Posts (plural)

3. **Se Post é Single Type**, isso explica tudo:
   - Não pode criar novos posts via API
   - Só pode atualizar o único post existente
   - Precisa ser Collection Type para funcionar

## 💡 Como identificar:

No Content-Type Builder:
- **Collection Type**: ícone de múltiplos documentos 📚
- **Single Type**: ícone de documento único 📄

Você está procurando um **Collection Type** chamado Post/Posts!