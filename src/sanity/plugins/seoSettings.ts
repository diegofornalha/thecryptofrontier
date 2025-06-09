import {definePlugin} from 'sanity'
import {seoMetaFields} from 'sanity-plugin-seo-pane'

export const seoSettings = definePlugin({
  name: 'seo-settings',
  document: {
    // Extend document actions
    newDocumentOptions: (prev, {creationContext}) => {
      const {type} = creationContext
      if (type === 'post' || type === 'page') {
        return prev
      }
      return prev
    },
    // Add SEO preview pane
    productionUrl: async (prev, {document}) => {
      const url = prev
      if (document._type === 'post') {
        const slug = (document.slug as any)?.current
        if (slug) {
          return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thecryptofrontier.com'}/post/${slug}`
        }
      }
      if (document._type === 'page') {
        const slug = (document.slug as any)?.current
        if (slug) {
          return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thecryptofrontier.com'}/${slug}`
        }
      }
      return url
    },
  },
})

// SEO configuration for content types
export const seoConfig = {
  title: {
    // Fallback title
    fallback: 'The Crypto Frontier',
  },
  description: {
    // Fallback description
    fallback: 'Latest cryptocurrency news, analysis, and insights',
  },
  openGraph: {
    // Default OG image
    fallbackImage: '/og-image-default.jpg',
  },
}