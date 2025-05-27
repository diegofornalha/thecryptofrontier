'use client';

import React from 'react';

export default function SimpleNewsletterWidget() {
  return (
    <div className="bg-[#4db2ec] rounded-lg p-6 text-white">
      <h3 className="text-xl font-bold mb-2 text-white">Newsletter</h3>
      <p className="text-sm mb-4 opacity-90">
        Receba as últimas notícias do mundo cripto diretamente no seu e-mail.
      </p>
      
      <div>
        <input
          type="email"
          placeholder="Seu e-mail"
          className="w-full px-4 py-2 rounded text-gray-800 mb-3 focus:outline-none cursor-not-allowed"
          disabled
        />
        <button
          type="button"
          className="w-full bg-white text-[#4db2ec] font-bold py-2 rounded opacity-50 cursor-not-allowed"
          disabled
        >
          Inscrever
        </button>
      </div>
    </div>
  );
}