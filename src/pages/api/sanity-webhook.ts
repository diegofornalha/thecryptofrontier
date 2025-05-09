import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@sanity/client';
import algoliasearch from 'algoliasearch';

// Cliente Sanity
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
  useCdn: false, // Precisamos de dados em tempo real, não em cache
  token: process.env.SANITY_API_TOKEN // Token com permissão apenas de leitura
});

// Cliente Algolia
const algoliaClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  process.env.ALGOLIA_ADMIN_API_KEY || ''
);

// Índice do Algolia
const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'development_mcpx_content';
const index = algoliaClient.initIndex(indexName);

// Função para truncar conteúdo muito longo
function truncateContent(content: string, maxLength = 5000): string {
  if (content && content.length > maxLength) {
    return content.substring(0, maxLength) + '...';
  }
  return content;
}

// Função para formatar documento do Sanity para indexação no Algolia
async function formatDocumentForAlgolia(doc: any) {
  // Verificamos se é um post
  if (doc._type !== 'post') {
    return null;
  }

  // Para posts, precisamos buscar informações do autor
  let authorName = 'Desconhecido';
  if (doc.author && doc.author._ref) {
    try {
      const author = await sanityClient.fetch(
        `*[_id == $authorId][0]{name}`,
        { authorId: doc.author._ref }
      );
      if (author && author.name) {
        authorName = author.name;
      }
    } catch (error) {
      console.error('Erro ao buscar autor:', error);
    }
  }

  // Extrair conteúdo textual do conteúdo do portableText
  let textContent = '';
  if (doc.content) {
    try {
      // Simplificação para extrair texto. Em produção, use bibliotecas como @portabletext/react
      doc.content.forEach((block: any) => {
        if (block._type === 'block') {
          block.children.forEach((child: any) => {
            if (child._type === 'span') {
              textContent += child.text + ' ';
            }
          });
          textContent += '\n';
        }
      });
    } catch (error) {
      console.error('Erro ao extrair texto do conteúdo:', error);
    }
  }

  // Calcular tempo de leitura aproximado (baseado em 200 palavras por minuto)
  const wordCount = textContent.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Objeto para indexação no Algolia
  return {
    objectID: doc._id,
    title: doc.title || '',
    content: truncateContent(textContent),
    excerpt: doc.excerpt || (textContent ? truncateContent(textContent, 160) : ''),
    date: doc.publishedAt ? new Date(doc.publishedAt).getTime() : null,
    categories: doc.categories || [],
    permalink: doc.slug ? `/post/${doc.slug.current}/` : '/',
    fullPath: doc.slug ? `/post/${doc.slug.current}/` : '/',
    featuredImage: doc.featuredImage?.asset?._ref || null,
    authorName,
    timeToRead: readingTime,
    _updatedAt: doc._updatedAt,
    _type: doc._type
  };
}

export default async function sanityWebhook(req: NextApiRequest, res: NextApiResponse) {
  // Verifique se a solicitação é um POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  // Verifique o token secreto do webhook (se configurado)
  const webhookSecret = process.env.SANITY_WEBHOOK_SECRET;
  if (webhookSecret && req.headers['x-sanity-webhook-secret'] !== webhookSecret) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  try {
    // Extrai informações do payload do webhook
    const { _id, _type, operation } = req.body;

    console.log(`Webhook recebido: ${operation} para documento ${_id} do tipo ${_type}`);

    // Se for para excluir, removemos do Algolia
    if (operation === 'delete') {
      await index.deleteObject(_id);
      return res.status(200).json({ 
        message: `Documento ${_id} removido do Algolia com sucesso` 
      });
    }

    // Para criação ou atualização, busque o documento completo no Sanity
    if (['create', 'update'].includes(operation)) {
      // Para posts, precisamos dados específicos incluindo conteúdo
      const documentQuery = `*[_id == $id][0]`;
      const document = await sanityClient.fetch(documentQuery, { id: _id });

      // Só indexamos documentos do tipo "post"
      if (document._type === 'post') {
        const algoliaObject = await formatDocumentForAlgolia(document);
        
        if (algoliaObject) {
          // Salva no Algolia
          await index.saveObject(algoliaObject);
          return res.status(200).json({ 
            message: `Documento ${_id} indexado no Algolia com sucesso`,
            document: algoliaObject.title
          });
        }
      }
      
      return res.status(200).json({ 
        message: `Documento ${_id} não é do tipo suportado para indexação` 
      });
    }

    // Para outros tipos de operações não suportadas
    return res.status(200).json({ message: 'Operação não suportada' });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return res.status(500).json({ 
      message: 'Erro interno ao processar webhook',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
} 