import { NextResponse } from 'next/server';
import strapiClient from '@/lib/strapiClient';
export async function GET(request, { params }) {
    var _a;
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
        }
        const response = await strapiClient.getPost(id);
        return NextResponse.json(response);
    }
    catch (error) {
        console.error('Error fetching post:', error);
        if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('404')) {
            return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Erro ao buscar post' }, { status: 500 });
    }
}
export async function PUT(request, { params }) {
    var _a, _b;
    try {
        const id = parseInt(params.id);
        const body = await request.json();
        if (isNaN(id)) {
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
        }
        const response = await strapiClient.updatePost(id, body);
        return NextResponse.json(response);
    }
    catch (error) {
        console.error('Error updating post:', error);
        if (((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('401')) || ((_b = error.message) === null || _b === void 0 ? void 0 : _b.includes('403'))) {
            return NextResponse.json({ error: 'Token de API não configurado ou sem permissão' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Erro ao atualizar post' }, { status: 500 });
    }
}
export async function DELETE(request, { params }) {
    var _a, _b;
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
        }
        const response = await strapiClient.deletePost(id);
        return NextResponse.json({ success: true, data: response });
    }
    catch (error) {
        console.error('Error deleting post:', error);
        if (((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('401')) || ((_b = error.message) === null || _b === void 0 ? void 0 : _b.includes('403'))) {
            return NextResponse.json({ error: 'Token de API não configurado ou sem permissão' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Erro ao deletar post' }, { status: 500 });
    }
}
