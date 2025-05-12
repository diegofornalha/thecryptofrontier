import { client } from '../sanity/lib/client';

// Query para buscar as configurações do cabeçalho
const HEADER_QUERY = `*[_type == "header"][0]{
  title,
  navLinks[] {
    label,
    url
  }
}`;

// Função para buscar as configurações do cabeçalho
export async function getHeaderConfig() {
  try {
    const headerConfig = await client.fetch(HEADER_QUERY);
    return headerConfig;
  } catch (error) {
    console.error("Erro ao buscar configurações do cabeçalho:", error);
    return {
      title: "The Crypto Frontier",
      navLinks: [
        { label: "Home", url: "/" },
        { label: "Blog", url: "/blog" },
        { label: "Studio", url: "/studio-redirect" }
      ]
    };
  }
} 