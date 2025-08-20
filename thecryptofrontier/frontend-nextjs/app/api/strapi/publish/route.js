import { NextResponse } from 'next/server';
import strapiClient from '@/lib/strapiClient';
export async function POST(request) {
    var _a, _b, _c;
    try {
        const body = await request.json();
        // Validar dados obrigatórios
        if (!body.title || !body.content) {
            return NextResponse.json({ success: false, error: 'Título e conteúdo são obrigatórios' }, { status: 400 });
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
                    keywords: ((_a = body.tags) === null || _a === void 0 ? void 0 : _a.join(', ')) || ''
                }
            });
            // Sucesso!
            return NextResponse.json({
                success: true,
                data: result.data,
                url: `/post/${result.data.attributes.slug}`
            });
        }
        catch (strapiError) {
            console.error('Strapi error:', strapiError);
            // Se falhar por falta de autenticação
            if (((_b = strapiError.message) === null || _b === void 0 ? void 0 : _b.includes('401')) || ((_c = strapiError.message) === null || _c === void 0 ? void 0 : _c.includes('403'))) {
                return NextResponse.json({
                    success: false,
                    error: 'Token de API não configurado. Configure STRAPI_API_TOKEN no arquivo .env.local'
                }, { status: 401 });
            }
            return NextResponse.json({
                success: false,
                error: strapiError.message || 'Erro ao publicar no Strapi'
            }, { status: 500 });
        }
    }
    catch (error) {
        console.error('Publish error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Erro interno do servidor'
        }, { status: 500 });
    }
}
