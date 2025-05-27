import React from 'react';
import * as ReactDOM from 'react-dom';
import '../src/css/main.css';

// Evitar múltiplas instâncias do React
// Esta é uma técnica para garantir que tenhamos apenas uma instância do React
window.React = React;
window.ReactDOM = ReactDOM;

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },

  // Adiciona um decorador global para envolver todas as histórias com um contexto do React
  decorators: [
    (Story) => (
      <React.StrictMode>
        <div className="storybook-wrapper">
          <Story />
        </div>
      </React.StrictMode>
    ),
  ],

  tags: ['autodocs']
};

export default preview; 