# Guia de Uso dos Preview Servers do Netlify - The Crypto Frontier

## O que são Preview Servers?

Os Preview Servers do Netlify permitem visualizar alterações em seu site antes de implantá-las no ambiente de produção. Existem dois tipos principais:

1. **Deploy Previews**: Criados automaticamente para cada Pull Request aberto no GitHub
2. **Branch Deploys**: Implantações automáticas para branches específicos além do branch principal

## Como usar os Deploy Previews

### Para Desenvolvedores

1. Crie um branch para suas alterações: `git checkout -b feature/nova-funcionalidade`
2. Faça as alterações necessárias no código
3. Envie para o GitHub: `git push origin feature/nova-funcionalidade`
4. Abra um Pull Request no GitHub
5. O Netlify automaticamente construirá um preview do seu site
6. Um link para o preview será adicionado como comentário no PR

### Para Editores de Conteúdo (com Sanity)

1. Faça alterações no conteúdo usando o Sanity Studio
2. Use o modo de Visualização no Sanity Studio para ver as alterações
3. As alterações serão visíveis em uma URL de preview temporária
4. Você pode compartilhar esta URL com outras pessoas para revisão

## Configuração Atual

No projeto The Crypto Frontier, os previews estão configurados com:

- **Senha de proteção**: Os deploy previews são protegidos com a senha `crypto`
- **Webhook Sanity**: O webhook `/api/sanity-webhook` está configurado para acionar rebuilds quando o conteúdo muda
- **Banner de Preview**: Um banner amarelo mostra quando você está visualizando um preview

## URLs dos Previews

- **Deploy Previews**: `https://deploy-preview-[PR-NUMBER]--thecryptofrontier.netlify.app`
- **Branch Deploys**: `https://[BRANCH-NAME]--thecryptofrontier.netlify.app`

## Criando um Build Hook no Netlify

Para permitir que o Sanity acione rebuilds automáticos:

1. No Netlify, vá para **Site settings > Build & deploy > Build hooks**
2. Clique em **Add build hook**
3. Dê um nome como "Sanity Content Update"
4. Selecione o branch que deseja reconstruir (normalmente `main`)
5. Copie a URL gerada
6. Adicione como variável de ambiente `NETLIFY_BUILD_HOOK` nas configurações do site

## Configurando o Sanity para usar o Preview

1. No Sanity Studio, vá para **Desk Structure**
2. Adicione um botão de visualização que aponta para a URL de preview
3. Use a opção de "View Published" para ver o site em produção
4. Use a opção "Preview" para ver as alterações antes de publicar

## Solução de Problemas

- **Preview não atualiza**: Verifique se o webhook está configurado corretamente
- **Erro no build**: Verifique os logs de build no Netlify
- **Conteúdo desatualizado**: Pode haver cache - tente forçar um refresh

## Recursos Úteis

- [Documentação oficial do Netlify sobre Deploy Previews](https://docs.netlify.com/site-deploys/deploy-previews/)
- [Integração Sanity-Netlify](https://www.sanity.io/guides/webhooks-netlify-and-nextjs)
- [Configurações avançadas de Preview](https://www.netlify.com/blog/2016/07/20/introducing-deploy-previews-in-netlify/) 