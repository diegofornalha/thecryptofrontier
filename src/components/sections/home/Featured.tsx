import React from "react";
import Link from "next/link";
import strapiClient from "@/lib/strapiClient";
import { formatDate } from "../../../utils/date-utils";
import FeaturedClient from "./FeaturedClient";

// Server Component - busca dados no servidor
export default async function Featured() {
  let featuredPosts = [];
  let error = null;

  try {
    const response = await strapiClient.getPosts({ start: 3, limit: 17 });
    if (response.data) {
      featuredPosts = response.data.map((post: any) => ({
        _id: post.id,
        title: post.attributes?.title || post.title,
        slug: post.attributes?.slug || post.slug,
        date: post.attributes?.publishedAt || post.publishedAt
      }));
    }
  } catch (err) {
    console.error('Erro ao buscar posts em destaque:', err);
    error = err;
  }

  // Se houver erro ou não houver posts, renderiza mensagem apropriada
  if (error || !featuredPosts || featuredPosts.length === 0) {
    return (
      <div className="w-full bg-white p-4">
        <p className="text-gray-500 text-center">
          {error ? "Erro ao carregar posts em destaque." : "Nenhum post em destaque no momento."}
        </p>
      </div>
    );
  }

  // Passa os posts para o componente cliente que gerencia o estado de visualização
  return <FeaturedClient featuredPosts={featuredPosts} />;
}