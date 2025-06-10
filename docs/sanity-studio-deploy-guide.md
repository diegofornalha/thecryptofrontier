# Guia de Deploy do Sanity Studio - Resolvendo Conflitos de Hostname

## 📋 Contexto

Este documento detalha o processo de deploy do Sanity Studio, incluindo como identificar e resolver conflitos de hostname quando o nome desejado já está em uso.

## 🎯 Projeto Configurado

- **Project ID**: `uvuq2a47`
- **Dataset**: `production`
- **Título**: The Crypto Frontier

## 🚀 Processo de Deploy

### 1. Comando Inicial Executado

```bash
npm create sanity@latest -- --project uvuq2a47 --dataset production
```

✅ **Status**: Projeto já estava configurado localmente.

### 2. Tentativa de Deploy Inicial

```bash
npx sanity deploy
```

**Resultado**: Solicitou hostname para o studio.

### 3. Primeira Tentativa de Hostname

```bash
echo "thecryptofrontier" | npx sanity deploy
```

**Erro Encontrado**:
```
>> Studio hostname "thecryptofrontier" is already taken
```

### 4. Identificação do Problema

**Diagnóstico**: O hostname `thecryptofrontier` já estava em uso por outro projeto no Sanity.

**Sinais de Conflito**:
- Mensagem: "Studio hostname 'X' is already taken"
- Deploy interrompido antes do build
- Necessidade de escolher nome alternativo

### 5. Solução Implementada

```bash
echo "thecryptofrontier-blog" | npx sanity deploy
```

**Resultado Positivo**:
```
✓ Clean output folder (17ms)
✓ Build Sanity Studio (60456ms)
✓ Verifying local content
✓ Deploying to sanity.studio

Success! Studio deployed to https://thecryptofrontier-blog.sanity.studio/
```

## ✅ Studio Deployado com Sucesso

### Detalhes do Deploy

| Campo | Valor |
|-------|-------|
| **Nome** | thecryptofrontier-blog |
| **URL** | https://thecryptofrontier-blog.sanity.studio/ |
| **Status** | ✅ Ativo |
| **Hosting** | Sanity Studio Cloud |
| **Deploy por** | CLI Sanity |

### 6. Configuração Recomendada

Para evitar prompts futuros, adicionar ao `sanity.cli.ts`:

```typescript
export default defineCliConfig({ 
  api: { projectId, dataset },
  studioHost: 'thecryptofrontier-blog'  // Adicionar esta linha
})
```

## 🛠️ Estratégias para Escolher Hostname

### Quando o Nome Desejado Está em Uso

1. **Adicionar Sufixos Descritivos**:
   - `nome-blog`
   - `nome-studio` 
   - `nome-cms`
   - `nome-content`

2. **Incluir Data/Timestamp**:
   - `nome-2024`
   - `nome-v2`
   - `nome-new`

3. **Usar Variações do Projeto**:
   - `nome-oficial`
   - `nome-main`
   - `nome-prod`

## 🔍 Como Verificar Disponibilidade

### Método 1: Tentativa Direta
```bash
echo "seu-nome-desejado" | npx sanity deploy
```

### Método 2: Verificação Manual
- Acessar: `https://seu-nome-desejado.sanity.studio/`
- Se retornar 404: Nome disponível
- Se carregar uma página: Nome em uso

## 📝 Checklist de Deploy

- [ ] Projeto configurado localmente
- [ ] Schema definido
- [ ] Build local funcional (`npm run dev`)
- [ ] Hostname único escolhido
- [ ] Deploy executado: `npx sanity deploy`
- [ ] URL de acesso confirmada
- [ ] Configuração de `studioHost` atualizada

## 🎉 Resultado Final

**Studio Online**: https://thecryptofrontier-blog.sanity.studio/

**Acesso Local**: http://localhost:3002/studio (durante desenvolvimento)

## ⚠️ Problemas Comuns e Soluções

### Erro: "Studio hostname already taken"
**Solução**: Escolher nome alternativo com sufixo descritivo.

### Erro: Timeout durante build
**Solução**: Verificar conexão de internet e tentar novamente.

### Erro: Configuration file issues
**Solução**: Verificar sintaxe do `sanity.config.ts`.

## 📊 Scripts Úteis Configurados

```json
{
  "scripts": {
    "sanity-deploy": "npx sanity deploy",
    "dev": "next dev",
    "build": "next build"
  }
}
```

---

**Data de Criação**: $(date)
**Última Atualização**: $(date)
**Status**: ✅ Studio Online e Funcional 