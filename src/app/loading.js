'use client';

import React from 'react';

export default function Loading() {
  return (
    <div style={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div 
          style={{ 
            border: '8px solid #f3f3f3',
            borderTop: '8px solid #0070f3',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px auto'
          }}
        />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ fontSize: '1.2rem' }}>Carregando...</p>
      </div>
    </div>
  );
}
