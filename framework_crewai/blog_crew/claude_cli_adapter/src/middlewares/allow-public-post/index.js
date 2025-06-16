
'use strict';

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Permitir POST em /api/posts sem autenticação
    if (ctx.request.method === 'POST' && ctx.request.url.includes('/api/posts')) {
      // Temporariamente definir usuário público
      ctx.state.user = {
        id: 'public',
        role: {
          type: 'public'
        }
      };
      
      // Log para debug
      strapi.log.info('Public POST allowed for /api/posts');
    }
    
    await next();
  };
};
