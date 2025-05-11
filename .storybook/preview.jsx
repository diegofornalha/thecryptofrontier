import React from 'react';

// Tenta importar o CSS, mas não falha se o arquivo não existir
try {
  require('../src/css/main.css');
} catch (e) {
  console.warn('CSS não encontrado, continuando sem ele...');
}

// Configuração global do Storybook
export default {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ margin: '2em' }}>
        <Story />
      </div>
    ),
  ],
}; 