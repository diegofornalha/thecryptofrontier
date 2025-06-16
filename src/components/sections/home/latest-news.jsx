import React from "react";
import strapiClient from "@/lib/strapiClient";
import LatestNewsClient from "./latest-news-client";
// Server Component
export default async function LatestNews() {
    let newsItems = [];
    let error = null;
    try {
        const response = await strapiClient.getPosts({ limit: 15 });
        if (response.data) {
            newsItems = response.data.map((post) => {
                var _a, _b, _c, _d, _e, _f, _g;
                return ({
                    _id: post.id,
                    title: ((_a = post.attributes) === null || _a === void 0 ? void 0 : _a.title) || post.title,
                    slug: ((_b = post.attributes) === null || _b === void 0 ? void 0 : _b.slug) || post.slug,
                    publishedAt: ((_c = post.attributes) === null || _c === void 0 ? void 0 : _c.publishedAt) || post.publishedAt,
                    author: {
                        name: ((_g = (_f = (_e = (_d = post.attributes) === null || _d === void 0 ? void 0 : _d.author) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.attributes) === null || _g === void 0 ? void 0 : _g.name) || 'Autor'
                    }
                });
            });
        }
    }
    catch (err) {
        console.error('Erro ao buscar últimas notícias:', err);
        error = err;
    }
    // Se houver erro ou não houver notícias
    if (error || !newsItems || newsItems.length === 0) {
        return (<div className="w-full bg-white p-4">
        <h3 className="text-lg font-bold mb-4 text-gray-900">
          Últimas Notícias
        </h3>
        <p className="text-gray-500 text-center">
          {error ? "Erro ao carregar notícias." : "Nenhuma notícia disponível no momento."}
        </p>
      </div>);
    }
    // Passa as notícias para o componente cliente
    return <LatestNewsClient newsItems={newsItems}/>;
}
