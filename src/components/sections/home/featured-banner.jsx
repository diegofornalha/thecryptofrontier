import React from "react";
import strapiClient from "@/lib/strapiClient";
import Banner from "./banner";
import AdBanner from "./ad-banner";
import { urlForImage } from "@/lib/imageHelper";
// Server Component
export default async function FeaturedBanner({ showAd = true, // Por padrão, mostra publicidade
adConfig = {
    title: 'Sinais Cripto Expert',
    subtitle: 'Lucre de R$ 500,00 a R$ 5.000 em média por dia no criptomercado, sem precisar olhar gráficos, notícias, nem fazer cursos enormes.',
    link: 'https://eternityscale.com.br/sce-blog/'
} }) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    // Mostra banner de publicidade se habilitado
    if (showAd) {
        return <AdBanner {...adConfig}/>;
    }
    // Busca post em destaque no servidor
    let featuredPost = null;
    try {
        const response = await strapiClient.getPosts({ limit: 1 });
        if (response.data && response.data[0]) {
            const post = response.data[0];
            featuredPost = {
                _id: post.id,
                title: ((_a = post.attributes) === null || _a === void 0 ? void 0 : _a.title) || post.title,
                slug: ((_b = post.attributes) === null || _b === void 0 ? void 0 : _b.slug) || post.slug,
                excerpt: ((_c = post.attributes) === null || _c === void 0 ? void 0 : _c.excerpt) || post.excerpt,
                coverImage: ((_d = post.attributes) === null || _d === void 0 ? void 0 : _d.featuredImage) || post.featuredImage,
                author: {
                    name: ((_h = (_g = (_f = (_e = post.attributes) === null || _e === void 0 ? void 0 : _e.author) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.attributes) === null || _h === void 0 ? void 0 : _h.name) || 'Autor'
                }
            };
        }
    }
    catch (error) {
        console.error('Erro ao buscar post em destaque:', error);
    }
    // Se não houver post, mostra banner de publicidade como fallback
    if (!featuredPost) {
        return <AdBanner {...adConfig}/>;
    }
    // Prepara dados do banner
    const bannerData = {
        title: featuredPost.title,
        excerpt: featuredPost.excerpt,
        link: `/post/${featuredPost.slug}`,
        backgroundImage: featuredPost.coverImage ? (_j = urlForImage(featuredPost.coverImage)) === null || _j === void 0 ? void 0 : _j.url() : undefined,
        author: (_k = featuredPost.author) === null || _k === void 0 ? void 0 : _k.name
    };
    return <Banner {...bannerData}/>;
}
