import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import React from 'react'
import { client } from '../sanity/lib/client'

type Post = {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt: string
  categories?: string[]
  author?: {
    name: string
    role?: string
  }
  featuredImageUrl?: string
}

type BlogProps = {
  posts: Post[]
}

export default function Blog({ posts }: BlogProps) {
  return (
    <>
      <Head>
        <title>Blog | The Crypto Frontier</title>
        <meta name="description" content="Artigos e tutoriais sobre criptomoedas e blockchain" />
      </Head>

      <div className="container mx-auto px-5 py-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-10 text-center">Blog</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <div key={post._id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                {post.featuredImageUrl && (
                  <div className="h-48 bg-gray-200 relative">
                    <img 
                      src={post.featuredImageUrl} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">
                    <Link href={`/post/${post.slug.current}`} className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  
                  {post.categories && post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.categories.map((category) => (
                        <span 
                          key={category} 
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500 mb-3">
                    {post.publishedAt && (
                      <time dateTime={post.publishedAt}>
                        {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </time>
                    )}
                    {post.author && (
                      <span> · {post.author.name}</span>
                    )}
                  </div>
                  
                  {post.excerpt && (
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  )}
                  
                  <Link 
                    href={`/post/${post.slug.current}`} 
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors"
                  >
                    Ler mais
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  // Buscar todos os posts ordenados pela data de publicação
  const posts = await client.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      categories,
      "author": author->{
        name,
        role
      },
      "featuredImageUrl": featuredImage.asset->url
    }
  `)
  
  return {
    props: {
      posts
    },
    revalidate: 60 // Atualizar a cada minuto
  }
} 