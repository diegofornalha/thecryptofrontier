import React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';

// Importação dinâmica do SearchComponent para evitar erros de SSR
const SearchComponent = dynamic(
  () => import('../components/SearchComponent'),
  { ssr: false }
);

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{"The Crypto Frontier - Artigos e Tutoriais"}</title>
        <meta name="description" content="Explore nossa coleção de artigos e tutoriais sobre desenvolvimento e tecnologia" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <nav className="mb-6">
              <ul className="flex justify-center space-x-6">
                <li>
                  <Link href="/" className="text-white hover:text-indigo-200 font-medium">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-white hover:text-indigo-200 font-medium">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/studio" className="text-white hover:text-indigo-200 font-medium">
                    Studio
                  </Link>
                </li>
              </ul>
            </nav>
            <h1 className="text-5xl font-extrabold mb-4">
            The Crypto Frontier
            </h1>
            <p className="text-xl text-indigo-100 max-w-xl mx-auto">
              Explore o que existe de melhor no 
               cripto!
            </p>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-lg rounded-lg -mt-16 p-6 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Busque em nossa biblioteca</h2>
          <div className="max-w-4xl mx-auto">
            <SearchComponent />
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} The Crypto Frontier. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 