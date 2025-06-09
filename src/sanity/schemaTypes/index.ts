// Esquema do Sanity
import { SchemaTypeDefinition } from 'sanity';

// Tipos de documentos principais
import page from './documents/page';
import post from './documents/post';
// agentPost removido - consolidado com post usando campo 'source'
// category removido - não está sendo usado
import author from './documents/author';
// tag removido - não está sendo usado

// Tipos de configuração
import siteConfig from './settings/siteConfig';
import header from './settings/header';
import footer from './settings/footer';

// Tipos de objetos reutilizáveis
import mainImage from './objects/mainImage';
import seo from './objects/seo';
import navLink from './objects/navLink';
import highlightBox from './objects/highlightBox';
import cryptoWidget from './objects/cryptoWidget';
import embedBlock from './objects/embedBlock';

// Exportando todos os schemas
export const schemaTypes = [
  // Documentos
  post,
  // agentPost removido - consolidado com post
  page,
  // category removido - não está sendo usado
  author,
  // tag removido - não está sendo usado
  
  // Configurações
  siteConfig,
  header,
  footer,
  
  // Objetos
  mainImage,
  seo,
  navLink,
  highlightBox,
  cryptoWidget,
  embedBlock,
];

// O schema exportado para o Sanity Studio
export const schema = {
  types: schemaTypes,
}; 