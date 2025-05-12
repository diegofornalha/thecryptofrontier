import { client } from '../sanity/lib/client';

// Query para buscar as configurações do rodapé
const FOOTER_QUERY = `*[_type == "footer"][0]{
  copyrightText,
  navLinks[] {
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
      copyrightText: `© ${new Date().getFullYear()} The Crypto Frontier. Todos os direitos reservados.`,
      navLinks: []
    };
  }
} 