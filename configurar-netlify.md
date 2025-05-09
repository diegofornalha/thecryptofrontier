# Configuração do Netlify para Indexação Automática

Para garantir que a indexação automática do Algolia funcione corretamente em cada deploy, siga estas instruções para configurar as variáveis de ambiente no Netlify:

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis de ambiente no painel de controle do Netlify:

```
ALGOLIA_ADMIN_API_KEY=d0cb55ec8f07832bc5f57da0bd25c535
NEXT_PUBLIC_ALGOLIA_APP_ID=42TZWHW8UP
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=development_mcpx_content
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=b32edbeb383fc3d1279658e7c3661843
```

## Passos para Configuração

1. Acesse o painel de controle do Netlify
2. Selecione seu site
3. Navegue até **Site settings > Build & deploy > Environment**
4. Clique em **Edit variables**
5. Adicione cada uma das variáveis acima
6. Clique em **Save**

## Verificação

Após configurar as variáveis, faça um novo deploy para verificar se a indexação automática está funcionando corretamente. Você pode verificar os logs de build para confirmar que o script `index-content` foi executado com sucesso.

## Segurança

Observe que a `ALGOLIA_ADMIN_API_KEY` é uma chave sensível com permissões administrativas. Certifique-se de que esta chave esteja protegida e não seja exposta publicamente. 