#!/bin/bash
# Script para atualizar o blog preview com dados mockados

echo "🔄 Atualizando Blog Preview..."

# Criar dados mockados
cat > /tmp/mock-posts.json << 'EOF'
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "DeFi Yield Farming em 2025: Como o Mercado de $129 Bilhões Está Revolucionando as Finanças",
        "slug": "defi-yield-farming-2025-mercado-129-bilhoes-revolucionando-financas",
        "content": "# DeFi Yield Farming em 2025\n\nVocê sabia que o mercado de DeFi alcançou impressionantes $129 bilhões em valor total bloqueado (TVL) no início de 2025? Esse crescimento de 137% ano a ano não é apenas um número – é a prova de que as finanças descentralizadas estão redefinindo como pensamos sobre investimentos e retornos passivos.\n\n## O Que Mudou no Yield Farming em 2025\n\n### A Era do Liquid Staking\n\nO liquid staking emergiu como a força dominante no ecossistema DeFi, com um TVL impressionante de $63 bilhões. Protocolos como Lido lideram essa revolução, permitindo que investidores mantenham liquidez enquanto participam do staking.\n\nEssa evolução representa uma mudança fundamental: de $919 milhões em agosto de 2023 para $63 bilhões em março de 2024, o liquid staking provou que é possível ter segurança e flexibilidade simultaneamente.",
        "excerpt": "Descubra como o mercado de DeFi alcançou $129 bilhões em TVL com crescimento de 137% ano a ano. Este guia completo explora as últimas estratégias de yield farming, liquid staking e cross-chain farming para maximizar seus retornos em 2025.",
        "publishedAt": "2025-06-16T06:00:00.000Z",
        "createdAt": "2025-06-16T06:00:00.000Z",
        "updatedAt": "2025-06-16T06:00:00.000Z"
      }
    },
    {
      "id": 2,
      "attributes": {
        "title": "Blockchain e IA: A Convergência que Define 2025",
        "slug": "blockchain-ia-convergencia-2025",
        "content": "# Blockchain e IA: A Convergência que Define 2025\n\nA integração entre blockchain e inteligência artificial está criando oportunidades sem precedentes no mundo cripto...",
        "excerpt": "Explore como a convergência entre blockchain e IA está revolucionando o ecossistema cripto em 2025.",
        "publishedAt": "2025-06-15T12:00:00.000Z",
        "createdAt": "2025-06-15T12:00:00.000Z",
        "updatedAt": "2025-06-15T12:00:00.000Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 2
    }
  }
}
EOF

# Criar página com dados estáticos temporariamente
cat > /tmp/static-page.js << 'EOF'
export default function Home() {
  const posts = [
    {
      id: 1,
      title: "DeFi Yield Farming em 2025: Como o Mercado de $129 Bilhões Está Revolucionando as Finanças",
      slug: "defi-yield-farming-2025-mercado-129-bilhoes-revolucionando-financas",
      excerpt: "Descubra como o mercado de DeFi alcançou $129 bilhões em TVL com crescimento de 137% ano a ano.",
      publishedAt: "2025-06-16"
    },
    {
      id: 2,
      title: "Blockchain e IA: A Convergência que Define 2025",
      slug: "blockchain-ia-convergencia-2025",
      excerpt: "Explore como a convergência entre blockchain e IA está revolucionando o ecossistema cripto.",
      publishedAt: "2025-06-15"
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">The Crypto Frontier</h1>
          <p className="text-lg text-gray-600">Blog automatizado com IA - Preview</p>
        </div>
        
        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                <a href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                  {post.title}
                </a>
              </h2>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  📅 {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                </span>
                <a href={`/blog/${post.slug}`} className="text-blue-600 hover:text-blue-800 font-medium">
                  Ler mais →
                </a>
              </div>
            </article>
          ))}
        </div>
        
        <div className="mt-10 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">🤖 Status do Pipeline</h3>
          <ul className="space-y-1 text-sm">
            <li>✅ RSS Feed: Funcionando</li>
            <li>✅ Análise de Tendências: Ativo</li>
            <li>✅ Geração de Conteúdo: Claude CLI</li>
            <li>✅ SEO Otimizado: 100%</li>
            <li>⏳ Publicação Automática: Aguardando JWT</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
EOF

echo "✅ Arquivos de mock criados"

# Informações
echo ""
echo "📋 Status do Blog Preview:"
echo "- URL: https://ale-blog-preview.agentesintegrados.com/"
echo "- Container: blog-preview (porta 3012)"
echo "- Caddy: Configurado e funcionando"
echo ""
echo "⚠️  Nota: O blog está tentando buscar posts da API do Strapi"
echo "   Como as permissões públicas estão bloqueadas, ele mostra 'Loading...'"
echo ""
echo "Para funcionar completamente:"
echo "1. Configure as permissões públicas no Strapi (GET /posts)"
echo "2. Ou crie um usuário e use autenticação JWT"
echo "3. Ou use dados mockados temporariamente"