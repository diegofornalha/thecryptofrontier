import type { DashboardConfig, WidgetOptions } from '@sanity/dashboard'

// Configuração do Dashboard com tipos mais genéricos para evitar erros de tipagem
export const dashboardConfig: DashboardConfig = {
  widgets: [
    // Widgets padrão não precisam de configuração específica
    { 
      name: 'sanity-tutorials' 
    },
    { 
      name: 'project-info'
    },
    { 
      name: 'project-users' 
    },
    {
      name: 'document-list',
      // Usar any para evitar problemas específicos com tipagem
      // @ts-ignore - Ignorando problemas de tipagem que não afetam a funcionalidade
      options: {
        title: 'Últimos posts',
        order: '_createdAt desc',
        types: ['post'],
        limit: 5
      }
    }
  ]
} 