"use client";
import React from 'react';
import Link from 'next/link';

export default function PostsPage() {
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
                        <span className="text-gray-900">Posts</span>
                    </nav>
                </div>
            </div>

            {/* Header da página */}
            <div className="py-8 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Posts de Criptomoedas
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Últimas notícias e análises sobre o mundo cripto
                    </p>
                </div>
            </div>
            
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Conteúdo principal */}
                    <div className="lg:col-span-8">
                        {/* Posts */}
                        <div className="space-y-8">
                            <p className="text-gray-600">
                                Posts aparecerão aqui quando conectado ao Strapi.
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4">
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">
                                Categorias
                            </h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-blue-600 hover:text-blue-800">Bitcoin</a></li>
                                <li><a href="#" className="text-blue-600 hover:text-blue-800">Ethereum</a></li>
                                <li><a href="#" className="text-blue-600 hover:text-blue-800">DeFi</a></li>
                                <li><a href="#" className="text-blue-600 hover:text-blue-800">NFTs</a></li>
                            </ul>
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