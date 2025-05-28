'use client';

import React, { useState } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits, Highlight, Configure, Stats } from 'react-instantsearch-dom';
import Link from 'next/link';
import Image from 'next/image';
import { urlForImage } from '@/sanity/lib/image';
import { buildIndexName } from '../utils/indexer/consts';

// Inicializar cliente Algolia
const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || ''
);

// Nome do índice Algolia
const indexName = buildIndexName() || 'development_mcpx_content';

// Função para formatar data
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Componente que renderiza cada resultado
const Hit = ({ hit }: { hit: any }) => {
  const postUrl = hit.permalink || (hit.slug ? `/post/${hit.slug}` : hit.url);
  
  return (
    <article className="border-b border-gray-200 pb-6 mb-6 last:border-0">
      {postUrl ? (
        <Link href={postUrl}>
          <div className="flex gap-6 hover:opacity-80 transition-opacity">
            {/* Imagem */}
            {hit.featuredImage && (
              <div className="flex-shrink-0">
                <div className="relative w-[240px] h-[135px] overflow-hidden rounded">
                  <img 
                    src={hit.featuredImage} 
                    alt={hit.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            {/* Conteúdo */}
            <div className="flex-1">
              {/* Categoria */}
              {hit.categories && hit.categories.length > 0 && (
                <div className="mb-2">
                  <span className="text-[#4db2ec] text-sm font-medium uppercase">
                    {typeof hit.categories[0] === 'object' ? hit.categories[0].title : hit.categories[0]}
                  </span>
                </div>
              )}
              
              {/* Título */}
              <h2 className="text-xl font-bold text-[#111] mb-2 line-clamp-2">
                <Highlight attribute="title" hit={hit} tagName="mark" />
              </h2>
              
              {/* Excerpt */}
              <p className="text-[#666] text-sm line-clamp-2 mb-3">
                <Highlight attribute="excerpt" hit={hit} tagName="mark" />
              </p>
              
              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-[#999]">
                {hit.date && (
                  <span suppressHydrationWarning>
                    {formatDate(hit.date)}
                  </span>
                )}
                {hit.timeToRead && (
                  <span>{hit.timeToRead} min de leitura</span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <div className="opacity-50">
          <h3 className="text-lg font-medium text-[#111]">{hit.title}</h3>
          <p className="text-sm text-[#666]">Link não disponível</p>
        </div>
      )}
    </article>
  );
};

// Componente principal
const CryptoSearchComponent = () => {
  const [searchState, setSearchState] = useState({});
  
  return (
    <div className="w-full">
      <InstantSearch
        searchClient={searchClient}
        indexName={indexName}
        searchState={searchState}
        onSearchStateChange={setSearchState}
      >
        {/* Campo de busca */}
        <div className="mb-8">
          <SearchBox
            translations={{
              placeholder: 'Buscar artigos sobre criptomoedas...',
              submitTitle: 'Buscar',
              resetTitle: 'Limpar',
            }}
          />
        </div>
        
        <Configure hitsPerPage={10} />
        
        {/* Estatísticas */}
        <div className="mb-6 text-sm text-[#666]">
          <Stats
            translations={{
              stats(nbHits, processingTimeMS) {
                return nbHits === 0
                  ? 'Nenhum resultado encontrado'
                  : `${nbHits} ${nbHits === 1 ? 'resultado' : 'resultados'} encontrados`;
              },
            }}
          />
        </div>
        
        {/* Resultados */}
        <div className="bg-white">
          <Hits hitComponent={Hit} />
        </div>
      </InstantSearch>
      
      <style jsx global>{`
        /* Estilo do campo de busca */
        .ais-SearchBox-form {
          display: flex;
          position: relative;
        }
        
        .ais-SearchBox-input {
          width: 100%;
          padding: 12px 48px 12px 16px;
          font-size: 16px;
          border: 2px solid #e0e0e0;
          border-radius: 4px;
          transition: all 0.2s;
          background: white;
        }
        
        .ais-SearchBox-input:focus {
          outline: none;
          border-color: #4db2ec;
        }
        
        .ais-SearchBox-submit {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          background: #4db2ec;
          border: none;
          border-radius: 3px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .ais-SearchBox-submit:hover {
          background: #3da0d9;
        }
        
        .ais-SearchBox-submitIcon {
          width: 20px;
          height: 20px;
          fill: white;
        }
        
        .ais-SearchBox-reset {
          position: absolute;
          right: 50px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          opacity: 0.6;
        }
        
        .ais-SearchBox-reset:hover {
          opacity: 1;
        }
        
        .ais-SearchBox-resetIcon {
          width: 16px;
          height: 16px;
          fill: #666;
        }
        
        /* Esconde o reset quando não há texto */
        .ais-SearchBox-form--noRefinement .ais-SearchBox-reset {
          display: none;
        }
        
        /* Lista de resultados */
        .ais-Hits-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .ais-Hits-item {
          margin: 0;
        }
        
        /* Destaque nos termos buscados */
        mark {
          background-color: #fef3c7;
          color: inherit;
          padding: 2px 4px;
          border-radius: 2px;
          font-weight: 500;
        }
        
        /* Responsivo */
        @media (max-width: 768px) {
          .ais-Hits article > a > div {
            flex-direction: column;
          }
          
          .ais-Hits article > a > div > div:first-child {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CryptoSearchComponent;