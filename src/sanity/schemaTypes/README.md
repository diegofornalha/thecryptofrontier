# Schema Padronizado do Sanity - The Crypto Frontier

Este documento explica a estrutura padronizada do schema do Sanity para o projeto TheCryptoFrontier. Seguir estas diretrizes garante consistência em todo o projeto.

## Estrutura de Diretórios

O schema está organizado em três principais categorias:

```
src/sanity/schemaTypes/
├── documents/      # Tipos de documentos principais (post, page, etc.)
├── objects/        # Tipos de objetos reutilizáveis (mainImage, seo, etc.)
├── settings/       # Documentos de configuração (siteConfig, header, footer)
└── index.ts        # Arquivo de exportação principal
```

## Tipos de Documentos

### `post.ts`
- Representa artigos do blog sobre criptomoedas
- Campos essenciais: título, slug, imagem, categorias, conteúdo
- Campos específicos para criptomoedas (via cryptoMeta)
- Validação rigorosa de campos obrigatórios
- Metadados de SEO

### `category.ts`
- Categorias para classificar posts de criptomoedas
- Campos: título, slug, descrição, ícone, ordem de exibição
- Ordenação personalizável para exibição no frontend

### `tag.ts`
- Tags para indexação e filtragem adicional
- Estrutura simples: título, slug, descrição

### `author.ts`
- Informações sobre autores dos posts
- Inclui biografia e links de redes sociais
- Imagem de perfil com ajuste de foco

### `page.ts`
- Páginas estáticas do site
- Conteúdo flexível com blocos de rich text

## Objetos Reutilizáveis

### `mainImage.ts`
- Imagens com metadados enriquecidos
- Texto alternativo (alt) para acessibilidade
- Legenda e atribuição

### `seo.ts`
- Metadados para SEO e compartilhamento social
- Títulos e descrições otimizados para SEO
- Configurações para Open Graph

### `navLink.ts`
- Links de navegação reutilizáveis
- Suporte para links internos ou externos
- Opção para ícones

### `cryptoMeta.ts`
- Metadados específicos para criptomoedas
- Preço, variação, capitalização de mercado
- Conexão com CoinGecko para atualizações futuras

## Configurações do Site

### `siteConfig.ts`
- Configurações globais do site
- Logos, favicons, imagens sociais
- Links de redes sociais
- Configurações de analytics e monetização

### `header.ts`
- Configuração do cabeçalho do site
- Links de navegação principal
- Botão de chamada para ação (CTA)
- Opções de tema e busca

### `footer.ts`
- Configuração do rodapé do site
- Colunas de navegação
- Links de redes sociais
- Aviso legal e texto de copyright

## Boas Práticas

1. **Validação Consistente**: Todos os campos importantes têm regras de validação
2. **Reutilização de Componentes**: Objetos são reutilizados quando possível
3. **Metadados Enriquecidos**: Foco em SEO e compartilhamento social
4. **Visualização (Preview)**: Personalizada para cada tipo de documento
5. **Ordenação**: Configuração de ordenação padrão para listagens

## Integração com Fluxo de Automação

Este schema foi projetado para funcionar com o fluxo de automação que:
1. Monitora feeds RSS de sites de criptomoedas
2. Traduz artigos para português
3. Publica no Sanity CMS usando este schema
4. Indexa no Algolia para busca

## Convenções de Nomenclatura

- Campos em `camelCase` (ex: `mainImage`, `publishedAt`)
- Títulos amigáveis em português com primeira letra maiúscula
- Descrições claras para campos complexos
- Schema types em `camelCase` (ex: `mainImage`, `siteConfig`)

---

Para mais informações sobre schemas do Sanity, consulte a [documentação oficial](https://www.sanity.io/docs/schema-types). 