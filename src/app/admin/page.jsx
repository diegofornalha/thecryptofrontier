import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuickPublish from '@/components/admin/quick-publish';
import { FileText, Upload, Terminal, Settings, BarChart, PlusCircle, Eye, Zap } from 'lucide-react';
export default function AdminDashboard() {
    return (<div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel de Administração
          </h1>
          <p className="text-gray-600">
            Gerencie seu conteúdo de forma rápida e eficiente
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/publish">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <PlusCircle className="w-6 h-6 text-blue-600"/>
                </div>
                <div>
                  <h3 className="font-semibold">Novo Post</h3>
                  <p className="text-sm text-gray-600">Criar post completo</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/blog">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Eye className="w-6 h-6 text-green-600"/>
                </div>
                <div>
                  <h3 className="font-semibold">Ver Blog</h3>
                  <p className="text-sm text-gray-600">Visualizar posts</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="#cli">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Terminal className="w-6 h-6 text-purple-600"/>
                </div>
                <div>
                  <h3 className="font-semibold">CLI</h3>
                  <p className="text-sm text-gray-600">Comandos rápidos</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href={`${process.env.NEXT_PUBLIC_STRAPI_URL}/admin`} target="_blank">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Settings className="w-6 h-6 text-orange-600"/>
                </div>
                <div>
                  <h3 className="font-semibold">Strapi Admin</h3>
                  <p className="text-sm text-gray-600">Painel completo</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Publish Widget */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500"/>
              Publicação Rápida
            </h2>
            <QuickPublish />
          </div>

          {/* CLI Commands */}
          <div id="cli">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5"/>
                  Comandos CLI Úteis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <code className="text-sm font-mono">npm run strapi:test</code>
                    <p className="text-xs text-gray-600 mt-1">Testar conexão com Strapi</p>
                  </div>
                  
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <code className="text-sm font-mono">npm run publish-article artigo.md</code>
                    <p className="text-xs text-gray-600 mt-1">Publicar arquivo markdown</p>
                  </div>
                  
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <code className="text-sm font-mono">npm run strapi list</code>
                    <p className="text-xs text-gray-600 mt-1">Listar todos os posts</p>
                  </div>
                  
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <code className="text-sm font-mono">npm run strapi:setup</code>
                    <p className="text-xs text-gray-600 mt-1">Configurar token de API</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Tools */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Ferramentas Avançadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <Upload className="w-8 h-8 text-blue-600 mb-3"/>
                <h3 className="font-semibold mb-2">Upload em Massa</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Importe múltiplos posts de arquivos JSON ou markdown
                </p>
                <Button variant="outline" size="sm">
                  Em breve
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <BarChart className="w-8 h-8 text-green-600 mb-3"/>
                <h3 className="font-semibold mb-2">Analytics</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Visualize estatísticas de posts e engajamento
                </p>
                <Button variant="outline" size="sm">
                  Em breve
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <FileText className="w-8 h-8 text-purple-600 mb-3"/>
                <h3 className="font-semibold mb-2">Templates</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Use templates pré-definidos para criar posts
                </p>
                <Button variant="outline" size="sm">
                  Em breve
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>);
}
