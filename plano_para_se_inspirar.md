# Explicação da Implementação

Este documento detalha como a funcionalidade de busca completa, incluindo a contagem de resultados ("X resultados encontrados em Yms") e a paginação, foi implementada no projeto.

## Arquivo Principal

A lógica central da busca está encapsulada no componente `AlgoliaSearch`, localizado em `components/AlgoliaSearch.jsx`. Este componente é carregado dinamicamente na página `pages/busca.jsx`.

## Ferramentas Utilizadas

A implementação utiliza a biblioteca `react-instantsearch-dom`, um conjunto de componentes React fornecido pelo Algolia para construir interfaces de busca rapidamente.

## Inicialização

1.  **Cliente Algolia:** O cliente Algolia é inicializado usando `algoliasearch/lite` com as credenciais (App ID e Search API Key) e o nome do índice (`indexName`) obtidos de variáveis de ambiente (`process.env.NEXT_PUBLIC_ALGOLIA_...`).
2.  **Componente `InstantSearch`:** Todo o sistema de busca é envolvido pelo componente `<InstantSearch>`. Ele gerencia o estado da busca e conecta todos os widgets (componentes de busca) ao Algolia.

```jsx
// components/AlgoliaSearch.jsx

import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits, Highlight, Pagination, Configure, Stats } from 'react-instantsearch-dom';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '...',
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || '...'
);
const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || '...';

const AlgoliaSearch = () => {
  // ...
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indexName}
      // ...
    >
      {/* Widgets de busca aqui */}
    </InstantSearch>
  );
};
```

## Contagem de Resultados e Tempo de Processamento

A exibição da frase "X resultados encontrados em Yms" é feita pelo widget `<Stats>` da biblioteca `react-instantsearch-dom`.

*   Este widget recebe automaticamente informações sobre a busca atual, incluindo o número de resultados (`nbHits`) e o tempo que a busca levou no servidor Algolia (`processingTimeMS`).
*   A prop `translations` é utilizada para formatar a string de saída de acordo com a necessidade, utilizando os valores `nbHits` e `processingTimeMS`.

```jsx
// components/AlgoliaSearch.jsx (dentro do InstantSearch)

<Stats
  translations={{
    stats(nbHits, processingTimeMS) {
      return nbHits === 0
        ? 'Nenhum resultado encontrado'
        : `${nbHits} ${nbHits === 1 ? 'resultado' : 'resultados'} encontrados em ${processingTimeMS}ms`;
    },
  }}
/>
```

## Paginação

A paginação é implementada usando o widget `<Pagination>` da `react-instantsearch-dom`.

*   Ele renderiza automaticamente os controles de paginação (números de página, botões "anterior", "próximo", "primeira", "última").
*   Ele se conecta ao estado gerenciado pelo `<InstantSearch>` e lida com a lógica de mudar de página quando um controle é clicado, disparando uma nova busca no Algolia com o parâmetro `page` atualizado.
*   A quantidade de itens por página é definida pelo widget `<Configure hitsPerPage={10} />`.

```jsx
// components/AlgoliaSearch.jsx (dentro do InstantSearch)

// Define quantos resultados por página
<Configure hitsPerPage={10} />

// Renderiza os controles de paginação
<div className="pagination-container">
  <Pagination
    showFirst={true}
    showPrevious={true}
    showNext={true}
    showLast={true}
    translations={{
      previous: '‹ Anterior',
      next: 'Próximo ›',
      first: '« Primeira',
      last: 'Última »',
      // ... outras traduções
    }}
  />
</div>
```

## Conclusão

A biblioteca `react-instantsearch-dom` abstrai grande parte da complexidade da comunicação com a API do Algolia e do gerenciamento do estado da busca, permitindo implementar a contagem de resultados e a paginação de forma declarativa usando seus componentes (widgets) pré-construídos como `<Stats>`, `<Pagination>` e `<Configure>`. 