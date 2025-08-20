import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request) {
    try {
        const body = await request.json();
        
        // Verificar se há um token de segurança (opcional)
        const authHeader = request.headers.get('authorization');
        const webhookSecret = process.env.STRAPI_WEBHOOK_SECRET;
        
        if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        // Log do webhook recebido
        console.log('🔄 Webhook recebido do Strapi:', {
            model: body.model,
            entry: body.entry?.id,
            event: body.event,
            locale: body.entry?.locale
        });
        
        // Revalidar páginas baseado no tipo de conteúdo
        if (body.model === 'post') {
            const entry = body.entry;
            const event = body.event;
            
            // Revalidar home pages em todos os idiomas
            await revalidatePath('/en');
            await revalidatePath('/br'); 
            await revalidatePath('/es');
            
            // Revalidar páginas de posts
            await revalidatePath('/en/post');
            await revalidatePath('/br/post');
            await revalidatePath('/es/post');
            
            // Se o post foi publicado/atualizado, revalidar a página específica
            if (entry && entry.slug && (event === 'entry.publish' || event === 'entry.update')) {
                await revalidatePath(`/en/post/${entry.slug}`);
                await revalidatePath(`/br/post/${entry.slug}`);
                await revalidatePath(`/es/post/${entry.slug}`);
            }
            
            // Revalidar tags para ISR
            revalidateTag('posts');
            revalidateTag('posts-featured');
            
            console.log('✅ Revalidação concluída para:', {
                pages: ['home', 'posts'],
                locales: ['en', 'br', 'es'],
                specificPost: entry?.slug || 'N/A'
            });
        }
        
        return NextResponse.json({ 
            revalidated: true, 
            message: 'Revalidation successful',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Erro na revalidação:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            message: error.message 
        }, { status: 500 });
    }
}

// Endpoint para revalidação manual (GET)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');
        
        // Verificar secret para revalidação manual
        if (secret !== process.env.REVALIDATION_SECRET) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        
        // Revalidar todas as páginas principais
        await revalidatePath('/en');
        await revalidatePath('/br');
        await revalidatePath('/es');
        await revalidatePath('/en/post');
        await revalidatePath('/br/post');
        await revalidatePath('/es/post');
        
        return NextResponse.json({ 
            revalidated: true, 
            message: 'Manual revalidation successful',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Erro na revalidação manual:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            message: error.message 
        }, { status: 500 });
    }
} 