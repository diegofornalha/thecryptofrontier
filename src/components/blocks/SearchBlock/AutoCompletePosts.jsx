import * as React from 'react';
import { ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY, buildIndexName } from '../../../utils/indexer/consts';
import algoliasearch from 'algoliasearch';
import { getAlgoliaResults } from '@algolia/autocomplete-js';
import '@algolia/autocomplete-theme-classic';
import BaseAutoComplete from './BaseAutoComplete';

// Verifica se as credenciais do Algolia estão disponíveis
const hasAlgoliaCredentials = ALGOLIA_APP_ID && ALGOLIA_SEARCH_API_KEY;

// Cria um cliente de pesquisa mockado se as credenciais não estiverem disponíveis
const searchClient = hasAlgoliaCredentials 
  ? algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY)
  : { 
      search: () => Promise.resolve({ 
        results: [{ hits: [] }] 
      }),
      appId: 'mock-app-id', // Adiciona um appId mockado para evitar erros
      addAlgoliaAgent: () => {} // Mock do método addAlgoliaAgent
    };

export default function AutoCompletePosts() {
    // Componente de pesquisa desabilitado para o modo de preview quando necessário
    const [isPreview, setIsPreview] = React.useState(false);
    
    React.useEffect(() => {
        // Detecta se estamos no ambiente de preview do Stackbit
        const isStackbitPreview = typeof window !== 'undefined' && 
            (window.location.hostname.includes('stackbit') || 
             window.location.search.includes('stackbit-preview'));
        
        setIsPreview(isStackbitPreview);
    }, []);

    // Se não houver credenciais do Algolia ou estamos no modo de preview, renderiza um placeholder
    if (!hasAlgoliaCredentials || isPreview) {
        console.warn('Algolia search is disabled in preview mode or credentials are missing.');
        return (
            <div className="search-disabled">
                <input 
                    type="text" 
                    placeholder={isPreview ? "Busca desabilitada no modo preview" : "Busca desabilitada"} 
                    disabled 
                    className="form-input"
                    style={{ 
                        width: '100%', 
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #ccc'
                    }}
                />
            </div>
        );
    }

    // Protege contra erros ao renderizar o componente de autocompletar
    try {
        return (
            <BaseAutoComplete
                openOnFocus={true}
                placeholder="Search in posts..."
                getSources={({ query }) => [
                    {
                        sourceId: 'posts',
                        getItems() {
                            try {
                                const indexName = buildIndexName() || 'default_posts';
                                return getAlgoliaResults({
                                    searchClient,
                                    queries: [
                                        {
                                            indexName,
                                            query
                                        }
                                    ]
                                });
                            } catch (error) {
                                console.error('Error fetching Algolia results:', error);
                                return [];
                            }
                        },
                        templates: {
                            item({ item, components }) {
                                return <ResultItem hit={item} components={components} />;
                            },
                            noResults() {
                                return (
                                    <div className="aa-EmptyResults">
                                        <p>Nenhum resultado encontrado.</p>
                                    </div>
                                );
                            }
                        }
                    }
                ]}
            />
        );
    } catch (error) {
        console.error('Error rendering AutoCompletePosts:', error);
        return (
            <div className="search-error">
                <input 
                    type="text" 
                    placeholder="Erro ao carregar a busca" 
                    disabled 
                    className="form-input"
                    style={{ 
                        width: '100%', 
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #f00'
                    }}
                />
            </div>
        );
    }
}

export function ResultItem({ hit, components }) {
    // Verifica se o hit existe e tem as propriedades necessárias
    if (!hit || !hit.url) {
        return (
            <div className="aa-ItemEmpty">
                Item indisponível
            </div>
        );
    }
    
    return (
        <a href={hit.url} className="aa-ItemLink">
            <div className="aa-ItemContent">
                <div className="aa-ItemTitle">
                    {components.Highlight && hit.title 
                        ? <components.Highlight hit={hit} attribute="title" />
                        : hit.title || 'Sem título'}
                </div>
            </div>
        </a>
    );
}
