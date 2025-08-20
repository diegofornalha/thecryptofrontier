import { NextRequest, NextResponse } from 'next/server';
import strapiClient from '@/lib/strapiClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados obrigatórios
    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Título e conteúdo são obrigatórios' },
        { status: 400 }
      );
    }

    // Usar o cliente Strapi nativo
    try {
      const result = await strapiClient.createPost({
        title: body.title,
        slug: body.slug,
        content: body.content,
        excerpt: body.excerpt || '',
        publishedAt: body.publish ? new Date().toISOString() : null,
        seo: {
          metaTitle: body.metaTitle || body.title,
          metaDescription: body.metaDescription || body.excerpt || '',
          keywords: body.tags?.join(', ') || ''
        }
      });

      // Sucesso!
      return NextResponse.json({
        success: true,
        data: result.data,
        url: `/post/${result.data.attributes.slug}`
      });

    } catch (strapiError: any) {
      console.error('Strapi error:', strapiError);
      
      // Se falhar por falta de autenticação
      if (strapiError.message?.includes('401') || strapiError.message?.includes('403')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Token de API não configurado. Configure STRAPI_API_TOKEN no arquivo .env.local'
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { 
          success: false, 
          error: strapiError.message || 'Erro ao publicar no Strapi'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}