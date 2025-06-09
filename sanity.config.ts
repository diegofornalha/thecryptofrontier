'use client'

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {codeInput} from '@sanity/code-input'
import {dashboardTool} from '@sanity/dashboard'
import {unsplashImageAsset} from 'sanity-plugin-asset-source-unsplash'
import {seoMetaFields} from 'sanity-plugin-seo-pane'
import {scheduledPublishing} from '@sanity/scheduled-publishing'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    structureTool({structure}),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
    // Plugin para blocos de código
    codeInput(),
    // Dashboard com widgets customizados
    dashboardTool({
      widgets: [
        {
          name: 'document-list',
          options: {
            title: 'Posts Recentes',
            query: '*[_type == "post"] | order(publishedAt desc) [0...10]',
            types: ['post'],
            createButtonText: 'Novo Post',
            showCreateButton: true,
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
        {
          name: 'project-info',
          options: {
            data: [
              {
                title: 'Dataset',
                value: dataset,
                category: 'config',
              },
              {
                title: 'Project ID',
                value: projectId,
                category: 'config',
              },
            ],
          },
        },
        {
          name: 'project-users',
          layout: {width: 'medium'},
        },
      ],
    }),
    // Plugin para buscar imagens do Unsplash
    unsplashImageAsset({
      accessKey: process.env.SANITY_STUDIO_UNSPLASH_ACCESS_KEY || 'your-unsplash-access-key',
    }),
    // Plugin para publicação agendada
    scheduledPublishing({
      enabled: true,
      inputDateTimeFormat: 'dd/MM/yyyy HH:mm',
    }),
  ],
  // Define o título do Studio para o Dashboard
  title: 'The Crypto Frontier',
})
