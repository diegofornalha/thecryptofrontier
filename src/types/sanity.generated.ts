// This file is auto-generated. Do not edit manually.
// Generated on 2025-06-09T21:43:05.787Z

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
