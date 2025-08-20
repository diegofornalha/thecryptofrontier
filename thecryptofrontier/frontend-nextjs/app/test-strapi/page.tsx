"use client";
import React, { useState } from 'react';

export default function TestStrapiPage() {
    const [testResult, setTestResult] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const testConnection = async () => {
        setLoading(true);
        setTestResult('');
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts`, {
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                setTestResult(`✅ Conexão bem-sucedida! Encontrados ${data.data?.length || 0} posts.`);
            } else {
                setTestResult(`❌ Erro na conexão: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            setTestResult(`❌ Erro de rede: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Teste de Conexão Strapi</h1>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Configuração Atual
                    </h2>
                    
                    <div className="space-y-2 mb-6">
                        <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_STRAPI_URL}</p>
                        <p><strong>Token:</strong> {process.env.NEXT_PUBLIC_STRAPI_API_TOKEN ? '✅ Configurado' : '❌ Não configurado'}</p>
                    </div>
                    
                    <button
                        onClick={testConnection}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Testando...' : 'Testar Conexão'}
                    </button>
                    
                    {testResult && (
                        <div className="mt-6 p-4 rounded-md bg-gray-100">
                            <p className="font-mono text-sm">{testResult}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
