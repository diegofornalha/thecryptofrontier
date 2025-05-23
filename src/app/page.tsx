import NewsHeader from '@/components/sections/NewsHeader';
import Home from '@/components/sections/home/Home';
import ModernFooter from '@/components/sections/ModernFooter';

export const metadata = {
  title: 'The Crypto Frontier - Últimas Notícias sobre Criptomoedas',
  description: 'Fique por dentro das últimas notícias sobre criptomoedas, análises de mercado e insights do mundo da tecnologia blockchain.',
};

export default function IndexPage() {
  const navLinks = [
    { label: "Início", url: "/" },
    { label: "Buscar", url: "/buscas" },
    { label: "Blog", url: "/blog" },
    { label: "Studio", url: "/studio" }
  ];

  return (
    <>
      <NewsHeader />
      <div className="pt-[70px]">
        <Home />
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
    </>
  );
}