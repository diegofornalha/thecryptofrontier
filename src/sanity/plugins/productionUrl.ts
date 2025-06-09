// productionUrl.ts
import {definePlugin} from 'sanity'

// A função que será chamada pelo Sanity para resolver a URL de produção
export const productionUrl = definePlugin({
  name: 'productionUrl',
  document: {
    productionUrl: async (prev, context) => {
      const {document} = context
      const DRAFT_MODE_SECRET = 'YOUR_DRAFT_MODE_SECRET' // Substitua por sua chave secreta
      const baseUrl = window.location.origin

      if (document._type === 'post') {
        const slug = (document.slug as any)?.current
        if (slug) {
          return `${baseUrl}/api/draft?secret=${DRAFT_MODE_SECRET}&slug=${slug}&type=post`
        }
      }

      if (document._type === 'page') {
        const slug = (document.slug as any)?.current
        if (slug) {
          return `${baseUrl}/api/draft?secret=${DRAFT_MODE_SECRET}&slug=${slug}&type=page`
        }
      }

      return prev
    },
  },
}) 