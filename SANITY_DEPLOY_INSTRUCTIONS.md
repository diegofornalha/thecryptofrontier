# Instruções para Deploy do Sanity Studio

O Sanity Studio está configurado e pronto para deploy. Para fazer o deploy, siga estas instruções:

## Opção 1: Deploy via NPM Script

```bash
npm run sanity-deploy
```

## Opção 2: Deploy Direto

```bash
npx sanity deploy
```

## Durante o Deploy

1. O comando perguntará sobre o hostname do studio
2. Selecione "Create new studio hostname" (usando as setas)
3. Digite: `thecryptofrontier` como hostname
4. O studio será deployado para: https://thecryptofrontier.sanity.studio

## Informações do Projeto

- **Project ID**: brby2yrg
- **Dataset**: production
- **Studio Path**: /studio

## Após o Deploy

O Sanity Studio estará disponível em:
- **URL do Studio**: https://thecryptofrontier.sanity.studio
- **URL Local**: http://localhost:3000/studio (quando rodando localmente)

## Verificação

Após o deploy, você pode verificar se está funcionando acessando a URL do studio e fazendo login com suas credenciais do Sanity.

---

**Nota**: O deploy requer autenticação. Certifique-se de estar logado no Sanity CLI:
```bash
npx sanity login
```