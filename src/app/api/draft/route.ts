import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { client } from '@/sanity/lib/client'

// URL do Sanity Studio para redirecionamento em caso de erro
const SANITY_STUDIO_URL = '/studio'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')
  const type = searchParams.get('type')

  // Verificação de segurança
  if (secret !== process.env.SANITY_SECRET_TOKEN) {
    return new Response('Invalid token', { status: 401 })
  }

  // Verificação do slug e tipo
  if (!slug || !type) {
    return new Response('Slug ou tipo não fornecido', { status: 400 })
  }

  // Verificando se o post/página realmente existe
  const query = `*[_type == $type && slug.current == $slug][0]._id`
  const docId = await client.fetch(query, { type, slug })

  if (!docId) {
    return new Response('Documento não encontrado', { status: 404 })
  }

  // Habilita o Draft Mode
  draftMode().enable()

  // Redireciona para a página correta
  switch (type) {
    case 'post':
      redirect(`/post/${slug}`)
    case 'page':
      redirect(`/${slug}`)
    default:
      return new Response('Tipo de documento inválido', { status: 400 })
  }
} 