"use client"

import React from 'react'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Componente para demonstrar a migração do Bloco de Pesquisa
export function SearchBlockMigration() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Atual (SearchBlock legado)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* Versão simplificada do SearchBlock atual */}
          <div className="w-full max-w-lg mx-auto">
            <div className="border rounded px-4 py-2 focus-within:border-primary">
              <div className="aa-Autocomplete" id="autocomplete">
                <form className="aa-Form">
                  <div className="aa-InputWrapperPrefix">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 12a4 4 0 100-8 4 4 0 000 8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
                      <path d="M14.5 14.5L10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
                    </svg>
                  </div>
                  <div className="aa-InputWrapper">
                    <input
                      className="aa-Input"
                      type="search"
                      placeholder="Search in posts..."
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                  </div>
                </form>
              </div>
            </div>
            
            {/* Exemplo de resultados estáticos */}
            <div className="aa-Panel aa-Panel--stalled mt-1 border rounded shadow-sm">
              <div className="aa-PanelLayout">
                <div className="aa-SourceHeader">
                  <div className="aa-SourceHeaderTitle">Posts</div>
                </div>
                <div className="aa-List">
                  <div className="aa-Item aa-ItemLink">
                    <div className="aa-ItemContent">
                      <div className="aa-ItemTitle">
                        Introduction to <mark>Crypto</mark>currency
                      </div>
                    </div>
                  </div>
                  <div className="aa-Item aa-ItemLink">
                    <div className="aa-ItemContent">
                      <div className="aa-ItemTitle">
                        What is <mark>Crypto</mark> Mining?
                      </div>
                    </div>
                  </div>
                  <div className="aa-Item aa-ItemLink">
                    <div className="aa-ItemContent">
                      <div className="aa-ItemTitle">
                        <mark>Crypto</mark> Wallets Explained
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// AutoCompletePosts.jsx - Componente atual de pesquisa
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
      appId: 'mock-app-id',
      addAlgoliaAgent: () => {}
    };

export default function AutoCompletePosts() {
    const [isPreview, setIsPreview] = React.useState(false);
    
    React.useEffect(() => {
        // Detecta se estamos no ambiente de preview do Sanity
        const isSanityPreview = typeof window !== 'undefined' && 
            (window.location.hostname.includes('sanity') || 
             window.location.search.includes('sanity-preview'));
        
        setIsPreview(isSanityPreview);
    }, []);

    if (!hasAlgoliaCredentials || isPreview) {
        return (
            <div className="search-disabled">
                <input 
                    type="text" 
                    placeholder={isPreview ? "Busca desabilitada no modo preview" : "Busca desabilitada"} 
                    disabled 
                    className="form-input"
                />
            </div>
        );
    }

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
                            return <div className="aa-EmptyResults">Nenhum resultado encontrado.</div>;
                        }
                    }
                }
            ]}
        />
    );
}`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Migrado (shadcn/ui)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* SearchBlock migrado usando Command do shadcn/ui */}
          <div className="w-full max-w-lg mx-auto">
            <SearchComponentDemo />
          </div>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// SearchBlock migrado usando Command do shadcn/ui
import React, { useState, useEffect } from "react"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import algoliasearch from 'algoliasearch'
import { ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY, buildIndexName } from '@/utils/indexer/consts'

// Função para verificar credenciais e criar cliente
const getSearchClient = () => {
  const hasCredentials = ALGOLIA_APP_ID && ALGOLIA_SEARCH_API_KEY
  
  if (!hasCredentials) {
    return { 
      search: () => Promise.resolve({ results: [{ hits: [] }] }),
      appId: 'mock-app-id',
      addAlgoliaAgent: () => {}
    }
  }
  
  return algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY)
}

export function SearchBlock({ placeholder = "Buscar posts...", className }) {
  const [searchClient] = useState(getSearchClient())
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  
  // Verificar se estamos em modo preview
  useEffect(() => {
    const isSanityPreview = typeof window !== 'undefined' && 
      (window.location.hostname.includes('sanity') || 
       window.location.search.includes('sanity-preview'))
    
    setIsPreview(isSanityPreview)
  }, [])
  
  // Realizar busca quando a query mudar
  useEffect(() => {
    const hasCredentials = ALGOLIA_APP_ID && ALGOLIA_SEARCH_API_KEY
    
    if (!hasCredentials || isPreview || !query) {
      setResults([])
      return
    }
    
    const fetchResults = async () => {
      setIsLoading(true)
      try {
        const indexName = buildIndexName() || 'default_posts'
        const { results } = await searchClient.search([
          {
            indexName,
            query,
            params: {
              hitsPerPage: 10,
            },
          },
        ])
        
        setResults(results[0].hits || [])
      } catch (error) {
        console.error('Error searching:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }
    
    const timer = setTimeout(() => {
      fetchResults()
    }, 300)
    
    return () => clearTimeout(timer)
  }, [query, searchClient, isPreview])
  
  if (isPreview) {
    return (
      <div className="relative w-full">
        <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Busca desabilitada no modo preview"
          disabled
          className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-4 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    )
  }
  
  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center">
              <MagnifyingGlassIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              {placeholder}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder={placeholder}
              value={query}
              onValueChange={setQuery}
              className="h-9"
            />
            <CommandList>
              {isLoading ? (
                <CommandEmpty>Buscando...</CommandEmpty>
              ) : results.length === 0 && query ? (
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              ) : (
                <CommandGroup heading="Resultados">
                  {results.map((hit) => (
                    <CommandItem
                      key={hit.objectID}
                      value={hit.objectID}
                      onSelect={() => {
                        setOpen(false)
                        window.location.href = hit.url
                      }}
                    >
                      <span dangerouslySetInnerHTML={{ 
                        __html: hit._highlightResult?.title?.value || hit.title 
                      }} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Guia de Migração</h3>
        <div className="p-4 bg-muted/50 rounded-md space-y-2">
          <h4 className="font-medium">Principais mudanças:</h4>
          <ul className="ml-6 list-disc space-y-1">
            <li>Substituição do Autocomplete.js pelo Command do shadcn/ui</li>
            <li>Integração com Popover para melhor experiência de UI</li>
            <li>Interface mais limpa e moderna</li>
            <li>Preservação da integração com Algolia</li>
            <li>Melhor gestão de estado com hooks do React</li>
            <li>Debounce na busca para melhor performance</li>
            <li>Estilos consistentes com o design system</li>
          </ul>
          
          <h4 className="font-medium mt-4">Benefícios da migração:</h4>
          <ul className="ml-6 list-disc space-y-1">
            <li>Melhor desempenho com menos dependências externas</li>
            <li>Estilização mais fácil e consistente</li>
            <li>Suporte automático para temas claro/escuro</li>
            <li>Melhor experiência em dispositivos móveis</li>
            <li>Maior acessibilidade com foco e navegação por teclado</li>
            <li>Flexibilidade para personalizar comportamentos</li>
            <li>Visualização mais elegante dos resultados de pesquisa</li>
          </ul>
          
          <h4 className="font-medium mt-4">Considerações de implementação:</h4>
          <ul className="ml-6 list-disc space-y-1">
            <li>Manter a compatibilidade com a API do Algolia</li>
            <li>Garantir que o destaque das palavras-chave funcione corretamente</li>
            <li>Considerar a experiência mobile-first</li>
            <li>Implementar estados de carregamento com feedback visual</li>
            <li>Adicionar animações suaves para abrir/fechar o popover</li>
            <li>Validar a acessibilidade (ARIA labels, contrastes, navegação por teclado)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Exemplo de implementação do componente de pesquisa
function SearchComponentDemo() {
  const [open, setOpen] = React.useState(false)
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center">
            <MagnifyingGlassIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            Buscar posts...
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Digite para buscar..." />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup heading="Resultados">
              <CommandItem onSelect={() => setOpen(false)}>
                Introduction to <span className="bg-yellow-200 dark:bg-yellow-800">Crypto</span>currency
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>
                What is <span className="bg-yellow-200 dark:bg-yellow-800">Crypto</span> Mining?
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>
                <span className="bg-yellow-200 dark:bg-yellow-800">Crypto</span> Wallets Explained
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 