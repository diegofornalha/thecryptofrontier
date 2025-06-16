import { NextRequest, NextResponse } from 'next/server';
import strapiClient from '@/lib/strapiClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const response = await strapiClient.getPost(id);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error fetching post:', error);
    
    if (error.message?.includes('404')) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao buscar post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const response = await strapiClient.updatePost(id, body);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error updating post:', error);
    
    if (error.message?.includes('401') || error.message?.includes('403')) {
      return NextResponse.json(
        { error: 'Token de API não configurado ou sem permissão' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const response = await strapiClient.deletePost(id);
    return NextResponse.json({ success: true, data: response });

  } catch (error: any) {
    console.error('Error deleting post:', error);
    
    if (error.message?.includes('401') || error.message?.includes('403')) {
      return NextResponse.json(
        { error: 'Token de API não configurado ou sem permissão' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao deletar post' },
      { status: 500 }
    );
  }
}