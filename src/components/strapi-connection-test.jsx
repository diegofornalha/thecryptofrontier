'use client';
import React, { useState, useEffect } from 'react';
import strapiClient from '../lib/strapiClient';
import { adaptStrapiPostsList } from '../lib/strapiAdapters';
export default function StrapiConnectionTest() {
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [postsStatus, setPostsStatus] = useState(null);
    const [authorsStatus, setAuthorsStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const testConnection = async () => {
        var _a, _b;
        setLoading(true);
        // Teste 1: Conexão básica
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com'}/api`);
            if (response.ok) {
                setConnectionStatus({
                    success: true,
                    message: 'Conexão com Strapi estabelecida com sucesso!',
                    data: { status: response.status, url: response.url }
                });
            }
            else {
                setConnectionStatus({
                    success: false,
                    message: `Erro na conexão: ${response.status} ${response.statusText}`,
                });
            }
        }
        catch (error) {
            setConnectionStatus({
                success: false,
                message: `Erro ao conectar: ${error.message}`,
            });
        }
        // Teste 2: Buscar posts
        try {
            const postsResponse = await strapiClient.getPosts({ limit: 5 });
            const adaptedPosts = adaptStrapiPostsList(postsResponse.data || []);
            setPostsStatus({
                success: true,
                message: `${((_a = postsResponse.data) === null || _a === void 0 ? void 0 : _a.length) || 0} posts encontrados`,
                data: adaptedPosts
            });
        }
        catch (error) {
            setPostsStatus({
                success: false,
                message: `Erro ao buscar posts: ${error.message}`,
            });
        }
        // Teste 3: Buscar autores
        try {
            const authorsResponse = await strapiClient.getAuthors();
            setAuthorsStatus({
                success: true,
                message: `${((_b = authorsResponse.data) === null || _b === void 0 ? void 0 : _b.length) || 0} autores encontrados`,
                data: authorsResponse.data
            });
        }
        catch (error) {
            setAuthorsStatus({
                success: false,
                message: `Erro ao buscar autores: ${error.message}`,
            });
        }
        setLoading(false);
    };
    useEffect(() => {
        testConnection();
    }, []);
    const StatusCard = ({ title, status }) => {
        if (!status)
            return null;
        return (<div className={`p-4 rounded-lg border ${status.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <h3 className="font-semibold mb-2 flex items-center">
          <span className={`mr-2 ${status.success ? 'text-green-600' : 'text-red-600'}`}>
            {status.success ? '✓' : '✗'}
          </span>
          {title}
        </h3>
        <p className={`text-sm ${status.success ? 'text-green-700' : 'text-red-700'}`}>
          {status.message}
        </p>
        {status.data && (<details className="mt-2">
            <summary className="cursor-pointer text-sm text-gray-600">Ver detalhes</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(status.data, null, 2)}
            </pre>
          </details>)}
      </div>);
    };
    return (<div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Teste de Conexão com Strapi</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <strong>URL do Strapi:</strong> {process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com'}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Token configurado:</strong> {process.env.NEXT_PUBLIC_STRAPI_API_TOKEN ? 'Sim' : 'Não'}
          </p>
        </div>

        {loading ? (<div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Testando conexão...</p>
          </div>) : (<div className="space-y-4">
            <StatusCard title="Conexão com API" status={connectionStatus}/>
            <StatusCard title="Buscar Posts" status={postsStatus}/>
            <StatusCard title="Buscar Autores" status={authorsStatus}/>
            
            <button onClick={testConnection} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              Testar Novamente
            </button>
          </div>)}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-semibold text-yellow-800 mb-2">Próximos Passos:</h4>
          <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
            <li>Configure o token de API no arquivo .env.local</li>
            <li>Verifique se os dados estão sendo retornados corretamente</li>
            <li>Adapte os componentes para usar strapiClient ao invés de strapiClient</li>
            <li>Teste cada componente individualmente antes da migração completa</li>
          </ol>
        </div>
      </div>
    </div>);
}
