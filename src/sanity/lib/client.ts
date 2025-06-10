/**
 * Cliente Sanity simplificado para evitar problemas de compatibilidade
 */
import { createClient } from '@sanity/client';

// Usar valor fixo para garantir compatibilidade
const projectId = 'uvuq2a47';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Usar CDN para cache de conteúdo
});

export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

// Retorna o cliente apropriado com base no preview
export const getClient = (preview = false) => (preview ? previewClient : client); 