"use client"

import React from 'react';

export default function BuscasPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header simples */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">The Crypto Frontier</h1>
        </div>
      </header>
      
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900">Buscar</span>
          </nav>
        </div>
      </div>

      {/* Header da página */}
      <div className="py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Buscar Artigos
          </h1>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Conteúdo principal */}
          <div className="lg:col-span-8">
            {/* Campo de busca simples */}
            <div className="bg-white mb-8">
              <div className="max-w-md">
                <input
                  type="text"
                  placeholder="Buscar artigos..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Resultados de busca */}
            <div className="space-y-4">
              <p className="text-gray-600">
                Digite palavras-chave para buscar artigos sobre criptomoedas e blockchain.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Artigos Populares
              </h3>
              <p className="text-gray-600">
                Conteúdo em breve...
              </p>
            </div>
          </aside>
        </div>
      </main>
      
      {/* Footer simples */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 The Crypto Frontier. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}