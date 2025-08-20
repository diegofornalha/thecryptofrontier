# 🔧 Correção de Preview URL - Strapi Produção

## 🎯 **Problema**
Preview no Strapi de produção está redirecionando para `ale-blog-preview.agentesintegrados.com` quando deveria ir para `thecryptofrontier.agentesintegrados.com`.

## ✅ **Solução**

### **1️⃣ Acessar Admin do Strapi**
URL: https://ale-blog.agentesintegrados.com/admin

### **2️⃣ Configurar Preview URLs**

#### **Método 1: Via Settings → Live Preview (Dinâmico - RECOMENDADO)**
1. No menu lateral, vá em **Settings**
2. Procure por **Live Preview** ou **Preview URLs**
3. Configure URL dinâmica baseada no locale:

```bash
# ❌ INCORRETO (configuração atual):
https://ale-blog-preview.agentesintegrados.com/post/{slug}

# ❌ INCORRETO (fixo em inglês):
https://thecryptofrontier.agentesintegrados.com/en/post/{slug}

# ✅ CORRETO (dinâmico por idioma):
https://thecryptofrontier.agentesintegrados.com/{locale}/post/{slug}
```

**Resultado esperado:**
- Post em inglês (`en`) → `/en/post/titulo-post/`
- Post em português (`pt-BR`) → `/br/post/titulo-post/` ⚠️ *Pode precisar ajustar mapeamento*
- Post em espanhol (`es`) → `/es/post/titulo-post/`

#### **Método 1b: Configuração por Locale Individual**
Se o Strapi não suportar `{locale}` dinâmico, configure separadamente:

```bash
# Para locale 'en':
https://thecryptofrontier.agentesintegrados.com/en/post/{slug}

# Para locale 'pt-BR':  
https://thecryptofrontier.agentesintegrados.com/br/post/{slug}

# Para locale 'es':
https://thecryptofrontier.agentesintegrados.com/es/post/{slug}
```

#### **Método 2: Via Content-Type Builder**
1. Vá em **Content-Type Builder**
2. Clique em **Post** (Collection Type)
3. Clique no ícone ⚙️ **Settings** (canto superior direito)
4. Procure por **Preview URL** ou **Draft & Publish**
5. Configure a URL base: `https://thecryptofrontier.agentesintegrados.com`

#### **Método 3: Configuração por Idioma**
Se houver opção de configurar por locale:

```bash
English (en):
https://thecryptofrontier.agentesintegrados.com/en/post/{slug}

Português (pt-BR):  
https://thecryptofrontier.agentesintegrados.com/br/post/{slug}

Español (es):
https://thecryptofrontier.agentesintegrados.com/es/post/{slug}
```

### **3️⃣ Salvar e Testar**
1. **Salvar** todas as configurações
2. **Ir para um post** existente
3. **Clicar em Preview** 
4. **Verificar** se redirecionamento agora vai para `thecryptofrontier.agentesintegrados.com`

### **4️⃣ Casos Especiais**

#### **Se não encontrar a opção Preview:**
- Verifique se o plugin de preview está instalado
- Vá em **Settings → Plugins** e procure por plugins relacionados a preview
- Se necessário, instale plugin de preview

#### **Se a opção não salvar:**
- Verifique permissões do usuário admin
- Tente fazer logout/login
- Verifique se há cache do navegador

#### **Se continuar redirecionando errado:**
- Limpe cache do navegador
- Verifique se não há múltiplas configurações conflitantes
- Reinicie o container Strapi se necessário

### **5️⃣ Teste Final**
Após a configuração:

1. **Acesse**: https://ale-blog.agentesintegrados.com/admin
2. **Vá para um post** (ex: "novo teste")
3. **Clique em Preview** 
4. **Deve redirecionar para**: https://thecryptofrontier.agentesintegrados.com/en/post/novo-teste/

---

## 🔄 **Reiniciar Container (se necessário)**

Se as mudanças não surtirem efeito:

```bash
# Reiniciar Strapi de produção
docker restart ale-blog-strapi-v5

# Aguardar inicialização
sleep 30

# Testar novamente
```

---

## 📋 **Verificação de Sucesso**

### **ANTES (problemático):**
```
Preview click → ale-blog-preview.agentesintegrados.com (❌ conexão recusada)
```

### **DEPOIS (correto):**
```  
Preview click → thecryptofrontier.agentesintegrados.com/en/post/novo-teste/ (✅ funciona)
```

---

## 🐛 **Troubleshooting**

### **Se não encontrar Settings → Preview:**
O Strapi v5 pode ter diferentes interfaces. Procure por:
- Content Manager → Post → ⚙️ (ícone de engrenagem)
- Settings → Content Types → Post
- Plugins → Preview Plugin

### **Se preview continuar incorreto:**
1. Limpar cache do navegador (Ctrl+Shift+R)
2. Testar em aba anônima
3. Verificar logs: `docker logs ale-blog-strapi-v5 --tail=20`

---

**📝 Problema resolvido quando preview redirecionar corretamente para thecryptofrontier.agentesintegrados.com! 🎯** 