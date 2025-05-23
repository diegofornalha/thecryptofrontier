import React from 'react';
import Head from 'next/head';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>The Crypto Frontier</title>
        <meta name="description" content="Portal de notícias sobre criptomoedas" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">The Crypto Frontier</h1>
          </div>
        </header>
        
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-extrabold mb-4">
              The Crypto Frontier
            </h1>
            <p className="text-xl text-indigo-100 max-w-xl mx-auto">
              Explore o que existe de melhor em cripto!
            </p>
          </div>
        </div>
        
        <main className="container mx-auto px-4 py-12">
          <div className="bg-white shadow-lg rounded-lg -mt-16 p-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              ✅ Página funcionando!
            </h2>
            <p className="text-center text-gray-600">
              Servidor Next.js rodando corretamente na porta 3002
            </p>
          </div>
        </main>
        
        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; {new Date().getFullYear()} The Crypto Frontier. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </>
  );
} 