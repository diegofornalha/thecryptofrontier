import { NextResponse } from 'next/server';
import strapiClient from '@/lib/strapiClient';
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        // Extrair parâmetros da query
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');
        const search = searchParams.get('search') || undefined;
        const status = searchParams.get('status');
        const sort = searchParams.get('sort') || 'publishedAt:desc';
        // Buscar posts usando o cliente Strapi
        const response = await strapiClient.getPosts({
            page,
            pageSize,
            sort,
            status,
            filters: search ? {
                '$or': [
                    { title: { '$containsi': search } },
                    { content: { '$containsi': search } }
                ]
            } : undefined
        });
        return NextResponse.json(response);
    }
    catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json({
            error: 'Erro ao buscar posts',
            data: [],
            meta: { pagination: { total: 0, page: 1, pageSize: 10, pageCount: 0 } }
        }, { status: 500 });
    }
}
