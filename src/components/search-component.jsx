import React, { useState } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits, Highlight, Configure, Stats, Pagination } from 'react-instantsearch-dom';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { buildIndexName } from '../utils/indexer/consts';

// Configurar dayjs para português do Brasil
dayjs.locale('pt-br');

// Inicializar cliente Algolia
const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY
);

// Nome do índice Algolia
const indexName = buildIndexName() || 'development_mcpx_content';

// Componente que renderiza cada resultado de pesquisa
const Hit = ({ hit }) => {
  // Determinar o URL do post com fallbacks
  const getPostUrl = () => {
    if (hit.permalink) return hit.permalink;
    if (hit.slug) return `/post/${hit.slug}`;
    if (hit.url) return hit.url;
    return null;
  };
  
  const postUrl = getPostUrl();

  return (
    <article className="search-result-card">
      {postUrl ? (
        <Link href={postUrl} passHref>
          <div className="search-result-content">
            {hit.featuredImage && (
              <div className="search-result-image">
                <img 
                  src={hit.featuredImage} 
                  alt={hit.title}
                  className="w-full h-32 object-cover rounded-t"
                />
              </div>
            )}
            
            <div className="search-result-text">
              <h2 className="search-result-title">
                <Highlight attribute="title" hit={hit} tagName="mark" />
              </h2>
              
              <div className="search-result-meta">
                {hit.date && (
                  <span className="search-date">
                    {/* Use a more consistent date formatter to prevent hydration errors */}
                    <span suppressHydrationWarning>
                      {dayjs(hit.date).format('DD [de] MMMM [de] YYYY')}
                    </span>
                  </span>
                )}
                {hit.timeToRead && (
                  <span className="search-time-to-read">
                    {hit.timeToRead} min de leitura
                  </span>
                )}
              </div>
              
              {hit.categories && hit.categories.length > 0 && (
                <div className="search-result-categories">
                  {hit.categories.map((category, index) => (
                    <span key={index} className="category-tag">
                      {typeof category === 'object' && category._ref ? category.title || 'Categoria' : category}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="search-result-excerpt">
                <Highlight attribute="excerpt" hit={hit} tagName="mark" />
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <div className="search-result-content">
          {hit.featuredImage && (
            <div className="search-result-image">
              <img 
                src={hit.featuredImage} 
                alt={hit.title}
                className="w-full h-32 object-cover rounded-t"
              />
            </div>
          )}
          
          <div className="search-result-text">
            <h2 className="search-result-title">
              <Highlight attribute="title" hit={hit} tagName="mark" />
            </h2>
            
            <div className="search-result-meta">
              {hit.date && (
                <span className="search-date">
                  {/* Use a more consistent date formatter to prevent hydration errors */}
                  <span suppressHydrationWarning>
                    {dayjs(hit.date).format('DD [de] MMMM [de] YYYY')}
                  </span>
                </span>
              )}
              {hit.timeToRead && (
                <span className="search-time-to-read">
                  {hit.timeToRead} min de leitura
                </span>
              )}
            </div>
            
            {hit.categories && hit.categories.length > 0 && (
              <div className="search-result-categories">
                {hit.categories.map((category, index) => (
                  <span key={index} className="category-tag">
                    {typeof category === 'object' && category._ref ? category.title || 'Categoria' : category}
                  </span>
                ))}
              </div>
            )}
            
            <div className="search-result-excerpt">
              <Highlight attribute="excerpt" hit={hit} tagName="mark" />
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

// Componente principal de busca
const SearchComponent = () => {
  const [searchState, setSearchState] = useState({});
  
  return (
    <div className="search-container">
      <InstantSearch
        searchClient={searchClient}
        indexName={indexName}
        searchState={searchState}
        onSearchStateChange={setSearchState}
      >
        <div className="search-panel">
          <SearchBox
            className="searchbox"
            translations={{
              placeholder: 'Buscar artigos...',
              submitTitle: 'Enviar sua busca',
              resetTitle: 'Limpar sua busca',
            }}
          />
          
          <Configure 
            hitsPerPage={6}
          />
          
          <div className="search-stats">
            <Stats
              translations={{
                stats(nbHits, processingTimeMS) {
                  return nbHits === 0
                    ? 'Nenhum resultado encontrado'
                    : `${nbHits} ${nbHits === 1 ? 'resultado' : 'resultados'} encontrados em ${processingTimeMS}ms`;
                },
              }}
            />
          </div>
          
          <div className="search-results">
            <Hits hitComponent={Hit} />
          </div>
          
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
                page(currentRefinement) {
                  return `${currentRefinement}`;
                },
                ariaPrevious: 'Página anterior',
                ariaNext: 'Próxima página',
                ariaFirst: 'Primeira página',
                ariaLast: 'Última página',
              }}
            />
          </div>
        </div>
      </InstantSearch>
      
      <style jsx global>{`
        .search-container {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .search-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .searchbox {
          margin-bottom: 20px;
        }
        
        .searchbox form {
          display: flex;
          align-items: center;
          position: relative;
        }
        
        .searchbox input {
          width: 100%;
          padding: 12px 16px;
          padding-right: 48px;
          font-size: 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .searchbox input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
          outline: none;
        }
        
        /* Estilização do botão de busca (lupa) */
        .searchbox button[type="submit"],
        .searchbox .ais-SearchBox-submit {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: #4f46e5;
          border: none;
          border-radius: 6px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s;
          z-index: 5;
        }
        
        .searchbox button[type="submit"]:hover,
        .searchbox .ais-SearchBox-submit:hover {
          background: #4338ca;
        }
        
        /* Estilização do SVG da lupa */
        .searchbox button[type="submit"] svg,
        .searchbox .ais-SearchBox-submitIcon {
          width: 20px;
          height: 20px;
          fill: white;
        }
        
        /* Ocultar todos os botões de reset padrão */
        .searchbox button[type="reset"],
        .searchbox .ais-SearchBox-reset {
          display: none !important;
        }
        
        /* Estilizar apenas o botão de reset que queremos mostrar */
        .searchbox .ais-SearchBox-reset {
          position: absolute;
          right: 52px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex !important;
          align-items: center;
          justify-content: center;
          opacity: 0.6;
          z-index: 5;
        }
        
        /* Esconde o X quando não tiver conteúdo */
        .searchbox form.ais-SearchBox-form--noRefinement .ais-SearchBox-reset {
          display: none !important;
        }
        
        /* Melhora o design do X */
        .searchbox .ais-SearchBox-resetIcon {
          width: 16px;
          height: 16px;
          fill: #4f46e5;
        }
        
        .searchbox .ais-SearchBox-reset:hover {
          opacity: 1;
        }
        
        .search-stats {
          font-size: 0.875rem;
          color: #64748b;
          margin: 10px 0;
        }
        
        .search-results {
          margin-top: 20px;
        }
        
        .search-result-card {
          margin-bottom: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          background-color: white;
        }
        
        .search-result-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .search-result-content {
          display: flex;
          flex-direction: column;
        }
        
        .search-result-text {
          padding: 20px;
        }
        
        .search-result-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 10px;
        }
        
        .search-result-meta {
          display: flex;
          gap: 15px;
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 10px;
        }
        
        .search-result-categories {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }
        
        .category-tag {
          padding: 4px 8px;
          background-color: #e2e8f0;
          color: #4a5568;
          border-radius: 4px;
          font-size: 0.75rem;
        }
        
        .search-result-excerpt {
          font-size: 0.875rem;
          color: #4a5568;
          line-height: 1.5;
        }
        
        mark {
          background-color: #fef3c7;
          color: inherit;
          padding: 0 2px;
          border-radius: 2px;
        }

        .ais-Hits-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          list-style: none;
          padding: 0;
        }

        .ais-Hits-item {
          margin: 0;
          padding: 0;
        }
        
        /* Estilos para paginação */
        .pagination-container {
          display: flex;
          justify-content: center;
          margin-top: 30px;
        }
        
        .ais-Pagination-list {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
          gap: 5px;
        }
        
        .ais-Pagination-item {
          margin: 0 2px;
        }
        
        .ais-Pagination-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 4px;
          color: #4a5568;
          text-decoration: none;
          transition: all 0.2s;
        }
        
        .ais-Pagination-item--selected .ais-Pagination-link {
          background-color: #4f46e5;
          color: white;
          font-weight: bold;
        }
        
        .ais-Pagination-item--firstPage .ais-Pagination-link,
        .ais-Pagination-item--previousPage .ais-Pagination-link,
        .ais-Pagination-item--nextPage .ais-Pagination-link,
        .ais-Pagination-item--lastPage .ais-Pagination-link {
          color: #4a5568;
          width: auto;
          padding: 0 10px;
        }
        
        .ais-Pagination-link:hover {
          background-color: #e2e8f0;
        }
        
        .ais-Pagination-item--selected .ais-Pagination-link:hover {
          background-color: #4338ca;
        }
        
        .ais-Pagination-item--disabled .ais-Pagination-link {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .ais-Pagination-item--disabled .ais-Pagination-link:hover {
          background-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default SearchComponent; 