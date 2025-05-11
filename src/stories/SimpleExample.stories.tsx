import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

// Componente simples sem dependências externas
const SimpleExample = () => {
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2>Exemplo Simples</h2>
      <p>Este é um componente simples para testar se o Storybook está funcionando.</p>
      <button onClick={() => alert('Clicou no botão!')}>Clique Aqui</button>
    </div>
  );
};

const meta = {
  title: 'Exemplos/SimpleExample',
  component: SimpleExample,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {}; 