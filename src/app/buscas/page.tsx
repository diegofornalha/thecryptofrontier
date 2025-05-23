"use client"

import React from 'react';
import dynamic from 'next/dynamic';
import ModernFooter from '../../components/sections/ModernFooter';
import ModernHeader from '../../components/sections/ModernHeader';

// Importação dinâmica do SearchComponent para evitar erros de SSR
const SearchComponent = dynamic(
  () => import('../../components/SearchComponent'),
  { ssr: false }
);

export default function BuscasPage() {
  // Links de navegação padrão
  const navLinks = [
    { label: "Home", url: "/" },
    { label: "Buscar", url: "/buscas" },
    { label: "Blog", url: "/blog" },
    { label: "Studio", url: "/studio" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader 
        title="The Crypto Frontier"
        navLinks={navLinks} 
      />
      
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold mb-4">
              Buscar Artigos
            </h1>
            <p className="text-xl text-indigo-100 max-w-xl mx-auto">
              Encontre os melhores artigos sobre criptomoedas e blockchain
            </p>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-lg rounded-lg -mt-16 p-6 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Sistema de Busca Avançado
          </h2>
          <div className="max-w-4xl mx-auto">
            <SearchComponent />
          </div>
        </div>
        
        {/* Seção de dicas de busca */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              💡 Dicas para uma busca eficiente:
            </h3>
            <ul className="space-y-2 text-blue-700">
              <li>• Use palavras-chave específicas como "Bitcoin", "Ethereum", "DeFi"</li>
              <li>• Combine termos relacionados: "trading + análise técnica"</li>
              <li>• Busque por categorias: "tutorial", "notícias", "análise"</li>
              <li>• Use aspas para busca exata: "Web3 desenvolvimento"</li>
            </ul>
          </div>
        </div>
      </main>
      
      <ModernFooter 
        title="The Crypto Frontier"
        description="Seu portal de conteúdo sobre criptomoedas e blockchain"
        socialLinks={[
          { label: 'Twitter', icon: 'twitter', url: 'https://twitter.com/' },
          { label: 'Facebook', icon: 'facebook', url: 'https://facebook.com/' },
          { label: 'Instagram', icon: 'instagram', url: 'https://instagram.com/' }
        ]}
        primaryLinks={{
          title: "Navegação",
          links: navLinks
        }}
        secondaryLinks={{
          title: "Recursos",
          links: [
            { label: "Buscar", url: "/buscas" },
            { label: "Artigos", url: "/blog" },
            { label: "Tutoriais", url: "/blog" }
          ]
        }}
        legalLinks={[
          { label: "Termos de Uso", url: "#" },
          { label: "Política de Privacidade", url: "#" }
        ]}
        copyrightText={`© ${new Date().getFullYear()} The Crypto Frontier. Todos os direitos reservados.`}
      />
    </div>
  );
}