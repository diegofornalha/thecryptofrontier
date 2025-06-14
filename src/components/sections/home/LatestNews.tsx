import React from "react";
import Link from "next/link";
import { client } from "@/lib/strapiClient";
import LatestNewsClient from "./LatestNewsClient";

interface NewsItem {
  _id: string;
  title: string;
  slug: string;
  author?: {
    name?: string;
  };
  publishedAt: string;
}

// Query responsiva - busca mais notícias para filtrar depois
const latestNewsQuery = `*[_type == "post"] | order(publishedAt desc) [0...15] {
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  author-> {
    name
  }
}`;

// Server Component
export default async function LatestNews() {
  let newsItems: NewsItem[] = [];
  let error = null;

  try {
    newsItems = await client.fetch(latestNewsQuery);
  } catch (err) {
    console.error('Erro ao buscar últimas notícias:', err);
    error = err;
  }

  // Se houver erro ou não houver notícias
  if (error || !newsItems || newsItems.length === 0) {
    return (
      <div className="w-full bg-white p-4">
        <h3 className="text-lg font-bold mb-4 text-gray-900">
          Últimas Notícias
        </h3>
        <p className="text-gray-500 text-center">
          {error ? "Erro ao carregar notícias." : "Nenhuma notícia disponível no momento."}
        </p>
      </div>
    );
  }

  // Passa as notícias para o componente cliente
  return <LatestNewsClient newsItems={newsItems} />;
}