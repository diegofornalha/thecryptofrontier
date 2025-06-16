import React from "react";
import strapiClient from "@/lib/strapiClient";
import FeaturedClient from "./featured-client";
// Server Component - busca dados no servidor
export default async function Featured() {
    let featuredPosts = [];
    let error = null;
    try {
        const response = await strapiClient.getPosts({ start: 3, limit: 17 });
        if (response.data) {
            featuredPosts = response.data.map((post) => {
                var _a, _b, _c;
                return ({
                    _id: post.id,
                    title: ((_a = post.attributes) === null || _a === void 0 ? void 0 : _a.title) || post.title,
                    slug: ((_b = post.attributes) === null || _b === void 0 ? void 0 : _b.slug) || post.slug,
                    date: ((_c = post.attributes) === null || _c === void 0 ? void 0 : _c.publishedAt) || post.publishedAt
                });
            });
        }
    }
    catch (err) {
        console.error('Erro ao buscar posts em destaque:', err);
        error = err;
    }
    // Se houver erro ou não houver posts, renderiza mensagem apropriada
    if (error || !featuredPosts || featuredPosts.length === 0) {
        return (<div className="w-full bg-white p-4">
        <p className="text-gray-500 text-center">
          {error ? "Erro ao carregar posts em destaque." : "Nenhum post em destaque no momento."}
        </p>
      </div>);
    }
    // Passa os posts para o componente cliente que gerencia o estado de visualização
    return <FeaturedClient featuredPosts={featuredPosts}/>;
}
