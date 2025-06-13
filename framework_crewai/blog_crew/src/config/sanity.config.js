/**
 * Configuração do Sanity CMS
 * Este arquivo contém as configurações necessárias para conexão com o Sanity
 */
import { defineConfig } from 'sanity'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './src/sanity/schemaTypes/index.js'

export default defineConfig({
  name: 'crypto-frontier',
  title: 'The Crypto Frontier',
  
  projectId: 'uvuq2a47',
  dataset: 'production',
  apiVersion: '2023-05-03',
  
  plugins: [
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
}); 