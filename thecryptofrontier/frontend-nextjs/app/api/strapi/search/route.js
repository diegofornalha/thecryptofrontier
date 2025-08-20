import { NextResponse } from 'next/server';
import strapiClient from '@/lib/strapiClient';
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');
        if (!query) {
            return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
        }
        const response = await strapiClient.searchPosts(query, {
            page,
            pageSize
        });
        return NextResponse.json(response);
    }
    catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({
            error: 'Erro na busca',
            data: [],
            meta: { pagination: { total: 0, page: 1, pageSize: 10, pageCount: 0 } }
        }, { status: 500 });
    }
}
