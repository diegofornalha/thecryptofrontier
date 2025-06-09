'use client'

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {codeInput} from '@sanity/code-input'
import {dashboardTool} from '@sanity/dashboard'
import {unsplashImageAsset} from 'sanity-plugin-asset-source-unsplash'
import {SEOPane} from 'sanity-plugin-seo-pane'
import {scheduledPublishing} from '@sanity/scheduled-publishing'
import {productionUrl} from './src/sanity/plugins/productionUrl'

import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({
      structure,
      defaultDocumentNode: (S, {schemaType}) => {
        if (['post', 'page'].includes(schemaType)) {
          return S.document().views([
            S.view.form(),
            S.view.component(SEOPane).title('SEO').options({
              keywords: 'seo.keywords',
              synonyms: 'seo.synonyms',
              title: 'seo.metaTitle',
              description: 'seo.metaDescription',
            }),
          ])
        }
        return S.document().views([S.view.form()])
      },
    }),
    visionTool({defaultApiVersion: apiVersion}),
    codeInput(),
    dashboardTool({
      widgets: [
        {
          name: 'document-list',
          options: {
            title: 'Posts Recentes',
            query: '*[_type == "post"] | order(publishedAt desc) [0...10]',
            types: ['post'],
          },
        },
        {
          name: 'document-list',
          options: {
            title: 'Autores',
            query: '*[_type == "author"] | order(name asc)',
            types: ['author'],
          },
        },
        {name: 'project-info'},
        {name: 'project-users', layout: {width: 'medium'}},
      ],
    }),
    unsplashImageAsset(),
    scheduledPublishing(),
    productionUrl(),
  ],
  title: 'The Crypto Frontier',
}) 