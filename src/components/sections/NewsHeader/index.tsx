"use client";

import Link from "next/link";
import { useState } from "react";

export default function NewsHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed w-full bg-white border-b border-gray-100" style={{ zIndex: 9999 }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-[70px]">
            {/* Layout que replica a estrutura das colunas da home */}
            <div className="flex items-center justify-between w-full">
              {/* Área esquerda - Lupa */}
              <div className="w-1/4 flex justify-start">
                <Link 
                  href="/buscas"
                  className="text-gray-700 hover:text-blue-500 p-2 transition-colors"
                  aria-label="Buscar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg"
                       viewBox="0 0 1200 1200"
                       width="24"
                       height="24"
                       className="w-6 h-6"
                       aria-hidden="true"
                       role="img">
                    <path d="M958.484 910.161l-134.564-134.502c63.099-76.595 94.781-170.455 94.72-264.141
                             0.061-106.414-40.755-213.228-121.917-294.431-81.244-81.183-187.976-121.958-294.359-121.938
                             -106.435-0.020-213.187 40.796-294.369 121.938-81.234 81.203-122.010 188.017-121.989 294.369
                             -0.020 106.445 40.755 213.166 121.989 294.287 81.193 81.285 187.945 122.020 294.369 121.979
                             93.716 0.041 187.597-31.642 264.11-94.659l134.554 134.564 57.457-57.467z
                             M265.431 748.348c-65.546-65.495-98.13-150.999-98.171-236.882 0.041-85.832 32.625-171.346
                             98.171-236.913 65.567-65.536 151.081-98.099 236.933-98.14 85.821 0.041 171.336 32.604
                             236.902 98.14 65.495 65.516 98.12 151.122 98.12 236.913 0 85.924-32.625 171.387-98.12
                             236.882-65.556 65.495-151.009 98.099-236.902 98.099-85.852 0-171.366-32.604-236.933-98.099z
                             M505.385 272.864c-61.901 0.020-123.566 23.501-170.824 70.799-47.288 47.258-70.769 108.923
                             -70.799 170.834-0.041 26.624 4.383 53.105 13.046 78.428-0.031-0.522-0.092-1.024-0.031-1.556
                             13.199-91.341 48.241-159.775 96.963-208.497v-0.020h0.031c48.712-48.722 117.135-83.763
                             208.486-96.963 0.522-0.061 1.024 0 1.536 0.041-25.313-8.684-51.794-13.087-78.408-13.066z"
                          fill="currentColor"/>
                  </svg>
                </Link>
              </div>

              {/* Logo (centro) */}
              <div className="w-1/2 flex justify-center">
                <Link href="/" className="block">
                  <div className="text-lg sm:text-xl lg:text-2xl font-serif font-extrabold whitespace-nowrap text-black hover:text-blue-500 transition-colors" style={{ fontFamily: 'Roboto Slab', fontWeight: 800 }}>The Crypto Frontier</div>
                </Link>
              </div>

              {/* Área direita - Menu Grid */}
              <div className="w-1/4 flex justify-end">
                <button 
                  className="text-gray-700 hover:text-blue-500 p-2 transition-colors"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg"
                       viewBox="0 0 900 900"
                       width="24"
                       height="24"
                       className="w-6 h-6"
                       aria-hidden="true"
                       role="img">
                    <path d="M136.509 145.673h171.039v170.998h-171.039v-170.998z
                             M426.455 145.673h171.069v170.998h-171.069v-170.998z
                             M716.452 145.673h171.039v170.998h-171.039v-170.998z
                             M136.509 435.598h171.039v171.059h-171.039v-171.059z
                             M136.509 725.574h171.039v171.039h-171.039v-171.039z
                             M426.455 435.598h171.069v171.059h-171.069v-171.059z
                             M426.455 725.574h171.069v171.039h-171.069v-171.039z
                             M716.452 435.598h171.039v171.059h-171.039v-171.059z
                             M716.452 725.574h171.039v171.039h-171.039v-171.039z"
                         fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Grid - Desktop e Mobile */}
      {mobileMenuOpen && (
        <div className="fixed top-[70px] left-0 right-0" style={{ zIndex: 9998 }}>
          <nav className="bg-white border-b border-gray-100 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-6">
              {/* Grid Layout para Desktop */}
              <div className="hidden lg:grid lg:grid-cols-4 lg:gap-6">
                <Link 
                  href="/" 
                  className="group p-4 rounded-lg hover:bg-gray-50 transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="text-lg font-semibold text-gray-900 group-hover:text-[#4db2ec]">Início</div>
                  <div className="text-sm text-gray-600 mt-1">Página principal</div>
                </Link>
                <Link 
                  href="/blog" 
                  className="group p-4 rounded-lg hover:bg-gray-50 transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="text-lg font-semibold text-gray-900 group-hover:text-[#4db2ec]">Blog</div>
                  <div className="text-sm text-gray-600 mt-1">Últimas notícias</div>
                </Link>
                <Link 
                  href="/buscas" 
                  className="group p-4 rounded-lg hover:bg-gray-50 transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="text-lg font-semibold text-gray-900 group-hover:text-[#4db2ec]">Buscar</div>
                  <div className="text-sm text-gray-600 mt-1">Pesquisar artigos</div>
                </Link>
                <Link 
                  href="/studio" 
                  className="group p-4 rounded-lg hover:bg-gray-50 transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="text-lg font-semibold text-gray-900 group-hover:text-[#4db2ec]">Studio</div>
                  <div className="text-sm text-gray-600 mt-1">Gerenciar conteúdo</div>
                </Link>
              </div>
              
              {/* Layout Mobile */}
              <div className="flex flex-col gap-3 lg:hidden">
                <Link href="/" className="py-2 hover:text-blue-500 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Início
                </Link>
                <Link href="/blog" className="py-2 hover:text-blue-500 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Blog
                </Link>
                <Link href="/buscas" className="py-2 hover:text-blue-500 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Buscar
                </Link>
                <Link href="/studio" className="py-2 hover:text-blue-500 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Studio
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}