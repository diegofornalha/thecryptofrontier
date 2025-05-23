import React from 'react';
import Link from 'next/link';
import ModernFooter from '../components/sections/ModernFooter';
import ModernHeader from '../components/sections/ModernHeader';

export default function HomePage() {
  // Links de navegação
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
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-extrabold mb-4">
            The Crypto Frontier
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
            Explore o que existe de melhor em cripto! Notícias, análises e tutoriais sobre o mundo das criptomoedas e blockchain.
          </p>
          
          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/buscas"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              🔍 Buscar Artigos
            </Link>
            <Link 
              href="/blog"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              📚 Ver Blog
            </Link>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-16">
        {/* Seção de recursos */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold mb-3">Análises de Mercado</h3>
            <p className="text-gray-600 mb-4">
              Análises técnicas e fundamentais das principais criptomoedas do mercado.
            </p>
            <Link href="/buscas" className="text-indigo-600 font-semibold hover:underline">
              Explorar análises →
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-bold mb-3">Tutoriais</h3>
            <p className="text-gray-600 mb-4">
              Aprenda desde o básico até conceitos avançados de blockchain e DeFi.
            </p>
            <Link href="/buscas" className="text-indigo-600 font-semibold hover:underline">
              Ver tutoriais →
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">📰</div>
            <h3 className="text-xl font-bold mb-3">Notícias</h3>
            <p className="text-gray-600 mb-4">
              Fique por dentro das últimas novidades do mundo cripto.
            </p>
            <Link href="/buscas" className="text-indigo-600 font-semibold hover:underline">
              Ler notícias →
            </Link>
          </div>
        </div>
        
        {/* Call to action */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Pronto para mergulhar no mundo cripto?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Use nossa ferramenta de busca avançada para encontrar exatamente o que você precisa aprender.
          </p>
          <Link 
            href="/buscas"
            className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-block"
          >
            🚀 Começar a Buscar
          </Link>
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