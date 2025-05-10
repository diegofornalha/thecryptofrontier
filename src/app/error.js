'use client';

import React from 'react';

export default function Error({ error, reset }) {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>
        Algo deu errado
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
        Desculpe, ocorreu um erro inesperado.
      </p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={() => reset()}
          style={{
            padding: '10px 20px',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Tentar Novamente
        </button>
        <a 
          href="/" 
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: '#333',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            fontSize: '1rem'
          }}
        >
          Voltar para a Página Inicial
        </a>
      </div>
    </div>
  );
} 