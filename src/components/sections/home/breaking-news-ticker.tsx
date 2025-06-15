import strapiClient from "@/lib/strapiClient";
import BreakingNewsTickerClient from "./BreakingNewsTickerClient";

interface NewsItem {
  title: string;
  slug?: string;
}

// Fallback de notícias padrão
const defaultNews: NewsItem[] = [
  { title: "Bem-vindo ao The Crypto Frontier - Seu portal de notícias sobre criptomoedas" },
  { title: "Últimas atualizações do mercado de criptomoedas" },
  { title: "Análises e insights sobre blockchain" },
  { title: "Acompanhe as tendências do mercado cripto" }
];

interface BreakingNewsTickerProps {
  news?: NewsItem[];
}

// Server Component
export default async function BreakingNewsTicker({ news }: BreakingNewsTickerProps) {
  // Se já foram passadas notícias como prop, usa elas
  if (news && news.length > 0) {
    return <BreakingNewsTickerClient news={news} />;
  }

  // Caso contrário, busca do Strapi
  let newsItems: NewsItem[] = [];
  
  try {
    const response = await strapiClient.getPosts({ limit: 5 });
    
    if (response.data && response.data.length > 0) {
      newsItems = response.data
        .map((post: any) => ({
          title: post.attributes?.title || post.title,
          slug: post.attributes?.slug || post.slug
        }))
        .filter((item: NewsItem) => item.title);
    }
  } catch (error) {
    console.error('Erro ao buscar últimas notícias:', error);
  }

  // Se não houver notícias, usa as padrão
  const finalNews = newsItems.length > 0 ? newsItems : defaultNews;

  return <BreakingNewsTickerClient news={finalNews} />;
}