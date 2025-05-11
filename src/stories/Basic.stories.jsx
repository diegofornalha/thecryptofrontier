import React from 'react';

// Componente simples
const Button = ({ label, onClick }) => {
  return (
    <button 
      style={{ 
        padding: '10px 20px',
        backgroundColor: 'blue',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default {
  title: 'Exemplo/Botão Básico',
  component: Button,
};

// Template básico
const Template = (args) => <Button {...args} />;

// Variações
export const Primary = Template.bind({});
Primary.args = {
  label: 'Botão Primário',
  onClick: () => alert('Clicou no botão!'),
}; 