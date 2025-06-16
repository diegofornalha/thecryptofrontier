import strapiClient from "@/lib/strapiClient";
import BreakingNewsTickerClient from "./breaking-news-ticker-client";
// Fallback de notícias padrão
const defaultNews = [
    { title: "Bem-vindo ao The Crypto Frontier - Seu portal de notícias sobre criptomoedas" },
    { title: "Últimas atualizações do mercado de criptomoedas" },
    { title: "Análises e insights sobre blockchain" },
    { title: "Acompanhe as tendências do mercado cripto" }
];
// Server Component
export default async function BreakingNewsTicker({ news }) {
    // Se já foram passadas notícias como prop, usa elas
    if (news && news.length > 0) {
        return <BreakingNewsTickerClient news={news}/>;
    }
    // Caso contrário, busca do Strapi
    let newsItems = [];
    try {
        const response = await strapiClient.getPosts({ limit: 5 });
        if (response.data && response.data.length > 0) {
            newsItems = response.data
                .map((post) => {
                var _a, _b;
                return ({
                    title: ((_a = post.attributes) === null || _a === void 0 ? void 0 : _a.title) || post.title,
                    slug: ((_b = post.attributes) === null || _b === void 0 ? void 0 : _b.slug) || post.slug
                });
            })
                .filter((item) => item.title);
        }
    }
    catch (error) {
        console.error('Erro ao buscar últimas notícias:', error);
    }
    // Se não houver notícias, usa as padrão
    const finalNews = newsItems.length > 0 ? newsItems : defaultNews;
    return <BreakingNewsTickerClient news={finalNews}/>;
}
