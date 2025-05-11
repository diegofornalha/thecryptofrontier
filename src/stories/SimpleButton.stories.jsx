import React from 'react';

const SimpleButton = ({ label, primary = false, size = 'medium', onClick }) => {
  const baseStyle = {
    fontFamily: '"Nunito Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontWeight: 700,
    border: 0,
    borderRadius: '3em',
    cursor: 'pointer',
    display: 'inline-block',
    lineHeight: 1,
  };

  const sizeStyles = {
    small: { fontSize: '12px', padding: '10px 16px' },
    medium: { fontSize: '14px', padding: '11px 20px' },
    large: { fontSize: '16px', padding: '12px 24px' },
  };

  const typeStyles = {
    primary: { backgroundColor: '#1ea7fd', color: 'white' },
    secondary: { backgroundColor: 'transparent', boxShadow: 'rgba(0, 0, 0, 0.15) 0px 0px 0px 1px inset', color: '#333' },
  };

  const style = {
    ...baseStyle,
    ...sizeStyles[size],
    ...typeStyles[primary ? 'primary' : 'secondary'],
  };

  return (
    <button type="button" style={style} onClick={onClick}>
      {label}
    </button>
  );
};

// Configuração da história
export default {
  title: 'Example/SimpleButton',
  component: SimpleButton,
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

// Template
const Template = (args) => <SimpleButton {...args} />;

// Stories
export const Primary = Template.bind({});
Primary.args = {
  primary: true,
  label: 'Botão Primário',
};

export const Secondary = Template.bind({});
Secondary.args = {
  label: 'Botão Secundário',
};

export const Large = Template.bind({});
Large.args = {
  size: 'large',
  label: 'Botão Grande',
};

export const Small = Template.bind({});
Small.args = {
  size: 'small',
  label: 'Botão Pequeno',
}; 