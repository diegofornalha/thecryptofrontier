# 🚨 URGENTE: Você está no lugar ERRADO!

## ❌ Onde você está (ERRADO):
```
/admin/content-manager/collection-types/plugin::users-permissions.user/...
```
Isso é a página de **edição de usuário**!

## ✅ Onde precisa ir (CORRETO):
```
Settings → Users & Permissions Plugin → Roles
```

## 📸 Passo a Passo Visual:

### 1. Saia da página do usuário
- Clique no menu lateral ou volte ao dashboard

### 2. Clique em Settings (⚙️)
- Ícone de engrenagem no menu lateral esquerdo

### 3. Procure "Users & Permissions Plugin"
- Deve ter uma seção chamada:
  - "Users & Permissions Plugin" ou
  - "Roles & Permissions" ou
  - "Papéis e Permissões"

### 4. Clique em "Roles"
- Você verá uma lista com:
  - Public
  - Authenticated

### 5. Clique em "Authenticated"
- NÃO em "Public" (esse é para acesso sem login)

### 6. Procure "Post" na lista
- Deve estar em "Application" ou "API"
- Marque: find, findOne, CREATE

### 7. Clique em SAVE

## ❌ Por que "Policy Failed" no usuário:
- Você está tentando dar permissões direto no usuário
- Mas o Strapi não funciona assim
- Permissões são dadas aos ROLES, não aos usuários

## 🎯 Resumo:
```
ERRADO: Content Manager → User → Editar usuário
CORRETO: Settings → Users & Permissions → Roles → Authenticated
```

**NÃO é no usuário, é no ROLE!**