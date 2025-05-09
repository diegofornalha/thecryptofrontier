import { getClient } from './client';

// Consultas GROQ para buscar dados do Sanity

// Consulta para buscar todas as páginas
export async function getAllPages() {
  const client = getClient();
  return client.fetch(`*[_type == "page"] {
    _id,
    title,
    slug {
      current
    }
  }`);
}

// Consulta para buscar uma página específica por slug
export async function getPageBySlug(slug: string) {
  const client = getClient();
  return client.fetch(`*[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    content
  }`, { slug });
}

// Consulta para buscar configurações do site
export async function getSiteConfig() {
  const client = getClient();
  return client.fetch(`*[_type == "siteConfig"][0] {
    title,
    "favicon": favicon.asset->url,
    "defaultSocialImage": defaultSocialImage.asset->url
  }`);
}

// Consulta para buscar configurações do cabeçalho
export async function getHeader() {
  const client = getClient();
  return client.fetch(`*[_type == "header"][0] {
    title,
    navLinks
  }`);
}

// Consulta para buscar configurações do rodapé
export async function getFooter() {
  const client = getClient();
  return client.fetch(`*[_type == "footer"][0] {
    copyrightText,
    navLinks
  }`);
} 