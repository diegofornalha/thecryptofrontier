import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Definindo tipos para eventos e análise
type TrackingEvent = {
  component: string;
  props: string[];
  timestamp: string;
};

type ComponentUsage = {
  [component: string]: {
    count: number;
    props: {
      [prop: string]: number;
    };
    lastUsed: string;
  };
};

// Caminho para armazenar os dados de analytics
const DATA_DIR = path.join(process.cwd(), 'data');
const ANALYTICS_FILE = path.join(DATA_DIR, 'component-analytics.json');

// Garantir que o diretório existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Função para ler os dados existentes
function readAnalyticsData(): ComponentUsage {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      const data = fs.readFileSync(ANALYTICS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao ler dados de analytics:', error);
  }
  return {};
}

// Função para salvar os dados
function saveAnalyticsData(data: ComponentUsage) {
  try {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Erro ao salvar dados de analytics:', error);
  }
}

// Handler da API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Permitir apenas GET e POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  // Obter dados existentes
  let analyticsData = readAnalyticsData();

  // Processar solicitação GET (obter estatísticas)
  if (req.method === 'GET') {
    return res.status(200).json({
      componentUsage: Object.entries(analyticsData).map(([component, data]) => ({
        component,
        count: data.count,
        lastUsed: data.lastUsed,
        mostUsedProps: Object.entries(data.props)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([prop, count]) => ({ prop, count }))
      })).sort((a, b) => b.count - a.count)
    });
  }

  // Processar solicitação POST (registrar uso)
  if (req.method === 'POST') {
    try {
      const { events } = req.body as { events: TrackingEvent[] };
      
      if (!Array.isArray(events)) {
        return res.status(400).json({ message: 'Dados inválidos' });
      }

      // Processar eventos
      events.forEach(event => {
        const { component, props, timestamp } = event;
        
        // Inicializar componente se não existir
        if (!analyticsData[component]) {
          analyticsData[component] = {
            count: 0,
            props: {},
            lastUsed: timestamp
          };
        }
        
        // Atualizar contagem e último uso
        analyticsData[component].count += 1;
        analyticsData[component].lastUsed = timestamp;
        
        // Atualizar contagem de props
        props.forEach(prop => {
          if (!analyticsData[component].props[prop]) {
            analyticsData[component].props[prop] = 0;
          }
          analyticsData[component].props[prop] += 1;
        });
      });
      
      // Salvar dados atualizados
      saveAnalyticsData(analyticsData);
      
      return res.status(200).json({ message: 'Eventos processados com sucesso' });
    } catch (error) {
      console.error('Erro ao processar eventos:', error);
      return res.status(500).json({ message: 'Erro ao processar eventos' });
    }
  }
} 