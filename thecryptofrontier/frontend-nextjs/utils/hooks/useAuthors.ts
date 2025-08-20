import { useState, useEffect } from 'react'
import { client } from '../../strapi/lib/client'

// Tipo para representar um autor
export type Author = {
  _id: string
  name: string
  slug: { current: string }
  role?: string
  imageUrl?: string
  bio?: any[]
  socialLinks?: {
    platform: string
    url: string
  }[]
}

// Hook para buscar autores
export function useAuthors() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchAuthors() {
      try {
        setIsLoading(true)
        setError(null)

        // Consulta GROQ para buscar os autores
        const query = `*[_type == "author"] | order(name asc) {
          _id,
          name,
          slug,
          role,
          "imageUrl": image.asset->url,
          bio,
          socialLinks
        }`

        const result = await client.fetch<Author[]>(query)
        setAuthors(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao buscar autores'))
        console.error('Erro ao buscar autores:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAuthors()
  }, [])

  return { authors, isLoading, error }
}

// Função para buscar um autor específico pelo slug
export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  try {
    const query = `*[_type == "author" && slug.current == $slug][0] {
      _id,
      name,
      slug,
      role,
      "imageUrl": image.asset->url,
      bio,
      socialLinks
    }`

    const author = await client.fetch<Author | null>(query, { slug })
    return author
  } catch (error) {
    console.error(`Erro ao buscar autor com slug "${slug}":`, error)
    return null
  }
} 