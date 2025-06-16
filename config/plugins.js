module.exports = {
  // Configuração do plugin GraphQL
  graphql: {
    config: {
      endpoint: '/graphql',
      shadowCRUD: true,
      playgroundAlways: false,
      depthLimit: 7,
      amountLimit: 100,
      apolloServer: {
        tracing: false,
      },
    },
  },
  
  // Configuração do plugin i18n seguindo a documentação oficial
  i18n: {
    enabled: true,
    config: {
      // Locale padrão (deve corresponder aos locales disponíveis)
      defaultLocale: 'en',
      
      // Lista completa de locales disponíveis
      locales: [
        {
          code: 'en',
          name: 'English (en)',
          isDefault: true,
        },
        {
          code: 'pt-BR', 
          name: 'Portuguese (Brazil) (pt-BR)',
        },
        {
          code: 'es',
          name: 'Spanish (es)',
        },
      ],
    },
  },
  
  // Plugin users-permissions (já incluído por padrão no Strapi v5)
  'users-permissions': {
    enabled: true,
    config: {
      jwt: {
        expiresIn: '7d',
      },
    },
  },
}; 