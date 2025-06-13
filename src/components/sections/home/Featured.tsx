import React from "react";
import Link from "next/link";
import { client } from "../../../sanity/client";
import { formatDate } from "../../../utils/date-utils";
import FeaturedClient from "./FeaturedClient";

// Query responsiva - busca posts em destaque diferentes dos últimos posts
const featuredPostsQuery = `*[_type == "post"] | order(date desc) [3...20] {
  _id,
  title,
  "slug": slug.current,
  date
}`;

// Server Component - busca dados no servidor
export default async function Featured() {
  let featuredPosts = [];
  let error = null;

  try {
    featuredPosts = await client.fetch(featuredPostsQuery);
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