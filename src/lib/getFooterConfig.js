import { client } from '../strapi/lib/client';

// Query para buscar as configurações do rodapé
const FOOTER_QUERY = `*[_type == "footer"][0]{
  title,
  description,
  copyrightText,
  navLinks[] {
    label,
    url
  },
  socialLinks[] {
    label,
    icon,
    url
  },
  secondaryLinks[] {
    label,
    url
  },
  legalLinks[] {
    label,
    url
  }
}`;

// Função para buscar as configurações do rodapé
export async function getFooterConfig() {
  try {
    const footerConfig = await client.fetch(FOOTER_QUERY);
    return footerConfig;
  } catch (error) {
    console.error("Erro ao buscar configurações do rodapé:", error);
    return {
      title: "The Crypto Frontier",
      description: "Seu portal de conteúdo sobre criptomoedas e blockchain",
      copyrightText: `© ${new Date().getFullYear()} The Crypto Frontier. Todos os direitos reservados.`,
      navLinks: [
        { label: "Home", url: "/" },
        { label: "Blog", url: "/blog" },
        { label: "Studio", url: "/studio-redirect" }
      ],
      socialLinks: [
        { label: 'Twitter', icon: 'twitter', url: 'https://twitter.com/' },
        { label: 'Facebook', icon: 'facebook', url: 'https://facebook.com/' },
        { label: 'Instagram', icon: 'instagram', url: 'https://instagram.com/' }
      ],
      secondaryLinks: [
        { label: "Artigos", url: "/blog" },
        { label: "Tutoriais", url: "/blog" }
      ],
      legalLinks: [
        { label: "Termos de Uso", url: "#" },
        { label: "Política de Privacidade", url: "#" }
      ]
    };
  }
} 