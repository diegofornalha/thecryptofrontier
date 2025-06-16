'use client';
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
export default function QuickPublish() {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const handleQuickPublish = async () => {
        if (!content.trim())
            return;
        setLoading(true);
        setStatus('idle');
        try {
            // Extrai título da primeira linha
            const lines = content.trim().split('\n');
            const title = lines[0].replace(/^#\s*/, '');
            const bodyContent = lines.slice(1).join('\n').trim();
            const response = await fetch('/api/strapi/publish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    content: bodyContent || content,
                    excerpt: bodyContent.substring(0, 150) + '...',
                    publish: true
                })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setStatus('success');
                setMessage('Post publicado com sucesso!');
                setContent('');
                // Limpa mensagem após 3 segundos
                setTimeout(() => {
                    setStatus('idle');
                    setMessage('');
                }, 3000);
            }
            else {
                throw new Error(data.error || 'Erro ao publicar');
            }
        }
        catch (error) {
            setStatus('error');
            setMessage(error instanceof Error ? error.message : 'Erro ao publicar');
        }
        finally {
            setLoading(false);
        }
    };
    return (<Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Publicação Rápida</h3>
        
        {status !== 'idle' && (<Alert className={`mb-4 ${status === 'success' ? 'border-green-500' : 'border-red-500'}`}>
            {status === 'success' ? (<CheckCircle className="h-4 w-4 text-green-500"/>) : (<AlertCircle className="h-4 w-4 text-red-500"/>)}
            <AlertDescription className={status === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message}
            </AlertDescription>
          </Alert>)}

        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="# Título do Post&#10;&#10;Conteúdo do post aqui..." className="min-h-[200px] mb-4 font-mono text-sm"/>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Primeira linha será o título
          </span>
          <Button onClick={handleQuickPublish} disabled={loading || !content.trim()}>
            {loading ? (<>
                <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                Publicando...
              </>) : (<>
                <Send className="w-4 h-4 mr-2"/>
                Publicar Agora
              </>)}
          </Button>
        </div>
      </CardContent>
    </Card>);
}
