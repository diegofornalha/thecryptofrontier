import React from 'react';

function Error({ statusCode }) {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>
        {statusCode 
          ? `Erro ${statusCode} - Algo deu errado no servidor` 
          : 'Erro - Algo deu errado no cliente'}
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
        Desculpe, ocorreu um erro inesperado.
      </p>
      <a 
        href="/" 
        style={{
          display: 'inline-block',
          padding: '10px 20px',
          background: '#0070f3',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          fontSize: '1rem'
        }}
      >
        Voltar para a Página Inicial
      </a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error; 