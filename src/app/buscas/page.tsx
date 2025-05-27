"use client"

import React from 'react';
import dynamic from 'next/dynamic';
import NewsHeader from '@/components/sections/NewsHeader';
import CryptoBasicFooter from '@/components/sections/CryptoBasicFooter';
import BreakingNewsTicker from '@/components/sections/home/BreakingNewsTicker';
import CategoriesWidget from '@/components/widgets/CategoriesWidget';
import TagsWidget from '@/components/widgets/TagsWidget';

// Importação dinâmica do SearchComponent para evitar erros de SSR
const CryptoSearchComponent = dynamic(
  () => import('../../components/CryptoSearchComponent'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-32">
        <div className="text-[#666]">Carregando busca...</div>
      </div>
    )
  }
);

export default function BuscasPage() {
  return (
    <div className="min-h-screen bg-white">
      <NewsHeader /> 
      
      {/* Breaking News Ticker e Breadcrumb como The Crypto Basic */}
      <div className="pt-[70px]">
        {/* Breaking News Ticker */}
        <BreakingNewsTicker />
        
        {/* Breadcrumb */}
        <div className="border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <a href="/" className="hover:text-[#4db2ec] transition-colors">Home</a>
              <span className="text-gray-400">›</span>
              <span className="text-gray-900">Buscar</span>
            </nav>
          </div>
        </div>

        {/* Header simples como The Crypto Basic */}
        <div className="py-8 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-[#111]">
              Buscar Artigos
            </h1>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Conteúdo principal (8 cols) */}
          <div className="lg:col-span-8">
            {/* Campo de busca limpo */}
            <div className="bg-white mb-8">
              <CryptoSearchComponent />
            </div>
            
            {/* Resultados de busca */}
            <div className="space-y-4">
              <p className="text-gray-600">
                Digite palavras-chave para buscar artigos sobre criptomoedas e blockchain.
              </p>
            </div>
          </div>

          {/* Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-8">
            <CategoriesWidget />
            <TagsWidget />
          </aside>
        </div>
      </main>
      
      <CryptoBasicFooter />
    </div>
  );
}