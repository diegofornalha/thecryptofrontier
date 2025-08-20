'use client';
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Upload, Eye, Send } from 'lucide-react';
export default function PublishPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [preview, setPreview] = useState(false);
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        tags: '',
        category: '',
        metaTitle: '',
        metaDescription: ''
    });
    // Handle markdown file upload
    const handleFileUpload = useCallback((e) => {
        var _a;
        const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (event) => {
            var _a, _b, _c, _d;
            const content = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
            // Parse markdown file
            const titleMatch = content.match(/^## Título:\s*(.+)$/m);
            const slugMatch = content.match(/^## Slug:\s*(.+)$/m);
            const resumoMatch = content.match(/^## Resumo:\s*(.+)$/m);
            const tagsMatch = content.match(/^## Tags:\s*(.+)$/m);
            const categoriasMatch = content.match(/^## Categorias:\s*(.+)$/m);
            const seoTitleMatch = content.match(/Meta Título:\s*(.+)$/m);
            const seoDescMatch = content.match(/Meta Descrição:\s*(.+)$/m);
            const contentMatch = content.match(/## CONTEÚDO COMPLETO:\s*([\s\S]+)$/);
            setFormData({
                title: (titleMatch === null || titleMatch === void 0 ? void 0 : titleMatch[1]) || '',
                slug: (slugMatch === null || slugMatch === void 0 ? void 0 : slugMatch[1]) || '',
                content: ((_b = contentMatch === null || contentMatch === void 0 ? void 0 : contentMatch[1]) === null || _b === void 0 ? void 0 : _b.trim()) || '',
                excerpt: (resumoMatch === null || resumoMatch === void 0 ? void 0 : resumoMatch[1]) || '',
                tags: (tagsMatch === null || tagsMatch === void 0 ? void 0 : tagsMatch[1]) || '',
                category: ((_d = (_c = categoriasMatch === null || categoriasMatch === void 0 ? void 0 : categoriasMatch[1]) === null || _c === void 0 ? void 0 : _c.split(',')[0]) === null || _d === void 0 ? void 0 : _d.trim()) || '',
                metaTitle: (seoTitleMatch === null || seoTitleMatch === void 0 ? void 0 : seoTitleMatch[1]) || '',
                metaDescription: (seoDescMatch === null || seoDescMatch === void 0 ? void 0 : seoDescMatch[1]) || ''
            });
            setMessage('Arquivo carregado com sucesso!');
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        };
        reader.readAsText(file);
    }, []);
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');
        try {
            const response = await fetch('/api/strapi/publish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                    publish: true
                })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setStatus('success');
                setMessage(`Post publicado com sucesso! Redirecionando...`);
                // Redirect to the published post after 2 seconds
                setTimeout(() => {
                    router.push(`/post/${formData.slug}`);
                }, 2000);
            }
            else {
                throw new Error(data.error || 'Erro ao publicar');
            }
        }
        catch (error) {
            setStatus('error');
            setMessage(error instanceof Error ? error.message : 'Erro ao publicar post');
        }
        finally {
            setLoading(false);
        }
    };
    // Generate slug from title
    const generateSlug = () => {
        const slug = formData.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
        setFormData(prev => ({ ...prev, slug }));
    };
    return (<div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Send className="w-6 h-6"/>
              Publicar Novo Post
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Status Messages */}
            {status !== 'idle' && (<Alert className={`mb-6 ${status === 'success' ? 'border-green-500' : 'border-red-500'}`}>
                {status === 'success' ? (<CheckCircle className="h-4 w-4 text-green-500"/>) : (<AlertCircle className="h-4 w-4 text-red-500"/>)}
                <AlertDescription className={status === 'success' ? 'text-green-700' : 'text-red-700'}>
                  {message}
                </AlertDescription>
              </Alert>)}

            {/* File Upload */}
            <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-400"/>
                <span className="text-sm text-gray-600">
                  Clique para carregar um arquivo markdown ou preencha o formulário abaixo
                </span>
                <Input id="file-upload" type="file" accept=".md,.markdown" onChange={handleFileUpload} className="hidden"/>
              </Label>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title and Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Título do post" required/>
                </div>
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <div className="flex gap-2">
                    <Input id="slug" value={formData.slug} onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))} placeholder="url-do-post" required/>
                    <Button type="button" variant="outline" onClick={generateSlug}>
                      Gerar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <Label htmlFor="excerpt">Resumo</Label>
                <Textarea id="excerpt" value={formData.excerpt} onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))} placeholder="Breve descrição do post" rows={3}/>
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content">Conteúdo *</Label>
                <Textarea id="content" value={formData.content} onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))} placeholder="Conteúdo do post (Markdown suportado)" rows={15} required className="font-mono text-sm"/>
              </div>

              {/* Tags and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input id="tags" value={formData.tags} onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))} placeholder="bitcoin, blockchain, defi (separadas por vírgula)"/>
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Input id="category" value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} placeholder="Tecnologia"/>
                </div>
              </div>

              {/* SEO */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold">SEO</h3>
                <div>
                  <Label htmlFor="metaTitle">Meta Título</Label>
                  <Input id="metaTitle" value={formData.metaTitle} onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))} placeholder="Título para SEO (deixe vazio para usar o título principal)"/>
                </div>
                <div>
                  <Label htmlFor="metaDescription">Meta Descrição</Label>
                  <Textarea id="metaDescription" value={formData.metaDescription} onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))} placeholder="Descrição para mecanismos de busca" rows={2}/>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={() => setPreview(!preview)} disabled={!formData.content}>
                  <Eye className="w-4 h-4 mr-2"/>
                  {preview ? 'Esconder' : 'Preview'}
                </Button>
                <Button type="submit" disabled={loading || !formData.title || !formData.content}>
                  {loading ? (<>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                      Publicando...
                    </>) : (<>
                      <Send className="w-4 h-4 mr-2"/>
                      Publicar Post
                    </>)}
                </Button>
              </div>
            </form>

            {/* Preview */}
            {preview && formData.content && (<div className="mt-8 p-6 border rounded-lg bg-white">
                <h2 className="text-2xl font-bold mb-4">{formData.title || 'Título do Post'}</h2>
                {formData.excerpt && (<p className="text-gray-600 mb-4 italic">{formData.excerpt}</p>)}
                <div className="prose max-w-none">
                  {/* Simple markdown preview - in production use a proper markdown renderer */}
                  <div className="whitespace-pre-wrap">{formData.content}</div>
                </div>
              </div>)}
          </CardContent>
        </Card>
      </div>
    </div>);
}
