'use client';

import React, { useState } from 'react';
import { Copy, Check, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

// 1. Tabela de Preços de Criptomoedas
export function CryptoPriceTable({ cryptos }: { cryptos: any[] }) {
  return (
    <div className="crypto-price-table my-8 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left p-4">Criptomoeda</th>
            <th className="text-right p-4">Preço</th>
            <th className="text-right p-4">24h %</th>
            <th className="text-right p-4">Market Cap</th>
          </tr>
        </thead>
        <tbody>
          {cryptos.map((crypto, index) => (
            <tr key={index} className="border-b hover:bg-gray-50">
              <td className="p-4 font-medium">{crypto.name}</td>
              <td className="p-4 text-right">${crypto.price}</td>
              <td className="p-4 text-right">
                <span className={crypto.change24h > 0 ? 'text-green-600' : 'text-red-600'}>
                  {crypto.change24h > 0 ? <TrendingUp className="inline w-4 h-4" /> : <TrendingDown className="inline w-4 h-4" />}
                  {crypto.change24h}%
                </span>
              </td>
              <td className="p-4 text-right">${crypto.marketCap}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 2. Caixa de Destaque/Alerta
export function HighlightBox({ 
  type = 'info', 
  title, 
  children 
}: { 
  type?: 'info' | 'warning' | 'success' | 'tip';
  title?: string;
  children: React.ReactNode;
}) {
  const styles = {
    info: 'bg-blue-50 border-blue-500 text-blue-900',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-900',
    success: 'bg-green-50 border-green-500 text-green-900',
    tip: 'bg-purple-50 border-purple-500 text-purple-900'
  };

  const icons = {
    info: '💡',
    warning: '⚠️',
    success: '✅',
    tip: '💎'
  };

  return (
    <div className={`highlight-box ${styles[type]} border-l-4 rounded-r-lg p-6 my-8 relative`}>
      <span className="absolute left-4 top-6 text-2xl">{icons[type]}</span>
      <div className="ml-10">
        {title && <h4 className="font-bold mb-2">{title}</h4>}
        <div>{children}</div>
      </div>
    </div>
  );
}

// 3. Código com Botão de Copiar
export function CodeBlock({ code, language = 'javascript' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block relative my-6">
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <span className="text-xs text-gray-400">{language}</span>
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          aria-label="Copiar código"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// 4. Sumário de Navegação (Table of Contents)
export function TableOfContents({ headings }: { headings: { id: string; text: string; level: number }[] }) {
  const [activeId, setActiveId] = useState('');

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav className="table-of-contents bg-gray-50 rounded-lg p-6 my-8">
      <h3 className="font-bold text-lg mb-4">Neste Artigo</h3>
      <ul className="space-y-2">
        {headings.map(({ id, text, level }) => (
          <li key={id} style={{ marginLeft: `${(level - 2) * 16}px` }}>
            <a
              href={`#${id}`}
              className={`block py-1 text-sm hover:text-blue-600 transition-colors ${
                activeId === id ? 'text-blue-600 font-medium' : 'text-gray-600'
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// 5. FAQ Accordion
export function FAQSection({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="faq-section my-8">
      <h3 className="text-2xl font-bold mb-6">Perguntas Frequentes</h3>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg">
            <button
              className="w-full p-4 text-left font-medium hover:bg-gray-50 flex justify-between items-center"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              {faq.question}
              <span className="text-xl">{openIndex === index ? '−' : '+'}</span>
            </button>
            {openIndex === index && (
              <div className="p-4 pt-0 text-gray-600">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 6. Comparação Visual
export function ComparisonTable({ items, features }: { 
  items: string[]; 
  features: { name: string; values: (string | boolean)[] }[] 
}) {
  return (
    <div className="comparison-table my-8 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left p-4 bg-gray-100">Característica</th>
            {items.map((item, index) => (
              <th key={index} className="text-center p-4 bg-gray-100">{item}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={index} className="border-b">
              <td className="p-4 font-medium">{feature.name}</td>
              {feature.values.map((value, idx) => (
                <td key={idx} className="p-4 text-center">
                  {typeof value === 'boolean' ? (
                    value ? '✅' : '❌'
                  ) : (
                    value
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 7. Progress Indicator para Leitura
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  React.useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(scrollPercent);
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-[70px] left-0 w-full h-1 bg-gray-200 z-50">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}