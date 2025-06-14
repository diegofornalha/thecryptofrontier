import { createClient } from '@strapi/client';

// Utiliza as variáveis de ambiente para configuração
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_strapi_PROJECT_ID || 'z4sx85c6', // ID padrão como fallback
  dataset: process.env.NEXT_PUBLIC_strapi_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_strapi_API_VERSION || '2023-05-03',
  useCdn: true // Usar CDN para melhor performance no frontend
});

export default client; 