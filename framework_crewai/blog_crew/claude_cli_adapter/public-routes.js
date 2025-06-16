'use strict';

/**
 * Rotas públicas para o Post
 * Define auth: false para permitir acesso sem autenticação
 */

module.exports = {
  routes: [
    // Listar posts publicamente
    {
      method: 'GET',
      path: '/posts',
      handler: 'post.find',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // Ver um post publicamente
    {
      method: 'GET',
      path: '/posts/:id',
      handler: 'post.findOne',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // Criar post publicamente (use com cuidado!)
    {
      method: 'POST',
      path: '/posts',
      handler: 'post.create',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // Rota customizada para posts por slug
    {
      method: 'GET',
      path: '/posts/slug/:slug',
      handler: 'post.findOne',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};