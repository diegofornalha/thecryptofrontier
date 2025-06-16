
'use strict';

module.exports = async (ctx, config, { strapi }) => {
  // Permitir criação pública temporariamente
  if (ctx.request.method === 'POST') {
    // Verificar rate limiting básico
    const ip = ctx.request.ip;
    const key = `post_create_${ip}`;
    const attempts = await strapi.cache.get(key) || 0;
    
    if (attempts > 10) {
      ctx.throw(429, 'Too many requests');
    }
    
    await strapi.cache.set(key, attempts + 1, 3600); // 1 hora
    
    return true; // Permitir
  }
  
  // Para outros métodos, usar permissões padrão
  return true;
};
