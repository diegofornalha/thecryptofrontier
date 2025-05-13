// Document schemas
import post from './documents/post.js'
import category from './documents/category.js'
import tag from './documents/tag.js'
import author from './documents/author.js'

// Object schemas
import blockContent from './objects/blockContent.js'
import mainImage from './objects/mainImage.js'
import seo from './objects/seo.js'
import cryptoMeta from './objects/cryptoMeta.js'

// Settings schemas
import siteConfig from './settings/siteConfig.js'
import blogConfig from './settings/blogConfig.js'

export const schemaTypes = [
  // Documents
  post,
  category,
  tag,
  author,
  
  // Objects
  blockContent,
  mainImage,
  seo,
  cryptoMeta,
  
  // Settings
  siteConfig,
  blogConfig,
] 