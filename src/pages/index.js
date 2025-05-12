import React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import ModernFooter from '../components/sections/ModernFooter';
import ModernHeader from '../components/sections/ModernHeader';
import { getFooterConfig } from '../lib/getFooterConfig';
import { getHeaderConfig } from '../lib/getHeaderConfig';

// Importação dinâmica do SearchComponent para evitar erros de SSR
const SearchComponent = dynamic(
  () => import('../components/SearchComponent'),
  { ssr: false }
);

const HomePage = ({ footerConfig, headerConfig }) => {
  // Obter os links de navegação do Sanity ou usar fallback
  const navLinks = footerConfig?.navLinks?.length > 0 
    ? footerConfig.navLinks 
    : [
        { label: "Home", url: "/" },
        { label: "Blog", url: "/blog" },
        { label: "Studio", url: "/studio-redirect" }
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{"The Crypto Frontier - Artigos e Tutoriais"}</title>
        <meta name="description" content="Explore nossa coleção de artigos e tutoriais sobre desenvolvimento e tecnologia" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <ModernHeader 
        title={headerConfig?.title || "The Crypto Frontier"} 
        navLinks={headerConfig?.navLinks || navLinks} 
      />
      
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold mb-4">
            The Crypto Frontier
            </h1>
            <p className="text-xl text-indigo-100 max-w-xl mx-auto">
              Explore o que existe de melhor no 
               cripto!
            </p>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-lg rounded-lg -mt-16 p-6 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Busque em nossa biblioteca</h2>
          <div className="max-w-4xl mx-auto">
            <SearchComponent />
          </div>
        </div>
      </main>
      
      <ModernFooter 
        title={footerConfig?.title || "The Crypto Frontier"}
        description={footerConfig?.description || "Seu portal de conteúdo sobre criptomoedas e blockchain"}
        socialLinks={footerConfig?.socialLinks || [
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
          links: footerConfig?.secondaryLinks || [
            { label: "Artigos", url: "/blog" },
            { label: "Tutoriais", url: "/blog" }
          ]
        }}
        legalLinks={footerConfig?.legalLinks || [
          { label: "Termos de Uso", url: "#" },
          { label: "Política de Privacidade", url: "#" }
        ]}
        copyrightText={footerConfig?.copyrightText || `© ${new Date().getFullYear()} The Crypto Frontier. Todos os direitos reservados.`}
      />
    </div>
  );
};

export async function getStaticProps() {
  // Buscar as configurações do rodapé e cabeçalho
  const [footerConfig, headerConfig] = await Promise.all([
    getFooterConfig(),
    getHeaderConfig(),
  ]);
  
  return {
    props: {
      footerConfig,
      headerConfig,
    },
    // Revalidar a cada 1 hora
    revalidate: 3600,
  };
}

export default HomePage; 