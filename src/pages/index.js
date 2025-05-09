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
        <title>DataButton - Artigos e Tutoriais</title>
        <meta name="description" content="Explore nossa coleção de artigos e tutoriais sobre desenvolvimento e tecnologia" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold mb-4">
              DataButton
            </h1>
            <p className="text-xl text-indigo-100 max-w-xl mx-auto">
              Explore nossa coleção de artigos, tutoriais e recursos sobre desenvolvimento e tecnologia
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
        
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">Categorias Populares</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CategoryCard 
              title="Desenvolvimento Web"
              description="Artigos sobre HTML, CSS, JavaScript e frameworks modernos."
              link="/mcpx/dev-web"
              icon="🌐"
            />
            <CategoryCard 
              title="Machine Learning"
              description="Tutoriais e guias sobre inteligência artificial e aprendizado de máquina."
              link="/mcpx/introducao-ao-ml"
              icon="🤖"
            />
            <CategoryCard 
              title="DataButton"
              description="Aprenda como usar o Databutton para criar aplicações impressionantes."
              link="/mcpx/o-que-e-databutton/"
              icon="📊"
            />
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} DataButton. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

const CategoryCard = ({ title, description, link, icon }) => {
  return (
    <Link href={link} passHref>
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
};

export default HomePage; 