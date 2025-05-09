import { defineConfig } from '@sanity/cli';

export default defineConfig({
  name: 'thecryptofrontier',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  plugins: [
    // Adicione plugins conforme necessário
  ],
  schema: {
    types: [],
  },
  api: {
    // Configuração da API Sanity
  },
});
