export default () => ({
  // Configuração do plugin i18n (já built-in no Strapi v5)
  i18n: {
    enabled: true,
    config: {
      // Lista de locales disponíveis
      locales: ['en', 'pt-BR', 'es'],
      // Locale padrão
      defaultLocale: 'pt-BR',
      // Configurações avançadas
      async: false,
      debug: false,
    },
  },
});
