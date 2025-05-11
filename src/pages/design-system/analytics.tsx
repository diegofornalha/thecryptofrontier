"use client"

import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  LineChart, 
  PieChart 
} from '@/components/ui/charts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalyticsService from '@/lib/analytics';

type ComponentUsage = {
  component: string;
  count: number;
  lastUsed: string;
  mostUsedProps: {
    prop: string;
    count: number;
  }[];
};

type AnalyticsData = {
  componentUsage: ComponentUsage[];
};

export default function DesignSystemAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetch('/api/design-system/analytics').then(res => res.json());
        setData(result);
      } catch (err) {
        console.error('Erro ao buscar dados de analytics:', err);
        setError('Houve um erro ao carregar os dados de analytics.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Processar dados para os gráficos
  const processDataForCharts = () => {
    if (!data?.componentUsage) return null;
    
    // Dados para o gráfico de barras de uso de componentes
    const componentUsageData = data.componentUsage
      .slice(0, 10)
      .map(item => ({
        label: item.component,
        value: item.count
      }));
    
    // Dados para o gráfico de pizza de distribuição de uso
    const componentDistributionData = data.componentUsage
      .slice(0, 7) // Limitar a 7 componentes + "Outros"
      .map(item => ({
        label: item.component,
        value: item.count
      }));
    
    // Adicionar "Outros" se houver mais de 7 componentes
    if (data.componentUsage.length > 7) {
      const othersCount = data.componentUsage
        .slice(7)
        .reduce((sum, item) => sum + item.count, 0);
      
      componentDistributionData.push({
        label: 'Outros',
        value: othersCount
      });
    }
    
    return {
      componentUsageData,
      componentDistributionData
    };
  };
  
  const chartData = processDataForCharts();
  
  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-t-blue-500 border-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-500">Carregando dados...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">
            <p className="font-medium">Erro ao carregar dados</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!data || !chartData) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-lg">Nenhum dado disponível</p>
          <p className="text-sm text-gray-500 mt-2">Ainda não há dados de uso de componentes registrados.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Design System Analytics</h1>
      
      <Tabs defaultValue="usage">
        <TabsList className="mb-6">
          <TabsTrigger value="usage">Uso de Componentes</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="usage">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Componentes Mais Usados</CardTitle>
                <CardDescription>Os 10 componentes mais utilizados na aplicação</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={chartData.componentUsageData} height={250} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Uso ao Longo do Tempo</CardTitle>
                <CardDescription>Esta funcionalidade estará disponível em breve</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center min-h-[250px]">
                <p className="text-gray-400">Dados temporais serão exibidos aqui</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="distribution">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Uso</CardTitle>
                <CardDescription>Proporção de uso entre os componentes</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart data={chartData.componentDistributionData} height={250} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Propriedades Mais Usadas</CardTitle>
                <CardDescription>Esta funcionalidade estará disponível em breve</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center min-h-[250px]">
                <p className="text-gray-400">Dados de propriedades serão exibidos aqui</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes de Uso por Componente</CardTitle>
              <CardDescription>Lista de todos os componentes e suas métricas de uso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left px-4 py-2 bg-gray-50 border">Componente</th>
                      <th className="text-left px-4 py-2 bg-gray-50 border">Contagem</th>
                      <th className="text-left px-4 py-2 bg-gray-50 border">Último Uso</th>
                      <th className="text-left px-4 py-2 bg-gray-50 border">Props Mais Usadas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.componentUsage.map((component, index) => (
                      <tr key={index} className={(index % 2 === 0) ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 border">{component.component}</td>
                        <td className="px-4 py-2 border">{component.count}</td>
                        <td className="px-4 py-2 border">
                          {new Date(component.lastUsed).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-2 border">
                          {component.mostUsedProps.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {component.mostUsedProps.map((prop, idx) => (
                                <li key={idx} className="text-sm">
                                  {prop.prop} ({prop.count})
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400">Nenhuma prop registrada</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 