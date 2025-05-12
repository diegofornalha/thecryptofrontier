import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ModernFooter from '../components/sections/ModernFooter';
import { getFooterConfig } from '../lib/getFooterConfig';

interface StudioRedirectProps {
  footerConfig: any;
}

export default function StudioRedirect({ footerConfig }: StudioRedirectProps) {
  const router = useRouter();

  // Obter os links de navegação do Sanity ou usar fallback
  const navLinks = footerConfig?.navLinks?.length > 0 
    ? footerConfig.navLinks 
    : [
        { label: "Home", url: "/" },
        { label: "Blog", url: "/blog" },
        { label: "Studio", url: "/studio-redirect" }
      ];

  useEffect(() => {
    // Redirecionar para o studio no App Router
    router.push('/studio');
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Redirecionando para o Studio - The Crypto Frontier</title>
        <meta name="description" content="Redirecionando para o Studio Sanity" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Redirecionando para o Studio...</h1>
        <p className="text-lg mb-6">Aguarde um momento enquanto te redirecionamos para o Studio Sanity.</p>
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
      </div>
      
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
            { label: "Artigos", url: "/blog" },
            { label: "Tutoriais", url: "/blog" }
          ]
        }}
        legalLinks={[
          { label: "Termos de Uso", url: "#" },
          { label: "Política de Privacidade", url: "#" }
        ]}
        copyrightText={footerConfig?.copyrightText || `© ${new Date().getFullYear()} The Crypto Frontier. Todos os direitos reservados.`}
      />
    </div>
  );
}

export async function getStaticProps() {
  // Buscar as configurações do rodapé
  const footerConfig = await getFooterConfig();
  
  return {
    props: {
      footerConfig,
    },
    // Revalidar a cada 1 hora
    revalidate: 3600,
  };
} 