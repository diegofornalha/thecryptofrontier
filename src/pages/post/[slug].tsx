import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import React from 'react'
import { client } from '../../sanity/lib/client'
import { useRouter } from 'next/router'

// Tipo para o post
type Author = {
  _id: string
  name: string
  slug: { current: string }
  role?: string
  image?: any
}

type Post = {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt: string
  author?: Author
  categories?: string[]
  content?: any[]
  featuredImage?: any
  featuredImageUrl?: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    socialImage?: any
  }
}

type PostProps = {
  post: Post
}

export default function Post({ post }: PostProps) {
  const router = useRouter()

  // Se a página estiver em fallback
  if (router.isFallback) {
    return <div className="container mx-auto px-5 py-24">Carregando...</div>
  }

  return (
    <>
      <Head>
        <title>{post?.seo?.metaTitle || post?.title || 'Post'} | The Crypto Frontier</title>
        <meta name="description" content={post?.seo?.metaDescription || post?.excerpt || ''} />
      </Head>

      <div className="container mx-auto px-5 py-24">
        <div className="max-w-4xl mx-auto">
          <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Voltar para o blog
          </Link>

          {post.featuredImageUrl && (
            <div className="w-full h-80 bg-gray-200 mb-8 rounded-lg overflow-hidden">
              <img 
                src={post.featuredImageUrl} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-4xl font-bold mb-5">{post.title}</h1>
          
          {post.author && (
            <div className="flex items-center mb-8">
              <span className="text-gray-600">Por {post.author.name}</span>
              {post.author.role && (
                <span className="ml-2 text-gray-500">({post.author.role})</span>
              )}
              <span className="ml-4 text-gray-500">
                {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}

          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.categories.map((category) => (
                <span 
                  key={category} 
                  className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {post.excerpt && (
            <div className="text-xl text-gray-700 mb-8 italic border-l-4 border-blue-500 pl-4 py-2">
              {post.excerpt}
            </div>
          )}

          {/* Renderização simples do conteúdo portableText para demonstração */}
          <div className="prose lg:prose-xl max-w-none">
            {post.content && post.content.map((block, index) => {
              // Blocos de texto normais
              if (block._type === 'block') {
                if (block.style === 'h2') {
                  return (
                    <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                      {block.children.map((child: any) => child.text).join(' ')}
                    </h2>
                  )
                } else if (block.style === 'h3') {
                  return (
                    <h3 key={index} className="text-xl font-bold mt-6 mb-3">
                      {block.children.map((child: any) => child.text).join(' ')}
                    </h3>
                  )
                } else {
                  // Parágrafo normal
                  return (
                    <p key={index} className="mb-4">
                      {block.children.map((child: any, i: number) => (
                        <React.Fragment key={i}>
                          {child.text}
                        </React.Fragment>
                      ))}
                    </p>
                  )
                }
              }
              
              // Blocos de imagem
              if (block._type === 'image' && block.asset) {
                return (
                  <figure key={index} className="my-8">
                    <img 
                      src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${block.asset._ref.replace('image-', '').replace('-jpg', '.jpg')}`} 
                      alt={block.alt || 'Imagem do post'} 
                      className="w-full rounded-lg"
                    />
                    {block.caption && (
                      <figcaption className="text-center text-gray-500 mt-2">{block.caption}</figcaption>
                    )}
                  </figure>
                )
              }
              
              // Blocos de código
              if (block._type === 'code') {
                return (
                  <pre key={index} className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto my-6">
                    <code>{block.code}</code>
                  </pre>
                )
              }
              
              return null
            })}
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Voltar para o blog
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Buscar todos os slugs de posts do Sanity
  const paths = await client.fetch(
    `*[_type == "post" && defined(slug.current)][].slug.current`
  )

  return {
    paths: paths.map((slug: string) => ({ params: { slug } })),
    fallback: true, // Gerar páginas sob demanda para novos posts
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // Obter o slug dos parâmetros da URL
  const { slug = "" } = params as { slug: string }
  
  // Buscar o post com o slug correspondente
  const post = await client.fetch(`
    *[_type == "post" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      categories,
      "author": author->{
        _id,
        name,
        slug,
        role,
        "imageUrl": image.asset->url
      },
      content,
      "featuredImageUrl": featuredImage.asset->url,
      seo
    }
  `, { slug })
  
  // Se não encontrar o post, retornar 404
  if (!post) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      post
    },
    revalidate: 60 // Atualizar a página a cada 60 segundos
  }
} 