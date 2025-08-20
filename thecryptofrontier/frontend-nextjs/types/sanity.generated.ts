// This file is auto-generated. Do not edit manually.
// Generated on 2025-06-09T21:43:05.787Z

import type {
  strapiReference,
  strapiAsset,
  strapiImage,
  strapiFile,
  strapiGeoPoint,
  strapiBlock,
  strapiDocument,
  strapiImageCrop,
  strapiImageHotspot,
  strapiKeyed,
  strapiImageAsset,
  strapiImageMetadata,
  strapiImageDimensions,
  strapiImagePalette,
  strapiImagePaletteSwatch,
} from "strapi-codegen";

export type {
  strapiReference,
  strapiAsset,
  strapiImage,
  strapiFile,
  strapiGeoPoint,
  strapiBlock,
  strapiDocument,
  strapiImageCrop,
  strapiImageHotspot,
  strapiKeyed,
  strapiImageAsset,
  strapiImageMetadata,
  strapiImageDimensions,
  strapiImagePalette,
  strapiImagePaletteSwatch,
};

// Document types
export interface Post extends strapiDocument {
  _type: "post";
  title?: string;
  slug?: { _type: "slug"; current: string };
  publishedAt?: string;
  mainImage?: MainImage;
  author?: strapiReference<Author>;
  source?: "manual" | "agent" | "rss";
  excerpt?: string;
  content?: Array<strapiBlock | HighlightBox | CryptoWidget | EmbedBlock | strapiImage & {_type: 'image'; caption?: string; alt?: string}>;
  seo?: Seo;
  featured?: boolean;
  readingTime?: number;
  relatedPosts?: Array<strapiReference<Post>>;
  originalSource?: {
    url?: string;
    title?: string;
    publishedAt?: string;
  };
}

export interface Page extends strapiDocument {
  _type: "page";
  title?: string;
  slug?: { _type: "slug"; current: string };
  seo?: Seo;
  content?: Array<strapiBlock>;
}

export interface Author extends strapiDocument {
  _type: "author";
  name?: string;
  slug?: { _type: "slug"; current: string };
  image?: strapiImage;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface SiteConfig extends strapiDocument {
  _type: "siteConfig";
  title?: string;
  description?: string;
  favicon?: strapiImage;
  logo?: strapiImage;
  seo?: Seo;
}

export interface Header extends strapiDocument {
  _type: "header";
  title?: string;
  navLinks?: Array<NavLink>;
}

export interface Footer extends strapiDocument {
  _type: "footer";
  copyrightText?: string;
  navLinks?: Array<NavLink>;
}

// Object types
export interface MainImage extends strapiImage {
  _type: "mainImage";
  alt?: string;
  caption?: string;
}

export interface Seo {
  _type: "seo";
  metaTitle?: string;
  metaDescription?: string;
  openGraphImage?: strapiImage;
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
  content?: Array<strapiBlock>;
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
export type AllstrapiSchemaTypes = Post | Page | Author | SiteConfig | Header | Footer;
