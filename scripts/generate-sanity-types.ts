#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

// Import your schema types
const schemas = {
  // Documents
  post: {
    name: 'post',
    type: 'document',
    fields: [
      {name: 'title', type: 'string'},
      {name: 'slug', type: 'slug'},
      {name: 'publishedAt', type: 'datetime'},
      {name: 'mainImage', type: 'mainImage'},
      {name: 'author', type: 'reference', to: [{type: 'author'}]},
      {name: 'source', type: 'string'},
      {name: 'excerpt', type: 'text'},
      {name: 'content', type: 'array'},
      {name: 'seo', type: 'seo'},
      {name: 'featured', type: 'boolean'},
      {name: 'readingTime', type: 'number'},
      {name: 'relatedPosts', type: 'array', of: [{type: 'reference', to: [{type: 'post'}]}]},
      {name: 'originalSource', type: 'object'},
    ]
  },
  page: {
    name: 'page',
    type: 'document',
    fields: [
      {name: 'title', type: 'string'},
      {name: 'slug', type: 'slug'},
      {name: 'seo', type: 'seo'},
      {name: 'content', type: 'array'},
    ]
  },
  author: {
    name: 'author',
    type: 'document',
    fields: [
      {name: 'name', type: 'string'},
      {name: 'slug', type: 'slug'},
      {name: 'image', type: 'image'},
      {name: 'bio', type: 'text'},
      {name: 'socialLinks', type: 'object'},
    ]
  },
  // Settings
  siteConfig: {
    name: 'siteConfig',
    type: 'document',
    fields: [
      {name: 'title', type: 'string'},
      {name: 'description', type: 'text'},
      {name: 'favicon', type: 'image'},
      {name: 'logo', type: 'image'},
      {name: 'seo', type: 'seo'},
    ]
  },
  header: {
    name: 'header',
    type: 'document',
    fields: [
      {name: 'title', type: 'string'},
      {name: 'navLinks', type: 'array', of: [{type: 'navLink'}]},
    ]
  },
  footer: {
    name: 'footer',
    type: 'document',
    fields: [
      {name: 'copyrightText', type: 'string'},
      {name: 'navLinks', type: 'array', of: [{type: 'navLink'}]},
    ]
  },
}

// Generate TypeScript types
function generateTypes() {
  let output = `// This file is auto-generated. Do not edit manually.
// Generated on ${new Date().toISOString()}

import type {
  SanityReference,
  SanityAsset,
  SanityImage,
  SanityFile,
  SanityGeoPoint,
  SanityBlock,
  SanityDocument,
  SanityImageCrop,
  SanityImageHotspot,
  SanityKeyed,
  SanityImageAsset,
  SanityImageMetadata,
  SanityImageDimensions,
  SanityImagePalette,
  SanityImagePaletteSwatch,
} from "sanity-codegen";

export type {
  SanityReference,
  SanityAsset,
  SanityImage,
  SanityFile,
  SanityGeoPoint,
  SanityBlock,
  SanityDocument,
  SanityImageCrop,
  SanityImageHotspot,
  SanityKeyed,
  SanityImageAsset,
  SanityImageMetadata,
  SanityImageDimensions,
  SanityImagePalette,
  SanityImagePaletteSwatch,
};

// Document types
export interface Post extends SanityDocument {
  _type: "post";
  title?: string;
  slug?: { _type: "slug"; current: string };
  publishedAt?: string;
  mainImage?: MainImage;
  author?: SanityReference<Author>;
  source?: "manual" | "agent" | "rss";
  excerpt?: string;
  content?: Array<SanityBlock | HighlightBox | CryptoWidget | EmbedBlock | SanityImage & {_type: 'image'; caption?: string; alt?: string}>;
  seo?: Seo;
  featured?: boolean;
  readingTime?: number;
  relatedPosts?: Array<SanityReference<Post>>;
  originalSource?: {
    url?: string;
    title?: string;
    publishedAt?: string;
  };
}

export interface Page extends SanityDocument {
  _type: "page";
  title?: string;
  slug?: { _type: "slug"; current: string };
  seo?: Seo;
  content?: Array<SanityBlock>;
}

export interface Author extends SanityDocument {
  _type: "author";
  name?: string;
  slug?: { _type: "slug"; current: string };
  image?: SanityImage;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface SiteConfig extends SanityDocument {
  _type: "siteConfig";
  title?: string;
  description?: string;
  favicon?: SanityImage;
  logo?: SanityImage;
  seo?: Seo;
}

export interface Header extends SanityDocument {
  _type: "header";
  title?: string;
  navLinks?: Array<NavLink>;
}

export interface Footer extends SanityDocument {
  _type: "footer";
  copyrightText?: string;
  navLinks?: Array<NavLink>;
}

// Object types
export interface MainImage extends SanityImage {
  _type: "mainImage";
  alt?: string;
  caption?: string;
}

export interface Seo {
  _type: "seo";
  metaTitle?: string;
  metaDescription?: string;
  openGraphImage?: SanityImage;
}

export interface NavLink {
  _type: "navLink";
  _key: string;
  title?: string;
  url?: string;
  newWindow?: boolean;
}

export interface HighlightBox {
  _type: "highlightBox";
  _key: string;
  type?: "info" | "tip" | "warning" | "error" | "success";
  title?: string;
  content?: Array<SanityBlock>;
}

export interface CryptoWidget {
  _type: "cryptoWidget";
  _key: string;
  widgetType?: "priceChart" | "priceTicker" | "converter" | "marketList" | "heatmap";
  symbol?: string;
  vsCurrency?: "usd" | "eur" | "brl" | "btc";
  height?: number;
  theme?: "light" | "dark" | "auto";
}

export interface EmbedBlock {
  _type: "embedBlock";
  _key: string;
  embedType?: "twitter" | "youtube" | "tradingview" | "codepen" | "gist" | "iframe";
  url?: string;
  caption?: string;
  height?: number;
  aspectRatio?: "16:9" | "4:3" | "1:1" | "9:16";
}

// All document types
export type AllSanitySchemaTypes = Post | Page | Author | SiteConfig | Header | Footer;
`;

  // Write file
  const outputDir = path.join(process.cwd(), 'src/types');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outputDir, 'sanity.generated.ts'), output);
  console.log('✅ Types generated successfully at src/types/sanity.generated.ts');
}

generateTypes();