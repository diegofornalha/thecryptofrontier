export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'https://market-assets.strapi.io',
          ],
          'media-src': ["'self'", 'data:', 'blob:'],
          'frame-src': [
            'https://thecryptofrontier.agentesintegrados.com',
            'https://ale-blog-preview.agentesintegrados.com'
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: '*',
      origin: [
        'https://thecryptofrontier.agentesintegrados.com',
        'https://ale-blog-preview.agentesintegrados.com',
        'http://localhost:3000',
        'http://localhost:3300',
        'http://localhost:1340'
      ],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
