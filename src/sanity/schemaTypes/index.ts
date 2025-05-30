// Esquema do Sanity
import { SchemaTypeDefinition } from 'sanity';

// Tipos de documentos principais
import page from './documents/page';
import post from './documents/post';
import agentPost from './documents/agentPost';
import category from './documents/category';
import author from './documents/author';
import tag from './documents/tag';

// Tipos de configuração
import siteConfig from './settings/siteConfig';
import header from './settings/header';
import footer from './settings/footer';

// Tipos de objetos reutilizáveis
import mainImage from './objects/mainImage';
import seo from './objects/seo';
import navLink from './objects/navLink';
import cryptoMeta from './objects/cryptoMeta';

// Exportando todos os schemas
export const schemaTypes = [
  // Documentos
  post,
  agentPost,
  page,
  category,
  author,
  tag,
  
  // Configurações
  siteConfig,
  header,
  footer,
  
  // Objetos
  mainImage,
  seo,
  navLink,
  cryptoMeta,
];

// O schema exportado para o Sanity Studio
export const schema = {
  types: schemaTypes,
}; 