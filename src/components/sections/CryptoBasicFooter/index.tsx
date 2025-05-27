'use client';

import Link from 'next/link';

interface FooterLink {
  label: string;
  url: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: 'Categorias',
    links: [
      { label: 'Bitcoin', url: '/categoria/bitcoin' },
      { label: 'Ethereum', url: '/categoria/ethereum' },
      { label: 'Altcoins', url: '/categoria/altcoins' },
      { label: 'DeFi', url: '/categoria/defi' },
      { label: 'NFTs', url: '/categoria/nfts' },
      { label: 'Blockchain', url: '/categoria/blockchain' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Guias', url: '/guias' },
      { label: 'Análises', url: '/analises' },
      { label: 'Tutoriais', url: '/tutoriais' },
      { label: 'Glossário', url: '/glossario' },
      { label: 'Ferramentas', url: '/ferramentas' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre Nós', url: '/sobre' },
      { label: 'Contato', url: '/contato' },
      { label: 'Equipe', url: '/equipe' },
      { label: 'Anuncie', url: '/anuncie' },
      { label: 'Parcerias', url: '/parcerias' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Termos de Uso', url: '/termos' },
      { label: 'Política de Privacidade', url: '/privacidade' },
      { label: 'Cookies', url: '/cookies' },
      { label: 'Disclaimer', url: '/disclaimer' },
    ],
  },
];

const socialLinks = [
  {
    name: 'Twitter',
    url: 'https://twitter.com/thecryptofrontier',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    ),
  },
  {
    name: 'Facebook',
    url: 'https://facebook.com/thecryptofrontier',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: 'Telegram',
    url: 'https://t.me/thecryptofrontier',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/@thecryptofrontier',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
];

export default function CryptoBasicFooter() {
  return (
    <footer className="bg-[#111] text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <h3 className="text-2xl font-bold text-[#4db2ec]">
                The Crypto Frontier
              </h3>
            </Link>
            <p className="text-gray-400 text-sm mb-6">
              Seu portal definitivo para notícias, análises e educação sobre criptomoedas e blockchain.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#222] hover:bg-[#4db2ec] text-gray-400 hover:text-white p-2 rounded transition-colors duration-200"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-bold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.url}
                      className="text-gray-400 hover:text-[#4db2ec] text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center lg:text-left lg:mx-0">
            <h4 className="text-white font-bold mb-2">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-4">
              Receba as últimas notícias do mundo cripto diretamente no seu e-mail.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="flex-1 px-4 py-2 bg-[#222] border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#4db2ec] transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-[#4db2ec] hover:bg-[#3a8fc7] text-white font-semibold rounded transition-colors duration-200"
              >
                Inscrever
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#000] py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© 2024 The Crypto Frontier. Todos os direitos reservados.</p>
            <p className="mt-2 md:mt-0">
              Desenvolvido com ❤️ para a comunidade cripto
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}