import { client } from "../../../sanity/client";
import BreakingNewsTickerClient from "./BreakingNewsTickerClient";

interface NewsItem {
  title: string;
  slug?: string;
}

const breakingNewsQuery = `*[_type == "post"] | order(publishedAt desc) [0...5] {
  title,
  "slug": slug.current
}`;

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

  // Caso contrário, busca do Sanity
  let newsItems: NewsItem[] = [];
  
  try {
    const posts = await client.fetch(breakingNewsQuery);
    
    if (posts && posts.length > 0) {
      newsItems = posts
        .map((post: any) => ({
          title: post.title,
          slug: post.slug
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