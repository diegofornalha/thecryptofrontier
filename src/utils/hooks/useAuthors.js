import { useState, useEffect } from 'react';
import { client } from '../../strapi/lib/client';
// Hook para buscar autores
export function useAuthors() {
    const [authors, setAuthors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        async function fetchAuthors() {
            try {
                setIsLoading(true);
                setError(null);
                // Consulta GROQ para buscar os autores
                const query = `*[_type == "author"] | order(name asc) {
          _id,
          name,
          slug,
          role,
          "imageUrl": image.asset->url,
          bio,
          socialLinks
        }`;
                const result = await client.fetch(query);
                setAuthors(result);
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error('Erro ao buscar autores'));
                console.error('Erro ao buscar autores:', err);
            }
            finally {
                setIsLoading(false);
            }
        }
        fetchAuthors();
    }, []);
    return { authors, isLoading, error };
}
// Função para buscar um autor específico pelo slug
export async function getAuthorBySlug(slug) {
    try {
        const query = `*[_type == "author" && slug.current == $slug][0] {
      _id,
      name,
      slug,
      role,
      "imageUrl": image.asset->url,
      bio,
      socialLinks
    }`;
        const author = await client.fetch(query, { slug });
        return author;
    }
    catch (error) {
        console.error(`Erro ao buscar autor com slug "${slug}":`, error);
        return null;
    }
}
