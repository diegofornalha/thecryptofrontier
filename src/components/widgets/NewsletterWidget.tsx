'use client';

import React, { useState } from 'react';

interface NewsletterWidgetProps {
  title?: string;
  description?: string;
  buttonText?: string;
}

export default function NewsletterWidget({
  title = "Newsletter",
  description = "Receba as últimas notícias cripto no seu e-mail",
  buttonText = "Inscrever"
}: NewsletterWidgetProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Por favor, insira seu e-mail');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // TODO: Implementar integração com serviço de newsletter
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulação
      
      setMessage('Inscrição realizada com sucesso!');
      setEmail('');
    } catch (error) {
      setMessage('Erro ao realizar inscrição. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#4db2ec] rounded-lg p-6 text-white">
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-sm mb-4 opacity-90">{description}</p>
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded text-gray-800 mb-3 focus:outline-none focus:ring-2 focus:ring-white"
          disabled={loading}
        />
        <button
          type="submit"
          className="w-full bg-white text-[#4db2ec] font-bold py-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Enviando...' : buttonText}
        </button>
      </form>
      
      {message && (
        <p className={`mt-3 text-sm ${message.includes('sucesso') ? 'text-green-100' : 'text-red-100'}`}>
          {message}
        </p>
      )}
    </div>
  );
}