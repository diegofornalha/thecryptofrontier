import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03';

// Cliente padrão - para uso geral
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Ativar CDN para melhor performance
});

// Cliente para uso em ambiente de servidor - com token de implantação
export const deployClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_DEPLOY_TOKEN,
});

// Cliente para uso em ambiente de desenvolvimento
export const devClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Utilitário para URLs de imagem
const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// Função para determinar qual cliente usar com base no ambiente
export function getClient(preview?: boolean) {
  // Se for modo preview, use o devClient
  if (preview) {
    return devClient;
  }
  
  // Em produção, use deployClient se estivermos no servidor
  if (typeof window === 'undefined') {
    return deployClient;
  }
  
  // No cliente, use o cliente padrão (sem token)
  return client;
} 