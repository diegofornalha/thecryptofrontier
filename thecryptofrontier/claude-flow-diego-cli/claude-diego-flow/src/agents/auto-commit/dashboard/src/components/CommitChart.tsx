import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChartData {
  time: string;
  commits: number;
  changes: number;
}

export function CommitChart() {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    // Gerar dados de exemplo - em produção, isso viria da API
    const generateSampleData = () => {
      const now = new Date();
      const data: ChartData[] = [];
      
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
          time: format(time, 'HH:mm'),
          commits: Math.floor(Math.random() * 5),
          changes: Math.floor(Math.random() * 20),
        });
      }
      
      return data;
    };

    setData(generateSampleData());

    // Atualizar a cada minuto
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          time: format(new Date(), 'HH:mm'),
          commits: Math.floor(Math.random() * 5),
          changes: Math.floor(Math.random() * 20),
        });
        return newData;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
          Atividade nas Últimas 24 Horas
        </h2>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => value}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
              }}
              labelFormatter={(label) => `Horário: ${label}`}
              formatter={(value: number, name: string) => {
                const label = name === 'commits' ? 'Commits' : 'Mudanças';
                return [`${value}`, label];
              }}
            />
            <Line 
              type="monotone" 
              dataKey="commits" 
              stroke="#2563eb" 
              strokeWidth={2}
              dot={{ fill: '#2563eb', r: 4 }}
              activeDot={{ r: 6 }}
              name="commits"
            />
            <Line 
              type="monotone" 
              dataKey="changes" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              name="changes"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary-600 rounded-full mr-2"></div>
          <span className="text-gray-600">Commits</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-success-600 rounded-full mr-2"></div>
          <span className="text-gray-600">Mudanças</span>
        </div>
      </div>
    </div>
  );
}