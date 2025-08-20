'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Painel de administração</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Publicar Artigo */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Publicar Novo Artigo
            </h2>
            <p className="text-gray-600 mb-4">
              Criar e publicar um novo artigo no blog
            </p>
            <button 
              onClick={() => router.push('/admin/publish')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Criar Artigo
            </button>
          </div>

          {/* Gerenciar Posts */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Gerenciar Posts
            </h2>
            <p className="text-gray-600 mb-4">
              Visualizar e editar posts existentes
            </p>
            <button 
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              onClick={() => window.open('https://ale-blog.agentesintegrados.com/admin', '_blank')}
            >
              Ir para Strapi
            </button>
          </div>

          {/* Análises */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Análises
            </h2>
            <p className="text-gray-600 mb-4">
              Visualizar estatísticas do site
            </p>
            <button 
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
              disabled
            >
              Em Breve
            </button>
          </div>

          {/* RSS Manager */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              RSS Manager
            </h2>
            <p className="text-gray-600 mb-4">
              Gerenciar feeds RSS e importações
            </p>
            <button 
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
              disabled
            >
              Em Breve
            </button>
          </div>

          {/* Configurações */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Configurações
            </h2>
            <p className="text-gray-600 mb-4">
              Configurar o sistema e preferências
            </p>
            <button 
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              disabled
            >
              Em Breve
            </button>
          </div>

          {/* Status do Sistema */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Status do Sistema
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Frontend:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Strapi API:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Database:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Conectado
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => window.open('https://thecryptofrontier.agentesintegrados.com/', '_blank')}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Ver Site
            </button>
            <button 
              onClick={() => window.open('https://ale-blog.agentesintegrados.com/admin', '_blank')}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Strapi Admin
            </button>
            <button 
              onClick={() => router.push('/')}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Voltar ao Site
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}