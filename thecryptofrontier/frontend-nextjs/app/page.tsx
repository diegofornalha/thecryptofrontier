import strapiClient from '@/lib/strapiClient';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PostCard from '@/components/post/PostCard';

// Função para buscar posts
async function getPosts() {
  try {
    const posts = await strapiClient.getPosts({
      populate: ['featuredImage', 'author'],
      sort: 'publishedAt:desc',
      pagination: {
        limit: 6
      }
    });
    return posts || [];
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return [];
  }
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif">
                The Crypto Frontier
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                Explore o futuro das finanças digitais com análises profundas, 
                notícias em tempo real e insights exclusivos sobre criptomoedas e blockchain.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/post"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Explorar Artigos
                </a>
                <a
                  href="/buscas"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Buscar Conteúdo
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Posts em Destaque */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
                Últimas Notícias
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Mantenha-se atualizado com as últimas tendências e desenvolvimentos 
                no mundo das criptomoedas.
              </p>
            </div>

            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post: any) => {
                  const data = post.attributes || post;
                  const featuredImageUrl = data.featuredImage?.url || data.featuredImage?.data?.attributes?.url;
                  const fullImageUrl = featuredImageUrl 
                    ? (featuredImageUrl.startsWith('http') 
                        ? featuredImageUrl 
                        : `${process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com'}${featuredImageUrl}`)
                    : null;

                  return (
                    <PostCard
                      key={post.id}
                      title={data.title}
                      excerpt={data.excerpt}
                      slug={data.slug}
                      publishedAt={data.publishedAt || data.createdAt}
                      author={typeof data.author === 'string' ? data.author : data.author?.data?.attributes?.name}
                      featuredImage={fullImageUrl}
                      tags={data.tags}
                      featured={data.featured}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum post encontrado</h3>
                <p className="text-gray-600 mb-4">
                  Ainda não há posts publicados. Volte em breve para conferir nosso conteúdo!
                </p>
                <a
                  href="/admin"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar Primeiro Post
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-gray-100 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">
              Fique por Dentro
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Receba as últimas notícias e análises diretamente no seu email.
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
              <input
                type="email"
                placeholder="Seu melhor email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Assinar
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Sem spam. Cancele a qualquer momento.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
