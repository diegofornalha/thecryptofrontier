"use client"

import React from 'react';
import dynamic from 'next/dynamic';
import NewsHeader from '@/components/sections/NewsHeader';
import CryptoBasicFooter from '@/components/sections/CryptoBasicFooter';
import BreakingNewsTicker from '@/components/sections/home/BreakingNewsTicker';

// Importação dinâmica do SearchComponent para evitar erros de SSR
const SearchComponent = dynamic(
  () => import('../../components/SearchComponent'),
  { ssr: false }
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
              <SearchComponent />
            </div>
            
            {/* Resultados de busca */}
            <div className="space-y-4">
              <p className="text-gray-600">
                Digite palavras-chave para buscar artigos sobre criptomoedas e blockchain.
              </p>
            </div>
          </div>

          {/* Sidebar (4 cols) */}
          <aside className="lg:col-span-4">
            {/* Widget de categorias populares */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-[#111] mb-4 pb-2 border-b border-gray-200">
                Categorias Populares
              </h3>
              <ul className="space-y-2">
                {['Bitcoin', 'Ethereum', 'Altcoins', 'DeFi', 'NFTs', 'Trading', 'Análises', 'Tutoriais'].map((cat) => (
                  <li key={cat}>
                    <a
                      href={`/categoria/${cat.toLowerCase()}`}
                      className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded transition-colors"
                    >
                      <span className="text-[#666] hover:text-[#4db2ec]">{cat}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Widget de tags populares */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-[#111] mb-4 pb-2 border-b border-gray-200">
                Tags Populares
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Bitcoin', 'Ethereum', 'DeFi', 'NFT', 'Web3', 'Metaverso', 'Trading', 'Staking', 'DAO', 'Smart Contracts'].map((tag) => (
                  <a
                    key={tag}
                    href={`/tag/${tag.toLowerCase()}`}
                    className="inline-block bg-gray-100 hover:bg-[#4db2ec] hover:text-white text-gray-700 text-sm px-3 py-1 rounded transition-colors"
                  >
                    {tag}
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
      
      <CryptoBasicFooter />
    </div>
  );
}