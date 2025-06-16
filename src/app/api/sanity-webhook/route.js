import { NextResponse } from 'next/server';
export async function POST(request) {
    try {
        // Verificar se há um token de webhook configurado como variável de ambiente
        const webhookSecret = process.env.strapi_WEBHOOK_SECRET;
        // Obter o token fornecido no cabeçalho da requisição
        const providedToken = request.headers.get('strapi-webhook-secret');
        // Verificar se o token é válido (se configurado)
        if (webhookSecret && webhookSecret !== providedToken) {
            return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
        }
        // Extrair informações do corpo da requisição
        const body = await request.json();
        const { _id, _type } = body;
        if (!_id || !_type) {
            return NextResponse.json({ message: 'Corpo da requisição inválido' }, { status: 400 });
        }
        // Se necessário, você pode acionar uma reconstrução do site no Netlify
        // através da API deles ou simplesmente registrar a alteração
        console.log(`[Webhook] Documento atualizado: ${_type} (${_id})`);
        // Aqui você pode adicionar lógica adicional como:
        // - Limpar cache específico
        // - Notificar outros serviços
        // - Atualizar Algolia
        // - Acionar rebuild do site
        return NextResponse.json({
            message: 'Webhook processado com sucesso',
            document: { _id, _type }
        }, { status: 200 });
    }
    catch (error) {
        console.error('Erro no webhook do Strapi:', error);
        return NextResponse.json({
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        }, { status: 500 });
    }
}
// Método não permitido para outras requisições
export async function GET() {
    return NextResponse.json({ message: 'Método não permitido' }, { status: 405 });
}
export async function PUT() {
    return NextResponse.json({ message: 'Método não permitido' }, { status: 405 });
}
export async function DELETE() {
    return NextResponse.json({ message: 'Método não permitido' }, { status: 405 });
}
