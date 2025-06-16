# 🚨 CORREÇÃO IMPORTANTE: Roles vs Usuários

## ❌ Problema Identificado

Você está editando o **usuário** (username admin), mas as permissões devem ser configuradas nos **ROLES** (papéis/funções).

## ✅ Caminho Correto no Admin:

### 1. NÃO é aqui:
```
❌ Content Manager → Users → Editar usuário
```

### 2. É AQUI:
```
✅ Settings → Users & Permissions Plugin → Roles
```

## 📋 Passo a Passo Correto:

1. **Saia da edição do usuário**

2. **Vá para Settings** (Configurações)
   - Ícone de engrenagem no menu lateral

3. **Encontre "Users & Permissions Plugin"**
   - Ou "Roles" / "Funções"

4. **Você verá 2 roles principais:**
   - **Public** (acesso sem login)
   - **Authenticated** (acesso com login/token)

5. **Clique em "Authenticated"**

6. **Encontre "Post" na lista**
   - Será algo como:
   ```
   Application
   └── Post
       ├── find ☐
       ├── findOne ☐
       ├── create ☐
       ├── update ☐
       └── delete ☐
   ```

7. **Marque as permissões:**
   - ✅ find
   - ✅ findOne
   - ✅ create

8. **Clique em SAVE**

## 🎯 Por que não funciona no usuário:

- **Usuários** herdam permissões dos **Roles**
- O usuário "admin" tem um Role (provavelmente "Authenticated")
- As permissões são definidas no Role, não no usuário

## 💡 Se não encontrar:

Procure por:
- "Roles" / "Funções"
- "Permissions" / "Permissões"
- "Users & Permissions"
- "Papéis e Permissões"

O importante é configurar no **ROLE**, não no usuário individual!