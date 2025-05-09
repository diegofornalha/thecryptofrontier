# Configuração do Sanity

Este projeto usa o Sanity como CMS (Content Management System) para gerenciar o conteúdo do site.

## Configuração Inicial

Para configurar o Sanity para este projeto, siga os passos abaixo:

1. Acesse [https://www.sanity.io/](https://www.sanity.io/) e crie uma conta gratuita
2. Crie um novo projeto no Sanity com o Plano Grátis
3. Anote o `projectId` gerado

## Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=seu-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-05-03

# Tokens (nunca compartilhe em código público)
SANITY_DEV_TOKEN=seu-token-de-desenvolvimento
SANITY_DEPLOY_TOKEN=seu-token-de-deploy
SANITY_PREVIEW_SECRET=algum-valor-secreto-para-preview
```

## Geração de Tokens

Para gerar os tokens necessários:

1. Acesse [https://manage.sanity.io/](https://manage.sanity.io/)
2. Selecione seu projeto
3. Vá para "API" na seção "Settings"
4. Clique em "Add API Token"
5. Crie dois tokens:
   - Um com permissões "Developer" para `SANITY_DEV_TOKEN` (acesso total)
   - Um com permissões "Editor" para `SANITY_DEPLOY_TOKEN` (acesso limitado)

## Migração de Dados

Para migrar os dados do sistema de arquivos para o Sanity:

```bash
npm run migrate-to-sanity
```

## Estrutura do Schema

O schema do Sanity está definido em `sanity/schema.ts` e inclui:

- **Page**: Tipo de documento para páginas
- **SiteConfig**: Configurações do site
- **Header**: Configurações do cabeçalho
- **Footer**: Configurações do rodapé

## Implementação do Studio

Para implementar o Sanity Studio completo, você precisará:

1. Atualizar sua versão do Node.js para 20+
2. Executar `npx sanity init` dentro da pasta `studio/`
3. Seguir o assistente de configuração

## Preview de Conteúdo

Para visualizar o conteúdo do Sanity antes de publicar:

1. Acesse a URL: `/api/preview?secret=SANITY_PREVIEW_SECRET&slug=/pagina-para-preview`
2. Para sair do modo preview: `/api/exit-preview` 