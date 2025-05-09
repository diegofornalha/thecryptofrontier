import React from 'react';
import Link from 'next/link';

export default function Custom404() {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
        404 - Página Não Encontrada
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link 
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
      </Link>
    </div>
  );
} 