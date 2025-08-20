/**
 * Configuração do Strapi CMS
 * Este arquivo contém as configurações necessárias para conexão com o Strapi
 */
import { defineConfig } from 'strapi'
import { visionTool } from '@strapi/vision'
import { schemaTypes } from './src/strapi/schemaTypes/index.js'

export default defineConfig({
  name: 'crypto-frontier',
  title: 'The Crypto Frontier',
  
  projectId: 'z4sx85c6',
  dataset: 'production',
  apiVersion: '2023-05-03',
  
  plugins: [
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
}); 