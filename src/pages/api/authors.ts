import { NextApiRequest, NextApiResponse } from 'next'
import { client } from '../../sanity/lib/client'

type Author = {
  _id: string
  name: string
  slug: { current: string }
  role?: string
  imageUrl?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    // Consulta GROQ para buscar os autores
    const query = `*[_type == "author"] | order(name asc) {
      _id,
      name,
      slug,
      role,
      "imageUrl": image.asset->url
    }`

    const authors: Author[] = await client.fetch(query)
    
    return res.status(200).json({ 
      success: true, 
      authors,
      count: authors.length
    })
  } catch (error) {
    console.error('Erro ao buscar autores:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar autores',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
} 