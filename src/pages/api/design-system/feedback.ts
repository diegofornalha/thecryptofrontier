import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Definindo tipos
type FeedbackItem = {
  id: string;
  componentName: string;
  feedback: string;
  rating: number;
  timestamp: string;
};

type FeedbackData = {
  items: FeedbackItem[];
  stats: {
    [componentName: string]: {
      count: number;
      averageRating: number;
      ratings: {
        [rating: number]: number;
      };
    };
  };
};

// Caminho para armazenar os dados de feedback
const DATA_DIR = path.join(process.cwd(), 'data');
const FEEDBACK_FILE = path.join(DATA_DIR, 'component-feedback.json');

// Garantir que o diretório existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Função para gerar um ID único
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Função para ler os dados existentes
function readFeedbackData(): FeedbackData {
  try {
    if (fs.existsSync(FEEDBACK_FILE)) {
      const data = fs.readFileSync(FEEDBACK_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao ler dados de feedback:', error);
  }
  return { items: [], stats: {} };
}

// Função para salvar os dados
function saveFeedbackData(data: FeedbackData) {
  try {
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Erro ao salvar dados de feedback:', error);
  }
}

// Função para recalcular estatísticas
function calculateStats(items: FeedbackItem[]): FeedbackData['stats'] {
  const stats: FeedbackData['stats'] = {};
  
  items.forEach(item => {
    if (!stats[item.componentName]) {
      stats[item.componentName] = {
        count: 0,
        averageRating: 0,
        ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
    
    stats[item.componentName].count += 1;
    if (!stats[item.componentName].ratings[item.rating]) {
      stats[item.componentName].ratings[item.rating] = 0;
    }
    stats[item.componentName].ratings[item.rating] += 1;
  });
  
  // Calcular médias
  Object.keys(stats).forEach(component => {
    const totalRatings = Object.entries(stats[component].ratings)
      .reduce((sum, [rating, count]) => sum + (Number(rating) * count), 0);
    
    stats[component].averageRating = totalRatings / stats[component].count;
  });
  
  return stats;
}

// Handler da API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Permitir apenas GET e POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  // Obter dados existentes
  let feedbackData = readFeedbackData();

  // Processar solicitação GET (obter estatísticas)
  if (req.method === 'GET') {
    const { component } = req.query;
    
    if (component && typeof component === 'string') {
      // Retornar dados para um componente específico
      const componentStats = feedbackData.stats[component] || { 
        count: 0, 
        averageRating: 0, 
        ratings: {} 
      };
      
      const componentFeedback = feedbackData.items
        .filter(item => item.componentName === component)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      return res.status(200).json({
        stats: componentStats,
        feedback: componentFeedback
      });
    }
    
    // Retornar resumo de todos os componentes
    return res.status(200).json({
      stats: feedbackData.stats,
      recentFeedback: feedbackData.items
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)
    });
  }

  // Processar solicitação POST (registrar feedback)
  if (req.method === 'POST') {
    try {
      const { componentName, feedback, rating } = req.body;
      
      if (!componentName || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Dados inválidos' });
      }

      // Criar novo item de feedback
      const newFeedback: FeedbackItem = {
        id: generateId(),
        componentName,
        feedback: feedback || '',
        rating,
        timestamp: new Date().toISOString()
      };
      
      // Adicionar à lista
      feedbackData.items.push(newFeedback);
      
      // Recalcular estatísticas
      feedbackData.stats = calculateStats(feedbackData.items);
      
      // Salvar dados atualizados
      saveFeedbackData(feedbackData);
      
      return res.status(200).json({ 
        message: 'Feedback registrado com sucesso',
        id: newFeedback.id
      });
    } catch (error) {
      console.error('Erro ao processar feedback:', error);
      return res.status(500).json({ message: 'Erro ao processar feedback' });
    }
  }
} 