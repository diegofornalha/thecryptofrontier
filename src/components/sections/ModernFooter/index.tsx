import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Separator } from '@/components/ui/separator';

interface FooterLink {
  label: string;
  url: string;
}

interface FooterLinksGroup {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  label: string;
  icon: string;
  url: string;
}

interface ModernFooterProps {
  title?: string;
  description?: string;
  primaryLinks?: FooterLinksGroup;
  secondaryLinks?: FooterLinksGroup;
  socialLinks?: SocialLink[];
  copyrightText?: string;
  legalLinks?: FooterLink[];
  className?: string;
}

const getSocialIcon = (icon: string) => {
  switch (icon.toLowerCase()) {
    case 'twitter':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
        </svg>
      );
    case 'facebook':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
      );
    case 'instagram':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      );
    case 'linkedin':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
      );
    default:
      return null;
  }
};

export default function ModernFooter({
  title = 'The Crypto Frontier',
  description = 'Explorando o futuro das criptomoedas e da tecnologia blockchain para ajudar a navegar nessa nova fronteira financeira.',
  primaryLinks,
  secondaryLinks,
  socialLinks = [],
  copyrightText = `© ${new Date().getFullYear()} The Crypto Frontier. Todos os direitos reservados.`,
  legalLinks = [],
  className,
}: ModernFooterProps) {
  return (
    <footer className={`bg-slate-900 text-white ${className || ''}`}>
      <Container>
        <div className="grid gap-8 py-10 lg:grid-cols-4 md:grid-cols-2">
          <div className="space-y-4">
            <Link href="/" className="inline-block font-bold">
              {title}
            </Link>
            <p className="text-sm text-gray-300">
              {description}
            </p>
          </div>
          
          {primaryLinks && (
            <div className="space-y-4">
              <h4 className="font-medium text-sm">{primaryLinks.title}</h4>
              <nav className="flex flex-col space-y-2">
                {primaryLinks.links.map((link, index) => (
                  <Link 
                    key={index}
                    href={link.url} 
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
          
          {secondaryLinks && (
            <div className="space-y-4">
              <h4 className="font-medium text-sm">{secondaryLinks.title}</h4>
              <nav className="flex flex-col space-y-2">
                {secondaryLinks.links.map((link, index) => (
                  <Link 
                    key={index}
                    href={link.url}
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
          
          {socialLinks.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Redes Sociais</h4>
              <div className="flex space-x-4">
                {socialLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors"
                    aria-label={link.label}
                  >
                    {getSocialIcon(link.icon)}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <Separator className="bg-slate-700" />
        
        <div className="flex flex-col gap-4 py-6 md:flex-row md:justify-between md:gap-6">
          <p className="text-sm text-gray-300">
            {copyrightText}
          </p>
          {legalLinks.length > 0 && (
            <nav className="flex gap-4 flex-wrap">
              {legalLinks.map((link, index) => (
                <Link 
                  key={index}
                  href={link.url}
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </Container>
    </footer>
  );
} 