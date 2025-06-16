
'use strict';

module.exports = ({ env }) => ({
  // Configuração do plugin users-permissions
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
      // Permite registro público
      register: {
        allowedFields: ['email', 'username', 'password'],
      },
      // Configurações de email
      email: {
        resetPasswordLimit: 2,
        confirmEmailTemplate: {
          subject: 'Confirm your email',
        },
      },
      // Configurações avançadas
      advanced: {
        defaultRole: 'authenticated',
        // IMPORTANTE: Permite criação pública temporariamente
        allowPublicCreate: true,
      },
    },
  },
});
